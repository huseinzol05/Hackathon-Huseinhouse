from Detection.MtcnnDetector import MtcnnDetector
from Detection.detector import Detector
from Detection.fcn_detector import FcnDetector
from train_models.mtcnn_model import P_Net, R_Net, O_Net
import visualization_utils
import tensorflow as tf
import tensorflow.contrib.slim as slim
import numpy as np
import cv2
import mobilenet_v2
import time
import dlib
from scipy.spatial.distance import cdist

def shape_to_np(shape, dtype="int"):
    coords = np.zeros((shape.num_parts, 2), dtype=dtype)
    for i in range(0, shape.num_parts):
        coords[i] = (shape.part(i).x, shape.part(i).y)
    return coords

def euclidean(a,b):
    return np.linalg.norm(a-b)

def eye_aspect_ratio(eye):
    A = euclidean(eye[1], eye[5])
    B = euclidean(eye[2], eye[4])
    C = euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def mouth_aspect_ratio(mouth):
    # [0,1,2,3,4,5]
    # [61,67,63,65,60,64]
    A = euclidean(mouth[0], mouth[1])
    B = euclidean(mouth[2], mouth[3])
    C = euclidean(mouth[4], mouth[5])
    return (A + B) / (2.0 * C)

def face_orientation(frame, landmarks):
    size = frame.shape
    image_points = landmarks.astype('double')
    model_points = np.array([
                            (0.0, 0.0, 0.0),             # Nose tip
                            (0.0, -330.0, -65.0),        # Chin
                            (-165.0, 170.0, -135.0),     # Left eye left corner
                            (165.0, 170.0, -135.0),      # Right eye right corne
                            (-150.0, -150.0, -125.0),    # Left Mouth corner
                            (150.0, -150.0, -125.0)      # Right mouth corner
                        ])
    center = (size[1]/2, size[0]/2)
    focal_length = center[0] / np.tan(60/2 * np.pi / 180)
    camera_matrix = np.array([[focal_length, 0, center[0]],
                         [0, focal_length, center[1]],
                         [0, 0, 1]], dtype = "double")
    dist_coeffs = np.zeros((4,1))
    (success, rotation_vector, translation_vector) = cv2.solvePnP(model_points, image_points,
                                                                  camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)
    axis = np.float32([[500,0,0],
                          [0,500,0],
                          [0,0,500]])
    imgpts, jac = cv2.projectPoints(axis, rotation_vector, translation_vector, camera_matrix, dist_coeffs)
    modelpts, jac2 = cv2.projectPoints(model_points, rotation_vector, translation_vector, camera_matrix, dist_coeffs)
    rvec_matrix = cv2.Rodrigues(rotation_vector)[0]
    proj_matrix = np.hstack((rvec_matrix, translation_vector))
    eulerAngles = cv2.decomposeProjectionMatrix(proj_matrix)[6]
    pitch, yaw, roll = [np.radians(_) for _ in eulerAngles]
    pitch = np.degrees(np.arcsin(np.sin(pitch)))
    roll = -np.degrees(np.arcsin(np.sin(roll)))
    yaw = np.degrees(np.arcsin(np.sin(yaw)))
    return (str(float("{0:.2f}".format(roll[0]))), str(float("{0:.2f}".format(pitch[0]))), str(float("{0:.2f}".format(yaw[0]))))

class Face:
    def __init__(self):
        self.X = tf.placeholder(tf.float32,[None,None,3])
        images = tf.expand_dims(self.X,axis=0)
        images = tf.image.resize_images(images,[224,224])
        images = tf.map_fn(lambda image: tf.image.per_image_standardization(image), images)
        with tf.contrib.slim.arg_scope(mobilenet_v2.training_scope(is_training=True)):
            self.logits, endpoints = mobilenet_v2.mobilenet(images,num_classes=20)

class Emotion:
    def __init__(self):
        self.X = tf.placeholder(tf.float32,[None,None,1])
        images = tf.expand_dims(self.X,axis=0)
        images = tf.image.resize_images(images,[224,224])
        images = tf.image.grayscale_to_rgb(images)
        images = tf.map_fn(lambda image: tf.image.per_image_standardization(image), images)
        with tf.contrib.slim.arg_scope(mobilenet_v2.training_scope(is_training=True)):
            self.logits, endpoints = mobilenet_v2.mobilenet(images,num_classes=7)

embedded = np.load('huseinhouse/embedded.npy')
data_Y = np.load('huseinhouse/data_Y.npy')

face_graph = tf.Graph()
with face_graph.as_default():
    face_model = Face()
    face_sess = tf.InteractiveSession()
    face_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(face_sess, "huseinhouse/emotion-checkpoint-face.ckpt")

emotion_graph = tf.Graph()
with emotion_graph.as_default():
    emotion_model = Emotion()
    emotion_sess = tf.InteractiveSession()
    emotion_sess.run(tf.global_variables_initializer())
    saver = tf.train.Saver(tf.global_variables())
    saver.restore(emotion_sess, "huseinhouse/emotion-checkpoint-mobilenet.ckpt")

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
labels_person = ['husein','negative']
labels_emotion = ['anger','contempt','disgust','fear','happy','sadness','surprise']
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
eyes = [0.0920228785212,0.427184454581]
mouths = [0.00693375245282,0.591982451156]

cap = cv2.VideoCapture(1)
while True:
    try:
        ret, img = cap.read()
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        boxes_c,landmarks = mtcnn_detector.detect(img)
        for i in range(boxes_c.shape[0]):
            bbox = boxes_c[i, :4]
            # we dont want too small
            if (int(bbox[2])-int(bbox[0])) > 100:
                # only detect husein
                cropped = rgb[int(bbox[1]):int(bbox[3]),int(bbox[0]):int(bbox[2])]
                predicted = face_sess.run(face_model.logits,
                                          feed_dict={face_model.X:cropped})[0]
                person = data_Y[np.argmin(cdist(embedded, [predicted], 'cosine')[:,0])]
                if person == 0:
                    cropped = gray[int(bbox[1]):int(bbox[3]),int(bbox[0]):int(bbox[2])]
                    predicted = emotion_sess.run(emotion_model.logits,
                                                 feed_dict={emotion_model.X:np.expand_dims(cropped,2)})[0]
                    emotion = np.argmax(predicted)
                    shape = predictor(gray, dlib.rectangle(int(bbox[0])-10,int(bbox[1])-10,int(bbox[2])-10,int(bbox[3])-10))
                    shape = shape_to_np(shape)
                    roll, pitch, yaw = face_orientation(img, shape[[33,8,36,45,48,54]])
                    left_eye = shape[42:48]
                    right_eye = shape[36:42]
                    left_EAR = eye_aspect_ratio(left_eye)
                    right_EAR = eye_aspect_ratio(right_eye)
                    ear = (left_EAR + right_EAR) / 2.0
                    ear = (ear - eyes[0])/(eyes[1]-eyes[0])
                    MOUTH = mouth_aspect_ratio(shape[[61,67,63,65,60,64]])
                    MOUTH = (MOUTH - mouths[0])/(mouths[1]-mouths[0])
                    visualization_utils.draw_bounding_box_on_image_array(img,int(bbox[1]),int(bbox[0]),
                                                                         int(bbox[3]),
                                                                         int(bbox[2]),
                                                                         'YellowGreen',display_str_list=[labels_person[person],
                                                                                                        '',
                                                                                                        labels_emotion[emotion],
                                                                                                        '','eyes open: %.2f, mouth open: %f'%(ear,MOUTH),
                                                                                                        '','roll %s, pitch %s, yaw %s'%(roll,pitch,yaw)],
                                                                        use_normalized_coordinates=False)
        cv2.imshow("result", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    except:
        pass
    time.sleep(2)
