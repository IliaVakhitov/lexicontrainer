""" Database model and methods to handle data """

import json
import os
import base64
from datetime import datetime, timedelta
from typing import List
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

from appmodel.game_type import GameType



class LearningIndex(db.Model):
    """ Shows user progress in emembering word 0 < index < 100 """

    __tablename__ = 'learning_index'

    id = db.Column(db.Integer, primary_key=True)
    index = db.Column(db.Integer, default=0)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'))


class Synonyms(db.Model):
    """ Synonyms from words api for cache """

    __tablename__ = 'synonyms'

    id = db.Column(db.Integer, primary_key=True)
    spelling = db.Column(db.String(250), index=True)
    synonym = db.Column(db.String(250))

    @staticmethod
    def synonyms(limit: int = 0) -> List[str]:
        """ Return list of synonyms as list of string """
        
        if limit and limit > 0:
            query_result = Synonyms.query.limit(limit).all()
        else:
            query_result = Synonyms.query.all()

        result = [entry.synonym for entry in query_result]
        return result


class Definitions(db.Model):
    """ Definitions from words api for cache """

    __tablename__ = 'definitions'

    id = db.Column(db.Integer, primary_key=True)
    spelling = db.Column(db.String(250), index=True)
    definition = db.Column(db.String(550))
    
    @staticmethod
    def definitions(limit: int = 0):
        """ Return list of definitions as list of string """

        if limit and limit > 0:
            query_result = Definitions.query.limit(limit).all()
        else:
            query_result = Definitions.query.all()

        result = [entry.definition for entry in query_result]
        return result


class Dictionary(db.Model):
    """ Stores words list. Owned by user """

    __tablename__ = 'dictionaries'

    id = db.Column(db.Integer, primary_key=True)
    dictionary_name = db.Column(db.String(128))
    description = db.Column(db.String(250))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    words = db.relationship('Word', 
                            cascade='all,delete',
                            lazy='dynamic',
                            order_by='Word.spelling')            

    def __repr__(self):
        return f'{self.dictionary_name}'

    def to_dict(self):
        return {'id': self.id,
                'dictionary_name': self.dictionary_name,
                'description': self.description}


class Word(db.Model):
    """ Word represented as pair Spellng-Definition """

    __tablename__ = 'words'

    id = db.Column(db.Integer, primary_key=True)
    dictionary_id = db.Column(db.Integer, db.ForeignKey('dictionaries.id'))
    spelling = db.Column(db.String(128))
    definition = db.Column(db.String(550))
    synonyms = db.relationship('WordSynonyms', 
                               cascade='all,delete',
                               lazy='dynamic')

    learning_index = db.relationship('LearningIndex',
                                     cascade='all,delete',
                                     uselist=False)

    def __repr__(self):
        return f'<{self.spelling}>'

    def to_dict(self):
        synonyms = []
        if self.synonyms:
            synonyms = [s.synonym for s in self.synonyms.all()]
        return {'id': self.id,
                'spelling': self.spelling,
                'definition': self.definition,
                'synonyms': synonyms,
                'dictionary_id': self.dictionary_id,
                'learning_index': 0 if self.learning_index is None else self.learning_index.index
                }

    def update_learning_index(self, correct):
        """ Update learning index. Create entry if it is None """

        learning_index = self.learning_index
        if learning_index is None:
            learning_index = LearningIndex(word_id=self.word_id, index=0)
            db.session.add(learning_index)
        if correct:
            learning_index.index += 10 if learning_index.index <= 90 else 0
        else:
            learning_index.index -= 10 if learning_index.index > 10 else 0    
     

class WordSynonyms(db.Model):
    """ Synonyms for words, which user selected """

    __tablename__ = 'word_synonyms'

    id = db.Column(db.Integer, primary_key=True)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'))
    synonym = db.Column(db.String(250))

    def __repr__(self):
        return f'{self.synonym}'

class User(db.Model):
    """ Users table. Methods used for auth """

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    token = db.Column(db.String(32), index=True, unique=True)
    token_expiration = db.Column(db.DateTime)
    secret_question = db.Column(db.String(128))
    secret_answer_hash = db.Column(db.String(128))
    dictionaries = db.relationship('Dictionary',
                                   cascade='all,delete',
                                   backref='Owner',
                                   lazy='dynamic',
                                   order_by='Dictionary.id')
    current_game = db.relationship('CurrentGame',
                                   cascade='all,delete',
                                   uselist=False)

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_secret_answer(self, secret_answer):
        self.secret_answer_hash = generate_password_hash(secret_answer)

    def check_secret_question(self, secret_answer):
        return check_password_hash(self.secret_answer_hash, secret_answer)

    def get_token(self, token_expires=3600*24):
        now = datetime.utcnow()
        if self.token and self.token_expiration > now + timedelta(seconds=600):
            return self.token
        self.token = base64.b64encode(os.urandom(24)).decode('utf-8')
        self.token_expiration = now + timedelta(seconds=token_expires)
        db.session.add(self)
        return self.token

    def revoke_token(self):
        self.token = None
        self.token_expiration = datetime.utcnow() - timedelta(seconds=1)
        db.session.add(self)

    @staticmethod
    def check_token(token):
        user = User.query.filter_by(token=token).first()
        if user is None or user.token is None or user.token_expiration < datetime.utcnow():
            return None
        return user

    @staticmethod
    def check_request(request):
        if not 'Authorization' in request.headers:
            return None

        request_token = request.headers.get('Authorization').replace('Bearer ', '')
        user = User.check_token(request_token)
        
        return user


class Statistic(db.Model):
    """ Statistic to show progress """

    __tablename__ = 'statistic'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    game_type = db.Column(db.String(30))
    date_completed = db.Column(db.DateTime, default=datetime.utcnow)
    total_rounds = db.Column(db.Integer)
    correct_answers = db.Column(db.Integer, default=0)


class CurrentGame(db.Model):
    """ Current game to continue. One for user """

    __tablename__ = 'current_game'

    id = db.Column(db.Integer, primary_key=True)
    game_type = db.Column(db.String(30))
    game_date_started = db.Column(db.DateTime, default=datetime.utcnow)
    total_rounds = db.Column(db.Integer)
    correct_answers = db.Column(db.Integer, default=0)
    current_round = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    game_rounds = db.relationship('GameRound',
                                  cascade='all,delete',
                                  lazy='dynamic',
                                  order_by='GameRound.order')

    def get_progress(self):
        return int(self.current_round / self.total_rounds * 100)

    def update_statistic(self, correct_answers):
        """ Update statistic table and delete current game """

        total_rounds = self.total_rounds
        
        statistic_entry = Statistic(user_id=self.user_id)
        statistic_entry.game_type = self.game_type
        statistic_entry.total_rounds = total_rounds
        statistic_entry.correct_answers = correct_answers

        db.session.add(statistic_entry)
        db.session.delete(self)
        db.session.commit()

    def get_current_game(self):
        """ Return json data for current game entry """

        if self is None:
            return None
        if self.game_data is None:
            return None
        
        game_data = json.loads(self.game_data)
                
        return {'game_data': game_data['game_rounds'],
                'game_type': GameType[self.game_type].value,
                'progress': self.get_progress(),
                'total_rounds': self.total_rounds,
                'current_round': self.current_round,
                'correct_answers': self.correct_answers
                }

class GameRound(db.Model):
    """ Game round for current game """

    __tablename__ = 'game_round'

    id = db.Column(db.Integer, primary_key=True)
    order = db.Column(db.Integer, index=True)
    word_id = db.Column(db.Integer)
    current_game_id = db.Column(db.Integer, db.ForeignKey('current_game.id'))
    value = db.Column(db.String(550))
    correct_answer = db.Column(db.String(550))
    answer0 = db.Column(db.String(550))
    answer1 = db.Column(db.String(550))
    answer2 = db.Column(db.String(550))
    answer3 = db.Column(db.String(550))
    correct_index = db.Column(db.Integer)

