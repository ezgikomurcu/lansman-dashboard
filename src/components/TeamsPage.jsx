import TeamVolumeChart from './charts/TeamVolumeChart';
import TeamStatusChart from './charts/TeamStatusChart';

export default function TeamsPage() {
  return (
    <>
      <div className="page-head">
        <div className="subtitle">Takımlara göre talep hacmi ve durum dağılımı</div>
      </div>
      <div className="grid-2">
        <TeamVolumeChart />
        <TeamStatusChart />
      </div>
    </>
  );
}