import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, AreaChart, BookCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/historical', label: 'Historical Analysis', icon: AreaChart },
  { to: '/model-report', label: 'Model Report', icon: BookCheck },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold">BESCOM</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Grid Control Center</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">System Status</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}
