import tensorflow as tf
import numpy as np

class Model:

    def __init__(self, num_layers, size_layers, enable_dropout, dropout, enable_penalty, delta, activation_functions, last_activation, loss_function, learning_rate, size_input, size_output, optimizer):

        self.X = tf.placeholder(tf.float32, (None, size_input))
        self.Y = tf.placeholder(tf.float32, (None, size_output))

        def chooseoptimizer(ops):

            if ops == 'gradientdescent':
                return tf.train.GradientDescentOptimizer
            elif ops == 'adagrad':
                return tf.train.AdagradOptimizer
            elif ops == 'adam':
                return tf.train.AdamOptimizer
            elif ops == 'rmsprop':
                return tf.train.RMSPropOptimizer
            else:
                raise Exception("model type not supported")

        def activate(activation, first_layer, second_layer, bias, enable_drop, drop):

            if activation == 'softmax':
                activation = tf.nn.softmax
            elif activation == 'sigmoid':
                activation = tf.nn.sigmoid
            elif activation == 'tanh':
                activation = tf.nn.tanh
            elif activation == 'relu':
                activation = tf.nn.relu
            else:
                raise Exception("model type not supported")

            layer = activation(tf.matmul(first_layer, second_layer) + bias)

            if enable_drop:
                return tf.nn.dropout(layer, drop)
            else:
                return layer

        def calculate_cost(last_function, loss, y_hat, y):

            if last_function == 'sigmoid' and loss == 'cross_entropy':
                return tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(logits = y_hat, labels = y))
            if last_function == 'softmax' and loss == 'cross_entropy':
                return tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits = y_hat, labels = y))

            if last_function == 'sigmoid':
                y_hat = tf.nn.sigmoid(y_hat)
            elif last_function == 'softmax':
                y_hat = tf.nn.softmax(y_hat)
            elif last_function == 'tanh':
                y_hat = tf.nn.tanh(y_hat)
            elif last_function == 'relu':
                y_hat = tf.nn.relu(y_hat)
            else:
                raise Exception("Activation function not supported")

            if loss == 'MSE':
                cost = tf.square(y_hat - y)
            elif loss == 'cross_entropy':
                cost = y * np.log2(y_hat) + (1 - y) * np.log2(1 - y_hat)

            return tf.reduce_mean(cost)

        input_layer = tf.Variable(tf.random_normal([size_input, size_layers[0]]))
        biased_layer = tf.Variable(tf.random_normal([size_layers[0]], stddev = 0.1))

        output_layer = tf.Variable(tf.random_normal([size_layers[num_layers - 1], size_output]))
        biased_output = tf.Variable(tf.random_normal([size_output], stddev = 0.1))

        layers = []
        for i in range(num_layers - 1):
            layers.append(tf.Variable(tf.random_normal([size_layers[i], size_layers[i + 1]])))

        biased = []
        for i in range(num_layers - 1):
            biased.append(tf.Variable(tf.random_normal([size_layers[i + 1]])))

        first_l = activate(activation_functions[0], self.X, input_layer, biased_layer, enable_dropout, dropout[0])
        next_l = activate(activation_functions[1], first_l, layers[0], biased[0], enable_dropout, dropout[1])

        for i in range(1, num_layers - 1):
            next_l = activate(activation_functions[i + 1], next_l, layers[i], biased[i], enable_dropout, dropout[i + 1])

        self.last_l = tf.matmul(next_l, output_layer) + biased_output

        self.cost = calculate_cost(last_activation, loss_function, self.last_l, self.Y)

        if enable_penalty:
            regularizers = tf.nn.l2_loss(input_layer) + sum(map(lambda x: tf.nn.l2_loss(x), layers)) + tf.nn.l2_loss(output_layer)
            self.cost = tf.reduce_mean(self.cost + delta * regularizers)

        grad_descent = chooseoptimizer(optimizer)
        self.optimizer = grad_descent(learning_rate).minimize(self.cost)

        correct_prediction = tf.equal(tf.argmax(self.last_l, 1), tf.argmax(self.Y, 1))
        self.accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))
