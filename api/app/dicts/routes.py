import json
import logging
from flask import request

from flask import jsonify
from flask_httpauth import HTTPTokenAuth
from app.errors.handlers import error_response

from app.dicts import bp
from app.models import User, Dictionary
from app import db
from datetime import datetime

token_auth = HTTPTokenAuth()

@token_auth.verify_token
def verify_token(token):
    curr_user = User.check_token(token) if token else None
    return curr_user is not None


@token_auth.error_handler
def token_auth_error():
    return error_response(401)

@bp.route('/dictionaries', methods=['GET'])
@token_auth.login_required
def dictionaries():
    """
    List of dictionaries of current user
    """

    user = User.check_request(request)    
    dictionaries = Dictionary.query\
        .filter_by(user_id=user.id)\
        .order_by('dictionary_name')

    dicts = []
    for dictionary in dictionaries:
        dict_entry = dictionary.to_dict()        
        words = [{'id': w.id, 'spelling': w.spelling} for w in dictionary.words.all()]
        dict_entry['words'] = words
        dicts.append(dict_entry)
    return {'dictionaries': dicts}


@bp.route('/add_dictionary', methods=['POST'])
@token_auth.login_required
def add_dictionary():
    user = User.check_request(request)
    dictionary_name = request.get_json().get('dictionary_name').strip()
    dictionary_description = request.get_json().get('dictionary_description').strip()
    dictionary_entry = Dictionary(
        dictionary_name=dictionary_name,
        description=dictionary_description,
        user_id=user.id)
    db.session.add(dictionary_entry)
    db.session.commit()
    # logger.info(f'Dictionary {dictionary_entry.dictionary_name} saved')

    return {'result': 'Dictionary added successfully'}


@bp.route('/delete_dictionary/', methods=['DELETE'])
@token_auth.login_required
def delete_dictionary(dictionary_name):
    pass


@bp.route('/update_dictionary/', methods=['POST'])
@token_auth.login_required
def update_dictionary(dictionary_name):
    pass

"""
@bp.route('/dictionary/<int:dictionary_id>')
@token_auth.login_required
def dictionary(dictionary_id):
    user = User.check_request(request)
    dictionary_entry = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    return {'title':dictionary_entry.dictionary_name,
            'dictionary': dictionary_entry.to_dict()}


@bp.route('/edit/dictionary/<int:dictionary_id>', methods=['GET', 'POST'])
@token_auth.login_required
def edit_dictionary(dictionary_id):
    user = User.check_request(request)
    dictionary_entry = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    dictionary_form = EditDictionaryForm(dictionary_entry.dictionary_name, dictionary_entry.description)

    if 'delete' in request.form:
        db.session.delete(dictionary_entry)
        db.session.commit()
        return redirect(url_for('main.dictionaries'))

    if dictionary_form.validate_on_submit():
        if 'save_dictionary' in request.form:
            dictionary_entry.dictionary_name = dictionary_form.dictionary_name.data.strip()
            dictionary_entry.description = dictionary_form.description.data.strip()
            db.session.commit()
            flash('Dictionary saved!')
            return redirect(url_for('main.dictionary', dictionary_id=dictionary_entry.id))

        elif 'cancel_edit' in request.form:
            return redirect(url_for('main.dictionary', dictionary_id=dictionary_entry.id))

    if request.method == 'GET':
        dictionary_form.dictionary_name.data = dictionary_entry.dictionary_name
        dictionary_form.description.data = dictionary_entry.description

    return render_template('main/edit_dictionary.html',
                           title=dictionary_entry.dictionary_name,
                           dictionary=dictionary_entry,
                           form=dictionary_form)
"""

@bp.route('/check_dictionary_name', methods=['GET'])
def check_dictionary_name():
    dictionary_name = request.get_json().get('dictionary_name')
    dictionary_entry = Dictionary.query.filter_by(dictionary_name=dictionary_name).first()
    return {'name_available': dictionary_entry is None}
