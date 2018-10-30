from threading import Thread
from socketIO_client_nexus import SocketIO, LoggingNamespace

def receive_events_thread():
    socketIO.wait()

def shit(*args):
    print args
    
socketIO = SocketIO('http://192.168.43.168', 5001)
camera_namespace = socketIO.define(LoggingNamespace, '/rekathon')
camera_namespace.on('backend', shit)
receive_events_thread = Thread(target=receive_events_thread)
receive_events_thread.daemon = True
receive_events_thread.start()

while True:
    camera_namespace.emit('backend', 'a')