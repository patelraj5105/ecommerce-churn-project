const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    customerId: String,
    recency: Number,
    frequency: Number,
    monetary: Number,
    cluster: Number,
    churnProbability: Number,
    predictionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);