import model_vandalism
import tensorflow as tf
import numpy as np
from scipy import misc
from settings import *
import os

labels = ['negative', 'positive']

dataset = []
for i in range(len(labels)):
	images = os.listdir(labels[i])
	for img in images:
		dataset.append([labels[i] + '/' + img, i])		
dataset = np.array(dataset)
np.random.shuffle(dataset)

sess = tf.InteractiveSession()
model = model_vandalism.Model(len(labels))
sess.run(tf.global_variables_initializer())
saver = tf.train.Saver(tf.global_variables())

try:
	saver.restore(sess, os.getcwd() + "/model.ckpt")
	print "done load checkpoint"
except:
	print "start from fresh variables"

for i in range(epoch):
	total_lost, total_acc = 0, 0
	for k in range(0, (dataset.shape[0] // batch_size) * batch_size, batch_size):
		batch_x = np.zeros((batch_size, picture_dimension, picture_dimension, 3))
		batch_y = np.zeros((batch_size, len(labels)))
		for n in range(batch_size):
			batch_x[n, :, :, :] = misc.imresize(misc.imread(dataset[k + n, 0]), (picture_dimension, picture_dimension))
			batch_y[n, int(dataset[k + n, 1])] = 1.0
		loss, _ = sess.run([model.cost, model.optimizer], feed_dict = {model.X: batch_x, model.Y: batch_y})
		total_acc += sess.run(model.accuracy, feed_dict = {model.X: batch_x, model.Y: batch_y})
		total_lost += loss
	total_lost /= (dataset.shape[0] // batch_size)
	total_acc /= (dataset.shape[0] // batch_size)
	print "epoch: " + str(i + 1) + ", avg loss: " + str(total_lost) + ", avg accuracy: " + str(total_acc)
	saver.save(sess, os.getcwd() + "/model.ckpt")