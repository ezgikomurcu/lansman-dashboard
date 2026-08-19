import { Doughnut } from 'react-chartjs-2';
import { getColors } from '../../chartColors';
import { donutOptions, donutCenterTextPlugin } from '../../chartOptions';

export default function StatusDonutChart({ data, periodLabel }) {
  const colors = getColors();
  const counts = { Açık: 0, 'Onay Bekleniyor': 0, Kapalı: 0, Reddedildi: 0 };
  data.forEach((r) => { if (counts[r.durum] !== undefined) counts[r.durum]++; });

  // Açık → Onay Bekleniyor → Kapalı sıralı bir akıştır: tek hue, açıktan koyuya.
  // Reddedildi akış dışıdır, nötr gri kullanır.
  const sliceColors = [colors.sequence[0], colors.sequence[1], colors.sequence[2], colors.neutral];
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
  const summary = `Durum dağılımı, toplam ${total}: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Durum Dağılımı</h3><span className="tag">{periodLabel || 'Tüm talepler'}</span></div>
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
