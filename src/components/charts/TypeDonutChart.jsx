import { Doughnut } from 'react-chartjs-2';
import { getColors } from '../../chartColors';

export default function TypeDonutChart({ data, theme }) {
  const colors = getColors(theme);
  const counts = { Kampanya: 0, Postpaid: 0, Servis: 0 };
  data.forEach((r) => { if (counts[r.tip] !== undefined) counts[r.tip]++; });

  const chartData = {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [colors.primary, colors.secondary, colors.amber],
      borderColor: 'transparent',
      hoverOffset: 6
    }]
  };

  const options = {
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 14 } }
    },
    cutout: '68%'
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Talep Tipi Dağılımı</h3><span className="tag">Tüm talepler</span></div>
      <div className="chart-wrap"><Doughnut data={chartData} options={options} /></div>
    </div>
  );
}