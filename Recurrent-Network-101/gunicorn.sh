NUM_WORKER=$1
BIND_ADDR=0.0.0.0:8095
gunicorn --timeout 120 -w $NUM_WORKER -b $BIND_ADDR -p gunicorn.pid rnn:app
