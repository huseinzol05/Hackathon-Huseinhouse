import numpy as np
import serial
import json
from socketIO_client_nexus import SocketIO, BaseNamespace

ser = serial.Serial('/dev/ttyUSB0')
back_matrix = np.zeros((200, 100))
front_matrix = np.zeros((200, 100))
count = 0
socketIO = SocketIO('http://192.168.43.168', 5001)
rekathon_namespace = socketIO.define(BaseNamespace, '/rekathon')

while True:
    try:
        x = str(ser.readline()[:-2]).split(',')
        angle = int(x[0])
        if count % 200 == 0:
            print np.where(back_matrix > 0)
            rekathon_namespace.emit('backend',json.dumps({'matrix':np.hstack([np.flipud(front_matrix), np.fliplr(back_matrix)]).tolist()}))
            count = 1
        back = int(x[1].split(':')[1])
        front = int(x[2].split(':')[1])
        angle = int(np.around((angle / 180.0) * 199))
        if back > 0:
            back_matrix[angle,back] += 1
        else:
            back_matrix[angle,:] =0
        if front > 0:
            front_matrix[angle,front] += 1
        else:
            front_matrix[angle,:] =0
        count += 1
    except Exception as e:
        continue
        