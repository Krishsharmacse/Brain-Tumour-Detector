import os
import logging
import traceback
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from PIL import Image
from datetime import datetime

# --- CONFIGURATION ---
# 1. Get the directory where app.py resides (which is ".../backend")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Go UP one level to find the 'frontend' folder
# '..' means "go back one folder"
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))

# 3. Define upload folder (inside backend)
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

# Initialize Flask
# static_folder=None ensures we control static file serving manually
app = Flask(__name__, static_folder=None)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB limit
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'dcm'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Logging & Rate Limiter
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1000 per day", "50 per minute"],
    storage_uri="memory://",
)

# --- MODEL LOADING ---
class_names = ['glioma', 'meningioma', 'notumor', 'pituitary']
model = None
# Model is inside backend, same as app.py
model_path = os.path.join(BASE_DIR, "brain_model.h5")

try:
    if os.path.exists(model_path):
        model = tf.keras.models.load_model(model_path)
        logger.info(f"✅ Model loaded from: {model_path}")
    else:
        logger.warning(f"⚠️ Model not found at: {model_path}")
        logger.warning("⚠️ Running in MOCK MODE")
        model = "MOCK"
except Exception as e:
    logger.error(f"❌ Error loading model: {e}")
    model = "MOCK"

# --- HELPER FUNCTIONS ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image):
    image = image.resize((224, 224))
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def get_medical_info(prediction):
    # (Keep your medical dictionary here - omitted for brevity, copy from previous code)
    info = {
        "glioma": {"description": "Gliomas are tumors...", "urgency": "High"},
        "meningioma": {"description": "Meningiomas are tumors...", "urgency": "Medium"},
        "notumor": {"description": "No tumor detected.", "urgency": "Low"},
        "pituitary": {"description": "Pituitary tumors...", "urgency": "Medium"}
    }
    return info.get(prediction, {})

# --- FRONTEND SERVING ROUTES ---

@app.route('/')
def serve_root():
    """Serves the index.html file"""
    # Check if frontend path is correct
    if not os.path.exists(os.path.join(FRONTEND_DIR, 'index.html')):
        return f"<h1>Error: index.html not found</h1><p>Looking in: {FRONTEND_DIR}</p>"
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serves CSS/JS files"""
    return send_from_directory(FRONTEND_DIR, filename)

# --- API ROUTES ---

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_mode": "Mock" if model == "MOCK" else "Real",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    request_id = f"req_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    try:
        image = Image.open(file).convert("RGB")
        
        if model == "MOCK":
            # Mock prediction for testing
            import random
            predicted_class = random.choice(class_names)
            confidence = 0.98
            confidence_scores = {k: (0.98 if k == predicted_class else 0.01) for k in class_names}
            processing_time = 0.1
        else:
            # Real prediction
            start_time = datetime.now()
            img_array = preprocess_image(image)
            prediction = model.predict(img_array, verbose=0)
            predicted_class = class_names[np.argmax(prediction)]
            confidence = float(np.max(prediction))
            confidence_scores = {class_names[i]: float(prediction[0][i]) for i in range(len(class_names))}
            processing_time = (datetime.now() - start_time).total_seconds()

        return jsonify({
            "prediction": predicted_class,
            "confidence": confidence,
            "confidence_scores": confidence_scores,
            "processing_time": processing_time,
            "medical_info": get_medical_info(predicted_class)
        })

    except Exception as e:
        logger.error(f"Prediction error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print(f"🚀 Server running at http://127.0.0.1:5001")
    print(f"📂 Backend folder: {BASE_DIR}")
    print(f"📂 Frontend folder: {FRONTEND_DIR}")
    app.run(host="0.0.0.0", port=5001, debug=True)
