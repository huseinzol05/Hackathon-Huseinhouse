import os
import numpy as np
import tensorflow as tf
from model import ssd_vgg_512, np_methods
from core import preprocess, visualization
import model_vandalism
from settings import *
slim = tf.contrib.slim

net_shape = (512, 512)
data_format = 'NHWC'
img_input = tf.placeholder(tf.uint8, shape = (None, None, 3))

image_pre, bboxes_pre, bbox_img = preprocess.preprocess_for_eval(img_input)
image_4d = tf.expand_dims(image_pre, 0)

sess = tf.InteractiveSession()
ssd_net = ssd_vgg_512.SSDNet()
sess.run(tf.global_variables_initializer())

with slim.arg_scope(ssd_net.arg_scope(data_format = data_format)):
    predictions, localisations, _, _ = ssd_net.net(image_4d, is_training = False, reuse = None)

saver = tf.train.Saver()
saver.restore(sess, 'checkpoint_ssd/VGG_VOC0712_SSD_512x512_ft_iter_120000.ckpt')
ssd_anchors = ssd_net.anchors(net_shape)
    
vandalism_graph = tf.Graph()
with vandalism_graph.as_default():
    model = model_vandalism.Model(2)

vandalism_sess = tf.Session(graph = vandalism_graph)

with vandalism_sess.as_default():
    with vandalism_graph.as_default():
        tf.global_variables_initializer().run()
        tf.train.Saver(tf.global_variables()).restore(vandalism_sess, os.getcwd() + '/model.ckpt')

def process_image(img, select_threshold = 0.5, nms_threshold = .45):
    # Run SSD network.
    rimg, rpredictions, rlocalisations, rbbox_img = sess.run([image_4d, predictions, localisations, bbox_img], feed_dict = {img_input: img})
    
    # Get classes and bboxes from the net outputs.
    rclasses, rscores, rbboxes = np_methods.ssd_bboxes_select(rpredictions, rlocalisations, ssd_anchors,
            select_threshold = select_threshold, img_shape = net_shape, num_classes = 21, decode = True)
    
    rbboxes = np_methods.bboxes_clip(rbbox_img, rbboxes)
    rclasses, rscores, rbboxes = np_methods.bboxes_sort(rclasses, rscores, rbboxes, top_k=400)
    rclasses, rscores, rbboxes = np_methods.bboxes_nms(rclasses, rscores, rbboxes, nms_threshold=nms_threshold)
    
	# Resize bboxes to original image shape. Note: useless for Resize.WARP!
    rbboxes = np_methods.bboxes_resize(rbbox_img, rbboxes)
    return rclasses, rscores, rbboxes