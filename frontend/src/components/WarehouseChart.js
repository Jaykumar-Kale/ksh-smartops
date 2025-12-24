import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function WarehouseChart({ data }) {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
      <h3>OT Hours by Warehouse</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="warehouseName" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalOTHours" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WarehouseChart;
