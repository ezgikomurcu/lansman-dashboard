import { Line } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function OpenedTrendChart({ data, theme, months = 12, endDate }) {
  const colors = getColors(theme);
  const end = endDate || RANGE_END;
  const monthList = lastNMonths(months, end);
  const counts = monthList.map((mk) => data.filter((r) => monthKey(r.acilis) === mk).length);

  // Çok sayıda ay varken (ör. "Tüm zamanlar") noktalar üst üste binip
  // çizgiyi kirletmesin diye yoğun aralıklarda nokta işaretleri gizlenir.
  const dense = monthList.length > 18;

  const chartData = {
    labels: monthList.map(monthLabel),
    datasets: [{
      label: 'Açılan Talep', data: counts, borderColor: colors.amber,
      backgroundColor: colors.amber + '26', fill: true, tension: 0.35,
      pointRadius: dense ? 0 : 3, pointHoverRadius: 4, pointBackgroundColor: colors.amber
    }]
  };

  const options = cartesianOptions({ colors });
  const summary = `Açılan işler — yıllık ay bazlı: ${monthList.map((mk, i) => `${monthLabel(mk)} ${counts[i]}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Açılan İşler — Yıllık Ay Bazlı</h3><span className="tag">Talep hacmi</span></div>
      <div className="chart-wrap" role="img" aria-label={summary}><Line data={chartData} options={options} /></div>
    </div>
  );
}