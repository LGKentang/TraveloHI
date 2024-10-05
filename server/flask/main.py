import numpy as np
import os
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

country_map = {1: 'Brazil', 2: 'Canada', 3: 'Finland', 4: 'Japan', 5: 'United-Kingdom', 6: 'United_States', 7: 'Unlabeled'}

def load_dataset(directory, num_samples=None):
    img_dataset = []
    try:
        files_in_dir = os.listdir(directory)
        jpg_files = [file for file in files_in_dir if file.endswith(".jpg")][:num_samples]

        for jpg_file in jpg_files:
            full_path = os.path.join(directory, jpg_file)
            img = Image.open(full_path)
            img_array = np.array(img).astype(int)
            img_dataset.append(img_array)

    except FileNotFoundError:
        print(f"The directory '{directory}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

    return np.array(img_dataset)

def predict_image(image):
    train_dir = "./AI Dataset/train"
    test_dir = "./AI Dataset/test"
    valid_dir = "./AI Dataset/valid"
    loaded_model = tf.keras.models.load_model('cnn_model.h5')

    prediction = loaded_model.predict(image)
    predicted_class_index = np.argmax(prediction,axis=1)
    return country_map[predicted_class_index[0]+1]


@app.route('/')
def home():
    return 'Hello, Flask!'

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files["image"]
        img = Image.open(file.stream)
        img = img.resize((224, 224))
        img = np.array(img)
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        img = img.reshape(1, 224, 224, 3)
        
        predicted = predict_image(img)


        print(img)
        # Return a response
        response = jsonify({'predictions': predicted})
        response.headers.add('Access-Control-Allow-Origin','*')
        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)





    # train_data = load_dataset(train_dir, num_samples=len(os.listdir(train_dir)) // 10)
    # test_data = load_dataset(test_dir, num_samples=len(os.listdir(test_dir))//10)

    # # single_data_point = train_data[0][tf.newaxis, ...]
    # for i in range(100):
    #     single_data_point = train_data[i][tf.newaxis, ...]
    #     predictions = loaded_model.predict(single_data_point)
        
    #     # Get the index of the maximum predicted class
    #     predicted_class_index = np.argmax(predictions, axis=1)
        
    #     print(f"Data point {i + 1}, Predicted Class Index: {predicted_class_index}")




