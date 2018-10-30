import numpy as np
import cv2
import scipy.misc
import os
from Detection.MtcnnDetector import MtcnnDetector
from Detection.detector import Detector
from Detection.fcn_detector import FcnDetector
from train_models.mtcnn_model import P_Net, R_Net, O_Net

test_mode = "onet"
thresh = [0.9, 0.3, 0.3]
min_face_size = 24
stride = 2
slide_window = False
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
mtcnn_detector = MtcnnDetector(detectors=detectors, min_face_size=min_face_size,
                               stride=stride, threshold=thresh, slide_window=slide_window)

camera = cv2.VideoCapture(1)
name = 'test'
count = 0

path = os.getcwd() + '/data-face/' + name
if not os.path.exists(path):
    os.makedirs(path)
while True:
	_, frame = camera.read()
	gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
	boxes_c,_ = mtcnn_detector.detect(frame)
	for i in range(boxes_c.shape[0]):
		bbox = boxes_c[i, :4]
		score = boxes_c[i, 4]
		corpbbox = [int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])]
		cv2.rectangle(frame, (corpbbox[0], corpbbox[1]), (corpbbox[2], corpbbox[3]), (255, 0, 0), 1)
		cv2.putText(frame, '{:.3f}'.format(score), (corpbbox[0], corpbbox[1] - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
		try:
			scipy.misc.imsave(path + '/' + name + str(count) + '.png', gray[int(bbox[1]): int(bbox[3]), int(bbox[0]) : int(bbox[2])])
		except:
			continue
		count += 1
	cv2.imshow("test", frame)
	if cv2.waitKey(1) & 0xFF == ord('q'):
		break
camera.release()
cv2.destroyAllWindows()
	