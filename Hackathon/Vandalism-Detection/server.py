from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS
import os

# disable tensorflow warning/debug
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# use cpu to save GPU RAM
os.environ['CUDA_VISIBLE_DEVICES'] = ''

import matplotlib
matplotlib.use('Agg')
import json
from core import preprocess, visualization
from scipy.misc import imread
from detection import *
from settings import *

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/opt/lampp/htdocs/output-vandalism/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
	
@app.route('/vandalism', methods = ['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		f = request.files['file']
		f.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
		img = imread(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
		rclasses, rscores, rbboxes =  process_image(img)
		returned_prediction = visualization.plt_bboxes(img, rclasses, rscores, rbboxes, vandalism_sess, model, picture_dimension, 
								 os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)), distancelabel = 'km')
		return json.dumps({'status': 'ok', 'filename': str(f.filename)})
	else:
		return 'ok!'
		
if __name__ == '__main__':
	app.run(host = '0.0.0.0', threaded = True,  port = 8010)