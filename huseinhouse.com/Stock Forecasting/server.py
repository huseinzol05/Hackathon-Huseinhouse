import json
from flask import Flask, render_template, request
from werkzeug import secure_filename
from flask_cors import CORS
import numpy as np
import pandas as pd
import datetime
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn import linear_model
from scipy import stats
from sklearn.preprocessing import MinMaxScaler
import statsmodels.api as sm
from itertools import product
import itertools
from datetime import datetime
from datetime import timedelta
regr = linear_model.LinearRegression()
app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = ''
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
columns = ['Date','Open','High','Low','Close']
columns_selected = ['Buy','Sell','DCOILWTICO','DDFUELUSGULF','DGASUSGULF','GOLDAMGBD228NLBM', 'DHOILNYH', 'DJFUELUSGULF', 'DHHNGSP', 'DPROPANEMBTX']
columns_selected_inverted = ['Crude Oil','Diesel','Gasoline','Gold','Heating Oil','Kerosene','Natural Gas','Propane']
crude = pd.read_csv('historical/crude-oil.csv')
diesel = pd.read_csv('historical/Diesel-Fuel.csv')
gasoline = pd.read_csv('historical/Gasoline.csv')
gold = pd.read_csv('historical/gold.csv')
heating_oil = pd.read_csv('historical/Heating-Oil.csv')
kerosene = pd.read_csv('historical/Kerosene-Type-Jet-Fuel.csv')
natural_gas = pd.read_csv('historical/Natural-Gas-Spot.csv')
propane = pd.read_csv('historical/propane.csv')
crude.iloc[:, 1] = MinMaxScaler().fit_transform(crude.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
diesel.iloc[:, 1] = MinMaxScaler().fit_transform(diesel.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
gasoline.iloc[:, 1] = MinMaxScaler().fit_transform(gasoline.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
gold.iloc[:, 1] = MinMaxScaler().fit_transform(gold.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
heating_oil.iloc[:, 1] = MinMaxScaler().fit_transform(heating_oil.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
kerosene.iloc[:, 1] = MinMaxScaler().fit_transform(kerosene.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
natural_gas.iloc[:, 1] = MinMaxScaler().fit_transform(natural_gas.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
propane.iloc[:, 1] = MinMaxScaler().fit_transform(propane.iloc[:, 1].replace(to_replace='.', value=0).reshape([-1, 1]))[:, 0]
crude['DATE'] = pd.to_datetime(crude['DATE'], errors='coerce')
diesel['DATE'] = pd.to_datetime(diesel['DATE'], errors='coerce')
gasoline['DATE'] = pd.to_datetime(gasoline['DATE'], errors='coerce')
gold['DATE'] = pd.to_datetime(gold['DATE'], errors='coerce')
heating_oil['DATE'] = pd.to_datetime(heating_oil['DATE'], errors='coerce')
kerosene['DATE'] = pd.to_datetime(kerosene['DATE'], errors='coerce')
natural_gas['DATE'] = pd.to_datetime(natural_gas['DATE'], errors='coerce')
propane['DATE'] = pd.to_datetime(propane['DATE'], errors='coerce')
Qs = range(0, 1)
qs = range(0, 2)
Ps = range(0, 2)
ps = range(0, 2)
D=1
parameters = product(ps, qs, Ps, Qs)
parameters_list = list(parameters)

def iqr(a):
	a = np.asarray(a)
	q1 = stats.scoreatpercentile(a, 25)
	q3 = stats.scoreatpercentile(a, 75)
	return q3 - q1

def freedman_diaconis_bins(a):
	a = np.asarray(a)
	if len(a) < 2:
		return 1
	h = 2 * iqr(a) / (len(a) ** (1 / 3))
	if h == 0:
		return int(np.sqrt(a.size))
	else:
		return int(np.ceil((a.max() - a.min()) / h))

def invboxcox(y,lmbda):
	if lmbda == 0:
		return(np.exp(y))
	else:
		return(np.exp(np.log(lmbda*y+1)/lmbda))

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		try:
			f = request.files['file']
			f.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
			signal_lookback = int(request.form['rolling'])
			future=int(request.form['future'])
			if future > 50:
				return json.dumps({'error': 'Future count must not more than 50 days'})
			try:
				data = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename)))
			except:
				return json.dumps({'error': 'Fail to read CSV'})
			if len(list(set(list(data)) & set(columns))) != 5:
				return json.dumps({'error': "make sure your columns name got ['Date','Open','High','Low','Close']"})
			if data.shape[0] > 500:
				return json.dumps({'error': "Only able to accept 500 rows data-set"})
			try:
				data = data.replace('null', 0)
				data[['Close','High','Low','Open']] = data[['Close','High','Low','Open']].astype('float64')
			except Exception as e:
				print(e)
				pass
			data = data[(data.Open > 0) & (data.Open != np.nan) & (data.High > 0) & (data.High != np.nan) & (data.Low > 0) & (data.Low != np.nan) & (data.Close > 0) & (data.Close != np.nan)]
			candle = [data.Date.tolist(),data.Close.tolist(),data.High.tolist(),data.Low.tolist(),data.Open.tolist()]
			date_ori = pd.to_datetime(data.Date).tolist()
			for i in range(future):
				lastdate = date_ori[-1]
				while True:
					lastdate = lastdate+timedelta(days=1)
					if lastdate.strftime("%A") not in ['Saturday','Sunday']:
						date_ori.append(lastdate)
						break
			date_ori=pd.Series(date_ori).dt.strftime(date_format='%Y-%m-%d').tolist()
			data.Date = pd.to_datetime(data.Date)
			data.index = data.Date
			t=sm.tsa.seasonal_decompose(data.Close, freq=signal_lookback)
			observed=t.observed.values.tolist()
			trend=t.trend.values.tolist()
			seasonal=t.seasonal.values.tolist()
			resid=t.resid.values.tolist()
			data['Close_box'], lmbda = stats.boxcox(data.Close)
			best_aic = float("inf")
			for param in parameters_list:
				try:
					model=sm.tsa.statespace.SARIMAX(data['Close_box'], order=(param[0], D, param[1]), seasonal_order=(param[2], D, param[3], 31)).fit(disp=-1)
				except:
					continue
				aic = model.aic
				if aic < best_aic and aic:
					best_model = model
					best_aic = aic
					break
			preb = best_model.get_prediction(start=0, end=data.Close.shape[0]+future)
			y = invboxcox(preb.predicted_mean, lmbda)
			predict_ci = preb.conf_int(alpha=0.05)
			lower_y = invboxcox(predict_ci['lower Close_box'].values, lmbda)
			lower_y[np.where(lower_y[:data.Close.shape[0]] < np.min(data.Close))[0]] = np.min(data.Close)
			upper_y = invboxcox(predict_ci['upper Close_box'].values, lmbda)
			upper_y[np.where(upper_y[:data.Close.shape[0]] > np.max(data.Close))[0]] = np.max(data.Close)
			mean_month=pd.rolling_mean(data.Close, window=31)[31:].values
			regr.fit(np.arange(mean_month.shape[0]).reshape((-1,1)), mean_month.reshape((-1,1)))
			future_linear=regr.predict(np.arange(mean_month.shape[0]+future).reshape((-1,1)))[:,0]
			y[np.where(y[:data.Close.shape[0]] > np.max(data.Close))[0]] = np.max(data.Close)
			y[np.where(y[:data.Close.shape[0]] < np.min(data.Close))[0]] = np.min(data.Close)
			temp = y.to_frame()
			temp['Buy'] = np.zeros(len(temp))
			temp['Sell'] = np.zeros(len(temp))
			temp['RollingMax'] = temp[0].shift(1).rolling(signal_lookback, min_periods=signal_lookback).max()
			temp['RollingMin'] = temp[0].shift(1).rolling(signal_lookback, min_periods=signal_lookback).min()
			temp.loc[temp['RollingMax'] < temp[0], 'Sell'] = -1
			temp.loc[temp['RollingMin'] > temp[0], 'Buy'] = 1
			data['Buy'] = np.zeros(len(data))
			data['Sell'] = np.zeros(len(data))
			data['Decision'] = np.zeros(len(data))
			data['RollingMax'] = data.Close.shift(1).rolling(signal_lookback, min_periods=signal_lookback).max()
			data['RollingMin'] = data.Close.shift(1).rolling(signal_lookback, min_periods=signal_lookback).min()
			data.loc[data['RollingMax'] < data.Close, 'Sell'] = -1
			data.loc[data['RollingMax'] < data.Close, 'Decision'] = 1
			data.loc[data['RollingMin'] > data.Close, 'Buy'] = 1
			data.loc[data['RollingMin'] > data.Close, 'Decision'] = 2
			decision = data['Decision'].values
			buy_prob=data[data.Buy == 1].shape[0] / (data.shape[0] *1.0)
			sell_prob=data[data.Sell == -1].shape[0] / (data.shape[0] *1.0)
			output_prob = []
			for n in range(3, 11):
				nested_prob = {'date': date_ori[data.shape[0]+(n-1)],'prob':[]}
				repeat=list(itertools.product(['B','S'], repeat=n))
				buy = [i for i in repeat if i[-1] =='B']
				total = 0
				for i in buy:
					probs = 1
					for k in i:
						if k == 'S':
							probs *= sell_prob
						else:
							probs *= buy_prob
					total += probs
				nested_prob['prob'].append('probability to buy: %f' % (total))
				sell = [i for i in repeat if i[-1] =='S']
				total = 0
				for i in sell:
					probs = 1
					for k in i:
						if k == 'S':
							probs *= sell_prob
						else:
							probs *= buy_prob
					total += probs
				nested_prob['prob'].append('probability to sell: %f' % (total))
				output_prob.append(nested_prob)
			buy = temp['Buy'].values.tolist()
			sell = temp['Sell'].values.tolist()
			close = data['Close'].values.tolist()
			predict_close = temp[0].values.tolist()
			data['Day'] = data['Date'].dt.weekday_name
			day_unique, day_count = np.unique(data['Day'].values, return_counts = True)
			data['Month'] = data['Date'].dt.strftime('%b')
			month_unique, month_count = np.unique(data['Month'].values, return_counts = True)
			quantile_real, linear_real = [], []
			kde_real, bar_real = [], []
			for i in columns[1:]:
				quan, _ = stats.probplot(data[i])
				quan_x = quan[0]
				quan_y = quan[1]
				regr.fit(quan_x.reshape([-1, 1]), quan_y.reshape([-1, 1]))
				quan_reg = regr.predict(quan_x.reshape([-1, 1]))
				quan_array = []
				for no, k in enumerate(np.unique(decision)):
					inner = []
					inner.append(quan_x[decision==k].tolist())
					inner.append(quan_y[decision==k].tolist())
					quan_array.append(inner)
				quantile_real.append(quan_array)
				linear_real.append([quan_x.tolist(),quan_reg[:, 0].tolist()])
				z = sns.distplot(data[i]).get_lines()[0].get_data()
				plt.cla()
				kde_real.append([z[0].tolist(), z[1].tolist()])
				data_array = data[i].values
				bar_array = []
				for no, k in enumerate(np.unique(decision)):
					weights = np.ones_like(data_array[decision == k])/float(len(data_array[decision == k]))
					n, bins, _ = plt.hist(data_array[decision == k], min(freedman_diaconis_bins(data_array[decision == k]), 50),weights=weights)
					plt.cla()
					bar_array.append([bins.tolist(), n.tolist()])
				bar_real.append(bar_array)
			minmax = MinMaxScaler().fit(data['Close'].values.reshape((-1,1)))
			data['Close'] = minmax.transform(data['Close'].values.reshape((-1,1)))
			data = data.merge(crude, left_on='Date', right_on='DATE')
			data = data.merge(diesel, left_on='Date', right_on='DATE')
			data = data.merge(gasoline, left_on='Date', right_on='DATE')
			data = data.merge(gold, left_on='Date', right_on='DATE')
			data = data.merge(heating_oil, left_on='Date', right_on='DATE')
			data = data.merge(kerosene, left_on='Date', right_on='DATE')
			data = data.merge(natural_gas, left_on='Date', right_on='DATE')
			data = data.merge(propane, left_on='Date', right_on='DATE')
			correlation = data[columns_selected].corr().values
			argmin = columns_selected[2:][::-1][np.argmin(correlation[2:,0])]
			argmax = columns_selected[2:][::-1][np.argmax(correlation[2:,1])]
			y1, y2 = data[argmin].values,data[argmax].values
			x1, x2 = data['Buy'].values, data['Sell'].values
			data.index = pd.to_datetime(data.Date, errors='coerce')
			data = data.resample('D').mean()
			data_month = data.resample('M').mean()
			data_year = data.resample('A-DEC').mean()
			data_Q = data.resample('Q-DEC').mean()
			data['GOLDAMGBD228NLBM'] = data['GOLDAMGBD228NLBM'].replace(0, np.nan)
			data['Buy'] = data['Buy'].replace(0, np.nan)
			data['Sell'] = data['Sell'].replace(0, np.nan)
			data['Sell'] = data['Sell'].replace(-1, 0)
			return json.dumps({'columns': columns[1:], 'quantile-real': quantile_real,'linear-real': linear_real,
							   'kde_real': kde_real, 'bar_real': bar_real,
							   'density-buy':[x1.tolist(), y1.tolist()],
							   'density-sell':[x2.tolist(), y2.tolist()],
							   'selected-column': [columns_selected_inverted[np.argmin(correlation[2:,0])], columns_selected_inverted[np.argmax(correlation[2:,1])]],
							   'data': data[['Close','DCOILWTICO','DDFUELUSGULF','DGASUSGULF','GOLDAMGBD228NLBM', 'DHOILNYH', 'DJFUELUSGULF', 'DHHNGSP', 'DPROPANEMBTX','Buy', 'Sell']].values.T.tolist(),
							   'data-date': data.index.values.astype('str').tolist(),
							   'lower-boundary': lower_y.tolist(),
							   'upper-boundary': upper_y.tolist(),
							   'avg-mean': mean_month.tolist(),
							   'mean-linear': future_linear.tolist(),
							   'month-x': month_unique.tolist(),'month-y': month_count.tolist(),
							   'day-x': day_unique.tolist(), 'day-y': day_count.tolist(),
							   'buy': buy, 'sell': sell, 'close': close, 'x-axis': date_ori[:-future],
							   'x-axis-predict': date_ori, 'predict-close':predict_close,
							   'observed':observed,
							   'trend':trend,
							   'seasonal':seasonal,
							  'observed':resid,
							  'candle': candle,
							   'probability': output_prob,
							   'month': minmax.inverse_transform(data_month['Close'].values.reshape((-1,1)))[:,0].tolist(), 'month-x': data_month.index.strftime(date_format='%Y-%m-%d').tolist(),
							   'year': minmax.inverse_transform(data_year['Close'].values.reshape((-1,1)))[:,0].tolist(), 'year-x': data_year.index.strftime(date_format='%Y-%m-%d').tolist(),
							   'quantile': minmax.inverse_transform(data_Q['Close'].values.reshape((-1,1)))[:,0].tolist(), 'quantile-x': data_Q.index.strftime(date_format='%Y-%m-%d').tolist(),
							   'z': correlation.tolist()}).replace('NaN', 'null')
		except Exception as e:
			print e
			return json.dumps({'error': 'Error during processing, please select another data'})
	else:
		return json.dumps({'error': 'accept POST request only'})

if __name__ == '__main__':
	app.run(host = '0.0.0.0', threaded = True, port = 0)
