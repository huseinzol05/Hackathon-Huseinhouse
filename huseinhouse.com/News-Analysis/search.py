import function
from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/sentimentsearch', methods = ['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if request.form['search']:
            return json.dumps({'error': 'support GET only'})
    else:
        if request.args.get('search') is None:
            return json.dumps({'error': 'insert parameters'})
        else:
            if request.args.get('search'):
                try:
                    if request.args.get('token') == 'wr4zYd4XJDtJqbULK3TC':
                        links = function.getlink(request.args.get('search'), token = 'premium')
                    else:
                        links = function.getlink(request.args.get('search'))
                    if len(links) == 0:
                        return json.dumps({'error': 'no result'})
                    return json.dumps(function.filterP(links))
                except Exception as e:
                    return json.dumps({'error': str(e)})

print("done load function")
if __name__ == '__main__':
    app.run(host = '0.0.0.0', threaded = True, port = 8017)
