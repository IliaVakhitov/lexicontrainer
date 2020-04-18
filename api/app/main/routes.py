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
from flask import current_app


@bp.route('/')
@bp.route('/index')
def index():
    logger.info('1')
    return current_app.send_static_file('index.html')


@bp.route('/time', methods=['GET'])
def get_time():
    return {'current_time': datetime.now()}


logger = logging.getLogger(__name__)

