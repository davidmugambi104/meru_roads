import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-123')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost/meru_roads')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-super-secret')
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_BUCKET_NAME = 'meru-roads-media'
    FACEBOOK_ACCESS_TOKEN = os.getenv('FB_ACCESS_TOKEN')
    FACEBOOK_PAGE_ID = os.getenv('FB_PAGE_ID')
    CELERY_BROKER_URL = os.getenv('CELERY_BROKER', 'redis://localhost:6379/0')