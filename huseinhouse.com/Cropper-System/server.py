import matplotlib
matplotlib.use('Agg')
import cv2
import matplotlib.pyplot as plt
import numpy as np
from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS
import os
import model_flower
from settings import *
import tensorflow as tf
from scipy import misc
import json

# disable tensorflow warning/debug
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# use cpu to save GPU RAM
os.environ['CUDA_VISIBLE_DEVICES'] = ''

lower_green = np.array([30, 20, 20])
upper_green = np.array([90, 255, 255])
green_intensity = [148, 249, 73]

sess = tf.InteractiveSession()
model = model_flower.Model(2)
sess.run(tf.global_variables_initializer())
saver = tf.train.Saver(tf.global_variables())

try:
	saver.restore(sess, os.getcwd() + "/model.ckpt")
	print "done load checkpoint"
except:
	print "you need to train first"
	exit(0)

def get_boundary(img):
	for i in range(img.shape[0]):
		if np.where((img[i, :, 1] > 0) == True)[0].shape[0] > 0:
			ymax = i
			break
	for i in reversed(range(img.shape[0])):
		if np.where((img[i, :, 1] > 0) == True)[0].shape[0] > 0:
			ymin = i
			break	
	for i in range(img.shape[1]):
		if np.where((img[:, i, 1] > 0) == True)[0].shape[0] > 0:
			xmin = img.shape[1] - i - 5
			break
	for i in reversed(range(img.shape[1])):
		if np.where((img[:, i, 1] > 0) == True)[0].shape[0] > 0:
			xmax = img.shape[1] - i + 2
			break
	return ymax, xmax, ymin, xmin

def get_boundary_flower(img):
	for i in range(img.shape[0]):
		if np.where((img[i, :, 1] > 0) == True)[0].shape[0] > 0:
			ymax = i
			break
	for i in reversed(range(img.shape[0])):
		if np.where((img[i, :, 1] > 0) == True)[0].shape[0] > 0:
			ymin = i
			break	
	for i in range(img.shape[1]):
		if np.where((img[:, i, 1] > 0) == True)[0].shape[0] > 0:
			xmin = img.shape[1] - i
			break
	for i in reversed(range(img.shape[1])):
		if np.where((img[:, i, 1] > 0) == True)[0].shape[0] > 0:
			xmax = img.shape[1] - i + 2
			break
	return ymax, xmax, ymin, xmin

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/opt/lampp/htdocs/output-crop/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
	
@app.route('/crop', methods = ['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		try:
			f = request.files['file']
			f.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
			image = cv2.imread(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
			if request.form['type'] == 'crop':
				image = cv2.resize(image, (960, 640))
				hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
				mask = cv2.inRange(hsv, lower_green, upper_green)
				res = cv2.bitwise_and(image, image, mask = mask)
				temp = res / (np.array(green_intensity) * 1.0)
				temp[temp > 1.0] = 1.0
				temp = np.mean(temp, axis = 2).flatten()
				density = temp[temp > 0]
				res[:, :, 1][np.nonzero(res[:, :, 1])] = 255
				greenpercentage = np.nonzero(res[:, :, 1])[0].shape[0] / (res[:, :, 1].shape[0] * res[:, :, 1].shape[1] * 1.0)
				if greenpercentage < .1:
					return json.dumps({'error': 'not enough crop'})
				ymax, xmax, ymin, xmin = get_boundary(res)
				img_pred = cv2.addWeighted(res,0.5,image,0.5, 0)
				fig = plt.figure(figsize = (15, 10))
				plt.imshow(cv2.cvtColor(img_pred, cv2.COLOR_BGR2RGB))
				rect = plt.Rectangle((xmin, ymin), xmax - xmin, ymax - ymin, fill = False, edgecolor = (0, 1.0, 0), linewidth= 5)
				plt.gca().add_patch(rect)
				plt.gca().text(xmax, ymax - 2,'{:s}'.format('crop percentage: ' + str(greenpercentage)), 
							   bbox=dict(facecolor = (0, 1.0, 0), alpha=0.5), fontsize=25, color='white')
				plt.axis('off')
				plt.savefig(UPLOAD_FOLDER + secure_filename(f.filename) + '_percent.jpg', bbox_inches='tight')
				fig = plt.figure(figsize = (15, 10))
				plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
				rect = plt.Rectangle((xmin, ymin), xmax - xmin, ymax - ymin, fill = False, edgecolor = (0, 1.0, 0), linewidth= 5)
				plt.gca().add_patch(rect)
				plt.gca().text(xmax, ymax - 2,'{:s}'.format('healthy percentage: ' + str(np.mean(density))), 
							   bbox=dict(facecolor = (0, 1.0, 0), alpha=0.5), fontsize=25, color='white')
				plt.axis('off')
				plt.savefig(UPLOAD_FOLDER + secure_filename(f.filename) + '_health.jpg', bbox_inches='tight')
				return json.dumps({'status': 'ok', 'filename': str(f.filename)})
			if request.form['type'] == 'flower':
				img = misc.imread(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
				img = misc.imresize(img, (picture_dimension, picture_dimension))
				img = np.expand_dims(img, 0)
				probs = sess.run(model.outputs, feed_dict = {model.X: img})[0]
				hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
				mask = cv2.inRange(hsv, lower_green, upper_green)
				mask = cv2.bitwise_not(mask)
				res = cv2.bitwise_and(image, image, mask = mask)
				res[res > 200] = 255
				res[res < 200] = 0
				ymax, xmax, ymin, xmin = get_boundary_flower(res)
				img_pred = cv2.addWeighted(res,0.5,image,0.5, 0)
				fig = plt.figure(figsize = (15, 10))
				plt.imshow(cv2.cvtColor(img_pred, cv2.COLOR_BGR2RGB))
				rect = plt.Rectangle((xmin, ymin), xmax - xmin, ymax - ymin, fill = False, edgecolor = (1.0, 165 / 255.0, 0), linewidth= 5)
				plt.gca().add_patch(rect)
				plt.gca().text(xmax, ymax - 2,'{:s}'.format('prob attraction: ' + str(probs[1])), 
							   bbox=dict(facecolor = (1.0, 165 / 255.0, 0), alpha=0.5), fontsize=25, color='white')
				plt.axis('off')
				plt.savefig(UPLOAD_FOLDER + secure_filename(f.filename) + '_flower.jpg', bbox_inches='tight')
				return json.dumps({'status': 'ok', 'filename': str(f.filename)})
		except Exception as e:
			return json.dumps({'error': str(e)})
	else:
		return ''
	
if __name__ == '__main__':
	app.run(host = '0.0.0.0', threaded = True,  port = 8012)