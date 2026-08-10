import { Line } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';

export default function OpenedTrendChart({ data }) {
  const months = lastNMonths(12, RANGE_END);
  const counts = months.map((mk) => data.filter((r) => monthKey(r.acilis) === mk).length);

  const chartData = {
    labels: months.map(monthLabel),
    datasets: [{
      label: 'Açılan Talep', data: counts, borderColor: '#FFB020',
      backgroundColor: 'rgba(255,176,32,0.15)', fill: true, tension: 0.35,
      pointRadius: 3, pointBackgroundColor: '#FFB020'
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