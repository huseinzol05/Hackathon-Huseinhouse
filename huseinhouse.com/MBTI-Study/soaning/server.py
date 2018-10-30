import json
from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS
from function import *
import os
import textract

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = ''
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		try:
			f = request.files['file']
			f.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
			text = textract.process(UPLOAD_FOLDER + str(f.filename).replace(' ', '_'), method = 'pdfminer')
			if not any(n >= 0 for n in [text.lower().find(i) for i in ['skill', 'working', 'education', 'professional', 'background']]):
				return json.dumps({'error': 'insert personal resume / CV'})
			return json.dumps(get_detail(text))
		except Exception as e:
			return json.dumps({'error': str(e)})
	else:
		return json.dumps({'error': 'only support POST request'})

if __name__ == '__main__':
	app.run(host = '0.0.0.0', threaded = True,  port = 0)
