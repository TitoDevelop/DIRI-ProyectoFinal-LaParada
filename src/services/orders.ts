import { equalTo, get, orderByChild, push, query, ref, remove, set, update } from 'firebase/database';
import { auth, database } from '../firebase/client';
import { log } from './logger';

export interface Order {
  id: string;
  foodId: number;
  foodName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: number;
}

async function userId() {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw new Error('Debes iniciar sesión para gestionar pedidos.');
  return user.uid;
}

const orderPath = (uid: string, id?: string) => `pedidos/${uid}${id ? '/' + id : ''}`;

export async function listOrders(): Promise<Order[]> {
  const uid = await userId();
  const snapshot = await get(ref(database, orderPath(uid)));
  const items = snapshot.val() as Record<string, Omit<Order, 'id'>> | null;
  log('info', 'Pedidos cargados');
  return Object.entries(items ?? {}).map(([id, order]) => ({ ...order, id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrder(data: Omit<Order, 'id'>): Promise<Order> {
  const uid = await userId();
  const newRef = push(ref(database, orderPath(uid)));
  if (!newRef.key) throw new Error('No se pudo crear el identificador del pedido');
  await set(newRef, data);
  log('info', `Pedido creado: ${newRef.key}`);
  return { ...data, id: newRef.key };
}

export async function changeOrderQuantity(order: Order, quantity: number): Promise<Order> {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Cantidad incorrecta');
  const uid = await userId();
  const total = Number((quantity * order.unitPrice).toFixed(2));
  await update(ref(database, orderPath(uid, order.id)), { quantity, total });
  log('info', `Pedido actualizado: ${order.id}`);
  return { ...order, quantity, total };
}

export async function deleteOrder(id: string): Promise<void> {
  const uid = await userId();
  await remove(ref(database, orderPath(uid, id)));
  log('info', `Pedido eliminado: ${id}`);
}

// Búsqueda REAL contra la base de datos por producto, limitada al usuario actual.
// Requiere el índice .indexOn: ["foodId"] en las reglas de Realtime Database.
export async function searchOrdersByFood(foodId: number): Promise<Order[]> {
  const uid = await userId();
  const snapshot = await get(query(ref(database, orderPath(uid)), orderByChild('foodId'), equalTo(foodId)));
  const items = snapshot.val() as Record<string, Omit<Order, 'id'>> | null;
  log('info', `Búsqueda de pedidos por producto ${foodId}`);
  return Object.entries(items ?? {}).map(([id, order]) => ({ ...order, id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}
