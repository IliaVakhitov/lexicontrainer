from flask import jsonify
from app.errors import bp


def error_response(status_code, message=None):
    payload = {'error': status_code}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    return response


@bp.app_errorhandler(400)
def not_found_error(error):
    return error_response('400', 'Bad request')


@bp.app_errorhandler(401)
def not_found_error(error):
    return error_response('401', 'Bad auth info')

@bp.app_errorhandler(405)
def not_found_error(error):
    return error_response('405', 'Method not allowed')


@bp.app_errorhandler(404)
def not_found_error(error):
    return error_response('404', 'Page didn\'t found')


@bp.app_errorhandler(500)
def internal_error(error):
    return error_response('500', 'Error')
