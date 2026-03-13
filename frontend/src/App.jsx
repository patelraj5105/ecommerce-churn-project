import { useState } from 'react';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Connecting to your live Render Backend
      const res = await axios.post('https://churn-backend-wtq4.onrender.com/api/predict', formData);
      setResult(res.data);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Backend is starting up (on Free Plan). Please wait 30 seconds and try again!");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1>E-commerce Churn Prediction</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input name="customerId" placeholder="Customer ID" onChange={handleChange} required />
        <input name="recency" type="number" placeholder="Recency (Days since last purchase)" onChange={handleChange} required />
        <input name="frequency" type="number" placeholder="Frequency (Total purchases)" onChange={handleChange} required />
        <input name="monetary" type="number" placeholder="Monetary (Total spent)" onChange={handleChange} required />
        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Analyzing AI Models...' : 'Predict Churn'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
          <h2>Prediction Result:</h2>
          <p><strong>Segmentation (Cluster):</strong> {result.cluster}</p>
          <p><strong>Churn Risk:</strong> {result.churnProbability > 0.5 ? '🔴 High Risk' : '🟢 Low Risk'}</p>
          <p><strong>Churn Probability:</strong> {(result.churnProbability * 100).toFixed(2)}%</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Saved to Database: Yes (MongoDB Atlas)</p>
        </div>
      )}
    </div>
  );
}

export default App;