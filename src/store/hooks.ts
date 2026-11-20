import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { chooseFood, editOrder, eraseOrder, fetchOrders, searchOrders, showMenu, showStock, submitOrder } from './foodSlice';
import type { Order } from '../services/orders';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// API de lectura cómoda para los componentes que ya tenía el proyecto.
// Los datos vienen del store Redux, no de React Context.
export function useFood() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(root => root.food);
  const selectedFood = state.menuItems.find(item => item.id === state.selectedId);
  return {
    ...state, selectedFood,
    showStock: () => dispatch(showStock()),
    showMenu: () => dispatch(showMenu()),
    chooseFood: (id: number) => dispatch(chooseFood(id)),
    refreshOrders: async () => { await dispatch(fetchOrders()); },
    searchOrders: async (foodId: number) => { await dispatch(searchOrders(foodId)); },
    sendOrder: async (id: number, quantity: number): Promise<boolean> => {
      const item = state.menuItems.find(food => food.id === id);
      if (!item || !state.ready || state.busy || !Number.isInteger(quantity) || quantity < 1 || quantity > item.quantity) return false;
      const action = await dispatch(submitOrder({ id, quantity, name: item.name, price: item.price }));
      return submitOrder.fulfilled.match(action);
    },
    updateOrder: async (order: Order, quantity: number): Promise<boolean> => {
      if (state.busy || !Number.isInteger(quantity) || quantity < 1) return false;
      const action = await dispatch(editOrder({ order, quantity }));
      return editOrder.fulfilled.match(action);
    },
    removeOrder: async (id: string) => { if (!state.busy) await dispatch(eraseOrder(id)); }
  };
}
