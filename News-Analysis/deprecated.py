def getcomponent(sentence):
    batch_x_polarity = np.zeros((1, len(sentence), DIMENSION), dtype = np.float32)
    batch_x_subjectivity = np.zeros((1, len(sentence), DIMENSION), dtype = np.float32)
    batch_x_irony = np.zeros((1, len(sentence), DIMENSION), dtype = np.float32)
    batch_x_bias = np.zeros((1, len(sentence), DIMENSION), dtype = np.float32)
    for k, text in enumerate(sentence):
        try:
            batch_x_polarity[0, k, :] += vectors_polarity_comp[dictionary_polarity_comp[text], :]
        except:
            pass
        try:
            batch_x_subjectivity[0, k, :] += vectors_subjectivity_comp[dictionary_subjectivity_comp[text], :]
        except:
            pass
        try:
            batch_x_irony[0, k, :] += vectors_irony_comp[dictionary_irony_comp[text], :]
        except:
            pass
        try:
            batch_x_bias[0, k, :] += vectors_bias_comp[dictionary_bias_comp[text], :]
        except:
            pass

    output_polarity = polarity_sess_component.run(tf.nn.softmax(model_polarity_component.logits),
                                                   feed_dict = {model_polarity_component.X : batch_x_polarity})
    output_subjectivity = subjectivity_sess_component.run(tf.nn.softmax(model_subjectivity_component.logits),
                                                           feed_dict = {model_subjectivity_component.X : batch_x_subjectivity})
    output_irony = irony_sess_component.run(tf.nn.softmax(model_irony_component.logits),
                                                           feed_dict = {model_irony_component.X : batch_x_irony})
    output_bias = bias_sess_component.run(tf.nn.softmax(model_bias_component.logits),
                                                           feed_dict = {model_bias_component.X : batch_x_bias})
    argmax_subjectivity = np.argmax(output_subjectivity, axis = 1)
    argmax_subjectivity[np.where(argmax_subjectivity == 0)[0]] = -1
    argmax_polarity = np.argmax(output_polarity, axis = 1)
    argmax_polarity[np.where(argmax_polarity == 0)[0]] = -1
    argmax_irony = np.argmax(output_irony, axis = 1)
    argmax_irony[np.where(argmax_irony == 0)[0]] = -1
    argmax_bias = np.argmax(output_bias, axis = 1)
    argmax_bias[np.where(argmax_bias == 0)[0]] = -1
    return ((np.max(output_subjectivity, axis = 1) - 0.5) / 0.5) * argmax_subjectivity, ((np.max(output_polarity, axis = 1) - 0.5) / 0.5) * argmax_polarity, ((np.max(output_irony, axis = 1) - 0.5) / 0.5) * argmax_irony, ((np.max(output_bias, axis = 1) - 0.5) / 0.5) * argmax_bias
