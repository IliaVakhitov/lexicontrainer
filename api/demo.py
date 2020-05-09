""" Create Demo user, Demo dictionary, add words from demo.json """
import json
from app import db
from app.models import Word, WordSynonyms, User, Dictionary
from app import create_app
from config import Config




def fill_out_demo_data():
    """ Create demo user, dictionary, words """

    app = create_app()    
    with app.app_context():
        words = []
        with open('demo.json') as json_file:
            data = json.load(json_file)
            for word in data['words']:
                words.append({
                    'spelling': word['spelling'],
                    'definition': word['definition'],
                    'synonyms': word['synonyms']
                })
        
        # User
        demo_user = User.query.filter_by(username='Demo').first()
        if not demo_user:
            demo_user = User(username='Demo')
            demo_user.set_password(Config.DEMO_PASS)
            db.session.add(demo_user)
            db.session.commit()
        
        # Dictionary
        demo_dict = Dictionary.query.\
            filter_by(user_id=demo_user.id).\
            filter_by(dictionary_name='Demo').first()
        if not demo_dict:
            demo_dict = Dictionary(user_id=demo_user.id, dictionary_name='Demo')
            db.session.add(demo_dict)
            db.session.commit()
        
        # Words
        # words = Word.query.filter_by(dictionary_id=demo_dict.id).all()
        for word in words:
            demo_word = Word.query.\
                filter_by(dictionary_id=demo_dict.id,).\
                filter_by(spelling=word['spelling']).first()
            if not demo_word:
                demo_word = Word(
                    dictionary_id=demo_dict.id,
                    spelling=word['spelling']
                )
            demo_word.definition = word['definition']
            db.session.add(demo_word)
            db.session.commit()
            for synonym in word['synonyms']:
                demo_synonym = WordSynonyms.query.\
                    filter_by(word_id=demo_word.id).\
                    filter_by(synonym=synonym).first()
                if not demo_synonym:
                    demo_synonym = WordSynonyms(word_id=demo_word.id, synonym=synonym)
                    db.session.add(demo_synonym)
            db.session.commit()
                

if __name__ == '__main__':
    fill_out_demo_data()
