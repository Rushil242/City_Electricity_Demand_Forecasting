import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  )
}
