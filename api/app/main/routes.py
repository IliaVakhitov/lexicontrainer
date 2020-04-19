import logging
from datetime import datetime
from flask import current_app
from app.main import bp


@bp.route('/')
@bp.route('/index')
def index():
    return current_app.send_static_file('index.html')


@bp.route('/time', methods=['GET'])
def get_time():
    return {'current_time': datetime.now()}


logger = logging.getLogger(__name__)
