import { useI18n } from '../i18n/I18nContext';
export default function LanguageSwitcher(){
 const {language,setLanguage}=useI18n();
 return <div className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-1" role="group" aria-label="Language / Idioma">
   <button type="button" className={`rounded px-2 py-1 text-xs font-bold ${language==='es'?'bg-parada text-white':'text-stone-600'}`} onClick={()=>setLanguage('es')} aria-pressed={language==='es'}>ES</button>
   <button type="button" className={`rounded px-2 py-1 text-xs font-bold ${language==='en'?'bg-parada text-white':'text-stone-600'}`} onClick={()=>setLanguage('en')} aria-pressed={language==='en'}>EN</button>
 </div>;
}
