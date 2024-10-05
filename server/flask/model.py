import os
import numpy as np
from PIL import Image
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import BinaryCrossentropy
import keras

country_map = {"Brazil": 1,"Canada":2,"Finland":3,"Japan":4,"United-Kingdom":5,"United_States":6,"Unlabeled":7}

train_dir = "./AI Dataset/train"
test_dir = "./AI Dataset/test"
valid_dir = "./AI Dataset/valid"
@tf.autograph.experimental.do_not_convert
def normalize_img(image, label):
    return (tf.cast(image, tf.float32) / 255.0, label)
@tf.autograph.experimental.do_not_convert
def resize(image, label):
    return (tf.image.resize(image, (224, 224)), label)

def load_dataset(directory, num_samples=None, type=None):

    img_dataset = []
    map_arr = []
    csv_ = pd.read_csv(directory + '/' + '_classes.csv')
    files_in_dir = os.listdir(directory)
    rows_to_process = list(csv_.iterrows())[:num_samples]

    try:

        for index,row in rows_to_process:
            # index filename dengan label sudah sama
            filename = row['filename']
            # tinggal cari image yang sesuai dengan filename

            full_path = os.path.join(directory, filename)
            img = Image.open(full_path)
            # print(img)
            img_array = np.array(img).astype(int)
            img_dataset.append(img_array)
            max_index = np.argmax(row.iloc[1:9].values)
            map_arr.append(np.array(max_index))
        
    except FileNotFoundError:
        print(f"The directory '{directory}' was not found.")
    # except Exception as e:
        # print(f"An error occurred: {e}")

    return np.array(img_dataset), np.array(map_arr)

def read_csv(directory, num_samples=None):
    try:
        label = pd.read_csv(directory + '/' + '_classes.csv')
        label = label.iloc[:, 1:8].idxmax(axis=1)[:num_samples]
        
        map_arr = []
        
        for i in range(len(label)):
            map_arr.append(np.array(country_map.get(label[i])) - 1)
        
        return np.array(map_arr)

        # return map_arr
    except FileNotFoundError:
        print(f"The directory '{directory}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

def preprocess_data(data, labels):
    data = tf.data.Dataset.from_tensor_slices((data, labels))
    data = data.map(resize, num_parallel_calls=tf.data.AUTOTUNE)
    data = data.map(normalize_img, num_parallel_calls=tf.data.AUTOTUNE)
    return data

def alexnet_model(input_shape=(224, 224, 3), num_classes = 7):
    model = models.Sequential()
    model.add(layers.Conv2D(96, (11, 11), strides=(4, 4), activation='relu', input_shape=input_shape))
    model.add(layers.MaxPooling2D((3, 3), strides=(2, 2)))
    model.add(layers.Conv2D(256, (5, 5), padding='same', activation='relu'))
    model.add(layers.MaxPooling2D((3, 3), strides=(2, 2)))
    model.add(layers.Conv2D(384, (3, 3), padding='same', activation='relu'))
    model.add(layers.Conv2D(384, (3, 3), padding='same', activation='relu'))
    model.add(layers.Conv2D(256, (3, 3), padding='same', activation='relu'))
    model.add(layers.MaxPooling2D((3, 3), strides=(2, 2)))
    model.add(layers.Flatten())
    model.add(layers.Dense(4096, activation='relu'))
    model.add(layers.Dense(4096, activation='relu'))
    model.add(layers.Dense(num_classes, activation='softmax',dtype=tf.float32))
    return model

if __name__ == "__main__":
    divide_by = 1

    train_data, train_labels = load_dataset(train_dir, num_samples=len(os.listdir(train_dir)) // divide_by, type="train")
    test_data, test_labels = load_dataset(test_dir, num_samples=len(os.listdir(test_dir)) // divide_by, type="test")

    train_dataset = preprocess_data(train_data, train_labels)
    test_dataset = preprocess_data(test_data, test_labels)

    model = alexnet_model()

    model.compile(loss=keras.losses.SparseCategoricalCrossentropy(),
              optimizer=Adam(learning_rate=0.0001), metrics=['accuracy'])
    
    batch_size = 32
    epochs = 10


    model.fit(
        train_data,
        train_labels,
        epochs = epochs,
        batch_size = batch_size,
        verbose = 2
    )

    model.evaluate(test_data,  test_labels, batch_size=batch_size, verbose=2)
    model.save('cnn_model.h5')
