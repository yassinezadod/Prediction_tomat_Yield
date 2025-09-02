import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import LabelEncoder

class FeatureEngineering(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.le_variete = LabelEncoder()
        self.le_phase = LabelEncoder()
        self.duree_par_variete = None

    def fit(self, X, y=None):
        df = X.copy()

        # Calcul durée max par variété
        self.duree_par_variete = df.groupby('variete')['Jour apres plantation'].max()

        # Créer toutes les features pour l'entraînement des encoders
        df = self._create_all_features(df)
        
        # Encoder les catégories
        self.le_variete.fit(df['variete'])
        self.le_phase.fit(df['phase_croissance'])
        return self

    def transform(self, X):
        df = X.copy()
        
        # Créer TOUTES les features d'abord
        df = self._create_all_features(df)
        
        # Encoder les variables catégorielles
        df['variete_encoded'] = self.le_variete.transform(df['variete'])
        df['phase_croissance_encoded'] = self.le_phase.transform(df['phase_croissance'])

        # Sélection des colonnes finales
        features_to_use = [
            'Semaine', 'Vitesse de maturation', 'variete_encoded', 'ETo (mm)',
            'Temperature (Min) (C)', 'Temperature (Moy) (C)', 'Temperature (Max) (C)',
            'Humidite relative (Min) (%)', 'Humidite relative (Moy) (%)',
            'Humidite relative (Max) (%)',
            'Rayonnement global (j/cm2)', 'Degre jour (C)', 'Cumul degres jour  (C)',
            'Amplitude thermique (C)', 'Indice de chaleur (C)', 'Point de rosee (C)',
            'duree_plantation', 'progres', 'progres_sin', 'progres_cos',
            'progres_x_temp', 'progres_x_humidite',
            'semaine_sin', 'semaine_cos', 'phase_croissance_encoded',
            'stress_thermique', 'stress_hydrique', 'confort_thermique',
            'deficit_vapeur', 'efficacite_maturation', 'energie_cumulative',
            'ratio_temp_humidite', 'efficience_ETo'
        ]
        
        return df[features_to_use]

    def _create_all_features(self, df):
        """
        Crée toutes les features nécessaires
        """
        # Features de base sur la variété et progression
        df['duree_plantation'] = df['variete'].map(self.duree_par_variete)
        df['progres'] = (df['Jour apres plantation'] / df['duree_plantation']).clip(0, 1)
        
        # Features cycliques
        df['semaine_sin'] = np.sin(2 * np.pi * df['Semaine'] / 52)
        df['semaine_cos'] = np.cos(2 * np.pi * df['Semaine'] / 52)
        df['progres_sin'] = np.sin(2 * np.pi * df['progres'])
        df['progres_cos'] = np.cos(2 * np.pi * df['progres'])
        
        # Phase de croissance
        df['phase_croissance'] = df['progres'].apply(self._get_growth_phase)
        
        # Features d'interaction et stress
        df['stress_thermique'] = (df['Temperature (Max) (C)'] > 35).astype(int)
        df['stress_hydrique'] = (df['Humidite relative (Min) (%)'] < 60).astype(int)
        df['confort_thermique'] = 100 - abs(df['Temperature (Moy) (C)'] - 25)
        df['deficit_vapeur'] = df['Temperature (Moy) (C)'] - df['Point de rosee (C)']
        df['efficacite_maturation'] = df['Vitesse de maturation'] / (df['progres'] + 0.01)
        df['energie_cumulative'] = df['Rayonnement global (j/cm2)'] * df['Cumul degres jour  (C)']
        df['progres_x_temp'] = df['progres'] * df['Temperature (Moy) (C)']
        df['progres_x_humidite'] = df['progres'] * df['Humidite relative (Moy) (%)']
        df['ratio_temp_humidite'] = df['Temperature (Moy) (C)'] / df['Humidite relative (Moy) (%)']
        df['efficience_ETo'] = df['ETo (mm)'] / df['Temperature (Moy) (C)']
        
        return df

    def _get_growth_phase(self, progress):
        if progress <= 0.25:
            return 'germination'
        elif progress <= 0.5:
            return 'croissance_vegetative'
        elif progress <= 0.75:
            return 'floraison'
        else:
            return 'fructification'