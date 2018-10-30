import numpy as np
import cv2
import settings
import os
import model
import model_vandalism
from utils import VOC
import tensorflow as tf
from scipy import stats
from scipy import misc
from socketIO_client_nexus import SocketIO, BaseNamespace
import json
from threading import Thread
import threading
import time
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

socketIO = SocketIO('http://192.168.43.168', 5001)
rekathon_namespace = socketIO.define(BaseNamespace, '/rekathon')

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


sess = tf.InteractiveSession()
model = model.Model(training = False)
sess.run(tf.global_variables_initializer())
saver = tf.train.Saver(tf.global_variables())
boundary1 = settings.cell_size * settings.cell_size * settings.num_class
boundary2 = boundary1 + settings.cell_size * settings.cell_size * settings.box_per_cell

saver.restore(sess, os.getcwd() + '/YOLO_small.ckpt')
behavior = ['abnormal', 'normal']
count_person, count_abnormal, result_behavior = 0, 0, []
global_behavior = []

vandalism_graph = tf.Graph()
with vandalism_graph.as_default():
    model_vand = model_vandalism.Model(2)

vandalism_sess = tf.Session(graph = vandalism_graph)

with vandalism_sess.as_default():
    with vandalism_graph.as_default():
        tf.global_variables_initializer().run()
        tf.train.Saver(tf.global_variables()).restore(vandalism_sess, os.getcwd() + '/model.ckpt')
        
def f(f_stop):
    global count_person
    global result_behavior
    global count_abnormal
    global global_behavior
    if len(result_behavior) > 0:
        try:
            global_behavior += result_behavior
            z = sns.distplot(global_behavior).get_lines()[0].get_data()
            plt.cla()
            hist, bins = np.histogram(global_behavior, bins=min(freedman_diaconis_bins(global_behavior), 50), normed=True)
            center = (bins[:-1] + bins[1:]) / 2
            rekathon_namespace.emit('frontend', json.dumps({'histogram': [center.tolist(), hist.tolist()], 'kde': [z[0].tolist(), z[1].tolist()],'person': count_person, 'abnormal': count_abnormal}))
            count_person, count_abnormal, result_behavior = 0, 0, []
        except:
            pass
    if not f_stop.is_set():
        threading.Timer(5, f, [f_stop]).start()
f_stop = threading.Event()
f(f_stop)

def draw_result(img, result, copy):
    global count_person
    global result_behavior
    global count_abnormal
    for i in range(len(result)):
        try:
            x = int(result[i][1])
            y = int(result[i][2])
            w = int(result[i][3] / 2)
            h = int(result[i][4] / 2)
            probs = vandalism_sess.run(model_vand.outputs, feed_dict = {model_vand.X: np.expand_dims(misc.imresize(copy[y-h: y + h, x-w: x + w, :],(64, 64)), axis = 0)})[0]
            count_person += 1
            arg = np.argmax(probs)
            result_behavior.append(arg)
            if arg == 0:
                count_abnormal += 1
            cv2.rectangle(img, (x - w, y - h), (x + w, y + h), (54, 162, 235), 2)
            cv2.rectangle(img, (x - w, y - h - 40), (x + w, y - h), (125, 125, 125), -1)
            cv2.putText(img, result[i][0] + ' : %.2f' % (result[i][5]), (x - w + 5, y - h - 7), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.CV_AA)
            cv2.putText(img, behavior[arg], (x - w + 5, y - h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.CV_AA)
        except:
            return
        
def detect(img):
    img_h, img_w, _ = img.shape
    inputs = cv2.resize(img, (settings.image_size, settings.image_size))
    inputs = cv2.cvtColor(inputs, cv2.COLOR_BGR2RGB).astype(np.float32)
    inputs = (inputs / 255.0) * 2.0 - 1.0
    inputs = np.reshape(inputs, (1, settings.image_size, settings.image_size, 3))
    result = detect_from_cvmat(inputs)[0]

    for i in range(len(result)):
        result[i][1] *= (1.0 * img_w / settings.image_size)
        result[i][2] *= (1.0 * img_h / settings.image_size)
        result[i][3] *= (1.0 * img_w / settings.image_size)
        result[i][4] *= (1.0 * img_h / settings.image_size)
    return result

def detect_from_cvmat(inputs):
    net_output = sess.run(model.logits, feed_dict = {model.images: inputs})
    results = []
    for i in range(net_output.shape[0]):
        results.append(interpret_output(net_output[i]))

    return results

def iou(box1, box2):
    tb = min(box1[0] + 0.5 * box1[2], box2[0] + 0.5 * box2[2]) - max(box1[0] - 0.5 * box1[2], box2[0] - 0.5 * box2[2])
    lr = min(box1[1] + 0.5 * box1[3], box2[1] + 0.5 * box2[3]) - max(box1[1] - 0.5 * box1[3], box2[1] - 0.5 * box2[3])
    if tb < 0 or lr < 0:
        intersection = 0
    else:
        intersection = tb * lr
    return intersection / (box1[2] * box1[3] + box2[2] * box2[3] - intersection)

def interpret_output(output):
    probs = np.zeros((settings.cell_size, settings.cell_size, settings.box_per_cell, len(settings.classes_name)))
    class_probs = np.reshape(output[0 : boundary1], (settings.cell_size, settings.cell_size, settings.num_class))
    scales = np.reshape(output[boundary1 : boundary2], (settings.cell_size, settings.cell_size, settings.box_per_cell))
    boxes = np.reshape(output[boundary2 :], (settings.cell_size, settings.cell_size, settings.box_per_cell, 4))
    offset = np.transpose(np.reshape(np.array([np.arange(settings.cell_size)] * settings.cell_size * settings.box_per_cell), [settings.box_per_cell, settings.cell_size, settings.cell_size]), (1, 2, 0))

    boxes[:, :, :, 0] += offset
    boxes[:, :, :, 1] += np.transpose(offset, (1, 0, 2))
    boxes[:, :, :, :2] = 1.0 * boxes[:, :, :, 0:2] / settings.cell_size
    boxes[:, :, :, 2:] = np.square(boxes[:, :, :, 2:])

    boxes *= settings.image_size

    for i in range(settings.box_per_cell):
        for j in range(settings.num_class):
            probs[:, :, i, j] = np.multiply(class_probs[:, :, j], scales[:, :, i])

    filter_mat_probs = np.array(probs >= settings.threshold, dtype = 'bool')
    filter_mat_boxes = np.nonzero(filter_mat_probs)
    boxes_filtered = boxes[filter_mat_boxes[0], filter_mat_boxes[1], filter_mat_boxes[2]]
    probs_filtered = probs[filter_mat_probs]
    classes_num_filtered = np.argmax(filter_mat_probs, axis = 3)[filter_mat_boxes[0], filter_mat_boxes[1], filter_mat_boxes[2]]

    argsort = np.array(np.argsort(probs_filtered))[::-1]
    boxes_filtered = boxes_filtered[argsort]
    probs_filtered = probs_filtered[argsort]
    classes_num_filtered = classes_num_filtered[argsort]

    for i in range(len(boxes_filtered)):
        if probs_filtered[i] == 0:
            continue
        for j in range(i + 1, len(boxes_filtered)):
            if iou(boxes_filtered[i], boxes_filtered[j]) > settings.IOU_threshold:
                probs_filtered[j] = 0.0

    filter_iou = np.array(probs_filtered > 0.0, dtype = 'bool')
    boxes_filtered = boxes_filtered[filter_iou]
    probs_filtered = probs_filtered[filter_iou]
    classes_num_filtered = classes_num_filtered[filter_iou]

    result = []
    for i in range(len(boxes_filtered)):
        if settings.classes_name[classes_num_filtered[i]] != 'person':
            continue
        result.append([settings.classes_name[classes_num_filtered[i]], boxes_filtered[i][0], boxes_filtered[i][1], boxes_filtered[i][2], boxes_filtered[i][3], probs_filtered[i]])

    return result

class Camera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0)

    def __del__(self):
        self.video.release()
    
    def get_frame(self):
        _, frame = self.video.read()
        frame_copy = cv2.cvtColor(frame.copy(), cv2.COLOR_BGR2RGB)
        result = detect(frame)
        draw_result(frame, result, frame_copy)
        return cv2.imencode('.jpg', frame)[1].tobytes()
        