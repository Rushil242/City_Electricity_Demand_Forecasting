import { useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function HistoricalAnalysis() {
  const [historicalData, setHistoricalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('2021-06-01')
  const [endDate, setEndDate] = useState('2021-08-17')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/v1/data/historical?start=${startDate}&end=${endDate}`
      )
      const data = await response.json()
      setHistoricalData(data)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching historical data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = historicalData
    .filter((_, idx) => idx % 24 === 0)
    .map(item => ({
      date: item._time ? format(parseISO(item._time), 'MMM dd') : '',
      power: item.Phase3_power,
      voltage: item.Phase3_voltage,
      frequency: item.Phase3_frequency,
    }))

  const paginatedData = historicalData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(historicalData.length / itemsPerPage)

  return (
    <div className="min-h-screen">
      <Header title="Historical Analysis" />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Analysis Controls
            </CardTitle>
            <CardDescription>
              Select date range to analyze historical grid performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2021-04-01"
                  max="2021-12-31"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2021-04-01"
                  max="2021-12-31"
                />
              </div>
              <Button onClick={runAnalysis} disabled={loading} className="px-8">
                {loading ? 'Loading...' : 'Run Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {historicalData.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Historical Power Consumption (Phase 3)</CardTitle>
                <CardDescription>
                  Daily aggregated data showing power trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      yAxisId="left"
                      label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      yAxisId="right"
                      orientation="right"
                      label={{ value: 'Voltage (V)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="power"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Power (MW)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="voltage"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Voltage (V)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Raw Data Table</CardTitle>
                    <CardDescription>
                      Detailed hourly measurements ({historicalData.length} records)
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">Power (MW)</TableHead>
                      <TableHead className="text-right">Voltage (V)</TableHead>
                      <TableHead className="text-right">Current (A)</TableHead>
                      <TableHead className="text-right">Frequency (Hz)</TableHead>
                      <TableHead className="text-right">Power Factor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">
                          {row._time ? format(parseISO(row._time), 'yyyy-MM-dd HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {row.Phase3_power?.toFixed(2) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.Phase3_voltage?.toFixed(1) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.Phase2_current?.toFixed(2) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.Phase3_frequency?.toFixed(2) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.Phase3_pf?.toFixed(3) || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!loading && historicalData.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a date range and click "Run Analysis" to view historical data</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
