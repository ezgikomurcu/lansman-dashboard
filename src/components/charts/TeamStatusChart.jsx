import { Bar } from 'react-chartjs-2';
import { DATA, TEAMS, shortTeam } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function TeamStatusChart({ theme }) {
  const colors = getColors(theme);
  const teamStatus = {};
  TEAMS.forEach((t) => (teamStatus[t] = { Açık: 0, 'Onay Bekleniyor': 0, Kapalı: 0 }));
  DATA.forEach((r) => {
    if (teamStatus[r.ekip][r.durum] !== undefined) teamStatus[r.ekip][r.durum]++;
  });

  // Açık → Onay Bekleniyor → Kapalı sıralı bir akıştır: tek hue, açıktan koyuya.
  const data = {
    labels: TEAMS.map(shortTeam),
    datasets: [
      { label: 'Açık', data: TEAMS.map((t) => teamStatus[t]['Açık']), backgroundColor: colors.sequence[0], borderRadius: 5, borderColor: colors.surface, borderWidth: { top: 2, bottom: 0, left: 0, right: 0 } },
      { label: 'Onay Bekleniyor', data: TEAMS.map((t) => teamStatus[t]['Onay Bekleniyor']), backgroundColor: colors.sequence[1], borderRadius: 5, borderColor: colors.surface, borderWidth: 2 },
      { label: 'Kapalı', data: TEAMS.map((t) => teamStatus[t]['Kapalı']), backgroundColor: colors.sequence[2], borderRadius: 5, borderColor: colors.surface, borderWidth: { top: 2, bottom: 0, left: 0, right: 0 } }
    ]
  };

  const options = cartesianOptions({ colors, stacked: true, legend: true });
  const summary = `Takıma göre durum dağılımı: ${TEAMS.map((t) => `${shortTeam(t)} — açık ${teamStatus[t]['Açık']}, onay bekleniyor ${teamStatus[t]['Onay Bekleniyor']}, kapalı ${teamStatus[t]['Kapalı']}`).join('; ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Takıma Göre Durum Dağılımı</h3><span className="tag">Açık · Onay · Kapalı</span></div>
      <div className="chart-wrap tall" role="img" aria-label={summary}><Bar data={data} options={options} /></div>
    </div>
  );
}