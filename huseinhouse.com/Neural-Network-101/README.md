# Neural-Network-101
Train your own Neural Network with custom hyper-parameters and visualize the decision boundaries

## You can check the website [here](http://www.huseinhouse.com/neuralnet/)

## Information

1. Training session will do in server, basically the website will send POST request to server
2. the server will return all the plot and contour coordinates by websocket protocol.

## You can host your own Neural Network 101
1. If you want to host locally
```python
# change to host='127.0.0.1'
app.run(host = '0.0.0.0', threaded = True, port = 8096)
```
2. If you want to change port number
```python
# change to port = 
app.run(host = '0.0.0.0', threaded = True, port = 8096)
```
3. If you want host with public ip and spawn a lot of worker to handle multi-users
```python
app.run(host = '0.0.0.0', threaded = True, port = 8096)
```
```bash
sudo pip3 install gunicorn eventlet

# spawn 1 worker
bash gunicorn.sh 1
# spawn shareable workers
bash eventlet.sh
```

## Screenshot

![alt text](output/2017-11-13-09-44-57.gif)
![alt text](output/2017-11-13-12-01-48.gif)
