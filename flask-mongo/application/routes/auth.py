#Importing necessary libraries
from application import app,db,api,jwt,mail,serializer
from flask import render_template, jsonify, json, redirect, flash, url_for, request,Response
from application.models import History, users,courses
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
from application.utils.history import log_action




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
         # 🔹 Log login
        log_action(
            user_id=str(user.id),
            action_type="login",
            description="Connexion utilisateur",
            results={"email": user.email}
        )
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
    


@ns.route('/count')
class UserCount(Resource):
    @ns.doc(security='Bearer Auth', parser=auth_header)
    @jwt_required()
    def get(self):
        try:
            count = users.objects.count()  # nombre total d'utilisateurs
            return {"total_users": count}, 200
        except Exception as e:
            return {"message": str(e)}, 500
        


@ns.route('/dashboard/admin')
class AdminDashboard(Resource):
    @jwt_required()
    def get(self):
        current_user = users.objects(id=get_jwt_identity()).first()
        if not current_user or current_user.role != "admin":
            return {"error": "Accès non autorisé"}, 403

        try:
            total_users = users.objects.count()
            total_datasets = History.objects(action_type__in=["compare_csv", "prediction_csv_download"]).count()
            last_dataset = History.objects(action_type__in=["compare_csv", "prediction_csv_download"]).order_by('-created_at').first()

            problematic = History.objects(__raw__={"results.global_metrics.MAE": {"$gt": 15}})

            kpis = {
                "total_users": total_users,
                "total_datasets": total_datasets,
                "last_dataset": {
                    "file": last_dataset.files[0].filename if last_dataset and last_dataset.files else None,
                    "user_id": last_dataset.user_id if last_dataset else None,
                    "date": last_dataset.created_at.isoformat() if last_dataset else None
                },
                "problematic_datasets": problematic.count()
            }

            datasets = []
            for h in History.objects(action_type__in=["compare_csv", "prediction_csv_download"]).order_by('-created_at'):
                datasets.append({
                    "user_id": h.user_id,
                    "datasets": [f.filename for f in h.files],
                    "date": h.created_at.isoformat(),
                    "rows": len(h.files[0].content) if h.files else 0,
                    "error": h.results.get("global_metrics")
                })

            return {"kpis": kpis, "datasets": datasets}, 200
        except Exception as e:
            return {"error": str(e)}, 500



@ns.route('/dashboard/user')
class UserDashboard(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        try:
            history = History.objects(user_id=user_id).order_by('-created_at')

            total_files = history.count()
            last_entry = history.first()

            kpis = {
                "total_files": total_files,
                "last_file": last_entry.files[0].filename if last_entry and last_entry.files else None,
                "last_date": last_entry.created_at.isoformat() if last_entry else None,
                "global_error": last_entry.results.get("global_metrics") if last_entry and "global_metrics" in last_entry.results else None,
                "mean_pred": last_entry.results["statistics"]["predictions"]["mean"] if last_entry and "statistics" in last_entry.results else None,
                "mean_actual": last_entry.results["statistics"]["actual"]["mean"] if last_entry and "statistics" in last_entry.results else None,
            }

            historique = []
            for h in history:
                historique.append({
                    "dataset": [f.filename for f in h.files],
                    "date": h.created_at.isoformat(),
                    "rows": len(h.files[0].content) if h.files else 0,
                    "mean_pred": h.results.get("statistics", {}).get("predictions", {}).get("mean"),
                    "mean_actual": h.results.get("statistics", {}).get("actual", {}).get("mean"),
                    "error": h.results.get("global_metrics")
                })

            return {"kpis": kpis, "history": historique}, 200
        except Exception as e:
            return {"error": str(e)}, 500


