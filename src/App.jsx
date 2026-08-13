import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { loadDataFromAPI } from './data/dummyData';
import './index.css';

const THEMES = ['dark', 'light', 'custom'];

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('launchly_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState('dark');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    document.body.classList.remove('light', 'custom-theme');
    if (theme === 'light') document.body.classList.add('light');
    if (theme === 'custom') document.body.classList.add('custom-theme');
  }, [theme]);

  useEffect(() => {
    loadDataFromAPI()
      .then(() => setDataLoaded(true))
      .catch((err) => setLoadError(err.message));
  }, []);

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
      <div style={{ padding: 40, color: '#fff' }}>
        Backend'e bağlanılamadı: {loadError}. <br />
        Backend çalışıyor mu kontrol et (backend klasöründe <code>npm run dev</code>).
      </div>
    );
  }

  if (!dataLoaded) {
    return <div style={{ padding: 40, color: '#fff' }}>Veriler yükleniyor...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} theme={theme} onToggleTheme={cycleTheme} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={cycleTheme} />;
}

export default App;