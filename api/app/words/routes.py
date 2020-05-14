""" Words. Methos to handle dicrionaries requests """

import json
import logging
from flask import request
from flask import current_app
from flask_httpauth import HTTPTokenAuth
from sqlalchemy import func
from app import db

from app.models import Word, User, Dictionary, LearningIndex
from app.models import WordSynonyms
from app.models import Synonyms, Definitions
from app.words import bp

from appmodel.words_api import WordsApi


token_auth = HTTPTokenAuth()


@token_auth.verify_token
def verify_token(token):
    """ Basic auth method """

    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    """ Basic auth method """

    logger.info('Token error')
    return current_app.send_static_file('index.html')


@bp.route('/random_words', methods=['GET'])
@token_auth.login_required
def random_words():
    """ Return 5 random words for current user """

    db_user = User.check_request(request)

    dictionaries = Dictionary.query.filter_by(user_id=db_user.id).all()
    dict_ids = [d.id for d in dictionaries]    
    words_query = db.session.query(Word).filter(Word.dictionary_id.in_(dict_ids)).\
        order_by(func.random()).limit(5).all()
    
    words = []
    for word in words_query:
        words.append(word.to_dict())
    
    return {'words': words}


@bp.route('/all_words', methods=['POST'])
@token_auth.login_required
def all_words():
    """ Return words for current user.
        All or for given dictionaries 
    """

    db_user = User.check_request(request)
    request_data = request.get_json()    
    
    if 'dictionary_id' in request_data:
        dictionary_id = request_data.get('dictionary_id')
        dict_ids = [dictionary_id]
    else:
        dictionaries = Dictionary.query.filter_by(user_id=db_user.id).all()
        dict_ids = [d.id for d in dictionaries]
    
    words_query = db.session.query(Word, Dictionary).\
        filter(Dictionary.id == Word.dictionary_id).\
        filter(Word.dictionary_id.in_(dict_ids)).\
        order_by('spelling').all()

    words = []
    for word_entry in words_query:
        word = word_entry[0]
        dictionary = word_entry[1]
        
        definitions_query = Definitions.query.filter_by(spelling=word.spelling).all()
        synonyms_query = Synonyms.query.filter_by(spelling=word.spelling).all()
        
        definitions = [d.definition for d in definitions_query]
        synonyms = [s.synonym for s in synonyms_query]

        words.append({
            'id': word.id, 
            'dictionary_id': word.dictionary_id, 
            'dictionary_name': dictionary.dictionary_name, 
            'spelling': word.spelling,
            'definition': word.definition,
            'synonyms': word.word_synonyms(),
            'all_definitions': definitions,
            'all_synonyms': synonyms,
            'progress': 0 if word.learning_index is None else word.learning_index.index
        })

    return {'words': words,
            'is_authenticated': db_user.is_authenticated()
            }


@bp.route('/get_definition', methods=['POST'])
@token_auth.login_required
def get_definition():
    """ Return definitions for current word from Definitions.
        If not, request definitions for current word from WordsApi
        Save result in Definitions
    """

    db_user = User.check_request(request)
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}

    request_data = request.get_json()

    spelling = request_data.get('spelling').lower()
    if not spelling:
        return {'error': 'No spelling in request'}

    # Check definitions table for current word
    definitions = Definitions.query.\
        filter_by(spelling=spelling).\
        order_by('definition').all()

    
    if definitions:  
        result = [d.definition for d in definitions]      
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
@token_auth.login_required
def get_synonyms():
    """ Return synonyms for current word from Synonyms.
        If not, request synonyms for current word from WordsApi
        Save result in Synonyms
    """

    
    db_user = User.check_request(request)
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}
    
    request_data = request.get_json()

    spelling = request_data.get('spelling').lower()
    if not spelling:
        return {'error': 'No spelling in request'}

    result = []

    # Check synonyms table for current word
    synonyms = Synonyms.query.\
        filter_by(spelling=spelling).\
        order_by('synonym').all()

    if synonyms:   
        result = [s.synonym for s in synonyms]     
        return json.dumps({'synonyms': result})
    
    # Get synonyms from online dictionary
    result_query = WordsApi.get_words_data(spelling, 'synonyms')
    if not result_query:
        return {'message': 'Error in requesting words api'}

    # Save synonyms in table for future requests
    synonyms = json.loads(result_query)
    result = []
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
    """ Add new word to db """

    db_user = User.check_request(request)
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}
        
    request_data = request.get_json()
    synonyms = request_data.get('synonyms')
    new_word = Word(
        spelling=request_data.get('spelling').strip(),
        definition=request_data.get('definition').strip(),
        dictionary_id=request_data.get('dictionary_id'))
    db.session.add(new_word)
    # Commit to save new word
    db.session.commit()
    
    # Add learning index
    learning_index = LearningIndex(word_id=new_word.id, index=0)
    db.session.add(learning_index)

    # Add synonyms
    if synonyms:
        for synonym in synonyms:
            db_synonym = WordSynonyms(word_id=new_word.id, synonym=synonym)
            db.session.add(db_synonym)
    
    db.session.commit()

    logger.info(f'Added word: {new_word.spelling}')

    return {'new_word_id': new_word.id}


@bp.route('/delete_word', methods=['DELETE'])
@token_auth.login_required
def delete_word():
    """ Delete word from DB """

    db_user = User.check_request(request)
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}
    
    request_data = request.get_json()
    
    word_entry = Word.query.\
        filter_by(id=request_data.get('word_id')).\
        first_or_404()

    spelling = word_entry.spelling
    db.session.delete(word_entry)
    db.session.commit()
    logger.info(f'Word deleted: {spelling}')    

    return {'success': True}


@bp.route('/update_word', methods=['POST'])
@token_auth.login_required
def update_word():
    """ Update word data """

    db_user = User.check_request(request)
    if not db_user or not db_user.is_authenticated():
        return {'message': 'Demo mode'}
    
    request_data = request.get_json()
    word_entry = Word.query.\
        filter_by(id=request_data.get('word_id')).\
        first_or_404()
    
    # Delete current synonyms
    for db_synonym in word_entry.synonyms.all(): 
        db.session.delete(db_synonym)   

    # Add new synonyms
    synonyms = request_data.get('synonyms')
    for synonym in synonyms:
        db_synonym = WordSynonyms(word_id=word_entry.id, synonym=synonym)
        db.session.add(db_synonym)
        
    word_entry.spelling = request_data.get('spelling').strip()
    word_entry.definition = request_data.get('definition').strip()
    word_entry.dictionary_id = int(request_data.get('dictionary_id'))
    if word_entry.learning_index is None:
        learning_index = LearningIndex(word_id=word_entry.id, index=0)
        db.session.add(learning_index)
    else:
        word_entry.learning_index.index = 0

    db.session.commit()
    logger.info(f'Word updated: {word_entry.spelling}')

    return {'success': True}


logger = logging.getLogger(__name__)

