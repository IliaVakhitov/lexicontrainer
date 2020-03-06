from flask import Blueprint

bp = Blueprint('dicts', __name__)

from app.dicts import routes
