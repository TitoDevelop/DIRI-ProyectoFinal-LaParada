import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useFood } from '../store/hooks';
import { useAuth } from '../auth/AuthContext';
import { useI18n, translateFoodDesc, translateFoodName } from '../i18n/I18nContext';
export default function FoodOrder() {
  const { selectedFood: food, sendOrder, busy, ready } = useFood();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const {t}=useI18n();
  const [quantity, setQuantity] = useState(1);
  const [ordered, setOrdered] = useState(false);
  if (!food) return null;
  const totalAmount = food.price * quantity;
  const handleOrder = async () => {
    if (!user || quantity < 1 || quantity > food.quantity || ordered || busy) return;
    const success = await sendOrder(food.id, quantity);
    if (success) setOrdered(true);
  };
  return <section className="order-layout">
    <div className="order-photo"><img src={`${import.meta.env.BASE_URL}images/${food.image}`} alt={translateFoodName(food.id,t)}/></div>
    <div className="order-info"><span className="eyebrow">{t('pickup')}</span><h2>{translateFoodName(food.id,t)}</h2><p>{translateFoodDesc(food.id,t)}</p>
    {ordered ? <div className="confirmation" role="status"><strong>{t('confirmed')}</strong><p>{t('reserved1')} {quantity} {t('reserved2')}</p></div> : <>
      <label htmlFor="quantity">{t('count')} {isAdmin ? `(${t('max')} ${food.quantity})` : ''}</label>
      <input id="quantity" type="number" min="1" max={food.quantity} value={quantity} onChange={e => setQuantity(Math.min(food.quantity, Math.max(1, Number(e.target.value) || 1)))}/>
      <div className="total"><span>{t('total')}</span><strong>{totalAmount.toFixed(2)} €</strong></div>
      <button className="primary" disabled={busy || !ready || !user} onClick={() => void handleOrder()}>{busy ? t('saving') : t('submit')}</button>
    </>}
    <button className="back" onClick={() => navigate('/carta')}>{t('back')}</button></div>
  </section>;
}
