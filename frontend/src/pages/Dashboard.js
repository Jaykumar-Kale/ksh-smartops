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
    <div style={{ padding: '32px' }}>
      <h1>KSH SmartOps Dashboard</h1>

      {/* Year Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Year:
          <select
            style={{ marginLeft: '10px' }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </label>
      </div>

      {/* KPI Section */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '20px',
          marginBottom: '30px',
        }}
      >
        <KPICard title="Total OT Hours" value={totalOTHours.toFixed(2)} />
        <KPICard title="Total OT Cost (₹)" value={totalOTAmount.toFixed(2)} />
        <KPICard title="Warehouses" value={warehouseData.length} />
      </div>

      {/* Charts */}
      <WarehouseChart data={warehouseData} />
      <MonthlyTrendChart data={monthlyTrend} />
      <ApprovalStatusChart data={approvalData} />
    </div>
  );
}

export default Dashboard;
