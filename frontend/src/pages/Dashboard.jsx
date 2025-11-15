import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function Dashboard() {
  const [forecastData, setForecastData] = useState([])
  const [performance, setPerformance] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [forecastRes, performanceRes, alertsRes] = await Promise.all([
        fetch('/api/v1/forecast/hourly'),
        fetch('/api/v1/model/performance'),
        fetch('/api/v1/alerts/check'),
      ])

      const forecast = await forecastRes.json()
      const perf = await performanceRes.json()
      const alertData = await alertsRes.json()

      setForecastData(forecast)
      setPerformance(perf)
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = forecastData.map(item => ({
    time: format(parseISO(item.timestamp), 'HH:mm'),
    power: item.predicted_power,
  }))

  const peakLoad = forecastData.length > 0
    ? Math.max(...forecastData.map(d => d.predicted_power))
    : 0

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Hybrid Model Accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {performance ? `${(100 - performance.fusion_mape).toFixed(2)}%` : '...'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                MAPE: {performance ? `${performance.fusion_mape.toFixed(2)}%` : '...'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Peak Load Forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {peakLoad.toFixed(1)} MW
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Next 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-slate-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                XGBoost MAPE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-600">
                {performance ? `${performance.xgboost_mape.toFixed(2)}%` : '...'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Base model performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-slate-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                LSTM MAPE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-600">
                {performance ? `${performance.lstm_mape.toFixed(2)}%` : '...'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Neural network model
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>24-Hour Demand Forecast (Phase 3)</CardTitle>
              <CardDescription>
                Predicted power consumption using hybrid fusion model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-muted-foreground">Loading forecast data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="power"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPower)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status & Alerts</CardTitle>
              <CardDescription>Real-time monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <Badge variant="destructive" className="text-xs mb-1">
                          {alert.level.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-slate-700">{alert.message}</p>
                        {alert.timestamp && (
                          <p className="text-xs text-slate-500 mt-1">
                            {format(parseISO(alert.timestamp), 'PPp')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">All Systems Normal</div>
                      <p className="text-sm text-green-700">No critical alerts detected</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-sm font-semibold mb-2">Model Status</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Fusion Model</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Last Update</span>
                    <span className="text-slate-700 font-medium">
                      {performance?.last_trained || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
