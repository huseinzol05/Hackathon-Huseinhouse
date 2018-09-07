import matplotlib as mpl
mpl.use('Agg')
import ssl
context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
context.load_cert_chain('/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/cert.pem', '/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/privkey.pem')
from flask import Flask, render_template, request
from flask_cors import CORS
import os
import json
import pandas as pd
import seaborn as sns
import numpy as np
sns.set()
color = sns.color_palette("muted")
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/opt/lampp/htdocs/python-api-ripplesystem/picture/'

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        
        traffic = request.form['traffic']
        date = request.form['date']
        idfile = request.form['id']
        
        try:
            land_data = pd.read_csv('https://raw.githubusercontent.com/DevconX/Traffic-Data/master/ripplesystem/landdata/' + date + '.csv')
            traffic_json = json.loads(traffic)
            velocity = [z for _, z in traffic_json.iteritems()]
            
            velocity = velocity[:-1]
        except Exception as e:
            return 'fail to download data, ' + str(e)
            
        try:
            land_data = land_data.fillna(value = 0)
        
            land_data = land_data[['Temp.', 'Dew Point', 'Humidity', 'Visibility', 'Conditions']]
        
            land_data.ix[:, 0] = [float(land_data.ix[:, 0][i][:4]) for i in xrange(land_data.shape[0])]
        
            land_data.ix[:, 1] = [float(land_data.ix[:, 1][i][:4]) for i in xrange(land_data.shape[0])]
        
            land_data.ix[:, 2] = [int(land_data.ix[:, 2][i][:2]) for i in xrange(land_data.shape[0])]
        
            land_data.ix[:, 3] = [float(land_data.ix[:, 3][i][:3]) for i in xrange(land_data.shape[0])]
            
            label = np.unique(land_data.ix[:, 4]).tolist()
            
            land_data.ix[:, 4] = LabelEncoder().fit_transform(land_data.ix[:, 4])
        
        except Exception as e:
            return 'fail to parsing data, ' + str(e)
            
        hour = []
        for i in xrange(land_data.shape[0]):
            hour.append(i)
        
        try:
            fig = plt.figure(figsize = (15, 6))
        
            plt.subplot(1, 2, 1)
            
            plt.plot(hour, velocity, label = 'velocity km/h')
            plt.plot(hour, land_data.ix[:, 0], label = 'temperature')
            plt.plot(hour, land_data.ix[:, 1], label = 'dew points')
            plt.plot(hour, land_data.ix[:, 2], label = 'humidity (%)')
            plt.plot(hour, land_data.ix[:, 3], label = 'visibility km')
            plt.legend()
            plt.xlabel('Hour')
            plt.ylabel('Value')
            plt.title('Correlation velocity')
            
            plt.subplot(1, 2, 2)
            hour = np.array(hour)
            velocity = np.array(velocity)
            for n, i in enumerate(np.unique(land_data.ix[:, 4])):
                plt.scatter(hour[land_data.ix[:, 4] == i], velocity[land_data.ix[:, 4] == i], c = color[n], label = label[n])
                
            plt.xlabel('Hour')
            plt.ylabel('Velocity')
            plt.title('Weather correlation')
            plt.legend()
            fig.tight_layout()
            plt.savefig(UPLOAD_FOLDER + idfile + '.png')
            plt.cla()
            
            return "success"
        
        except Exception as e:
            return "fail to plot, " + str(e)
    
    else:
        if request.args.get('nm') is None:
            return ''
        else:
            idfile = request.args.get('nm')
            
            os.system('rm ' + UPLOAD_FOLDER + str(idfile) + '.png')
            return 'done delete'
            
if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 8002, ssl_context = context)
    