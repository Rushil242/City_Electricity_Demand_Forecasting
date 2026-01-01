import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';

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
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);

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

  // Handle search
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading historical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
        <p className="text-red-800"><strong>Error:</strong> {error}</p>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Historical Data</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-3xl font-bold text-gray-900">{data.length}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-4">
          <p className="text-sm text-gray-600">Filtered Records</p>
          <p className="text-3xl font-bold text-gray-900">{filteredData.length}</p>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-4">
          <p className="text-sm text-gray-600">Current Page</p>
          <p className="text-3xl font-bold text-gray-900">{currentPage}</p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-600 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Pages</p>
          <p className="text-3xl font-bold text-gray-900">{totalPages}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search historical data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.slice(0, 6).map((col) => (
                <th key={col} className="px-4 py-3 text-left font-bold text-gray-900">
                  {col}
                </th>
              ))}
              {columns.length > 6 && (
                <th className="px-4 py-3 text-left font-bold text-gray-900">
                  +{columns.length - 6} more
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((record, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  {columns.slice(0, 6).map((col) => (
                    <td key={col} className="px-4 py-3 text-gray-800">
                      {record[col] !== null && record[col] !== undefined
                        ? String(record[col]).substring(0, 50)
                        : '-'}
                    </td>
                  ))}
                  {columns.length > 6 && (
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      View details
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              return (
                pageNum <= totalPages && (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm text-blue-800">
          Displaying historical electricity demand data for Bangalore. Total records: {data.length}
        </p>
      </div>
    </div>
  );
};

export default HistoricalData;