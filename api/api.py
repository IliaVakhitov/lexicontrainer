from flask import Flask

app = Flask(__name__)

@app.route('/hello')
def get_hello_string():
    return {'message': 'Hello, world!'}