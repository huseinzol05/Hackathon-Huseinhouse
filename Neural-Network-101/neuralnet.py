import model
import tensorflow as tf
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import time
import json
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import Normalizer
from sklearn.decomposition import PCA
from sklearn.decomposition import TruncatedSVD
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS
from socketIO_client import SocketIO, BaseNamespace
import os
import ast
from threading import Thread
sns.set()
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/opt/lampp/htdocs/img/neuralnet/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

socketIO = SocketIO('', 9001)
net_namespace = socketIO.define(BaseNamespace, '/neuralnet')

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

            pcaorsvd = request.form['pcaortsne']
            normalization = request.form['normalization']
            standardization = request.form['standardization']
            targetcolumn = request.form['targetcolumn']
            split = request.form['split']
            numberlayer = int(request.form['numberlayer'])
            enabledropout = ast.literal_eval(request.form['enabledropout'])
            activationarray = request.form['activationarray']
            sizearray = request.form['sizearray']
            optimizer = request.form['optimizer']
            dropoutarray = request.form['dropoutarray']
            learningrate = float(request.form['learningrate'])
            batch_size = int(request.form['batchsize'])
            selectpenalty = ast.literal_eval(request.form['selectpenalty'])
            penalty = request.form['penalty']
            selectoutputlayer = request.form['selectoutputlayer']
            selectloss = request.form['selectloss']
            columntoselect = request.form['columntoselect']
            idsocket = request.form['id']
            epoch = int(request.form['epoch'])
            net_namespace.emit('privatesocket', {'id':idsocket})
            if dropoutarray == '':
                dropoutarray = [0] * numberlayer
            else:
                try:
                    dropoutarray = str(dropoutarray).split(',')
                    for i in range(len(dropoutarray)):
                        dropoutarray[i] = dropoutarray[i].strip()
                    dropoutarray = map(float, dropoutarray)
                except:
                    return json.dumps({'error': 'Fail to parse array of dropout'})
            if penalty == '':
                penalty = 0
            else:
                penalty = float(penalty)

            try:
                split = (100 - int(split)) / 100.0
            except:
                return json.dumps({'error': 'Split must be positive integer only'})

            try:
                dataset = pd.read_csv(UPLOAD_FOLDER + str(f.filename))
            except:
                return json.dumps({'error': 'Fail to read CSV'})

            decompose = PCA if pcaorsvd == 'false' else TruncatedSVD

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

            Y = dataset[[targetcolumn]].values
            label = np.unique(Y).tolist()
            try:
                Y = LabelEncoder().fit_transform(Y)
            except:
                return json.dumps({'error': 'Y already in integer value'})

            onehot_label = np.zeros((Y.shape[0], len(label)), dtype = np.float32)
            for i in range(Y.shape[0]):
                onehot_label[i][Y[i]] = 1.0

            X = dataset[columntoselect].values

            if standardization == 'true':
                try:
                    X = StandardScaler().fit_transform(X)
                except:
                    return json.dumps({'error': 'Fail to standardize, recheck your data'})

            if normalization == 'true':
                try:
                    X = Normalizer().fit_transform(X)
                except:
                    return json.dumps({'error': 'Fail to normalize, recheck your data'})

            try:
                X = decompose(n_components = 2).fit_transform(X)
            except:
                return json.dumps({'error': 'Fail to manifold, recheck your data'})

            X_train, X_test, Y_train, Y_test, label_train, label_test = train_test_split(X, onehot_label, Y, test_size = split)
            EPOCH, LOSS, ACCURACY, VALID_ACC = [], [], [], []

            try:
                sizearray = str(sizearray).split(',')
                for i in range(len(sizearray)):
                    sizearray[i] = sizearray[i].strip()
                sizearray = map(int, sizearray)
            except Exception as e:
                return json.dumps({'error': 'Fail to parse array of layers size'})

            try:
                activationarray = str(activationarray).split(',')
                for i in range(len(activationarray)):
                    activationarray[i] = activationarray[i].strip()
            except:
                return json.dumps({'error': 'Fail to parse array of activation functions'})

            x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
            y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
            xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1), np.arange(y_min, y_max, 0.1))
            y_ = np.arange(y_min, y_max, 0.1)
            contour = np.c_[xx.ravel(), yy.ravel()].astype(np.float32)
            tf.reset_default_graph()
            try:
                sess = tf.InteractiveSession()
                modelnet = model.Model(numberlayer, sizearray, enabledropout, dropoutarray, selectpenalty, penalty, activationarray, selectoutputlayer, selectloss, learningrate, X.shape[1], onehot_label.shape[1], optimizer)
                sess.run(tf.global_variables_initializer())
                for i in range(epoch):
                    EPOCH.append(i)
                    last_time = time.time()
                    total_accuracy = 0
                    total_loss = 0

                    for n in range(0, (X_train.shape[0] // batch_size) * batch_size, batch_size):
                        _, loss = sess.run([modelnet.optimizer, modelnet.cost], feed_dict = {modelnet.X: X_train[n: n + batch_size, :], modelnet.Y: Y_train[n: n + batch_size, :]})
                        acc = sess.run(modelnet.accuracy, feed_dict = {modelnet.X: X_train[n: n + batch_size, :], modelnet.Y: Y_train[n: n + batch_size, :]})

                        total_accuracy += acc
                        total_loss += loss

                    total_accuracy = total_accuracy / (X_train.shape[0] // batch_size)
                    total_loss = total_loss / (X_train.shape[0] // batch_size)
                    VALID_ACC.append(sess.run(modelnet.accuracy, feed_dict = {modelnet.X: X_test, modelnet.Y: Y_test}).tolist())
                    LOSS.append(total_loss)
                    ACCURACY.append(total_accuracy)
                    Z = sess.run(tf.argmax(modelnet.last_l, 1), feed_dict = {modelnet.X: contour})
                    Z = Z.reshape(xx.shape).tolist()
                    status = 'epoch: %d, loss: %f, accuracy: %f, validation: %f' % (i + 1, total_loss, total_accuracy, VALID_ACC[-1])
                    net_namespace.emit('senddata', json.dumps({'id': idsocket, 'data': {'z': Z, 'epoch': EPOCH, 'accuracy': ACCURACY, 'loss': LOSS, 'valid': VALID_ACC, 'xx': xx[0].tolist(), 'y_': y_.tolist(),
                                                               'x': X[:, 0].tolist(), 'y': X[:, 1].tolist(), 'label': label, 'color': Y.tolist(), 'status': status}}))
                    time.sleep(1)
                return json.dumps({'status': 'done'})

            except Exception as e:
                tf.reset_default_graph()
                return json.dumps({'error': 'Value is too large, you need to normalize or standardize the data'})

        except Exception as e:
            return json.dumps({'error': str(e)})
    else:
        return json.dumps({'error': 'accept POST request only'})

if __name__ == '__main__':
    app.run(host = '0.0.0.0', threaded = True, port = 8096)
