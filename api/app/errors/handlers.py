from flask import jsonify
from werkzeug.http import HTTP_STATUS_CODES
from app.errors import bp


def error_response(status_code, message=None):
    payload = {'error': HTTP_STATUS_CODES.get(status_code, 'Unknown error')}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    response.status_code = status_code
    return response


@bp.app_errorhandler(400)
def bad_request(error):
    return error_response(400, 'Bad request')


@bp.app_errorhandler(401)
def bad_auth_info(error):
    return error_response(401, 'Bad auth info')


@bp.app_errorhandler(404)
def not_found_error(error):
    return error_response(404, 'Page not found')


@bp.app_errorhandler(405)
def method_not_allowed(error):
    return error_response(405, 'Method not allowed')


@bp.app_errorhandler(500)
def internal_error(error):
    return error_response(500, 'Error')
