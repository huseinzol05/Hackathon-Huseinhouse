import numpy as np
import os
from sklearn.preprocessing import LabelEncoder

def get_dataset():
    
    list_folder = os.listdir('dataperson/')
    list_images = []
    for i in xrange(len(list_folder)):
        images = os.listdir('dataperson/' + list_folder[i])
        for x in xrange(len(images)):
            image = [list_folder[i] + '/' + images[x], list_folder[i]]
            list_images.append(image)
            
    list_images = np.array(list_images)
    np.random.shuffle(list_images)
    
    label = np.unique(list_images[:, 1]).tolist()
    
    list_images[:, 1] = LabelEncoder().fit_transform(list_images[:, 1])
    
    return list_images, np.unique(list_images[:, 1]).shape[0], label