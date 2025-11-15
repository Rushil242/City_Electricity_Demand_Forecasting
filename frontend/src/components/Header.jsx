import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function Header({ title }) {
  const [alerts, setAlerts] = useState([])
  const [hasNewAlerts, setHasNewAlerts] = useState(false)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/v1/alerts/check')
      const data = await response.json()
      if (data.alerts && data.alerts.length > 0) {
        const criticalAlerts = data.alerts.filter(a => a.level === 'critical')
        if (criticalAlerts.length > 0) {
          setHasNewAlerts(true)
          setAlerts(criticalAlerts)
        }
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setHasNewAlerts(false)}
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {hasNewAlerts && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          {hasNewAlerts && alerts.length > 0 && (
            <div className="absolute right-0 top-12 w-80 bg-white border shadow-lg rounded-lg p-4 z-50">
              <div className="text-sm font-semibold mb-2">Critical Alerts</div>
              {alerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="text-xs text-slate-600 mb-2">
                  <Badge variant="destructive" className="mb-1">CRITICAL</Badge>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
