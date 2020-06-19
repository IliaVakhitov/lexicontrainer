""" Get definion or synonyms for given word """

from datetime import date
import requests
from config import Config
from app import db

from app.models import ApiRequests

class WordsApi:
    """ Words api class """

    @staticmethod
    def get_words_data(word: str, request_type: str):
        """ Get data from words api 
            requst_type: 'definitions' or 'synonyms'
            Return JSON data
            
        """
        url = f'https://wordsapiv1.p.rapidapi.com/words/{word}/{request_type}'

        headers = {
            'x-rapidapi-host': Config.WORDSAPI_HOST,
            'x-rapidapi-key': Config.WORDSAPI_KEY
            }

        response = requests.request('GET', url, headers=headers)
        if not response or response.status_code != 200:
            return None

        return response.text

    @staticmethod
    def check_requests():
        """ Check number of requests for today
            Add +1 for today
            Return 
                True if less than 2000
                False if more than 2000
        """

        # Save date of request
        api_request = ApiRequests.query.filter_by(date=date.today()).first()
        if not api_request:
            api_request = ApiRequests(date=date.today(), requests=0)
            db.session.add(api_request)
            db.session.commit()
        # Only 2000 requests per day
        if api_request.requests > 1999:
            return False

        api_request.requests += 1
        db.session.commit()
        return True

