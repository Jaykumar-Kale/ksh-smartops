import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#4CAF50', '#FFC107', '#F44336']; // approved, pending, rejected

function ApprovalStatusChart({ data }) {
  return (
    <div
      style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px',
      }}
    >
      <h3>OT Approval Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="operationCount"
            nameKey="approvalStatus"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ApprovalStatusChart;
