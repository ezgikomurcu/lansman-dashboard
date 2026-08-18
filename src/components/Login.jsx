import { useState } from 'react';
import { API_URL } from '../data/dummyData';
import { MoonIcon, SunIcon, PaletteIcon } from './Icons';

export default function Login({ onLogin, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [fullName, setFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');

  const [forgotId, setForgotId] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError('Kullanıcı adı ve şifre gerekli.');
      return;
    }
    setBusy(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) setLoginError(data.error || 'Giriş başarısız.');
      else onLogin({ username: data.user.username, token: data.token });
    } catch (err) {
      setLoginError('Backend’e bağlanılamadı.');
    }
    setBusy(false);
  };

  const handleSignup = async () => {
    if (!fullName || !signupUsername || !signupPassword) {
      setSignupError('Lütfen tüm alanları doldur.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Şifreler eşleşmiyor.');
      return;
    }
    setBusy(true);
    setSignupError('');
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username: signupUsername, password: signupPassword })
      });
      const data = await res.json();
      if (!res.ok) setSignupError(data.error || 'Kayıt başarısız.');
      else onLogin({ username: data.user.username, token: data.token });
    } catch (err) {
      setSignupError('Backend’e bağlanılamadı.');
    }
    setBusy(false);
  };

  const handleForgot = async () => {
    if (!forgotId) return;
    setBusy(true);
    setForgotError('');
    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotId })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'İşlem başarısız.');
      } else {
        setResetToken(data.resetToken);
        setForgotSent(true);
      }
    } catch (err) {
      setForgotError('Backend’e bağlanılamadı.');
    }
    setBusy(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !newPasswordConfirm) {
      setResetError('Lütfen her iki alanı da doldur.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setResetError('Şifreler eşleşmiyor.');
      return;
    }
    setBusy(true);
    setResetError('');
    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      const data = await res.json();
      if (!res.ok) setResetError(data.error || 'Sıfırlama başarısız.');
      else setResetSuccess(true);
    } catch (err) {
      setResetError('Backend’e bağlanılamadı.');
    }
    setBusy(false);
  };

  const goTo = (m) => {
    setMode(m);
    setSignupError('');
    setLoginError('');
    setForgotError('');
    setForgotSent(false);
    setResetError('');
    setResetSuccess(false);
  };


  return (
    <div id="loginScreen">
      <div className="login-card">
        <div className="login-theme-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? <MoonIcon /> : theme === 'light' ? <SunIcon /> : <PaletteIcon />}
        </div>

        <div className="login-brand">
          <div className="mark"><img src="/logo.png" className="mark-img" alt="logo" /></div>
          <div className="name">Launchly<span>Lansman Kontrol Merkezi · Staj Projesi</span></div>
        </div>

        {(mode === 'forgot' || mode === 'reset') && (
          <div className="back-link" onClick={() => goTo('login')}>← Girişe dön</div>
        )}

        <h1>
          {mode === 'login' && 'Tekrar hoş geldin'}
          {mode === 'signup' && 'Hesap oluştur'}
          {mode === 'forgot' && 'Şifreni mi unuttun?'}
          {mode === 'reset' && 'Yeni şifre belirle'}
        </h1>
        <p className="sub">
          {mode === 'login' && 'C6 talep, analiz ve lansman süreçlerini tek ekrandan takip et.'}
          {mode === 'signup' && 'Birkaç bilgiyle hesabını oluştur, hemen kullanmaya başla.'}
          {mode === 'forgot' && 'Kullanıcı adını yaz, sana sıfırlama bağlantısı oluşturalım.'}
          {mode === 'reset' && 'Hesabın için yeni bir şifre belirle.'}
        </p>

        {mode === 'login' && (
          <>
            <div className="field">
              <label>E-posta</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ornek@sirket.com" />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {loginError && <div className="field-error">{loginError}</div>}
            <div className="forgot-link" onClick={() => goTo('forgot')}>Şifremi unuttum</div>
            <button className="login-btn" onClick={handleLogin} disabled={busy}>
              {busy ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            <div className="login-foot">
              Hesabın yok mu?{' '}
              <span style={{ color: 'var(--teal)', cursor: 'pointer', fontWeight: 700 }} onClick={() => goTo('signup')}>
                Kayıt Ol
              </span>
            </div>
          </>
        )}

        {mode === 'signup' && (
          <>
            <div className="field">
              <label>Ad Soyad</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ad Soyad" />
            </div>
            <div className="field">
              <label>E-posta</label>
              <input type="text" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} placeholder="ornek@sirket.com" />
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
            <button className="login-btn" onClick={handleSignup} disabled={busy}>
              {busy ? 'Kaydediliyor...' : 'Hesap Oluştur'}
            </button>
            <div className="login-foot">
              Zaten hesabın var mı?{' '}
              <span style={{ color: 'var(--teal)', cursor: 'pointer', fontWeight: 700 }} onClick={() => goTo('login')}>
                Giriş Yap
              </span>
            </div>
          </>
        )}

        {mode === 'forgot' && (
          <>
            {!forgotSent ? (
              <>
                <div className="field">
                  <label>E-posta</label>
                  <input type="text" value={forgotId} onChange={(e) => setForgotId(e.target.value)} placeholder="ornek@sirket.com" />
                </div>
                {forgotError && <div className="field-error">{forgotError}</div>}
                <button className="login-btn" onClick={handleForgot} disabled={busy}>
                  {busy ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
              </>
            ) : (
              <div className="success-box">
                ✓ Sıfırlama bağlantısı oluşturuldu (15 dakika geçerli).
                <div style={{ marginTop: 10, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 11, opacity: 0.8 }}>
                  /reset?token={resetToken}
                </div>
                <button className="login-btn" style={{ marginTop: 14 }} onClick={() => setMode('reset')}>
                  Bu linke tıkla (demo)
                </button>
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

        {mode === 'reset' && (
          <>
            {!resetSuccess ? (
              <>
                <div className="field">
                  <label>Yeni şifre</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="field">
                  <label>Yeni şifre (tekrar)</label>
                  <input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} placeholder="••••••••" />
                </div>
                {resetError && <div className="field-error">{resetError}</div>}
                <button className="login-btn" onClick={handleResetPassword} disabled={busy}>
                  {busy ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                </button>
              </>
            ) : (
              <div className="success-box">
                ✓ Şifren başarıyla güncellendi. Artık yeni şifrenle giriş yapabilirsin.
              </div>
            )}
            <div className="login-foot">
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