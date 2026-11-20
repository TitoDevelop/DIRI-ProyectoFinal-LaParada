# La Parada — Proyecto final DIRI

**Alumno:** José Luis Mas García  
**Asignatura:** Desarrollo de Interfaces Ricos para Internet

Plataforma de pedidos para recoger, con carta pública, sesión de usuario, pedidos privados y zona de administración. **No es un CRUD genérico**: el flujo principal consiste en elegir comida, reservar y gestionar la recogida.

## Ejecutar

```bash
npm install
npm run test
npm run build
npm run dev
```

> La versión se ha generado a partir del último ZIP de AC 9.1 suministrado. La instalación, compilación y tests deben comprobarse en tu equipo: aquí no se pudo acceder a npm para instalar React Router.

## Firebase

- La configuración pública de la app está en `.env.production` para GitHub Pages. Puedes copiarla a `.env.local` para trabajar en local.
- Activa Email/Password en Firebase Authentication.
- Publica las reglas del archivo `firebase-rules.json` en Realtime Database (incluyen el índice `foodId` para las búsquedas y roles de lectura restringida).
- El administrador recibe `roles/{uid}/admin = true` desde Firebase Console, nunca desde la app pública. El campo debe ser booleano.
- Para acceder desde Pages, revisa en Authentication los dominios autorizados: `titodevelop.github.io`.
- Los pedidos se almacenan en `pedidos/{uid}/{id}` y Firebase impide leer pedidos ajenos.

## Rutas (se usa HashRouter para GitHub Pages)

- `#/` Inicio y carta, con acceso a login.
- `#/carta` Carta pública.
- `#/acceso` Registro e inicio de sesión.
- `#/producto/:id` Formulario de pedido, protegido.
- `#/mis-pedidos` Mis pedidos, búsqueda por producto en Firebase, edición y cancelación; protegida.
- `#/admin` Disponibilidad, exclusiva para administradores.
- `#/ayuda` Información del flujo.
- Cualquier otra ruta devuelve 404.

## Entrega y defensa

El cuestionario de Moodle sustituye a la memoria: **repositorio público, URL de producción y explicación por requisito y archivos concretos**. Encontrarás textos de apoyo en `ENTREGA_MOODLE.md` y una guía de defensa en `GUIA_DEFENSA.md`. Verifica cada funcionalidad realmente antes de entregar.

## Publicación

Crea el repositorio público **`DIRI-ProyectoFinal-LaParada`** y sube el contenido de este ZIP (sin `.git` ni `node_modules`). El archivo `vite.config.ts` ya contiene el `base` de ese repositorio. En Settings → Pages selecciona **GitHub Actions**. El workflow de `.github/workflows/deploy.yml` publicará cuando tests y build pasen correctamente.

URL prevista (solo tras deploy correcto): `https://titodevelop.github.io/DIRI-ProyectoFinal-LaParada/`

Las variables de Firebase incluidas son de configuración pública web, no claves de administrador ni contraseñas.
