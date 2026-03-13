import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
import pickle
import warnings

# Keeps the terminal clean from date warnings
warnings.filterwarnings('ignore')

def train_models(dataset_path):
    print("⏳ Step 1: Loading dataset...")
    df = pd.read_csv(dataset_path, encoding='unicode_escape')
    
    # Fix for those weird 'ï»¿' characters in the columns
    df.columns = df.columns.str.replace('ï»¿', '').str.strip()
    
    print("🧹 Step 2: Cleaning data...")
    df.dropna(subset=['CustomerID'], inplace=True)
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['TotalAmount'] = df['Quantity'] * df['UnitPrice']
    
    print("🧮 Step 3: Calculating RFM Scores...")
    snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
        'InvoiceNo': 'count',
        'TotalAmount': 'sum'
    }).rename(columns={'InvoiceDate': 'Recency', 'InvoiceNo': 'Frequency', 'TotalAmount': 'Monetary'})
    
    print("⚖️ Step 4: Scaling and Clustering...")
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm)
    
    # K-Means for Customer Segmentation
    kmeans = KMeans(n_clusters=4, random_state=42)
    rfm['Cluster'] = kmeans.fit_predict(rfm_scaled)
    
    print("🌲 Step 5: Training Churn Prediction Model...")
    # Label Churn: 1 if inactive > 90 days, 0 otherwise
    rfm['Churn'] = rfm['Recency'].apply(lambda x: 1 if x > 90 else 0)
    
    # Handle data imbalance with SMOTE
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(rfm[['Recency', 'Frequency', 'Monetary']], rfm['Churn'])
    
    # Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_resampled, y_resampled)
    
    print("💾 Step 6: Saving models to the models/ folder...")
    # Note: Using 'models/' prefix because we created that folder earlier
    # Save the models into the right folder
    pickle.dump(scaler, open('ml-microservice/models/scaler.pkl', 'wb'))
    pickle.dump(kmeans, open('ml-microservice/models/kmeans_model.pkl', 'wb'))
    pickle.dump(rf_model, open('ml-microservice/models/rf_model.pkl', 'wb'))
    
    print("\n✅ SUCCESS! Models are ready in ml-microservice/models/")

if __name__ == "__main__":
    train_models('ml-microservice/Online Retail.csv')