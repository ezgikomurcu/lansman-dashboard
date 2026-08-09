export default function KpiCard({ icon, iconBg, iconColor, label, value, delta }) {
  return (
    <div className="kpi-card">
      <div className="k-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="k-label">{label}</div>
      <div className="k-value">{value}</div>
      <div className="k-delta up">{delta}</div>
    </div>
  );
}