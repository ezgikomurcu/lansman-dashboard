import { Line } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';

export default function RatioTrendChart({ data }) {
  const months = lastNMonths(12, RANGE_END);
  const ratios = months.map((mk) => {
    const inMonth = data.filter((r) => monthKey(r.acilis) === mk);
    const closed = inMonth.filter((r) => r.durum === 'Kapalı').length;
    return inMonth.length ? Math.round((closed / inMonth.length) * 100) : 0;
  });

  const chartData = {
    labels: months.map(monthLabel),
    datasets: [{
      label: 'Kapanma Oranı %', data: ratios, borderColor: '#FFD200',
      backgroundColor: 'rgba(255,210,0,0.12)', fill: true, tension: 0.35,
      pointRadius: 3, pointBackgroundColor: '#FFD200'
    }]
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100, ticks: { callback: (v) => v + '%' } }
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Açılan / Kapanan Talep Oranı</h3><span className="tag">Aylık %</span></div>
      <div className="chart-wrap"><Line data={chartData} options={options} /></div>
    </div>
  );
}