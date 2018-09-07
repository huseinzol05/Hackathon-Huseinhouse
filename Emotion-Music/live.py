import utils_emotion
import utils_person
import model_emotion
import model_person
import settings_emotion
import settings_person
import tensorflow as tf
import numpy as np
import cv2
import tensorflow as tf
import os
from scipy import misc

_, output_dimension_emotion, label_emotion = utils_emotion.get_dataset()
_, output_dimension_person, label_person = utils_person.get_dataset()

emotion_graph = tf.Graph()
with emotion_graph.as_default():
    model_emotion = model_emotion.Model(output_dimension_emotion)
    
person_graph = tf.Graph()
with person_graph.as_default():
    model_person = model_person.Model(output_dimension_person)
    
emotion_sess = tf.Session(graph = emotion_graph)
person_sess = tf.Session(graph = person_graph)

with emotion_sess.as_default():
    with emotion_graph.as_default():
        tf.global_variables_initializer().run()
        model_saver = tf.train.Saver(tf.global_variables())
        model_saver.restore(emotion_sess, os.getcwd() + '/modelemotion.ckpt')
        
with person_sess.as_default():
    with person_graph.as_default():
        tf.global_variables_initializer().run()
        model_saver = tf.train.Saver(tf.global_variables())
        model_saver.restore(person_sess, os.getcwd() + '/model.ckpt')
        
cap = cv2.VideoCapture(1)
faceCascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

count = 0
while(True):
    ret, frame = cap.read()
    frame = cv2.flip(frame, 1)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(gray, scaleFactor = 1.1, minNeighbors = 7, minSize = (30, 30), flags = cv2.cv.CV_HAAR_SCALE_IMAGE)
    
    for (x, y, w, h) in faces:
        img = gray[y: y + h, x: x + w]
        img_person = misc.imresize(img, (settings_person.picture_dimension, settings_person.picture_dimension))
        img_person = img_person.reshape([img_person.shape[0], img_person.shape[1], 1])
        
        emb_data_person = np.zeros((1, settings_person.picture_dimension, settings_person.picture_dimension, 1), dtype = np.float32)
        emb_data_person[0, :, :, :] = img_person
        prob = person_sess.run(model_person.logits, feed_dict = {model_person.X : emb_data_person})
        text = label_person[np.argmax(prob[0])]
        
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(frame, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 1, 255, 2)
        
        if count % 5 == 0:
            img_emotion = misc.imresize(img, (settings_emotion.picture_dimension, settings_emotion.picture_dimension))
            img_emotion = img_emotion.reshape([img_emotion.shape[0], img_emotion.shape[1], 1])
            
            emb_data_emotion = np.zeros((1, settings_emotion.picture_dimension, settings_emotion.picture_dimension, 1), dtype = np.float32)
            emb_data_emotion[0, :, :, :] = img_emotion
            prob_emotion = emotion_sess.run(tf.nn.softmax(model_emotion.logits), feed_dict = {model_emotion.X : emb_data_emotion})
            count = 0
            
        try:
            for i in xrange(prob_emotion.shape[1]):
                cv2.putText(frame, label_emotion[i] + ': ' + str(prob_emotion[0][i]), (x, y + ((i + 1) * 20)), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 1)
        except:
            print 'cannot interpret emotion'
                
                
    cv2.imshow('Video', frame)
    count += 1
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
        
cap.release()
cv2.destroyAllWindows()