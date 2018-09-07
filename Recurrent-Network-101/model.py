import tensorflow as tf
import numpy as np

class Model:

    def __init__(self, num_layers, size_layer, enable_dropout, dropout, enable_penalty, delta, activation_function,
                 loss_function, learning_rate, size_input, size_output, optimizer, gate_type):

        self.X = tf.placeholder(tf.float32, (None, None, size_input))
        self.Y = tf.placeholder(tf.float32, (None, size_output))

        def define_cell(model, size_layer, activation):
            if activation == 'sigmoid':
                activation = tf.nn.sigmoid
            elif activation == 'tanh':
                activation = tf.nn.tanh
            elif activation == 'relu':
                activation = tf.nn.relu
            else:
                raise Exception("activation function type not supported")
            if model == 'lstm':
                return tf.nn.rnn_cell.LSTMCell(size_layer, activation = activation, state_is_tuple = False)
            elif model == 'gru':
                return tf.nn.rnn_cell.GRUCell(size_layer, activation = activation)
            elif model == 'basic':
                return tf.nn.rnn_cell.BasicRNNCell(size_layer, activation = activation)
            else:
                raise Exception("gate type not supported")

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
                raise Exception("sgd technique not supported")

        def calculate_cost(loss, y_hat, y):

            if loss == 'MSE':
                return tf.reduce_mean(tf.square(y - y_hat))
            elif loss == 'RMSE':
                return tf.sqrt(tf.reduce_mean(tf.square(y - y_hat)))
            elif loss == 'MAE':
                return tf.reduce_mean(tf.abs(y - y_hat))

        rnn_cells = tf.nn.rnn_cell.MultiRNNCell([define_cell(gate_type, size_layer, activation_function) for _ in range(num_layers)], state_is_tuple = False)
        if gate_type == 'lstm':
            self.hidden_layer = tf.placeholder(tf.float32, (None, num_layers * 2 * size_layer))
        else:
            self.hidden_layer = tf.placeholder(tf.float32, (None, num_layers * size_layer))
        if enable_dropout:
            rnn_cells = tf.contrib.rnn.DropoutWrapper(rnn_cells, output_keep_prob = dropout)
        self.outputs, self.last_state = tf.nn.dynamic_rnn(rnn_cells, self.X, initial_state = self.hidden_layer, dtype = tf.float32)
        rnn_W = tf.Variable(tf.random_normal((size_layer, size_output)))
        rnn_B = tf.Variable(tf.random_normal([size_output]))
        self.logits = tf.matmul(self.outputs[-1], rnn_W) + rnn_B
        self.cost = calculate_cost(loss_function, self.logits, self.Y)

        if enable_penalty:
            l2 = sum(delta * tf.nn.l2_loss(tf_var) for tf_var in tf.trainable_variables())
            self.cost += l2

        grad_descent = chooseoptimizer(optimizer)
        self.optimizer = grad_descent(learning_rate).minimize(self.cost)
