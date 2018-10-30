import cv2
import matplotlib.pyplot as plt
import numpy as np
import model_flower
import tensorflow as tf
from scipy import misc
from settings import *
import os

# disable tensorflow warning/debug
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# use cpu to save GPU RAM
os.environ['CUDA_VISIBLE_DEVICES'] = ''

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

img = misc.imread('/home/huseinzol05/Desktop/crop/dead-17904_960_720.jpg')
img = misc.imresize(img, (picture_dimension, picture_dimension))
img = np.expand_dims(img, 0)
probs = sess.run(model.outputs, feed_dict = {model.X: img})[0]
			
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
			xmin = img.shape[1] - i
			break
	for i in reversed(range(img.shape[1])):
		if np.where((img[:, i, 1] > 0) == True)[0].shape[0] > 0:
			xmax = img.shape[1] - i + 2
			break
	return ymax, xmax, ymin, xmin

image = cv2.imread('/home/huseinzol05/Desktop/crop/dead-17904_960_720.jpg')
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
lower_green = np.array([30, 20, 20])
upper_green = np.array([90, 255, 255])
mask = cv2.inRange(hsv, lower_green, upper_green)
mask = cv2.bitwise_not(mask)
res = cv2.bitwise_and(image, image, mask = mask)
res[res > 200] = 255
res[res < 200] = 0
ymax, xmax, ymin, xmin = get_boundary(res)
img_pred = cv2.addWeighted(res,0.5,image,0.5, 0)
fig = plt.figure(figsize = (15, 10))
plt.imshow(cv2.cvtColor(img_pred, cv2.COLOR_BGR2RGB))
rect = plt.Rectangle((xmin, ymin), xmax - xmin, ymax - ymin, fill = False, edgecolor = (1.0, 165 / 255.0, 0), linewidth= 5)
plt.gca().add_patch(rect)
plt.gca().text(xmax, ymax - 2,'{:s}'.format('prob attraction: ' + str(probs[1])), 
							   bbox=dict(facecolor = (1.0, 165 / 255.0, 0), alpha=0.5), fontsize=25, color='white')
plt.axis('off')
plt.savefig('percent2.jpg', bbox_inches='tight')
