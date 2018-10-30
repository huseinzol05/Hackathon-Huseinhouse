import textract
import re
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import LabelEncoder
import sklearn.datasets
import nltk
nltk.data.path.append('/home/husein/nltk_data/')
from textblob import TextBlob
import random
import collections
from collections import OrderedDict
from fuzzywuzzy import fuzz
import numpy as np

def clearstring(string):
	string = re.sub('[^A-Za-z ]+', '', string)
	string = string.split(' ')
	string = filter(None, string)
	string = [y.strip() for y in string]
	string = ' '.join(string)
	return string.lower()

df = pd.read_csv('processed_mbti.csv')
label = df.type.unique()
labelset = LabelEncoder().fit_transform(df.type)
trainset = df.posts.values
for i in range(trainset.shape[0]):
	trainset[i] = ' '.join(trainset[i].split('|||'))

def separate_dataset(trainset):
	datastring = []
	datatarget = []
	for i in range(len(trainset.data)):
		data_ = trainset.data[i].split('\n')
		data_ = filter(None, data_)
		for n in range(len(data_)):
			data_[n] = clearstring(data_[n])
		datastring += data_
		for n in range(len(data_)):
			datatarget.append(trainset.target[i])
	return datastring, datatarget
	
job = sklearn.datasets.load_files(container_path = 'jobdescription', decode_error = 'replace')
job.data, job.target = separate_dataset(job)
c = list(zip(job.data, job.target))
random.shuffle(c)
job.data, job.target = zip(*c)

dev_clf = Pipeline([('vect', CountVectorizer(ngram_range=(1, 2))), ('clf', SGDClassifier(loss = 'modified_huber', penalty = 'l2', alpha = 1e-4, n_iter = 100, random_state = 42))])
dev_clf.fit(job.data, job.target)

clf = Pipeline([('vect', CountVectorizer()), ('clf', SGDClassifier(loss = 'modified_huber', penalty = 'l2', alpha = 1e-4, n_iter = 100, random_state = 42))])
clf.fit(trainset, labelset)

def clearstring_pdf(string):
	string = re.sub(r'[^\x00-\x7F]', '', string)
	string = string.split(' ')
	string = filter(None, string)
	string = [y.strip() for y in string]
	string = ' '.join(string)
	return string

def get_detail(text):
	text = filter(None, [clearstring_pdf(t) for t in text.split('\n')])
	blobs = [TextBlob(i).tags for i in text]
	nouns = []
	for blob in blobs:
		nouns += [b[0] for b in blob if b[1] == 'NNP' or b[1] == 'NN']
	nouns = [n.lower() for n in nouns][15:]
	prob = dev_clf.predict_proba(text)
	prob = np.mean(prob, axis = 0)
	dict_prob = {}
	for i in range(prob.shape[0]):
		dict_prob[job.target_names[i]] = float(prob[i])
	personality = clf.predict_proba([' '.join(text)])[0]
	unique = np.unique(personality)
	loc = np.where(personality == unique[-1])[0]
	personalities = []
	for i in loc:
		personalities += list(label[i])
	personalities_unique, personalities_count = np.unique(personalities, return_counts = True)
	personalities_count = (personalities_count * 1.0) / np.sum(personalities_count)
	counts = collections.Counter(personalities)
	new_list = sorted(personalities, key = lambda x: -counts[x])
	new_list = ''.join(list(OrderedDict.fromkeys(new_list))[:4])
	new_type = label[np.argmax([fuzz.ratio(new_list, i) for i in label])]
	nouns_unique, nouns_count = np.unique(nouns, return_counts = True)
	return {'developer': dict_prob, 'personality_percent': personalities_count.tolist(), 'personality': personalities_unique.tolist(), 'type': new_type,
		   'nouns': nouns_unique.tolist(), 'nouns_count': nouns_count.tolist()}

			
