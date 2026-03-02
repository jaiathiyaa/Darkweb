from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)

    from .routes.breach_routes import breach_bp
    from .routes.password_routes import password_bp

    app.register_blueprint(breach_bp, url_prefix="/api")
    app.register_blueprint(password_bp, url_prefix="/api")

    return app