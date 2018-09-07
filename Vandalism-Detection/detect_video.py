import os
import numpy as np
import tensorflow as tf
import cv2
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
slim = tf.contrib.slim
from model import ssd_vgg_512, np_methods
from core import preprocess, visualization
from detection import *

cap = cv2.VideoCapture('first.mp4')

fourcc = cv2.cv.CV_FOURCC(*'XVID')
out = cv2.VideoWriter('output.avi',fourcc, cv2.cv.CV_CAP_PROP_FPS, (int(cap.get(cv2.cv.CV_CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.cv.CV_CAP_PROP_FRAME_HEIGHT))))

while(cap.isOpened()):
	ret, frame = cap.read()
	rclasses, rscores, rbboxes =  process_image(frame)
	visualization.bboxes_draw_on_img(frame, rclasses, rscores, rbboxes)
	out.write(frame)
	cv2.imshow('frame', frame)
	if cv2.waitKey(1) & 0xFF == ord('q'):
		break

cap.release()
out.release()
cv2.destroyAllWindows()

