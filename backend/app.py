from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from flask_cors import CORS
import base64
from io import BytesIO
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model_caption = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# Load YOLO model for sign detection
model = YOLO("best_params.pt")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'}), 400

        print("Request received")
        image_file = request.files['image']
        image = Image.open(image_file)
        inputs = processor(images=image, return_tensors="pt")
        outputs = model_caption.generate(**inputs)
        caption = processor.decode(outputs[0], skip_special_tokens=True)
        print("Caption generated:", caption)

        return jsonify({'caption': caption})
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'An error occurred'}), 500

@app.route('/predict_video', methods=['POST'])
def predict_video():
    try:
        if 'image' not in request.json:
            return jsonify({'error': 'No image data found in request'}), 400
        
        print("Request received for video prediction")
        image_data = base64.b64decode(request.json['image'].split(",")[1])
        image = Image.open(BytesIO(image_data))
        
        # Use YOLO model for sign detection
        results = model(image)

        # Assuming the model returns a list of predictions
        detections = results.xyxy[0].tolist()
        
        # Process detections as needed
        
        return jsonify({'detections': detections})  # Sending detections to frontend
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'An error occurred during video prediction'}), 500

if __name__ == '__main__':
    app.run(debug=True)
