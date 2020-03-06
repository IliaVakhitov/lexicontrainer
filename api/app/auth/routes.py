from flask import request
from sqlalchemy import func
from werkzeug.urls import url_parse
from flask_login import current_user, login_user, logout_user, login_required
from app import db
from app.models import User, Dictionary, Word, LearningIndex
from app.auth import bp


@bp.route('/login', methods=['GET', 'POST'])
def login():
    # TODO
    return {'message': 'Page not available'} 


@bp.route('/logout')
def logout():
    # TODO
    return {'message': 'Page not available'} 

@bp.route('/register', methods=['GET', 'POST'])
def register():
    # TODO
    return {'message': 'Page not available'} 

@bp.route('/user/<username>')
@login_required
def user(username):
    """
    Return information about user
    """

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
