# application/ml/feature_engineering.py
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.base import BaseEstimator, TransformerMixin

class FeatureEngineering(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.le_variete = LabelEncoder()
        self.le_phase = LabelEncoder()
        self.duree_par_variete = None

    def fit(self, X, y=None):
        df = X.copy()
        self.duree_par_variete = df.groupby('variete')['Jour apres plantation'].max()
        df['duree_plantation'] = df['variete'].map(self.duree_par_variete)
        df['progres'] = (df['Jour apres plantation'] / df['duree_plantation']).clip(0, 1)
        df['phase_croissance'] = df['progres'].apply(self._get_growth_phase)
        self.le_variete.fit(df['variete'])
        self.le_phase.fit(df['phase_croissance'])
        return self

    def transform(self, X):
        df = X.copy()
        df['duree_plantation'] = df['variete'].map(self.duree_par_variete)
        df['progres'] = (df['Jour apres plantation'] / df['duree_plantation']).clip(0, 1)
        df['semaine_sin'] = np.sin(2 * np.pi * df['Semaine'] / 52)
        df['semaine_cos'] = np.cos(2 * np.pi * df['Semaine'] / 52)
        df['phase_croissance'] = df['progres'].apply(self._get_growth_phase)
        df['variete_encoded'] = self.le_variete.transform(df['variete'])
        df['phase_croissance_encoded'] = self.le_phase.transform(df['phase_croissance'])
        # ... le reste du transform ...
        return df[[
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
        ]]

    def _get_growth_phase(self, progress):
        if progress <= 0.25:
            return 'germination'
        elif progress <= 0.5:
            return 'croissance_vegetative'
        elif progress <= 0.75:
            return 'floraison'
        else:
            return 'fructification'
