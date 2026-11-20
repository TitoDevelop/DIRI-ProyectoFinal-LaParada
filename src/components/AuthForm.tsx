import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
export default function AuthForm() {
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error, clearError } = useAuth();
  const { t, language } = useI18n();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registering) await register(email.trim(), password);
    else await login(email.trim(), password);
  };
  const translatedError = ({ 'Ya existe una cuenta con ese correo.':t('errAccount'),'El correo no es válido.':t('errEmail'),'La contraseña debe tener al menos 6 caracteres.':t('errPassword'),'Correo o contraseña incorrectos.':t('errCredentials'),'Activa Email/Password en Firebase Authentication.':t('errMethod'),'No se pudo completar la operación.':t('errDefault') } as Record<string,string>)[error] ?? error;
  return <section className="auth-panel" aria-label="Account / Cuenta">
    <div className="auth-pitch">
      <span className="auth-icon" aria-hidden="true">↗</span>
      <span className="eyebrow">{t('account')}</span>
      <h2>{registering ? t('createAccount') : t('login')}</h2>
      <p>{t('accountIntro')}</p>
      <div className="auth-benefits">
        <span><b aria-hidden="true">✓</b>{language === 'es' ? 'Guarda tus pedidos' : 'Save your orders'}</span>
        <span><b aria-hidden="true">✓</b>{language === 'es' ? 'Pide en pocos pasos' : 'Order in a few steps'}</span>
      </div>
    </div>
    <div className="auth-form-wrap">
      <form className="auth-form" onSubmit={e => void submit(e)}>
        <div className="field"><label htmlFor="email">{t('email')}</label><input id="email" type="email" required autoComplete="email" placeholder={t('emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="password">{t('password')}</label><input id="password" type="password" required minLength={6} autoComplete={registering ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button className="primary auth-submit" disabled={loading} type="submit">{loading ? t('checkingAuth') : registering ? t('register') : t('enter')} <span aria-hidden="true">→</span></button>
      </form>
      {error && <p className="failure" role="alert">{translatedError}</p>}
      <button className="link-button" onClick={() => { clearError(); setRegistering(!registering); }}>{registering ? t('haveAccount') : t('noAccount')}</button>
    </div>
  </section>;
}
