import model
import tensorflow as tf
import numpy as np
import pandas as pd
import time
import json
from datetime import datetime
from datetime import timedelta
from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS
from socketIO_client import SocketIO, BaseNamespace
from sklearn.preprocessing import MinMaxScaler
import os
import ast
from threading import Thread
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn import linear_model
from scipy import stats
regr = linear_model.LinearRegression()
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/opt/lampp/htdocs/img/neuralnet/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# put your own socket server and port
socketIO = SocketIO('', 9001)
net_namespace = socketIO.define(BaseNamespace, '/rnnnet')

def iqr(a):
	a = np.asarray(a)
	q1 = stats.scoreatpercentile(a, 25)
	q3 = stats.scoreatpercentile(a, 75)
	return q3 - q1

def freedman_diaconis_bins(a):
	a = np.asarray(a)
	if len(a) < 2:
		return 1
	h = 2 * iqr(a) / (len(a) ** (1 / 3))
	if h == 0:
		return int(np.sqrt(a.size))
	else:
		return int(np.ceil((a.max() - a.min()) / h))

def receive_events_thread():
	socketIO.wait()

def on_response(*args):
	net_namespace.emit('leaveroom', args[0])
	tf.reset_default_graph()
	with app.test_request_context():
		return json.dumps({'error': 'leave'})

net_namespace.on('leaveroom', on_response)
receive_events_thread = Thread(target=receive_events_thread)
receive_events_thread.daemon = True
receive_events_thread.start()

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		try:
			f = request.files['file']
			f.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
			numberlayer = int(request.form['numberlayer'])
			sizelayer = int(request.form['sizelayer'])
			split = request.form['split']
			gate = request.form['gate']
			enabledropout = ast.literal_eval(request.form['enabledropout'])
			dropout = request.form['dropout']
			learningrate = float(request.form['learningrate'])
			timestamp = int(request.form['timestamp'])
			selectpenalty = ast.literal_eval(request.form['selectpenalty'])
			penalty = request.form['penalty']
			activationfunction = request.form['activationfunction']
			optimizer = request.form['optimizer']
			selectloss = request.form['selectloss']
			epoch = int(request.form['epoch'])
			columntoselect = request.form['columntoselect']
			future = int(request.form['future'])
			idsocket = request.form['id']
			net_namespace.emit('privatesocket', {'id':idsocket})
			if dropout == '':
				dropout = 0
			else:
				try:
					dropout = float(dropout)
				except:
					return json.dumps({'error': 'Fail to cast dropout rate'})
			if penalty == '':
				penalty = 0
			else:
				penalty = float(penalty)

			try:
				split = (100 - int(split)) / 100.0
			except:
				return json.dumps({'error': 'Split must be positive integer only'})

			try:
				dataset = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
				dataset = dataset.iloc[:(dataset.shape[0] // timestamp) * timestamp + 1,:]
			except:
				return json.dumps({'error': 'Fail to read CSV'})

			date_ori = pd.to_datetime(dataset.Date).tolist()
			try:
				counter_nan = dataset.isnull().sum()
				counter_without_nan = counter_nan[counter_nan == 0]
				dataset = dataset[counter_without_nan.keys()]
			except:
				return json.dumps({'error': 'Fail to remove NaN'})

			try:
				columntoselect = columntoselect.split(',')
				for i in range(len(columntoselect)):
					columntoselect[i] = columntoselect[i].strip()
			except:
				return json.dumps({'error': 'Fail to parse selected columns'})

			X = dataset[columntoselect]
			try:
				minmax = MinMaxScaler().fit(X.astype('float32'))
				X_log_temp = pd.DataFrame(minmax.transform(X.astype('float32')))
			except:
				return json.dumps({'error': 'Select columns that contain numbers only'})

			X_log_train = X_log_temp.iloc[:int(split * X_log_temp.shape[0]) + 1, :]
			X_log_test = X_log_temp.iloc[int(split * X_log_temp.shape[0]):, :]

			color_array = (np.array(sns.color_palette("Paired", len(columntoselect) * 2)) * 255).astype('int').astype('str').tolist()
			color_array = ['rgb(' + ', '.join(i) + ')' for i in color_array]

			EPOCH, LOSS, VALID_LOSS = [], [], []
			tf.reset_default_graph()
			try:
				sess = tf.InteractiveSession()
				modelnet = model.Model(numberlayer, sizelayer, enabledropout, dropout, selectpenalty, penalty, activationfunction, selectloss, learningrate,
									  X_log_temp.shape[1], X_log_temp.shape[1], optimizer, gate)
				sess.run(tf.global_variables_initializer())
				for i in range(epoch):
					X_log = X_log_temp.copy()
					EPOCH.append(i)
					total_loss = 0
					if gate == 'lstm':
						init_value = np.zeros((1, numberlayer * 2 * sizelayer))
					else:
						init_value = np.zeros((1, numberlayer * sizelayer))
					for n in range(0, (X_log.shape[0] // timestamp) * timestamp, timestamp):
						batch_x = np.expand_dims(X_log.iloc[n: n + timestamp, :], axis = 0)
						batch_y = X_log.iloc[n + 1: n + timestamp + 1, :]
						last_state, _, loss = sess.run([modelnet.last_state,
														modelnet.optimizer,
														modelnet.cost], feed_dict = {modelnet.X: batch_x,
																					 modelnet.Y: batch_y, modelnet.hidden_layer: init_value})
						total_loss += loss
						init_value = last_state
					save_shape = X_log.shape[0] + future
					total_loss /= (X_log.shape[0] // timestamp)
					LOSS.append(total_loss)
					output_predict = np.zeros((save_shape, X_log.shape[1]))
					output_predict[0, :] = X_log.iloc[0, :]
					upper_b = (X_log.shape[0] // timestamp) * timestamp
					if gate == 'lstm':
						init_value = np.zeros((1, numberlayer * 2 * sizelayer))
					else:
						init_value = np.zeros((1, numberlayer * sizelayer))
					for n in range(0, (X_log.shape[0] // timestamp) * timestamp, timestamp):
						out_logits, last_state = sess.run([modelnet.logits, modelnet.last_state], feed_dict = {modelnet.X:np.expand_dims(X_log.iloc[n: n + timestamp, :], axis = 0), modelnet.hidden_layer: init_value})
						init_value = last_state
						output_predict[n + 1: n + timestamp + 1, :] = out_logits
					out_logits, last_state = sess.run([modelnet.logits, modelnet.last_state], feed_dict = {modelnet.X:np.expand_dims(X_log.iloc[upper_b:, :], axis = 0), modelnet.hidden_layer: init_value})
					init_value = last_state
					output_predict[upper_b + 1: X_log.shape[0] + 1, :] = out_logits
					X_log.loc[X_log.shape[0]] = out_logits[-1, :]
					lastdate = date_ori[-1]
					while True:
						lastdate = lastdate+timedelta(days=1)
						if lastdate.strftime("%A") not in ['Saturday','Sunday']:
							date_ori.append(lastdate)
							break
					for n in range(future - 1):
						out_logits, last_state = sess.run([modelnet.logits, modelnet.last_state], feed_dict = {modelnet.X:np.expand_dims(X_log.iloc[-timestamp:, :], axis = 0), modelnet.hidden_layer: init_value})
						init_value = last_state
						output_predict[X_log.shape[0], :] = out_logits[-1, :]
						X_log.loc[X_log.shape[0]] = out_logits[-1, :]
						lastdate = date_ori[-1]
						while True:
							lastdate = lastdate+timedelta(days=1)
							if lastdate.strftime("%A") not in ['Saturday','Sunday']:
								date_ori.append(lastdate)
								break
					valid_loss=np.mean(np.square(X_log_temp.iloc[int(split * X_log_temp.shape[0]):, :].values - output_predict[int(split * X_log_temp.shape[0]):X_log_temp.shape[0], :]))
					X_out = minmax.inverse_transform(output_predict).T.tolist()
					VALID_LOSS.append(valid_loss)
					status = 'epoch: %d, loss: %f, validation loss: %f' % (i + 1, total_loss, valid_loss)
					x_range_original = np.arange(X.shape[0]).tolist()
					x_range_future = np.arange(save_shape).tolist()
					X_T = X.values.T.tolist()
					X_T_arr = X.values.T
					X_out_arr = np.array(X_out)
					quantile_real, linear_real, quantile_predict, linear_predict = [], [], [], []
					kde_real, bar_real, kde_predict, bar_predict = [], [], [], []
					for n in range(len(columntoselect)):
						# REAL DATA
						# quantile
						quan, _ = stats.probplot(X_T_arr[n, :])
						quan_x = quan[0]
						quan_y = quan[1]
						regr.fit(quan_x.reshape([-1, 1]), quan_y.reshape([-1, 1]))
						pred = regr.predict(quan_x.reshape([-1, 1]))
						quantile_real.append([quan_x.tolist(), quan_y.tolist()])
						linear_real.append(pred[:, 0].tolist())
						# histogram
						z = sns.distplot(X_T_arr[n, :]).get_lines()[0].get_data()
						plt.cla()
						kde_real.append([z[0].tolist(), z[1].tolist()])
						hist, bins = np.histogram(X_T_arr[n, :], bins=min(freedman_diaconis_bins(X_T_arr[n, :]), 50), normed=True)
						center = (bins[:-1] + bins[1:]) / 2
						bar_real.append([center.tolist(), hist.tolist()])
						# PREDICT DATA
						# quantile
						quan, _ = stats.probplot(X_out_arr[n, :])
						quan_x = quan[0]
						quan_y = quan[1]
						regr.fit(quan_x.reshape([-1, 1]), quan_y.reshape([-1, 1]))
						pred = regr.predict(quan_x.reshape([-1, 1]))
						quantile_predict.append([quan_x.tolist(), quan_y.tolist()])
						linear_predict.append(pred[:, 0].tolist())
						# histogram
						z = sns.distplot(X_out_arr[n, :]).get_lines()[0].get_data()
						plt.cla()
						kde_predict.append([z[0].tolist(), z[1].tolist()])
						hist, bins = np.histogram(X_out_arr[n, :], bins=min(freedman_diaconis_bins(X_out_arr[n, :]), 50), normed=True)
						center = (bins[:-1] + bins[1:]) / 2
						bar_predict.append([center.tolist(), hist.tolist()])
					del X_T_arr
					del X_out_arr
					date_temp=pd.Series(date_ori).dt.strftime(date_format='%Y-%m-%d').tolist()
					net_namespace.emit('senddata', json.dumps({'id': idsocket, 'data': {'color': color_array, 'ori': X_T, 'ori-range': date_temp[:-future], 'predict-range': date_temp,
																						'epoch': EPOCH, 'loss': LOSS, 'valid': VALID_LOSS, 'columns': columntoselect, 'predict': X_out, 'status': status,
																					   'quantile-real': quantile_real, 'linear_real': linear_real,
																					   'quantile_predict': quantile_predict, 'linear_predict': linear_predict,
																					   'kde_real': kde_real, 'bar_real': bar_real, 'kde_predict': kde_predict, 'bar_predict': bar_predict}}))
					time.sleep(1)
				return json.dumps({'status': 'done'})

			except Exception as e:
				print(e)
				tf.reset_default_graph()
				return json.dumps({'error': 'Incompatible shapes, please change timestamp value'})

		except Exception as e:
			return json.dumps({'error': str(e)})
	else:
		return json.dumps({'error': 'accept POST request only'})

if __name__ == '__main__':
	app.run(host = '0.0.0.0', threaded = True, port = 8095)
