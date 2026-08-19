import { useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { getColors } from '../../chartColors';
import { donutOptions, donutCenterTextPlugin } from '../../chartOptions';

export default function TypeDonutChart({ data, periodLabel }) {
  const colors = getColors();
  const chartRef = useRef(null);
  const [hidden, setHidden] = useState(() => new Set());
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

  // Chart.js'in varsayılan legend'ı tıklayınca dilimi grafikten kaldırıp
  // ekleyebiliyordu; kendi listemizle bunu kaybetmiştik — toggleDataVisibility
  // ile aynı davranışı geri veriyoruz.
  const toggleSlice = (i) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.toggleDataVisibility(i);
    chart.update();
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Talep Tipi Dağılımı</h3><span className="tag">{periodLabel || 'Tüm talepler'}</span></div>
      <div className="donut-row" role="img" aria-label={summary}>
        <div className="donut-canvas-wrap">
          <Doughnut ref={chartRef} data={chartData} options={options} plugins={[donutCenterTextPlugin]} />
        </div>
        <ul className="donut-legend">
          {Object.entries(counts).map(([label, value], i) => (
            <li key={label}>
              <button
                type="button"
                className={`donut-legend-item ${hidden.has(i) ? 'hidden' : ''}`}
                onClick={() => toggleSlice(i)}
                aria-pressed={!hidden.has(i)}
                aria-label={`${label}: grafikte ${hidden.has(i) ? 'gizli, göstermek için tıkla' : 'görünür, gizlemek için tıkla'}`}
              >
                <span className="dot" style={{ background: sliceColors[i] }} />
                <span className="dl-label">{label}</span>
                <span className="dl-value">{value}</span>
                <span className="dl-pct">%{total ? Math.round((value / total) * 100) : 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
