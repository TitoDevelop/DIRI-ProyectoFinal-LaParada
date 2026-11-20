# Guía corta de defensa — Proyecto final DIRI

1. Abre la web y enseña las rutas públicas `/` y `/carta`, después entra directamente en `#/mis-pedidos` en incógnito: debe llevarte a `/acceso`.
2. Registra o inicia sesión con un usuario normal y comprueba que puede pedir y buscar pedidos, pero no entra a `#/admin`.
3. Crea un pedido, enseña su registro en Firebase; busca por producto con el selector de Mis pedidos; edítalo y bórralo tras confirmar el modal.
4. Entra con un administrador configurado en Firebase: demuestra que aparece Disponibilidad y que la ruta `/admin` se protege por rol.
5. Cambia ES/EN y recarga. Explica cómo se guarda la preferencia en `localStorage`.
6. Abre Redux DevTools y muestra `submitOrder/pending` y `fulfilled`, y una acción `searchOrders`.
7. Explica `React.lazy` y `Suspense`, y muestra la carga de chunks desde Network.
8. Ejecuta `npm run test`, enseña los tests y luego `npm run build`.
9. Señala `ErrorBoundary` y explica su alcance: captura errores de renderizado, mientras los fallos asíncronos se tratan por los thunks de Redux y mensajes de estado.
10. Enseña `firebase-rules.json`: cada usuario accede solo a `pedidos/{uid}` y no puede darse el rol admin.

**Nota:** el stock mostrado es una simulación local y se reinicia al recargar; los pedidos sí se guardan en Firebase. No afirmes que el stock es persistente.
