""" Class is used to generate game """

import logging
from random import randint
from typing import List, Dict
from sqlalchemy import func

from app import db
from app.models import Word, Dictionary, LearningIndex
from app.models import CurrentGame, GameRound

from appmodel.game_type import GameType



class GameGenerator:
    """ Class is used to generate game """

    @staticmethod
    def add_current_game(game_type: GameType, user_id: int, total_rounds: int):
        """ Entry of current game """
        
        revision_game_entry = CurrentGame(
            game_type=game_type.name,
            user_id=user_id,
            total_rounds=total_rounds,
            current_round=0
        )

        db.session.add(revision_game_entry)
        db.session.commit()
        return revision_game_entry
    
    
    @staticmethod
    def get_random_value(
            values: List[str],
            used_values: List[str]) -> str:
        """ Return random value from list.
            Except used values
        """
        
        attemps = 0
        new_value = values[randint(0, len(values) - 1)]
        while new_value in used_values or attemps < len(values):
            new_value = values[randint(0, len(values) - 1)]
            attemps += 1

        return new_value

    @staticmethod
    def generate_game_rounds(
            revision_game_entry, 
            game_type, 
            words_list, 
            words_limit):
        """ Generate game Find Definition 
            Return:
                True - success
                False - error in generating
        """

        if game_type == GameType.FindDefinition:
            values = Word.all_definitions()
        if game_type == GameType.FindSpelling:
            values = Word.all_spellings()
        if game_type == GameType.FindSynonyms:
            values = Word.all_spellings()

        current_round_number = 0
        for next_word in words_list:
            if 0 < words_limit <= current_round_number:
                break
            
            if game_type == GameType.FindSynonyms \
                and not next_word.word_synonyms_number():
                # No synonyms for given word
                continue

            logger.info(f'Round # {current_round_number}')
            
            # Random index for round
            correct_index = randint(0, 3)

            # Define value and correct answer
            if game_type == GameType.FindDefinition:
                correct_answer = next_word.definition
                value = next_word.spelling

            if game_type == GameType.FindSpelling:
                correct_answer = next_word.spelling
                value = next_word.definition

            if game_type == GameType.FindSynonyms:
                value = next_word.random_synonym()
                correct_answer = next_word.spelling    

            logger.info(f'Value is {value}')
            logger.info(f'Correct index is {correct_index}')
            logger.info(f'Correct answer is {correct_answer}')

            answers = [correct_answer]
            for i in range(3):
                logger.info(f'{i} answer is ')
                # Random values from definitions
                new_value = GameGenerator.get_random_value(values, answers)
                answers.append(new_value)
                logger.info(f'{i} answer is {new_value}')

            # Remove correct answer from [0] pos
            answers.remove(correct_answer)
            # Insert in random pos
            answers.insert(correct_index, correct_answer)

            if len(answers) != 4:
                logger.error(f'Error in generating game')
                return False

            game_round = GameRound(
                word_id=next_word.id,
                current_game_id=revision_game_entry.id,
                value=value,
                correct_answer=correct_answer,
                answer0=answers[0],
                answer1=answers[1],
                answer2=answers[2],
                answer3=answers[3],
                correct_index=correct_index,
                round_order=current_round_number
            )
            current_round_number += 1
            db.session.add(game_round)
        
        db.session.commit()

        logger.info('Game generated successful')

        return True

    @staticmethod
    def generate_game(
            user_id: int,
            game_type: GameType,
            dictionaries_list: Dict,
            words_limit: int = 0,
            include_learned_words: bool = True            
        ) -> bool:
        """
        Generates list of GameRounds
        Does not make sense if words_number < 4. Return None in this case
        :param words_list: list to generate game rounds
        :param game_type: enum
        :param words_limit: 0 or higher than 3
        :return:
            True - game generated
            False - couldn't generate game
        """
        
        words_list = []
        if len(dictionaries_list) == 0:
            # All dictionaries
            dictionaries = Dictionary.query.filter_by(user_id=user_id).all()
            # IDs need to make filter in words query
            dict_ids = [d.id for d in dictionaries]
        else:
            # If need to filter dictionaries
            dict_ids = [dictionary['key'] for dictionary in dictionaries_list]
        
        words_query = db.session.query(Word).\
            filter(Word.dictionary_id.in_(dict_ids))

        if not include_learned_words:
            words_query = words_query.\
                join(LearningIndex, LearningIndex.word_id == Word.id).\
                filter(LearningIndex.index < 100)

        # Random order
        words_list = words_query.order_by(func.random()).all()
        
        if len(words_list) == 0:
            # No words in dictionaries
            logger.info('No words in dictionaries!')
            return False

        if len(words_list) < 4:
            logger.info('Not enough words to generate game!')
            return False

        logger.info('Generating game')
        total_rounds = len(words_list) if words_limit > len(words_list) else words_limit
        result = False
        revision_game_entry = GameGenerator.add_current_game(
            game_type=game_type,
            user_id=user_id,
            total_rounds=total_rounds
        )

        result = GameGenerator.generate_game_rounds(
            revision_game_entry,
            game_type,
            words_list, 
            words_limit
        )
        
        if not result:
            db.session.delete(revision_game_entry)
            db.session.commit()

        return result

logger = logging.getLogger(__name__)

