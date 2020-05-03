import json
import unittest
from random import randint

from sqlalchemy import func

from app import create_app, db
from app.models import Word, User, Dictionary, CurrentGame, Definitions, Synonyms
from appmodel.game_generator import GameGenerator
from appmodel.game_round import GameRound
from appmodel.game_type import GameType
from appmodel.revision_game import RevisionGame
from config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'


class WordLearningCase(unittest.TestCase):
    """ Test appmodel , db methods, routes """

    def setUp(self):
        """ Create infile sqllite db.
            Fill it with moth data
        """

        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.app.testing = True
        self.app_client = self.app.test_client()
        self.words_number = 100

        db.create_all()

        # Filling db with mock data
        user = User(username='Test', id=1)
        user.set_password('Test')
        db.session.add(user)
        db.session.commit()
        user_dictionary = Dictionary(dictionary_name='dictionary', user_id=user.id)
        db.session.add(user_dictionary)
        db.session.commit()
        for i in range(self.words_number):
            word = Word(
                spelling=f'spelling{i}', 
                definition=f'definition{i}', 
                dictionary_id=user_dictionary.id
            )
            definition = Definitions(spelling=f'spelling{i}', definition=f'def{i}')
            synonym = Synonyms(spelling=f'spelling{i}', synonym=f'syn{i}')
            db.session.add(word)
            db.session.add(definition)
            db.session.add(synonym)
        db.session.commit()

        # Add entry to current_game table
        """
        word_limit = 10
        game_type = GameType.FindSpelling
        words_query = Word.query.order_by(func.random()).all()
        self.revision_game = GameGenerator.generate_game(words_query, game_type, word_limit)
        curr_user = User.query.filter_by(username='Test').first()
        self.round_index = randint(0, 9)
        self.round_i = self.revision_game.game_rounds[self.round_index]
        revision_game_entry = CurrentGame()
        revision_game_entry.game_type = game_type.name
        revision_game_entry.game_data = json.dumps(self.revision_game.to_json())
        revision_game_entry.user_id = curr_user.id
        revision_game_entry.total_rounds = self.revision_game.total_rounds
        revision_game_entry.current_round = 0
        db.session.add(revision_game_entry)
        db.session.commit()
        """

    def tearDown(self):
        """ Delete DB """

        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_dictionary(self):
        """ Test user dictionary """

        # Arrange
        curr_user = User.query.filter_by(username='Test').first()
        # Act
        user_dictionary = Dictionary.query.filter_by(user_id=curr_user.id).first()
        # Assert
        self.assertIsNotNone(
            user_dictionary, 
            'User dictionary should not be None'
        )
        self.assertEqual(
            user_dictionary.dictionary_name, 
            'dictionary', 
            'Dictionary name should be \'dictionary\''
        )

    @unittest.skip('Skip current game test')
    def test_current_game(self):
        """ Test current game for user """

        # Arrange
        curr_user = User.query.filter_by(username='Test').first()
        word_limit = 10
        game_type = GameType.FindSpelling
        revision_game_entry = CurrentGame.query.filter_by(user_id=curr_user.id).first()
        # Act
        json_rounds = json.loads(revision_game_entry.game_data)
        loaded_round = GameRound(json.loads(json_rounds['game_rounds'][self.round_index]))

        # Assert
        self.assertEqual(revision_game_entry.game_type, game_type.name, 'Game type not equal')
        self.assertIsNotNone(self.revision_game.game_rounds, 'Game rounds should not be None')
        self.assertEqual(len(self.revision_game.game_rounds), word_limit)
        self.assertEqual(len(json_rounds['game_rounds']), word_limit)
        self.assertEqual(loaded_round.value, self.round_i.value, f'Value should be equal')

        for i in range(4):
            self.assertEqual(loaded_round.answers[i], 
                            self.round_i.answers[i], 
                            f'Answer should be equal')

        self.assertEqual(loaded_round.correct_index, self.round_i.correct_index, f'Correct_index should be equal')

        
    @unittest.skip('Skip game generator test')
    def test_game_generator(self):
        """ Test game generator"""

        # Arrange
        # data filled in SetUp()

        # Act
        words_limit = 10
        words_list = Word.query.all()
        list1 = GameGenerator.generate_game(words_list, GameType.FindSpelling, words_limit)
        list2 = GameGenerator.generate_game(words_list, GameType.FindSpelling, words_limit)

        # Assert
        self.assertEqual(len(list1.game_rounds), words_limit, 'Len of game should be equal')
        self.assertEqual(len(list2.game_rounds), words_limit, 'Len of game should be equal')

    @unittest.skip('Skip game data test')
    def test_game_data_json(self):
        """ Test game data """
        # Arrange
        # data filled in SetUp()
        word_limit = 5
        game_type = GameType.FindDefinition
        
        # Act
        words_query = Word.query.order_by(func.random()).limit(word_limit).all()
        revision_game = GameGenerator.generate_game(words_query, game_type, word_limit)
        json_data = json.dumps(revision_game.to_json())
        revision_game1 = RevisionGame(game_type, [])
        revision_game1.load_game_rounds(json.loads(json_data))
        
        # Assert
        self.assertEqual(
            len(revision_game.game_rounds), 
            len(revision_game1.game_rounds), 
            'Len should be equal'
        )

    @unittest.skip('Skip dicts routes')
    def test_dictionaries(self):
        """ Test dictionaries routes """
        # Arrange
        user = User.query.filter_by(username='Test').first()
        user_dictionary = Dictionary(dictionary_name='new_dictionary', user_id=user.id)
        db.session.add(user_dictionary)
        db.session.commit()
        
        # Act
        response = self.app_client.post(
            'dicts/check_dictionary_name', 
            data=dict(dictionary_name='new_dictionary')
        )
        
        # Assert
        res = response.data
        self.assertTrue(
            'result' in res
        )
        self.assertFalse(res['result'])
        
        # Act
        response = self.app_client.post(
            'dicts/check_dictionary_name', 
            data=dict(dictionary_name='new_dictionary name')
        )
        res = response.data
        self.assertTrue(
            'result' in res
        )
        self.assertFalse(res['result'])

   
    def test_synonyms(self):
        """ Test synonyms query """

        # Arrange
        # DB set in SetUp

        #Act
        i = randint(0, self.words_number - 1)
        synonym = Synonyms.query.filter_by(spelling=f'spelling{i}').first()
        all_synonyms = Synonyms.query.all()
        
        #Asset
        self.assertEqual(
            synonym.synonym, 
            f'syn{i}', 
            'Synonym should be equal'
        )        
        self.assertEqual(
            len(all_synonyms), 
            self.words_number, 
            'Number of synonyms should be equal'
        )
        
    def test_definitions(self):
        """ Test definition query """

        # Arrange
        # DB set in SetUp

        #Act
        i = randint(0, self.words_number - 1)
        definition = Definitions.query.filter_by(spelling=f'spelling{i}').first()
        all_definitions = Definitions.query.all()
        
        self.assertEqual(
            definition.definition, 
            f'def{i}', 
            'Definition should be equal'
        )
        self.assertEqual(
            len(all_definitions), 
            self.words_number, 
            'Number of definitions should be equal'
        )

if __name__ == '__main__':
    unittest.main(verbosity=2)

