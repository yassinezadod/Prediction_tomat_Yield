from application.models import CSVFileContent, History
from flask_jwt_extended import get_jwt_identity



def log_action(user_id=None, action_type=None, description=None, files=None, results=None):
    """
    Enregistre une action dans l'historique
    files: liste de dict {filename: ..., content: [...]}
    results: dictionnaire de résultats ou métriques
    """
    history_entry = History(
        user_id=user_id,
        action_type=action_type,
        description=description,
        files=[CSVFileContent(filename=f['filename'], content=f['content']) for f in (files or [])],
        results=results
    )
    history_entry.save()
