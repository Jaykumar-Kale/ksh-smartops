import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./Charts.css";

const MonthlyTrendChart = ({ data }) => {
  const formatted = data.map(d => ({
    label: `${d.month}/${d.year}`,
    hours: d.totalOTHours,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="#9BBB59"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTrendChart;
