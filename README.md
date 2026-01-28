Markdown
<div align="center">

# 🧠 NeuroScan AI
### Intelligent Brain Tumor Detection & Specialist Locator

[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)](https://github.com/yourusername/NeuroScan-AI)
[![Python](https://img.shields.io/badge/Backend-Flask-blue?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/AI-TensorFlow-orange?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A cutting-edge web application combining Deep Learning for MRI diagnosis with intelligent geolocation services.</b>
</p>

[View Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📖 Overview
**NeuroScan AI** is designed to bridge the gap between advanced medical diagnostics and patient accessibility. Developed by **Krish Sharma** (USICT), this system analyzes MRI scans using a Convolutional Neural Network (CNN) to detect brain tumors and immediately connects patients with the nearest specialized medical care (Neurologists, Radiologists) using geolocation data.

---

## 📸 Screenshots
*(Add your screenshots here. It is highly recommended to show the "Upload" interface and the "Result/Map" interface)*

| Upload Interface | Analysis & Map Result |
|:---:|:---:|
| <img src="path/to/upload-screenshot.png" alt="Upload" width="400"/> | <img src="path/to/result-screenshot.png" alt="Result" width="400"/> |

---

## 🚀 Key Features

### 1. 🧠 AI-Powered Diagnosis
* **Deep Learning Core:** Powered by a custom CNN model trained on thousands of MRI scans with **~92% accuracy**.
* **Multi-Class Classification:** Capable of identifying:
    * `Glioma`
    * `Meningioma`
    * `Pituitary Tumor`
    * `No Tumor` (Healthy)

### 2. 📍 Intelligent Hospital Locator
* **Context-Aware Search:** Automatically detects user coordinates to find **Neurologists**, **Radiologists**, and **MRI Centers** specifically.
* **Smart Fallback System:** If specialized centers aren't found, the system intelligently broadens the search to general hospitals to ensure no patient is left without options.
* **Interactive Mapping:** Visualizes data using **Leaflet.js** and the **Overpass API**.

### 3. ℹ️ Medical Insights
* Delivers immediate context regarding the specific tumor type detected, including urgency levels and general medical descriptions to educate the user.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript |
| **Mapping** | Leaflet.js, OpenStreetMap, Overpass API |
| **Backend** | Python 3.8+, Flask (REST API) |
| **Deep Learning** | TensorFlow, Keras (CNN Architecture) |
| **Data Processing** | NumPy, Pillow (PIL) |

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* Python 3.8 or higher
* A modern web browser (Chrome/Edge/Firefox)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/NeuroScan-AI.git](https://github.com/yourusername/NeuroScan-AI.git)
cd NeuroScan-AI
2. Backend Setup
Bash
# Navigate to backend
cd backend

# Create virtual environment (Recommended)
python -m venv venv

# Activate Virtual Environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Dependencies
pip install flask flask-cors tensorflow numpy pillow

# Run the Server
python app.py
The backend server will start at http://127.0.0.1:5001

3. Frontend Setup
Navigate to the frontend/ folder.

Open index.html in your browser.

Pro Tip: For the best experience (and to avoid local file CORS issues), use the Live Server extension in VS Code.

📂 Project Structure
Plaintext
NeuroScan-AI/
├── backend/
│   ├── app.py             # Main Flask API
│   ├── model.h5           # Pre-trained CNN Model
│   └── requirements.txt   # Backend dependencies
├── frontend/
│   ├── index.html         # User Interface
│   ├── style.css          # Glassmorphism Styling
│   └── script.js          # API Logic & Map Rendering
└── README.md              # Documentation
🧠 Model Architecture
The AI model is a Convolutional Neural Network (CNN) built with TensorFlow/Keras. It consists of:

Convolutional Layers: To extract features (edges, textures) from MRI images.

MaxPooling Layers: To reduce dimensionality and computation.

Flattening & Dense Layers: For final classification into 4 categories.

Softmax Activation: To output probability scores for each tumor class.

🔮 Future Scope
[ ] Integration of DICOM file support for direct medical usage.

[ ] Deployment to cloud platforms (AWS/GCP/Heroku).

[ ] Mobile Application (React Native).

[ ] PDF Report Generation for patients.

👨‍💻 Author
Krish Sharma

University School of Information, Communication and Technology (USICT)

Passionate about AI in Healthcare.

⚠️ Medical Disclaimer
IMPORTANT: This application is developed for educational and research purposes only. It is not a certified medical device. The predictions made by the AI should never be used as a substitute for professional medical diagnosis, advice, or treatment. Always consult a qualified neurologist or healthcare provider for any medical concerns.

📄 License
This project is open-source and available under the MIT License.

