import { useState, type FormEvent } from 'react';
import { useFood } from '../store/hooks';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import type { Order } from '../services/orders';
import { translateFoodName, useI18n } from '../i18n/I18nContext';
interface Props {orders:Order[];busy:boolean;onRefresh():Promise<void>;onUpdate(order:Order,quantity:number):Promise<boolean>;onDelete(id:string):Promise<void>}
export default function Orders({ orders,busy,onRefresh,onUpdate,onDelete }:Props){
  const { searchOrders, searching, menuItems }=useFood();
  const [filterFood,setFilterFood]=useState('');
  const search=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();if(filterFood)void searchOrders(Number(filterFood));else void onRefresh();};
  const [editing,setEditing]=useState<string|null>(null);
  const [quantity,setQuantity]=useState(1);
  const [toDelete,setToDelete]=useState<Order|null>(null);
  const {language,t}=useI18n();
  const deleteConfirmed=async()=>{if(!toDelete)return;const id=toDelete.id;setToDelete(null);await onDelete(id);};
  return <section className="orders">
    <form className="search-orders" onSubmit={search} aria-label={language==='es'?'Buscar pedidos':'Search orders'}>
      <label htmlFor="food-search">{language==='es'?'Buscar pedidos en Firebase':'Search orders in Firebase'}</label>
      <select id="food-search" value={filterFood} onChange={e=>setFilterFood(e.target.value)}>
        <option value="">{language==='es'?'Todos los productos':'All products'}</option>
        {menuItems.map(item=><option key={item.id} value={item.id}>{translateFoodName(item.id,t)}</option>)}
      </select>
      <button type="submit" disabled={busy}>{language==='es'?'Buscar':'Search'}</button>
      {searching&&<span role="status">{language==='es'?'Resultados filtrados desde Firebase':'Filtered results from Firebase'}</span>}
    </form>
    <div className="orders-heading"><h2>{t('saved')}</h2><button disabled={busy} onClick={()=>void onRefresh()}>{t('refresh')}</button></div>
    {orders.length===0?<p>{t('empty')}</p>:<ul className="orders-list">{orders.map(order=><li key={order.id}>
      <div><strong>{translateFoodName(order.foodId,t)}</strong><small>{new Date(order.createdAt).toLocaleString(language==='es'?'es-ES':'en-GB')} · {order.id.slice(-6)}</small></div>
      {editing===order.id?<div className="order-actions"><label>{t('editQty')} <input aria-label={`${t('editQty')} ${translateFoodName(order.foodId,t)}`} type="number" min={1} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label>
        <button disabled={busy||!Number.isInteger(quantity)||quantity<1} onClick={async()=>{if(await onUpdate(order,quantity))setEditing(null)}}>{t('save')}</button><button onClick={()=>setEditing(null)}>{t('cancel')}</button></div>:
        <div className="order-actions"><span>{order.quantity} {language==='es'?'ud.':'pcs.'} · {order.total.toFixed(2)} €</span>
          <button disabled={busy} onClick={()=>{setEditing(order.id);setQuantity(order.quantity)}}>{t('edit')}</button>
          <button disabled={busy} onClick={()=>setToDelete(order)}>{t('remove')}</button></div>}
    </li>)}</ul>}
    <p className="orders-note">{t('note')}</p>
    <Dialog open={toDelete!==null} onClose={()=>setToDelete(null)} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true"/>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <DialogTitle className="text-xl font-bold text-stone-900">{t('confirmTitle')}</DialogTitle>
          <Description className="mt-3 text-sm leading-6 text-stone-600">{t('confirmText')}</Description>
          {toDelete&&<p className="mt-3 font-semibold text-parada">{translateFoodName(toDelete.foodId,t)} · {toDelete.quantity}</p>}
          <div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-lg border border-stone-300 px-4 py-2" onClick={()=>setToDelete(null)}>{t('cancel')}</button>
            <button type="button" className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800" onClick={()=>void deleteConfirmed()}>{t('confirmDelete')}</button></div>
        </DialogPanel>
      </div>
    </Dialog>
  </section>;
}
