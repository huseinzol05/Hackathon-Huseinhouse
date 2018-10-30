from flask import Flask, render_template, request
from flask_cors import CORS
import os
import json
from soupfunction import *

app = Flask(__name__)
CORS(app)
@app.route('/github', methods = ['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		if request.form['name'] or request.form['repo'] or request.form['mode']:
			return ''
	else:
		if request.args.get('sentiment') is None and request.args.get('repo') is None and request.args.get('mode') is None and request.args.get('dev') is None:
			return json.dumps({'error': 'insert parameters'})
		if request.args.get('name') and request.args.get('mode'):
			if request.args.get('mode') == '1':
				try:
					return json.dumps(get_frontprofile(request.args.get('name')))
				except Exception as e:
					return json.dumps({'error': str(e)})
			elif request.args.get('mode') == '2':
				try:
					profile = get_frontprofile(request.args.get('name'))
					repo = get_repositories(request.args.get('name'), mode = 2)
					return json.dumps({'profile': profile, 'repositories': repo})
				except Exception as e:
					return json.dumps({'error': str(e)})
			elif request.args.get('mode') == '3':
				try:
					profile = get_frontprofile(request.args.get('name'))
					repo = get_repositories(request.args.get('name'))
					return json.dumps({'profile': profile, 'repositories': repo})
				except Exception as e:
					return json.dumps({'error': str(e)})
			else:
				return json.dumps({'error': 'mode not supported'})
		if request.args.get('name') and request.args.get('repo'):
			try:
				return json.dumps({'repositories' :get_detail_repo(request.args.get('name'), request.args.get('repo'))})
			except Exception as e:
				return json.dumps({'error': str(e)})
		if request.args.get('name') and request.args.get('dev') == 'yes':
			try:
				profile = get_frontprofile(request.args.get('name'))
				print profile
				repo = get_repositories(request.args.get('name'))
				sentences = []
				name = {'profile': profile, 'repositories': repo}
				for i in range(len(name['profile']['pinned'])):
					sentence = name['profile']['pinned'][i]['sentence'].split()
					sentence += name['profile']['pinned'][i]['title'].split('-')
					sentence = ' '.join(sentence)
					sentence = clearstring(sentence)
					sentences.append(sentence)
				for i in range(len(name['repositories'])):
					readmes = []
					for k in range(len(name['repositories'][i]['details']['readme'])):
						readmes += name['repositories'][i]['details']['readme'][k].split()
					readmes = list(set(readmes))
					languages = []
					for k in range(len(name['repositories'][i]['details']['language'])):
						languages.append(name['repositories'][i]['details']['language'][k]['language'])
					sentence = languages + readmes
					sentence += name['repositories'][i]['details']['tags']
					sentence = ' '.join(sentence)
					sentence = clearstring(sentence)
					sentences.append(sentence)
				name['dev-prob'], name['technology-sensitivity'], name['technology-impact'], name['technology-satisfaction'] = get_dev_prob(request.args.get('name'), sentences)
				return json.dumps(name)
			except Exception as e:
				return json.dumps({'error': str(e)})


if __name__ == '__main__':
    app.run(host = '0.0.0.0', threaded = True,  port = 0)
