import joblib 
import pandas as pd
import sys
import os
from flask import request
from werkzeug.utils import secure_filename
import io
# Import explicite de ta classe custom
from application.ml.feature_engineering import FeatureEngineering

# 👉 Patch : dire à pickle que FeatureEngineering se trouve bien ici
sys.modules['__main__'].FeatureEngineering = FeatureEngineering  

# Charger le pipeline une seule fois au démarrage
MODEL_PATH = os.path.join("application", "ml", "pipeline_champion.pkl")
pipeline = joblib.load(MODEL_PATH)

# Colonnes attendues par ton modèle
FEATURE_COLUMNS = [
    'Semaine', 'Jour apres plantation', 'Vitesse de maturation', 'variete',
    'ETo (mm)', 'Temperature (Min) (C)', 'Temperature (Moy) (C)',
    'Temperature (Max) (C)', 'Humidite relative (Min) (%)',
    'Humidite relative (Moy) (%)', 'Humidite relative (Max) (%)',
    'Rayonnement global (j/cm2)', 'VPD (Min) (Kpa)', 'VPD (Kpa)',
    'VPD (Max) (Kpa)', 'Degre jour (C)', 'Cumul degres jour  (C)',
    'Amplitude thermique (C)', 'Indice de chaleur (C)',
    'Point de rosee (C)'
]

def predict(input_data: dict):
    """
    input_data : dict avec les features du modèle
    """
    df = pd.DataFrame([input_data], columns=FEATURE_COLUMNS)
    prediction = pipeline.predict(df)[0]
    return float(prediction)

def predict_single(input_data: dict):
    """
    input_data : dict avec les features du modèle (pour une seule ligne)
    """
    df = pd.DataFrame([input_data], columns=FEATURE_COLUMNS)
    prediction = pipeline.predict(df)[0]
    return float(prediction)

def predict_batch(df: pd.DataFrame):
    """
    df : DataFrame avec toutes les lignes à prédire
    """
    # Vérifier que les colonnes nécessaires sont présentes
    missing_cols = set(FEATURE_COLUMNS) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Colonnes manquantes dans le CSV: {missing_cols}")
    
    # Sélectionner seulement les colonnes nécessaires dans le bon ordre
    df_features = df[FEATURE_COLUMNS].copy()
    
    # Faire les prédictions
    predictions = pipeline.predict(df_features)
    
    # Retourner les résultats avec les données originales
    result_df = df.copy()
    result_df['Prediction_Rendement'] = predictions
    
    return result_df
