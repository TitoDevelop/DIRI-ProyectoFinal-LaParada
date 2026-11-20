import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '../entities/entities';
import { changeOrderQuantity, createOrder, deleteOrder, listOrders, searchOrdersByFood, type Order } from '../services/orders';
import { log } from '../services/logger';

type View = 'stock' | 'menu' | 'order';
interface FoodState {
  menuItems: MenuItem[];
  orders: Order[];
  view: View;
  selectedId: number | null;
  busy: boolean;
  ready: boolean;
  searching: boolean;
  notice: string;
  error: string;
}

const initialState: FoodState = {
  menuItems: [
    { id: 1, name: 'Hamburguesa de pollo', quantity: 40, desc: 'Pollo crujiente, lechuga, tomate y mayonesa casera.', price: 8.5, image: 'pollo.svg' },
    { id: 2, name: 'Patatas de la casa', quantity: 35, desc: 'Patatas gajo con nuestra salsa especial.', price: 4.2, image: 'patatas.svg' },
    { id: 3, name: 'Pizza margarita', quantity: 18, desc: 'Tomate, mozzarella y albahaca fresca.', price: 9.9, image: 'pizza.svg' },
    { id: 4, name: 'Bocadillo vegetal', quantity: 24, desc: 'Pan tostado, aguacate, huevo y rúcula.', price: 7.4, image: 'bocadillo.svg' }
  ],
  orders: [], view: 'stock', selectedId: null, busy: false, ready: false, searching: false, notice: '', error: ''
};

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// createAsyncThunk mantiene el estado de las peticiones pending/fulfilled/rejected.
export const fetchOrders = createAsyncThunk('food/fetchOrders', async () => listOrders());
export const searchOrders = createAsyncThunk('food/searchOrders', async (foodId: number) => searchOrdersByFood(foodId));
export const submitOrder = createAsyncThunk('food/submitOrder', async (data: {
  id: number; quantity: number; name: string; price: number;
}) => createOrder({ foodId: data.id, foodName: data.name, unitPrice: data.price,
  quantity: data.quantity, total: Number((data.price * data.quantity).toFixed(2)), createdAt: Date.now() }));
export const editOrder = createAsyncThunk('food/editOrder', async (data: { order: Order; quantity: number }) =>
  changeOrderQuantity(data.order, data.quantity));
export const eraseOrder = createAsyncThunk('food/eraseOrder', async (id: string) => {
  await deleteOrder(id);
  return id;
});

const foodSlice = createSlice({
  name: 'food', initialState,
  reducers: {
    resetSession(state) { state.orders = []; state.ready = false; state.searching = false; state.notice = ''; state.error = ''; state.busy = false; state.view = 'menu'; state.selectedId = null; },
    showStock(state) { state.view = 'stock'; },
    showMenu(state) { state.view = 'menu'; state.selectedId = null; },
    chooseFood(state, action: PayloadAction<number>) { state.view = 'order'; state.selectedId = action.payload; }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchOrders.pending, state => { state.searching = false; state.busy = true; state.notice = 'Consultando pedidos en Firebase...'; state.error = ''; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.orders = action.payload; state.ready = true; state.busy = false; state.notice = 'Pedidos cargados correctamente'; })
      .addCase(fetchOrders.rejected, (state, action) => { state.ready = false; state.busy = false; state.notice = ''; state.error = 'No se han podido cargar los pedidos: ' + errorText(action.error.message); })
      .addCase(searchOrders.pending, state => { state.busy = true; state.error = ''; state.notice = 'Consultando pedidos en Firebase...'; })
      .addCase(searchOrders.fulfilled, (state, action) => { state.orders = action.payload; state.searching = true; state.ready = true; state.busy = false; state.notice = 'Pedidos cargados correctamente'; })
      .addCase(searchOrders.rejected, (state, action) => { state.busy = false; state.notice = ''; state.error = 'No se han podido cargar los pedidos: ' + errorText(action.error.message); })
      .addCase(submitOrder.pending, state => { state.busy = true; state.notice = 'Guardando el pedido en Firebase...'; state.error = ''; })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        const food = state.menuItems.find(item => item.id === action.payload.foodId);
        if (food) food.quantity = Math.max(0, food.quantity - action.payload.quantity);
        state.busy = false; state.notice = 'Pedido guardado en Firebase';
      })
      .addCase(submitOrder.rejected, (state, action) => { state.busy = false; state.notice = ''; state.error = 'No se pudo guardar el pedido: ' + errorText(action.error.message); })
      .addCase(editOrder.pending, state => { state.busy = true; state.notice = 'Actualizando pedido...'; state.error = ''; })
      .addCase(editOrder.fulfilled, (state, action) => { state.orders = state.orders.map(order => order.id === action.payload.id ? action.payload : order); state.busy = false; state.notice = 'Pedido actualizado en Firebase'; })
      .addCase(editOrder.rejected, (state, action) => { state.busy = false; state.notice = ''; state.error = 'No se pudo actualizar: ' + errorText(action.error.message); })
      .addCase(eraseOrder.pending, state => { state.busy = true; state.notice = 'Eliminando pedido...'; state.error = ''; })
      .addCase(eraseOrder.fulfilled, (state, action) => { state.orders = state.orders.filter(order => order.id !== action.payload); state.busy = false; state.notice = 'Pedido eliminado de Firebase'; })
      .addCase(eraseOrder.rejected, (state, action) => { state.busy = false; state.notice = ''; state.error = 'No se pudo eliminar: ' + errorText(action.error.message); });
  }
});
export const { showStock, showMenu, chooseFood, resetSession } = foodSlice.actions;
export default foodSlice.reducer;
