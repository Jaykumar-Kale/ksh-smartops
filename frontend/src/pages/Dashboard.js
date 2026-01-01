import { useEffect, useState } from "react";
import api from "../services/api";

import KPICard from "../components/KPICard";
import WarehouseChart from "../components/WarehouseChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import ApprovalStatusChart from "../components/ApprovalStatusChart";

import "./Dashboard.css";

function Dashboard() {
  const [warehouseData, setWarehouseData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [year, setYear] = useState("2025");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [year]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [warehouseRes, trendRes, approvalRes] = await Promise.all([
        api.get("/analytics/warehouse"),
        api.get(`/analytics/monthly-trend?year=${year}`),
        api.get("/analytics/approval-status"),
      ]);

      setWarehouseData(warehouseRes.data?.data || []);
      setMonthlyTrend(trendRes.data?.data || []);
      setApprovalData(approvalRes.data?.data || []);
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOTHours = warehouseData.reduce(
    (sum, w) => sum + (w.totalOTHours || 0),
    0
  );

  const totalOTAmount = warehouseData.reduce(
    (sum, w) => sum + (w.totalOTAmount || 0),
    0
  );

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Operational Analytics</h2>
          <p>Warehouse overtime performance overview</p>
        </div>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="year-select"
        >
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <KPICard title="Total OT Hours" value={totalOTHours.toFixed(2)} />
        <KPICard
          title="Total OT Cost (₹)"
          value={totalOTAmount.toFixed(2)}
        />
        <KPICard title="Warehouses" value={warehouseData.length} />
      </div>

      {/* CHARTS */}
      <div className="chart-grid">
        <div className="chart-box">
          <h5>OT Hours by Warehouse</h5>
          <WarehouseChart data={warehouseData} />
        </div>

        <div className="chart-box">
          <h5>OT Approval Status</h5>
          <ApprovalStatusChart data={approvalData} />
        </div>

        <div className="chart-box full-width">
          <h5>Monthly OT Trend</h5>
          <MonthlyTrendChart data={monthlyTrend} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
