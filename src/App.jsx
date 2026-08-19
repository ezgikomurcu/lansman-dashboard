import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { loadDataFromAPI } from './data/dummyData';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('launchly_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState(() => (localStorage.getItem('launchly_theme') === 'dark' ? 'dark' : 'light'));
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('launchly_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

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
    return <Login onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
}

export default App;
