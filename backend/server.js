const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// This line "imports" your blueprint from the models folder
const Prediction = require('./models/Prediction');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to your local MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/churnDB')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

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