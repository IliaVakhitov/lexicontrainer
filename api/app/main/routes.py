import json
import logging
from flask_login import login_required, current_user
from flask import render_template
from flask import url_for
from flask import request
from flask import redirect
from flask import flash
from flask import jsonify

from app.models import Dictionary, Definitions, LearningIndex
from app.models import Word
from app.main import bp
from app import db
from appmodel.words_api import WordsApi
from datetime import datetime


@bp.route('/')
@bp.route('/index')
@login_required
# TODO make index do not require login
# TODO add page with information and link to login
def index():
    return render_template('index.html', title='Home')


@bp.route('/time', methods=['GET'])
def get_time():
    return {'current_time': datetime.now()}

logger = logging.getLogger(__name__)

