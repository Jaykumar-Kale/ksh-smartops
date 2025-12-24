import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function MonthlyTrendChart({ data }) {
  const formattedData = data.map(item => ({
    month: `${item.month}/${item.year}`,
    totalOTHours: item.totalOTHours,
    totalOTAmount: item.totalOTAmount,
  }));

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px',
      }}
    >
      <h3>Monthly OT Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="totalOTHours"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyTrendChart;
