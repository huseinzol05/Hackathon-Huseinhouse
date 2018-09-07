# Emotion-Music
MCMC hackathon 2017

## Disclaimer, this model is not perfect, there is still a lot we need to improve

We used convolutional neural network to detect emotion using any live webcam.

## In this hackathon, we will push person and emotion to our server, later the server will process and push into any embedded devices got in the house, our ptototype to detect who enter the house and play music based on emotion

We got 2 separate Convolutional Neural Network, first model is to detect who is the person, second model is to detect emotion from the face.

We are using Tensorflow Library for dynamic graph machine learning.
```bash
sudo pip install scipy numpy matplotlib tensorflow
```

![alt text](https://raw.githubusercontent.com/Mongoool/Emotion-Music/master/screenshot/screenshot3.png)
![alt text](https://raw.githubusercontent.com/Mongoool/Emotion-Music/master/screenshot/screenshot4.png)
![alt text](https://raw.githubusercontent.com/Mongoool/Emotion-Music/master/screenshot/screenshot5.png)
![alt text](https://raw.githubusercontent.com/Mongoool/Emotion-Music/master/screenshot/screenshot6.png)
![alt text](https://raw.githubusercontent.com/Mongoool/Emotion-Music/master/screenshot/screenshot7.png)

## Old dataset, we not used it anymore
![alt text](bar-emotion.png)
```text
anger: 76
happy: 217
jealous: 81
sad: 125
```
![alt text](bar-person.png)
```text
Husein: 157
Julius: 181
Ugen: 149
unknown: 192

```

## training session
![alt text](plotemotion.png)
Pretty much overfitted, 72% achieved during validation
![alt text](plotperson.png)
fine enough for hackathon!

## emotion model architecture
![alt text](screenshot/graph-emotion1.png)

## person model architecture
![alt text](screenshot/graph-person.png)

0.5. Unzip *.zip from data/, dataperson/ in the same directories. You can add new pictures or remove some.

0.6. Download the pretrained [here for emotion model](https://drive.google.com/open?id=0BxQQlrLbdunWOVhIMkwtWTdlWXc)

1. You able to capture new face using capture.py
2. You need to train person detection using train_person.py
3. You able to train the emotion using train_emotion.py
4. to test on live any camera, use live.py
