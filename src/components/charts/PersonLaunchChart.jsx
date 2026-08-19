import { Bar } from 'react-chartjs-2';
import { PEOPLE } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function PersonLaunchChart({ data }) {
  const colors = getColors();
  const launches = data.filter((r) => r.lansman);
  const counts = {};
  PEOPLE.forEach((p) => (counts[p] = 0));
  launches.forEach((r) => counts[r.acanKisi]++);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const chartData = {
    labels: sorted.map((p) => p[0]),
    datasets: [{ label: 'Lansman', data: sorted.map((p) => p[1]), backgroundColor: colors.secondary, borderRadius: 6 }]
  };

  const options = cartesianOptions({ colors, horizontal: true });
  const summary = `Kişi bazlı lansman adedi: ${sorted.map(([k, v]) => `${k} ${v}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Kişi Bazlı Lansman Adedi</h3><span className="tag">Top 8</span></div>
      <div className="chart-wrap tall" role="img" aria-label={summary}><Bar data={chartData} options={options} /></div>
    </div>
  );
}