import tensorflow as tf
import numpy as np
import settings_emotion

class Model:
	
	def __init__(self, output_shape):
		
		# image must size 90, 90, 1
		self.X = tf.placeholder('float', [None, settings_emotion.picture_dimension, settings_emotion.picture_dimension, 1])
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
		
		with tf.name_scope("conv5-8"):
			conv1 = tf.nn.relu(conv_layer(self.X, 5, 8, '8'))
			
		with tf.name_scope("conv5-16-1"):
			conv2 = tf.nn.relu(conv_layer(conv1, 5, 16, '16-1'))
			
		with tf.name_scope("conv5-16-2"):
			conv3 = tf.nn.relu(conv_layer(conv2, 5, 16, '16-2'))
			
		with tf.name_scope("maxpool-1"):
			pooling1 = pooling(conv3, k = 3, stride = 2)
		
		with tf.name_scope("conv5-64-right"):
			conv4_right = tf.nn.relu(conv_layer(pooling1, 5, 64, '64-right-1'))
			
		with tf.name_scope("conv5-64-right-2"):
			conv5_right = tf.nn.relu(conv_layer(conv4_right, 5, 64, '64-right-2'))
		
		with tf.name_scope("avgpool-1"):
			pooling2_right = tf.nn.max_pool(conv5_right, ksize = [1, 3, 3, 1], strides = [1, 2, 2, 1], padding = 'SAME')
			
		with tf.name_scope("conv5-32-left"):
			conv6_left = tf.nn.relu(conv_layer(pooling1, 3, 32, '32-left'))
			
		with tf.name_scope("conv5-64-left"):
			conv7_left = tf.nn.relu(conv_layer(conv6_left, 3, 64, '64-left'))
			
		with tf.name_scope("avgpool-2"):
			pooling2_left = tf.nn.max_pool(conv7_left, ksize = [1, 3, 3, 1], strides = [1, 2, 2, 1], padding = 'SAME')
			
		with tf.name_scope("concat"):
			concat = tf.concat([pooling2_left, pooling2_right], axis = 3)
		
		with tf.name_scope("maxpool-1"):
			pooling3 = pooling(concat, k = 3, stride = 2)
			
		with tf.name_scope("conv5-64-right"):
			conv8 = tf.nn.relu(conv_layer(pooling3, 5, 256, '256'))
			
		with tf.name_scope("maxpool-2"):
			pooling4 = pooling(conv8, stride = 2)
			
		with tf.name_scope("fc-1024-1"):
			pooling4 = tf.reshape(pooling4, [-1, 6 * 6 * 256])
			fc1 = tf.nn.sigmoid(fully_connected(pooling4, 1024, '512_1'))
			
		with tf.name_scope("fc-256-1"):
			fc2 = tf.nn.sigmoid(fully_connected(fc1, 256, '256_1'))
		
		with tf.name_scope("fc-256-2"):
			fc3 = tf.nn.sigmoid(fully_connected(fc2, 256, '256_2'))
			
		with tf.name_scope("logits"):
			self.logits = fully_connected(fc3, output_shape, 'logits')
			
		self.outputs = tf.nn.softmax(self.logits)
		
		self.cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels = self.Y, logits = self.logits))
		self.optimizer = tf.train.AdamOptimizer(settings_emotion.learning_rate).minimize(self.cost)
		
		correct_prediction = tf.equal(tf.argmax(self.logits, 1), tf.argmax(self.Y, 1))
		self.accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))
'''		
g = tf.Graph()

with g.as_default():
	model = Model(3)
	
tf.summary.FileWriter("logs", g).close()
'''