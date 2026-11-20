import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';

// Las rutas sensibles se protegen aquí y además sus datos se protegen en Firebase Rules.
export default function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  const { language } = useI18n();
  const location = useLocation();
  if (loading) return <p role="status">{language === 'es' ? 'Comprobando la sesión...' : 'Checking session...'}</p>;
  if (!user) return <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/carta" replace />;
  return <>{children}</>;
}
