import json
from typing import List
from werkzeug.http import HTTP_STATUS_CODES
import requests
from config import Config


class WordsApi:

    @staticmethod
    def get_words_data(word: str, request_type: str):

        url = f'https://wordsapiv1.p.rapidapi.com/words/{word}/{request_type}'

        headers = {
            'x-rapidapi-host': Config.WORDSAPI_HOST,
            'x-rapidapi-key': Config.WORDSAPI_KEY
            }

        response = requests.request('GET', url, headers=headers)
        if not response or response.status_code != 200:
            return None

        return response.text
