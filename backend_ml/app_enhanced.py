import pandas as pd
import numpy as np
import joblib
import os
import tensorflow as tf
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

print("--- Initializing Enhanced Backend Flask Server ---")

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app)

# --- Configuration ---
TARGET_COLUMN = 'Phase3_power'
N_LOOKBACK = 72
FEATURES_LSTM = [
    'Phase2_current', 'Phase2_voltage', 'Phase3_frequency',
    'Phase3_pf', 'Phase3_power', 'Phase3_voltage'
]
FEATURES_XGB = [
    'Phase2_current', 'Phase2_voltage', 'Phase3_frequency', 'Phase3_pf', 'Phase3_voltage',
    'hour', 'dayofweek', 'month', 'quarter', 'year', 'dayofyear',
    f'{TARGET_COLUMN}_lag_1h', f'{TARGET_COLUMN}_lag_3h', f'{TARGET_COLUMN}_lag_24h',
    f'{TARGET_COLUMN}_roll_avg_3h', f'{TARGET_COLUMN}_roll_avg_6h', f'{TARGET_COLUMN}_roll_avg_24h',
]
CRITICAL_LOAD_THRESHOLD = 500

# --- Step 1: Load Historical Data ---
print("Loading historical data...")
try:
    full_data = pd.read_csv('data/cleaned_bangalore_data.csv', index_col='_time', parse_dates=True)
    print("Historical data loaded successfully.")
except FileNotFoundError:
    print("CRITICAL ERROR: 'data/cleaned_bangalore_data.csv' not found.")
    full_data = None
except Exception as e:
    print(f"CRITICAL ERROR loading data: {e}")
    full_data = None

# --- Step 2: Load Models and Scalers ---
print("Loading all models and scalers into memory...")
try:
    model_xgb = joblib.load('xgboost_model_final.joblib')
    model_lstm = tf.keras.models.load_model('lstm_model_1step.keras')
    model_fusion = joblib.load('fusion_model.joblib')

    scaler_x = joblib.load('lstm_x_scaler_1step.joblib')
    scaler_y = joblib.load('lstm_y_scaler_1step.joblib')
    print("All models loaded successfully.")
except FileNotFoundError as e:
    print(f"ERROR: Missing a model file. {e}")
    model_xgb = model_lstm = model_fusion = scaler_x = scaler_y = None
except Exception as e:
    print(f"An error occurred during model loading: {e}")
    model_xgb = model_lstm = model_fusion = scaler_x = scaler_y = None

# --- Helper Functions ---
def create_features_xgb(df, target_col):
    df_copy = df.copy()
    df_copy['hour'] = df_copy.index.hour
    df_copy['dayofweek'] = df_copy.index.dayofweek
    df_copy['month'] = df_copy.index.month
    df_copy['quarter'] = df_copy.index.quarter
    df_copy['year'] = df_copy.index.year
    df_copy['dayofyear'] = df_copy.index.dayofyear
    df_copy[f'{target_col}_lag_1h'] = df_copy[target_col].shift(1)
    df_copy[f'{target_col}_lag_3h'] = df_copy[target_col].shift(3)
    df_copy[f'{target_col}_lag_24h'] = df_copy[target_col].shift(24)
    df_copy[f'{target_col}_roll_avg_3h'] = df_copy[target_col].rolling(window=3).mean().shift(1)
    df_copy[f'{target_col}_roll_avg_6h'] = df_copy[target_col].rolling(window=6).mean().shift(1)
    df_copy[f'{target_col}_roll_avg_24h'] = df_copy[target_col].rolling(window=24).mean().shift(1)
    return df_copy

def create_sequences_lstm(x_data, n_lookback):
    X = []
    for i in range(len(x_data) - n_lookback + 1):
        X.append(x_data[i : (i + n_lookback)])
    return np.array(X)

# --- API Endpoints ---
@app.route('/api/v1/forecast/hourly', methods=['GET'])
def get_hourly_forecast():
    """Runs the full recursive forecast for the next 24 hours."""
    print("Received request for 24-hour forecast...")
    if full_data is None or model_xgb is None or model_lstm is None or model_fusion is None:
        return jsonify({"error": "Data or model files missing. Cannot generate forecast."}), 500
    try:
        base_data = full_data.iloc[-96:].copy()
        forecast_results = []
        for _ in range(24):
            current_data_xgb = create_features_xgb(base_data, TARGET_COLUMN).iloc[-1:]
            current_data_lstm_raw = base_data[FEATURES_LSTM].iloc[-N_LOOKBACK:]
            X_xgb = current_data_xgb[FEATURES_XGB]
            pred_xgb = model_xgb.predict(X_xgb)[0]
            X_lstm_scaled = scaler_x.transform(current_data_lstm_raw)
            X_lstm_seq = np.array([X_lstm_scaled])
            pred_lstm_scaled = model_lstm.predict(X_lstm_seq)
            pred_lstm = scaler_y.inverse_transform(pred_lstm_scaled)[0][0]
            X_meta = pd.DataFrame({'xgb_pred': [pred_xgb], 'lstm_pred': [pred_lstm]})
            pred_fusion = model_fusion.predict(X_meta)[0]
            next_timestamp = base_data.index[-1] + pd.Timedelta(hours=1)
            forecast_results.append({"timestamp": next_timestamp.isoformat(), "predicted_power": float(pred_fusion)})
            new_row = base_data.iloc[-1:].copy()
            new_row.index = [next_timestamp]
            new_row[TARGET_COLUMN] = pred_fusion
            for col in new_row.columns:
                if col != TARGET_COLUMN:
                    new_row[col] = base_data[col].iloc[-1]
            base_data = pd.concat([base_data, new_row])
        print("Forecast generated successfully.")
        return jsonify(forecast_results)
    except Exception as e:
        print(f"Error in forecast: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/alerts/check', methods=['GET'])
def check_alerts():
    """Checks upcoming forecast for critical load alerts."""
    print("Received request for alert check...")
    if full_data is None:
        return jsonify({"alerts": [{"level": "error", "message": "Cannot check alerts, data not loaded."}]})
    forecast_data = [] # Replace with actual forecast in production
    alerts = []
    if not forecast_data:
        alerts.append({
            "timestamp": (pd.Timestamp.now() + pd.Timedelta(hours=4)).isoformat(),
            "level": "critical",
            "message": f"Demo Alert: Predicted load 512.5 MW exceeds {CRITICAL_LOAD_THRESHOLD} MW threshold."
        })
    return jsonify({"alerts": alerts})

@app.route('/api/v1/data/historical', methods=['GET'])
def get_historical_data():
    """Serves historical data for charts."""
    print("Received request for historical data...")
    if full_data is None:
        return jsonify({"error": "Historical data not loaded on server."}), 500
    start_date = request.args.get('start', full_data.index.min().isoformat())
    end_date = request.args.get('end', full_data.index.max().isoformat())
    try:
        data_subset = full_data.loc[start_date:end_date]
        if len(data_subset) > 1000:
            data_subset = data_subset.resample('D').mean()
        data_subset = data_subset.reset_index()
        data_subset = data_subset.replace({np.nan: None})
        return jsonify(data_subset.to_dict('records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/v1/model/performance', methods=['GET'])
def get_model_performance():
    """Final MAPE scores for frontend KPI cards."""
    print("Received request for model performance...")
    performance_metrics = {
        "xgboost_mape": 30.5542,
        "lstm_mape": 39.3340,
        "fusion_mape": 20.3778,
        "mape_unit": "%",
        "primary_model": "Hybrid Fusion",
        "last_trained": "2025-11-15"
    }
    return jsonify(performance_metrics)

@app.route('/api/v1/static/plots/<path:filename>', methods=['GET'])
def get_plot(filename):
    """Serves static plot images from repository."""
    print(f"Received request for static plot: {filename}")
    try:
        return send_from_directory(app.root_path, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

# --- Enhanced Endpoints for Frontend Features ---
@app.route('/api/v1/forecast/models', methods=['GET'])
def get_all_models():
    """List all loaded model names and types for UI selections."""
    model_status = {
        "xgboost": "Loaded" if model_xgb else "Not loaded",
        "lstm": "Loaded" if model_lstm else "Not loaded",
        "fusion": "Loaded" if model_fusion else "Not loaded"
    }
    return jsonify(model_status)

@app.route('/api/v1/forecast/metrics', methods=['GET'])
def get_forecast_metrics():
    """More metrics for analytics panel (hardcoded or dynamically computed)."""
    metrics = {
        "XGBoost": {
            "MAPE": 30.5542, "MAE": 68.5, "RMSE": 85.3, "Accuracy": 69.5, "Recommended": False
        },
        "LSTM": {
            "MAPE": 39.3340, "MAE": 92.1, "RMSE": 115.2, "Accuracy": 60.7, "Recommended": False
        },
        "Hybrid Fusion": {
            "MAPE": 20.3778, "MAE": 45.2, "RMSE": 62.1, "Accuracy": 79.6, "Recommended": True
        }
    }
    return jsonify(metrics)

@app.route('/api/v1/analytics/hourly-pattern', methods=['GET'])
def get_hourly_pattern():
    """Simulate hourly demand pattern for chart."""
    pattern = []
    for h in range(24):
        pattern.append({
            "hour": h,
            "avg_demand": float(2450 + np.sin(h/24 * 2 * np.pi) * 500),
            "forecast_accuracy": float(0.75 + (np.sin(h/24 * 2 * np.pi) * 0.15))
        })
    return jsonify(pattern)

@app.route('/api/v1/analytics/weekly-trend', methods=['GET'])
def get_weekly_trend():
    """Simulate weekly demand for chart."""
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    trend = []
    for i, day in enumerate(days_of_week):
        base = 2450 if i < 5 else 2100
        trend.append({
            "day": day,
            "avg_demand": float(base + np.random.uniform(-100, 100)),
            "peak_demand": float(base*1.3 + np.random.uniform(-100, 100)),
        })
    return jsonify(trend)

@app.route('/api/v1/analytics/performance-trend', methods=['GET'])
def get_performance_trend():
    """Simulate model performance trend for comparison page."""
    days = int(request.args.get('days', 7))
    output = []
    for d in range(days):
        output.append({
           "date": (pd.Timestamp.now() - pd.Timedelta(days=days-d)).strftime('%Y-%m-%d'),
           "Hybrid Fusion": 20.3778 + np.random.uniform(-1, 1),
           "XGBoost": 30.5542 + np.random.uniform(-2, 2),
           "LSTM": 39.3340 + np.random.uniform(-3, 3)
        })
    return jsonify(output)

# --- Main execution ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
