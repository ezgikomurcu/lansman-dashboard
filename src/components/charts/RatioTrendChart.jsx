import { Line } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function RatioTrendChart({ data, months = 12, endDate }) {
  const colors = getColors();
  const end = endDate || RANGE_END;
  const monthList = lastNMonths(months, end);
  const ratios = monthList.map((mk) => {
    const inMonth = data.filter((r) => monthKey(r.acilis) === mk);
    const closed = inMonth.filter((r) => r.durum === 'Kapalı').length;
    return inMonth.length ? Math.round((closed / inMonth.length) * 100) : 0;
  });

  const dense = monthList.length > 18;

  const chartData = {
    labels: monthList.map(monthLabel),
    datasets: [{
      label: 'Kapanma Oranı %', data: ratios, borderColor: colors.primary,
      backgroundColor: colors.primary + '20', fill: true, tension: 0.35,
      pointRadius: dense ? 0 : 3, pointHoverRadius: 4, pointBackgroundColor: colors.primary,
      clip: false,
    }]
  };

  const options = { ...cartesianOptions({ colors, percent: true, min: 0, max: 100 }), layout: { padding: { top: 8 } } };
  const summary = `Açılan / kapanan talep oranı, aylık yüzde: ${monthList.map((mk, i) => `${monthLabel(mk)} %${ratios[i]}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Açılan / Kapanan Talep Oranı</h3><span className="tag">Aylık %</span></div>
      <div className="chart-wrap" role="img" aria-label={summary}><Line data={chartData} options={options} /></div>
    </div>
  );
}