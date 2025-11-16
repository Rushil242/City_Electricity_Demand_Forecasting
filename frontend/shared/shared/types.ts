// API Response Types for BESCOM Electricity Demand Prediction

export interface ForecastDataPoint {
  timestamp: string;
  predicted_power: number;
}

export interface Alert {
  timestamp: string;
  level: 'critical' | 'warning' | 'info' | 'error';
  message: string;
}

export interface AlertsResponse {
  alerts: Alert[];
}

export interface ModelPerformance {
  xgboost_mape: number;
  lstm_mape: number;
  fusion_mape: number;
  mape_unit: string;
  primary_model: string;
  last_trained: string;
}

export interface HistoricalDataPoint {
  _time: string;
  Phase2_current?: number;
  Phase2_voltage?: number;
  Phase3_frequency?: number;
  Phase3_pf?: number;
  Phase3_power?: number;
  Phase3_voltage?: number;
  [key: string]: string | number | null | undefined;
}
