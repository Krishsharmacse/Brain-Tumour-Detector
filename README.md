# Brain-Tumour-Detector
# 🧠 NeuroScan AI

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Backend-Flask-blue?logo=flask)
![TensorFlow](https://img.shields.io/badge/AI-TensorFlow-orange?logo=tensorflow)
![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow?logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green)

**NeuroScan AI** is a cutting-edge web application designed to assist in the early detection of brain tumors using MRI scans. Developed by **Krish Sharma** (USICT), it combines Deep Learning for diagnosis with intelligent geolocation services to connect patients with the nearest specialized medical care.

---

## 🚀 Features

### 1. AI-Powered Diagnosis
* **High Accuracy:** Utilizes a Convolutional Neural Network (CNN) trained on thousands of MRI scans (~92% accuracy).
* **Multi-Class Detection:** Identifies four distinct conditions:
    * **Glioma**
    * **Meningioma**
    * **Pituitary Tumor**
    * **No Tumor** (Healthy)

### 2. Intelligent Hospital Locator
* **Specialist Search:** Automatically detects user location and searches specifically for **Neurologists**, **Radiologists**, and **MRI Centers** using the Overpass API.
* **Smart Fallback:** If no specialists are found nearby, the system automatically falls back to searching for general hospitals to ensure the user always gets help.
* **Interactive Map:** Built with Leaflet.js for smooth navigation.

### 3. Medical Insights
* Provides immediate, context-aware information regarding the detected tumor type, including descriptions, treatment options, and urgency levels.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JavaScript |
| **Mapping** | Leaflet.js, OpenStreetMap, Overpass API |
| **Backend** | Python, Flask (REST API) |
| **AI Model** | TensorFlow / Keras (CNN) |
| **Image Proc** | NumPy, Pillow |

---

## 📂 Project Structure

```bash
NeuroScan-AI/
├── backend/
│   ├── app.py              # Flask Application Entry Point
│   ├── model.h5            # Pre-trained Deep Learning Model
│   └── requirements.txt    # Python Dependencies
│
├── frontend/
│   ├── index.html          # Main User Interface
│   ├── style.css           # Styling & Animations
│   └── script.js           # Frontend Logic (API & Maps)
│
└── README.md               # Project Documentation
⚡ Installation & Setup
Follow these steps to run the project locally.

Prerequisites
Python 3.8+ installed.

A modern web browser.

1. Backend Setup
Bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (Optional but recommended)
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install flask flask-cors tensorflow numpy pillow

# Run the Flask server
python app.py
The server will start on http://127.0.0.1:5001

2. Frontend Setup
Navigate to the frontend/ folder.

Open index.html in your web browser.

Tip: For the best experience, use the "Live Server" extension in VS Code to run the HTML file.

📸 Usage Guide
Upload: Click or drag an MRI image (.jpg, .png, .dcm) into the upload zone.

Analyze: Click the Analyze Scan button.

Result: View the prediction, confidence score, and medical details.

Locate: If a tumor is detected, the map will auto-scroll and pinpoint nearby specialists.

👨‍💻 About the Developer
Krish Sharma B.Tech Student, University School of Information, Communication and Technology (USICT)

Passionate about leveraging Artificial Intelligence to solve real-world healthcare challenges. NeuroScan AI represents a step towards making advanced diagnostics accessible and actionable.

⚠️ Medical Disclaimer
This application is designed for educational and research purposes only. It is not a certified medical device and should not be used as a substitute for professional medical diagnosis, advice, or treatment. Always consult a qualified healthcare provider for any medical concerns.

📄 License
This project is open-source and available under the MIT License.
