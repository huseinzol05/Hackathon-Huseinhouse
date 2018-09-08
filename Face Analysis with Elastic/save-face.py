from Detection.MtcnnDetector import MtcnnDetector
from Detection.detector import Detector
from Detection.fcn_detector import FcnDetector
from train_models.mtcnn_model import P_Net, R_Net, O_Net
import visualization_utils
import tensorflow as tf
import os
import cv2
import imageio
import sys

loc = sys.argv[1]
if not os.path.exists(loc):
    os.makedirs(loc)

thresh = [0.7, 0.1, 0.1]
min_face_size = 24
stride = 2
slide_window = True
shuffle = False
detectors = [None, None, None]
prefix = ['data/MTCNN_model/PNet_landmark/PNet', 'data/MTCNN_model/RNet_landmark/RNet', 'data/MTCNN_model/ONet_landmark/ONet']
epoch = [18, 14, 16]
model_path = ['%s-%s' % (x, y) for x, y in zip(prefix, epoch)]
PNet = FcnDetector(P_Net, model_path[0])
detectors[0] = PNet
RNet = Detector(R_Net, 24, 1, model_path[1])
detectors[1] = RNet
ONet = Detector(O_Net, 48, 1, model_path[2])
detectors[2] = ONet
mtcnn_detector = MtcnnDetector(detectors=detectors, min_face_size=min_face_size,stride=stride, threshold=thresh, slide_window=slide_window)

cap = cv2.VideoCapture(1)
count = 0
while True:
    ret, img = cap.read()
    rgb = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    boxes_c,landmarks = mtcnn_detector.detect(img)
    for i in range(boxes_c.shape[0]):
        bbox = boxes_c[i, :4]
        print(bbox)
        visualization_utils.draw_bounding_box_on_image_array(img,int(bbox[1]),int(bbox[0]),
                                                             int(bbox[3]),
                                                             int(bbox[2]),
                                                             'YellowGreen',display_str_list=['face'],use_normalized_coordinates=False)
        imageio.imsave('%s/%s-%d.jpg'%(loc,loc,count),rgb[int(bbox[1]):int(bbox[3]),int(bbox[0]):int(bbox[2])])
        count += 1
    cv2.imshow("result", img)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
