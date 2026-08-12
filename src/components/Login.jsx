import { useState } from 'react';

export default function Login({ onLogin, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'

  const [username, setUsername] = useState('ezgikomurcuu');
  const [password, setPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');

  const [forgotId, setForgotId] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = () => {
    onLogin({ username: username || 'kullanici' });
  };

  const handleSignup = () => {
    if (!fullName || !signupUsername || !signupPassword) {
      setSignupError('Lütfen tüm alanları doldur.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Şifreler eşleşmiyor.');
      return;
    }
    setSignupError('');
    onLogin({ username: signupUsername });
  };

  const handleForgot = () => {
    if (!forgotId) return;
    setForgotSent(true);
  };

  const goTo = (m) => {
    setMode(m);
    setSignupError('');
    setForgotSent(false);
  };

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌸';

  return (
    <div id="loginScreen">
      <div className="login-card">
        <div className="login-theme-btn" onClick={onToggleTheme}>{themeIcon}</div>

        <div className="login-brand">
          <div className="mark">t</div>
          <div className="name">launchly<span>Lansman Kontrol Merkezi · Staj Projesi</span></div>
        </div>

        {mode === 'forgot' && (
          <div className="back-link" onClick={() => goTo('login')}>← Girişe dön</div>
        )}

        {mode !== 'forgot' && (
          <div className="mode-tabs">
            <div className={`mode-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => goTo('login')}>
              Giriş Yap
            </div>
            <div className={`mode-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => goTo('signup')}>
              Kayıt Ol
            </div>
          </div>
        )}

        <h1>
          {mode === 'login' && 'Tekrar hoş geldin'}
          {mode === 'signup' && 'Hesap oluştur'}
          {mode === 'forgot' && 'Şifreni mi unuttun?'}
        </h1>
        <p className="sub">
          {mode === 'login' && 'C6 talep, analiz ve lansman süreçlerini tek ekrandan takip et.'}
          {mode === 'signup' && 'Birkaç bilgiyle hesabını oluştur, hemen kullanmaya başla.'}
          {mode === 'forgot' && 'Kullanıcı adını yaz, sana sıfırlama adımlarını gösterelim.'}
        </p>

        {mode === 'login' && (
          <>
            <div className="field">
              <label>Kullanıcı adı</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ad.soyad" />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="forgot-link" onClick={() => goTo('forgot')}>Şifremi unuttum</div>
            <button className="login-btn" onClick={handleLogin}>Panele Giriş Yap</button>
            <div className="login-foot">
              Staj projesi prototip ekranı — herhangi bir bilgiyle giriş yapabilirsiniz.
            </div>
          </>
        )}

        {mode === 'signup' && (
          <>
            <div className="field">
              <label>Ad Soyad</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ezgi Komurcu" />
            </div>
            <div className="field">
              <label>Kullanıcı adı</label>
              <input type="text" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} placeholder="ezgikomurcuu" />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="field">
              <label>Şifre (tekrar)</label>
              <input type="password" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} placeholder="••••••••" />
            </div>
            {signupError && <div className="field-error">{signupError}</div>}
            <button className="login-btn" onClick={handleSignup}>Hesap Oluştur</button>
            <div className="login-foot">
              Zaten hesabın var mı?{' '}
              <span style={{ color: 'var(--teal)', cursor: 'pointer', fontWeight: 700 }} onClick={() => goTo('login')}>
                Giriş yap
              </span>
            </div>
          </>
        )}

        {mode === 'forgot' && (
          <>
            {!forgotSent ? (
              <>
                <div className="field">
                  <label>Kullanıcı adı</label>
                  <input type="text" value={forgotId} onChange={(e) => setForgotId(e.target.value)} placeholder="ad.soyad" />
                </div>
                <button className="login-btn" onClick={handleForgot}>Sıfırlama Bağlantısı Gönder</button>
              </>
            ) : (
              <div className="success-box">
                ✓ <b>{forgotId}</b> hesabına sıfırlama bağlantısı gönderildi (prototip — gerçek e-posta gitmez).
              </div>
            )}
            <div className="login-foot">
              Hatırladın mı?{' '}
              <span style={{ color: 'var(--teal)', cursor: 'pointer', fontWeight: 700 }} onClick={() => goTo('login')}>
                Girişe dön
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}