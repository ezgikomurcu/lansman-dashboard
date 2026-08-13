export default function KpiCard({ label, value, delta }) {
  return (
    <div className="kpi-card">
      <div className="k-label">{label}</div>
      <div className="k-value">{value}</div>
      <div className="k-delta up">{delta}</div>
    </div>
  );
}