import { useState } from 'react';
import { DATA, RANGE_END, TEAMS, PEOPLE, monthKey, monthLabel, fmtDate, shortTeam } from '../data/dummyData';
import CompareChart from './charts/CompareChart';

function pct(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function CompareCard({ label, cur, prev, sub }) {
  const p = pct(cur, prev);
  const up = p >= 0;
  return (
    <div className="compare-card">
      <div className="c-label">{label}</div>
      <div className="c-row">
        <span className="c-value">{cur}</span>
        <span className="c-change" style={{ color: up ? 'var(--teal)' : 'var(--coral)' }}>
          {up ? '▲' : '▼'} {Math.abs(p)}%
        </span>
      </div>
      <div className="c-sub">{sub}: {prev}</div>
    </div>
  );
}

function buildSummaryBullets({ openedThis, openedLast, launchesThis, launchesLast, closedThis, closedLast, monthLabelText }) {
  const bullets = [];
  const openPct = pct(openedThis, openedLast);
  bullets.push(`${monthLabelText} döneminde ${openedThis} talep açıldı (%${Math.abs(openPct)} ${openPct >= 0 ? 'artış' : 'azalış'}).`);
  bullets.push(`${launchesThis} talep lansmana çıktı (önceki ay: ${launchesLast}).`);
  bullets.push(`${closedThis} talep kapatıldı (önceki ay: ${closedLast}).`);

  const teamCounts = {};
  DATA.forEach((r) => { teamCounts[r.ekip] = (teamCounts[r.ekip] || 0) + 1; });
  const topTeam = Object.entries(teamCounts).sort((a, b) => b[1] - a[1])[0];
  if (topTeam) {
    bullets.push(`En yoğun takım: ${topTeam[0]} (${topTeam[1]} talep, tüm zamanlar).`);
  }

  const launched = DATA.filter((r) => r.lansman);
  const personCounts = {};
  launched.forEach((r) => { personCounts[r.acanKisi] = (personCounts[r.acanKisi] || 0) + 1; });
  const topPerson = Object.entries(personCounts).sort((a, b) => b[1] - a[1])[0];
  if (topPerson) bullets.push(`En çok lansman yapan kişi: ${topPerson[0]} (${topPerson[1]} lansman).`);

  if (launched.length) {
    const avg = Math.round(launched.reduce((s, r) => s + (r.lansman - r.acilis) / 86400000, 0) / launched.length);
    bullets.push(`Ortalama tamamlanma süresi: ${avg} gün.`);
  }

  const active = DATA.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
  const stepCounts = {};
  active.forEach((r) => { const k = r.surecAdimi || 'Belirsiz'; stepCounts[k] = (stepCounts[k] || 0) + 1; });
  const topStep = Object.entries(stepCounts).sort((a, b) => b[1] - a[1])[0];
  if (topStep) bullets.push(`Şu an en çok birikme: "${topStep[0]}" aşaması (${topStep[1]} talep).`);

  const slaBreach = active.filter((r) => (RANGE_END - r.acilis) / 86400000 > 10).length;
  bullets.push(slaBreach > 0 ? `SLA süresini aşan (10+ gün) talep: ${slaBreach}.` : `SLA süresini aşan talep yok.`);

  return bullets;
}

// PDF her zaman beyaz kağıt zemininde basılır, uygulamanın vurgu rengiyle
// (pembe) ama kağıt üstünde okunaklı kalacak koyulukta.
const PDF_ACCENT = [196, 24, 90];
const PDF_TINT = [253, 235, 243];

// ---- Font dosyasını (public/fonts'tan) okuyup jsPDF'e tanıtan yardımcı fonksiyon ----
async function loadFont(doc, url, fontName, style) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = window.btoa(binary);
  const fileName = `${fontName}-${style}.ttf`;
  doc.addFileToVFS(fileName, base64);
  doc.addFont(fileName, fontName, style);
}

export default function ReportsPage({ selectedMonth, onMonthChange }) {
  function monthsBetweenKeys(startKey, endKey) {
    const [sy, sm] = startKey.split('-').map(Number);
    const [ey, em] = endKey.split('-').map(Number);
    const result = [];
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
      result.push(`${y}-${String(m).padStart(2, '0')}`);
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return result.reverse();
  }

  const acilisMonths = DATA.map((r) => monthKey(r.acilis)).sort();
  const currentMonth = monthKey(RANGE_END);
  const minMonth = acilisMonths[0] || currentMonth;
  const latestDataMonth = acilisMonths[acilisMonths.length - 1] || currentMonth;
  const maxMonth = latestDataMonth > currentMonth ? latestDataMonth : currentMonth;

  const availableMonths = monthsBetweenKeys(minMonth, maxMonth);

  const [pdfBusy, setPdfBusy] = useState(false);

  const [y, m] = selectedMonth.split('-').map(Number);
  const lastMonthDate = new Date(y, m - 2, 1);
  const lastMonth = monthKey(lastMonthDate);
  const selectedEndDate = new Date(y, m - 1, 1);

  const launchesThis = DATA.filter((r) => r.lansman && monthKey(r.lansman) === selectedMonth).length;
  const launchesLast = DATA.filter((r) => r.lansman && monthKey(r.lansman) === lastMonth).length;
  const openedThis = DATA.filter((r) => monthKey(r.acilis) === selectedMonth).length;
  const openedLast = DATA.filter((r) => monthKey(r.acilis) === lastMonth).length;
  const closedThis = DATA.filter((r) => r.durum === 'Kapalı' && monthKey(r.acilis) === selectedMonth).length;
  const closedLast = DATA.filter((r) => r.durum === 'Kapalı' && monthKey(r.acilis) === lastMonth).length;

  const exportCSV = () => {
    const header = ['TALEP_ID', 'AcilisTarihi', 'ACAN_KISI', 'TAKIM', 'DURUM', 'LANSMAN_TARIHI'];
    const lines = [header.join(';')];
    const scoped = DATA.filter((r) => monthKey(r.acilis) === selectedMonth);
    scoped.forEach((r) => {
      lines.push([r.id, fmtDate(r.acilis), r.acanKisi, r.ekip, r.durum, r.lansman ? fmtDate(r.lansman) : ''].join(';'));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lansman_raporu_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportPDF = async () => {
    setPdfBusy(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const doc = new jsPDF();

      // ---- Türkçe karakter destekli fontu yükle ----
      await loadFont(doc, '/fonts/Roboto-Regular.ttf', 'Roboto', 'normal');
      await loadFont(doc, '/fonts/Roboto-Bold.ttf', 'Roboto', 'bold');

      const pageWidth = doc.internal.pageSize.getWidth();
      const periodText = monthLabel(selectedMonth);

      const BORDO = PDF_ACCENT;
      const ACIK_ZEMIN = PDF_TINT;
      const ANTRASIT = [40, 40, 42];
      const GRI = [125, 125, 128];
      const KENAR = [228, 220, 219];

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...ANTRASIT);
      doc.text('LAUNCHLY', 14, 20);

      doc.setFont('Roboto', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...BORDO);
      doc.text('Lansman Kontrol Merkezi - Aylık Rapor', 14, 27);

      doc.setDrawColor(...BORDO);
      doc.setLineWidth(0.8);
      doc.line(14, 31, pageWidth - 14, 31);

      doc.setFontSize(8.5);
      doc.setTextColor(...GRI);
      doc.text(`Dönem: ${periodText}`, pageWidth - 14, 16, { align: 'right' });
      doc.text(`Oluşturulma: ${fmtDate(new Date())}`, pageWidth - 14, 21, { align: 'right' });

      let cursorY = 41;

      const ratio = openedThis ? Math.round((closedThis / openedThis) * 100) : 0;
      const boxGap = 4;
      const boxWidth = (pageWidth - 28 - 3 * boxGap) / 4;
      const kpis = [
        { label: 'LANSMAN', value: launchesThis, sub: `Önceki ay: ${launchesLast}` },
        { label: 'AÇILAN TALEP', value: openedThis, sub: `Önceki ay: ${openedLast}` },
        { label: 'KAPANAN TALEP', value: closedThis, sub: `Önceki ay: ${closedLast}` },
        { label: 'AÇIK/KAPALI ORANI', value: `%${ratio}`, sub: `${closedThis} / ${openedThis} talep` }
      ];
      kpis.forEach((k, i) => {
        const x = 14 + i * (boxWidth + boxGap);
        doc.setFillColor(...ACIK_ZEMIN);
        doc.setDrawColor(...KENAR);
        doc.setLineWidth(0.3);
        doc.rect(x, cursorY, boxWidth, 24, 'FD');
        doc.setDrawColor(...BORDO);
        doc.setLineWidth(1);
        doc.line(x, cursorY, x + boxWidth, cursorY);

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...GRI);
        doc.text(k.label, x + 5, cursorY + 8);
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...ANTRASIT);
        doc.text(String(k.value), x + 5, cursorY + 17);
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...GRI);
        doc.text(k.sub, x + 5, cursorY + 21.5);
      });
      cursorY += 24 + 10;

      // SLA durumu — özet listesinin arasında kaybolmasın diye ayrı, öne çıkan bir kutu
      const active = DATA.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
      const slaBreach = active.filter((r) => (RANGE_END - r.acilis) / 86400000 > 10).length;
      const slaOk = slaBreach === 0;
      doc.setFillColor(...(slaOk ? ACIK_ZEMIN : [252, 232, 232]));
      doc.setDrawColor(...(slaOk ? BORDO : [176, 48, 48]));
      doc.setLineWidth(0.4);
      doc.roundedRect(14, cursorY, pageWidth - 28, 11, 1.5, 1.5, 'FD');
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...(slaOk ? BORDO : [150, 30, 30]));
      doc.text(
        slaOk ? 'SLA durumu: sorun yok' : `SLA durumu: ${slaBreach} talep 10 günü aştı`,
        14 + 5, cursorY + 7
      );
      cursorY += 11 + 10;

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...ANTRASIT);
      doc.text('Bu Ayın Özeti', 14, cursorY);
      cursorY += 6;

      const bullets = buildSummaryBullets({
        openedThis, openedLast, launchesThis, launchesLast, closedThis, closedLast, monthLabelText: periodText
      });
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(9);
      bullets.forEach((b) => {
        doc.setTextColor(...BORDO);
        doc.text('-', 14, cursorY);
        doc.setTextColor(60, 60, 60);
        const wrapped = doc.splitTextToSize(b, 172);
        doc.text(wrapped, 19, cursorY);
        cursorY += wrapped.length * 5 + 1.5;
      });
      cursorY += 6;

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...ANTRASIT);
      doc.text('Takım Bazlı Dağılım', 14, cursorY);
      cursorY += 4;

      const teamRows = TEAMS.map((t) => {
        const rows = DATA.filter((r) => r.ekip === t);
        const closedCount = rows.filter((r) => r.durum === 'Kapalı').length;
        const pendingCount = rows.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor').length;
        const closeRate = rows.length ? Math.round((closedCount / rows.length) * 100) : 0;
        return [shortTeam(t), rows.length, closedCount, pendingCount, `%${closeRate}`];
      });

      autoTable(doc, {
        startY: cursorY,
        head: [['Takım', 'Toplam Talep', 'Kapalı', 'Bekleyen', 'Kapanma Oranı']],
        body: teamRows,
        theme: 'striped',
        styles: { font: 'Roboto', fontSize: 8.5, cellPadding: 2.6, textColor: [50, 50, 50] },
        headStyles: { fillColor: BORDO, textColor: [255, 255, 255], fontSize: 8.5, font: 'Roboto', fontStyle: 'bold' },
        alternateRowStyles: { fillColor: ACIK_ZEMIN },
        margin: { left: 14, right: 14 }
      });

      let afterTeamY = doc.lastAutoTable.finalY + 12;

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...ANTRASIT);
      doc.text('Kişi Bazlı Lansman Performansı', 14, afterTeamY);
      afterTeamY += 4;

      const personCounts = {};
      PEOPLE.forEach((p) => (personCounts[p] = 0));
      DATA.forEach((r) => { if (r.lansman && personCounts[r.acanKisi] !== undefined) personCounts[r.acanKisi]++; });
      const personRows = Object.entries(personCounts).sort((a, b) => b[1] - a[1]);

      autoTable(doc, {
        startY: afterTeamY,
        head: [['Kişi', 'Toplam Lansman']],
        body: personRows,
        theme: 'striped',
        styles: { font: 'Roboto', fontSize: 8.5, cellPadding: 2.6, textColor: [50, 50, 50] },
        headStyles: { fillColor: BORDO, textColor: [255, 255, 255], fontSize: 8.5, font: 'Roboto', fontStyle: 'bold' },
        alternateRowStyles: { fillColor: ACIK_ZEMIN },
        margin: { left: 14, right: 14 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...GRI);
        doc.text(`Launchly  |  Sayfa ${i} / ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      }

      doc.save('lansman_raporu.pdf');
    } catch (err) {
      alert('PDF oluşturulamadı: ' + err.message);
    }
    setPdfBusy(false);
  };

  return (
    <>
      <div className="page-head">
        <div className="subtitle">Dönem karşılaştırması ve dışa aktarım</div>
        <div className="ph-actions" style={{ alignItems: 'center' }}>
          <label htmlFor="report-month" style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>Rapor Dönemi:</label>
          <select id="report-month" className="month-select" value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)}>
            {availableMonths.map((mk) => (
              <option key={mk} value={mk}>{monthLabel(mk)}</option>
            ))}
          </select>
          <button className="btn primary" onClick={exportPDF} disabled={pdfBusy}>
            {pdfBusy ? 'Hazırlanıyor...' : '⬇ PDF indir'}
          </button>
          <button className="btn primary" onClick={exportCSV}>⬇ CSV indir</button>
        </div>
      </div>

      <div className="compare-grid">
        <CompareCard label={`Lansman (${monthLabel(selectedMonth)})`} cur={launchesThis} prev={launchesLast} sub="Önceki ay" />
        <CompareCard label={`Açılan Talep (${monthLabel(selectedMonth)})`} cur={openedThis} prev={openedLast} sub="Önceki ay" />
        <CompareCard label={`Kapanan Talep (${monthLabel(selectedMonth)})`} cur={closedThis} prev={closedLast} sub="Önceki ay" />
      </div>

      <CompareChart endDate={selectedEndDate} />
    </>
  );
}