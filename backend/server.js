const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// This line "imports" your blueprint from the models folder
const Prediction = require('./models/Prediction');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["https://ecommerce-churn-project.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

// Connect to your local MongoDB
const DB_URI = 'mongodb+srv://patelraj5105_db_user:Rajpatel5105@cluster0.xdeio95.mongodb.net/churnDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas Cloud'))
    .catch(err => console.error('❌ MongoDB Cloud Error:', err.message));

// The main route that talks to your Python AI
app.post('/api/predict', async (req, res) => {
    try {
        const { customerId, recency, frequency, monetary } = req.body;

        // Call the Python API running on Port 5000
        const response = await axios.post('http://127.0.0.1:5000/predict', {
            Recency: recency,
            Frequency: frequency,
            Monetary: monetary
        });

        // Use the Prediction blueprint to save data
        const newPrediction = new Prediction({
            customerId,
            recency,
            frequency,
            monetary,
            cluster: response.data.cluster,
            churnProbability: response.data.churn_probability
        });

        await newPrediction.save();
        res.json(newPrediction);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Backend error or Python AI unreachable" });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Node.js Backend running on http://localhost:${PORT}`));