import time
from flask import request
from flask_httpauth import HTTPBasicAuth
from flask_httpauth import HTTPTokenAuth
from app import db
from app.models import User, Dictionary, Word, LearningIndex
from app.auth import bp
from app.errors.handlers import error_response


basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()


@token_auth.verify_token
def verify_token(token):
    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    return error_response(401)


@basic_auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return False
    password_check = user.check_password(password)
    
    return password_check 


@basic_auth.error_handler
def auth_error():
    return error_response(401)


@bp.route('/token', methods=['POST'])
@basic_auth.login_required
def get_token():
    username = request.get_json().get('username')
    curr_user = User.query.filter_by(username=username).first()
    token = curr_user.get_token()
    db.session.commit()
    return {'token': token,
            'username': curr_user.username}


@bp.route('/is_authenticated', methods=['GET'])
def is_authenticated():
    curr_user = User.check_request(request)
    is_authenticated = curr_user is not None
    username = curr_user.username if is_authenticated else None 
    return {'is_authenticated': is_authenticated,
            'username': username}


@bp.route('/logout', methods=['POST'])
@token_auth.login_required
def logout():
    curr_user = User.check_request(request)
    if curr_user:
        curr_user.revoke_token()
        db.session.commit()
    return {'message': 'Logout successfull'} 


@bp.route('/register', methods=['POST'])
def register():
    request_data = request.get_json()
    new_user = User(username=request_data.get('username'))
    new_user.secret_question = request_data.get('secret_question')
    new_user.set_password(request_data.get('password'))
    new_user.set_secret_answer(request_data.get('secret_answer'))
    db.session.add(new_user)
    db.session.commit()
    token = new_user.get_token()
    db.session.commit()
    return {'token': token,
            'username': new_user.username} 


@bp.route('/user', methods=['GET'])
@token_auth.login_required
def user():
    """
    Return information about user
    """

    # System delay
    #time.sleep(1)

    user = User.check_request(request)
    
    # All user dictionaries
    dictionaries = Dictionary.query.filter_by(user_id=user.id).all()
    dict_ids = [d.id for d in dictionaries]

    # All words from all dictionaries
    words = Word.query.filter(Word.dictionary_id.in_(dict_ids)).all()
    total_words = len(words)
    words_ids = [w.id for w in words]
    words_learned = LearningIndex.query.\
        filter(LearningIndex.word_id.in_(words_ids)).\
        filter_by(index=100).count()
    total_dictionaries = len(dictionaries)

    # Calculating total progress
    learning_index_list = LearningIndex.query.filter(LearningIndex.word_id.in_(words_ids)).all()
    index_progress = 0
    for li_entry in learning_index_list:
        index_progress += li_entry.index
    if total_words > 0:
        progress = round(index_progress / total_words, 2)
    else:
        progress = 0
    return {'username': user.username,
            'dictionaries': total_dictionaries,
            'words': total_words,
            'words_learned': words_learned,
            'progress': progress}

