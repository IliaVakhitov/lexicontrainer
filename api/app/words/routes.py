import time
import json
import logging
from flask import request
from flask_httpauth import HTTPTokenAuth

from app.models import Word, User, Dictionary, LearningIndex
from app.models import Synonyms, Definitions
from app.words import bp
from app import db
from appmodel.words_api import WordsApi
from datetime import datetime
from app.errors.handlers import error_response

token_auth = HTTPTokenAuth()

@token_auth.verify_token
def verify_token(token):
    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    return error_response(401)

@bp.route('/all_words', methods=['GET'])
@token_auth.login_required
def all_words():
    
    user = User.check_request(request)

    dictionaries = Dictionary.query.filter_by(user_id=user.id).all()
    dict_ids = [d.id for d in dictionaries]
    words_query = Word.query.\
        filter(Word.dictionary_id.in_(dict_ids)).\
        order_by('spelling').all()

    words = [word.to_dict() for word in words_query]
    return {'words': words}


@bp.route('/get_definition', methods=['POST'])
@token_auth.login_required
def get_definition():

    # System delay
    time.sleep(1)

    user = User.check_request(request)
    request_data = request.get_json()

    spelling = request_data.get('spelling')
    if not spelling:
        return {'error': 'No spelling in request'}

    # Check definitions table for current word
    definitions = Definitions.query.\
        filter_by(spelling=spelling).\
        order_by('definition').all()

    result = []
    if definitions:        
        for definition in definitions:
            result.append(definition.definition)
        return json.dumps({'definitions': result})

    # Get definitions from online dictionary
    result_query = WordsApi.get_words_data(spelling, 'definitions')
    if not result_query:
        return {'message': 'Error in requesting words api'}

    # Save definitions in table for future requests
    definitions = json.loads(result_query)
    result = []
    for definition in definitions['definitions']:
        result.append(definition['definition'])
        definition_entry = Definitions(
            spelling=spelling, 
            definition=definition['definition'])
        db.session.add(definition_entry)
    db.session.commit()

    return json.dumps({'definitions': result})


@bp.route('/get_synonyms', methods=['POST'])
#@token_auth.login_required
def get_synonyms():

    # System delay
    time.sleep(1)

    user = User.check_request(request)
    request_data = request.get_json()

    spelling = request_data.get('spelling')
    if not spelling:
        return {'error': 'No spelling in request'}

    result = []

    # Check synonyms table for current word
    synonyms = Synonyms.query.\
        filter_by(spelling=spelling).\
        order_by('synonym').all()

    if synonyms:        
        for synonym in synonyms:
            result.append(synonym.synonym)
        return json.dumps({'synonyms': result})
    
    # Get synonyms from online dictionary
    result_query = WordsApi.get_words_data(spelling, 'synonyms')
    if not result_query:
        return {'message': 'Error in requesting words api'}

    # Save synonyms in table for future requests
    synonyms = json.loads(result_query)
    for synonym in synonyms['synonyms']:
        result.append(synonym)
        synonym_entry = Synonyms(
            spelling=spelling, 
            synonym=synonym)
        db.session.add(synonym_entry)
    db.session.commit()

    return json.dumps({'synonyms': result})


@bp.route('/add_word', methods=['POST'])
@token_auth.login_required
def add_word():
    user = User.check_request(request)
    request_data = request.get_json()
    new_word = Word(
        spelling=request_data.get('spelling').strip(),
        definition=request_data.get('definition').strip(),
        dictionary_id=request_data.get('dictionary_id'))
    db.session.add(new_word)
    db.session.commit()

    return {'new_word_id': new_word.id}


@bp.route('/delete_word', methods=['DELETE'])
@token_auth.login_required
def delete_word():
    user = User.check_request(request)
    request_data = request.get_json()
    
    word_entry = Word.query.filter_by(id=request_data.get('word_id')).first_or_404()
    if word_entry.learning_index is not None:
        db.session.delete(word_entry.learning_index)
    db.session.delete(word_entry)
    db.session.commit()

    return {'success': True}


@bp.route('/update_word', methods=['POST'])
@token_auth.login_required
def update_word():
    user = User.check_request(request)
    request_data = request.get_json()
    word_entry = Word.query.filter_by(id=request_data.get('word_id')).first_or_404()
    word_entry.spelling = request_data.get('spelling').strip()
    word_entry.definition = request_data.get('definition').strip()
    if word_entry.learning_index is None:
        learning_index = LearningIndex(word_id=word_entry.id, index=0)
        db.session.add(learning_index)
    else:
        word_entry.learning_index.index = 0
    db.session.commit()

    return {'success': True}


# Additional functions 
#@bp.route('/update_defitions_table', methods=['GET'])
def update_defitions_table():
    definitions = db.session.query(Definitions, Word).\
        filter(Definitions.word_id == Word.id).all()
    for definition in definitions:
        definition[0].spelling = definition[1].spelling
    db.session.commit()
    return {'result': 'success'}

