import "./KPICard.css";

const KPICard = ({ title, value }) => {
  return (
    <div className="kpi-card">
      <p className="kpi-title">{title}</p>
      <h3 className="kpi-value">{value}</h3>
    </div>
  );
};

export default KPICard;
