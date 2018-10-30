from Detection.MtcnnDetector import MtcnnDetector
from Detection.detector import Detector
from Detection.fcn_detector import FcnDetector
from train_models.mtcnn_model import P_Net, R_Net, O_Net
import numpy as np
import cv2
import scipy.misc
from scipy.stats.mstats import hmean
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
import xgboost as xgb
import pickle
import threading
import time
from socketIO_client import SocketIO, BaseNamespace
import json
from Crypto.PublicKey import RSA
import binascii
import base64
import httplib
import json
import os
import ssl
from threading import Thread
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

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

dict_emotion = {'neutral': 0, 'sadness': 1, 'disgust': 2, 'anger': 3, 'surprise': 4, 'fear': 5, 'happiness': 6}
emotion_batch = []
def receive_events_thread():
    socketIO.wait()
def on_camera_response(*args):
    global emotion_batch
    loads = json.loads(args[0])
    try:
        for i in loads['database']:
            emotion_batch.append(dict_emotion[i['emotion']])
    except Exception as e:
        pass
with open('pubkey', 'rb') as fopen:
	pkeydata = fopen.read()
pubkey = RSA.importKey(pkeydata)
socketIO = SocketIO('https://huseinzol05.dynamic-dns.net', 9001)
camera_namespace = socketIO.define(BaseNamespace, '/sensorcamera')
camera_namespace.on('cameraupdate', on_camera_response)
receive_events_thread = Thread(target=receive_events_thread)
receive_events_thread.daemon = True
receive_events_thread.start()
test_mode = "onet"
thresh = [0.7, 0.1, 0.1]
min_face_size = 24
stride = 2
slide_window = True
shuffle = False
detectors = [None, None, None]
prefix = ['data/MTCNN_model/PNet_landmark/PNet', 'data/MTCNN_model/RNet_landmark/RNet', 'data/MTCNN_model/ONet_landmark/ONet']
epoch = [18, 14, 16]
model_path = ['%s-%s' % (x, y) for x, y in zip(prefix, epoch)]
PNet = FcnDetector(P_Net, model_path[0])
detectors[0] = PNet
RNet = Detector(R_Net, 24, 1, model_path[1])
detectors[1] = RNet
ONet = Detector(O_Net, 48, 1, model_path[2])
detectors[2] = ONet
mtcnn_detector = MtcnnDetector(detectors=detectors, min_face_size=min_face_size,stride=stride, threshold=thresh, slide_window=slide_window)
with open('pca.p', 'rb') as fopen:
    pca = pickle.load(fopen)
with open('xgb.p', 'rb') as fopen:
    clf = pickle.load(fopen)
with open('xgb2.p', 'rb') as fopen:
    clf2 = pickle.load(fopen)
with open('xgb3.p', 'rb') as fopen:
    clf3 = pickle.load(fopen)
labels = ['Unknown', 'Husein']
labels_emotion = ['neutral', 'sadness', 'disgust', 'anger', 'surprise', 'fear', 'happiness']
counts = [0, 0]
ori_image = np.zeros([10, 10, 3])
headers = {"Content-type": "application/json",
           "X-Access-Token": "tcrrl0saWD3rmQ46KsCtxuc5EXy8JRaB60sN"}
conn = httplib.HTTPSConnection("dev.sighthoundapi.com", 
       context=ssl.SSLContext(ssl.PROTOCOL_TLSv1))
def f(f_stop):
    global counts
    global ori_image
    global emotion_batch
    if counts[1] > 10:
        _, img_encoded = cv2.imencode('.jpg', ori_image)
        params = json.dumps({"image": base64.b64encode(img_encoded.tostring())})
        conn.request("POST", "/v1/detections?type=face&faceOption=emotion", params, headers)
        response = conn.getresponse()
        result = json.loads(response.read())
        if result['objects']:
            emotions = np.zeros([7])
            for ob in result['objects']:
                emotions[0] += ob['attributes']['emotionsAll']['neutral']
                emotions[1] += ob['attributes']['emotionsAll']['sadness']
                emotions[2] += ob['attributes']['emotionsAll']['disgust']
                emotions[3] += ob['attributes']['emotionsAll']['anger']
                emotions[4] += ob['attributes']['emotionsAll']['surprise']
                emotions[5] += ob['attributes']['emotionsAll']['fear']
                emotions[6] += ob['attributes']['emotionsAll']['happiness']
            emotions = emotions / len(result['objects'])
            emotion_batch.append(dict_emotion[labels_emotion[np.argmax(emotions)]])
            z = sns.distplot(emotion_batch).get_lines()[0].get_data()
            plt.cla()
            hist, bins = np.histogram(emotion_batch, bins=min(freedman_diaconis_bins(emotion_batch), 50), normed=True)
            center = (bins[:-1] + bins[1:]) / 2
            camera_namespace.emit('cameraupdate', json.dumps({'val': labels[1], 'emotion': labels_emotion[np.argmax(emotions)], 'emotions': emotions.tolist()}))
        else:
            camera_namespace.emit('cameraupdate', json.dumps({'alert': 'API not reachable'}))
    if counts[0] > 20:
        camera_namespace.emit('cameraupdate', json.dumps({'alert': 'UNAUTHORIZED PERSON INFRONT OF CAMERA'}))
    z = sns.distplot(emotion_batch).get_lines()[0].get_data()
    plt.cla()
    hist, bins = np.histogram(emotion_batch, bins=min(freedman_diaconis_bins(emotion_batch), 50), normed=True)
    center = (bins[:-1] + bins[1:]) / 2
    camera_namespace.emit('cameraupdate', json.dumps({'histogram': [center.tolist(), hist.tolist()], 'kde': [z[0].tolist(), z[1].tolist()],'data': counts}))
    counts = [0, 0]
    if not f_stop.is_set():
        threading.Timer(5, f, [f_stop]).start()
f_stop = threading.Event()
f(f_stop)

class Camera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0)

    def __del__(self):
        self.video.release()
    
    def get_frame(self):
        global ori_image
        _, frame = self.video.read()
        ori_image = np.copy(frame)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        heatmaps = np.zeros((frame.shape[0], frame.shape[1]))
        boxes_c,landmarks = mtcnn_detector.detect(frame)
        for i in range(boxes_c.shape[0]):
            bbox = boxes_c[i, :4]
            score = boxes_c[i, 4]
            corpbbox = [int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])]
            heatmaps[int(bbox[1]): int(bbox[3]), int(bbox[0]) : int(bbox[2])] = 1
            cv2.rectangle(frame, (corpbbox[0], corpbbox[1]), (corpbbox[2], corpbbox[3]), (255, 0, 0), 1)
            cv2.putText(frame, '{:.3f}'.format(score), (corpbbox[0], corpbbox[1] - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            try:
                x = pca.transform(scipy.misc.imresize(gray[int(bbox[1]): int(bbox[3]), int(bbox[0]) : int(bbox[2])], (50, 50)).reshape([1, -1]))
                out_T = np.vstack([clf.predict(xgb.DMatrix(x), ntree_limit=clf.best_ntree_limit), clf2.predict(xgb.DMatrix(x), ntree_limit=clf.best_ntree_limit), clf3.predict(xgb.DMatrix(x), ntree_limit=clf.best_ntree_limit)]).T
                selected = np.around(hmean(out_T, axis=1)).astype('int')[0]
                counts[selected] += 1
                cv2.putText(frame, 'hmean {:s}'.format(labels[selected]), (corpbbox[0], corpbbox[1] + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            except Exception as e:
                print e
                pass
        for i in range(landmarks.shape[0]):
            for j in range(len(landmarks[i])/2):
                cv2.circle(frame, (int(landmarks[i][2*j]),int(int(landmarks[i][2*j+1]))), 2, (0,0,255))
        heatmaps = heatmaps * 50
        heatmaps = np.stack((heatmaps,)*3, axis = -1).astype('uint8')
        frame = np.concatenate([frame, heatmaps], axis = 1)
        return cv2.imencode('.jpg', frame)[1].tobytes()