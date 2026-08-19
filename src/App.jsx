import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { loadDataFromAPI } from './data/dummyData';
import './index.css';

const THEMES = ['dark', 'light', 'custom', 'vivid'];

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('launchly_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('launchly_theme');
    return THEMES.includes(saved) ? saved : 'dark';
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Sınıf <html>'e uygulanıyor, <body>'e değil: CSS custom property override'ları
    // sadece aşağı doğru miras alınır, <html> onların atası olduğu için body'deki
    // sınıf üstteki (root) tarayıcı kaydırma çubuğuna hiç yansımıyordu.
    document.documentElement.classList.remove('light', 'custom-theme', 'theme-vivid');
    if (theme === 'light') document.documentElement.classList.add('light');
    if (theme === 'custom') document.documentElement.classList.add('custom-theme');
    if (theme === 'vivid') document.documentElement.classList.add('theme-vivid');
    localStorage.setItem('launchly_theme', theme);
  }, [theme]);

  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadDataFromAPI()
      .then(() => {
        if (!cancelled) {
          setLoadError(null);
          setDataLoaded(true);
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => { cancelled = true; };
  }, [retryTick]);

  const cycleTheme = () => {
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('launchly_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('launchly_user');
  };

  if (loadError) {
    return (
      <div className="status-screen">
        <div className="status-card">
          <div className="status-icon error">✕</div>
          <h1>Backend'e bağlanılamadı</h1>
          <p>{loadError}</p>
          <p className="status-hint">
            Backend çalışıyor mu kontrol et (backend klasöründe <code>npm run dev</code>).
          </p>
          <button type="button" className="login-btn" onClick={() => setRetryTick((t) => t + 1)}>
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="status-screen">
        <div className="status-card">
          <div className="status-spinner" aria-hidden="true" />
          <p role="status">Veriler yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} theme={theme} onToggleTheme={cycleTheme} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={cycleTheme} />;
}

export default App;