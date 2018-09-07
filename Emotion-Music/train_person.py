import tensorflow as tf
import numpy as np
from scipy import misc
import model_person
import utils_person
import os
import time
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import settings_person
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn import metrics
from sklearn.cross_validation import train_test_split

data, output_dimension, label = utils_person.get_dataset()
data, data_test = train_test_split(data, test_size = 0.1)

sess = tf.InteractiveSession()

model = model_person.Model(output_dimension)
sess.run(tf.global_variables_initializer())
saver = tf.train.Saver(tf.global_variables())
        
LOST, ACC_TRAIN, ACC_TEST = [], [], []
    
for i in xrange(settings_person.epoch):
    total_cost, total_accuracy, last_time = 0, 0, time.time()
        
    for k in xrange(0, (data.shape[0] // settings_person.batch_size) * settings_person.batch_size, settings_person.batch_size):
            
        emb_data = np.zeros((settings_person.batch_size, settings_person.picture_dimension, settings_person.picture_dimension, 1), dtype = np.float32)
        emb_data_label = np.zeros((settings_person.batch_size, output_dimension), dtype = np.float32)
            
        for x in xrange(settings_person.batch_size):
                
            image = misc.imread('dataperson/' + data[k + x, 0])
            image = misc.imresize(image, (settings_person.picture_dimension, settings_person.picture_dimension))
                
            if len(image.shape) > 2:
                image = np.mean(image, -1)

            emb_data_label[x, int(data[k + x, 1])] = 1.0
            emb_data[x, :, :, :] = image.reshape([image.shape[0], image.shape[1], 1])
           
        _, loss = sess.run([model.optimizer, model.cost], feed_dict = {model.X : emb_data, model.Y : emb_data_label})
        accuracy = sess.run(model.accuracy, feed_dict = {model.X : emb_data, model.Y : emb_data_label})
        total_cost += loss
        total_accuracy += accuracy
        
        
    total_accuracy /= (data.shape[0] // settings_person.batch_size)
    total_cost /= (data.shape[0] // settings_person.batch_size)
    ACC_TRAIN.append(total_accuracy)
    LOST.append(total_cost)
        
    print "epoch: " + str(i + 1) + ", loss: " + str(total_cost) + ", accuracy: " + str(total_accuracy) + ", s / epoch: " + str(time.time() - last_time)
    emb_data = np.zeros((data_test.shape[0], settings_person.picture_dimension, settings_person.picture_dimension, 1), dtype = np.float32)
    emb_data_label = np.zeros((data_test.shape[0], output_dimension), dtype = np.float32)
	
    for x in xrange(data_test.shape[0]):
        image = misc.imread('dataperson/' + data_test[x, 0])
        image = misc.imresize(image, (settings_person.picture_dimension, settings_person.picture_dimension))
		
        if len(image.shape) > 2:
            image = np.mean(image, -1)

        emb_data_label[x, int(data_test[x, 1])] = 1.0
        emb_data[x, :, :, :] = image.reshape([image.shape[0], image.shape[1], 1])
		
    accuracy, logits = sess.run([model.accuracy, tf.cast(tf.argmax(model.logits, 1), tf.int32)], feed_dict = {model.X : emb_data, model.Y : emb_data_label})
    ACC_TEST.append(accuracy)
    print 'testing accuracy: ' + str(accuracy)
    print(metrics.classification_report(data_test[:, 1].astype(int), logits, target_names = label))

saver.save(sess, os.getcwd() + "/model.ckpt")
plt.figure(figsize = (20, 10))
xtick = [i for i in xrange(len(LOST))]
plt.subplot(1, 2, 1)
plt.plot(xtick, LOST)
plt.subplot(1, 2, 2)
plt.plot(xtick, ACC_TRAIN, label = 'acc train')
plt.plot(xtick, ACC_TEST, label = 'acc test')
plt.legend()
plt.savefig('plot.png')