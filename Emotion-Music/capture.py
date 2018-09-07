import numpy as np
import cv2
import scipy.misc
import os

cap = cv2.VideoCapture(1)
faceCascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

name = 'Julius'
count = 0

path = os.getcwd() + '/dataperson/' + name
if not os.path.exists(path):
    os.makedirs(path)

while(True):

    ret, frame = cap.read()
    
    frame = cv2.flip(frame, 1)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(gray, scaleFactor = 1.1, minNeighbors = 7, minSize = (30, 30), flags = cv2.cv.CV_HAAR_SCALE_IMAGE)
    
    for (x, y, w, h) in faces:
        scipy.misc.imsave(path + '/' + name + str(count) + '.png', gray[y: y + h, x: x + w])
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        count += 1
    
    cv2.imshow('Video', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()