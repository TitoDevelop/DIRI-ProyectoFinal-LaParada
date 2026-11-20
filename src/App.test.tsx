import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { ReactNode } from 'react';

const authMock = vi.hoisted(() => ({ loggedIn: false, admin: false }));
vi.mock('./firebase/client', () => ({ configured: true }));
vi.mock('./auth/AuthContext', async () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({ user: authMock.loggedIn ? { uid: 'test-user', email: 'alumno@ejemplo.com' } : null,
    isAdmin: authMock.admin, loading: false, error: '', login: vi.fn(), register: vi.fn(),
    logout: vi.fn(), clearError: vi.fn() })
}));
vi.mock('./services/orders', () => ({
  listOrders: vi.fn(async () => []),
  createOrder: vi.fn(async (order: object) => ({ ...order, id: 'pedido-test' })),
  changeOrderQuantity: vi.fn(), deleteOrder: vi.fn()
}));
beforeEach(() => { window.location.hash = '#/'; });
afterEach(() => { cleanup(); vi.clearAllMocks(); authMock.loggedIn = false; authMock.admin = false; localStorage.removeItem('diri-language'); });

describe('AC 8.1 — permisos y sesión', () => {
  it('como invitado muestra la carta pero no permite pedir ni consultar stock', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Disponibilidad (admin)' })).not.toBeInTheDocument();
    await waitFor(() => expect(document.querySelectorAll('.food-card')).toHaveLength(4));
    expect(screen.getAllByRole('button', { name: 'Inicia sesión' })).toHaveLength(4);
    expect(screen.queryByText('40 unidades')).not.toBeInTheDocument();
  });
  it('un usuario autenticado puede hacer un pedido y no ve el stock', async () => {
    authMock.loggedIn = true;
    const user = userEvent.setup(); render(<App />);
    await waitFor(() => expect(screen.getByText('Pedidos cargados correctamente')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Disponibilidad (admin)' })).not.toBeInTheDocument();
    const card = (await screen.findByRole('img', { name: 'Hamburguesa de pollo' })).closest('article');
    await user.click(within(card!).getByRole('button', { name: 'Elegir' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Cantidad/ }), { target: { value: '5' } });
    expect(screen.getByText('42.50 €')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }));
    expect(await screen.findByText('¡Pedido confirmado y guardado!')).toBeInTheDocument();
  });
  it('el administrador puede consultar la disponibilidad', async () => {
    authMock.loggedIn = true; authMock.admin = true;
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button', { name: 'Disponibilidad (admin)' }));
    expect(screen.getByText('40 unidades')).toBeInTheDocument();
    expect(screen.getByText('35 unidades')).toBeInTheDocument();
  });
});


describe('AC 9.1 — traducciones y componente UI', () => {
  it('cambia la carta al inglés y conserva el idioma', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(await screen.findByRole('heading', { name: 'What would you like?' })).toBeInTheDocument();
    expect(localStorage.getItem('diri-language')).toBe('en');
  });
  it('pide confirmación antes de borrar un pedido', async () => {
    authMock.loggedIn=true;
    const { createOrder } = await import('./services/orders');
    const { listOrders } = await import('./services/orders');
    vi.mocked(listOrders).mockResolvedValueOnce([{ id:'test-order', foodId:1, foodName:'Hamburguesa de pollo', quantity:2, unitPrice:8.5, total:17, createdAt:Date.now() }]);
    const user=userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button',{name:'Mis pedidos'}));
    const remove=await screen.findByRole('button',{name:'Borrar'});
    await user.click(remove);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Eliminar el pedido?')).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Cancelar'}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });
});


describe('Proyecto final — rutas y búsqueda', () => {
  it('mantiene protegida la zona de pedidos de los visitantes', async () => {
    const user = userEvent.setup(); render(<App />);
    expect(screen.queryByRole('button', { name: 'Mis pedidos' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ayuda' }));
    expect(screen.getByText('Cómo funciona La Parada')).toBeInTheDocument();
  });
  it('permite buscar pedidos en Firebase desde la zona privada', async () => {
    authMock.loggedIn = true;
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button', { name: 'Mis pedidos' }));
    expect(await screen.findByRole('combobox', { name: 'Buscar pedidos en Firebase' })).toBeInTheDocument();
  });
});
