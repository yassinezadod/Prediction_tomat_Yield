from .prediction import predict_ns 
from .auth import ns    # si tu as un fichier auth.py
from .mail import email_ns   # si tu as un fichier auth.py

namespaces = [ predict_ns, ns,email_ns]
