BIND_ADDR=0.0.0.0:8096
gunicorn --worker-class eventlet -b $BIND_ADDR -p gunicorn.pid rnn:app
