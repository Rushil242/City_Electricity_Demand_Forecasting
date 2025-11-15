# BESCOM Grid Control Center - Frontend

A professional React dashboard for electricity demand forecasting and grid management.

## Technology Stack

- **Framework**: React 19 with Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend Flask server running on port 8080

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Production Build

```bash
npm run build
npm run preview
```

## Features

### Dashboard
- Real-time 24-hour demand forecast
- Model performance KPIs
- Critical alerts monitoring
- Interactive charts

### Historical Analysis
- Custom date range selection
- Historical power consumption visualization
- Detailed data table with pagination
- Dual-axis charts (power and voltage)

### Model Report
- Performance comparison between models
- Visual prediction accuracy charts
- Technical specifications
- Executive summary

## API Integration

The frontend consumes the following backend endpoints:

- `GET /api/v1/forecast/hourly` - 24-hour forecast
- `GET /api/v1/model/performance` - Model metrics
- `GET /api/v1/alerts/check` - System alerts
- `GET /api/v1/data/historical` - Historical data
- `GET /api/v1/static/plots/:filename` - Static charts

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── Header.jsx    # Top navigation bar
│   └── Sidebar.jsx   # Side navigation
├── layouts/
│   └── MainLayout.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── HistoricalAnalysis.jsx
│   └── ModelReport.jsx
├── lib/
│   └── utils.js      # Utility functions
└── App.jsx           # Main router
```
