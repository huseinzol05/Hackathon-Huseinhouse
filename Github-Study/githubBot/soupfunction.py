from bs4 import BeautifulSoup
import urllib2
import sklearn.datasets
import numpy as np
import re
import threading
import Queue
import json
import random
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import SGDClassifier
import MySQLdb
db = MySQLdb.connect("localhost")
cursor = db.cursor()

def run_parallel_in_threads(target, args_list):
    globalparas = []
    result = Queue.Queue()
    def task_wrapper(*args):
        result.put(target(*args))
    threads = [threading.Thread(target = task_wrapper, args = args) for args in args_list]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    while not result.empty():
        globalparas.append(result.get())
    globalparas = filter(None, globalparas)
    return globalparas

def clearstring(string):
	string = re.sub('[^A-Za-z ]+', '', string)
	string = string.split(' ')
	string = filter(None, string)
	string = [y.strip() for y in string]
	string = ' '.join(string)
	return string.lower()

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

trainset = sklearn.datasets.load_files(container_path = 'jobdescription', decode_error = 'replace')
trainset.data, trainset.target = separate_dataset(trainset)
c = list(zip(trainset.data, trainset.target))
random.shuffle(c)
trainset.data, trainset.target = zip(*c)

trending = sklearn.datasets.load_files(container_path = 'trending', decode_error = 'replace')
trending.data, trending.target = separate_dataset(trending)
c = list(zip(trending.data, trending.target))
random.shuffle(c)
trending.data, trending.target = zip(*c)

impact = sklearn.datasets.load_files(container_path = 'impact', decode_error = 'replace')
impact.data, impact.target = separate_dataset(impact)
c = list(zip(impact.data, impact.target))
random.shuffle(c)
impact.data, impact.target = zip(*c)

satisfaction = sklearn.datasets.load_files(container_path = 'satisfaction', decode_error = 'replace')
satisfaction.data, satisfaction.target = separate_dataset(impact)
c = list(zip(satisfaction.data, satisfaction.target))
random.shuffle(c)
satisfaction.data, satisfaction.target = zip(*c)

dev_clf = Pipeline([('vect', CountVectorizer(ngram_range=(1, 2))), ('clf', SGDClassifier(loss = 'modified_huber', penalty = 'l2', alpha = 1e-4, n_iter = 100, random_state = 42))])
dev_clf.fit(trainset.data, trainset.target)

polarity_clf = Pipeline([('vect', CountVectorizer(ngram_range=(1, 2))), ('clf', SGDClassifier(loss = 'modified_huber', penalty = 'l2', alpha = 1e-4, n_iter = 100, random_state = 42))])
polarity_clf.fit(trending.data, trending.target)

impact_clf = Pipeline([('vect', CountVectorizer(ngram_range=(1, 2))), ('clf', SGDClassifier(loss = 'modified_huber', penalty = 'l2', alpha = 1e-4, n_iter = 100, random_state = 42))])
impact_clf.fit(impact.data, impact.target)

satisfaction_clf = Pipeline([('vect', CountVectorizer(ngram_range=(1, 2))), ('clf', SGDClassifier(loss = 'modified_huber', penalty = 'l2', alpha = 1e-4, n_iter = 100, random_state = 42))])
satisfaction_clf.fit(satisfaction.data, satisfaction.target)

def get_frontprofile(name):
	url = urllib2.urlopen('https://github.com/' + name)
	profile, para = {}, []
	soup = BeautifulSoup(''.join(url.readlines()), 'lxml')
	nav = soup.find_all("a", "underline-nav-item")
    print nav
	profile['repositories'] = nav[1].getText().split()[1]
	profile['stars'] = nav[2].getText().split()[1]
	profile['followers'] = nav[3].getText().split()[1]
	profile['following'] = nav[4].getText().split()[1]
	profile['name'] = soup.find_all("span", "p-name vcard-fullname d-block")[0].getText()
	try:
		profile['status'] = soup.find_all("div", "p-note user-profile-bio")[0].getText()
	except:
		profile['status'] = 'no status'
	try:
		profile['mention'] = {'url' : soup.find_all("a", "user-mention")[0]['href'], 'name': soup.find_all("a", "user-mention")[0].getText()}
	except:
		profile['mention'] = 'no mention'
	try:
		profile['url'] = soup.find_all("a", "u-url")[0].getText()
	except:
		profile['url'] = 'no url'
	title = soup.find_all("span", "repo js-repo")
	sentence = soup.find_all("p", "pinned-repo-desc")
	pinned = []
	for i in range(len(title)):
		pinned.append({'title': title[i].getText(), 'sentence': sentence[i].getText()})
	profile['pinned'] = pinned
	contribution = soup.find_all("div", "js-contribution-graph")[0].getText().split()
	profile['contribution'] = contribution[0] + ' ' + contribution[1]
	day = soup.find_all("rect", "day")
	try:
		profile['persintence'] = int(contribution[0]) / (len(day) * 1.0)
	except:
		profile['persistence'] = 'new profile'
	days, weeks, months = [], [], []

	try:
		for i in range(len(day)):
			days.append(int(day[i]['data-count']))
		profile['days'] = days
	except:
		profile['days'] = 'new profile'

	try:
		for i in range(0, len(day), 7):
			total = 0
			try:
				for k in range(7):
					total += int(day[i + k]['data-count'])
			except:
				print 'out of day'
			weeks.append(total)
		profile['weeks'] = weeks
	except:
		profile['weeks'] = 'new profile'

	try:
		for i in range(0, len(day), 30):
			total = 0
			try:
				for k in range(30):
					total += int(day[i + k]['data-count'])
			except:
				print 'out of day'
			months.append(total)
		profile['months'] = months
	except:
		profile['months'] = 'new profile'

	return profile

def get_detail_repo(name, title):
	profile = {}
	try:
		url = urllib2.urlopen('https://github.com/' + name + '/' + title)
		soup = BeautifulSoup(''.join(url.readlines()), 'lxml')
		tags = soup.find_all("a", "topic-tag")
		tags_list = []
		for i in range(len(tags)):
			tags_list.append(tags[i].getText().split()[0])
		profile['tags'] = tags_list
		profile['title'] = title
		stars = soup.find_all("a", "social-count")
		profile['watched'] = stars[0].getText().split()[0]
		profile['stars'] = stars[1].getText().split()[0]
		profile['forked'] = soup.find_all("a", "social-count")[0].getText().split()[0]
		langs = soup.find_all("span", "lang")
		percents = soup.find_all("span", "percent")
		langs_list = []
		for i in range(len(langs)):
			langs_list.append({'language': langs[i].getText(), 'percent': percents[i].getText()})
		profile['language'] = langs_list
		try:
			text = soup.find_all("article", "markdown-body")[0].getText().split('\n')
			text = filter(None, text)
			text = [k.strip() for k in text]
			text = filter(None, text)
			tags = list(set(text))
			profile['readme'] = tags
		except:
			profile['readme'] = ['']
		return profile
	except Exception as e:
		profile['error'] = str(e)
		return profile

def get_repositories(name, mode = 1):
	repos_list, repos_name = [], []
	return_repos = json.loads(urllib2.urlopen('https://api.github.com/users/' + name + '/repos?per_page=100').readlines()[0])
	for i in range(len(return_repos)):
		if return_repos[i]['fork']:
			continue
		if mode == 1:
			repos_name.append((name, return_repos[i]['name'],))
		repos_list.append({'date': return_repos[i]['updated_at'], 'title': return_repos[i]['name'], 'description': return_repos[i]['description']})
	if mode == 1:
		outputs = run_parallel_in_threads(get_detail_repo, repos_name)
		indexs = [output['title'] for output in outputs]
		for i in range(len(repos_list)):
			repos_list[i]['details'] = outputs[indexs.index(repos_list[i]['title'])]
	return repos_list

def get_dev_prob(name, inputs):
	prob = dev_clf.predict_proba(inputs)
	prob = np.mean(prob, axis = 0)
	dict_prob = {}
	for i in xrange(prob.shape[0]):
		dict_prob[trainset.target_names[i]] = float(prob[i])
	cursor.execute("INSERT INTO github(githubname, cplusplus, android, backend, datascience, dotnet, frontend, html5, ios, java, javascript, machinelearning, nodejs, php, python, react, ruby, rails, unity, web, wordpress) VALUES ('%s', %s)" % (name, ', '.join(map(str, prob.tolist()))))
	db.commit()
	prob = polarity_clf.predict_proba(inputs)
	prob = np.mean(prob, axis = 0)
	index = np.argmax(prob)
	prob[index] = (prob[index] - 0.5) / 0.5
	if index == 0:
		prob[index] = prob[index] * -1.0
	prob_impact = impact_clf.predict_proba(inputs)
	prob_impact = np.mean(prob_impact, axis = 0)
	index_impact = np.argmax(prob_impact)
	prob_impact[index_impact] = (prob_impact[index_impact] - 0.5) / 0.5
	if index_impact == 0:
		prob_impact[index_impact] = prob_impact[index_impact] * -1.0
	prob_satisfaction = satisfaction_clf.predict_proba(inputs)
	prob_satisfaction = np.mean(prob_satisfaction, axis = 0)
	index_satisfaction = np.argmax(prob_satisfaction)
	prob_satisfaction[index_satisfaction] = (prob_satisfaction[index_satisfaction] - 0.5) / 0.5
	if index_satisfaction == 0:
		prob_satisfaction[index_satisfaction] = prob_satisfaction[index_satisfaction] * -1.0
	return dict_prob, float(prob[index]), float(prob_impact[index_impact]), float(prob_satisfaction[index_satisfaction])
