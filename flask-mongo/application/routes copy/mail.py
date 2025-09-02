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
    