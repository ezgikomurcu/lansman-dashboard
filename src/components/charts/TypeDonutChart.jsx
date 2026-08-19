import { Doughnut } from 'react-chartjs-2';
import { getColors } from '../../chartColors';
import { donutOptions, donutCenterTextPlugin } from '../../chartOptions';

export default function TypeDonutChart({ data, periodLabel }) {
  const colors = getColors();
  const counts = { Kampanya: 0, Postpaid: 0, Servis: 0 };
  data.forEach((r) => { if (counts[r.tip] !== undefined) counts[r.tip]++; });

  const sliceColors = [colors.primary, colors.secondary, colors.amber];
  const total = data.length;

  const chartData = {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: sliceColors,
      borderColor: 'transparent',
      hoverOffset: 6
    }]
  };

  const options = donutOptions({ total, color: colors.ink, subColor: colors.mutedInk });
  const summary = `Talep tipi dağılımı, toplam ${total}: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Talep Tipi Dağılımı</h3><span className="tag">{periodLabel || 'Tüm talepler'}</span></div>
      <div className="donut-row" role="img" aria-label={summary}>
        <div className="donut-canvas-wrap">
          <Doughnut data={chartData} options={options} plugins={[donutCenterTextPlugin]} />
        </div>
        <ul className="donut-legend">
          {Object.entries(counts).map(([label, value], i) => (
            <li key={label}>
              <span className="dot" style={{ background: sliceColors[i] }} />
              <span className="dl-label">{label}</span>
              <span className="dl-value">{value}</span>
              <span className="dl-pct">%{total ? Math.round((value / total) * 100) : 0}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
