""" Class to store configuration """

import os
from dotenv import load_dotenv


basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


class Config(object):
    """ Class to store configuration 
        Values are in .env file
    """

    SECRET_KEY = os.environ.get('SECRET_KEY') or 'f3e687f82be0ecd2f9d83352b7f0b8ff96d954a68cfee5c9'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WORDSAPI_KEY = os.environ.get('WORDSAPI_KEY')
    WORDSAPI_HOST = os.environ.get('WORDSAPI_HOST')
    DEMO_PASS = os.environ.get('DEMO_PASS')
    LOG_TO_STDOUT = os.environ.get('LOG_TO_STDOUT')

