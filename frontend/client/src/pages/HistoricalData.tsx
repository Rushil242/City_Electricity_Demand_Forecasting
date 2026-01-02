import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader, TrendingUp, Calendar, Filter } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Props {
  apiBaseUrl: string;
}

interface HistoricalRecord {
  _time?: string;
  [key: string]: any;
}

const HistoricalData: React.FC<Props> = ({ apiBaseUrl }) => {
  const [data, setData] = useState<HistoricalRecord[]>([]);
  const [filteredData, setFilteredData] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Charting State
  const [selectedMetric, setSelectedMetric] = useState('Phase3_power');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetching a fixed range for demo purposes
        const response = await fetch(`${apiBaseUrl}/data/historical?start=2021-08-01&end=2021-08-17`);
        if (!response.ok) throw new Error('Failed to fetch historical data');
        
        const jsonData = await response.json();
        setData(jsonData);
        setFilteredData(jsonData);
        console.log(`✓ Historical data loaded: ${jsonData.length} records`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load historical data';
        setError(errorMsg);
        console.error('[HistoricalData] Error:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [apiBaseUrl]);

  // Handle Search Filtering
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter((record) => {
        const values = Object.values(record).map((v) => String(v).toLowerCase());
        return values.some((v) => v.includes(searchTerm.toLowerCase()));
      });
      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData(data);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get available columns for the metric selector (excluding non-numeric/time)
  const numericColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => 
      key !== '_time' && 
      key !== 'index' && 
      typeof data[0][key] === 'number'
    );
  }, [data]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading historical datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded shadow-sm">
          <h3 className="text-red-800 font-bold mb-2">Failed to load data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Historical Data Analysis</h2>
           <p className="text-gray-500 mt-1">Review past load patterns and system performance.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
            <Calendar size={14} />
            <span>Range: Aug 01 - Aug 17, 2021</span>
        </div>
      </div>

      {/* --- NEW SECTION: TREND CHART --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="text-blue-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Trend Analysis</h3>
            </div>
            
            {/* Metric Selector Dropdown */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Metric:</span>
                <select 
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                >
                    {numericColumns.map(col => (
                        <option key={col} value={col}>{col.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Recharts Graph */}
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data} // Use full data for the chart, not filtered/paginated
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="_time" 
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                        stroke="#9ca3af"
                        fontSize={12}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Records</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtered View</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Page</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{currentPage} <span className="text-sm text-gray-400 font-normal">/ {totalPages}</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dataset Size</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{(JSON.stringify(data).length / 1024).toFixed(1)} KB</p>
        </div>
      </div>

      {/* Search and Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search value or timestamp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>
            
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={10}>10 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                </select>
            </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                {columns.slice(0, 7).map((col) => (
                    <th key={col} className="px-6 py-4 whitespace-nowrap">
                    {col.replace(/_/g, ' ')}
                    </th>
                ))}
                {columns.length > 7 && (
                    <th className="px-6 py-4 text-right">Action</th>
                )}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {paginatedData.length > 0 ? (
                paginatedData.map((record, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    {columns.slice(0, 7).map((col) => (
                        <td key={col} className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono text-xs">
                        {record[col] !== null && record[col] !== undefined
                            ? String(record[col]).substring(0, 40)
                            : '-'}
                        </td>
                    ))}
                    {columns.length > 7 && (
                        <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Details</button>
                        </td>
                    )}
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                            <Search size={24} className="text-gray-300" />
                            <p>No records found matching your search</p>
                        </div>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, filteredData.length)}</span> of{' '}
                    <span className="font-medium">{filteredData.length}</span> results
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                    Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                    Next
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalData;