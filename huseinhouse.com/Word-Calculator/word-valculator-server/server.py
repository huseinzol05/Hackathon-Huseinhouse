import numpy as np
from fuzzywuzzy import fuzz
import json
import pickle
from sklearn.neighbors import NearestNeighbors

from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class Calculator():
    def __init__(self, tokens,):
        self._tokens = tokens
        self._current = tokens[0]

    def exp(self):
        result = self.term()
        while self._current in ('+', '-'):
            if self._current == '+':
                self.next()
                result += self.term()
            if self._current == '-':
                self.next()
                result -= self.term()
        return result

    def factor(self):
        result = None
        if self._current[0].isdigit() or self._current[-1].isdigit():
            result = np.array([float(i) for i in self._current.split(',')])
            self.next()
        elif self._current is '(':
            self.next()
            result = self.exp()
            self.next()
        return result

    def next(self):
        self._tokens = self._tokens[1:]
        self._current = self._tokens[0] if len(self._tokens) > 0 else None

    def term(self):
        result = self.factor()
        while self._current in ('*', '/'):
            if self._current == '*':
                self.next()
                result *= self.term()
            if self._current == '/':
                self.next()
                result /= self.term()
        return result

with open('azkaban-vector.p', 'rb') as fopen:
    azkaban_vector=pickle.load(fopen)
with open('azkaban-list.p', 'rb') as fopen:
    azkaban_list = pickle.load(fopen)
azkaban_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(azkaban_vector)

with open('catchingfire-vector.p', 'rb') as fopen:
    catchingfire_vector=pickle.load(fopen)
with open('catchingfire-list.p', 'rb') as fopen:
    catchingfire_list = pickle.load(fopen)
catchingfire_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(catchingfire_vector)

with open('chamber-vector.p', 'rb') as fopen:
    chamber_vector=pickle.load(fopen)
with open('chamber-list.p', 'rb') as fopen:
    chamber_list = pickle.load(fopen)
chamber_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(chamber_vector)

with open('gameofthrone-vector.p', 'rb') as fopen:
    gameofthrone_vector=pickle.load(fopen)
with open('gameofthrone-list.p', 'rb') as fopen:
    gameofthrone_list = pickle.load(fopen)
gameofthrone_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(gameofthrone_vector)

with open('goblet-vector.p', 'rb') as fopen:
    goblet_vector=pickle.load(fopen)
with open('goblet-list.p', 'rb') as fopen:
    goblet_list = pickle.load(fopen)
goblet_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(goblet_vector)

with open('halfblood-vector.p', 'rb') as fopen:
    halfblood_vector=pickle.load(fopen)
with open('halfblood-list.p', 'rb') as fopen:
    halfblood_list = pickle.load(fopen)
halfblood_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(halfblood_vector)

with open('hollow-vector.p', 'rb') as fopen:
    hollow_vector=pickle.load(fopen)
with open('hollow-list.p', 'rb') as fopen:
    hollow_list = pickle.load(fopen)
hollow_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(hollow_vector)

with open('hungergame-vector.p', 'rb') as fopen:
    hungergame_vector=pickle.load(fopen)
with open('hungergame-list.p', 'rb') as fopen:
    hungergame_list = pickle.load(fopen)
hungergame_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(hungergame_vector)

with open('sorcererstone-vector.p', 'rb') as fopen:
    sorcererstone_vector=pickle.load(fopen)
with open('sorcererstone-list.p', 'rb') as fopen:
    sorcererstone_list = pickle.load(fopen)
sorcererstone_nbrs = NearestNeighbors(n_neighbors=5, algorithm='auto', metric='cosine').fit(sorcererstone_vector)

dict_book = {'sorcerer-stone':(sorcererstone_vector, sorcererstone_list, sorcererstone_nbrs),
             'secret-chamber':(chamber_vector, chamber_list, chamber_nbrs),
             'azkaban':(azkaban_vector, azkaban_list, azkaban_nbrs),
             'goblet-fire':(goblet_vector, goblet_list, goblet_nbrs),
             'halfblood-prince':(halfblood_vector, halfblood_list, halfblood_nbrs),
             'hallow':(hollow_vector, hollow_list, hollow_nbrs),
             'hunger-game':(hungergame_vector, hungergame_list, hungergame_nbrs),
             'catching-fire':(catchingfire_vector, catchingfire_list, catchingfire_nbrs),
             'throne':(gameofthrone_vector, gameofthrone_list, gameofthrone_nbrs)}

@app.route('/calculator/api/v1.0/', methods=['GET'])
def get_calculate():
    if request.args.get('book') is None or request.args.get('equation') is None:
        return json.dumps({'error': 'insert all the parameters'})
    print(request.args.get('equation'))
    try:
        results = dict_book[request.args.get('book')]
    except:
        return json.dumps({'error': 'unable to find the book'})
    try:
        tokens,temp = [], ''
        for i in request.args.get('equation'):
            if i == ' ':
                continue
            if i not in '()*+-':
                temp += i
            else:
                if len(temp):
                    row = np.argmax([fuzz.ratio(temp, k) for k in results[1]])
                    tokens.append(','.join(results[0][row,:].astype('str').tolist()))
                    temp =''
                tokens.append(i)
        if len(temp):
            row = np.argmax([fuzz.ratio(temp, k) for k in results[1]])
            tokens.append(','.join(results[0][row,:].astype('str').tolist()))
        _, indices = results[2].kneighbors(Calculator(tokens).exp().reshape(1,-1))
        result_text = []
        for i in indices[0]:
            result_text.append(results[1][i])
        return json.dumps(result_text)
    except Exception as e:
        print(e)
        return json.dumps({'error': 'unable to parse, recheck your input'})

if __name__ == '__main__':
	app.run(host = '0.0.0.0', threaded = True,  port = 8051)
