import json
import logging
from flask_login import login_required, current_user
from flask import render_template
from flask import url_for
from flask import request
from flask import redirect
from flask import flash
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

@bp.route('/dictionaries', methods=['POST'])
@token_auth.login_required
def dictionaries():
    """
    List of dictionaries of current user
    """

    request_data = request.get_json()
    username = request_data.get('username')  
    user = User.query.filter_by(username=username).first()   
    
    dictionaries = Dictionary.query\
        .filter_by(user_id=user.id)\
        .order_by('dictionary_name')

    dicts = [d.to_dict() for d in dictionaries]
    return {'dictionaries': dicts}


@bp.route('/add_dictionary/', methods=['POST'])
@login_required
def add_dictionary(dictionary_name):
    dictionary_entry = Dictionary(
        dictionary_name=dictionary_form.dictionary_name.data.strip(),
        description=dictionary_form.description.data.strip(),
        user_id=current_user.id)
    db.session.add(dictionary_entry)
    db.session.commit()
    logger.info(f'Dictionary {dictionary_entry.dictionary_name} saved')
    return redirect(url_for('main.edit_dictionary', dictionary_id=dictionary_entry.id))



@bp.route('/dictionary/<int:dictionary_id>')
@login_required
def dictionary(dictionary_id):
    dictionary_entry = Dictionary.query.filter_by(id=dictionary_id).first_or_404()
    return render_template('main/dictionary.html',
                           title=dictionary_entry.dictionary_name,
                           dictionary=dictionary_entry)


@bp.route('/edit/dictionary/<int:dictionary_id>', methods=['GET', 'POST'])
@login_required
def edit_dictionary(dictionary_id):
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


@bp.route('/check_dictionary_name', methods=['POST'])
def check_dictionary_name():
    dictionary_name = request.form['dictionary_name']
    dictionary_entry = Dictionary.query.filter_by(dictionary_name=dictionary_name).first()
    return jsonify({'name_available': dictionary_entry is None})
