import { useEffect, useState } from 'react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import WarehouseChart from '../components/WarehouseChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import ApprovalStatusChart from '../components/ApprovalStatusChart';

function Dashboard() {
  const [warehouseData, setWarehouseData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [year, setYear] = useState('2025');

  // Fetch all dashboard data
  useEffect(() => {
    fetchWarehouseAnalytics();
    fetchMonthlyTrend(year);
    fetchApprovalStatus();
  }, [year]);

  const fetchWarehouseAnalytics = () => {
    api.get('/analytics/warehouse')
      .then(res => setWarehouseData(res.data.data || []))
      .catch(err => console.error(err));
  };

  const fetchMonthlyTrend = (selectedYear) => {
    api.get(`/analytics/monthly-trend?year=${selectedYear}`)
      .then(res => setMonthlyTrend(res.data.data || []))
      .catch(err => console.error(err));
  };

  const fetchApprovalStatus = () => {
    api.get('/analytics/approval-status')
      .then(res => setApprovalData(res.data.data || []))
      .catch(err => console.error(err));
  };

  const totalOTHours = warehouseData.reduce(
    (sum, w) => sum + (w.totalOTHours || 0),
    0
  );

  const totalOTAmount = warehouseData.reduce(
    (sum, w) => sum + (w.totalOTAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Welcome to KSH SmartOps Analytics</p>
        </div>

        {/* Year Filter */}
        <div className="mt-4 sm:mt-0">
          <label className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Year:</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </label>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Total OT Hours" value={totalOTHours.toFixed(2)} />
        <KPICard title="Total OT Cost (₹)" value={totalOTAmount.toFixed(2)} />
        <KPICard title="Warehouses" value={warehouseData.length} />
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <WarehouseChart data={warehouseData} />
        <MonthlyTrendChart data={monthlyTrend} />
        <ApprovalStatusChart data={approvalData} />
      </div>
    </div>
  );
}

export default Dashboard;
