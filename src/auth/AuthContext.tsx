import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { auth, configured, database } from '../firebase/client';
import { log } from '../services/logger';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function readableError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === 'auth/email-already-in-use') return 'Ya existe una cuenta con ese correo.';
  if (code === 'auth/invalid-email') return 'El correo no es válido.';
  if (code === 'auth/weak-password') return 'La contraseña debe tener al menos 6 caracteres.';
  if (code === 'auth/invalid-credential') return 'Correo o contraseña incorrectos.';
  if (code === 'auth/operation-not-allowed') return 'Activa Email/Password en Firebase Authentication.';
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, async nextUser => {
      const current = ++generation;
      setLoading(true);
      setUser(null);
      setIsAdmin(false);
      if (!nextUser || nextUser.isAnonymous) {
        // Un usuario anónimo de prácticas anteriores no puede hacer pedidos en AC 8.1.
        if (current === generation) { setUser(null); setLoading(false); }
        return;
      }
      try {
        // El rol se consulta en Firebase. No lo establece el cliente.
        const snap = await get(ref(database, `roles/${nextUser.uid}/admin`));
        if (current === generation) {
          setUser(nextUser);
          setIsAdmin(snap.val() === true);
        }
      } catch (err) {
        log('error', 'No se pudieron consultar los permisos del usuario', err);
        if (current === generation) { setUser(nextUser); setError('No se ha podido comprobar el rol de administrador.'); }
      } finally {
        if (current === generation) setLoading(false);
      }
    }, err => { log('error', 'Error de autenticación', err); setError(readableError(err)); setLoading(false); });
    return () => { generation++; unsubscribe(); };
  }, []);

  const perform = async (task: () => Promise<unknown>): Promise<boolean> => {
    setError(''); setLoading(true);
    try { await task(); return true; }
    catch (err) { setError(readableError(err)); log('error', 'Error de acceso', err); return false; }
    finally { setLoading(false); }
  };
  const login = (email: string, password: string) => perform(() => signInWithEmailAndPassword(auth, email, password));
  const register = (email: string, password: string) => perform(() => createUserWithEmailAndPassword(auth, email, password));
  const logout = async () => { setError(''); try { await signOut(auth); } catch (err) { setError(readableError(err)); } };
  return <AuthContext.Provider value={{ user, isAdmin, loading, error, login, register, logout, clearError: () => setError('') }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
