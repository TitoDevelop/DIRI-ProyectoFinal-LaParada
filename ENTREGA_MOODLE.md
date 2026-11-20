# Respuestas para el cuestionario del proyecto final — José Luis Mas García

Adapta las siguientes explicaciones a lo que hayas comprobado al ejecutar la aplicación. El profesor revisará el código y te preguntará por estas decisiones.

## Enrutado

Utilizo **React Router con HashRouter** en `src/App.tsx`. Las rutas están declaradas en `<Routes>` y `<Route>`: inicio (`/`), carta (`/carta`), registro (`/acceso`), detalle (`/producto/:id`), pedidos (`/mis-pedidos`), administración (`/admin`), ayuda y página 404. Elegí HashRouter para evitar errores 404 al recargar en GitHub Pages.

## Autenticación y rutas protegidas

Firebase Authentication gestiona el registro, inicio y cierre de sesión en `src/auth/AuthContext.tsx` y `src/components/AuthForm.tsx`. `src/routing/ProtectedRoute.tsx` comprueba si hay usuario autenticado y, para `/admin`, si tiene rol administrador. Si no tiene permiso, redirige a una ruta permitida. Los roles se leen de Firebase `roles/{uid}/admin` y las reglas de `firebase-rules.json` impiden concederse permisos desde el navegador. La base de datos limita las lecturas y escrituras de pedidos al UID autenticado.

## Formularios

El formulario de registro e inicio de sesión está en `src/components/AuthForm.tsx`, y el de pedido, con validación de cantidad y precio calculado, en `src/components/FoodOrder.tsx`. `src/components/Orders.tsx` permite editar cantidades y buscar por producto. Uso estado local y eventos `onSubmit`/`onChange`.

## Base de datos: añadir, borrar, buscar y editar

El flujo principal es la compra para recoger, no una tabla CRUD. `src/services/orders.ts` implementa operaciones reales con **Firebase Realtime Database**: `createOrder` añade, `listOrders` consulta, `searchOrdersByFood` busca con `query`, `orderByChild` y `equalTo`, `changeOrderQuantity` edita y `deleteOrder` elimina. El componente `src/components/Orders.tsx` ofrece las acciones y el buscador. El índice de búsqueda está en `firebase-rules.json`. Los thunks de Redux en `src/store/foodSlice.ts` coordinan la persistencia asíncrona.

## Carga diferida

`src/App.tsx` utiliza `React.lazy` y `Suspense` para cargar bajo demanda `Foods`, `FoodOrder` y `Orders`, sin meter todas las vistas en el bundle inicial.

## Pruebas unitarias

Las pruebas están en `src/App.test.tsx`, con **Vitest** y **React Testing Library**. Verifican roles, restricciones, pedidos, idiomas, diálogo y navegación/búsqueda. Se ejecutan con `npm run test` y forman parte del workflow de despliegue.

## Logging

El servicio `src/services/logger.ts` registra operaciones de Firebase y errores. `src/store/store.ts` contiene un middleware que registra las acciones Redux rechazadas (`/rejected`).

## Tratamiento de errores

`src/components/ErrorBoundary.tsx` captura errores de renderizado. `src/auth/AuthContext.tsx` trata fallos de autenticación y `src/store/foodSlice.ts` gestiona acciones asíncronas rechazadas y mensajes de error en la interfaz. `src/App.tsx` muestra estados de carga.

## Redux Toolkit

En `src/store/store.ts` se configura la tienda con `configureStore`. `src/store/foodSlice.ts` define el estado, reducers y thunks (`fetchOrders`, `searchOrders`, `submitOrder`, `editOrder`, `eraseOrder`). `src/store/hooks.ts` exporta hooks tipados para conectar los componentes.

## Framework UI

Se usan **Tailwind CSS** y componentes accesibles de **Headless UI**. El modal para confirmar el borrado está en `src/components/Orders.tsx` con `Dialog`, `DialogPanel`, `DialogTitle` y `Description`. Configuración: `tailwind.config.cjs`, `postcss.config.cjs` y `src/style.css`.

## Internacionalización

`src/i18n/I18nContext.tsx` almacena los textos en español e inglés, comparte el idioma seleccionado con contexto y lo recuerda en `localStorage`. `src/components/LanguageSwitcher.tsx` permite cambiar entre ES y EN. El estado de los pedidos también traduce sus mensajes mediante `translateStatus`.
