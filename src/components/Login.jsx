import { useState } from 'react';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('Yönetici');
  const [username, setUsername] = useState('ayse.kaya');

  const handleLogin = () => {
    onLogin({ username: username || 'kullanici', role });
  };

  return (
    <div id="loginScreen">
      <div className="login-card">
        <div className="login-brand">
          <div className="mark">t</div>
          <div className="name">
            turkcell
            <span>Lansman Kontrol Merkezi · Staj Projesi</span>
          </div>
        </div>
        <h1>Tekrar hoş geldin</h1>
        <p className="sub">C6 talep, analiz ve lansman süreçlerini tek ekrandan takip et.</p>

        <div className="role-row">
          {['Yönetici', 'Analist', 'QA'].map((r) => (
            <div
              key={r}
              className={`role-chip ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r}
            </div>
          ))}
        </div>

        <div className="field">
          <label>Kullanıcı adı</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ad.soyad"
          />
        </div>
        <div className="field">
          <label>Şifre</label>
          <input type="password" placeholder="••••••••" />
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Panele Giriş Yap
        </button>
        <div className="login-foot">
          Staj projesi prototip ekranı — herhangi bir bilgiyle giriş yapabilirsiniz.
        </div>
      </div>
    </div>
  );
}