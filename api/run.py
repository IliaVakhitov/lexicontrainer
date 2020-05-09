"""Utils to run scripts directly with db contex"""

import json
from app import db
from app.models import Definitions, Word, CurrentGame, WordSynonyms, Statistic, User
from app.models import Dictionary
from app import create_app


def update_defitions_table():
    definitions = db.session.query(Definitions, Word).\
        filter(Definitions.word_id == Word.id).all()
    for definition in definitions:
        definition[0].spelling = definition[1].spelling
    db.session.commit()
    
    return {'result': 'success'}


def words_data_lower():
    definitions = Word.query.all()        
    for word in definitions:
        word.spelling = word.spelling.lower()
        word.definition = word.definition.lower()
    db.session.commit()

    return {'result': 'success'}


def fillout_newsynonyms():
    words = Word.query.all()
    for word in words:
        if not word.synonyms:
            continue
        synonyms = json.loads(word.synonyms)
        #print(f'word_id: {word.id}, spelling: {word.spelling}')
        #print(synonyms)
        for synonym in synonyms:
            db_synonym = WordSynonyms(word_id=word.id, synonym=synonym)
            db.session.add(db_synonym)

    #db.session.commit()

    return {'result': 'success'}


def update_statistic():
    current_game = CurrentGame.query.all()        
    for game in current_game:
        statistic_entry = Statistic(user_id=game.user_id)
        statistic_entry.game_type = game.game_type
        statistic_entry.total_rounds = game.total_rounds
        statistic_entry.correct_answers = game.correct_answers

        db.session.add(statistic_entry)
        db.session.delete(game)

    db.session.commit()

    return {'result': 'success'}


def save_dictionary():
    dictionary = Dictionary.query.filter_by(id=2).first()
    data = {'name':dictionary.dictionary_name}
    data['words'] = []
    for word in dictionary.words.all():
        data['words'].append(
            {'spelling': word.spelling,
             'definition': word.definition,
             'synonyms': [s for s in word.word_synonyms()]
            }
        )

    with open('data.json', 'w') as fout:
        json.dump(data, fout, indent=4)


def delete_demo():
    demo_user = User.query.filter_by(username='Demo').first()
    if demo_user:
        db.session.delete(demo_user)
        db.session.commit()


def run_script():
    app = create_app()

    with app.app_context():
        save_dictionary()


if __name__ == '__main__':
    run_script()
