""" Unittest for backend modules """

import unittest
from random import randint

from app import create_app, db
from app.models import Definitions, Synonyms, WordSynonyms
from app.models import Word, User, Dictionary, CurrentGame
from appmodel.game_generator import GameGenerator
from appmodel.game_type import GameType
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
            # Add synonyms to current word
            synonym = WordSynonyms(
                word_id=word.id,
                synonym=f'synonym{i}1'
            )
            db.session.add(synonym)
            synonym = WordSynonyms(
                word_id=word.id,
                synonym=f'synonym{i}2'
            )
            db.session.add(synonym)
            db.session.commit()

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

    def test_current_game(self):
        """ Test current game for user """

        # Arrange
        word_limit = 10
        game_type = GameType.FindSynonyms
        curr_user = User.query.filter_by(username='Test').first()
                
        # Act
        result = GameGenerator.generate_game(
            curr_user.id,
            game_type, 
            [],
            word_limit
        )
        # Assert
        self.assertTrue(result, 'Generating result should be True')
        
        # Act
        revision_game = CurrentGame.query.\
            filter_by(user_id=curr_user.id).\
            first().get_current_game()

        # Assert
        self.assertIsNotNone(revision_game, 'Current game is None')
        
        # Act
        game_rounds = revision_game['game_rounds']
        # Assert
        self.assertIsNotNone(game_rounds, 'Game rounds is None')              
        self.assertEqual(
            revision_game['game_type'], 
            game_type.value, 
            'Game type not equal'
        )
        self.assertEqual(
            len(game_rounds), 
            word_limit, 
            'Rounds number not equal'
        )
        self.assertEqual(
            revision_game['total_rounds'], 
            word_limit, 
            'Rounds number not equal'
        )

        # Act
        # Test random round
        rnd_i = randint(0, 9)
        game_round = game_rounds[rnd_i]
        # Assert
        self.assertEqual(
            game_round['correct_answer'], 
            game_round['answer{}'.format(game_round['correct_index'])], 
            'Correct index is wrong')

        self.assertNotEqual(
            game_round['answer0'], 
            game_round['answer1'],  
            'Rounds answers are equal'
        )

        self.assertNotEqual(
            game_round['answer2'], 
            game_round['answer3'],  
            'Rounds answers are equal'
        )
        self.assertNotEqual(
            game_round['answer0'], 
            game_round['answer3'],  
            'Rounds answers are equal'
        )
        self.assertNotEqual(
            game_round['answer1'], 
            game_round['answer2'],  
            'Rounds answers are equal'
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

