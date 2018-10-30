import cv2
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from skimage.feature import hog
from scipy import ndimage as ndi
import numpy as np
import pickle
import tensorflow as tf
import model_flower
import os
import json

sess = tf.InteractiveSession()
model = model_flower.Model(2)
sess.run(tf.global_variables_initializer())
saver = tf.train.Saver(tf.global_variables())
saver.restore(sess, os.getcwd() + "/model.ckpt")

with open('scaler.p', 'rb') as fopen:
    X_scaler = pickle.load(fopen)
with open('clf.p', 'rb') as fopen:
    clf = pickle.load(fopen)

def get_hog_features(img, orient, pix_per_cell, cell_per_block, feature_vec=True):
    features = hog(img, orientations = orient, pixels_per_cell= (pix_per_cell, pix_per_cell),
                   cells_per_block = (cell_per_block, cell_per_block), 
                   transform_sqrt = True, visualise = False, feature_vector = feature_vec)
    return features

def bin_spatial(img, size = (16, 16)):
    return cv2.resize(img, size).ravel()

def color_hist(img, nbins = 32):
    ch1 = np.histogram(img[:,:,0], bins=nbins, range=(0, 256))[0]
    ch2 = np.histogram(img[:,:,1], bins=nbins, range=(0, 256))[0]
    ch3 = np.histogram(img[:,:,2], bins=nbins, range=(0, 256))[0]
    hist = np.hstack((ch1, ch2, ch3))
    return hist

def img_features(feature_image, hist_bins, orient, pix_per_cell, cell_per_block, spatial_size):
    features = []
    features.append(bin_spatial(feature_image, size=spatial_size))
    features.append(color_hist(feature_image, nbins=hist_bins))
    feature_image = cv2.cvtColor(feature_image, cv2.COLOR_LUV2RGB)
    feature_image = cv2.cvtColor(feature_image, cv2.COLOR_RGB2GRAY)
    features.append(get_hog_features(feature_image, orient, pix_per_cell, cell_per_block))
    return features

def slide_window(img, x_start_stop=[None, None], y_start_stop=[None, None], 
                 xy_window=(64, 64), xy_overlap=(0.5, 0.5), parallel=True):

    if x_start_stop[0] == None:
        x_start_stop[0] = 0
    if x_start_stop[1] == None:
        x_start_stop[1] = img.shape[1]
    if y_start_stop[0] == None:
        y_start_stop[0] = 0
    if y_start_stop[1] == None:
        y_start_stop[1] = img.shape[0]    
    xspan = x_start_stop[1] - x_start_stop[0]
    yspan = y_start_stop[1] - y_start_stop[0]
    nx_pix_per_step = np.int(xy_window[0]*(1 - xy_overlap[0]))
    ny_pix_per_step = np.int(xy_window[1]*(1 - xy_overlap[1]))
    nx_buffer = np.int(xy_window[0]*(xy_overlap[0]))
    ny_buffer = np.int(xy_window[1]*(xy_overlap[1]))
    nx_windows = np.int((xspan-nx_buffer)/nx_pix_per_step) 
    ny_windows = np.int((yspan-ny_buffer)/ny_pix_per_step)
    
    def parallelization(ys, xs):
        startx = xs*nx_pix_per_step + x_start_stop[0]
        endx = startx + xy_window[0]
        starty = ys*ny_pix_per_step + y_start_stop[0]
        endy = starty + xy_window[1]
        return ((startx, starty), (endx, endy))
    if not parallel:
        window_list = []
        for ys in range(ny_windows):
            for xs in range(nx_windows):
                window_list.append(parallelization(ys, xs))
    else:
        num_cores = multiprocessing.cpu_count()
        window_list = Parallel(n_jobs=num_cores)(delayed(parallelization)(ys, xs) for xs in range(nx_windows) for ys in range(ny_windows))
    return window_list

def draw_boxes(img, bboxes, texts, color=(0, 0, 255), thick=2):
    imcopy = np.copy(img)
    for no, bbox in enumerate(bboxes):
        cv2.rectangle(imcopy, bbox[0], bbox[1], color, thick)
        try:
            cv2.putText(imcopy, 'prob attraction: ' + str(texts[no]), (bbox[0][0], bbox[0][1] + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, 255, 1)
        except:
            pass
    return imcopy

def extract_feature(image, color_space='RGB', spatial_size=(32, 32), 
                     hist_bins=32, orient=9, pix_per_cell=8, cell_per_block=2):
    if color_space == 'HSV':
        feature_image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    elif color_space == 'LUV':
        feature_image = cv2.cvtColor(image, cv2.COLOR_RGB2LUV)
    elif color_space == 'HLS':
        feature_image = cv2.cvtColor(image, cv2.COLOR_RGB2HLS)
    elif color_space == 'YUV':
        feature_image = cv2.cvtColor(image, cv2.COLOR_RGB2YUV)
    elif color_space == 'YCrCb':
        feature_image = cv2.cvtColor(image, cv2.COLOR_RGB2YCrCb)
    else: 
        feature_image = np.copy(image)
    return np.concatenate(img_features(feature_image, hist_bins, orient, 
                                       pix_per_cell, cell_per_block, spatial_size))

def search_windows(img, windows, clf, scaler, xy_window, color_space='RGB', 
                   spatial_size=(32, 32), hist_bins=32, hist_range=(0, 256), 
                   orient=8, pix_per_cell=8, cell_per_block=2):
    features_list = []
    for wind in windows:
        test_img = cv2.resize(img[wind[0][1]:wind[1][1], wind[0][0]:wind[1][0]], xy_window)
        features = extract_feature(test_img, color_space=color_space, 
                            spatial_size=spatial_size, hist_bins=hist_bins, 
                            orient=orient, pix_per_cell=pix_per_cell, 
                            cell_per_block=cell_per_block)
        features_list.append(features)
    prediction = clf.predict(xgb.DMatrix(scaler.transform(np.array(features_list))))
    return np.array(windows)[np.where(np.around(prediction) == 1)[0]]

def create_heatmap(windows, image_shape):
    background = np.zeros(image_shape[:2])
    for window in windows:
        background[window[0][1]:window[1][1], window[0][0]:window[1][0]] += 1
    return background

def find_windows_from_heatmap(image):
    hot_windows = []
    thres = 0
    image[image <= thres] = 0
    labels = ndi.label(image)
    for flw in range(1, labels[1]+1):
        nonzero = (labels[0] == flw).nonzero()
        nonzeroy = np.array(nonzero[0])
        nonzerox = np.array(nonzero[1])
        bbox = ((np.min(nonzerox), np.min(nonzeroy)), (np.max(nonzerox), np.max(nonzeroy)))
        hot_windows.append(bbox)
    return hot_windows

def combine_boxes(windows, image_shape):
    hot_windows = []
    image = None
    if len(windows) > 0:
        image = create_heatmap(windows, image_shape)
        hot_windows = find_windows_from_heatmap(image)
    return hot_windows

color_space = 'HLS'
orient = 8
pix_per_cell = 8
cell_per_block = 2
spatial_size = (16, 16)
hist_bins = 32
xy_window = (64, 64)
augmentation_count = 0
count = 0
probs = []

class Camera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0)

    def __del__(self):
        self.video.release()
    
    def get_frame(self):
        _, img = self.video.read()
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        windows = slide_window(img, x_start_stop=[None, None], y_start_stop=[0, img.shape[0] / 2], xy_window=(128, 128), xy_overlap=(0.85, 0.85), parallel = False)
        hot_windows = search_windows(img_rgb, windows, clf, X_scaler, xy_window, color_space=color_space, 
                        spatial_size=spatial_size, hist_bins=hist_bins, 
                        orient=orient, pix_per_cell=pix_per_cell, 
                        cell_per_block=cell_per_block)
        labels = create_heatmap(hot_windows, img.shape)
        labels[np.nonzero(labels)] = 255
        labels = np.stack((labels,)*3, axis = -1)
        labels = labels.astype('uint8')
        hot_windows = combine_boxes(hot_windows, img.shape)
        global count
        global probs
        if count % 10 == 0:
            img_test = np.zeros((len(hot_windows), 256, 256, 3))
            for no, hot in enumerate(hot_windows):
                img_test[no, :, :, :] = cv2.resize(img_rgb[hot[0][1]: hot[1][1], hot[0][0]: hot[1][0], :], (256, 256))
            probs = sess.run(model.outputs, feed_dict = {model.X: img_test})[:, 1].tolist()
            count = 1
            #py_socket.emit("cameraupdate", json.dumps({'status': 'OK', 'msg': probs}))
        img = cv2.addWeighted(labels,0.5, img, 0.5, 0)
        img = np.concatenate([draw_boxes(img, hot_windows, probs, color=(0, 0, 255), thick=2), labels], axis = 1)
        count += 1
        return cv2.imencode('.jpg', img)[1].tobytes()