import json
import logging

from flask import request
from flask_httpauth import HTTPTokenAuth


from app import db
from app.errors.handlers import error_response
from app.games import bp
from app.models import CurrentGame, Statistic, User, Word

from appmodel.game_generator import GameGenerator
from appmodel.game_type import GameType

token_auth = HTTPTokenAuth()


@token_auth.verify_token
def verify_token(token):
    """ Basic auth method """

    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    """ Basic auth method """
    
    return error_response(401)


@bp.route('/check_current_game', methods=['GET'])
@token_auth.login_required
def check_current_game():
    """ Check if uncompleted game is saved """

    db_user = User.check_request(request)
    revision_game_entry = CurrentGame.query.filter_by(
        user_id=db_user.id).first()

    if revision_game_entry is None:
        return {'current_game' : False,
                'progress':0,
                'game_type': ''}

    return {'current_game': True,
            'progress': revision_game_entry.get_progress(),
            'date_started': revision_game_entry.game_date_started,
            'game_type': GameType[revision_game_entry.game_type].value
            }


@bp.route('/save_current_game', methods=['POST'])
@token_auth.login_required
def save_current_game():
    """ Save state for current game if not finished
        Update learning index for words in the game
        Update statistic table if game finished
    """

    db_user = User.check_request(request)
    
    revision_game_entry = CurrentGame.query.filter_by(
        user_id=db_user.id).first()

    if revision_game_entry is None:
        return {'result': 'Error! No current game!'}

    request_data = request.get_json()
    current_round = request_data.get('current_round')
    correct_answers = request_data.get('correct_answers')

    # Update learning index for given answers
    if db_user.is_authenticated():
        logger.info('Saving words')
        words_update = request_data.get('words_update')
        for word in words_update:
            word_entry = Word.query.filter_by(id=word['word_id']).first()
            word_entry.update_learning_index(word['correct'])        
            logger.info(f'Word: {word_entry.spelling}, ' +
                        f'new index: {word_entry.learning_index.index}')

        db.session.commit()

    # Save state to continue
    if current_round < revision_game_entry.total_rounds:
        revision_game_entry.current_round = current_round
        revision_game_entry.correct_answers = correct_answers
        db.session.commit()
        logger.info('Game saved')
        return {'result': 'Game saved!'}
    
    #Update statistic table and delete current game
    revision_game_entry.update_statistic(correct_answers)
    logger.info('Game finished. Statistic updated.')

    return {'result': 'Game finished!'}

@bp.route('/remove_game', methods=['DELETE'])
@token_auth.login_required
def remove_game():
    """ Delete current game entry """

    db_user = User.check_request(request)
    
    revision_game_entry = CurrentGame.query.filter_by(
        user_id=db_user.id).first()

    if revision_game_entry is not None:
        db.session.delete(revision_game_entry)
        db.session.commit()
    return {'result': 'Game was removed succesfully'}


@bp.route('/define_game', methods=['POST'])
@token_auth.login_required
def define_game():
    """ Create new game with defined parameters """

    db_user = User.check_request(request)
    logger.info(f'User \'{db_user.username}\' auth successful')

    revision_game_entry = CurrentGame.query.\
        filter_by(user_id=db_user.id).first()

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

    # Generate game
    result = GameGenerator.generate_game(
        db_user.id,
        game_type,
        dictionaries_list,
        word_limit,
        include_learned_words,
    )

    if not result:
        logger.info('Could not create game!')
        return {'result': 'Could not create game!'\
                'Not enough words to create game! Try to add dictionaries!'}

    return {'result': result}


@bp.route('/current_game', methods=['GET'])
@token_auth.login_required
def current_game():
    """ Return current game entry"""
    
    db_user = User.check_request(request)
    revision_game_entry = CurrentGame.query.filter_by(user_id=db_user.id).first()
    if revision_game_entry is None:
        return {'error': 'No current game!'}

    return revision_game_entry.get_current_game()


@bp.route('/statistic', methods=['POST'])
@token_auth.login_required
def statistic():
    """ Return statistic for current game.
        Add entry to Statistic
        Delete current game
    """

    db_user = User.check_request(request)
    revision_game_entry = CurrentGame.query.\
        filter_by(user_id=db_user.id).first()
    if revision_game_entry is None:
        revision_game_entry = CurrentGame.query.\
            filter_by(user_id=db_user.id).first()
        if revision_game_entry is None:
            return {'redirect': '/games'}
        else:
            return {'redirect': '/play'}

    total_rounds = revision_game_entry.total_rounds
    correct_answers = revision_game_entry.correct_answers

    # Update statistic table
    statistic_entry = Statistic(user_id=db_user.id)
    statistic_entry.game_type = revision_game_entry.game_type
    statistic_entry.total_rounds = total_rounds
    statistic_entry.correct_answers = correct_answers
    
    if db_user and db_user.is_authenticated():
        db.session.add(statistic_entry)
    
    db.session.delete(revision_game_entry)
    db.session.commit()

    return {'total_rounds': total_rounds,
            'correct_answers': correct_answers,
            'game_type': GameType[revision_game_entry.game_type].value}


logger = logging.getLogger(__name__)
