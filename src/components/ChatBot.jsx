import { useState } from 'react';
import { PEOPLE, TEAMS, RANGE_END, lastNMonths, monthKey, monthLabel } from '../data/dummyData';

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
  const maxDist = target.length <= 4 ? 1 : target.length <= 7 ? 2 : 3;
  return words.some((w) => w.includes(target) || target.includes(w) || levenshtein(w, target) <= maxDist);
}

// ---- Sorunun içinde ge\u00e7en bir ki\u015fi ad\u0131n\u0131 bulur ----
function findPerson(words) {
  return PEOPLE.find((p) => {
    const parts = normalize(p).split(' ');
    return parts.some((part) => fuzzyHas(words, part));
  });
}

// ---- Sorunun içinde ge\u00e7en bir tak\u0131m kodunu bulur ----
function findTeam(words) {
  return TEAMS.find((t) => {
    const short = normalize(t.replace('TEAM-K-BO-', ''));
    return fuzzyHas(words, short);
  });
}

function answer(question, data, periodLabel) {
  const words = normalize(question).split(/\s+/).filter(Boolean);
  const launches = data.filter((r) => r.lansman);
  const pending = data.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
  const closed = data.filter((r) => r.durum === 'Kapalı');
  const slaBreach = pending.filter((r) => (RANGE_END - r.acilis) / 86400000 > 10);

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
    const shortName = team.replace('TEAM-K-BO-', '');
    return `${shortName}: ${periodLabel} döneminde ${rows.length} talep, ${tClosed} kapalı, ${tPending} bekliyor.`;
  }

  // ---- Trend / yorum sorular\u0131 ----
  if (fuzzyHas(words, 'trend') || fuzzyHas(words, 'yorum') || (fuzzyHas(words, 'en') && (fuzzyHas(words, 'yuksek') || fuzzyHas(words, 'dusuk')))) {
    const months = lastNMonths(6, RANGE_END);
    const counts = months.map((mk) => data.filter((r) => r.lansman && monthKey(r.lansman) === mk).length);
    const maxIdx = counts.indexOf(Math.max(...counts));
    const minIdx = counts.indexOf(Math.min(...counts));
    const firstHalf = counts.slice(0, 3).reduce((a, b) => a + b, 0);
    const secondHalf = counts.slice(3).reduce((a, b) => a + b, 0);
    const trendText = secondHalf > firstHalf ? 'artış eğiliminde' : secondHalf < firstHalf ? 'azalış eğiliminde' : 'stabil seyrediyor';
    return `Son 6 ayda lansman trendi ${trendText}. En yüksek ay: ${monthLabel(months[maxIdx])} (${counts[maxIdx]} lansman). En düşük ay: ${monthLabel(months[minIdx])} (${counts[minIdx]} lansman).`;
  }

  if (fuzzyHas(words, 'bekleyen') || fuzzyHas(words, 'bekliyor')) {
    return `${periodLabel} döneminde ${pending.length} talep bekliyor (${data.filter((r) => r.durum === 'Onay Bekleniyor').length} tanesi onay bekliyor).`;
  }
  if (fuzzyHas(words, 'lansman') && (fuzzyHas(words, 'kac') || fuzzyHas(words, 'toplam'))) {
    return `${periodLabel} döneminde ${launches.length} lansman tamamlandı.`;
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

  return 'Bunu tam anlayamadım 🤔 Deneyebileceğin sorular: "Ayşe kaç lansman yaptı?", "SMARTCAN kaç talep?", "trend nasıl?", "en yüksek ay hangisi?", "kaç talep bekliyor?", "SLA aşan var mı?"';
}

export default function ChatBot({ data, periodLabel }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Merhaba! Ben Pulse 👋 Kişi, takım ya da trend hakkında soru sorabilirsin.' }
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
        {open ? '✕' : '💬'}
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