import time
import json
import logging
from flask import request

from flask import jsonify
from flask_httpauth import HTTPTokenAuth
from app.errors.handlers import error_response

from app.dicts import bp
from app.models import User, Dictionary, Word, Definitions, Synonyms
from app import db
from datetime import datetime

token_auth = HTTPTokenAuth()

@token_auth.verify_token
def verify_token(token):
    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    return error_response(401)

@bp.route('/dictionaries', methods=['GET'])
@token_auth.login_required
def dictionaries():
    """
    List of dictionaries of current user
    """
    
    # System delay
    #time.sleep(1)

    user = User.check_request(request)    
    dictionaries = Dictionary.query\
        .filter_by(user_id=user.id)\
        .order_by('dictionary_name')

    dicts = []
    for dictionary in dictionaries:
        dict_entry = dictionary.to_dict()        
        words = [{
            'id': w.id, 
            'spelling': w.spelling
        } for w in dictionary.words.all()]
        dict_entry['words'] = words
        dicts.append(dict_entry)
    return {'dictionaries': dicts}


@bp.route('/add_dictionary', methods=['POST'])
@token_auth.login_required
def add_dictionary():
    user = User.check_request(request)
    request_data = request.get_json()
    dictionary_name = request_data.get('dictionary_name').strip()
    dictionary_description = request_data.get('dictionary_description').strip()
    dictionary_entry = Dictionary(
        dictionary_name=dictionary_name,
        description=dictionary_description,
        user_id=user.id)
    db.session.add(dictionary_entry)
    db.session.commit()
    # logger.info(f'Dictionary {dictionary_entry.dictionary_name} saved')

    return {'result': 'Dictionary added successfully'}


@bp.route('/delete_dictionary', methods=['DELETE'])
@token_auth.login_required
def delete_dictionary():
    user = User.check_request(request)
    dictionary_id = request.get_json().get('dictionary_id')
    dictionary_entry = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    db.session.delete(dictionary_entry)
    db.session.commit()

    return {'result': 'Dictionary deleted successfully'}

@bp.route('/update_dictionary', methods=['POST'])
@token_auth.login_required
def update_dictionary():
    user = User.check_request(request)
    request_data = request.get_json()
    dictionary_id = request_data.get('dictionary_id')
    dictionary_entry = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    dictionary_entry.dictionary_name = request_data.get('dictionary_name').strip()
    dictionary_entry.description = request_data.get('description').strip()
    db.session.commit()

    return {'result': 'Dictionary updated successfully'}

@bp.route('/dictionary', methods=['GET'])
@token_auth.login_required
def dictionary():

    # System delay
    #time.sleep(1)
    
    user = User.check_request(request)
    dictionary_id = request.headers.get('dictionary_id')
    dictionary = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    dict_entry = dictionary.to_dict()  
    words = []
    for word in dictionary.words.all():
        definitions = []
        synonyms = []
        definitions_query = Definitions.query.filter_by(spelling=word.spelling).all()
        synonyms_query = Synonyms.query.filter_by(spelling=word.spelling).all()
        for definition in definitions_query:
            definitions.append(definition.definition)
        for synonym in synonyms_query:
            synonyms.append(synonym.synonym)
        
        words.append({
            'id': word.id, 
            'spelling': word.spelling,
            'definition': word.definition,
            'definitions': definitions,
            'synonyms': synonyms,
            'progress': 0 if word.learning_index is None else word.learning_index.index
        })

    dict_entry['words'] = words
    
    return dict_entry


@bp.route('/check_dictionary_name', methods=['GET'])
def check_dictionary_name():
    dictionary_name = request.get_json().get('dictionary_name')
    dictionary_entry = Dictionary.query.filter_by(dictionary_name=dictionary_name).first()
    return {'name_available': dictionary_entry is None}
