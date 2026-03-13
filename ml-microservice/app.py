import os
import pickle
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This allows your Node.js backend to talk to this Python API

# --- MODEL LOADING LOGIC ---
# This part makes sure the app finds the 'models' folder correctly on any server
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models')

try:
    scaler = pickle.load(open(os.path.join(MODEL_PATH, 'scaler.pkl'), 'rb'))
    kmeans = pickle.load(open(os.path.join(MODEL_PATH, 'kmeans_model.pkl'), 'rb'))
    rf_model = pickle.load(open(os.path.join(MODEL_PATH, 'rf_model.pkl'), 'rb'))
    print("✅ All ML models loaded successfully!")
except FileNotFoundError:
    print("❌ ERROR: Model files not found in ml-microservice/models/")
# ---------------------------

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from the request
        data = request.json
        # The model expects a DataFrame with these exact columns
        input_df = pd.DataFrame([{
            "Recency": float(data['Recency']),
            "Frequency": float(data['Frequency']),
            "Monetary": float(data['Monetary'])
        }])
        
        # 1. Scale the data
        scaled_data = scaler.transform(input_df)
        
        # 2. Get Cluster (Segmentation)
        cluster = kmeans.predict(scaled_data)[0]
        
        # 3. Get Churn Prediction (0 = Stay, 1 = Churn)
        churn_pred = rf_model.predict(input_df)[0]
        churn_prob = rf_model.predict_proba(input_df)[0][1]
        
        return jsonify({
            "cluster": int(cluster),
            "churn_prediction": int(churn_pred),
            "churn_probability": round(float(churn_prob), 2),
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"})

if __name__ == '__main__':
    # Render will use a different port, but for local testing, we use 5000
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 ML Microservice is running on port {port}")
    app.run(host='0.0.0.0', port=port)