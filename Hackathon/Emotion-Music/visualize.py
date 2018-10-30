import matplotlib.pyplot as plt
import seaborn as sns
import os
import numpy as np
sns.set()

list_folder = os.listdir('data/')
unique_label = np.unique(list_folder)
total = []
for i in xrange(unique_label.shape[0]):
	nested_list = os.listdir('data/' + unique_label[i])
	total.append(len(nested_list))
	
plt.figure(figsize = (10, 5))
y = np.arange(len(list_folder))
plt.bar(y, total)
plt.xticks(y, unique_label)
plt.ylabel('freq')
plt.savefig('bar-emotion.png')
for i in xrange(unique_label.shape[0]):
	print unique_label[i] + ': ' + str(total[i])
	
list_folder = os.listdir('dataperson/')
unique_label = np.unique(list_folder)
total = []
for i in xrange(unique_label.shape[0]):
	nested_list = os.listdir('dataperson/' + unique_label[i])
	total.append(len(nested_list))

plt.cla()
plt.figure(figsize = (10, 5))
y = np.arange(len(list_folder))
plt.bar(y, total)
plt.xticks(y, unique_label)
plt.ylabel('freq')
plt.savefig('bar-person.png')
for i in xrange(unique_label.shape[0]):
	print unique_label[i] + ': ' + str(total[i])