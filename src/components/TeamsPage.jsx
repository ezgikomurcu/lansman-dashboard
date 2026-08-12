import TeamVolumeChart from './charts/TeamVolumeChart';
import TeamStatusChart from './charts/TeamStatusChart';

export default function TeamsPage({ theme }) {
  return (
    <>
      <div className="page-head">
        <div className="subtitle">Takımlara göre talep hacmi ve durum dağılımı</div>
      </div>
      <div className="grid-2">
        <TeamVolumeChart theme={theme} />
        <TeamStatusChart theme={theme} />
      </div>
    </>
  );
}