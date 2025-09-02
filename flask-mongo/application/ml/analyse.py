#Importing necessary libraries
from application import app,db,api,jwt,mail,serializer
from flask import render_template, jsonify, json, redirect, flash, url_for, request
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


def find_week_column(df):
    possible_names = [
        'Semaine', 'Week'
    ]
    for col in df.columns:
        if col in possible_names:
            return col
    return None



def find_prediction_column(df):
    """
    Trouve la colonne contenant les prédictions
    """
    possible_names = [
        'Prediction_Rendement', 'prediction_rendement', 'Prediction', 'prediction',
        'Predicted_Yield', 'predicted_yield', 'Yield_Prediction', 'yield_prediction',
        'Rendement_Predit', 'rendement_predit', 'Predit', 'predit'
    ]
    
    # Chercher une correspondance exacte
    for col in df.columns:
        if col in possible_names:
            return col
    
    # Chercher une correspondance partielle (case insensitive)
    for col in df.columns:
        col_lower = col.lower()
        for possible_name in possible_names:
            if possible_name.lower() in col_lower or col_lower in possible_name.lower():
                return col
    
    # Si aucune correspondance, prendre la dernière colonne numérique
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        return numeric_cols[-1]
    
    return None

def find_actual_column(df):
    """
    Trouve la colonne contenant les valeurs réelles
    """
    possible_names = [
        'rendement (t/ha)', 'Rendement (t/ha)', 'Rendement', 'rendement',
        'Actual_Yield', 'actual_yield', 'True_Yield', 'true_yield',
        'Yield', 'yield', 'Actual', 'actual', 'Real', 'real',
        'Valeur_Reelle', 'valeur_reelle', 'Reel', 'reel'
    ]
    
    # Chercher une correspondance exacte
    for col in df.columns:
        if col in possible_names:
            return col
    
    # Chercher une correspondance partielle (case insensitive)
    for col in df.columns:
        col_lower = col.lower()
        for possible_name in possible_names:
            if possible_name.lower() in col_lower or col_lower in possible_name.lower():
                return col
    
    # Si aucune correspondance, prendre la dernière colonne numérique
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        return numeric_cols[-1]
    
    return None

def validate_and_clean_data(df, column_name):
    """
    Valide et nettoie les données d'une colonne
    """
    if column_name not in df.columns:
        raise ValueError(f"Colonne '{column_name}' non trouvée")
    
    # Convertir en numérique si nécessaire
    df[column_name] = pd.to_numeric(df[column_name], errors='coerce')
    
    # Supprimer les lignes avec des valeurs manquantes
    initial_count = len(df)
    df = df.dropna(subset=[column_name])
    final_count = len(df)
    
    if final_count < initial_count:
        print(f"Warning: {initial_count - final_count} lignes avec des valeurs manquantes supprimées")
    
    return df

def calculate_metrics(y_true, y_pred):
    """
    Calcule les métriques d'erreur
    """
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    
    # Calcul du MAPE (Mean Absolute Percentage Error)
    # Éviter la division par zéro
    non_zero_mask = y_true != 0
    if np.sum(non_zero_mask) > 0:
        mape = np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100
    else:
        mape = 0
    
    return {
        'MAE': float(mae),
        'MSE': float(mse),
        'RMSE': float(rmse),
        'R2': float(r2),
        'MAPE': float(mape)
    }

def calculate_individual_metrics(y_true, y_pred):
    """
    Calcule les métriques pour chaque ligne individuellement
    """
    individual_errors = []
    
    for i in range(len(y_true)):
        true_val = y_true[i]
        pred_val = y_pred[i]
        
        # Erreur absolue
        abs_error = abs(true_val - pred_val)
        
        # Erreur quadratique
        squared_error = (true_val - pred_val) ** 2
        
        # Erreur relative (en pourcentage)
        relative_error = (abs_error / true_val) * 100 if true_val != 0 else 0
        
        individual_errors.append({
            'absolute_error': float(abs_error),
            'squared_error': float(squared_error),
            'relative_error': float(relative_error)
        })
    
    return individual_errors