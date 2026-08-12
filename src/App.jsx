import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';

const THEMES = ['dark', 'light', 'custom'];

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.classList.remove('light', 'custom-theme');
    if (theme === 'light') document.body.classList.add('light');
    if (theme === 'custom') document.body.classList.add('custom-theme');
  }, [theme]);

  const cycleTheme = () => {
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);
  };

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (!user) {
    return <Login onLogin={handleLogin} theme={theme} onToggleTheme={cycleTheme} />
  }

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={cycleTheme} />;
}

export default App;