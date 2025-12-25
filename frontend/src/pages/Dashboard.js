import { useEffect, useState } from 'react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import WarehouseChart from '../components/WarehouseChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import ApprovalStatusChart from '../components/ApprovalStatusChart';
import './Dashboard.css';

function Dashboard() {
  const [warehouseData, setWarehouseData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [approvalData, setApprovalData] = useState([]);

  useEffect(() => {
    api.get('/analytics/warehouse').then(r => setWarehouseData(r.data.data));
    api.get('/analytics/monthly-trend?year=2025').then(r => setMonthlyTrend(r.data.data));
    api.get('/analytics/approval-status').then(r => setApprovalData(r.data.data));
  }, []);

  const totalHours = warehouseData.reduce((s, x) => s + x.totalOTHours, 0);
  const totalAmount = warehouseData.reduce((s, x) => s + x.totalOTAmount, 0);

  return (
    <>
      <h2 className="page-title">Operational Analytics Overview</h2>

      <div className="kpi-row">
        <KPICard title="Total OT Hours" value={totalHours.toFixed(2)} />
        <KPICard title="Total OT Cost (₹)" value={totalAmount.toFixed(2)} />
        <KPICard title="Warehouses" value={warehouseData.length} />
      </div>

      <div className="chart-grid">
        <WarehouseChart data={warehouseData} />
        <ApprovalStatusChart data={approvalData} />
        <MonthlyTrendChart data={monthlyTrend} />
      </div>
    </>
  );
}

export default Dashboard;
