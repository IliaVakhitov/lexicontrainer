from flask import request
from flask import g
from sqlalchemy import func
from flask_httpauth import HTTPBasicAuth
from flask_httpauth import HTTPTokenAuth
from flask_login import current_user, login_required, logout_user,login_user
from app import db
from app.models import User, Dictionary, Word, LearningIndex
from app.auth import bp
from app.errors.handlers import error_response


basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()


@token_auth.verify_token
def verify_token(token):
    current_user = User.check_token(token) if token else None
    return current_user is not None


@token_auth.error_handler
def token_auth_error():
    return error_response(401)


@basic_auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return False
    pwd_check = user.check_password(password)
    if pwd_check:
        login_user(user)

    return pwd_check 


@basic_auth.error_handler
def auth_error():
    return error_response(401)


@bp.route('/token', methods=['POST'])
@basic_auth.login_required
def get_token():
    token = current_user.get_token()
    db.session.commit()
    return {'token': token,
            'username': current_user.username}


@bp.route('/mock_user', methods=['GET'])
def mock_user():
    if not current_user.is_authenticated:
        db_user = User.query.filter_by(username='Test').first_or_404()
        login_user(db_user, remember=True)
        current_user = db_user
    return {'current_user': current_user.username}


@bp.route('/is_authenticated', methods=['GET'])
def is_authenticated():
    is_authenticated = current_user.is_authenticated if current_user else False 
    token = current_user.get_token() if is_authenticated else None 
    username = current_user.username if is_authenticated else None 
    return {'is_authenticated': is_authenticated,
            'username': username,
            'token': token}


@bp.route('/login', methods=['POST'])
def login():
    request_data = request.get_json()
    username = request_data.get('username')
    db_user = User.query.filter_by(username=username).first()
    if db_user is None:
        return {'error': f'User {username} not found!'}

    if db_user.check_password(request_data.get('password')):
        return {'error': 'Invalid password!'}
        
    login_user(db_user, remember=request_data.get('remember_me'))
    return {'message': 'Login successful'}


@bp.route('/logout', methods=['POST'])
def logout():
    current_user.revoke_token()
    db.session.commit()
    logout_user()
    return {'message': 'Logout successfull'} 

@bp.route('/register', methods=['POST'])
def register():
    # TODO
    return {'message': 'Page not available'} 


@bp.route('/user/', methods=['GET'])
@token_auth.login_required
def user():
    """
    Return information about user
    """

    username = request_data.get('username')
    user = User.query.filter_by(username=username).first_or_404()
    dictionaries = Dictionary.query.filter_by(user_id=current_user.id).all()
    dict_ids = [d.id for d in dictionaries]
    words = Word.query.filter(Word.dictionary_id.in_(dict_ids)).all()
    total_words = len(words)
    words_ids = [w.id for w in words]
    words_learned = LearningIndex.query.filter(LearningIndex.word_id.in_(words_ids)).filter_by(index=100).count()
    total_dictionaries = len(dictionaries)
    learning_index_list = LearningIndex.query.filter(LearningIndex.word_id.in_(words_ids)).all()
    index_progress = 0
    for li_entry in learning_index_list:
        index_progress += li_entry.index
    progress = round(index_progress / total_words, 2)
    return {'username': username,
            'total_dictionaries': total_dictionaries,
            'total_words': total_words,
            'words_learned': words_learned,
            'progress': progress}
