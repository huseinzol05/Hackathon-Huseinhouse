import cv2
import base64
from socketIO_client import SocketIO, BaseNamespace
import numpy as np
import time
from PIL import Image
from threading import Thread, ThreadError
import io

img_np = None
socketIO = SocketIO('http://192.168.0.1', 6020)
live_namespace = socketIO.define(BaseNamespace, '/live')

def receive_events_thread():
    socketIO.wait()
def on_camera_response(*args):
    print(args[0]['data'])

live_namespace.on('camera_update', on_camera_response)
receive_events_thread = Thread(target=receive_events_thread)
receive_events_thread.daemon = True
receive_events_thread.start()

cap = cv2.VideoCapture(1)
#cap.set(3, 1280)
#cap.set(4, 720)
while True:
    ret, img = cap.read()
    img_b = cv2.imencode('.jpg', img)[1].tobytes()
    base64_bytes = base64.b64encode(img_b)
    base64_string = base64_bytes.decode('utf-8')
    live_namespace.emit('livevideo',{'data':base64_string})
    time.sleep(10)
