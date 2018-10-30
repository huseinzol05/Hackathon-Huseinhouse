import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['CUDA_VISIBLE_DEVICES'] = ''
import nltk
nltk.data.path.append('/home/husein/nltk_data')
from rnn import *
from setting import *
from bs4 import BeautifulSoup
import requests
import re
from queue import Queue
import threading
import pickle
import numpy as np
import spacy
import pandas as pd
from unidecode import unidecode
import itertools
from fake_useragent import UserAgent
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from datetime import datetime, timedelta
from dateutil import parser
from newspaper import Article
import networkx as nx
import networkx.drawing.layout as nxlayout
import plotly.graph_objs as go
from sklearn.feature_extraction.text import TfidfVectorizer
english_stopwords = stopwords.words('english')
nlp = spacy.load('en_core_web_md')

GOOGLE_NEWS_URL = 'https://www.google.com.my/search?q={}&source=lnt&tbm=nws&start={}'

def forge_url(q, start):
    return GOOGLE_NEWS_URL.format(q.replace(' ', '+'), start)

ua = UserAgent()
hdr = {'User-Agent': ua.chrome}

def getsentiment(sentences):
    batch_x = np.zeros((len(sentences), SENTIMENT_LEN, DIMENSION))
    for i, sentence in enumerate(sentences):
        tokens = sentence.split()[:SENTIMENT_LEN]
        for no, text in enumerate(tokens[::-1]):
            try:
                batch_x[i, -1 - no, :] += sentiment_vector[sentiment_dict[text], :]
            except:
                continue
    return sentiment_sess.run(tf.nn.softmax(sentiment_model.logits), feed_dict = {sentiment_model.X : batch_x})

def getemotion(sentences):
    batch_x = np.zeros((len(sentences), EMOTION_LEN, DIMENSION))
    for i, sentence in enumerate(sentences):
        tokens = sentence.split()[:EMOTION_LEN]
        for no, text in enumerate(tokens[::-1]):
            try:
                batch_x[i, -1 - no, :] += emotion_vector[emotion_dict[text], :]
            except:
                continue
    return emotion_sess.run(tf.nn.softmax(emotion_model.logits), feed_dict = {emotion_model.X : batch_x})

def getmsg(sentences):
    batch_x = np.zeros((len(sentences), MESSAGE_LEN, DIMENSION))
    for i, sentence in enumerate(sentences):
        tokens = sentence.split()[:MESSAGE_LEN]
        for no, text in enumerate(tokens[::-1]):
            try:
                batch_x[i, -1 - no, :] += message_vector[message_dict[text], :]
            except:
                continue
    return message_sess.run(tf.nn.softmax(message_model.logits), feed_dict = {message_model.X : batch_x})

def getpolar(sentences):
    batch_polarity = np.zeros((len(sentences), POLARITY_LEN, DIMENSION))
    batch_subjectivity = np.zeros((len(sentences), SUBJECTIVITY_LEN, DIMENSION))
    batch_irony = np.zeros((len(sentences), IRONY_LEN, DIMENSION))
    batch_bias = np.zeros((len(sentences), BIAS_LEN, DIMENSION))
    for i, sentence in enumerate(sentences):
        tokens = sentence.split()[:BIAS_LEN]
        for no, text in enumerate(tokens[::-1]):
            try:
                batch_polarity[i, -1 - no, :] += polarity_vector[polarity_dict[text], :]
            except:
                pass
            try:
                batch_subjectivity[i, -1 - no, :] += subjectivity_vector[subjectivity_dict[text], :]
            except:
                pass
            try:
                batch_irony[i, -1 - no, :] += irony_vector[irony_dict[text], :]
            except:
                pass
            try:
                batch_bias[i, -1 - no, :] += bias_vector[bias_dict[text], :]
            except:
                pass

    output_subjectivity = subjectivity_sess.run(tf.nn.softmax(subjectivity_model.logits), feed_dict = {subjectivity_model.X : batch_subjectivity})
    output_polarity = polarity_sess.run(tf.nn.softmax(polarity_model.logits), feed_dict = {polarity_model.X : batch_polarity})
    output_irony = irony_sess.run(tf.nn.softmax(irony_model.logits), feed_dict = {irony_model.X : batch_irony})
    output_bias = bias_sess.run(tf.nn.softmax(bias_model.logits), feed_dict = {bias_model.X : batch_bias})
    argmax_subjectivity = np.argmax(output_subjectivity, axis = 1)
    argmax_subjectivity[np.where(argmax_subjectivity == 0)[0]] = -1
    argmax_polarity = np.argmax(output_polarity, axis = 1)
    argmax_polarity[np.where(argmax_polarity == 0)[0]] = -1
    argmax_irony = np.argmax(output_irony, axis = 1)
    argmax_irony[np.where(argmax_irony == 0)[0]] = -1
    argmax_bias = np.argmax(output_bias, axis = 1)
    argmax_bias[np.where(argmax_bias == 0)[0]] = -1
    return ((np.max(output_subjectivity, axis = 1) - 0.5) / 0.5) * argmax_subjectivity,((np.max(output_polarity, axis = 1) - 0.5) / 0.5) * argmax_polarity,((np.max(output_irony, axis = 1) - 0.5) / 0.5) * argmax_irony,((np.max(output_bias, axis = 1) - 0.5) / 0.5) * argmax_bias

def run_parallel_in_threads(target, args_list):
    globalparas = []
    result = Queue()
    def task_wrapper(*args):
        result.put(target(*args))
    threads = [threading.Thread(target = task_wrapper, args = args) for args in args_list]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    while not result.empty():
        globalparas.append(result.get())
    globalparas = list(filter(None, globalparas))
    return globalparas

def textcleaning(string):
    string = unidecode(string)
    string = re.sub('[^\'\"A-Za-z0-9\- ]+', '', string)
    string = word_tokenize(string)
    string = filter(None, string)
    string = [y.strip() for y in string]
    string = ' '.join(string)
    return string

def classifiercleaning(string):
    string = unidecode(string)
    string = re.sub('[^A-Za-z ]+', '', string)
    string = word_tokenize(string)
    string = filter(None, string)
    string = [y.strip() for y in string]
    string = [y for y in string if len(y) > 2 and y.find('nbsp') < 0 and y.find('href') < 0 and y not in english_stopwords]
    string = ' '.join(string).lower()
    return ''.join(''.join(s)[:2] for _, s in itertools.groupby(string))

def extract_links(content):
    soup = BeautifulSoup(content, 'html.parser')
    today = datetime.now().strftime("%m/%d/%Y")
    links_list = [v.attrs['href'] for v in soup.find_all('a', {'class': ['lLrAF']})]
    dates_list = [v.text for v in soup.find_all('div', {'class': ['slp']})]
    output = []
    for (link, date) in zip(links_list, dates_list):
        date = date.split('-')
        if date[1].find('hours') > 0 or date[1].find('minute') > 0:
            date[1] = today
        elif date[1].find('day') > 0:
            count = date[1].split(' ')[0]
        else:
            try:
                date[1] = parser.parse(date[1]).strftime("%m-%d-%Y")
            except:
                date[1] = 'null'
        output.append((link, date[0].strip(), date[1],))
    return output

def getlink(value, token = 'free'):
    url = forge_url(value, 0)
    response = requests.get(url, headers=hdr, timeout=20)
    links = extract_links(response.content)
    if token == 'free':
        return links[:5]
    else:
        return links

def getP(link, news, date):
    article = Article(link)
    article.download()
    article.parse()
    soup = BeautifulSoup(article.html, 'html.parser')
    articles = [v.text for v in soup.find_all('p')]
    paras, paras_classifier = [], []
    for p in articles:
        if len(p.split()) > 10:
            paras.append(textcleaning(p))
            paras_classifier.append(classifiercleaning(p))
    return {'url': link,'p': paras,'p-classifier':paras_classifier,'news':news, 'date':date,'title':article.title}

def filterP(links):
    outputs = run_parallel_in_threads(getP, links)
    overall_emotion, overall_sentiment, overall_subj, overall_pol, overall_irony, overall_msg, overall_bias = [], [], [], [], [], [], []
    overall_local_entities_nouns = []
    persons, orgs, gpes = [], [], []
    df_texts, df_sentiments = [], []
    for i in range(len(outputs)):
        local_entities_nouns, local_persons, local_orgs, local_gpes = [], [], [], []
        for sentence in outputs[i]['p']:
            for token in nlp(sentence):
                if token.ent_type_ == 'PERSON':
                    local_persons.append(str(token))
                if token.ent_type_ == 'ORG':
                    local_orgs.append(str(token))
                if token.ent_type_ == 'GPE':
                    local_gpes.append(str(token))
                if (len(token.ent_type_) > 0 or token.tag_ in ['NNP','NN']) and str(token).lower() not in english_stopwords:
                    local_entities_nouns.append(str(token))
        sentiments = getsentiment(outputs[i]['p-classifier'])
        df_sentiments += np.argmax(sentiments,axis=1).tolist()
        df_texts += outputs[i]['p-classifier']
        emotions = getemotion(outputs[i]['p-classifier'])
        msgs = getmsg(outputs[i]['p-classifier'])
        subjectivities, polarities, ironies, biases = getpolar(outputs[i]['p-classifier'])
        overall_local_entities_nouns += local_entities_nouns
        persons += local_persons
        orgs += local_orgs
        gpes += local_gpes
        local_entities_nouns_unique, local_entities_nouns_count = np.unique(local_entities_nouns,return_counts=True)
        sorted_val = local_entities_nouns_unique[np.argsort(local_entities_nouns_count)[::-1]].tolist()
        outputs[i]['tokens'] = sorted_val[:15]
        outputs[i]['sentiment'] = sentiments.tolist()
        outputs[i]['emotion'] = emotions.tolist()
        outputs[i]['msg'] = msgs.tolist()
        outputs[i]['subjectivity'] = subjectivities.tolist()
        outputs[i]['polarity'] = polarities.tolist()
        outputs[i]['irony'] = ironies.tolist()
        outputs[i]['bias'] = biases.tolist()
        outputs[i]['person'] = list(set(local_persons))
        outputs[i]['org'] = list(set(local_orgs))
        outputs[i]['gpes'] = list(set(local_gpes))
        avg_sentiment = sentiments.mean(axis = 0)
        avg_emotion = emotions.mean(axis = 0)
        avg_msg = msgs.mean(axis = 0)
        avg_subjectivity = subjectivities.mean()
        avg_polarity = polarities.mean()
        avg_irony = ironies.mean()
        avg_bias = biases.mean()
        overall_emotion.append(avg_emotion)
        overall_sentiment.append(avg_sentiment)
        overall_msg.append(avg_msg)
        overall_subj.append(avg_subjectivity)
        overall_pol.append(avg_polarity)
        overall_irony.append(avg_irony)
        overall_bias.append(avg_bias)
        outputs[i]['avg_sentiment'] = avg_sentiment.tolist()
        outputs[i]['avg_emotion'] = avg_emotion.tolist()
        outputs[i]['avg_msg'] = avg_msg.tolist()
        outputs[i]['avg_subjectivity'] = avg_subjectivity.tolist()
        outputs[i]['avg_polarity'] = avg_polarity.tolist()
        outputs[i]['avg_irony'] = avg_irony.tolist()
        outputs[i]['avg_bias'] = avg_bias.tolist()

    # graph pipeline
    df = pd.DataFrame({'text':df_texts,'sentiment':df_sentiments})
    df['id'] = df.index
    tfidf = TfidfVectorizer(stop_words='english',norm='l2')
    DxT = tfidf.fit_transform(df['text'])
    DxD = np.dot(DxT,DxT.T)
    G = nx.Graph()
    for i in range(df.shape[0]):
        idx = df.at[i,'id']
        text = df.at[i,'text']
        sentiment = df.at[i,'sentiment']
        G.add_node(idx,text=text,sentiment=sentiment)
    dense_DxD = DxD.toarray()
    len_dense = len(dense_DxD)
    cutoff=0
    for i in range(len_dense):
        for j in range(i+1,len_dense):
            if dense_DxD[i,j]>=cutoff:
                weight=dense_DxD[i,j]
                G.add_edge(df.at[i,'id'],df.at[j,'id'],weight=weight)
    for node,degree in list(dict(G.degree()).items()):
        if degree == 0:
            G.remove_node(node)
    pos = nxlayout.fruchterman_reingold_layout(G,k=1.5/np.sqrt(len(G.nodes())))
    edge_data = []
    colors = {0:'1',1:'2'}
    for u,v,w in G.edges(data=True):
        x0,y0 = pos[u]
        x1,y1 = pos[v]
        w = w['weight']
        edge_data.append(go.Scatter(x=[x0,x1,None],
                                    y=[y0,y1,None],
                                    line=go.Line(width=3.0*w,color='#888'),
                                    hoverinfo='none',
                                    mode='lines'))
    node_data = go.Scatter(
        x=[],
        y=[],
        text=[],
        mode='markers',
        hoverinfo='text',
        marker=go.Marker(
            showscale=True,
            reversescale=True,
            color=[],
            size=5.0,
            colorbar=dict(
                thickness=15,
                xanchor='left',
                tickmode='array',
                tickvals=[1,2],
                ticktext=['negative','positive'],
                ticks = 'outside'
            ),
            line=dict(width=0.5)))
    for u,w in G.nodes(data=True):
        x,y = pos[u]
        color = colors[w['sentiment']]
        text = w['text']
        node_data['x'].append(x)
        node_data['y'].append(y)
        node_data['text'].append(text)
        node_data['marker']['color'].append(color)
    # end graph pipeline

    overall_unique, overall_count = np.unique(overall_local_entities_nouns, return_counts = True)
    overall_unique = overall_unique[np.argsort(overall_count)[::-1]][:200].tolist()
    overall_count = overall_count[np.argsort(overall_count)[::-1]][:200].tolist()
    return {'overall_sentiment': np.array(overall_sentiment).mean(axis = 0).tolist(),
           'overall_emotion': np.array(overall_emotion).mean(axis = 0).tolist(),
           'overall_msg': np.array(overall_msg).mean(axis = 0).tolist(),
           'overall_subjectivity': np.array(overall_subj).mean().tolist(),
           'overall_polarity': np.array(overall_pol).mean().tolist(),
           'overall_irony': np.array(overall_irony).mean().tolist(),
           'overall_bias': np.array(overall_bias).mean().tolist(),
           'person': list(set(persons)),
           'org': list(set(orgs)),
           'gpe': list(set(gpes)),
           'outputs': outputs,
           'wordcloud':list(zip(overall_unique, overall_count)),
           'sentiment-network':edge_data+[node_data]}
