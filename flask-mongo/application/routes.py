#Importing necessary libraries
from application import app,db,api,jwt,mail,serializer
from flask import render_template, jsonify, json, redirect, flash, url_for, request,Response
from application.models import users,courses
from flask_restx import Resource,fields
from flask_mail import Mail, Message
from email.mime.base import MIMEBase
from email import encoders
import tempfile
import os
import mimetypes
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask_jwt_extended import create_access_token,jwt_required,get_jwt
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
from application.ml.predictor import predict, FEATURE_COLUMNS,predict_single,predict_batch
import io
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np
from application.ml.analyse import  find_week_column,find_actual_column,find_prediction_column,validate_and_clean_data,calculate_metrics,calculate_individual_metrics




#Creating a namespace for our API
ns = api.namespace('users', description='The users namespace contains endpoints for managing user data. This includes creating, retrieving, updating, and deleting user accounts, as well as managing user authentication and authorization.')

# Define the expected payload using the 'fields' module
user_model = ns.model('User', {
    'name': fields.String(required=True, description='enter your name'),
    'email': fields.String(required=True, description='enter your email id'),
    'password': fields.String(required=True, description='enter your password'),
    'firstname': fields.String(required=False, description='enter your firstname'),
    'lastname': fields.String(required=False, description='enter your lastname'),
    'phone': fields.String(required=False, description='enter your phone number'),
    'bio': fields.String(required=False, description='enter your bio'),
    'role': fields.String(required=False, description='enter role (user/admin)', default='user')



})

login_model = ns.model('Login', {
    'email': fields.String(required=True, description='enter your email id'),
    'password': fields.String(required=True, description='enter your password')
})

password_model = ns.model('Password', {
    'password': fields.String(required=True, description='enter your password')
})

forgot_password_model = ns.model('ForgotPassword', {
    'email': fields.String(required=True, description='enter your email id'),
    'new_password': fields.String(required=True, description='enter your new password')
})

update_password_model = ns.model('UpdatePassword', {
    'old_password': fields.String(required=True, description='enter your old password'),
    'new_password': fields.String(required=True, description='enter your new password')
})

reverify_model = ns.model('Reverify', {
    'email': fields.String(required=True, description='enter your email id')
})

# Define the authorization header model
auth_header = api.parser()
auth_header.add_argument('Authorization', type=str, location='headers', required=True, help='Bearer Access Token')


@ns.route('')
class GetAndPostUser(Resource):
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def get(self):
        # Get all users and exclude password field
        return jsonify(users.objects.exclude('password','verified'))
    
    @ns.expect(user_model)  # Use the 'expect' decorator to specify the expected payload
    def post(self):
        # Get request data from payload
        data = api.payload
        
        # Check if user already exists
        if not users.objects(email=data['email']).first():
            # Create a new user with auto-generated ID (MongoDB ObjectId)
            verified = False
            user = users(
                name=data['name'],
                email=data['email'],
                firstname=data.get('firstname'),  # new
                lastname=data.get('lastname'),    # new
                phone=data.get('phone'),          # new
                bio=data.get('bio'),
                verified=verified
            )
            user.set_password(data['password'])
            user.save()  # MongoDB will auto-generate the _id field
            
            emailid = data['email']
            token = serializer.dumps(emailid, salt='email-verification') 
            # create verification URL with token
            verification_url = f'http://localhost:8000/verify_email/{token}'
            # Render the email template with the verify URL
            html_body = render_template(
                'verify_email.html', 
                verify_url=verification_url, 
                subject='Verify your account', 
                button='VERIFY ACCOUNT',
                content='We are happy you signed up for Green Solution. To start exploring p, please confirm your email address.',
                caption='Didn\'t create account'
            )
            # create message and send email
            message = Message('Verify Your Email', recipients=[emailid])
            message.html = html_body
            mail.send(message)
            return {'message': 'Please click on the Verification Link Sent to mail'}, 200
        else:
            return {'message': 'User Account already registered'}, 409

    
@ns.route('/<idx>')
class GetUpdateDeleteUser(Resource):
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def get(self, idx):
        try:
            # Get user object by ObjectId and exclude password field
            user = users.objects.exclude('password').get(id=ObjectId(idx))
            # Serialize user object to JSON
            user_json = json.loads(user.to_json())
            return jsonify(user_json)
        except Exception as e:
            return {'message': 'User not found'}, 404
    
    @ns.expect(user_model, auth_header) 
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def put(self, idx):
        try:
            # Get request data from payload
            data = api.payload
            user = users.objects(id=ObjectId(idx)).first()
            
            if not user:
                return {'message': 'User not found'}, 404
            
            # Verify user with password and then update user details
            if not user.get_password(data['password']):
                return {"error": "Incorrect password, Can't Update!"}, 401
            elif user.verified == False:
                return {"error": "Not verified, Can't Update!"}, 403
            else:
                # Exclude password field from update
                data.pop('password', None)
                # Update user object with new values
                users.objects(id=ObjectId(idx)).update(**data)
                # Get updated user object and exclude password field
                userwithoutpassword = users.objects.exclude('password','verified').get(id=ObjectId(idx))
                # Serialize user object to JSON
                user_json = json.loads(userwithoutpassword.to_json())
                return jsonify(user_json)
        except Exception as e:
            return {'message': 'User not found'}, 404
    
    @ns.expect(password_model, auth_header)  # Use the 'expect' decorator to specify the expected payload
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def delete(self, idx):
        try:
            # Get request data from payload
            data = api.payload
            user = users.objects(id=ObjectId(idx)).first()
            
            if not user:
                return {'message': 'User not found'}, 404
            
            # Verify user with password and then delete user account
            if not user.get_password(data['password']):
                return {"error": "Incorrect password"}, 401
            elif user.verified == False:
                return {"error": "Not verified, Can't Delete!"}, 403
            else:
                user.delete()
                return {"message": "User is deleted!"}, 200
        except Exception as e:
            return {'message': 'User not found'}, 404
    
@ns.route('/<idx>/updatepassword')
class UpdateUserpassword(Resource):
    @ns.expect(update_password_model, auth_header)  # Use the 'expect' decorator to specify the expected payload
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def put(self, idx):
        try:
            # Get request data from payload
            data = api.payload
            user = users.objects(id=ObjectId(idx)).first()
            
            # Verify user with old password and then update new password
            if not user:
                return {'message': 'User not found'}, 404
            
            if not user.get_password(data['old_password']):
                return {'message': 'Incorrect password'}, 401
            
            if user.verified == False:
                return {"error": "Not verified, Can't Update!"}, 403
            
            user.set_password(data['new_password'])
            user.save()
            
            return {'message': 'User password updated successfully'}, 200
        except Exception as e:
            return {'message': 'User not found'}, 404
    
@ns.route('/reverify')
class Reverify(Resource):
    @ns.expect(reverify_model)  # Use the 'expect' decorator to specify the expected payload
    def post(self):
        # Get request data from payload
        data = api.payload
        user = users.objects(email=data['email']).first()
        if not user:
            return {'message': 'Invalid User'}, 404
        else:
            emailid = data['email']
            token = serializer.dumps(emailid, salt='email-verification') 
            # create verification URL with token
            verification_url = f'http://localhost:8000/verify_email/{token}'
            # Render the email template with the reverify URL
            html_body = render_template(
                'verify_email.html', 
                verify_url=verification_url, 
                subject='Verify your account',
                button='VERIFY ACCOUNT',
                content='We are happy you signed up for Green Solution. To start exploring , please confirm your email address.',
                caption='Didn\'t create account'
            )
            # create message and send email
            message = Message('Verify Your Email', recipients=[emailid])
            message.html = html_body
            mail.send(message)
            return {'message': 'Please click on the Verification Link Sent to mail'}, 200
        
@ns.route('/forgot_password')
class ForgotPassword(Resource):
    @ns.expect(forgot_password_model)  # Use the 'expect' decorator to specify the expected payload
    def post(self):
        # Get request data from payload
        data = api.payload
        user = users.objects(email=data['email']).first()
        if not user:
            return {'message': 'Invalid User'}, 404
        else:
            # Generate password reset token
            token = serializer.dumps(data, salt='password-reset')
            # Create password reset URL with token
            reset_url = f'http://localhost:8000/reset_password/{token}'
            # Render the email template with the reset URL
            html_body = render_template(
                'verify_email.html', 
                verify_url=reset_url, 
                subject='Forgot your Password', 
                button='RESET PASSWORD', 
                content='We noticed that you have requested to reset your password for your Inxiteout account. To proceed with this request, please click on the password reset button below.', 
                caption='Didn\'t reset password'
            )
            # Create message and send email
            message = Message('Reset Your Password', recipients=[data['email']])
            message.html = html_body
            mail.send(message)
            return {'message': 'Please check your email for password reset instructions'}, 200        
    
@ns.route('/login')
class Login(Resource):
    @ns.expect(login_model)
    def post(self):
        data = api.payload
        user = users.objects(email=data['email']).first()
        
        if not user or user.verified == False or not user.get_password(data['password']):
            return {'message': 'Invalid credentials'}, 401
        
        # Création du token
        access_token = create_access_token(identity=str(user.id))
        
        # On enlève le password avant de renvoyer l'utilisateur
        user_json = json.loads(user.to_json())
        user_json.pop("password", None)
        
        # 🟢 Normaliser l'ID
        user_json["id"] = str(user_json["_id"]["$oid"])
        user_json.pop("_id", None)  # optionnel : supprimer _id brut
        
        return {
            'access_token': access_token,
            'user': user_json
        }, 200



@ns.route('/signout')
class SignOut(Resource):
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def post(self):
        # Delete access token from client-side
        # Return success message
        return {'message': 'Logged out successfully'}, 200

#Creating a namespace for our API
ns2 = api.namespace('courses', description='The courses namespace provides endpoints for managing courses, including creating, retrieving, updating, and deleting course information.')

# Define the expected payload using the 'fields' module
course_model = ns2.model('Course', {
    'courseID': fields.String(required=True, description='enter your courseID'),
    'title': fields.String(required=True, description='enter your title'),
    'description': fields.String(required=True, description='enter your description'),
    'credits': fields.Integer(required=True, description='enter your credits'),
    'term': fields.String(required=True, description='enter your term')
})
@ns.route('/admin/by-email/<string:email>')
class AdminUpdateDeleteUserByEmail(Resource):
    @ns.expect(user_model, auth_header) 
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required()  # à activer si tu veux que seul l'admin authentifié puisse l'utiliser
    def put(self, email):
        """
        Admin: Update user by email (no password check)
        """
        try:
            data = api.payload
            target_user = users.objects(email=email).first()
            
            if not target_user:
                return {'message': 'User not found'}, 404

            # ⚠️ On évite de mettre à jour l'email car c’est l’identifiant
            data.pop('email', None)
            # ⚠️ On ne touche pas non plus au password directement ici
            data.pop('password', None)

            # Mise à jour des champs
            users.objects(email=email).update(**data)

            # Récupérer l'utilisateur mis à jour sans password/verified
            updated_user = users.objects.exclude('password', 'verified').get(email=email)
            user_json = json.loads(updated_user.to_json())

            return {
                "message": f"User {email} updated successfully",
                "user": user_json
            }, 200
        except Exception as e:
            return {'message': str(e)}, 500

    def delete(self, email):
        """
        Admin: Delete user by email
        """
        try:
            target_user = users.objects(email=email).first()
            if not target_user:
                return {'message': 'User not found'}, 404

            user_email = target_user.email
            target_user.delete()

            verification = users.objects(email=email).first()
            if verification:
                return {"error": "Failed to delete user"}, 500

            return {"message": f"User {user_email} deleted successfully"}, 200
        except Exception as e:
            return {'message': str(e)}, 500


#Defining endpoints for getting and posting courses
@ns2.route('')
class GetAndPost(Resource):
    @ns2.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def get(self):
        return jsonify(courses.objects.all())
    
    @ns2.expect(course_model, auth_header)  # Use the 'expect' decorator to specify the expected payload
    @ns2.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def post(self):
        data = api.payload
        course = courses(
            courseID=data['courseID'],
            title=data['title'],
            description=data['description'],
            credits=data['credits'],
            term=data['term']
        )
        course.save()
        return jsonify(courses.objects(courseID=data['courseID']))

#Defining endpoints for getting, updating and deleting courses by ID
@ns2.route('/<idx>')
class GetUpdateDelete(Resource):
    @ns2.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def get(self, idx):
        return jsonify(courses.objects(courseID=idx))
    
    @ns2.expect(course_model, auth_header)  # Use the 'expect' decorator to specify the expected payload
    @ns2.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def put(self, idx):
        data = api.payload
        courses.objects(courseID=idx).update(**data)
        return jsonify(courses.objects(courseID=idx))
    
    @ns2.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required() # add this if you're using JWT for authentication
    def delete(self, idx):
        courses.objects(courseID=idx).delete()
        return jsonify("Course is deleted!")
    
#Creating a namespace for our API
email_ns = api.namespace('mail', description='Email related operations.')


#Defining endpoints for sending mails
@email_ns.route('')
class GetAndPost(Resource):
    @jwt_required() # add this if you're using JWT for authentication
    def post(self):
        # Get the email data from the request
        email_data = request.form.to_dict()
        
        email_data['to'] = email_data['to'].split(',')
        if 'cc' in email_data:
            email_data['cc'] = email_data['cc'].split(',')


        # Create the email message
        msg = Message(
            email_data['subject'],
            recipients=email_data['to'],
            cc=email_data.get('cc', None)
            #bcc=[email_data.get('bcc', None)]
        )

        # Render the email template
        html_body = render_template(
            'email.html', 
            subject=email_data['subject'], 
            content=email_data['body'], 
            name=email_data['name'],
            company_name=email_data['company_name'],
            email_id=email_data['sender_mail_id'],
            button=email_data['button'],
            url=email_data['url']
        )
        msg.html = html_body
        # Add attachments to the message object
        attachments = request.files.getlist('attachments')
        for attachment in attachments:
            # Get the filename and content type
            filename = attachment.filename
            # Save the file in a temporary location
            file_path = os.path.join(tempfile.gettempdir(), filename)
            attachment.save(file_path)
            # Set the attachment to the message object
            with app.open_resource(file_path, 'rb') as fp:
                msg.attach(filename, attachment.content_type, fp.read())


        # Send the email
        mail.send(msg)

        return {'message': 'Email sent successfully'}, 200

#Defining endpoints for sending bulk mails
@email_ns.route('/send_bulk')
class GetAndPost(Resource):
    @jwt_required() # add this if you're using JWT for authentication
    def post(self):
        # Get the email data from the request
        email_data = request.form.to_dict()
        
        email_data['to'] = email_data['to'].split(',')
        if 'cc' in email_data:
            email_data['cc'] = email_data['cc'].split(',')

        # Add attachments to the message object
        attachments = request.files.getlist('attachments')
        msg_attachments = []
        for attachment in attachments:
            # Get the filename and content type
            filename = attachment.filename
            # Save the file in a temporary location
            file_path = os.path.join(tempfile.gettempdir(), filename)
            attachment.save(file_path)
            # Set the attachment to the message object
            with app.open_resource(file_path, 'rb') as fp:
                msg_attachments.append((filename, attachment.content_type, fp.read()))

        for email_recipient in email_data['to']:
            # Create the email message
            msg = Message(
                email_data['subject'],
                recipients=[email_recipient],
                cc=email_data.get('cc', None)
                #bcc=[email_data.get('bcc', None)]
            )
            # Render the email template
            html_body = render_template(
                'email.html', 
                subject=email_data['subject'], 
                content=email_data['body'], 
                name=email_data['name'],
                company_name=email_data['company_name'],
                email_id=email_data['sender_mail_id'],
                button=email_data['button'],
                url=email_data['url']
            )
            msg.html = html_body
            # Attach the files to the message object
            for attachment in msg_attachments:
                msg.attach(*attachment)
            # Send the email
            mail.send(msg)

        return {'message': 'Bulk Email sent successfully'}, 200

    
#Defining the route for the index page
@app.route("/")
@app.route("/index/")
def index():
    return render_template("index.html")

# define an endpoint to verify email
@app.route('/verify_email/<token>', methods=['GET'])
def verify_email(token):
    try:
        email = serializer.loads(token, salt='email-verification', max_age=3600)
        user = users.objects(email=email).first()
        if user:
            user.verified = True
            user.save()
        return render_template('Success_verify_email.html')
        #return jsonify({'message': 'Your account has been verified now!'}), 200
    except SignatureExpired:
        return jsonify({'message': 'Verification link has expired.'}), 400
    except BadSignature:
        return jsonify({'message': 'Invalid verification link.'}), 400
    
    # define an endpoint to verify email and password
@app.route('/reset_password/<token>', methods=['GET'])
def reset_password(token):
    try:
        data = serializer.loads(token, salt='password-reset', max_age=3600)
        user = users.objects(email=data['email']).first()
        if user:
            user.set_password(data['new_password'])
            user.save()
        return jsonify({'message': 'Your account password has been updated now!'}), 200
    except SignatureExpired:
        return jsonify({'message': 'Verification link has expired.'}), 400
    except BadSignature:
        return jsonify({'message': 'Invalid verification link.'}), 400
    




# Nouveau namespace pour les prédictions
predict_ns = api.namespace('predict', description='Endpoints for yield prediction')

# Définir le payload attendu
predict_model = predict_ns.model('PredictRequest', {
    'Semaine': fields.Integer(required=True),
    'Jour apres plantation': fields.Integer(required=True),
    'Vitesse de maturation': fields.Integer(required=True),
    'variete': fields.Integer(required=True),
    'ETo (mm)': fields.Float(required=True),
    'Temperature (Min) (C)': fields.Float(required=True),
    'Temperature (Moy) (C)': fields.Float(required=True),
    'Temperature (Max) (C)': fields.Float(required=True),
    'Humidite relative (Min) (%)': fields.Float(required=True),
    'Humidite relative (Moy) (%)': fields.Float(required=True),
    'Humidite relative (Max) (%)': fields.Float(required=True),
    'Rayonnement global (j/cm2)': fields.Float(required=True),
    'VPD (Min) (Kpa)': fields.Float(required=True),
    'VPD (Kpa)': fields.Float(required=True),
    'VPD (Max) (Kpa)': fields.Float(required=True),
    'Degre jour (C)': fields.Float(required=True),
    'Cumul degres jour  (C)': fields.Float(required=True),
    'Amplitude thermique (C)': fields.Float(required=True),
    'Indice de chaleur (C)': fields.Float(required=True),
    'Point de rosee (C)': fields.Float(required=True),
})
@predict_ns.route('')
class PredictEndpoint(Resource):
    @predict_ns.expect(predict_model)
    def post(self):
        try:
            data = api.payload  # données envoyées par le client
            prediction = predict(data)
            return {"prediction": prediction}, 200
        except Exception as e:
            return {"error": str(e)}, 500


# Nouveau modèle pour la réponse CSV
csv_response_model = predict_ns.model('CSVPredictResponse', {
    'total_rows': fields.Integer(description='Nombre total de lignes traitées'),
    'variete': fields.String(description='Variété traitée'),
    'predictions': fields.List(fields.Raw, description='Liste des prédictions avec données'),
    'statistics': fields.Raw(description='Statistiques sur les prédictions')
})
@predict_ns.route('/csv')
class PredictCSVEndpoint(Resource):
    def post(self):
        """
        Upload un fichier CSV et retourne les prédictions pour toutes les lignes
        """
        try:
            # Vérifier qu'un fichier a été envoyé
            if 'file' not in request.files:
                return {"error": "Aucun fichier fourni"}, 400
            
            file = request.files['file']
            if file.filename == '':
                return {"error": "Nom de fichier vide"}, 400
            
            if not file.filename.lower().endswith('.csv'):
                return {"error": "Le fichier doit être un CSV"}, 400
            
            # Lire le CSV
            try:
                # Lire le contenu du fichier en mémoire
                stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
                df = pd.read_csv(stream)
            except Exception as e:
                return {"error": f"Erreur lors de la lecture du CSV: {str(e)}"}, 400
            
            if df.empty:
                return {"error": "Le fichier CSV est vide"}, 400
            
            # Faire les prédictions
            result_df = predict_batch(df)
            
            # Calculer des statistiques
            stats = {
                "moyenne_prediction": float(result_df['Prediction_Rendement'].mean()),
                "min_prediction": float(result_df['Prediction_Rendement'].min()),
                "max_prediction": float(result_df['Prediction_Rendement'].max()),
                "ecart_type": float(result_df['Prediction_Rendement'].std())
            }
            
            # Obtenir la variété (supposant qu'il n'y en a qu'une par fichier)
            varietes = result_df['variete'].unique()
            if len(varietes) > 1:
                return {"warning": f"Plusieurs variétés détectées: {list(varietes)}. Traitement de toutes."}, 200
            
            variete_name = varietes[0] if len(varietes) == 1 else "Multiple"
            
            # Convertir en format JSON
            predictions_list = result_df.to_dict('records')
            
            return {
                "total_rows": len(result_df),
                "variete": str(variete_name),
                "predictions": predictions_list,
                "statistics": stats
            }, 200
            
        except Exception as e:
            return {"error": f"Erreur lors du traitement: {str(e)}"}, 500

@predict_ns.route('/csv/download')
class PredictCSVDownloadEndpoint(Resource):
    def post(self):
        """
        Upload un fichier CSV et retourne un CSV avec les prédictions ajoutées
        """
        try:
            if 'file' not in request.files:
                return {"error": "Aucun fichier fourni"}, 400
            
            file = request.files['file']
            if file.filename == '':
                return {"error": "Nom de fichier vide"}, 400
            
            if not file.filename.lower().endswith('.csv'):
                return {"error": "Le fichier doit être un CSV"}, 400
            
            # Lire le CSV
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            df = pd.read_csv(stream)
            
            if df.empty:
                return {"error": "Le fichier CSV est vide"}, 400
            
            # Faire les prédictions
            result_df = predict_batch(df)
            
            # Créer un CSV en réponse
            output = io.StringIO()
            result_df.to_csv(output, index=False)
            output.seek(0)
            
            # Retourner le CSV comme fichier téléchargeable
            from flask import Response
            return Response(
                output.getvalue(),
                mimetype="text/csv",
                headers={"Content-disposition": f"attachment; filename=predictions_{file.filename}"}
            )
            
        except Exception as e:
            return {"error": f"Erreur lors du traitement: {str(e)}"}, 500

# Endpoint pour obtenir un exemple de format CSV
@predict_ns.route('/csv/template')
class CSVTemplateEndpoint(Resource):
    def get(self):
        """
        Retourne un exemple de CSV avec les colonnes requises
        """
        # Créer un DataFrame exemple
        example_data = {
            'Semaine': [1, 2, 3],
            'Jour apres plantation': [7, 14, 21],
            'Vitesse de maturation': [1, 2, 3],
            'variete': ['Tomate_Cerise', 'Tomate_Cerise', 'Tomate_Cerise'],
            'ETo (mm)': [3.2, 3.5, 3.8],
            'Temperature (Min) (C)': [15.0, 16.0, 17.0],
            'Temperature (Moy) (C)': [22.0, 23.0, 24.0],
            'Temperature (Max) (C)': [29.0, 30.0, 31.0],
            'Humidite relative (Min) (%)': [45.0, 47.0, 49.0],
            'Humidite relative (Moy) (%)': [65.0, 67.0, 69.0],
            'Humidite relative (Max) (%)': [85.0, 87.0, 89.0],
            'Rayonnement global (j/cm2)': [2000, 2100, 2200],
            'VPD (Min) (Kpa)': [0.5, 0.6, 0.7],
            'VPD (Kpa)': [1.2, 1.3, 1.4],
            'VPD (Max) (Kpa)': [2.0, 2.1, 2.2],
            'Degre jour (C)': [12.0, 13.0, 14.0],
            'Cumul degres jour  (C)': [84.0, 175.0, 273.0],
            'Amplitude thermique (C)': [14.0, 14.0, 14.0],
            'Indice de chaleur (C)': [25.0, 26.0, 27.0],
            'Point de rosee (C)': [12.0, 13.0, 14.0]
        }
        
        df_example = pd.DataFrame(example_data)
        
        # Retourner comme CSV
        output = io.StringIO()
        df_example.to_csv(output, index=False)
        output.seek(0)
        
        from flask import Response
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=template_prediction.csv"}
        )

# Renommer votre endpoint existant pour plus de clarté
@predict_ns.route('/single')
class PredictSingleEndpoint(Resource):
    @predict_ns.expect(predict_model)
    def post(self):
        """
        Prédiction pour une seule observation
        """
        try:
            data = api.payload
            prediction = predict_single(data)
            return {"prediction": prediction}, 200
        except Exception as e:
            return {"error": str(e)}, 500


# Ajoutez ces imports en haut de votre fichier


# Modèle pour la réponse de comparaison
comparison_response_model = predict_ns.model('ComparisonResponse', {
    'total_rows': fields.Integer(description='Nombre total de lignes comparées'),
    'comparisons': fields.List(fields.Raw, description='Comparaisons ligne par ligne'),
    'global_metrics': fields.Raw(description='Métriques globales'),
    'statistics': fields.Raw(description='Statistiques générales'),
    'columns_used': fields.Raw(description='Colonnes utilisées pour la comparaison')
})



@predict_ns.route('/compare')
class CompareEndpoint(Resource):
    def post(self):
        """
        Compare les prédictions avec les valeurs réelles
        Attend deux fichiers CSV : un avec les prédictions et un avec les valeurs réelles
        Détecte automatiquement les colonnes appropriées
        """
        try:
            # Vérifier que les deux fichiers sont présents
            if 'predictions_file' not in request.files or 'actual_file' not in request.files:
                return {"error": "Deux fichiers requis: 'predictions_file' et 'actual_file'"}, 400
            
            predictions_file = request.files['predictions_file']
            actual_file = request.files['actual_file']
            
            if predictions_file.filename == '' or actual_file.filename == '':
                return {"error": "Noms de fichiers vides"}, 400
            
            if not (predictions_file.filename.lower().endswith('.csv') and 
                   actual_file.filename.lower().endswith('.csv')):
                return {"error": "Les deux fichiers doivent être des CSV"}, 400
            
            # Lire les fichiers CSV
            try:
                # Fichier avec prédictions
                pred_stream = io.StringIO(predictions_file.stream.read().decode("UTF8"), newline=None)
                df_predictions = pd.read_csv(pred_stream)
                
                # Fichier avec valeurs réelles
                actual_stream = io.StringIO(actual_file.stream.read().decode("UTF8"), newline=None)
                df_actual = pd.read_csv(actual_stream)
                
            except Exception as e:
                return {"error": f"Erreur lors de la lecture des CSV: {str(e)}"}, 400
            
            # Vérifications
            if df_predictions.empty or df_actual.empty:
                return {"error": "Un des fichiers CSV est vide"}, 400
            
            # Trouver les colonnes appropriées
            pred_column = find_prediction_column(df_predictions)
            actual_column = find_actual_column(df_actual)
            
            if pred_column is None:
                available_cols = list(df_predictions.columns)
                return {"error": f"Aucune colonne de prédiction trouvée. Colonnes disponibles: {available_cols}"}, 400
            
            if actual_column is None:
                available_cols = list(df_actual.columns)
                return {"error": f"Aucune colonne de valeurs réelles trouvée. Colonnes disponibles: {available_cols}"}, 400
            
            # Nettoyer et valider les données
            try:
                df_predictions = validate_and_clean_data(df_predictions, pred_column)
                df_actual = validate_and_clean_data(df_actual, actual_column)
            except Exception as e:
                return {"error": f"Erreur lors de la validation des données: {str(e)}"}, 400
            
            # Vérifier que les DataFrames ont la même longueur après nettoyage
            min_length = min(len(df_predictions), len(df_actual))
            if min_length == 0:
                return {"error": "Aucune donnée valide trouvée après nettoyage"}, 400
            
            # Tronquer aux même longueur si nécessaire
            df_predictions = df_predictions.head(min_length)
            df_actual = df_actual.head(min_length)
            
            # Extraire les données
            predictions = df_predictions[pred_column].values
            actual_values = df_actual[actual_column].values
            
            # Calculer les métriques globales
            global_metrics = calculate_metrics(actual_values, predictions)
            
            # Calculer les métriques individuelles
            individual_metrics = calculate_individual_metrics(actual_values, predictions)
            
            # Créer la liste de comparaisons
            comparisons = []
            for i in range(len(predictions)):
                comparison = {
                    'index': i + 1,
                    'prediction': float(predictions[i]),
                    'actual': float(actual_values[i]),
                    'metrics': individual_metrics[i]
                }
                comparisons.append(comparison)
            
            # Statistiques générales
            statistics = {
                'predictions': {
                    'mean': float(np.mean(predictions)),
                    'std': float(np.std(predictions)),
                    'min': float(np.min(predictions)),
                    'max': float(np.max(predictions))
                },
                'actual': {
                    'mean': float(np.mean(actual_values)),
                    'std': float(np.std(actual_values)),
                    'min': float(np.min(actual_values)),
                    'max': float(np.max(actual_values))
                }
            }
            
            # Information sur les colonnes utilisées
            columns_used = {
                'prediction_column': pred_column,
                'actual_column': actual_column,
                'prediction_file_columns': list(df_predictions.columns),
                'actual_file_columns': list(df_actual.columns)
            }
            
            return {
                'total_rows': len(predictions),
                'comparisons': comparisons,
                'global_metrics': global_metrics,
                'statistics': statistics,
                'columns_used': columns_used
            }, 200
            
        except Exception as e:
            return {"error": f"Erreur lors de la comparaison: {str(e)}"}, 500

# @predict_ns.route('/compare/download')
# class CompareDownloadEndpoint(Resource):
#     def post(self):
#         """
#         Compare et retourne un CSV avec toutes les données de comparaison
#         Détecte automatiquement les colonnes appropriées
#         """
#         try:
#             if 'predictions_file' not in request.files or 'actual_file' not in request.files:
#                 return {"error": "Deux fichiers requis: 'predictions_file' et 'actual_file'"}, 400
            
#             predictions_file = request.files['predictions_file']
#             actual_file = request.files['actual_file']
            
#             # Lire les fichiers
#             pred_stream = io.StringIO(predictions_file.stream.read().decode("UTF8"), newline=None)
#             df_predictions = pd.read_csv(pred_stream)
            
#             actual_stream = io.StringIO(actual_file.stream.read().decode("UTF8"), newline=None)
#             df_actual = pd.read_csv(actual_stream)
            
#             # Trouver les colonnes appropriées
#             pred_column = find_prediction_column(df_predictions)
#             actual_column = find_actual_column(df_actual)
            
#             if pred_column is None or actual_column is None:
#                 return {"error": "Colonnes de données non trouvées"}, 400
            
#             # Nettoyer les données
#             df_predictions = validate_and_clean_data(df_predictions, pred_column)
#             df_actual = validate_and_clean_data(df_actual, actual_column)
            
#             # Ajuster à la même longueur
#             min_length = min(len(df_predictions), len(df_actual))
#             df_predictions = df_predictions.head(min_length)
#             df_actual = df_actual.head(min_length)
            
#             # Créer un DataFrame de comparaison
#             comparison_df = pd.DataFrame({
#                 'Prediction_Rendement': df_predictions[pred_column],
#                 'Rendement_Actual': df_actual[actual_column],
#             })
            
#             # Calculer les métriques pour chaque ligne
#             comparison_df['Erreur_Absolue'] = abs(comparison_df['Rendement_Actual'] - comparison_df['Prediction_Rendement'])
#             comparison_df['Erreur_Quadratique'] = (comparison_df['Rendement_Actual'] - comparison_df['Prediction_Rendement']) ** 2
            
#             # Éviter la division par zéro pour l'erreur relative
#             comparison_df['Erreur_Relative_Pct'] = comparison_df.apply(
#                 lambda row: (row['Erreur_Absolue'] / row['Rendement_Actual']) * 100 if row['Rendement_Actual'] != 0 else 0,
#                 axis=1
#             )
            
#             # Ajouter des informations sur les colonnes utilisées en commentaire
#             metadata_comment = f"# Colonnes utilisées - Prédictions: {pred_column}, Réelles: {actual_column}\n"
            
#             # Créer un CSV en réponse
#             output = io.StringIO()
#             output.write(metadata_comment)
#             comparison_df.to_csv(output, index=False)
#             output.seek(0)
            
#             from flask import Response
#             return Response(
#                 output.getvalue(),
#                 mimetype="text/csv",
#                 headers={"Content-disposition": "attachment; filename=comparison_results.csv"}
#             )
            
#         except Exception as e:
#             return {"error": f"Erreur lors de la comparaison: {str(e)}"}, 500


@predict_ns.route('/compare/download')
class CompareDownloadEndpoint(Resource):
    def post(self):
        try:
            if 'predictions_file' not in request.files or 'actual_file' not in request.files:
                return {"error": "Deux fichiers requis: 'predictions_file' et 'actual_file'"}, 400
            
            predictions_file = request.files['predictions_file']
            actual_file = request.files['actual_file']
            
            # Lire les fichiers CSV
            df_predictions = pd.read_csv(io.StringIO(predictions_file.stream.read().decode("UTF8"), newline=None))
            df_actual = pd.read_csv(io.StringIO(actual_file.stream.read().decode("UTF8"), newline=None))
            
            # Détecter les colonnes
            pred_column = find_prediction_column(df_predictions)
            actual_column = find_actual_column(df_actual)
            week_column_pred = find_week_column(df_predictions)
            week_column_actual = find_week_column(df_actual)
            
            if pred_column is None or actual_column is None:
                return {"error": "Colonnes de données non trouvées"}, 400
            
            # Nettoyer les colonnes
            df_predictions = validate_and_clean_data(df_predictions, pred_column)
            df_actual = validate_and_clean_data(df_actual, actual_column)
            
            # Ajuster à la même longueur
            min_length = min(len(df_predictions), len(df_actual))
            df_predictions = df_predictions.head(min_length)
            df_actual = df_actual.head(min_length)
            
            # Créer DataFrame comparaison
            comparison_df = pd.DataFrame({
                'Prediction_Rendement': df_predictions[pred_column],
                'Rendement_Actual': df_actual[actual_column],
            })
            
            # Ajouter colonne semaine
            if week_column_actual:
                comparison_df['Semaine'] = df_actual[week_column_actual].head(min_length)
            elif week_column_pred:
                comparison_df['Semaine'] = df_predictions[week_column_pred].head(min_length)
            else:
                comparison_df['Semaine'] = range(1, min_length + 1)
            
            # Calcul des métriques
            comparison_df['Erreur_Absolue'] = abs(comparison_df['Rendement_Actual'] - comparison_df['Prediction_Rendement'])
            comparison_df['Erreur_Quadratique'] = (comparison_df['Rendement_Actual'] - comparison_df['Prediction_Rendement']) ** 2
            comparison_df['Erreur_Relative_Pct'] = comparison_df.apply(
                lambda row: (row['Erreur_Absolue'] / row['Rendement_Actual']) * 100 if row['Rendement_Actual'] != 0 else 0,
                axis=1
            )
            
            # Ajouter metadata commentaire
            metadata_comment = f"# Colonnes utilisées - Prédictions: {pred_column}, Réelles: {actual_column}, Semaine: {week_column_actual or week_column_pred or 'créée'}\n"
            
            # Créer CSV en sortie
            output = io.StringIO()
            output.write(metadata_comment)
            comparison_df.to_csv(output, index=False)
            output.seek(0)
            
            return Response(
                output.getvalue(),
                mimetype="text/csv",
                headers={"Content-disposition": "attachment; filename=comparison_results.csv"}
            )
            
        except Exception as e:
            return {"error": f"Erreur lors de la comparaison: {str(e)}"}, 500

# Endpoint pour lister les colonnes disponibles (optionnel, pour debug)
@predict_ns.route('/compare/columns')
class CompareColumnsEndpoint(Resource):
    def post(self):
        """
        Retourne les colonnes disponibles dans les fichiers
        """
        try:
            if 'predictions_file' not in request.files or 'actual_file' not in request.files:
                return {"error": "Deux fichiers requis"}, 400
            
            predictions_file = request.files['predictions_file']
            actual_file = request.files['actual_file']
            
            # Lire juste les en-têtes
            pred_stream = io.StringIO(predictions_file.stream.read().decode("UTF8"), newline=None)
            df_pred = pd.read_csv(pred_stream, nrows=0)  # Juste les en-têtes
            
            actual_stream = io.StringIO(actual_file.stream.read().decode("UTF8"), newline=None)
            df_actual = pd.read_csv(actual_stream, nrows=0)  # Juste les en-têtes
            
            # Suggestions de colonnes
            pred_suggestion = find_prediction_column(pd.read_csv(io.StringIO(predictions_file.stream.read().decode("UTF8"))))
            actual_suggestion = find_actual_column(pd.read_csv(io.StringIO(actual_file.stream.read().decode("UTF8"))))
            
            return {
                'predictions_file': {
                    'columns': list(df_pred.columns),
                    'suggested_column': pred_suggestion
                },
                'actual_file': {
                    'columns': list(df_actual.columns),
                    'suggested_column': actual_suggestion
                }
            }, 200
            
        except Exception as e:
            return {"error": f"Erreur: {str(e)}"}, 500