""" Dictionaries. Methos to handle dicrionaries requests """

import logging
from flask import request
from flask import current_app
from flask_httpauth import HTTPTokenAuth

from app.dicts import bp
from app.models import User, Dictionary
from app import db


token_auth = HTTPTokenAuth()


@token_auth.verify_token
def verify_token(token):
    """Basic auth method"""

    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    """Basic auth method"""

    logger.info('Token error')
    return current_app.send_static_file('index.html')


@bp.route('/dictionaries_list', methods=['GET'])
@token_auth.login_required
def dictionaries_list():
    """ List of dictionaries of current user """

    db_user = User.check_request(request)   
    
    db_dictionaries = Dictionary.query\
        .filter_by(user_id=db_user.id)\
        .order_by('dictionary_name')

    dicts = []
    for db_dictionary in db_dictionaries:
        dict_entry = {
            'id': db_dictionary.id,
            'dictionary_name': db_dictionary.dictionary_name,
        }        
        dicts.append(dict_entry)
        
    return {'dictionaries': dicts,
            'is_authenticated': db_user.is_authenticated()
            }


@bp.route('/dictionaries', methods=['GET'])
@token_auth.login_required
def dictionaries():
    """ List of dictionaries of current user with words """
    
    db_user = User.check_request(request)  
    
    db_dictionaries = Dictionary.query\
        .filter_by(user_id=db_user.id)\
        .order_by('dictionary_name')

    dicts = []
    for db_dictionary in db_dictionaries:
        progress = 0
        words = []
        for w in db_dictionary.words.all():
            progress += w.learning_index.index \
                if w.learning_index is not None else 0
            words.append({
                'id': w.id, 
                'spelling': w.spelling
            })
        if len(words) > 0:
            progress = progress / len(words)

        dict_entry = {
            'id': db_dictionary.id,
            'dictionary_name': db_dictionary.dictionary_name,
            'description': db_dictionary.description,
            'words': words,
            'progress': progress
        }        
        dicts.append(dict_entry)
        
    return {'dictionaries': dicts,
            'is_authenticated': db_user.is_authenticated()
            }


@bp.route('/add_dictionary', methods=['POST'])
@token_auth.login_required
def add_dictionary():
    """ Add new dictionary into db """

    db_user = User.check_request(request)    
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}

    request_data = request.get_json()
    dictionary_name = request_data.get('dictionary_name').strip()
    dictionary_description = request_data.get('dictionary_description').strip()
    dictionary_entry = Dictionary(
        dictionary_name=dictionary_name,
        description=dictionary_description,
        user_id=db_user.id)
    db.session.add(dictionary_entry)
    db.session.commit()
    logger.info(f'Dictionary {dictionary_entry.dictionary_name} saved')

    return {'result': 'Dictionary added successfully'}


@bp.route('/delete_dictionary', methods=['DELETE'])
@token_auth.login_required
def delete_dictionary():
    """ Delete dictionary from db """

    db_user = User.check_request(request)
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}

    dictionary_id = request.get_json().get('dictionary_id')
    dictionary_entry = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    
    logger.info(f'Dictionary {dictionary_entry.dictionary_name} deleted')
    
    db.session.delete(dictionary_entry)
    db.session.commit()

    return {'result': 'Dictionary deleted successfully'}

@bp.route('/update_dictionary', methods=['POST'])
@token_auth.login_required
def update_dictionary():
    """ Update dictioary inforamtion """

    db_user = User.check_request(request)
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}

    request_data = request.get_json()
    dictionary_id = request_data.get('dictionary_id')
    dictionary_entry = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    dictionary_entry.dictionary_name = request_data.get('dictionary_name').strip()
    dictionary_entry.description = request_data.get('description').strip()
    db.session.commit()

    logger.info(f'Dictionary {dictionary_entry.dictionary_name} updated')

    return {'result': 'Dictionary updated successfully'}

@bp.route('/dictionary', methods=['POST'])
@token_auth.login_required
def dictionary():
    """ Return dictionary information """

    db_user = User.check_request(request)
    request_data = request.get_json()
    dictionary_id = request_data.get('dictionary_id')
    db_dictionary = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    dict_entry = db_dictionary.to_dict()  
    dict_entry['is_authenticated'] = db_user.is_authenticated()
    return dict_entry


@bp.route('/check_dictionary_name', methods=['POST'])
def check_dictionary_name():
    """ Check if new dictionary name is available"""

    dictionary_name = request.get_json().get('dictionary_name')
    dictionary_entry = Dictionary.query.\
        filter_by(dictionary_name=dictionary_name).first()
        
    return {'result': dictionary_entry is None}


logger = logging.getLogger(__name__)

