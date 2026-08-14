import { useState } from 'react';
import { PEOPLE, TEAMS, RANGE_END, lastNMonths, monthKey, monthLabel } from '../data/dummyData';
import { ChatIcon, CloseIcon } from './Icons';

function normalize(str) {
  return str
    .toLocaleLowerCase('tr')
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyHas(words, target) {
  if (target.length <= 2) {
    return words.some((w) => w === target); // çok kısa hedefler sadece birebir eşleşsin
  }
  const maxDist = target.length <= 4 ? 1 : target.length <= 7 ? 2 : 3;
  return words.some((w) => {
    if (w.length <= 2) return w === target; // çok kısa soru kelimeleri de birebir olmalı
    return w.includes(target) || target.includes(w) || levenshtein(w, target) <= maxDist;
  });
}

function findPerson(words) {
  return PEOPLE.find((p) => {
    const parts = normalize(p).split(' ');
    return parts.some((part) => fuzzyHas(words, part));
  });
}

function findTeam(words) {
  return TEAMS.find((t) => {
    const short = normalize(t.replace('TEAM-K-BO-', '').replace('TEAM-BO-FT-', ''));
    return fuzzyHas(words, short);
  });
}

// ---- Alt tip / süreç adımı, veriden dinamik olarak bulunuyor (sabit liste değil) ----
function findAltTip(words, data) {
  const uniqueTypes = [...new Set(data.map((r) => r.altTip).filter(Boolean))];
  return uniqueTypes.find((t) => {
    const parts = normalize(t).split(' ').filter((p) => p.length > 3);
    return parts.some((part) => fuzzyHas(words, part));
  });
}

function findSurecAdimi(words, data) {
  const uniqueSteps = [...new Set(data.map((r) => r.surecAdimi).filter(Boolean))];
  return uniqueSteps.find((s) => {
    const parts = normalize(s).split(' ').filter((p) => p.length > 3);
    return parts.some((part) => fuzzyHas(words, part));
  });
}

function answer(question, data, periodLabel) {
  const words = normalize(question).split(/\s+/).filter(Boolean);
  const launches = data.filter((r) => r.lansman);
  const pending = data.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
  const closed = data.filter((r) => r.durum === 'Kapalı');
  const slaBreach = pending.filter((r) => (RANGE_END - r.acilis) / 86400000 > 10);

  // ---- Belirli bir talep ID'si soruluyorsa ----
  const idMatch = question.match(/\d{6,}/);
  if (idMatch) {
    const found = data.find((r) => String(r.id) === idMatch[0]);
    if (found) {
      return `#${found.id}: ${found.aciklama} · Açan: ${found.acanKisi} · Durum: ${found.durum}${found.surecAdimi ? ` · Aşama: ${found.surecAdimi}` : ''}${found.lansman ? ' · Lansmana çıktı ✓' : ''}`;
    }
    return `#${idMatch[0]} numaralı talebi seçili dönemde bulamadım — farklı bir dönem seçili olabilir.`;
  }

  // ---- Kişi bazlı sorular ----
  const person = findPerson(words);
  if (person) {
    const rows = data.filter((r) => r.acanKisi === person);
    const pLaunch = rows.filter((r) => r.lansman).length;
    const pPending = rows.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor').length;
    return `${person}: ${periodLabel} döneminde ${rows.length} talep açtı, ${pLaunch} tanesi lansmana çıktı, ${pPending} tanesi hâlâ bekliyor.`;
  }

  // ---- Takım bazlı sorular ----
  const team = findTeam(words);
  if (team) {
    const rows = data.filter((r) => r.ekip === team);
    const tClosed = rows.filter((r) => r.durum === 'Kapalı').length;
    const tPending = rows.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor').length;
    const shortName = team.replace('TEAM-K-BO-', '').replace('TEAM-BO-FT-', '');
    return `${shortName}: ${periodLabel} döneminde ${rows.length} talep, ${tClosed} kapalı, ${tPending} bekliyor.`;
  }

  // ---- Alt tip sorusu (belirli bir tip ismi geçiyorsa) ----
  const altTip = findAltTip(words, data);
  if (altTip) {
    const count = data.filter((r) => r.altTip === altTip).length;
    return `"${altTip}" tipinde ${periodLabel} döneminde ${count} talep var.`;
  }

  // ---- En çok görülen alt tip ----
  if (fuzzyHas(words, 'tip') && (fuzzyHas(words, 'cok') || fuzzyHas(words, 'hangi'))) {
    const counts = {};
    data.forEach((r) => { const k = r.altTip || 'Diğer'; counts[k] = (counts[k] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top) return `${periodLabel} döneminde en çok görülen alt tip: "${top[0]}" (${top[1]} talep).`;
  }

  // ---- Belirli bir süreç adımı sorusu ----
  const surecAdimi = findSurecAdimi(words, data);
  if (surecAdimi) {
    const count = data.filter((r) => r.surecAdimi === surecAdimi).length;
    return `"${surecAdimi}" aşamasında ${periodLabel} döneminde ${count} talep var.`;
  }

  // ---- Darboğaz / en yoğun aşama sorusu ----
  if ((fuzzyHas(words, 'asama') || fuzzyHas(words, 'adim') || fuzzyHas(words, 'tikan')) && (fuzzyHas(words, 'cok') || fuzzyHas(words, 'birik') || fuzzyHas(words, 'nerede'))) {
    const active = data.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
    const counts = {};
    active.forEach((r) => { const k = r.surecAdimi || 'Belirsiz'; counts[k] = (counts[k] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top) return `Şu an en çok talep "${top[0]}" aşamasında birikmiş (${top[1]} talep) — muhtemel darboğaz burası.`;
  }

  // ---- Ortalama süreç süresi ----
  if (fuzzyHas(words, 'ortalama') && (fuzzyHas(words, 'sure') || fuzzyHas(words, 'gun'))) {
    if (launches.length) {
      const avg = Math.round(launches.reduce((sum, r) => sum + (r.lansman - r.acilis) / 86400000, 0) / launches.length);
      return `${periodLabel} döneminde lansmana çıkan taleplerin ortalama tamamlanma süresi ${avg} gün.`;
    }
  }

  // ---- En çok lansman yapan takım ----
  if (fuzzyHas(words, 'takim') && fuzzyHas(words, 'cok')) {
    const counts = {};
    launches.forEach((r) => { counts[r.ekip] = (counts[r.ekip] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top) return `${periodLabel} döneminde en çok lansman yapan takım: ${top[0].replace('TEAM-K-BO-', '').replace('TEAM-BO-FT-', '')} (${top[1]} lansman).`;
  }

  // ---- Trend / yorum soruları ----
  if (fuzzyHas(words, 'trend') || fuzzyHas(words, 'yorum') || (fuzzyHas(words, 'en') && (fuzzyHas(words, 'yuksek') || fuzzyHas(words, 'dusuk')))) {
    const monthCounts = {};
    data.forEach((r) => {
      if (r.lansman) {
        const mk = monthKey(r.lansman);
        monthCounts[mk] = (monthCounts[mk] || 0) + 1;
      }
    });
    const entries = Object.entries(monthCounts).sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length === 0) {
      return `${periodLabel} döneminde hiç lansman yok, trend hesaplayamadım.`;
    }
    const maxEntry = entries.reduce((max, e) => (e[1] > max[1] ? e : max), entries[0]);
    const minEntry = entries.reduce((min, e) => (e[1] < min[1] ? e : min), entries[0]);
    const half = Math.ceil(entries.length / 2);
    const firstHalf = entries.slice(0, half).reduce((sum, e) => sum + e[1], 0);
    const secondHalf = entries.slice(half).reduce((sum, e) => sum + e[1], 0);
    const trendText = secondHalf > firstHalf ? 'artış eğiliminde 📈' : secondHalf < firstHalf ? 'azalış eğiliminde 📉' : 'stabil seyrediyor ➡️';
    return `${periodLabel} döneminde lansman trendi ${trendText}. En yüksek ay: ${monthLabel(maxEntry[0])} (${maxEntry[1]} lansman). En düşük ay: ${monthLabel(minEntry[0])} (${minEntry[1]} lansman).`;
  }

  if (fuzzyHas(words, 'bekleyen') || fuzzyHas(words, 'bekliyor')) {
    return `${periodLabel} döneminde ${pending.length} talep bekliyor (${data.filter((r) => r.durum === 'Onay Bekleniyor').length} tanesi onay bekliyor).`;
  }
  if (fuzzyHas(words, 'lansman') && (fuzzyHas(words, 'kac') || fuzzyHas(words, 'toplam'))) {
    return `${periodLabel} döneminde ${launches.length} lansman tamamlandı.`;
  }
  // ---- "En çok lansman olan AY hangisi" sorusu (kişi sorusundan ÖNCE kontrol edilmeli) ----
  if (fuzzyHas(words, 'ay') && fuzzyHas(words, 'lansman')) {
    const monthCounts = {};
    data.forEach((r) => {
      if (r.lansman) {
        const mk = monthKey(r.lansman);
        monthCounts[mk] = (monthCounts[mk] || 0) + 1;
      }
    });
    const entries = Object.entries(monthCounts);
    if (entries.length === 0) {
      return `${periodLabel} döneminde hiç lansman yok, en yüksek ayı bulamadım.`;
    }
    const top = entries.sort((a, b) => b[1] - a[1])[0];
    return `${periodLabel} döneminde en çok lansman ${monthLabel(top[0])} ayında oldu (${top[1]} lansman).`;
  }
  if (fuzzyHas(words, 'cok') && fuzzyHas(words, 'lansman')) {
    const counts = {};
    PEOPLE.forEach((p) => (counts[p] = 0));
    launches.forEach((r) => { if (counts[r.acanKisi] !== undefined) counts[r.acanKisi]++; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return `${periodLabel} döneminde en çok lansman yapan kişi ${top[0]} (${top[1]} lansman).`;
  }
  if (fuzzyHas(words, 'oran')) {
    const ratio = data.length ? Math.round((closed.length / data.length) * 100) : 0;
    return `${periodLabel} döneminde açık/kapalı oranı %${ratio} (${closed.length} kapalı / ${data.length} toplam).`;
  }
  if (fuzzyHas(words, 'sla') || fuzzyHas(words, 'gecikti') || fuzzyHas(words, 'gecikme')) {
    return slaBreach.length > 0
      ? `${periodLabel} döneminde ${slaBreach.length} talep 10 günden uzun süredir bekliyor, SLA süresini aştı.`
      : `${periodLabel} döneminde SLA süresini aşan talep yok.`;
  }
  if (fuzzyHas(words, 'talep') && (fuzzyHas(words, 'kac') || fuzzyHas(words, 'toplam'))) {
    return `${periodLabel} döneminde toplam ${data.length} talep kayıtlı.`;
  }

  return 'Bunu tam anlayamadım 🤔 Deneyebileceğin sorular: "10000004011 nedir", "Ayşe kaç lansman yaptı?", "en çok görülen tip ne?", "hangi aşamada birikme var?", "ortalama süre ne kadar?", "en çok lansman yapan takım hangisi?", "trend nasıl?"';
}

export default function ChatBot({ data, periodLabel }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Merhaba! Ben Dashboard Asistanı 👋 Kişi, takım, alt tip, süreç aşaması ya da belirli bir talep ID\'si hakkında soru sorabilirsin.' }
  ]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    const botMsg = { from: 'bot', text: answer(input, data, periodLabel) };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') send();
  };

  return (
    <>
      <div className="chatbot-btn" onClick={() => setOpen((o) => !o)}>
        {open ? <CloseIcon /> : <ChatIcon />}
      </div>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-head">
            Dashboard Asistanı · {periodLabel}
            <span style={{ cursor: 'pointer', color: 'var(--text-dim)' }} onClick={() => setOpen(false)}>✕</span>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div className={`chat-msg ${m.from}`} key={i}>{m.text}</div>
            ))}
          </div>
          <div className="chatbot-input-row">
            <input
              type="text"
              placeholder="Bir soru yaz..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button onClick={send}>Gönder</button>
          </div>
        </div>
      )}
    </>
  );
}