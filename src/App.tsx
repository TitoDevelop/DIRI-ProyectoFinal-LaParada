import { Suspense, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { createAppStore } from './store/store';
import { useAppDispatch, useFood } from './store/hooks';
import { chooseFood, fetchOrders, resetSession } from './store/foodSlice';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { I18nProvider, translateFoodName, translateStatus, useI18n } from './i18n/I18nContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import AuthForm from './components/AuthForm';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './routing/ProtectedRoute';
import { configured } from './firebase/client';
import Foods from './components/Foods';
import FoodOrder from './components/FoodOrder';
import Orders from './components/Orders';

function OrderDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { menuItems } = useFood();
  const { language } = useI18n();
  const product = menuItems.find(item => String(item.id) === id);
  useEffect(() => { if (product) dispatch(chooseFood(product.id)); }, [dispatch, product?.id]);
  if (!product) return <p>{language === 'es' ? 'Producto no encontrado' : 'Product not found'}</p>;
  return <FoodOrder key={product.id} />;
}

function MyOrders() {
  const { orders, busy, refreshOrders, updateOrder, removeOrder } = useFood();
  return <Orders orders={orders} busy={busy} onRefresh={refreshOrders} onUpdate={updateOrder} onDelete={removeOrder} />;
}

function Navigation() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { language } = useI18n();
  return <nav className="tabs" aria-label={language === 'es' ? 'Navegación principal' : 'Main navigation'}>
    <button onClick={() => navigate('/')}>{language === 'es' ? 'Inicio' : 'Home'}</button>
    <button onClick={() => navigate('/carta')}>{language === 'es' ? 'Carta' : 'Menu'}</button>
    {user && <button onClick={() => navigate('/mis-pedidos')}>{language === 'es' ? 'Mis pedidos' : 'My orders'}</button>}
    {isAdmin && <button onClick={() => navigate('/admin')}>{language === 'es' ? 'Disponibilidad (admin)' : 'Availability (admin)'}</button>}
    <button onClick={() => navigate('/ayuda')}>{language === 'es' ? 'Ayuda' : 'Help'}</button>
  </nav>;
}

function Catalog() {
  const { t } = useI18n();
  return <Suspense fallback={<p role="status" className="loading">{t('loadingMenu')}</p>}><Foods /></Suspense>;
}

function Access() {
  const { user } = useAuth();
  const { language } = useI18n();
  if (user) return <Navigate to="/mis-pedidos" replace />;
  return <><h2>{language === 'es' ? 'Accede para hacer tus pedidos' : 'Sign in to place orders'}</h2><AuthForm /></>;
}

function Home() {
  const { user } = useAuth();
  return <>{!user && <AuthForm />}<Catalog /></>;
}

function Admin() {
  const { menuItems } = useFood();
  const { t } = useI18n();
  return <section><div className="section-heading"><div><span className="eyebrow">{t('restricted')}</span><h2>{t('available')}</h2></div><p>{t('stockInfo')}</p></div>
    <div className="availability">{menuItems.map(item => <div className="availability-row" key={item.id}><span className="item-name">{translateFoodName(item.id,t)}</span><span className="count">{item.quantity} {t('units')}</span></div>)}</div></section>;
}

function Help() {
  const { language } = useI18n();
  return <section className="help-page"><h2>{language === 'es' ? 'Cómo funciona La Parada' : 'How La Parada works'}</h2>
    <p>{language === 'es' ? 'Consulta la carta, inicia sesión, elige el producto y confirma tu pedido. Puedes buscar, editar o cancelar tus pedidos desde Mis pedidos. El pago se realiza en efectivo al recogerlo.' : 'Browse the menu, sign in, choose your item and confirm your order. You can search, edit or cancel your orders under My orders. Pay cash when picking up.'}</p></section>;
}

function NotFound() {
  const navigate = useNavigate();
  const { language } = useI18n();
  return <section className="help-page"><h2>404</h2><p>{language === 'es' ? 'No encontramos esta página.' : 'This page does not exist.'}</p><button onClick={() => navigate('/')}>{language === 'es' ? 'Volver al inicio' : 'Back home'}</button></section>;
}

function Shop() {
  const dispatch = useAppDispatch();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const { t, language } = useI18n();
  const { busy, notice, error } = useFood();
  useEffect(() => {
    dispatch(resetSession());
    if (configured && user) {
      const request = dispatch(fetchOrders());
      return () => request.abort();
    }
  }, [dispatch, user?.uid]);
  return <div className="site">
    <header className="topbar"><div className="brand"><span className="brand-mark">LP.</span><span>LA PARADA <small>{t('tagline')}</small></span></div>
      <div className="user-bar flex flex-wrap items-center justify-end gap-2"><LanguageSwitcher/><span>{user ? user.email : t('guest')}{isAdmin ? ` · ${t('admin')}` : ''}</span>{user && <button className="logout" onClick={() => void logout()}>{t('logout')}</button>}</div>
    </header>
    <main className="container">
      <section className="intro"><div><span className="eyebrow">{t('introTag')}</span><h1>{t('title1')}<br/><em>{t('title2')}</em></h1><p>{t('intro')}</p></div><span className="stamp">{t('stampText')} <b>↗</b></span></section>
      {!configured && <p className="failure" role="alert">{t('config')}</p>}
      {authLoading && <p className="loading" role="status">{t('checking')}</p>}
      {user && notice && <p className="loading" role="status">{translateStatus(notice,t)}</p>}
      {user && error && <p className="failure" role="alert">{translateStatus(error,t)}</p>}
      {busy && <span className="sr-only" role="status">{language === 'es' ? 'Procesando solicitud...' : 'Processing request...'}</span>}
      <Navigation />
      <Suspense fallback={<p role="status" className="loading">{t('loadingMenu')}</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carta" element={<Catalog />} />
          <Route path="/acceso" element={<Access />} />
          <Route path="/producto/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/mis-pedidos" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="/ayuda" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
    <footer>Proyecto final DIRI · José Luis Mas García</footer>
  </div>;
}
export default function App() {
  const [store] = useState(createAppStore);
  return <ErrorBoundary><Provider store={store}><I18nProvider><AuthProvider><HashRouter><Shop /></HashRouter></AuthProvider></I18nProvider></Provider></ErrorBoundary>;
}
