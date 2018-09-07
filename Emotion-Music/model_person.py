import tensorflow as tf
import numpy as np
import settings_person

class Model:
	
	def __init__(self, output_shape):
		
		# image must size 100, 100, 1
		self.X = tf.placeholder('float', [None, settings_person.picture_dimension, settings_person.picture_dimension, 1])
		self.Y = tf.placeholder('float', [None, output_shape])
		
		def conv_layer(x, conv, out_shape, name, stride = 1):
			w = tf.Variable(tf.truncated_normal([conv, conv, int(x.shape[3]), out_shape]), name = name + '_w')
			b = tf.Variable(tf.truncated_normal([out_shape], stddev = 0.01), name = name + '_b')
			return tf.nn.conv2d(x, w, [1, stride, stride, 1], padding = 'SAME') + b
		
		def fully_connected(x, out_shape, name):
			w = tf.Variable(tf.truncated_normal([int(x.shape[1]), out_shape]), name = name + '_fc_w')
			b = tf.Variable(tf.truncated_normal([out_shape], stddev = 0.01), name = name + '_fc_b')
			return tf.matmul(x, w) + b
		
		def pooling(x, k = 2, stride = 2):
			return tf.nn.max_pool(x, ksize = [1, k, k, 1], strides = [1, stride, stride, 1], padding = 'SAME')
		
		with tf.name_scope("conv5-4-1"):
			conv1 = tf.nn.relu(conv_layer(self.X, 5, 4, '4-1'))
			
		with tf.name_scope("maxpool-1"):
			pooling1 = pooling(conv1, stride = 2)
		
		with tf.name_scope("conv5-4-2"):
			conv2 = tf.nn.relu(conv_layer(pooling1, 5, 4, '4-2'))
			
		with tf.name_scope("conv5-8-1"):
			conv3 = tf.nn.relu(conv_layer(conv2, 5, 8, '8-1'))
			
		with tf.name_scope("maxpool-2"):
			pooling2 = pooling(conv3, stride = 2)
			
		with tf.name_scope("conv3-32-1"):
			conv4 = tf.nn.relu(conv_layer(pooling2, 3, 32, '32-1', stride = 2))
			
		with tf.name_scope("maxpool-3"):
			pooling3 = pooling(conv4, stride = 2)
	
		with tf.name_scope("fc-512-1"):
			pooling3 = tf.reshape(pooling3, [-1, 7 * 7 * 32])
			fc1 = tf.nn.relu(fully_connected(pooling3, 512, '512_1'))
		
		with tf.name_scope("fc-128-1"):
			fc2 = tf.nn.relu(fully_connected(fc1, 128, '128_1'))
			
		with tf.name_scope("logits"):
			self.logits = fully_connected(fc2, output_shape, 'logits')
			
		self.outputs = tf.nn.softmax(self.logits)
		
		self.cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels = self.Y, logits = self.logits))
		self.optimizer = tf.train.AdamOptimizer(settings_person.learning_rate).minimize(self.cost)
		
		correct_prediction = tf.equal(tf.argmax(self.logits, 1), tf.argmax(self.Y, 1))
		self.accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))
'''		
g = tf.Graph()

with g.as_default():
	model = Model(3)
	
tf.summary.FileWriter("logs", g).close()
'''