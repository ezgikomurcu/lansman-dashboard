// Ortak eksen/legend yapılandırması — her grafiğin kendi scales bloğunu
// elle tekrar tanımlamaması için. Tek y-ekseni kuralı burada da korunur:
// tüm grafikler tek bir value-axis kullanır, ikinci ölçek eklenmez.
export function cartesianOptions({ colors, horizontal = false, stacked = false, percent = false, min, max, legend = false } = {}) {
  const valueAxis = {
    grid: { color: colors.grid },
    ticks: percent ? { callback: (v) => v + '%' } : { precision: 0 },
    stacked
  };
  if (min !== undefined) valueAxis.min = min;
  if (max !== undefined) valueAxis.max = max;
  if (min === undefined) valueAxis.beginAtZero = true;

  // Uzun aralıklarda (ör. "Tüm zamanlar") onlarca ay etiketi üst üste binmesin diye
  // en fazla ~12 etiket gösterilir, kalanlar otomatik atlanır (döndürme yok).
  const categoryAxis = {
    grid: { display: false }, stacked,
    ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 0, minRotation: 0 }
  };

  return {
    responsive: true,
    // Chart.js varsayılanı (maintainAspectRatio:true) canvas'ı sabit bir en/boy
    // oranında dondurur; chart-wrap'in yüksekliği sabit olduğu için bu, geniş
    // panellerde canvas'ın konteyneri doldurmadan sağda boşluk bırakmasına yol
    // açıyordu. false ile canvas her zaman konteynerin tamamını dolduruyor.
    maintainAspectRatio: false,
    // horizontal:true iken indexAxis 'y' olmadan Chart.js varsayılan dikey
    // barlara düşüyor — uzun kategori etiketleri o zaman x ekseninde
    // sıkışıp döndürülüp birbirine giriyordu.
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: legend
        ? { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 14 } }
        : { display: false }
    },
    scales: horizontal
      ? { x: valueAxis, y: categoryAxis }
      : { x: categoryAxis, y: valueAxis }
  };
}

// Donut'un ortasındaki toplam sayıyı çizen Chart.js eklentisi. Legend Chart.js'in
// varsayılanı yerine bileşenin kendi listesiyle (sayı + yüzde) çiziliyor,
// bu yüzden burada legend kapatılıyor.
export const donutCenterTextPlugin = {
  id: 'centerText',
  beforeDraw(chart, _args, opts) {
    if (!opts || opts.total === undefined) return;
    const { ctx, chartArea } = chart;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "800 24px 'Manrope', sans-serif";
    ctx.fillStyle = opts.color || '#000';
    ctx.fillText(String(opts.total), cx, cy - 9);
    ctx.font = "700 10px 'Manrope', sans-serif";
    ctx.fillStyle = opts.subColor || '#888';
    ctx.fillText(opts.label || 'toplam', cx, cy + 11);
    ctx.restore();
  }
};

export function donutOptions({ total, color, subColor } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      centerText: { total, color, subColor, label: 'toplam' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed;
            const pct = total ? Math.round((value / total) * 100) : 0;
            return `${ctx.label}: ${value} (%${pct})`;
          }
        }
      }
    },
    cutout: '68%'
  };
}
