""" Auth methods """

import logging
from flask import request
from flask import current_app
from flask_httpauth import HTTPBasicAuth
from flask_httpauth import HTTPTokenAuth
from app import db
from app.models import User, Dictionary, Word, LearningIndex
from app.auth import bp


basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()


@token_auth.verify_token
def verify_token(token):
    """ Basic auth method """

    curr_user = User.check_token(token) if token else None
    
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    """ Basic auth method """
    logger.info('Token auth error')
    return current_app.send_static_file('index.html')


@basic_auth.verify_password
def verify_password(username, password):
    """ Basic auth method """

    db_user = User.query.filter_by(username=username).first()
    if db_user is None:
        logger.info(f'User not found {username}')
        return False
    password_check = db_user.check_password(password)
    
    return password_check 


@basic_auth.error_handler
def auth_error():
    """ Basic auth method """

    logger.info('Auth error')
    return current_app.send_static_file('index.html')



@bp.route('/token', methods=['POST'])
@basic_auth.login_required
def get_token():
    """ Create new token for user """

    username = request.get_json().get('username')
    curr_user = User.query.filter_by(username=username).first()
    logger.info(f'Checking user token {username}')
    token = curr_user.get_token()
    db.session.commit()
    return {'token': token,
            'username': curr_user.username
            }


@bp.route('/is_authenticated', methods=['GET'])
def is_authenticated():
    """ Check if token for is not expired """

    curr_user = User.check_request(request)
    user_is_authenticated = curr_user.is_authenticated()
    username = curr_user.username if user_is_authenticated else None 
    return {'is_authenticated': user_is_authenticated,
            'username': username
            }


@bp.route('/logout', methods=['POST'])
@token_auth.login_required
def logout():
    """ Revoke user token """

    curr_user = User.check_request(request)
    if curr_user:
        curr_user.revoke_token()
        db.session.commit()

    return {'message': 'Logout successfull'} 


@bp.route('/register', methods=['POST'])
def register():
    """ Create new user entry and new token for user """

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
            'username': new_user.username
            } 


@bp.route('/user', methods=['GET'])
@token_auth.login_required
def user():
    """ Return information about user """

    db_user = User.check_request(request)
    
    # All user dictionaries
    dictionaries = Dictionary.query.filter_by(user_id=db_user.id).all()
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
    return {'username': db_user.username,
            'dictionaries': total_dictionaries,
            'words': total_words,
            'words_learned': words_learned,
            'progress': progress
            }


@bp.route('/admin', methods=['POST'])
def admin():
    pass


logger = logging.getLogger(__name__)

