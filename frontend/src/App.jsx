import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({
    customerId: '',
    recency: '',
    frequency: '',
    monetary: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://churn-backend-wtq4.onrender.com/api/predict', formData);
      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Churn Prediction Project</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
        <input placeholder="Customer ID" onChange={(e) => setFormData({...formData, customerId: e.target.value})} style={{display: 'block', margin: '10px 0'}} />
        <input placeholder="Recency" type="number" onChange={(e) => setFormData({...formData, recency: e.target.value})} style={{display: 'block', margin: '10px 0'}} />
        <input placeholder="Frequency" type="number" onChange={(e) => setFormData({...formData, frequency: e.target.value})} style={{display: 'block', margin: '10px 0'}} />
        <input placeholder="Monetary" type="number" onChange={(e) => setFormData({...formData, monetary: e.target.value})} style={{display: 'block', margin: '10px 0'}} />
        <button type="submit" disabled={loading}>{loading ? 'Predicting...' : 'Get Prediction'}</button>
      </form>
      {result && (
        <div style={{ marginTop: '20px', border: '1px solid black', padding: '10px' }}>
          <h3>Result:</h3>
          <p>Risk: {result.churnProbability > 0.5 ? '🔴 High Risk' : '🟢 Low Risk'}</p>
          <p>Probability: {(result.churnProbability * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

export default App;