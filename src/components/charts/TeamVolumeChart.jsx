import { Bar } from 'react-chartjs-2';
import { DATA, TEAMS, shortTeam } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function TeamVolumeChart({ theme }) {
  const colors = getColors(theme);
  const volume = TEAMS.map((t) => DATA.filter((r) => r.ekip === t).length);

  const data = {
    labels: TEAMS.map(shortTeam),
    datasets: [{ label: 'Talep', data: volume, backgroundColor: colors.secondary, borderRadius: 6 }]
  };

  const options = cartesianOptions({ colors });
  const summary = `Takım bazlı toplam talep: ${TEAMS.map((t, i) => `${shortTeam(t)} ${volume[i]}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Takım Bazlı Toplam Talep</h3><span className="tag">Hacim</span></div>
      <div className="chart-wrap tall" role="img" aria-label={summary}><Bar data={data} options={options} /></div>
    </div>
  );
}