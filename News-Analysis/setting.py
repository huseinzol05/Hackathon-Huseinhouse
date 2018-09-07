import os
import rnn
import pickle
import tensorflow as tf
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['CUDA_VISIBLE_DEVICES'] = ''
DIMENSION = 300
NUM_LAYERS = 2
SIZE_LAYER = 256
BIAS_LEN = 20
BIAS_LABEL = ['neutral','partisan']
EMOTION_LEN = 20
EMOTION_LABEL = ['anger', 'fear', 'joy', 'love', 'sadness', 'surprise']
IRONY_LEN = 20
IRONY_LABEL = ['negative','positive']
MESSAGE_LEN = 20
MESSAGE_LABEL = ['attack', 'constituency', 'information', 'media', 'mobilization', 'other', 'personal', 'policy', 'support']
POLARITY_LEN = 20
POLARITY_LABEL = ['negative','positive']
SENTIMENT_LEN = 60
SENTIMENT_LABEL = ['negative','positive']
SUBJECTIVITY_LEN = 20
SUBJECTIVITY_LABEL = ['negative','positive']
LOCATION = os.getcwd()

bias_graph = tf.Graph()
with bias_graph.as_default():
    bias_model = rnn.Model(NUM_LAYERS, SIZE_LAYER, DIMENSION, len(BIAS_LABEL), 1)
    bias_sess = tf.InteractiveSession()
    bias_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(bias_sess, LOCATION + "/bias/rnn-bias.ckpt")
with open(LOCATION + "/bias/dict-bias.p",'rb') as fopen:
    bias_dict = pickle.load(fopen)
with open(LOCATION + "/bias/vector-bias.p",'rb') as fopen:
    bias_vector = pickle.load(fopen)

emotion_graph = tf.Graph()
with emotion_graph.as_default():
    emotion_model = rnn.Model(NUM_LAYERS, SIZE_LAYER, DIMENSION, len(EMOTION_LABEL), 1)
    emotion_sess = tf.InteractiveSession()
    emotion_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(emotion_sess, LOCATION + "/emotion/rnn-emotion.ckpt")
with open(LOCATION + "/emotion/dict-emotion.p",'rb') as fopen:
    emotion_dict = pickle.load(fopen)
with open(LOCATION + "/emotion/vector-emotion.p",'rb') as fopen:
    emotion_vector = pickle.load(fopen)

irony_graph = tf.Graph()
with irony_graph.as_default():
    irony_model = rnn.Model(NUM_LAYERS, SIZE_LAYER, DIMENSION, len(IRONY_LABEL), 1)
    irony_sess = tf.InteractiveSession()
    irony_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(irony_sess, LOCATION + "/irony/rnn-irony.ckpt")
with open(LOCATION + "/irony/dict-irony.p",'rb') as fopen:
    irony_dict = pickle.load(fopen)
with open(LOCATION + "/irony/vector-irony.p",'rb') as fopen:
    irony_vector = pickle.load(fopen)

message_graph = tf.Graph()
with message_graph.as_default():
    message_model = rnn.Model(NUM_LAYERS, SIZE_LAYER, DIMENSION, len(MESSAGE_LABEL), 1)
    message_sess = tf.InteractiveSession()
    message_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(message_sess, LOCATION + "/message/rnn-message.ckpt")
with open(LOCATION + "/message/dict-message.p",'rb') as fopen:
    message_dict = pickle.load(fopen)
with open(LOCATION + "/message/vector-message.p",'rb') as fopen:
    message_vector = pickle.load(fopen)

polarity_graph = tf.Graph()
with polarity_graph.as_default():
    polarity_model = rnn.Model(NUM_LAYERS, SIZE_LAYER, DIMENSION, len(POLARITY_LABEL), 1)
    polarity_sess = tf.InteractiveSession()
    polarity_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(polarity_sess, LOCATION + "/polarity/rnn-polarity.ckpt")
with open(LOCATION + "/polarity/dict-polarity.p",'rb') as fopen:
    polarity_dict = pickle.load(fopen)
with open(LOCATION + "/polarity/vector-polarity.p",'rb') as fopen:
    polarity_vector = pickle.load(fopen)

sentiment_graph = tf.Graph()
with sentiment_graph.as_default():
    sentiment_model = rnn.Model(NUM_LAYERS, SIZE_LAYER, DIMENSION, len(SENTIMENT_LABEL), 1)
    sentiment_sess = tf.InteractiveSession()
    sentiment_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(sentiment_sess, LOCATION + "/sentiment/rnn-sentiment.ckpt")
with open(LOCATION + "/sentiment/dict-sentiment.p",'rb') as fopen:
    sentiment_dict = pickle.load(fopen)
with open(LOCATION + "/sentiment/vector-sentiment.p",'rb') as fopen:
    sentiment_vector = pickle.load(fopen)

subjectivity_graph = tf.Graph()
with subjectivity_graph.as_default():
    subjectivity_model = rnn.Model(NUM_LAYERS, SIZE_LAYER, DIMENSION, len(SUBJECTIVITY_LABEL), 1)
    subjectivity_sess = tf.InteractiveSession()
    subjectivity_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(subjectivity_sess, LOCATION + "/subjectivity/rnn-subjectivity.ckpt")
with open(LOCATION + "/subjectivity/dict-subjectivity.p",'rb') as fopen:
    subjectivity_dict = pickle.load(fopen)
with open(LOCATION + "/subjectivity/vector-subjectivity.p",'rb') as fopen:
    subjectivity_vector = pickle.load(fopen)
