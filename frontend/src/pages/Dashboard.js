import { useEffect, useState } from 'react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import WarehouseChart from '../components/WarehouseChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';

function Dashboard() {
  const [warehouseData, setWarehouseData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    api.get('/analytics/warehouse')
      .then(res => setWarehouseData(res.data.data))
      .catch(err => console.error(err));

    api.get('/analytics/monthly-trend?year=2025')
      .then(res => setMonthlyTrend(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const totalOTHours = warehouseData.reduce(
    (sum, w) => sum + w.totalOTHours,
    0
  );

  const totalOTAmount = warehouseData.reduce(
    (sum, w) => sum + w.totalOTAmount,
    0
  );

  return (
    <div style={{ padding: '32px' }}>
      <h1>KSH SmartOps Dashboard</h1>

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
    </div>
  );
}

export default Dashboard;
