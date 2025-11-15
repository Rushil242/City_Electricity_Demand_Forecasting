# BESCOM Grid Control Center

A professional electricity demand forecasting system combining machine learning models with a modern web interface for grid operators and planners.

## System Architecture

This project consists of two main components:

1. **Backend (Flask)**: Python-based ML server with XGBoost, LSTM, and Hybrid Fusion models
2. **Frontend (React)**: Modern dashboard for visualization and analysis

## Quick Start

### Backend Setup

```bash
cd backend_ml
pip install -r requirements.txt
python app.py
```

The Flask API will run on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React app will run on `http://localhost:5173`

## Features

### Dashboard
- Real-time 24-hour electricity demand forecast
- Model performance metrics (MAPE)
- Critical load alerts
- Interactive time-series visualizations

### Historical Analysis
- Custom date range analysis (2021 data)
- Historical power consumption trends
- Multi-metric visualization (power, voltage, frequency)
- Data export functionality

### Model Performance Report
- Comparative analysis of three models
- Visual prediction accuracy charts
- Technical specifications
- Executive-level insights

## Machine Learning Models

The system uses three models:

1. **XGBoost** (MAPE: 40.55%)
   - Gradient boosting with time-series features
   - Lag and rolling window features

2. **LSTM** (MAPE: 49.33%)
   - Deep learning with 72-hour lookback
   - Captures temporal patterns

3. **Hybrid Fusion** (MAPE: 30.38%)
   - Meta-learning ensemble
   - Best of both approaches

## Technology Stack

### Backend
- Python 3.12
- Flask
- TensorFlow/Keras
- XGBoost
- pandas, numpy
- scikit-learn

### Frontend
- React 19
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- React Router

## API Endpoints

- `GET /api/v1/forecast/hourly` - 24-hour forecast
- `GET /api/v1/model/performance` - Model metrics
- `GET /api/v1/alerts/check` - System alerts
- `GET /api/v1/data/historical` - Historical data
- `GET /api/v1/static/plots/:filename` - Static charts

## Project Structure

```
.
├── backend_ml/
│   ├── app.py                  # Flask API server
│   ├── data/                   # Processed datasets
│   ├── *.joblib                # Trained models
│   ├── *.keras                 # LSTM models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Route pages
│   │   ├── layouts/            # Layout components
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Data

The system uses electricity consumption data from Bangalore (BESCOM) covering April-December 2021, including:
- Phase 2 & 3 power, voltage, current
- Frequency and power factor measurements
- Hourly granularity

## Development

Both backend and frontend include hot-reload for development:

```bash
# Terminal 1 - Backend
cd backend_ml && python app.py

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Production Deployment

Build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` and can be served statically.
