#Importing necessary libraries
import datetime
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

from application.models import History, CSVFileContent





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
    @jwt_required(optional=True)  # 👈 permet JWT optionnel

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
            user_id = get_jwt_identity()

            # 🔹 Enregistrer l'historique
            History(
                user_id=user_id,

                action_type="prediction_csv_download",
                description="CSV uploadé et prédictions générées pour téléchargement",
                files=[CSVFileContent(filename=file.filename, content=df.to_dict('records'))],
                results={"predictions": result_df['Prediction_Rendement'].tolist()},
                created_at=datetime.datetime.utcnow()
            ).save()
            
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
    @jwt_required(optional=True)  # 👈 permet JWT optionnel

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

            # 🔹 Enregistrer l'historique
            try:
                user_id = get_jwt_identity()

                History(
                    
                    user_id=user_id,
                    action_type="compare_csv",
                    description="Comparaison des prédictions avec valeurs réelles",
                    files=[
                        CSVFileContent(filename=predictions_file.filename, content=df_predictions.to_dict('records')),
                        CSVFileContent(filename=actual_file.filename, content=df_actual.to_dict('records'))
                    ],
                    results={
                        'comparisons': comparisons,
                        'global_metrics': global_metrics,
                        'statistics': statistics,
                        'columns_used': columns_used
                    },
                    created_at=datetime.datetime.utcnow()
                ).save()
            except Exception as e:
                print("Erreur Mongo:", e)



            
            
            return {
                'total_rows': len(predictions),
                'comparisons': comparisons,
                'global_metrics': global_metrics,
                'statistics': statistics,
                'columns_used': columns_used
            }, 200
            
        except Exception as e:
            return {"error": f"Erreur lors de la comparaison: {str(e)}"}, 500

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