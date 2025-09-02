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