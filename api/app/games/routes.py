import json
import logging
import time

from flask import request
from flask_httpauth import HTTPTokenAuth
from sqlalchemy import func

from app import db
from app.errors.handlers import error_response
from app.games import bp
from app.models import (CurrentGame, Dictionary, LearningIndex, Statistic,
                        User, Word)
from appmodel.game_generator import GameGenerator
from appmodel.game_type import GameType

token_auth = HTTPTokenAuth()


@token_auth.verify_token
def verify_token(token):
    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    return error_response(401)


@bp.route('/check_current_game', methods=['GET'])
@token_auth.login_required
def check_current_game():
    user = User.check_request(request)
    revision_game_entry = CurrentGame.query.filter_by(
        user_id=user.id, game_completed=False).first()

    if revision_game_entry is None:
        return {'current_game' : False,
                'progress':0,
                'game_type': ''}

    return {'current_game': True,
            'progress': revision_game_entry.get_progress(),
            'game_type': revision_game_entry.game_type}


@bp.route('/remove_game', methods=['DELETE'])
@token_auth.login_required
def remove_game():
    user = User.check_request(request)
    revision_game_entry = CurrentGame.query.filter_by(
        user_id=user.id, game_completed=False).first()

    if revision_game_entry is not None:
        db.session.delete(revision_game_entry)
        db.session.commit()
    return {'result': 'Game was removed succesfully'}


@bp.route('/define_game', methods=['POST'])
@token_auth.login_required
def define_game():

    user = User.check_request(request)
    revision_game_entry = CurrentGame.query.filter_by(
        user_id=user.id, game_completed=False).first()


    # Remove previous game
    if revision_game_entry is not None:
        db.session.delete(revision_game_entry)
        db.session.commit()

    # Game parameters from page
    request_data = request.get_json()
    game_type = GameType[request_data.get('game_type').strip()]
    word_limit = int(request_data.get('game_rounds'))
    include_learned_words = request_data.get('include_learned_words')
    dictionaries_list = request_data.get('dictionaries')

    if len(dictionaries_list) == 0:
        # All dictionaries
        dictionaries = Dictionary.query.filter_by(
            user_id=user.id).order_by('dictionary_name')
        # IDs need to make filter in words query
        dict_ids = [d.id for d in dictionaries]
    else:
        # If need to filter dictionaries
        dict_ids = [dictionary['key'] for dictionary in dictionaries_list]
        dictionaries = Dictionary.query.\
            filter_by(user_id=user.id).\
            filter(Dictionary.id.in_(dict_ids)).\
            order_by('dictionary_name')

    words_query = db.session.query(Word).filter(Word.dictionary_id.in_(dict_ids))

    if not include_learned_words:
        words_query = words_query.\
            join(LearningIndex, LearningIndex.word_id == Word.id).\
            filter(LearningIndex.index < 100)

    # Getting random order and limit is defined
    words_query = words_query.order_by(func.random()).all()

    # Generate game from given list of words
    revision_game = GameGenerator.generate_game(words_query, game_type, word_limit)
    if revision_game is None:
        logger.info('Could not create game!')
        return {'result': 'Could not create game!'\
                'Not enough words to create game! Try to add dictionaries!'}

    # Entry of current game to continue if not finished
    revision_game_entry = CurrentGame()
    revision_game_entry.game_type = game_type.name
    revision_game_entry.game_data = json.dumps(revision_game.to_json())
    revision_game_entry.user_id = user.id
    revision_game_entry.total_rounds = revision_game.total_rounds
    revision_game_entry.current_round = 0
    db.session.add(revision_game_entry)
    db.session.commit()

    return {'result': 'result'}

@bp.route('/next_round', methods=['GET'])
@token_auth.login_required
def next_round():

    # System delay
    time.sleep(0.1)

    user = User.check_request(request)
    revision_game_entry = CurrentGame.query.filter_by(user_id=user.id, game_completed=False).first()
    game_ended = revision_game_entry.get_next_round()
    if game_ended:
        return {'redirect': '/statistic'}

    return {'game_type':revision_game_entry.game_type,
            'progress':revision_game_entry.get_progress(),
            'game_round':revision_game_entry.get_current_round(False)}


@bp.route('/current_round', methods=['GET'])
@token_auth.login_required
def current_round():

    # System delay
    time.sleep(0.3)

    user = User.check_request(request)
    revision_game_entry = CurrentGame.query.filter_by(user_id=user.id, game_completed=False).first()
    return {'game_type':revision_game_entry.game_type,
            'progress':revision_game_entry.get_progress(),
            'game_round':revision_game_entry.get_current_round(False)}


@bp.route('/check_answer', methods=['POST'])
@token_auth.login_required
def check_answer():

    # System delay
    #time.sleep(0.5)

    user = User.check_request(request)
    answer_index = request.get_json().get('answer_index')
    revision_game_entry = CurrentGame.query.filter_by(user_id=user.id, game_completed=False).first()
    return {'correct_index': revision_game_entry.get_correct_index(answer_index),
            'progress': revision_game_entry.get_progress()}


@bp.route('/statistic/', methods=['GET'])
@token_auth.login_required
def statistic():

    user = User.check_request(request)
    revision_game_entry = CurrentGame.query.\
        filter_by(user_id=user.id, game_completed=True).first()
    if revision_game_entry is None:
        revision_game_entry = CurrentGame.query.\
            filter_by(user_id=user.id, game_completed=False).first()
        if revision_game_entry is None:
            return {'redirect': '/games'}
        else:
            return {'redirect': '/play'}

    total_rounds = revision_game_entry.total_rounds
    correct_answers = revision_game_entry.correct_answers

    # Update statistic table
    statistic_entry = Statistic(user_id=user.id)
    statistic_entry.game_type = revision_game_entry.game_type
    statistic_entry.total_rounds = total_rounds
    statistic_entry.correct_answers = correct_answers

    db.session.add(statistic_entry)
    db.session.delete(revision_game_entry)
    db.session.commit()

    return {'total_rounds': total_rounds,
            'correct_answers': correct_answers,
            'game_type': revision_game_entry.game_type}


logger = logging.getLogger(__name__)
