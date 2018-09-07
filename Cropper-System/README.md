# Cropper-System
TADHACK 2017 for pollinator and crop study. Thanks to http://pollinator.org/ for the resources.

requirement
```bash
sudo pip install tensorflow opencv2 matplotlib scipy numpy flask
```

## Flower study
![alt text](https://raw.githubusercontent.com/Mongoool/Cropper-System/master/screenshot/flowers.png)

Positive characteristics:

1. bees are attracted to flowers with blue and white
2. birds are attracted to flowers with violet, blue, green and RED (anything with red hue, orange, purple, yellow etc.)
3. VIOLET, it has red hue and white
4. Single flowers — those with one ring of petals — provide more nectar and pollen
5. Double flowers have extra petals have replaced pollen-laden anthers
6. Double flowers also make it more difficult for bees to reach the inner flower parts
7. Lines and coloration on petals help pollinators quickly find flowers

### We are using Convolutional Neural Network Tensorflow to do the binary classification for the flower images
You can check the model in model_flower.py

## Crop study
![alt text](https://raw.githubusercontent.com/Mongoool/Cropper-System/master/screenshot/crop.png)

1. We study green color intensity
2. We study color codes for crops
3. We do masking for crops
4. In the future, we can use Convolutional Neural Network to do give some sense of output for healthy condition

#### Some output from our system, [link here](http://www.huseinhouse.com/cropsystem/)
![alt text](https://raw.githubusercontent.com/Mongoool/Cropper-System/master/screenshot/1.png)
![alt text](https://raw.githubusercontent.com/Mongoool/Cropper-System/master/screenshot/2.png)
![alt text](https://raw.githubusercontent.com/Mongoool/Cropper-System/master/screenshot/3.png)
![alt text](https://raw.githubusercontent.com/Mongoool/Cropper-System/master/screenshot/4.png)
