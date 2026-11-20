import { useNavigate } from 'react-router-dom';
import { useFood } from '../store/hooks';
import { useAuth } from '../auth/AuthContext';
import { useI18n, translateFoodDesc, translateFoodName } from '../i18n/I18nContext';
export default function Foods() {
  const { menuItems } = useFood();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const {t}=useI18n();
  return <section>
    <div className="section-heading"><div><span className="eyebrow">{t('made')}</span><h2>{t('want')}</h2></div><p>{t('pickDesc')}</p></div>
    <div className="food-grid">{menuItems.map(item => <article className="food-card" key={item.id}>
      <img src={`${import.meta.env.BASE_URL}images/${item.image}`} alt={translateFoodName(item.id,t)} />
      <div className="card-body"><div className="card-header"><h3>{translateFoodName(item.id,t)}</h3><strong>{item.price.toFixed(2)} €</strong></div>
        <p>{translateFoodDesc(item.id,t)}</p><div className="card-footer"><span className={item.quantity > 0 ? 'stock' : 'soldout'}>{isAdmin ? `${t('availableQty')}: ${item.quantity}` : t('takeAway')}</span>
          <button disabled={!user || item.quantity === 0} onClick={() => navigate(`/producto/${item.id}`)}>{user ? t('pick') : t('signInFirst')}</button></div></div>
    </article>)}</div>
  </section>;
}
