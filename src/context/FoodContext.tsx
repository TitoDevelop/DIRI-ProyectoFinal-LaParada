import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { MenuItem } from '../entities/entities';
import { configured } from '../firebase/client';
import { changeOrderQuantity, createOrder, deleteOrder, listOrders, type Order } from '../services/orders';
import { log } from '../services/logger';

type View = 'stock' | 'menu' | 'order';
interface FoodContextData {
  menuItems: MenuItem[];
  orders: Order[];
  view: View;
  selectedFood?: MenuItem;
  busy: boolean;
  ready: boolean;
  notice: string;
  error: string;
  showStock(): void;
  showMenu(): void;
  chooseFood(id: number): void;
  sendOrder(id: number, quantity: number): Promise<boolean>;
  refreshOrders(): Promise<void>;
  updateOrder(order: Order, quantity: number): Promise<boolean>;
  removeOrder(id: string): Promise<void>;
}
const FoodContext = createContext<FoodContextData | undefined>(undefined);
const initialMenu: MenuItem[] = [
  { id: 1, name: 'Hamburguesa de pollo', quantity: 40, desc: 'Pollo crujiente, lechuga, tomate y mayonesa casera.', price: 8.5, image: 'pollo.svg' },
  { id: 2, name: 'Patatas de la casa', quantity: 35, desc: 'Patatas gajo con nuestra salsa especial.', price: 4.2, image: 'patatas.svg' },
  { id: 3, name: 'Pizza margarita', quantity: 18, desc: 'Tomate, mozzarella y albahaca fresca.', price: 9.9, image: 'pizza.svg' },
  { id: 4, name: 'Bocadillo vegetal', quantity: 24, desc: 'Pan tostado, aguacate, huevo y rúcula.', price: 7.4, image: 'bocadillo.svg' }
];

function errorText(error: unknown) { return error instanceof Error ? error.message : String(error); }

export function FoodProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenu);
  const [view, setView] = useState<View>('stock');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const selectedFood = menuItems.find(item => item.id === selectedId);

  const refreshOrders = async () => {
    setBusy(true); setNotice('Consultando pedidos en Firebase...'); setError('');
    try {
      const data = await listOrders();
      setOrders(data); setReady(true);
      setNotice('Pedidos cargados correctamente');
    } catch (err) {
      const message = errorText(err); setError(`No se han podido cargar los pedidos: ${message}`);
      setReady(false); log('error', 'Error consultando pedidos', err);
    } finally { setBusy(false); }
  };

  useEffect(() => { if (configured) void refreshOrders(); }, []);

  const sendOrder = async (id: number, quantity: number) => {
    const item = menuItems.find(product => product.id === id);
    if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > item.quantity || !ready || busy) return false;
    setBusy(true); setError(''); setNotice('Guardando el pedido en Firebase...');
    try {
      const order = await createOrder({ foodId: id, foodName: item.name, unitPrice: item.price, quantity,
        total: Number((item.price * quantity).toFixed(2)), createdAt: Date.now() });
      setOrders(current => [order, ...current]);
      setMenuItems(current => current.map(product => product.id === id ? { ...product, quantity: product.quantity - quantity } : product));
      setNotice('Pedido guardado en Firebase');
      return true;
    } catch (err) {
      setError(`No se pudo guardar el pedido: ${errorText(err)}`);
      log('error', 'Error guardando pedido', err);
      return false;
    } finally { setBusy(false); }
  };

  const updateOrder = async (order: Order, quantity: number) => {
    setBusy(true); setNotice('Actualizando pedido...'); setError('');
    try { const updated = await changeOrderQuantity(order, quantity);
      setOrders(current => current.map(item => item.id === updated.id ? updated : item));
      setNotice('Pedido actualizado en Firebase');
      return true;
    } catch(err) { setError(`No se pudo actualizar: ${errorText(err)}`); log('error', 'Error actualizando pedido', err); return false; }
    finally { setBusy(false); }
  };

  const removeOrder = async (id: string) => {
    setBusy(true); setNotice('Eliminando pedido...'); setError('');
    try { await deleteOrder(id); setOrders(current => current.filter(item => item.id !== id)); setNotice('Pedido eliminado de Firebase'); }
    catch(err) { setError(`No se pudo eliminar: ${errorText(err)}`); log('error', 'Error eliminando pedido', err); }
    finally { setBusy(false); }
  };

  const showStock = () => setView('stock');
  const showMenu = () => { setSelectedId(null); setView('menu'); };
  const chooseFood = (id: number) => { setSelectedId(id); setView('order'); };
  return <FoodContext.Provider value={{ menuItems, orders, view, selectedFood, busy, ready, notice, error, showStock, showMenu, chooseFood, sendOrder, refreshOrders, updateOrder, removeOrder }}>
    {children}
  </FoodContext.Provider>;
}
export function useFood() {
  const value = useContext(FoodContext);
  if (!value) throw new Error('useFood debe usarse dentro de FoodProvider');
  return value;
}
