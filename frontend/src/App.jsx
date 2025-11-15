import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { HistoricalAnalysis } from './pages/HistoricalAnalysis'
import { ModelReport } from './pages/ModelReport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="historical" element={<HistoricalAnalysis />} />
          <Route path="model-report" element={<ModelReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
