import os
import numpy as np
import tensorflow as tf
from model import ssd_vgg_512, np_methods
from core import preprocess, visualization
from scipy.misc import imread
from detection import *
from settings import *
slim = tf.contrib.slim

img = imread('img/img.jpg')
rclasses, rscores, rbboxes =  process_image(img)

# using matplotlib
visualization.plt_bboxes(img, rclasses, rscores, rbboxes, vandalism_sess, model, picture_dimension, distancelabel = 'km')

# using opencv2
#visualization.bboxes_draw_on_img(img, rclasses, rscores, rbboxes)
#cv2.imwrite("output.jpg", cv2.cvtColor(img, cv2.COLOR_RGB2BGR))


