import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'es' | 'en';
const copy = {
  es: {
    tagline:'COMIDA PARA LLEVAR',stampText:'PARA LLEVAR', guest:'Invitado', admin:'Administrador', logout:'Salir', introTag:'HECHO AL MOMENTO', title1:'Comida rica.', title2:'Sin complicaciones.',
    intro:'Escoge lo que más te guste, reserva las unidades y ven a recoger tu pedido.', config:'Falta la configuración de Firebase. Comprueba las variables de entorno.',
    checking:'Comprobando la sesión...', stockTab:'Disponibilidad (admin)', orderTab:'Pedir comida', restricted:'SOLO ADMINISTRACIÓN',
    available:'Productos disponibles', stockInfo:'Las reservas de esta sesión actualizan la disponibilidad.', units:'unidades', viewMenu:'Ver la carta →', loadingMenu:'Cargando carta...', retry:'Reintentar conexión',
    made:'LA CARTA', want:'¿Qué te apetece hoy?', pickDesc:'Elige un producto para hacer tu pedido.', availableQty:'Disponibles', takeAway:'Para recoger', pick:'Elegir', signInFirst:'Inicia sesión',
    pickup:'PEDIDO PARA RECOGER', count:'Cantidad', max:'máximo', total:'Total a pagar en la recogida', submit:'Enviar pedido', saving:'Guardando...', back:'← Volver al menú', confirmed:'¡Pedido confirmado y guardado!', reserved1:'Se han reservado', reserved2:'unidad(es). Paga en efectivo cuando vengas a recogerlo.',
    account:'TU CUENTA', createAccount:'Crear una cuenta', login:'Iniciar sesión', accountIntro:'Para hacer pedidos tienes que acceder con tu correo y contraseña.', email:'Correo electrónico', emailPlaceholder:'tu@email.com', password:'Contraseña', checkingAuth:'Comprobando...', register:'Registrarse', enter:'Entrar', haveAccount:'Ya tengo cuenta', noAccount:'¿No tienes cuenta? Regístrate',
    saved:'Mis pedidos guardados', refresh:'Actualizar lista', empty:'Aún no tienes pedidos guardados.', editQty:'Unidades', save:'Guardar', cancel:'Cancelar', edit:'Editar', remove:'Borrar', note:'Los pedidos se guardan en Firebase. La disponibilidad de la carta es una demostración local y se reinicia al recargar.',
    confirmTitle:'¿Eliminar el pedido?', confirmText:'Vas a borrar este pedido de Firebase. Esta acción no se puede deshacer.', confirmDelete:'Sí, borrar pedido', close:'Cerrar',
    statusFetching:'Consultando pedidos en Firebase...', statusFetched:'Pedidos cargados correctamente', statusSaving:'Guardando el pedido en Firebase...', statusSaved:'Pedido guardado en Firebase', statusUpdating:'Actualizando pedido...', statusUpdated:'Pedido actualizado en Firebase', statusDeleting:'Eliminando pedido...', statusDeleted:'Pedido eliminado de Firebase', statusLoadFail:'No se han podido cargar los pedidos:', statusSaveFail:'No se pudo guardar el pedido:', statusUpdateFail:'No se pudo actualizar:', statusDeleteFail:'No se pudo eliminar:',
    p1:'Hamburguesa de pollo',p2:'Patatas de la casa',p3:'Pizza margarita',p4:'Bocadillo vegetal',d1:'Pollo crujiente, lechuga, tomate y mayonesa casera.',d2:'Patatas gajo con nuestra salsa especial.',d3:'Tomate, mozzarella y albahaca fresca.',d4:'Pan tostado, aguacate, huevo y rúcula.',
    errAccount:'Ya existe una cuenta con ese correo.',errEmail:'El correo no es válido.',errPassword:'La contraseña debe tener al menos 6 caracteres.',errCredentials:'Correo o contraseña incorrectos.',errMethod:'Activa Email/Password en Firebase Authentication.',errDefault:'No se pudo completar la operación.'
  },
  en: {
    tagline:'TAKEAWAY FOOD',stampText:'TAKE AWAY',guest:'Guest',admin:'Administrator',logout:'Sign out',introTag:'FRESHLY MADE',title1:'Good food.',title2:'No fuss.',
    intro:'Choose what you fancy, reserve your portions and pick up your order.',config:'Firebase is not configured. Check the environment variables.',
    checking:'Checking your session...',stockTab:'Availability (admin)',orderTab:'Order food',restricted:'ADMIN ONLY',
    available:'Available products',stockInfo:'Orders in this session update the available quantities.',units:'units',viewMenu:'View menu →',loadingMenu:'Loading menu...',retry:'Retry connection',
    made:'THE MENU',want:'What would you like?',pickDesc:'Choose a product to place your order.',availableQty:'Available',takeAway:'For pickup',pick:'Choose',signInFirst:'Sign in',
    pickup:'PICKUP ORDER',count:'Quantity',max:'maximum',total:'Total to pay on pickup',submit:'Place order',saving:'Saving...',back:'← Back to menu',confirmed:'Order confirmed and saved!',reserved1:'You reserved',reserved2:'item(s). Pay in cash when you pick it up.',
    account:'YOUR ACCOUNT',createAccount:'Create an account',login:'Sign in',accountIntro:'Sign in with your email and password to place orders.',email:'Email',emailPlaceholder:'you@email.com',password:'Password',checkingAuth:'Checking...',register:'Sign up',enter:'Sign in',haveAccount:'I have an account',noAccount:'No account? Sign up',
    saved:'My saved orders',refresh:'Refresh list',empty:'You have no saved orders yet.',editQty:'Quantity',save:'Save',cancel:'Cancel',edit:'Edit',remove:'Delete',note:'Orders are stored in Firebase. Menu availability is a local demonstration and resets on reload.',
    confirmTitle:'Delete this order?',confirmText:'This order will be deleted from Firebase. This action cannot be undone.',confirmDelete:'Yes, delete order',close:'Close',
    statusFetching:'Loading orders from Firebase...',statusFetched:'Orders loaded successfully',statusSaving:'Saving order to Firebase...',statusSaved:'Order saved to Firebase',statusUpdating:'Updating order...',statusUpdated:'Order updated in Firebase',statusDeleting:'Deleting order...',statusDeleted:'Order deleted from Firebase',statusLoadFail:'Could not load orders:',statusSaveFail:'Could not save order:',statusUpdateFail:'Could not update order:',statusDeleteFail:'Could not delete order:',
    p1:'Chicken burger',p2:'House fries',p3:'Margherita pizza',p4:'Veggie sandwich',d1:'Crispy chicken, lettuce, tomato and house mayo.',d2:'Potato wedges with our special sauce.',d3:'Tomato, mozzarella and fresh basil.',d4:'Toasted bread, avocado, egg and rocket.',
    errAccount:'An account already exists with this email.',errEmail:'The email is invalid.',errPassword:'Password must be at least 6 characters.',errCredentials:'Invalid email or password.',errMethod:'Enable Email/Password in Firebase Authentication.',errDefault:'Could not complete the operation.'
  }
} as const;
export type TranslationKey = keyof typeof copy.es;
interface I18nValue { language: Language; setLanguage: (value:Language)=>void; t: (key:TranslationKey)=>string; }
const Context=createContext<I18nValue | null>(null);
export function I18nProvider({children}:{children:ReactNode}){
  const [language,setLanguage]=useState<Language>(()=>{try{return localStorage.getItem('diri-language')==='en'?'en':'es';}catch{return 'es';}});
  useEffect(()=>{document.documentElement.lang=language;try{localStorage.setItem('diri-language',language);}catch{ /* storage disabled */ }},[language]);
  return <Context.Provider value={{language,setLanguage,t:key=>copy[language][key]}}>{children}</Context.Provider>;
}
export function useI18n(){const value=useContext(Context);if(!value)throw new Error('I18nProvider missing');return value;}
export function translateStatus(text:string, t:(key:TranslationKey)=>string){
  const prefixes: [string,TranslationKey][]=[
    ['No se han podido cargar los pedidos:', 'statusLoadFail'],['No se pudo guardar el pedido:', 'statusSaveFail'],['No se pudo actualizar:', 'statusUpdateFail'],['No se pudo eliminar:', 'statusDeleteFail']
  ];
  for(const [prefix,key] of prefixes){if(text.startsWith(prefix))return t(key)+text.slice(prefix.length);}
  const messages: Record<string,TranslationKey>={
    'Consultando pedidos en Firebase...':'statusFetching','Pedidos cargados correctamente':'statusFetched','Guardando el pedido en Firebase...':'statusSaving',
    'Pedido guardado en Firebase':'statusSaved','Actualizando pedido...':'statusUpdating','Pedido actualizado en Firebase':'statusUpdated',
    'Eliminando pedido...':'statusDeleting','Pedido eliminado de Firebase':'statusDeleted'
  };
  return messages[text]?t(messages[text]):text;
}
export function translateFoodName(id:number,t:(key:TranslationKey)=>string){return t((`p${id}` as TranslationKey));}
export function translateFoodDesc(id:number,t:(key:TranslationKey)=>string){return t((`d${id}` as TranslationKey));}
