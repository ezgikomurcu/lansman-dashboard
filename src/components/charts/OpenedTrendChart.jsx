import { Line } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';

export default function OpenedTrendChart({ data, theme, months = 12, endDate }) {
  const colors = getColors(theme);
  const end = endDate || RANGE_END;
  const monthList = lastNMonths(months, end);
  const counts = monthList.map((mk) => data.filter((r) => monthKey(r.acilis) === mk).length);

  const chartData = {
    labels: monthList.map(monthLabel),
    datasets: [{
      label: 'Açılan Talep', data: counts, borderColor: colors.amber,
      backgroundColor: colors.amber + '26', fill: true, tension: 0.35,
      pointRadius: 3, pointBackgroundColor: colors.amber
    }]
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Açılan İşler — Yıllık Ay Bazlı</h3><span className="tag">Talep hacmi</span></div>
      <div className="chart-wrap"><Line data={chartData} options={options} /></div>
    </div>
  );
}