from flask import jsonify
from app.errors import bp


def error_response(status_code, message=None):
    payload = {'status_code': status_code}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    return response


@bp.app_errorhandler(400)
def not_found_error(error):
    return error_response(error, 'Bad request')


@bp.app_errorhandler(404)
def not_found_error(error):
    return error_response(error, 'Page didn\'t found')


@bp.app_errorhandler(500)
def internal_error(error):
    return error_response(error, 'Error')
