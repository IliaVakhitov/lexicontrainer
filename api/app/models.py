import json
import os
import base64
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

from app.errors.handlers import error_response
from app import db


class LearningIndex(db.Model):
    __tablename__ = 'learning_index'

    id = db.Column(db.Integer, primary_key=True)
    index = db.Column(db.Integer, default=0)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'))
    word = db.relationship('Word', back_populates='learning_index')


class Synonyms(db.Model):
    __tablename__ = 'synonyms'
    
    id = db.Column(db.Integer, primary_key=True)
    spelling = db.Column(db.String(250), index=True)
    synonym = db.Column(db.String(250))


class Definitions(db.Model):
    __tablename__ = 'definitions'

    id = db.Column(db.Integer, primary_key=True)
    spelling = db.Column(db.String(250), index=True)
    definition = db.Column(db.String(550))


class Word(db.Model):
    __tablename__ = 'words'

    id = db.Column(db.Integer, primary_key=True)
    spelling = db.Column(db.String(128))
    definition = db.Column(db.String(550))
    dictionary_id = db.Column(db.Integer, db.ForeignKey('dictionaries.id'))
    learning_index = db.relationship(
        'LearningIndex', 
        cascade="all,delete", 
        uselist=False, 
        back_populates='word')
    
    def __repr__(self):
        return f'<{self.spelling}>'

    def to_dict(self):
        return {'id': self.id,
                'spelling': self.spelling,
                'definition': self.definition,       
                'dictionary_id': self.dictionary_id,       
                'learning_index': 0 if self.learning_index is None else self.learning_index.index}


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    token = db.Column(db.String(32), index=True, unique=True)
    token_expiration = db.Column(db.DateTime)
    secret_question = db.Column(db.String(128))
    secret_answer_hash = db.Column(db.String(128))
    dictionaries = db.relationship('Dictionary',
                                   cascade="all,delete",
                                   backref='Owner',
                                   lazy='dynamic',
                                   order_by="Dictionary.id")
    current_game = db.relationship('CurrentGame',
                                   cascade="all,delete",
                                   uselist=False,
                                   back_populates='user')

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
            return error_response(400)

        request_token = request.headers.get('Authorization').replace('Bearer ', '')
        user = User.check_token(request_token)
        if user is None:
            return error_response(401)

        return user


class Statistic(db.Model):
    __tablename__ = 'statistic'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    game_type = db.Column(db.String(30))
    date_completed = db.Column(db.DateTime, default=datetime.utcnow)
    total_rounds = db.Column(db.Integer)
    correct_answers = db.Column(db.Integer, default=0)


class CurrentGame(db.Model):
    __tablename__ = 'current_game'
    id = db.Column(db.Integer, primary_key=True)
    game_date_started = db.Column(db.DateTime, default=datetime.utcnow)
    game_date_completed = db.Column(db.DateTime)
    game_completed = db.Column(db.Boolean, default=False)
    game_type = db.Column(db.String(30))
    total_rounds = db.Column(db.Integer)
    correct_answers = db.Column(db.Integer, default=0)
    current_round = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = db.relationship('User', back_populates='current_game')
    game_data = db.Column(db.Text)

    def get_next_round(self) -> bool:
        """
        Set +1 to current_round
        :return:
            True - game completed (previous was last round)
            False - game could be resumed
        """
        if self.total_rounds == self.current_round:
            self.game_completed = True
            self.game_date_completed = datetime.utcnow()
            db.session.commit()
            return True

        return False

    def get_progress(self):
        return int(self.current_round / self.total_rounds * 100)

    def get_correct_index(self, answer_index: int) -> int:
        current_round = self.get_current_round(False)
        learning_index = LearningIndex.query.filter_by(id=current_round['learning_index_id']).first()
        if learning_index is None:
            learning_index = LearningIndex(word_id=current_round['word_id'], index=0)
            db.session.add(learning_index)
            db.session.commit()

        if int(current_round['correct_index']) == int(answer_index):
            self.correct_answers += 1
            learning_index.index += 10 if learning_index.index <= 90 else 0
        else:
            learning_index.index -= 10 if learning_index.index > 10 else 0
            
        self.current_round += 1
        db.session.commit()
        return int(current_round['correct_index'])

    def get_current_round(self, only_answers: True):
        if self is None:
            return None
        if self.game_data is None:
            return None
        if self.game_completed:
            return None
        json_rounds = json.loads(self.game_data)
        current_round = json.loads(json_rounds['game_rounds'][self.current_round])
        if only_answers: 
            return {'value': current_round['value'],
                    'answers': current_round['answers']
                    }
        else:
            return current_round
            


class Dictionary(db.Model):
    __tablename__ = 'dictionaries'

    id = db.Column(db.Integer, primary_key=True)
    dictionary_name = db.Column(db.String(128))
    description = db.Column(db.String(250))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    words = db.relationship('Word', cascade="all,delete",
                            backref='Dictionary',
                            lazy='dynamic',
                            order_by="Word.spelling")

    def __repr__(self):
        return f'{self.dictionary_name}'

    def to_dict(self):
        return {'id': self.id,
                'dictionary_name': self.dictionary_name,
                'description': self.description}

