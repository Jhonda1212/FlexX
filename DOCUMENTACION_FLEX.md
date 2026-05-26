# DOCUMENTACION FLEX

## 1. Que es FLEX

FLEX es una aplicacion web para una discoteca tematica de jazz y live sessions. Su objetivo es centralizar la experiencia del cliente y la operativa interna del local en una sola plataforma.

Funcionalmente, FLEX permite:

- Que usuarios vean eventos de jazz, soul, blues y sesiones en vivo.
- Que usuarios accedan a sus entradas mediante QR.
- Que usuarios pidan canciones.
- Que usuarios se apunten a una cola para cantar o tocar instrumentos en el escenario.
- Que usuarios gestionen salas VIP privadas con acceso compartido.
- Que el equipo de guardias valide entradas QR y accesos VIP.
- Que el equipo de storage/guardarropa registre prendas, genere tokens/QR y marque entregas.
- Que administradores gestionen eventos, entradas, VIP, canciones, cola, staff y pagos.
- Que Stripe y Supabase sirvan como base para pagos, auth, base de datos, RLS y funciones backend.

El proyecto esta en una fase funcional de prototipo avanzado: compila, tiene rutas completas y algunos flujos operativos con Supabase o fallback mock, pero todavia hay paneles que son placeholders y varias integraciones necesitan endurecimiento para produccion.

## 2. Arquitectura general

### Frontend

El frontend esta construido con:

- **Next.js App Router**: las paginas viven en `frontend/app`.
- **React**: componentes interactivos con estado local.
- **TypeScript**: tipado de componentes, datos y helpers.
- **Tailwind CSS v4**: estilos globales y clases utilitarias.
- **lucide-react**: iconos del sistema.
- **qrcode.react**: renderizado de codigos QR en el cliente.

### Backend y datos

El backend previsto usa:

- **Supabase Auth** para registro e inicio de sesion.
- **Postgres/Supabase Database** con migracion SQL en `supabase/migrations`.
- **RLS** para proteger datos por usuario y por rol.
- **Supabase Edge Functions** para validacion QR, Stripe checkout y webhook.
- **Storage bucket** `flex-assets` preparado en la migracion.

### Estado local y mock

El proyecto incluye fallback mock en `frontend/lib/mock-store.ts`. Este usa `localStorage` para tickets demo, cola, canciones, storage, access logs y rol temporal. Sirve para poder probar la UI aunque Supabase no este funcionando.

### PWA

Existe manifest PWA en `frontend/app/manifest.ts`. Define nombre, `start_url`, modo standalone, colores e icono SVG. Falta service worker avanzado/offline si se quiere una PWA completa.

### Stripe

Stripe esta preparado mediante Edge Functions:

- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

La UI aun no llama directamente al checkout. El flujo backend esta diseñado para crear ordenes, enviar al checkout, recibir webhook y generar tickets o accesos VIP.

## 3. Estructura de carpetas

### Raiz del proyecto

- `frontend/`: aplicacion Next.js.
- `supabase/`: configuracion, migraciones y Edge Functions.
- `docs/`: documentacion previa sobre base de datos, RLS, Stripe, QR, realtime, PWA y despliegue.
- `diseno-jhonda/`: imagenes/mockups visuales de referencia.
- `.env.local`: variables locales en raiz. Tambien existe `.env.local` dentro de `frontend`.

### `frontend/app/`

Contiene las rutas de Next.js App Router:

- `page.tsx`: landing.
- `layout.tsx`: layout global.
- `globals.css`: estilos globales.
- `manifest.ts`: manifest PWA.
- Subcarpetas como `app/`, `guard/`, `storage/`, `admin/`, `login/`, `register/`.

### `frontend/components/`

Componentes reutilizables:

- `auth/`: login/register y proteccion temporal por rol.
- `guard/`: panel de validacion QR.
- `layout/`: shell de navegacion para usuario, staff y admin.
- `ui/`: botones, cards, metric cards, logo, status pills y paginas simples.

### `frontend/lib/`

Logica compartida:

- `supabase.ts`: crea cliente Supabase del navegador.
- `flex-actions.ts`: acciones de app para canciones, cola, storage y QR.
- `mock-store.ts`: almacenamiento local demo.
- `demo-data.ts`: datos estaticos para dashboards.
- `types.ts`: tipos comunes como roles, QR status, nav items y metricas.

### `frontend/public/`

Assets publicos:

- `icon.svg`
- imagenes de jazz, escenario y VIP en `public/images`.

### `supabase/`

- `config.toml`: configuracion local Supabase.
- `migrations/20260519140000_initial_flex_schema.sql`: schema completo, enums, tablas, funciones, triggers, RLS y bucket.
- `functions/validate-qr`: funcion Edge para validar QR.
- `functions/create-checkout-session`: funcion Edge para crear checkout Stripe.
- `functions/stripe-webhook`: webhook Stripe.
- `functions/_shared`: helpers compartidos CORS y cliente admin.

### Carpetas que no existen actualmente

- No hay carpeta `hooks/`.
- No hay carpeta `styles/` separada; los estilos estan en `frontend/app/globals.css`.
- No hay carpeta `types/` separada; los tipos estan en `frontend/lib/types.ts`.
- No hay `middleware.ts` actualmente.

## 4. Rutas del proyecto

Todas las rutas solicitadas existen y compilan.

### Usuario

- `/`: landing inicial de FLEX con acceso a login y registro.
- `/login`: formulario de inicio de sesion con Supabase Auth.
- `/register`: formulario de registro con Supabase Auth y `full_name`.
- `/app`: dashboard de usuario con proxima live session, accesos rapidos, eventos, entrada y VIP.
- `/app/events`: lista de eventos publicados leidos desde `events`.
- `/app/song-request`: formulario para pedir cancion.
- `/app/my-turn`: formulario para apuntarse a la cola de escenario.
- `/app/tickets`: vista de entradas QR demo, estado valido/usado/expirado y token.
- `/app/vip`: lista de salas VIP activas leidas desde `club_zones` y enlace para compartir acceso.
- `/app/vip/[roomId]/share`: pagina dinamica para compartir QR/enlace de sala privada.
- `/app/profile`: placeholder de perfil.
- `/app/notifications`: placeholder de notificaciones.

### Guardias

- `/guard`: dashboard de seguridad con metricas, accesos recientes y accesos a escaner/reportes.
- `/guard/scan`: validador QR.
- `/guard/tickets`: placeholder/lista simple para control de entradas.
- `/guard/guests`: placeholder/lista simple para invitados VIP.
- `/guard/alerts`: placeholder/lista simple para alertas.
- `/guard/reports`: placeholder/lista simple para reportes de accesos.

### Storage

- `/storage`: dashboard de guardarropa.
- `/storage/new`: formulario para registrar prenda y generar token QR.
- `/storage/scan`: validador QR reutilizado para storage.
- `/storage/active`: lista local de prendas activas y boton para marcar entregada.
- `/storage/history`: placeholder/lista simple para historial.

### Admin

- `/admin`: dashboard general admin.
- `/admin/events`: actualmente reutiliza dashboard admin.
- `/admin/tickets`: actualmente reutiliza dashboard admin.
- `/admin/vip`: actualmente reutiliza dashboard admin.
- `/admin/songs`: actualmente reutiliza dashboard admin.
- `/admin/queue`: actualmente reutiliza dashboard admin.
- `/admin/staff`: actualmente reutiliza dashboard admin.
- `/admin/payments`: actualmente reutiliza dashboard admin.

## 5. Roles del sistema

### `user`

Cliente normal. Puede ver eventos, entradas, QR, pedir canciones, apuntarse al escenario, gestionar perfil/notificaciones y acceder a VIP.

### `guard`

Personal de puerta. Puede acceder al panel de guardia, validar QR, revisar entradas, invitados, alertas y reportes.

### `storage`

Encargado de guardarropa. Puede registrar prendas, escanear QR de storage, ver prendas activas y marcar entregas.

### `dj`

Rol definido en base de datos para gestionar canciones y cola de escenario. En la UI todavia no existe panel `/dj`; sus funciones estan contempladas en RLS y admin.

### `admin`

Administrador. Puede acceder a todo. En mock local, `RoleGate` permite que admin entre tambien a paneles user/guard/storage. En base de datos, las funciones `is_admin()` e `is_staff()` permiten permisos amplios.

## 6. Base de datos

La migracion principal define enums, tablas, triggers, funciones y politicas RLS.

### `profiles`

Perfil publico/privado del usuario autenticado.

Campos principales:

- `id`: UUID igual a `auth.users.id`.
- `full_name`, `avatar_url`, `phone`.
- `created_at`, `updated_at`.

Relaciones:

- Referenciado por `staff_profiles`, `orders`, `tickets`, `song_requests`, `live_session_queue`, `storage_items`, `notifications`.

### `staff_profiles`

Define usuarios que son staff.

Campos:

- `user_id`: referencia a `profiles`.
- `role`: enum `guard`, `storage`, `dj`, `admin`.
- `display_name`.
- `active`.

Relaciones:

- Usado por RLS y por `access_logs.staff_id`.

### `events`

Eventos de la discoteca.

Campos:

- `title`, `description`.
- `starts_at`, `ends_at`.
- `capacity`.
- `ticket_price_cents`.
- `is_published`.

Relaciones:

- Referenciado por `tickets`, `order_items`, `private_room_access`, `song_requests`, `live_session_queue`.

### `club_zones`

Zonas del local: pista, escenario, VIP, privada o storage.

Campos:

- `name`.
- `type`: `main_floor`, `stage`, `vip_room`, `private_room`, `storage`.
- `capacity`.
- `vip_price_cents`.
- `active`.

Regla importante:

- Si `type = private_room`, `capacity <= 10`.

Relaciones:

- Referenciado por `order_items` y `private_room_access`.

### `orders`

Ordenes de pago.

Campos:

- `user_id`.
- `status`: `pending`, `paid`, `failed`, `refunded`.
- `amount_total_cents`, `currency`.
- IDs Stripe.
- `metadata`.

Relaciones:

- Tiene `order_items`.
- Puede generar `tickets` o `private_room_access`.

### `order_items`

Lineas de una orden.

Campos:

- `order_id`.
- `item_type`: `ticket` o `vip_reservation`.
- `event_id`, `zone_id`.
- `quantity`.
- `unit_amount_cents`.

Relaciones:

- Pertenece a `orders`.
- Puede apuntar a `events` y `club_zones`.

### `tickets`

Entradas QR.

Campos:

- `user_id`.
- `event_id`.
- `order_id`.
- `qr_token`: token unico generado con `secure_token()`.
- `status`: `active`, `used`, `expired`, `cancelled`.
- `expires_at`, `used_at`.

Relaciones:

- Pertenece a usuario y evento.
- Puede relacionarse con orden.
- Puede aparecer en `access_logs`.

### `private_room_access`

Acceso privado a una sala VIP.

Campos:

- `user_id`.
- `event_id`.
- `zone_id`.
- `order_id`.
- `qr_token`.
- `active`.
- `max_guests`: maximo 10.
- `expires_at`.

Relaciones:

- Pertenece a usuario y zona.
- Tiene muchos `private_room_guests`.
- Puede aparecer en `access_logs`.

### `private_room_guests`

Invitados que han usado un acceso privado.

Campos:

- `access_id`.
- `guest_name`, `guest_email`.
- `used_at`.

Reglas:

- Trigger `enforce_private_room_guest_limit()` impide superar `max_guests`.
- Tambien impide usar accesos inactivos.

### `song_requests`

Canciones pedidas por usuarios.

Campos:

- `user_id`.
- `event_id`.
- `title`, `artist`, `dedication`.
- `status`: `pending`, `approved`, `playing`, `played`, `rejected`.

Relaciones:

- Pertenece a usuario y opcionalmente a evento.
- DJ/admin pueden gestionarlas por RLS.

### `live_session_queue`

Cola de personas que quieren cantar o tocar.

Campos:

- `user_id`.
- `event_id`.
- `performer_name`.
- `instrument`.
- `position`.
- `status`: `waiting`, `called`, `done`, `cancelled`.

Relaciones:

- Pertenece a usuario y opcionalmente a evento.
- DJ/admin pueden gestionarla.

### `storage_items`

Prendas del guardarropa.

Campos:

- `user_id`.
- `staff_id`.
- `ticket_id`.
- `storage_number`.
- `item_description`.
- `qr_token`.
- `status`: `active`, `delivered`, `lost`.
- `delivered_at`.

Relaciones:

- Puede pertenecer a usuario, staff y ticket.
- Puede aparecer en `access_logs`.

### `access_logs`

Registro de validaciones QR.

Campos:

- `staff_id`.
- `ticket_id`.
- `private_room_access_id`.
- `storage_item_id`.
- `qr_token`.
- `result`: `valid`, `used`, `expired`, `invalid`, `full`, `inactive`.
- `reason`.

Uso:

- Auditoria de accesos y validaciones.

### `notifications`

Notificaciones para usuarios.

Campos:

- `user_id`.
- `type`: `ticket`, `vip`, `song`, `queue`, `storage`, `system`.
- `title`, `body`.
- `read_at`.

Relaciones:

- Pertenece a usuario.

## 7. Flujos principales

### Flujo de usuario

1. Usuario entra en `/register`.
2. Se registra con email, password y nombre.
3. Supabase Auth crea usuario.
4. Trigger `create_profile_for_new_user()` crea fila en `profiles`.
5. Usuario entra en `/login` y accede a `/app`.
6. Ve eventos reales publicados en `/app/events`.
7. Puede ver entradas QR en `/app/tickets`.
8. Puede pedir una cancion en `/app/song-request`.
9. Puede apuntarse a cantar/tocar en `/app/my-turn`.
10. Puede entrar a `/app/vip`, elegir sala y compartir QR desde `/app/vip/[roomId]/share`.
11. Compra de entrada/VIP esta preparada con Stripe, pero aun no conectada desde botones de UI.

### Flujo de guardia

1. Guardia entra a `/guard`.
2. Abre `/guard/scan`.
3. Pega o escanea token QR.
4. `QrValidationPanel` llama a `validateQrToken()`.
5. Si hay Supabase URL y anon key, llama a Edge Function `validate-qr`.
6. La Edge Function ejecuta RPC `validate_qr_token`.
7. Si es valido, registra `access_logs`.
8. Si es ticket valido, marca ticket como `used`.
9. Si es sala privada valida, inserta invitado en `private_room_guests`.
10. La UI muestra acceso valido o denegado.

### Flujo de storage

1. Encargado entra a `/storage`.
2. Abre `/storage/new`.
3. Registra numero de ticket, tipo de prenda, descripcion y numero storage.
4. `createStorageItem()` intenta insertar en `storage_items`.
5. Si Supabase no esta disponible, crea item en localStorage.
6. Se genera o recupera `qr_token`.
7. En `/storage/active` se ven prendas locales activas.
8. Al entregar, se marca como `delivered` y el boton queda deshabilitado.

### Flujo DJ/escenario

Previsto por base de datos y RLS:

1. DJ ve `song_requests` pendientes.
2. Acepta o rechaza canciones.
3. Marca una cancion como `playing`.
4. Marca cancion como `played`.
5. Ve `live_session_queue`.
6. Llama a artistas por posicion.
7. Marca turnos como `called`, `done` o `cancelled`.

Estado actual:

- No hay panel `/dj`.
- Admin tiene rutas `/admin/songs` y `/admin/queue`, pero actualmente reutilizan dashboard admin.

### Flujo admin

1. Admin entra a `/admin`.
2. Ve dashboard con metricas demo.
3. Puede navegar a eventos, entradas, VIP, canciones, cola, staff y pagos.
4. En base de datos, admin puede gestionar tablas principales por RLS.
5. En UI, las rutas admin existen pero la mayoria aun no tienen CRUD real.

## 8. QR

### Como se genera

En base de datos, `qr_token` se genera con la funcion:

```sql
public.secure_token()
```

Usa `gen_random_bytes(32)` y codificacion `base64url`.

Tablas con QR:

- `tickets.qr_token`
- `private_room_access.qr_token`
- `storage_items.qr_token`

En mock local:

- Tickets demo: `FLEX-DEMO-VALID`, `FLEX-DEMO-USED`.
- Storage: `FLEX-STORAGE-${crypto.randomUUID()}`.
- VIP share usa URL demo con `demo_private_room_token`.

### Donde se guarda

- Entradas: `tickets`.
- Salas privadas: `private_room_access`.
- Storage: `storage_items`.

### Como se valida

La UI llama a `validateQrToken(token)` en `frontend/lib/flex-actions.ts`.

Ese helper:

1. Intenta llamar a `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-qr`.
2. Si falla o no hay Supabase, usa `validateMockTicket(token)`.

La Edge Function:

1. Recibe `token`.
2. Ejecuta RPC `validate_qr_token`.
3. Inserta `access_logs`.
4. Si ticket valido, marca ticket como usado.
5. Si sala privada valida, inserta invitado.

### Resultados posibles

- `valid`: acceso permitido.
- `used`: entrada ya usada o prenda ya entregada.
- `expired`: entrada o acceso expirado.
- `invalid`: token no reconocido.
- `full`: sala privada llena.
- `inactive`: ticket/acceso no activo.

## 9. Salas VIP

El concepto de producto contempla salas privadas con aforo limitado. En la UI actual aparecen:

- `Sala Negra`
- `Sala Roja`
- `Sala Dorada`

Estas tres salas coinciden con las zonas oficiales sembradas en la migracion incremental de zonas reales de FLEX.

Reglas funcionales:

- Maximo 10 personas.
- Acceso con QR compartido.
- Contador visible en pagina de compartir.
- Botones para copiar enlace, compartir QR y simular invitado.
- Si `guestCount >= 10`, se deshabilitan acciones y aparece "Sala llena".

En base de datos:

- `club_zones` limita salas privadas a capacidad <= 10.
- `private_room_access.max_guests` limita entre 1 y 10.
- Trigger impide insertar mas invitados de los permitidos.
- `active` permite desactivar acceso compartido.

## 10. Storage

Storage resuelve el guardarropa del local: prendas, bolsos o chaquetas se registran con un numero y un QR/token para retirada.

### Para usuario

El usuario podria asociar su prenda a una entrada o cuenta. La DB permite `user_id` y `ticket_id`.

### Para encargado

El encargado:

1. Registra prenda.
2. Asigna numero storage.
3. Genera token/QR.
4. Busca o escanea token al entregar.
5. Marca como entregada.

### Estados

En base de datos:

- `active`: prenda guardada.
- `delivered`: prenda entregada.
- `lost`: prenda perdida.

En mock frontend:

- `stored`: guardada.
- `delivered`: entregada.

Hay una diferencia de nombres entre mock (`stored`) y DB (`active`) que conviene unificar en una fase posterior.

## 11. Seguridad

### Auth

El login y registro usan Supabase Auth desde `AuthForm`.

### Roles

Los roles reales estan en `staff_profiles.role`:

- `guard`
- `storage`
- `dj`
- `admin`

El frontend usa `RoleGate` con rol mock en `localStorage` para pruebas locales.

### RLS

La migracion activa RLS en todas las tablas principales. Ejemplos:

- Usuarios solo leen/actualizan su perfil.
- Usuarios solo leen sus ordenes, tickets, canciones, cola y notificaciones.
- Guardias pueden leer tickets/accesos necesarios.
- Storage staff puede gestionar storage.
- DJ puede gestionar canciones y cola.
- Admin puede gestionar casi todo.

### Proteccion de rutas

Estado actual:

- Proteccion client-side con `RoleGate`.
- No existe `middleware.ts`.

Mejora necesaria:

- Crear middleware server-side con Supabase Auth.
- Consultar rol real del usuario.
- Redirigir si intenta entrar a `/admin`, `/guard` o `/storage` sin permisos.

### Por que un usuario no deberia ver datos de otros

En produccion, RLS impide acceder a filas donde `user_id != auth.uid()`. Esto aplica a perfiles, ordenes, tickets, canciones, cola y notificaciones. El frontend todavia debe dejar de depender del mock para que esta seguridad sea efectiva de extremo a extremo.

## 12. Stripe

Stripe esta preparado, no conectado completamente en UI.

### Checkout

La funcion `create-checkout-session`:

1. Recibe `userId`, `itemType`, `eventId`, `zoneId`, cantidad y URLs.
2. Crea una orden en `orders` con estado `pending`.
3. Crea una sesion Stripe Checkout.
4. Guarda `stripe_checkout_session_id`.
5. Inserta `order_items`.
6. Devuelve `checkoutUrl`.

### Webhook

La funcion `stripe-webhook`:

1. Verifica firma de Stripe con `STRIPE_WEBHOOK_SECRET`.
2. Procesa `checkout.session.completed`.
3. Marca la orden como `paid`.
4. Guarda `stripe_payment_intent_id`.
5. Si era entrada, inserta en `tickets`.
6. Si era VIP, inserta en `private_room_access`.

### Pendiente

- Botones reales de compra en UI.
- Validar que `userId` venga de JWT, no confiado desde body.
- Validar stock/capacidad antes de cobrar.
- Manejar errores/idempotencia de webhook.

## 13. Estado actual del proyecto

### Ya implementado

- Proyecto Next.js con TypeScript.
- Rutas de usuario, guardia, storage y admin.
- Layout responsive con navegacion.
- Auth UI con Supabase Auth.
- Cliente Supabase.
- Schema SQL completo con RLS.
- QR visual para entradas.
- Validacion QR mediante Edge Function o mock.
- Storage mock con registro y entrega.
- Pedir cancion con Supabase o mock.
- Cola de escenario con Supabase o mock.
- Manifest PWA basico.
- Edge Functions para QR y Stripe.

### Parcialmente implementado

- Roles: mock en frontend, real en DB.
- Admin: rutas existen, CRUD pendiente.
- DJ: DB/RLS preparado, UI pendiente.
- VIP: UI demo y DB preparada, flujo de reserva/pago pendiente.
- Storage: flujo local funcional, integracion real parcial.
- Stripe: backend preparado, UI pendiente.

### Pendiente

- Middleware de proteccion real.
- Panel DJ.
- CRUD admin.
- Integrar pagos desde UI.
- Estados reales de loading/error/empty en pantallas admin.
- Realtime para cola, canciones y accesos.
- PWA completa con offline/cache si se requiere.
- Tests automatizados.

### Riesgos actuales

- Mock local puede ocultar errores Supabase.
- Rutas protegidas solo en cliente.
- Edge Function QR usa service role y debe validar staff real.
- Stripe checkout recibe `userId` desde request body.
- Algunas paginas son placeholders aunque la ruta exista.

## 14. Como probar el proyecto

### Instalar dependencias

Desde la raiz:

```bash
cd frontend
npm install
```

### Configurar `.env`

Crear o revisar `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:57321
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

Para Edge Functions/Stripe tambien hacen falta variables en Supabase:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Ejecutar localmente

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

### Verificar compilacion

```bash
npm run lint
npm run build
```

### Crear usuario

1. Ir a `/register`.
2. Crear cuenta.
3. Entrar a `/app`.

### Probar app usuario

- `/app/events`: ver eventos.
- `/app/tickets`: ver QR demo.
- `/app/song-request`: enviar cancion.
- `/app/my-turn`: apuntarse a cola.
- `/app/vip`: compartir acceso VIP.

### Probar guardia

1. Ir a `/guard`.
2. Si aparece bloqueo por rol, activar rol guardia.
3. Ir a `/guard/scan`.
4. Probar tokens:
   - `FLEX-DEMO-VALID`
   - `FLEX-DEMO-USED`
   - cualquier token invalido.

### Probar storage

1. Ir a `/storage`.
2. Activar rol storage si hace falta.
3. Ir a `/storage/new`.
4. Registrar prenda.
5. Ir a `/storage/active`.
6. Marcar como entregada.

### Probar admin

1. Ir a `/admin`.
2. Activar rol admin si hace falta.
3. Verificar navegacion a:
   - `/admin/events`
   - `/admin/tickets`
   - `/admin/vip`
   - `/admin/songs`
   - `/admin/queue`
   - `/admin/staff`
   - `/admin/payments`

## 15. Resumen para exposicion en clase

FLEX es una aplicacion web para una discoteca tematica de jazz y live sessions. La idea es que el cliente pueda vivir toda la experiencia desde el movil: ver eventos, entrar con QR, pedir canciones, apuntarse para cantar o tocar instrumentos, y compartir accesos a salas VIP privadas.

La app tambien tiene paneles para el personal del local. Los guardias pueden validar QR y registrar accesos, el equipo de storage puede registrar prendas y marcarlas como entregadas, y el admin tiene rutas para controlar eventos, entradas, VIP, canciones, staff y pagos.

Tecnicamente esta construida con Next.js, React, TypeScript y Tailwind. Supabase se usa para autenticacion, base de datos, roles, RLS y funciones backend. La base de datos incluye perfiles, staff, eventos, tickets, salas privadas, canciones, cola de escenario, guardarropa, pagos y notificaciones. Los QR se guardan como tokens unicos y se validan con una Edge Function que registra cada intento en `access_logs`.

Stripe ya esta preparado en backend: se puede crear una sesion de checkout y, cuando Stripe confirma el pago por webhook, se genera una entrada o acceso VIP. Actualmente el proyecto compila y tiene todas las rutas principales, pero algunas pantallas son placeholders y falta conectar completamente auth real, middleware, CRUD admin, panel DJ y pagos desde la UI.

## Fase actual: Ajuste de base de datos y zonas reales de FLEX

### 1. Que problema se detecto

La migracion principal de Supabase ya estaba bien planteada: incluia tablas, enums, funciones, triggers, RLS, policies y storage bucket. El problema era que `club_zones` todavia no representaba completamente el mapa real de la discoteca FLEX.

Antes de esta fase, la base permitia zonas genericas como `main_floor`, `stage`, `vip_room`, `private_room` y `storage`, pero faltaban tipos concretos para representar entrada, bar, banos y zonas lounge. Tambien faltaban campos utiles para mapear el local por planta, tema visual y descripcion operativa.

### 2. Que se agrego

Se creo una nueva migracion incremental:

```text
supabase/migrations/20260521103000_flex_seed_and_zone_fix.sql
```

Tras probar `supabase db reset`, esta fase necesito una correccion adicional por una regla de PostgreSQL: no se puede usar un valor nuevo de un enum dentro de la misma transaccion donde se agrego. Por eso los inserts se movieron a una segunda migracion:

```text
supabase/migrations/20260521103100_flex_seed_zones_and_demo_event.sql
```

No se borro ni se reescribio la migracion principal.

Nuevos valores agregados al enum `public.zone_type`:

- `entrance`
- `bar`
- `bathroom`
- `lounge`

Nuevas columnas agregadas a `public.club_zones`:

- `floor integer not null default 1`
- `color_theme text`
- `description text`

Zonas oficiales insertadas en `club_zones` por la segunda migracion:

- Planta 1: `Entrada Principal`, `Pista Principal`, `Escenario`, `Bar Principal`, `Banos`, `Guardarropa / Storage`.
- Planta 2: `Sala Negra`, `Sala Roja`, `Sala Dorada`.

Las tres salas privadas tienen `type = private_room`, `capacity = 10` y precios VIP de 12000, 15000 y 25000 centimos respectivamente.

Evento demo insertado en `events`:

- `Flex Live Sessions: Jazz Night`
- Descripcion: noche de jazz, improvisacion, canciones pedidas y artistas en vivo.
- Inicio: `now() + interval '1 day'`.
- Fin: seis horas despues del inicio.
- Capacidad: 600.
- Precio ticket: 1500 centimos.
- Publicado: `true`.

Tambien se ajusto `/app/vip` para mostrar las tres salas oficiales: Sala Negra, Sala Roja y Sala Dorada. En la fase posterior de conexion a Supabase, esta pantalla quedo leyendo `club_zones` reales.

### 3. Por que se hizo

Este ajuste permite representar mejor el mapa real de FLEX:

- Planta 1: entrada principal, pista, escenario, bar, banos y guardarropa.
- Planta 2: salas VIP privadas.
- Validacion QR en entrada.
- Gestion de guardarropa/storage.
- Live sessions en escenario.
- Salas privadas con limite estricto de 10 personas.

Tambien deja preparada la base para futuras pantallas de administracion donde se puedan gestionar zonas, capacidad, precios VIP, plantas y temas visuales.

### 4. Como queda conectado con la app

- `/app/vip` muestra las tres salas privadas oficiales leyendo `club_zones` y filtrando por `type in ('vip_room', 'private_room')`.
- `/app/vip/[roomId]/share` mantiene el flujo de QR compartido y contador de invitados.
- `/guard/scan` valida accesos QR mediante `validate-qr`, que puede validar tickets, salas privadas y storage.
- `/storage` representa la operativa de `Guardarropa / Storage`.
- `/admin` tiene rutas para gestionar zonas y eventos, aunque el CRUD real sigue pendiente.
- Las salas privadas se apoyan en `private_room_access` y `private_room_guests`.
- El limite de 10 personas queda reforzado por `club_zones.capacity`, `private_room_access.max_guests` y el trigger de limite de invitados.

### 5. Tablas afectadas

Tablas afectadas directamente:

- `club_zones`: recibe nuevas columnas y 9 zonas oficiales.
- `events`: recibe el evento demo publicado.

Objetos afectados indirectamente:

- `public.zone_type`: recibe nuevos valores.
- `private_room_access`: queda mejor conectado semanticamente con las zonas privadas sembradas.
- `private_room_guests`: sigue aplicando el limite de invitados por acceso privado.

### 6. Decisiones tecnicas

- Se uso una migracion incremental para conservar intacta la migracion principal.
- No se eliminaron tablas, columnas, policies ni datos existentes.
- Los nuevos valores de enum usan `alter type ... add value if not exists` en `20260521103000_flex_seed_and_zone_fix.sql`.
- Las columnas nuevas usan `add column if not exists`.
- Los inserts viven en `20260521103100_flex_seed_zones_and_demo_event.sql` para que PostgreSQL ya haya cerrado la transaccion del cambio de enum antes de usar `entrance`, `bar`, `bathroom` o `lounge`.
- Los inserts usan `where not exists` por `name` o por `title` para evitar duplicados sin crear un constraint unico nuevo.
- No se agrego `unique (name)` en `club_zones` porque podria fallar en bases que ya tengan duplicados historicos. La estrategia segura fue evitar duplicados en esta migracion.
- La migracion esta preparada para Supabase local y produccion.
- Correccion aplicada: PostgreSQL lanza `unsafe use of new value ... of enum type` si se agrega un valor de enum y se intenta usarlo antes de que termine la transaccion. Por eso esta fase quedo dividida en dos migraciones consecutivas.

### 7. Como probar

En local, si Supabase esta disponible:

```bash
supabase db reset
```

Despues abrir Supabase Studio y verificar:

- Que `club_zones` tenga 9 zonas oficiales.
- Que existan `Entrada Principal`, `Pista Principal`, `Escenario`, `Bar Principal`, `Banos`, `Guardarropa / Storage`, `Sala Negra`, `Sala Roja` y `Sala Dorada`.
- Que `Sala Negra`, `Sala Roja` y `Sala Dorada` tengan `capacity = 10`.
- Que las salas privadas tengan `type = private_room`.
- Que `floor` sea 1 para zonas de planta 1 y 2 para salas VIP.
- Que `color_theme` y `description` tengan valores.
- Que `events` tenga `Flex Live Sessions: Jazz Night` con `is_published = true`.

Verificar frontend:

```bash
cd frontend
npm run lint
npm run build
```

Tambien revisar manualmente:

- `/app/vip` muestra Sala Negra, Sala Roja y Sala Dorada.
- `/app/vip/1/share`, `/app/vip/2/share` y `/app/vip/3/share` abren la pantalla de compartir acceso.
- `/guard/scan` sigue validando tokens.
- `/storage` sigue mostrando el flujo de guardarropa.

### 8. Pendientes

- Crear reserva real de sala VIP desde `/app/vip` y generar `private_room_access`.
- Reemplazar mocks salvo cuando exista una bandera explicita como `NEXT_PUBLIC_ENABLE_MOCKS=true`.
- Proteger rutas con middleware real basado en Supabase Auth y `staff_profiles`.
- Endurecer `validate-qr` con JWT y rol real del staff.
- Conectar Stripe real desde la UI.
- Probar RLS con usuarios reales por rol.
- Crear CRUD admin real para zonas y eventos.
- Unificar el estado mock de storage (`stored`) con el estado real de DB (`active`).

## Fase actual: Conexion del frontend a Supabase real

### 1. Objetivo de la fase

Tras confirmar que `supabase db reset` aplica correctamente las migraciones, se conectaron las pantallas principales del frontend a Supabase real. El mock queda limitado a una bandera explicita:

```env
NEXT_PUBLIC_ENABLE_MOCKS=true
```

Con `NEXT_PUBLIC_ENABLE_MOCKS=false`, la app intenta usar Supabase y muestra errores visibles si una consulta, insert, update o Edge Function falla.

### 2. Pantallas conectadas

#### `/app/events`

Lee datos reales desde `events`.

Consulta:

- Tabla: `events`
- Filtro: `is_published = true`
- Orden: `starts_at asc`

Estados agregados:

- Cargando eventos.
- Error visible.
- Empty state cuando no hay eventos publicados.

#### `/app/vip`

Lee salas reales desde `club_zones`.

Consulta:

- Tabla: `club_zones`
- Filtro: `type in ('vip_room', 'private_room')`
- Filtro: `active = true`
- Orden: `vip_price_cents asc`

Campos usados:

- `id`
- `name`
- `capacity`
- `floor`
- `color_theme`
- `description`
- `vip_price_cents`

Estados agregados:

- Cargando salas VIP.
- Error visible.
- Empty state cuando no hay salas activas.

#### `/app/song-request`

Inserta canciones reales en `song_requests`.

Campos insertados:

- `user_id`
- `title`
- `artist`
- `dedication`

La accion exige usuario autenticado cuando los mocks estan desactivados. Si falla Supabase o RLS, la pantalla muestra el error.

#### `/app/my-turn`

Inserta turnos reales en `live_session_queue`.

Flujo:

1. Cuenta filas con `status = waiting`.
2. Calcula `position = count + 1`.
3. Inserta `user_id`, `performer_name`, `instrument` y `position`.

La pantalla muestra error si el usuario no esta autenticado o si RLS bloquea la operacion.

#### `/app/tickets`

Lee entradas reales desde `tickets`.

Consulta:

- Tabla: `tickets`
- Filtro: `user_id = auth.uid()`
- Join: `events(title)`
- Orden: `created_at desc`

Mapeo de estados:

- `active` en DB se muestra como `valid` en UI.
- `used`, `expired`, `cancelled` se muestran directamente.

Estados agregados:

- Cargando entradas.
- Error visible.
- Empty state cuando el usuario no tiene tickets.

#### `/storage/active`

Lee prendas reales desde `storage_items`.

Consulta:

- Tabla: `storage_items`
- Filtro: `status in ('active', 'delivered')`
- Orden: `created_at desc`

Accion:

- Boton `Marcar entregada` hace `update` a `status = delivered` y asigna `delivered_at`.
- El update filtra tambien por `status = active` para evitar entregar dos veces la misma prenda.

Estados agregados:

- Cargando prendas.
- Error visible.
- Empty state.
- Estado de guardado por item.

#### `/guard/scan`

Sigue usando `validateQrToken()` desde `flex-actions`.

Con mocks desactivados, llama a:

```text
${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-qr
```

Esa Edge Function ejecuta la funcion de base de datos `validate_qr_token`, registra `access_logs` y aplica efectos secundarios como marcar tickets usados o insertar invitados de sala privada.

Si `NEXT_PUBLIC_ENABLE_MOCKS=true`, usa `validateMockTicket()` para demo local.

### 3. Archivos tecnicos afectados

- `frontend/lib/flex-actions.ts`: concentra lecturas y escrituras Supabase, control de mocks y helpers de datos.
- `frontend/app/app/events/page.tsx`: eventos reales.
- `frontend/app/app/vip/page.tsx`: salas VIP reales.
- `frontend/app/app/song-request/page.tsx`: errores reales de insert.
- `frontend/app/app/my-turn/page.tsx`: errores reales de cola.
- `frontend/app/app/tickets/page.tsx`: tickets reales.
- `frontend/app/storage/active/page.tsx`: storage real.
- `frontend/app/storage/new/page.tsx`: errores reales de registro.
- `frontend/.env.local` y `frontend/.env.example`: bandera `NEXT_PUBLIC_ENABLE_MOCKS=false`.

### 4. Tablas usadas en esta fase

- `events`
- `club_zones`
- `song_requests`
- `live_session_queue`
- `tickets`
- `storage_items`
- `access_logs` indirectamente mediante Edge Function.

### 5. Decisiones tecnicas

- No se eliminaron mocks; se dejaron detras de `NEXT_PUBLIC_ENABLE_MOCKS=true`.
- Con mocks desactivados, no hay fallback silencioso. Esto permite detectar problemas reales de RLS, auth, funciones o variables de entorno.
- Las pantallas muestran loading, error y empty states.
- `/app/vip` usa `type in ('vip_room', 'private_room')` para ser compatible con zonas anteriores y con las salas oficiales nuevas.
- `/guard/scan` mantiene la Edge Function porque el RPC por si solo no registra todos los efectos operativos; la Edge Function llama a `validate_qr_token` y centraliza access logs.

### 6. Pendientes tras esta fase

- Crear tickets reales desde UI mediante Stripe checkout.
- Crear accesos reales de `private_room_access` al reservar VIP.
- Proteger rutas con middleware real.
- Asociar storage a staff real (`staff_id`) cuando el usuario tenga rol storage.
- Crear panel DJ real para gestionar `song_requests` y `live_session_queue`.
- Endurecer `validate-qr` para obtener staff desde JWT y no confiar en datos opcionales enviados por cliente.

## Fase actual: Panel admin funcional

### 1. Que problema habia

Antes de esta fase, `/admin` era un dashboard base con metricas demo y las rutas `/admin/events`, `/admin/tickets`, `/admin/vip`, `/admin/songs`, `/admin/queue`, `/admin/staff` y `/admin/payments` reutilizaban la misma pantalla o eran placeholders. Esto permitia navegar sin 404, pero no permitia operar FLEX desde Supabase real.

### 2. Que se implemento

Se creo una capa de componentes reutilizables en:

```text
frontend/components/admin/AdminComponents.tsx
```

Componentes creados:

- `AdminPageHeader`
- `AdminStatCard`
- `AdminDataTable`
- `AdminEmptyState`
- `AdminErrorState`
- `AdminLoadingState`
- `AdminActionButton`
- `StatusBadge`

Tambien se creo:

```text
frontend/lib/admin-actions.ts
```

Este archivo centraliza:

- verificacion real de admin contra `staff_profiles`
- helper `requireAdmin()`
- formateo de centimos
- token parcialmente oculto
- conversion de fechas para inputs

### 3. Seguridad visible

Antes de leer o modificar datos, cada pagina admin llama a `requireAdmin()`. Esta funcion:

1. Obtiene el usuario actual con Supabase Auth.
2. Busca una fila activa en `staff_profiles`.
3. Exige `role = admin`.
4. Si no existe, muestra un error claro de acceso denegado.

Importante: esto mejora la seguridad visible del cliente, pero sigue pendiente crear `middleware.ts` server-side para bloquear rutas admin antes de renderizar la app. La seguridad final de datos depende tambien de RLS, que ya existe en Supabase.

### 4. Dashboard real `/admin`

`/admin` ahora muestra metricas reales desde Supabase:

- total de eventos
- eventos publicados
- total de tickets
- tickets activos
- canciones pendientes
- artistas esperando en cola
- prendas activas en storage
- ordenes pagadas
- ingresos estimados sumando `orders.status = paid`

Tablas usadas:

- `events`
- `tickets`
- `song_requests`
- `live_session_queue`
- `storage_items`
- `orders`

Tambien incluye accesos rapidos a eventos, VIP, canciones, cola, staff y pagos.

### Mejora visual de accesos rapidos

Problema detectado:

- La seccion "Accesos rapidos" del dashboard admin usaba botones pequenos, muy separados y con poca jerarquia visual. Desde lejos no quedaba clara la accion principal.

Cambio realizado:

- Se creo el componente `AdminQuickActionCard` en `frontend/components/admin/AdminQuickActionCard.tsx`.
- Se reemplazaron los botones pequenos por cards grandes, clickeables completas, con icono grande, titulo, descripcion e indicador "Abrir seccion".
- Se uso grid responsive: 3 columnas en desktop, 2 en tablet y 1 en mobile.
- Se mantuvo el estilo premium de FLEX con fondo oscuro, borde dorado suave, hover visible, ligera elevacion y mejor contraste.

Rutas enlazadas:

- `/admin/events`
- `/admin/vip`
- `/admin/songs`
- `/admin/queue`
- `/admin/staff`
- `/admin/payments`
- `/admin/tickets`

Mejora de UX:

- La card completa es clickeable.
- El cursor y el hover comunican interaccion.
- Cada acceso explica claramente para que sirve la seccion.
- La lectura es mas clara para uso operativo en cabina o backoffice.

### 5. Eventos `/admin/events`

Pagina real para gestionar `events`.

Funciones:

- listar eventos
- crear evento
- editar evento
- publicar
- despublicar
- cancelar evento de forma no destructiva, dejandolo no publicado

Campos del formulario:

- `title`
- `description`
- `starts_at`
- `ends_at`
- `capacity`
- `ticket_price_cents`
- `is_published`
- `cover_image_path`

Validaciones:

- `title` requerido
- `starts_at` requerido
- `capacity` requerido
- `ticket_price_cents` requerido

No se elimina ningun evento desde UI.

### 6. VIP y zonas `/admin/vip`

Pagina real para gestionar zonas VIP en `club_zones`.

Muestra:

- `name`
- `type`
- `floor`
- `capacity`
- `vip_price_cents`
- `color_theme`
- `active`
- `description`

Acciones:

- editar capacidad
- editar precio VIP
- activar/desactivar zona
- editar descripcion

Validacion:

- Si `type = private_room`, la capacidad no puede superar 10 personas.

La pagina filtra por:

```text
type in ('vip_room', 'private_room')
```

Esto mantiene compatibilidad con zonas antiguas y con las salas oficiales nuevas: Sala Negra, Sala Roja y Sala Dorada.

### 7. Canciones `/admin/songs`

Pagina real para gestionar `song_requests`.

Muestra:

- `title`
- `artist`
- `dedication`
- `status`
- `created_at`
- usuario relacionado con `profiles` si RLS permite leerlo

Filtros:

- `pending`
- `approved`
- `playing`
- `played`
- `rejected`

Acciones:

- aprobar: `status = approved`
- marcar sonando: `status = playing`
- marcar reproducida: `status = played`
- rechazar: `status = rejected`

### 8. Cola `/admin/queue`

Pagina real para gestionar `live_session_queue`.

Muestra:

- `performer_name`
- `instrument`
- `position`
- `status`
- `created_at`
- usuario relacionado con `profiles` si esta disponible

Orden visual:

- primero `waiting`
- luego `called`
- despues `done`
- despues `cancelled`
- dentro del mismo grupo, por `position asc`

Acciones:

- llamar artista: `status = called`
- marcar terminado: `status = done`
- cancelar turno: `status = cancelled`

### 9. Staff `/admin/staff`

Pagina real para gestionar `staff_profiles`.

Muestra:

- `display_name`
- `user_id`
- `role`
- `active`
- `created_at`
- perfil relacionado si esta disponible

Permite:

- agregar o actualizar staff por `user_id`
- asignar rol `guard`, `storage`, `dj` o `admin`
- activar/desactivar staff
- editar `display_name`

Decision tecnica:

- No se implemento busqueda por email desde cliente porque `auth.users` no debe exponerse directamente al navegador. Para buscar por email hace falta una funcion segura del servidor o Edge Function con service role y validacion admin.

### 10. Tickets `/admin/tickets`

Pagina real para consultar y operar `tickets`.

Muestra:

- `qr_token` parcialmente oculto
- `status`
- `event_id`
- `user_id`
- `expires_at`
- `used_at`
- `created_at`

Filtros:

- `active`
- `used`
- `expired`
- `cancelled`

Acciones:

- cancelar ticket: `status = cancelled`
- reactivar ticket: `status = active`
- marcar expirado: `status = expired`

No se permite editar `qr_token` manualmente.

### 11. Pagos `/admin/payments`

Pagina real de solo lectura para `orders`.

Muestra:

- `id`
- `user_id`
- `status`
- `amount_total_cents`
- `currency`
- `stripe_checkout_session_id`
- `stripe_payment_intent_id`
- `created_at`

Filtros:

- `pending`
- `paid`
- `failed`
- `refunded`

No se implementaron reembolsos en esta fase.

### 12. Validaciones agregadas

- Todas las paginas admin verifican admin real con `staff_profiles`.
- Todas las paginas tienen loading, error y empty states.
- VIP impide capacity mayor a 10 en `private_room`.
- Eventos valida campos requeridos.
- Tickets oculta parcialmente el QR y no permite editarlo.
- Staff trabaja por `user_id` manual para evitar exponer busqueda de auth por email en cliente.

### 13. Como probar el admin

1. Crear un usuario desde `/register`.
2. Asignarle rol admin en Supabase:

```sql
insert into public.staff_profiles (user_id, role, display_name, active)
select p.id, 'admin', coalesce(p.full_name, 'Admin FLEX'), true
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'tu-email@ejemplo.com'
on conflict (user_id) do update
set role = 'admin',
    display_name = excluded.display_name,
    active = true;
```

3. Iniciar sesion en la app.
4. Entrar a `/admin`.
5. Revisar metricas reales.
6. Entrar a `/admin/events` y crear o editar un evento.
7. Entrar a `/admin/vip` y editar precio/capacidad de Sala Negra, Sala Roja o Sala Dorada.
8. Enviar una cancion desde `/app/song-request` y aprobarla desde `/admin/songs`.
9. Unirse a cola desde `/app/my-turn` y llamarla desde `/admin/queue`.
10. Revisar staff en `/admin/staff` y asignar roles.
11. Revisar tickets en `/admin/tickets`.
12. Revisar ordenes en `/admin/payments`.

### 14. Pendientes tras esta fase

- Crear middleware server-side real para proteger `/admin` antes de renderizar.
- Crear busqueda segura de usuario por email mediante Edge Function.
- Conectar compra real con Stripe desde UI.
- Implementar reembolsos de pagos.
- Agregar logs de auditoria para acciones admin.
- Crear vistas admin con joins mas ricos para eventos, perfiles y ordenes cuando RLS este probado con usuarios reales.

## Fase actual: Auditoria funcional del panel admin

### 1. Rutas revisadas

Se revisaron las rutas admin reales:

- `/admin`
- `/admin/events`
- `/admin/vip`
- `/admin/songs`
- `/admin/queue`
- `/admin/staff`
- `/admin/tickets`
- `/admin/payments`

Tambien se verifico Supabase local con Docker. La base local responde y tiene datos minimos reales:

- `events = 1`
- `club_zones = 9`
- `active_admins = 1`

### 2. Resultado general

Todas las rutas admin usan Supabase real mediante `requireAdmin()` y no dependen de `NEXT_PUBLIC_ENABLE_MOCKS`. No se encontraron imports ni uso de mocks dentro de `frontend/app/admin`, `frontend/components/admin` o `frontend/lib/admin-actions.ts`.

Todas las rutas revisadas tienen:

- loading state
- error state
- empty state
- consultas a Supabase real
- errores visibles para el usuario
- verificacion de rol admin real desde `staff_profiles`

### 3. Seguridad revisada

Antes de consultar o mutar datos, las paginas admin llaman a `requireAdmin()`, que:

1. obtiene el usuario actual con Supabase Auth
2. consulta `staff_profiles`
3. exige `role = admin`
4. exige `active = true`

Correccion aplicada en esta auditoria:

- Se elimino `RoleGate` del layout de `/admin`. Antes el layout admin seguia envuelto en una proteccion mock por `localStorage`; eso podia bloquear a un admin real o crear confusion. Ahora el acceso visible depende de `requireAdmin()` en las paginas y no de `localStorage`.

Pendiente:

- Falta middleware server-side para bloquear `/admin` antes de renderizar. La proteccion actual es client-side mas RLS.

### 4. `/admin`

Funciona como dashboard real.

Tablas consultadas:

- `events`
- `tickets`
- `song_requests`
- `live_session_queue`
- `storage_items`
- `orders`

Metricas revisadas:

- total de eventos
- eventos publicados
- total de tickets
- tickets activos
- canciones pendientes
- artistas esperando
- prendas activas
- ordenes pagadas
- ingresos estimados de ordenes pagadas

Estado:

- Funciona.
- Usa datos reales.
- Tiene loading/error.
- Incluye accesos rapidos.

### 5. `/admin/events`

Funcionalidades revisadas:

- listar eventos
- crear evento
- editar evento
- publicar/despublicar
- cancelar como accion no destructiva, dejando `is_published = false`
- ver precio y capacidad

Correcciones aplicadas:

- Se agrego validacion `capacity > 0`.
- Se agrego validacion `ticket_price_cents >= 0`.

Pendiente:

- Validar que `ends_at` sea posterior a `starts_at`.
- Definir si "cancelar evento" necesita un campo real de estado, porque actualmente se modela como despublicar.

### 6. `/admin/vip`

Funcionalidades revisadas:

- muestra Sala Negra, Sala Roja y Sala Dorada desde `club_zones`
- muestra `name`, `type`, `floor`, `capacity`, `vip_price_cents`, `color_theme`, `active`, `description`
- permite editar capacidad
- permite editar precio VIP
- permite editar descripcion
- permite activar/desactivar sala

Correcciones aplicadas:

- Se agrego validacion `capacity > 0`.
- Se agrego validacion `vip_price_cents >= 0`.
- Se mantiene validacion `private_room capacity <= 10`.

Estado:

- Funciona con datos reales.
- No usa mocks.

### 7. `/admin/songs`

Funcionalidades revisadas:

- lista `song_requests`
- filtra por `pending`, `approved`, `playing`, `played`, `rejected`
- permite aprobar
- permite marcar como playing
- permite marcar como played
- permite rechazar
- intenta mostrar usuario via `profiles`

Estado:

- Funciona con Supabase real.
- Si RLS bloquea el join con `profiles`, el error se muestra en pantalla.

Pendiente:

- Crear un panel DJ separado o permisos especificos para DJ.

### 8. `/admin/queue`

Funcionalidades revisadas:

- lista `live_session_queue`
- ordena visualmente `waiting`, luego `called`, luego `done`, luego `cancelled`
- dentro de cada grupo ordena por `position`
- permite llamar artista
- permite marcar como done
- permite cancelar turno
- intenta mostrar usuario via `profiles`

Estado:

- Funciona con Supabase real.
- No usa mocks.

Pendiente:

- Recalcular posiciones si se cancela o termina un turno.
- Realtime para ver cola en vivo.

### 9. `/admin/staff`

Funcionalidades revisadas:

- lista `staff_profiles`
- permite crear/actualizar staff por `user_id`
- permite asignar roles `guard`, `storage`, `dj`, `admin`
- permite activar/desactivar staff
- permite editar `display_name`

Validaciones:

- `user_id` requerido.
- `display_name` requerido.
- roles limitados por select a valores permitidos.

Estado:

- Funciona con datos reales si RLS permite al admin gestionar staff.

Pendiente:

- Buscar usuarios por email requiere Edge Function segura con service role. No debe consultarse `auth.users` directamente desde cliente.

### 10. `/admin/tickets`

Funcionalidades revisadas:

- lista `tickets`
- filtra por `active`, `used`, `expired`, `cancelled`
- permite cancelar
- permite reactivar
- permite marcar expirado
- muestra `qr_token` parcialmente oculto
- no permite editar `qr_token`

Estado:

- Funciona con Supabase real.
- No usa mocks.

Pendiente:

- Mostrar nombre de evento y usuario con joins enriquecidos.

### 11. `/admin/payments`

Funcionalidades revisadas:

- lista `orders`
- filtra por `pending`, `paid`, `failed`, `refunded`
- muestra importe, moneda y referencias Stripe
- se mantiene solo lectura

Correccion aplicada:

- Se agrego lectura de `order_items(item_type, quantity, unit_amount_cents)` y se muestran items si existen.

Pendiente:

- Reembolsos.
- Vista detalle de orden.
- Auditoria de webhooks Stripe.

### 12. Bugs encontrados y corregidos

- `RoleGate` mock seguia envolviendo `/admin`. Corregido: el layout admin ya no depende de `localStorage`.
- `/admin/events` no validaba explicitamente `capacity > 0`. Corregido.
- `/admin/events` no validaba explicitamente `ticket_price_cents >= 0`. Corregido.
- `/admin/vip` no validaba explicitamente `capacity > 0`. Corregido.
- `/admin/vip` no validaba explicitamente `vip_price_cents >= 0`. Corregido.
- `/admin/payments` no mostraba `order_items`. Corregido.

### 13. Bugs o riesgos pendientes

- Falta middleware server-side real para `/admin`.
- Algunas relaciones con `profiles` pueden depender de RLS y deben probarse con usuarios reales.
- `Cancelar evento` actualmente equivale a despublicar; no existe campo `event_status`.
- No hay logs de auditoria admin.
- No hay reembolsos ni acciones Stripe admin.
- No hay Playwright/E2E automatizado para simular clicks reales en navegador.

### 14. Como probar cada modulo admin

1. Iniciar Supabase local.
2. Confirmar que existe usuario admin activo en `staff_profiles`.
3. Iniciar sesion en `/login`.
4. Entrar a `/admin` y revisar metricas.
5. Entrar a `/admin/events`, crear evento, editarlo, publicar y despublicar.
6. Probar que capacidad `0` y precio negativo muestran error.
7. Entrar a `/admin/vip`, editar Sala Negra, Sala Roja o Sala Dorada.
8. Probar capacidad `11` en una `private_room`; debe mostrar error.
9. Enviar una cancion desde `/app/song-request` y gestionarla desde `/admin/songs`.
10. Crear un turno desde `/app/my-turn` y gestionarlo desde `/admin/queue`.
11. Entrar a `/admin/staff`, agregar staff por `user_id`, cambiar rol y activar/desactivar.
12. Entrar a `/admin/tickets`, filtrar por estado y cambiar estado de un ticket.
13. Entrar a `/admin/payments`, filtrar ordenes y verificar items si existen.

### 15. Verificacion tecnica

Comandos ejecutados tras la auditoria:

```bash
npm run lint
npm run build
```

Ambos comandos pasan correctamente.

## Fase actual: Base de datos para Hoy en FLEX

### 1. Decision de producto

"Hoy en FLEX" se plantea como un feed oficial en vivo, no como un chat libre entre usuarios.

La decision reduce riesgos operativos y de moderacion:

- evita spam, insultos o contenido inapropiado en una discoteca en vivo
- evita que usuarios publiquen informacion falsa sobre accesos, promociones o seguridad
- mantiene la comunicacion bajo control de admin/staff
- permite destacar avisos importantes sin ruido
- mejora la experiencia del usuario con informacion clara del dia

El feed oficial resuelve una necesidad concreta: comunicar que esta pasando hoy en FLEX, incluyendo live sessions, promociones, actividades, avisos de seguridad, VIP, escenario y storage.

### 2. Beneficios para FLEX

- Admin y staff pueden publicar novedades del dia desde una fuente oficial.
- Usuarios pueden ver promociones y actividades sin depender de redes externas.
- Guardias, storage y escenario pueden comunicar avisos operativos.
- Se puede fijar contenido importante con `is_pinned`.
- Se puede programar visibilidad con `starts_at` y `ends_at`.
- Se prepara una futura pantalla `/app/today` para usuarios y `/admin/feed` para gestion interna.

### 3. Migracion creada

Archivo:

```text
supabase/migrations/20260521103200_create_daily_feed_posts.sql
```

La migracion no borra tablas ni modifica datos existentes de forma destructiva.

### 4. Enums creados

Enum `public.feed_post_type`:

- `event`
- `promotion`
- `activity`
- `announcement`
- `vip`
- `stage`
- `security`
- `storage`

Enum `public.feed_priority`:

- `low`
- `normal`
- `high`
- `urgent`

Se crean con bloques `do $$ ... $$` comprobando `pg_type`, para evitar errores si ya existen.

### 5. Tabla creada: `daily_feed_posts`

Campos:

- `id`: identificador UUID.
- `event_id`: relacion opcional con `events`.
- `zone_id`: relacion opcional con `club_zones`.
- `created_by`: perfil que crea el post.
- `title`: titulo obligatorio.
- `body`: contenido del aviso.
- `type`: tipo de post, por defecto `announcement`.
- `priority`: prioridad, por defecto `normal`.
- `starts_at`: fecha desde la que puede aparecer.
- `ends_at`: fecha hasta la que puede aparecer.
- `cta_label`: texto opcional de llamada a la accion.
- `cta_url`: URL opcional de llamada a la accion.
- `is_published`: controla publicacion.
- `is_pinned`: permite fijar avisos importantes.
- `created_at`: fecha de creacion.
- `updated_at`: fecha de actualizacion.

Tambien se agrego trigger `daily_feed_posts_updated_at` usando `public.set_updated_at()`.

### 6. Indices creados

- `daily_feed_posts_is_published_idx`
- `daily_feed_posts_starts_at_idx`
- `daily_feed_posts_event_id_idx`
- `daily_feed_posts_zone_id_idx`
- `daily_feed_posts_type_idx`
- `daily_feed_posts_is_pinned_idx`

Estos indices preparan consultas por posts publicados, programacion, evento, zona, tipo y contenido fijado.

### 7. RLS y policies

RLS queda activado:

```sql
alter table public.daily_feed_posts enable row level security;
```

Policies:

- Usuarios autenticados pueden leer posts publicados si:
  - `is_published = true`
  - `starts_at` es null o `starts_at <= now()`
  - `ends_at` es null o `ends_at >= now()`
- Staff/admin pueden leer todos los posts.
- Staff/admin pueden insertar posts.
- Staff/admin pueden actualizar posts.
- Staff/admin pueden eliminar posts.

La migracion reutiliza la estructura de roles existente mediante:

```sql
public.current_staff_role() is not null
```

Esto cubre `guard`, `storage`, `dj` y `admin` activos en `staff_profiles`.

### 8. Seed inicial

Posts demo insertados con `where not exists` para evitar duplicados:

- `Live Jazz Session`
  - tipo: `event`
  - prioridad: `high`
  - publicado: true
  - fijado: true
- `2x1 en cocteles`
  - tipo: `promotion`
  - prioridad: `normal`
  - publicado: true
- `Open Mic`
  - tipo: `stage`
  - prioridad: `normal`
  - publicado: true
- `Ultimos cupos VIP`
  - tipo: `vip`
  - prioridad: `high`
  - publicado: true

En SQL se usaron escapes Unicode para conservar titulos con acentos sin depender de la codificacion del archivo.

### 9. Como funcionara en fases posteriores

Pantalla futura `/app/today`:

- leera `daily_feed_posts`
- mostrara posts publicados y vigentes
- ordenara primero fijados, luego prioridad y hora
- permitira ver promociones, actividades, avisos VIP, escenario, seguridad y storage

Pantalla futura `/admin/feed`:

- permitira crear posts
- editar posts
- publicar/despublicar
- fijar/desfijar
- programar `starts_at` y `ends_at`
- asociar post a evento o zona
- definir CTA

### 10. Pendientes tras la base de datos

- Crear rutas `/app/today` y `/admin/feed`. Completado en la fase frontend posterior.
- Agregar navegacion hacia "Hoy en FLEX". Completado en la fase frontend posterior.
- Crear componentes de feed oficial. Completado en la fase frontend posterior.
- Definir orden exacto por `is_pinned`, `priority` y `starts_at`. Completado con orden manual de prioridad en la fase frontend posterior.
- Validar CTA segura.
- Decidir si solo admin puede eliminar o si todo staff puede eliminar.
- Agregar logs de auditoria para publicaciones del feed.

## Fase actual: Frontend de Hoy en FLEX

### 1. Ruta usuario `/app/today`

Se creo la ruta:

```text
frontend/app/app/today/page.tsx
```

Nombre visible:

```text
Hoy en FLEX
```

Esta pantalla muestra el feed oficial en vivo para usuarios. No es un chat libre: solo muestra publicaciones oficiales creadas por admin/staff desde Supabase.

Consulta:

- Tabla: `daily_feed_posts`
- Solo `is_published = true`
- Solo posts vigentes:
  - `starts_at` null o `starts_at <= now()`
  - `ends_at` null o `ends_at >= now()`

Orden:

1. `is_pinned` primero
2. prioridad manual `urgent > high > normal > low`
3. `starts_at` ascendente con nulls al final
4. `created_at` descendente

La pantalla muestra:

- titulo
- cuerpo
- tipo
- prioridad
- hora o rango horario
- zona si existe relacion con `club_zones`
- CTA si existen `cta_label` y `cta_url`

Estados:

- loading
- error
- empty: `Todavia no hay anuncios para hoy`

Filtros:

- Todos
- Eventos
- Promos
- Actividades
- VIP
- Escenario
- Avisos

### 2. Navegacion usuario

Se agrego enlace visible `Hoy` en la navegacion de usuario:

```text
/app/today
```

Archivo modificado:

```text
frontend/lib/demo-data.ts
```

### 3. Ruta admin `/admin/feed`

Se creo la ruta:

```text
frontend/app/admin/feed/page.tsx
```

Nombre visible:

```text
Hoy en FLEX
```

La pagina permite gestionar el feed oficial:

- listar publicaciones
- crear publicacion
- editar publicacion
- publicar/despublicar
- fijar/desfijar
- eliminar publicacion

Tabla usada:

- `daily_feed_posts`

Tablas auxiliares para selects:

- `club_zones`
- `events`

Seguridad:

- Antes de cargar o modificar datos se usa `requireAdmin()`.
- Esto verifica usuario autenticado y rol `admin` activo en `staff_profiles`.
- No depende de `localStorage`.

### 4. Componentes creados

Carpeta:

```text
frontend/components/feed/
```

Componentes:

- `FeedPostCard`: card visual para publicaciones del feed.
- `FeedTypeBadge`: badge de tipo.
- `FeedPriorityBadge`: badge de prioridad.
- `FeedPostForm`: formulario reutilizable para crear/editar posts.

Tipos de publicacion:

- `event`
- `promotion`
- `activity`
- `announcement`
- `vip`
- `stage`
- `security`
- `storage`

Prioridades:

- `low`
- `normal`
- `high`
- `urgent`

### 5. Acciones admin

Desde `/admin/feed`, admin puede:

- crear post
- editar post
- publicar o despublicar
- fijar o desfijar
- eliminar
- asociar zona
- asociar evento
- definir CTA
- programar inicio y fin

### 6. Validaciones agregadas

Formulario admin:

- `title` requerido
- `type` debe ser valido
- `priority` debe ser valida
- si existe `cta_url`, debe empezar con `/` o `https://`
- si existen `starts_at` y `ends_at`, `ends_at` debe ser mayor que `starts_at`

### 7. Dashboard admin

Se actualizo `/admin`:

- Nueva metrica: `Hoy en FLEX`, contando publicaciones con `is_published = true`.
- Nuevo acceso rapido:
  - titulo: `Hoy en FLEX`
  - ruta: `/admin/feed`
  - descripcion: publica promociones, avisos y actividades del dia.

Tambien se agrego `Feed` al sidebar admin.

### 8. Como probar

Usuario:

1. Iniciar sesion.
2. Abrir `/app/today`.
3. Ver los seeds demo:
   - Live Jazz Session
   - 2x1 en cocteles
   - Open Mic
   - Ultimos cupos VIP
4. Probar filtros por Eventos, Promos, Actividades, VIP, Escenario y Avisos.

Admin:

1. Iniciar sesion con usuario que tenga `staff_profiles.role = admin`.
2. Abrir `/admin/feed`.
3. Crear publicacion.
4. Publicarla.
5. Fijarla.
6. Verificar que aparece en `/app/today`.
7. Despublicarla y verificar que desaparece.
8. Desfijarla.
9. Editarla.
10. Eliminarla.

### 9. Pendientes

- Logs de auditoria para publicaciones.
- Segmentar anuncios por sala VIP o zona.
- Reacciones rapidas no libres, controladas por UI.
- Notificaciones push/PWA para publicaciones urgentes.
- Middleware server-side para proteger `/admin/feed` antes de renderizar.
- Reglas mas finas para decidir si todo staff puede publicar o solo admin.

## Nota importante: supabase db reset y usuarios locales

### Que paso con el usuario admin

Se verifico la base local despues de ejecutar `supabase db reset` y el resultado fue:

```text
auth.users = 0
profiles = 0
staff_profiles = 0
active_admins = 0
```

Esto explica por que el usuario admin de prueba ya no aparece y por que el panel admin puede dejar de permitir acceso real: el usuario existia solo en la base local anterior.

### Como funciona `supabase db reset`

En entorno local, `supabase db reset` borra y recrea la base de datos local completa. Despues vuelve a aplicar migraciones desde cero.

Consecuencias:

- Los usuarios creados manualmente en Supabase Auth local se pierden.
- Las filas de `auth.users` se eliminan.
- Las filas de `profiles` asociadas tambien se pierden.
- Las filas de `staff_profiles` asociadas tambien se pierden.
- Cualquier admin creado manualmente debe recrearse despues del reset.

Esto es normal en desarrollo local. No significa que la migracion haya borrado un usuario concreto; significa que el reset reconstruyo toda la base local.

### Trigger de profile

El trigger sigue funcionando:

```text
on_auth_user_created -> create_profile_for_new_user()
```

Eso significa que cuando se registre un usuario nuevo desde `/register`, Supabase Auth insertara en `auth.users` y el trigger volvera a crear automaticamente su fila en `public.profiles`.

### Impacto en el panel admin

El panel admin real depende de:

- usuario autenticado en `auth.users`
- perfil asociado en `profiles`
- fila activa en `staff_profiles`
- `staff_profiles.role = 'admin'`

Si despues de un reset no existe usuario en `auth.users`, tampoco existe perfil ni staff admin. En ese estado `/admin` mostrara acceso denegado o error de sesion hasta crear y promover de nuevo un usuario.

## Como crear usuario admin de prueba

### Opcion A: crear usuario desde la app y promoverlo

Esta es la opcion recomendada para desarrollo local.

1. Abre la app.
2. Ve a `/register`.
3. Crea un usuario de prueba con un email local.
4. Abre Supabase Studio.
5. Ve a `Authentication` -> `Users`.
6. Copia el User ID o usa el email registrado.
7. Ejecuta este SQL en Supabase Studio SQL Editor, reemplazando `TU_EMAIL_AQUI`:

```sql
insert into public.staff_profiles (user_id, role, display_name, active)
select 
  u.id,
  'admin',
  'Administrador FLEX',
  true
from auth.users u
where u.email = 'TU_EMAIL_AQUI'
on conflict (user_id) do update
set 
  role = 'admin',
  display_name = 'Administrador FLEX',
  active = true;
```

Despues cierra sesion, vuelve a iniciar sesion y entra a `/admin`.

### Opcion B: helper SQL local de desarrollo

Se agrego un snippet seguro para desarrollo local:

```text
supabase/snippets/promote_existing_user_to_admin.sql
```

Este archivo no crea usuarios ni guarda contrasenas. Solo promueve a admin un usuario que ya exista en `auth.users`.

Uso:

1. Crear usuario desde `/register`.
2. Abrir `supabase/snippets/promote_existing_user_to_admin.sql`.
3. Reemplazar `TU_EMAIL_AQUI` por el email local de prueba.
4. Ejecutar el SQL en Supabase Studio.

Importante:

- No usar este flujo como sistema de permisos en produccion.
- En produccion, la asignacion de roles debe hacerse mediante una herramienta admin segura o una Edge Function protegida.
- No guardar contrasenas reales en seeds ni scripts.

### Por que no se crea un usuario completo por seed

Crear usuarios directamente en `auth.users` requiere manejar campos internos de Supabase Auth, hashes de password y metadatos. Hacerlo en una migracion o seed puede ser fragil y peligroso si alguien copia el flujo a produccion.

Por eso la opcion segura para desarrollo es:

1. crear usuario con Supabase Auth usando `/register`
2. promoverlo a admin con SQL local

## Como verificar que el admin existe

### Verificar `auth.users`

```sql
select id, email, created_at
from auth.users
where email = 'TU_EMAIL_AQUI';
```

### Verificar `profiles`

```sql
select id, full_name, created_at
from public.profiles
where id = (
  select id from auth.users where email = 'TU_EMAIL_AQUI'
);
```

### Verificar `staff_profiles`

```sql
select user_id, role, display_name, active
from public.staff_profiles
where user_id = (
  select id from auth.users where email = 'TU_EMAIL_AQUI'
);
```

Debe devolver:

```text
role = admin
active = true
```

### Verificar acceso a `/admin`

1. Iniciar sesion con ese usuario.
2. Abrir `/admin`.
3. Si `staff_profiles.role = admin` y `active = true`, el dashboard admin debe cargar.
4. Si no carga, revisar el mensaje de error visible y confirmar que el usuario actual coincide con el email promovido.

## Recomendacion para no perder el admin en futuros resets

Despues de cada `supabase db reset` local:

1. Crear de nuevo el usuario desde `/register`.
2. Ejecutar `supabase/snippets/promote_existing_user_to_admin.sql`.
3. Verificar `auth.users`, `profiles` y `staff_profiles`.

Este flujo es intencionalmente manual para evitar guardar credenciales en el repositorio. Si el equipo necesita automatizarlo, la siguiente mejora recomendada es crear un script local fuera de produccion que use variables de entorno y nunca persista contrasenas reales en Git.

## Diagnostico de skills Codex

Se evaluaron skills de Codex para mejorar el trabajo recurrente en FLEX sin ejecutar `supabase db reset`, sin borrar migraciones y sin cambiar logica de negocio.

Skills disponibles en este entorno:

- `skill-installer`
- `skill-creator`
- `openai-docs`

No estan disponibles actualmente como skills instaladas: `create-plan`, `codebase-recon`, `Project Skill Audit`, `Playwright Interactive`, `React Component Performance`, `gh-fix-ci`, `gh-address-comments`, GitHub skill local y Firecrawl.

Prioridades recomendadas:

1. Crear skills propias para FLEX: `flex-doc-sync`, `flex-security-audit` y `flex-supabase-migration`.
2. Instalar o crear una skill de reconocimiento de codebase.
3. Configurar Playwright y crear `flex-playwright-check`.
4. Dejar skills GitHub/CI para cuando exista remote, GitHub Actions y PRs activos.

El reporte completo esta en:

```text
SKILLS_DIAGNOSTICO_FLEX.md
```

Proximos pasos: consolidar la documentacion principal, crear middleware server-side con Supabase SSR y preparar tests Playwright seguros para rutas usuario, admin, guardia y storage.

## Fase actual: Middleware server-side y proteccion real de rutas

### 1. Problema detectado

La auditoria de seguridad detecto que FLEX ya validaba roles en varias pantallas, pero todavia faltaba una barrera server-side previa al render.

`RoleGate` ayuda a la experiencia de usuario y ya no usa `localStorage` cuando `NEXT_PUBLIC_ENABLE_MOCKS=false`, pero no era suficiente como seguridad principal porque se ejecuta en cliente. La proteccion real debe ocurrir antes de renderizar rutas privadas.

### 2. Cambios implementados

Se agregaron:

- `middleware.ts`: middleware real de Next.js para proteger rutas privadas y staff.
- `lib/supabase/server.ts`: helper Supabase SSR para middleware, leyendo y actualizando cookies.
- `lib/auth/server-role.ts`: helper para obtener usuario autenticado y rol operativo desde `staff_profiles`.
- `app/unauthorized/page.tsx`: pantalla simple para usuarios autenticados sin permiso suficiente.

Tambien se ajusto `components/auth/AuthForm.tsx` para redirigir despues del login segun el rol operativo activo.

### 3. Rutas protegidas

Rutas privadas generales:

- `/app`
- `/app/events`
- `/app/today`
- `/app/song-request`
- `/app/my-turn`
- `/app/tickets`
- `/app/vip`
- `/app/profile`
- `/app/notifications`

Rutas admin:

- `/admin`
- `/admin/events`
- `/admin/vip`
- `/admin/feed`
- `/admin/songs`
- `/admin/queue`
- `/admin/staff`
- `/admin/tickets`
- `/admin/payments`

Rutas guard:

- `/guard`
- `/guard/scan`
- `/guard/tickets`
- `/guard/guests`
- `/guard/alerts`
- `/guard/reports`

Rutas storage:

- `/storage`
- `/storage/new`
- `/storage/scan`
- `/storage/active`
- `/storage/history`

### 4. Como se consulta `staff_profiles`

El middleware crea un cliente Supabase SSR con `@supabase/ssr` y cookies de la request. Luego:

1. llama a `supabase.auth.getUser()`;
2. si existe usuario, consulta `staff_profiles`;
3. filtra por `user_id = auth user id`;
4. exige `active = true`;
5. usa `role` para decidir acceso.

No se usa `localStorage` en el middleware.

### 5. Reglas de acceso

- Sin sesion en ruta protegida: redireccion a `/login?redirectTo=...`.
- Usuario autenticado normal: puede entrar a `/app/*`.
- `admin`: puede entrar a `/admin/*`, `/guard/*`, `/storage/*` y `/app/*`.
- `guard`: puede entrar a `/guard/*` y `/app/*`.
- `storage`: puede entrar a `/storage/*` y `/app/*`.
- `dj`: puede entrar a `/admin/songs`, `/admin/queue` y `/app/*`.
- Usuario autenticado sin permiso: redireccion a `/unauthorized`.

Despues del login:

- `admin` redirige a `/admin`.
- `guard` redirige a `/guard`.
- `storage` redirige a `/storage`.
- `dj` redirige a `/admin/queue`.
- usuario sin rol staff redirige a `/app`.

### 6. Como probar manualmente

Sin sesion:

1. Abrir `/admin`.
2. Debe redirigir a `/login`.

Usuario normal:

1. Iniciar sesion con usuario sin fila activa en `staff_profiles`.
2. Abrir `/app`.
3. Debe permitir.
4. Abrir `/admin`.
5. Debe bloquear y redirigir a `/unauthorized`.

Admin:

1. Iniciar sesion con usuario cuyo `staff_profiles.role = 'admin'` y `active = true`.
2. Abrir `/admin`.
3. Debe permitir.
4. Abrir `/guard`.
5. Debe permitir.
6. Abrir `/storage`.
7. Debe permitir.

Guard:

1. Iniciar sesion con usuario `guard` activo.
2. Abrir `/guard`.
3. Debe permitir.
4. Abrir `/admin`.
5. Debe bloquear.

Storage:

1. Iniciar sesion con usuario `storage` activo.
2. Abrir `/storage`.
3. Debe permitir.
4. Abrir `/guard`.
5. Debe bloquear.

DJ:

1. Iniciar sesion con usuario `dj` activo.
2. Abrir `/admin/queue` o `/admin/songs`.
3. Debe permitir.
4. Abrir `/admin/events`.
5. Debe bloquear.

### 7. Pendientes

- Crear tests Playwright para cubrir redirecciones y accesos por rol.
- Unificar la proteccion client-side de `RoleGate` con los mismos helpers conceptuales del middleware.
- Conectar mas vistas operativas a datos reales y eliminar datos demo donde ya no correspondan.
- Considerar una pagina post-login dedicada si se quiere respetar `redirectTo` despues de login sin saltarse la ruta recomendada por rol.

### 8. Correccion del flujo login + middleware SSR

Se detecto que el formulario de login usaba un cliente browser creado con `@supabase/supabase-js`. Ese cliente persistia la sesion en el navegador, pero no establecia las cookies que el middleware SSR necesita para reconocer la sesion antes de renderizar `/admin`, `/guard`, `/storage` o `/app`.

Correcciones aplicadas:

- `lib/supabase.ts` ahora usa `createBrowserClient` de `@supabase/ssr`.
- `components/auth/AuthForm.tsx` mantiene `onSubmit` y el boton `Entrar` ahora declara explicitamente `type="submit"`.
- Los errores de `signInWithPassword` se muestran en pantalla.
- Si el login es correcto pero falla la consulta de `staff_profiles`, se muestra un error claro.
- Despues de login correcto se ejecuta `router.refresh()` y luego se redirige.
- `redirectTo` solo se respeta si el rol activo en `staff_profiles` puede acceder a esa ruta.
- Si `redirectTo` no es valido para el rol, se usa `defaultRouteForRole()`.
- `/login` y `/register` envuelven `AuthForm` en `Suspense` porque el formulario lee `redirectTo` con `useSearchParams`.

Como probar con `admin@flex.test`:

1. Abrir `/login?redirectTo=%2Fadmin`.
2. Iniciar sesion con `admin@flex.test`.
3. Confirmar que `staff_profiles.role = 'admin'` y `active = true`.
4. Debe redirigir a `/admin`.

Como probar con usuario normal:

1. Crear o usar un usuario sin fila activa en `staff_profiles`.
2. Abrir `/login?redirectTo=%2Fadmin`.
3. Iniciar sesion.
4. Debe redirigir a `/app`, no a `/admin`.
5. Si abre `/admin` manualmente, debe ir a `/unauthorized`.

## Auditoria de rendimiento en desarrollo

### 1. Problema observado

Al navegar entre pestañas/rutas del admin aparece `Compiling...` y algunas rutas tardan mas de lo esperado en desarrollo.

### 2. Diferencia entre desarrollo y produccion

En Next.js App Router, `Compiling...` durante `npm run dev` es normal la primera vez que se abre una ruta o cuando cambia codigo. Cada segmento puede compilar bajo demanda. Esto no equivale necesariamente al rendimiento de produccion.

Para validar produccion se debe usar:

```text
npm run build
npm run start
```

### 3. Hallazgos de middleware

El `middleware.ts` esta acotado con matcher a:

- `/app/:path*`
- `/admin/:path*`
- `/guard/:path*`
- `/storage/:path*`

Por tanto no se ejecuta para assets, `_next`, imagenes, favicon ni rutas publicas como `/login` o `/register`.

Por cada request protegida hace:

1. `supabase.auth.getUser()`
2. una consulta a `staff_profiles` si hay usuario

Esto es esperado para seguridad server-side. No se quitaron estas consultas porque son la barrera real previa al render.

### 4. Hallazgos de helpers Supabase

El cliente browser de Supabase se estaba creando cada vez que se llamaba `createBrowserSupabase()`. Se cambio a singleton por modulo para reutilizar `createBrowserClient` de `@supabase/ssr` durante la vida del bundle cliente.

Esto reduce recreaciones innecesarias de cliente en navegaciones y acciones.

### 5. Hallazgos por rutas admin

`/admin`:

- Antes hacia `requireAdmin()` una vez al iniciar y luego otra vez por cada metrica dentro de `countRows()`.
- Eso multiplicaba consultas de `auth.getUser()` y `staff_profiles`.
- Se corrigio para crear el cliente admin una vez y pasarlo a `countRows()`.

`/admin/feed`:

- Carga 3 queries iniciales en paralelo: `daily_feed_posts`, `club_zones` y `events`.
- Es razonable para el formulario de feed.
- En acciones vuelve a cargar datos tras guardar/publicar/fijar/eliminar.

`/admin/events`:

- Carga una query principal a `events`.
- No hay imports pesados relevantes.

`/admin/tickets`:

- Carga una query por filtro de estado.
- Puede necesitar paginacion si crecen muchos tickets.

`/admin/vip`:

- Carga `club_zones` filtrando salas VIP/privadas.
- Carga razonable.

`/admin/songs`:

- Carga `song_requests` por estado.
- Puede necesitar paginacion si hay muchas canciones.

`/admin/queue`:

- Carga `live_session_queue` y ordena en cliente por estado/posicion.
- Puede moverse el orden a SQL si la cola crece mucho.

`/admin/staff`:

- Carga `staff_profiles`.
- Uso esperado para admin.

`/admin/payments`:

- Carga `orders` con `order_items`.
- Puede necesitar paginacion y columnas acotadas cuando haya volumen real.

### 6. Imports

No se detectaron imports grandes de datos demo dentro de rutas admin. El layout admin importa iconos de `lucide-react`, que es normal para la navegacion. Las rutas operativas de usuario/guard/storage si usan `lib/demo-data.ts` en algunas vistas, pero no explican la lentitud entre rutas admin.

### 7. Optimizaciones aplicadas

- `lib/supabase.ts`: `createBrowserSupabase()` reutiliza un singleton de `createBrowserClient`.
- `app/admin/page.tsx`: `countRows()` recibe el cliente Supabase ya validado y evita repetir `requireAdmin()` por metrica.

### 8. Pendientes recomendados

- Probar navegacion en `npm run start` para comparar con produccion.
- Agregar paginacion a tablas admin con posible crecimiento: tickets, pagos, canciones, cola y feed.
- Considerar mover datos admin a Server Components o server actions mas adelante, manteniendo middleware y RLS.
- Crear tests Playwright de smoke para rutas admin.

### 9. Como probar

1. Iniciar dev server.
2. Entrar como admin.
3. Abrir `/admin` y navegar a `/admin/feed`, `/admin/events`, `/admin/tickets`, `/admin/vip`, `/admin/songs`, `/admin/queue`, `/admin/staff`, `/admin/payments`.
4. La primera visita a cada ruta puede mostrar `Compiling...`.
5. Repetir navegacion a rutas ya compiladas; debe sentirse mas estable.
6. Ejecutar `npm run build` para confirmar que produccion compila correctamente.

## Fase actual: Navegacion dinamica por rol

### 1. Problema detectado

La seguridad real ya estaba en `middleware.ts` y en `staff_profiles`, pero la UX seguia mostrando en el sidebar rutas que algunos roles no podian usar. El caso mas claro era `dj`: podia entrar a `/admin/songs` y `/admin/queue`, pero veia opciones admin como Feed, Eventos, Entradas, VIP, Staff y Pagos, que luego acababan en acceso denegado.

### 2. Seguridad real vs UX

Ocultar enlaces no sustituye la seguridad. El middleware y `canRoleAccessPath()` siguen bloqueando rutas no permitidas. La navegacion dinamica solo evita confusion mostrando opciones coherentes con el rol real.

No se usa `localStorage` para roles y no se usan mocks para seguridad.

### 3. Cambios implementados

Archivos modificados:

- `lib/navigation/role-nav.ts`
- `components/layout/AppShell.tsx`
- `app/admin/layout.tsx`
- `app/guard/layout.tsx`
- `app/storage/layout.tsx`
- `app/app/layout.tsx`

Se creo `lib/navigation/role-nav.ts` como fuente unica de navegacion por rol.

`AppShell` consulta Supabase Auth y `staff_profiles` en layouts staff para conocer el rol real activo y renderizar la navegacion correspondiente. Si no puede validar rol, muestra un mensaje claro y un boton para volver a `/app`.

### 4. Que ve cada rol

`admin`:

- `/admin`
- `/admin/feed`
- `/admin/events`
- `/admin/tickets`
- `/admin/vip`
- `/admin/songs`
- `/admin/queue`
- `/admin/staff`
- `/admin/payments`
- `/guard`
- `/storage`

`dj`:

- `/admin/songs`
- `/admin/queue`
- `/app`

`guard`:

- `/guard`
- `/guard/scan`
- `/guard/tickets`
- `/guard/guests`
- `/guard/alerts`
- `/guard/reports`
- `/app`

`storage`:

- `/storage`
- `/storage/new`
- `/storage/scan`
- `/storage/active`
- `/storage/history`
- `/app`

`user`:

- `/app`
- `/app/events`
- `/app/today`
- `/app/song-request`
- `/app/my-turn`
- `/app/tickets`
- `/app/vip`
- `/app/profile`
- `/app/notifications`

### 5. Como probar

Admin:

1. Iniciar sesion con rol `admin` activo.
2. Abrir `/admin`.
3. Debe ver todas las opciones admin.

DJ:

1. Iniciar sesion con rol `dj` activo.
2. Abrir `/admin/queue`.
3. Debe ver solo Canciones, Cola y App.
4. Abrir `/admin/events`.
5. Debe bloquear por middleware.

Guard:

1. Iniciar sesion con rol `guard` activo.
2. Abrir `/guard`.
3. Debe ver solo opciones guard y App.
4. Abrir `/admin`.
5. Debe bloquear.

Storage:

1. Iniciar sesion con rol `storage` activo.
2. Abrir `/storage`.
3. Debe ver solo opciones storage y App.
4. Abrir `/guard`.
5. Debe bloquear.

User:

1. Iniciar sesion sin rol staff activo.
2. Abrir `/app`.
3. Debe ver solo navegacion de usuario.
4. Abrir `/admin`.
5. Debe bloquear.

### 6. Pendientes

- Crear tests Playwright para confirmar sidebar por rol.
- Evitar doble consulta de rol entre `RoleGate` y `AppShell` en zonas staff mediante un provider compartido o server-side layout futuro.

## Fase actual: QR guardias y access_logs reales

### 1. Problema detectado

`/guard/scan` validaba QR contra Supabase o mock, pero el panel de accesos recientes seguia usando datos demo de `lib/demo-data.ts`. Ademas, la funcion SQL `validate_qr_token` solo devolvia el resultado de validacion: no registraba `access_logs` ni marcaba tickets de un solo uso como usados.

### 2. Tablas y funcion afectadas

Tablas implicadas:

- `tickets`
- `private_room_access`
- `private_room_guests`
- `storage_items`
- `access_logs`
- `staff_profiles`

Funcion actualizada mediante migracion incremental:

```text
supabase/migrations/20260526110000_qr_access_logs_real_flow.sql
```

No se modificaron migraciones antiguas.

### 3. Flujo de validacion

Cuando un guardia o admin valida un token:

1. La app llama a `rpc("validate_qr_token", { input_token })`.
2. La funcion comprueba que `auth.uid()` tenga fila activa en `staff_profiles` con rol `guard` o `admin`.
3. Busca el token en `tickets`.
4. Si no existe en tickets, busca en `private_room_access`.
5. Si no existe en VIP, busca en `storage_items`.
6. Si no existe en ninguna tabla, devuelve `invalid`.

Estados contemplados:

- `valid`
- `used`
- `expired`
- `invalid`
- `full`
- `inactive`

### 4. Flujo de registro

Cada validacion inserta una fila en `access_logs` con:

- `staff_id`: fila activa de `staff_profiles` del guardia/admin.
- `ticket_id`, `private_room_access_id` o `storage_item_id` cuando aplica.
- `qr_token`.
- `result`.
- `reason`.
- `created_at` por defecto de la tabla.

Los accesos recientes en `/guard/scan` ahora se cargan desde `access_logs`, no desde `lib/demo-data.ts`.

### 5. Como se evita doble uso

Para entradas (`tickets`), la funcion bloquea la fila con `for update`.

Si el ticket esta `active` y no esta expirado:

- devuelve `valid`;
- inserta `access_logs`;
- actualiza `tickets.status = 'used'`;
- guarda `tickets.used_at = now()`.

Si se vuelve a validar el mismo QR:

- devuelve `used`;
- inserta un nuevo `access_logs` con resultado `used`;
- no vuelve a marcarlo como valido.

### 6. Seguridad

- El middleware sigue siendo la primera barrera para `/guard/scan`.
- La funcion SQL exige rol real `guard` o `admin` activo desde `staff_profiles`.
- No se usa `localStorage` para seguridad.
- No se usan mocks para roles ni para registrar accesos.
- Usuarios normales no pueden registrar `access_logs`.

### 7. Archivos modificados

- `supabase/migrations/20260526110000_qr_access_logs_real_flow.sql`
- `lib/flex-actions.ts`
- `components/guard/QrValidationPanel.tsx`
- `components/guard/RecentAccessPanel.tsx`
- `app/guard/scan/page.tsx`

### 8. Como probar

QR valido de ticket:

1. Iniciar sesion como `guard` o `admin`.
2. Abrir `/guard/scan`.
3. Pegar un `tickets.qr_token` con `status = 'active'`.
4. Debe mostrar acceso valido.
5. Debe aparecer en accesos recientes.
6. En Supabase, el ticket debe quedar `status = 'used'` y `used_at` con fecha.

QR usado:

1. Validar de nuevo el mismo token.
2. Debe mostrar `Entrada ya usada`.
3. Debe registrar un nuevo `access_logs` con resultado `used`.

QR invalido:

1. Pegar un token inventado.
2. Debe mostrar `QR invalido`.
3. Debe registrar `access_logs` con resultado `invalid`.

Usuario sin rol:

1. Intentar abrir `/guard/scan`.
2. El middleware debe bloquear antes de renderizar.

### 9. Pendientes

- Crear seed o flujo controlado para generar tickets reales de prueba sin resetear Supabase.
- Agregar filtros en accesos recientes por resultado, tipo y fecha.
- Decidir si `storage` debe tener una RPC separada para validar/entregar prendas sin usar el flujo de guardias.
- Crear tests Playwright para QR valido, usado e invalido.

## Fase actual: UI polish y rendimiento percibido

### 1. Problema detectado

La aplicacion ya tenia seguridad, roles reales y flujos principales conectados, pero algunas pantallas se sentian visualmente desiguales: cards, botones, empty states, loaders y feedback no compartian una base visual comun. En desarrollo, la compilacion bajo demanda de Next tambien puede hacer que la navegacion parezca lenta la primera vez que se abre una ruta.

### 2. Componentes creados

Se agregaron componentes UI reutilizables sin dependencia de Supabase ni logica de negocio:

- `components/ui/FlexCard.tsx`
- `components/ui/FlexButton.tsx`
- `components/ui/FlexBadge.tsx`
- `components/ui/FlexEmptyState.tsx`
- `components/ui/FlexSkeleton.tsx`
- `components/ui/FlexSectionHeader.tsx`

Tambien se adapto `components/ui/Button.tsx` para reutilizar `FlexButton` y `components/ui/Card.tsx` para reutilizar `FlexCard`, manteniendo la API existente.

### 3. Paginas y zonas mejoradas

Se aplicaron cambios de bajo riesgo en:

- `/admin`: mediante `AdminComponents`, ahora los stat cards, empty states, loading states, tablas y badges tienen base visual mas consistente.
- `/admin/feed`: feedback positivo usa el nuevo tono visual success.
- `/admin/queue`: hereda empty/loading/badges mejorados desde `AdminComponents`.
- `/guard`: se mejoro jerarquia visual, acciones principales y cards de accesos recientes demo.
- `/storage`: se mejoro jerarquia visual, card principal y cards de ultimas entregas demo.
- Sidebar dinamico: muestra el rol actual cuando esta disponible y mantiene el item activo mas claro.

### 4. Rendimiento percibido

Se agregaron skeleton cards reutilizables para estados de carga admin. Esto evita pantallas visualmente vacias mientras se cargan datos.

Tambien se agregaron transiciones suaves y hover/focus states consistentes en cards y botones. No se hicieron optimizaciones complejas ni cambios de datos.

### 5. Que no se toco

- No se cambio la base de datos.
- No se ejecuto `supabase db reset`.
- No se modificaron migraciones.
- No se cambio middleware ni reglas de roles.
- No se cambio logica de negocio.
- No se agregaron mocks nuevos.
- No se tocaron formularios complejos de admin salvo feedback visual puntual.

### 6. Como probar

1. Entrar como admin.
2. Abrir `/admin`, `/admin/feed` y `/admin/queue`.
3. Confirmar loaders, empty states, badges y cards consistentes.
4. Entrar a `/guard` y revisar acciones principales y cards.
5. Entrar a `/storage` y revisar card principal y ultimas entregas.
6. Cambiar entre rutas ya compiladas para evaluar sensacion de velocidad.
7. Ejecutar `npm run lint` y `npm run build`.

### 7. Pendientes

- Aplicar los nuevos componentes a formularios complejos de admin en una fase separada.
- Crear skeletons especificos para tablas largas.
- Crear pruebas visuales/smoke con Playwright.
- Revisar datos demo restantes en dashboards de guard/storage en una fase de conexion real.

## Fase actual: rediseno ligero app cliente

### 1. Objetivo

Mejorar la interfaz de cliente de FLEX para que se sienta mas limpia, rapida y premium, manteniendo la estetica jazz/discoteca: fondo negro, acentos dorados, contraste alto, acciones claras y textos cortos.

### 2. Inspiracion visual

La referencia aplicada fue:

- home con hero principal de evento;
- accesos rapidos en cards grandes;
- panel lateral desktop con Mi turno, Mis entradas/QR y Salas VIP;
- sidebar simple;
- layout responsive: dos columnas en desktop y una columna en movil;
- menos texto y CTAs mas claros.

### 3. Paginas modificadas

- `app/app/page.tsx`
- `app/app/layout.tsx`

No se redisenaron rutas admin/staff ni formularios complejos.

### 4. Componentes reutilizados

Se reutilizaron componentes creados en la fase de UI polish:

- `FlexCard`
- `FlexButton`
- `FlexBadge`
- `FlexSectionHeader`

No se crearon componentes nuevos en esta fase.

### 5. Cambios aplicados

`/app` ahora tiene:

- header de bienvenida con texto corto;
- hero principal con imagen `jazz-night.png`, overlay oscuro y CTA;
- accesos rapidos para Pedir cancion, Mi turno, Mis entradas y Salas VIP;
- seccion de proximos eventos con cards visuales;
- panel lateral desktop con Mi turno, Mis entradas/QR y Salas VIP;
- responsive en una sola columna para movil.

`/app` pasa `role="user"` a `AppShell` para mantener la navegacion de cliente limitada a rutas de usuario.

### 6. Que no se toco

- No se cambio middleware.
- No se cambiaron reglas de roles.
- No se cambio base de datos.
- No se ejecutaron resets.
- No se tocaron migraciones.
- No se sustituyo logica real por mocks.
- No se agregaron queries globales nuevas.

### 7. Como probar

1. Entrar con un usuario normal.
2. Abrir `/app`.
3. Confirmar hero principal, accesos rapidos, proximos eventos y panel lateral.
4. Confirmar que en movil el contenido cae en una sola columna.
5. Confirmar que el sidebar de usuario solo muestra Inicio, Hoy, Cancion, Mi turno, Entradas, VIP, Perfil y Avisos.
6. Confirmar que las rutas existentes siguen funcionando.

### 8. Pendientes

- Conectar el hero y proximos eventos a datos reales de `events`.
- Conectar Mi turno, Mis entradas y VIP lateral a datos reales del usuario.
- Aplicar un polish similar a `/app/today`, `/app/tickets`, `/app/vip`, `/app/song-request` y `/app/my-turn`.

## Fase actual: Auditoria AGENTS.md de proyecto FLEX

### 1. Objetivo

Se audito el proyecto contra las reglas operativas de:

- `AGENTS.md`
- `frontend/AGENTS.md`
- `supabase/AGENTS.md`

No se ejecuto `supabase db reset`, no se borraron migraciones y no se hicieron cambios destructivos.

### 2. Cambios aplicados durante la auditoria

Se corrigio `components/auth/RoleGate.tsx` para que `localStorage` solo pueda usarse como selector de rol cuando `NEXT_PUBLIC_ENABLE_MOCKS=true`.

Con mocks desactivados:

- `RoleGate` valida sesion real con Supabase Auth.
- Las zonas `guard` y `storage` validan rol operativo activo en `staff_profiles`.
- `admin` sigue validandose en paginas admin mediante `requireAdmin()`.
- Si no hay sesion o rol suficiente, se muestra acceso denegado y enlace a `/login`.

Se agrego `supabase/snippets/promote_existing_user_to_admin.sql`, un snippet seguro de desarrollo local para promover a admin un usuario ya creado desde `/register`. No crea usuarios, no guarda contrasenas y no contiene secretos.

### 3. Hallazgos principales

Cumple:

- Las migraciones son incrementales y no se borraron migraciones antiguas.
- No hay seeds con contrasenas reales ni claves secretas.
- `daily_feed_posts` tiene RLS, policies, indices y seeds idempotentes.
- Hoy en FLEX usa `daily_feed_posts` y no implementa chat libre.
- `/app/today` y `/admin/feed` existen y gestionan filtros, fijados, prioridades y CTA.
- Las paginas admin principales usan Supabase real y `staff_profiles` para validar admin.
- Los mocks de flujos principales dependen de `NEXT_PUBLIC_ENABLE_MOCKS=true`.

No cumple o queda pendiente:

- `DOCUMENTACION_FLEX.md` en raiz conserva secciones antiguas que mencionan `frontend/`, `supabase/functions` y `diseno-jhonda`; `docs/DOCUMENTACION_FLEX.md` esta mas alineado con el proyecto actual. Pendiente consolidar la documentacion principal sin perder historial.
- Falta `middleware.ts` server-side para proteger `/admin`, `/guard`, `/storage` y rutas privadas antes de renderizar.
- Algunas pantallas operativas todavia usan datos estaticos de `lib/demo-data.ts` para paneles secundarios.
- La validacion QR real no registra `access_logs` desde el flujo actual.
- Stripe esta preparado a nivel de tablas, pero no hay checkout real ni webhooks en este proyecto.
- La reserva real de VIP y generacion real de `private_room_access` siguen pendientes.

### 4. Rutas revisadas

- `/app/today`: implementada con `daily_feed_posts`, loading, error, empty state, filtros, fijados, prioridad y CTA.
- `/admin/feed`: implementada con CRUD de `daily_feed_posts`, loading, error, empty state y feedback de acciones.
- `/admin/events`: implementada con CRUD basico de `events`, validaciones, loading, error, empty state y feedback.
- `/admin/vip`: implementada sobre `club_zones`, validacion de capacidad privada <= 10, loading, error, empty state y feedback.
- `/guard/scan`: valida QR con `validateQrToken`; mantiene panel lateral con datos demo, pendiente conectarlo a `access_logs`.
- `/storage/active`: lista y entrega `storage_items` o mock explicito; tiene loading, error y empty state.

### 5. Proxima fase recomendada

La siguiente fase recomendada es crear `middleware.ts` con Supabase SSR para proteger rutas privadas y staff antes de renderizar, y luego conectar guardias/storage a `staff_profiles` y `access_logs` sin depender de datos demo.

## Fase actual: pulido interfaz principal cliente

### 1. Problemas detectados

- El encabezado de `/app` repetia varias ideas de bienvenida y hacia la primera lectura menos clara.
- Algunos textos de acciones y estados eran poco precisos o no tenian acentos visibles.
- El hero principal tenia buen contenido, pero podia dejar ver un poco mas la imagen sin perder contraste.
- La home no mostraba un resumen directo de Hoy en FLEX.

### 2. Cambios visuales

- Se simplifico la cabecera de cliente a `Bienvenido a FLEX` con el texto `Tu noche, tus canciones y tus accesos en un solo lugar.`
- Se mantuvo el hero `Jazz Nights`, ajustando el overlay para conservar legibilidad y dar mas presencia a la imagen.
- Se agrego una card de `Hoy en FLEX` en `/app`, con hasta 3 publicaciones oficiales desde `daily_feed_posts`, estado de carga, error y empty state.
- Se mejoraron textos y CTAs del panel lateral: Mi turno, Mis entradas y Salas VIP.

### 3. Textos corregidos

- `Pedir cancion` se presenta como `Pedir canción` con helper `Elige tu tema`.
- `Mi turno` usa `Revisa tu posición`.
- `Mis entradas` usa `Ver QR`.
- `Salas VIP` usa `Reservar sala`.
- El sidebar de cliente corrige `Cancion` a `Canción`.
- `VALIDA` queda como `Válida`.
- `LISTA` queda como `Ver lista`.

### 4. Rutas afectadas

- `/app`
- Layout cliente de `/app`
- Sidebar/navegacion de cliente

### 5. Que no se toco

- No se modifico middleware.
- No se cambiaron reglas de roles.
- No se cambio base de datos.
- No se tocaron migraciones.
- No se reemplazaron datos reales por mocks.
- No se cambio logica critica de negocio.

### 6. Como probar

1. Iniciar sesion como usuario normal.
2. Abrir `/app`.
3. Confirmar que el header no repite `Bienvenido`, `FLEX` y textos similares.
4. Confirmar que el hero mantiene imagen, fecha, hora, zona y boton `Ver detalles`.
5. Confirmar que las cards de accesos rapidos muestran los nuevos textos.
6. Confirmar que la card `Hoy en FLEX` muestra publicaciones reales o empty state.
7. Probar en movil que el orden sea hero, accesos rapidos, Mi turno, Mis entradas, VIP y proximos eventos, sin overflow horizontal.

## Fase actual: mejora perfil de usuario

### 1. Problema detectado

`/app/profile` era una pantalla placeholder y mostraba texto tecnico sobre la tabla `profiles`, algo que no corresponde a usuario final. Ademas, en esta ruta el encabezado general `Bienvenido a FLEX` no comunicaba que el usuario estaba gestionando su cuenta.

### 2. Objetivo

Convertir `/app/profile` en una seccion real de cuenta con estetica FLEX, lectura clara y acciones preparadas para datos personales, pagos, seguridad y notificaciones.

### 3. Rutas y archivos modificados

- Ruta afectada: `/app/profile`.
- `app/app/profile/page.tsx`
- `components/app/ProfilePanel.tsx`
- `components/layout/AppShell.tsx`
- `app/app/layout.tsx`

### 4. Campos visibles

La pantalla muestra:

- avatar con iniciales;
- nombre completo;
- email de Supabase Auth;
- badge de rol operativo (`Cliente`, `Admin`, `Guard`, `Storage` o `DJ`);
- telefono;
- fecha de nacimiento;
- tabs de Datos personales, Pago, Seguridad y Notificaciones.

### 5. Que queda real y que queda como proximo

Real:

- Carga usuario actual desde Supabase Auth.
- Carga `profiles.full_name` y `profiles.phone`.
- Consulta `staff_profiles` para mostrar el rol activo cuando exista.
- Guarda nombre y telefono en `profiles`.
- Guarda fecha de nacimiento y preferencias visuales de notificaciones en metadata de Supabase Auth.
- Email queda readonly porque pertenece a Supabase Auth.

Proximo:

- Foto de perfil editable.
- Metodos de pago reales con Stripe.
- Historial de compras conectado a ordenes reales.
- Cambio de contrasena y cierre remoto de sesiones.

### 6. Que no se toco

- No se modifico middleware.
- No se cambiaron reglas de roles.
- No se cambio base de datos.
- No se ejecutaron resets.
- No se tocaron migraciones.
- No se reemplazaron datos reales por mocks.

### 7. Como probar

1. Iniciar sesion con un usuario normal.
2. Abrir `/app/profile`.
3. Confirmar que el encabezado muestra `Mi perfil` y no `Bienvenido a FLEX`.
4. Confirmar que no aparece texto tecnico de base de datos.
5. Editar nombre, telefono o fecha de nacimiento y pulsar `Guardar cambios`.
6. Confirmar feedback `Guardando...` y `Cambios guardados`.
7. Cambiar switches de Notificaciones y pulsar `Guardar preferencias`.
8. Confirmar feedback `Guardando...` y `Preferencias guardadas`.
9. Revisar en movil que los tabs no rompan el layout y permitan navegacion horizontal.

## Fase actual: refinamiento visual de perfil

### 1. Problema detectado

La pantalla `/app/profile` ya funcionaba con Supabase Auth y `profiles`, pero visualmente seguia sintiendose rigida y demasiado cercana a un formulario administrativo. Faltaba una composicion mas premium y una mejor jerarquia para que se percibiera como una seccion real de usuario.

### 2. Cambios aplicados

- Se refino la card superior del usuario con un contenedor mas suave, gradiente sutil, avatar con brillo dorado, nombre destacado, email y badge de rol.
- El boton `Foto proximamente` se mantuvo deshabilitado como accion secundaria discreta.
- Se agrego un mini resumen con valores seguros:
  - `0 entradas`
  - `Sin turno`
  - `0 reservas`
- Los tabs se cambiaron a pills compactas con iconos y estado activo dorado.
- El contenido usa grid de 2 columnas en desktop: formulario o tab activo a la izquierda y estado de cuenta a la derecha.
- En movil todo queda en una columna y los tabs mantienen scroll horizontal.
- Se suavizaron inputs, bordes, radios, fondos y espaciados para reducir la sensacion cuadrada.

### 3. Rutas afectadas

- `/app/profile`

### 4. Que se mantuvo igual

- Se mantiene la carga real desde Supabase Auth.
- Se mantiene la lectura y escritura real de `profiles.full_name` y `profiles.phone`.
- Se mantiene el rol real desde `staff_profiles`.
- Se mantienen fecha de nacimiento y preferencias en metadata de Supabase Auth.
- No se modifico middleware.
- No se cambiaron reglas de roles.
- No se cambio RLS.
- No se cambio base de datos.
- No se tocaron migraciones.
- No se reemplazaron datos reales por mocks.

### 5. Como probar

1. Iniciar sesion y abrir `/app/profile`.
2. Confirmar que la card superior se ve menos rectangular y mantiene avatar, nombre, email y rol.
3. Confirmar que aparecen los indicadores `0 entradas`, `Sin turno` y `0 reservas`.
4. Cambiar entre tabs y confirmar que funcionan como pills compactas.
5. Guardar datos personales y confirmar feedback `Guardando...` y `Cambios guardados`.
6. Guardar preferencias de notificaciones y confirmar feedback `Preferencias guardadas`.
7. Probar en movil que no haya overflow horizontal fuera del scroll de tabs.

### 6. Pendientes

- Conectar los indicadores superiores a conteos reales de tickets, turno actual y reservas VIP.
- Implementar foto de perfil real cuando se defina storage y permisos.
- Conectar metodos de pago e historial a Stripe/ordenes.
- Implementar cambio de contrasena y cierre remoto de sesiones.

## Fase actual: simplificacion visual de perfil

### 1. Problema detectado

El refinamiento anterior de `/app/profile` mejoro la calidad visual, pero la pantalla seguia sintiendose cargada para un usuario normal de discoteca: demasiadas cards, una accion de foto no disponible y una tarjeta lateral que competia con el formulario principal.

### 2. Cambios aplicados

- Se elimino el boton/bloque `Foto proximamente`.
- Se elimino la tarjeta lateral `Estado de cuenta`.
- Se compacto el header del usuario manteniendo avatar, nombre, email y badge de rol.
- Las estadisticas quedaron como una fila discreta:
  - `Entradas: 0`
  - `Turno: Sin turno`
  - `Reservas: 0`
- Se redujo el ancho maximo de la pantalla para centrar mejor el contenido.
- Se mantuvieron tabs tipo pill para Datos personales, Pago, Seguridad y Notificaciones.
- El formulario conserva los campos reales, pero con menos peso visual y espaciado mas limpio.

### 3. Que se mantuvo intacto

- Autenticacion con Supabase Auth.
- Lectura y escritura de `profiles.full_name` y `profiles.phone`.
- Metadata de Supabase Auth para fecha de nacimiento y preferencias.
- Rol operativo desde `staff_profiles`.
- Middleware, rutas, reglas de roles y RLS.
- Base de datos y migraciones.

### 4. Como probar

1. Entrar a `/app/profile`.
2. Confirmar que no aparece `Foto proximamente`.
3. Confirmar que no aparece la tarjeta lateral `Estado de cuenta`.
4. Confirmar que avatar, nombre, email y badge de rol siguen visibles.
5. Confirmar que las estadisticas se muestran como fila discreta.
6. Cambiar de tabs y guardar datos/preferencias para verificar que la logica sigue funcionando.
7. Probar en movil que el contenido se mantenga en una columna y los tabs no rompan el layout.

## Fase actual: mejora visual de Salas VIP

### 1. Problema detectado

`/app/vip` funcionaba con datos reales de `club_zones`, pero la presentacion era demasiado simple y tecnica. Las salas no comunicaban bien su personalidad, la grilla dejaba la Sala Dorada desordenada en algunos anchos y el CTA `Compartir acceso` podia confundir cuando el usuario aun no tenia una reserva activa.

### 2. Cambios aplicados

- Se agrego un hero superior con el titulo `Reserva tu espacio privado`.
- Se incluyo el subtitulo de valor: ambientes exclusivos, capacidad limitada y acceso compartido para invitados.
- Se agregaron highlights: `QR compartido`, `Maximo 10 personas` y `Servicio exclusivo`.
- Las salas se muestran en una grilla responsive:
  - 3 columnas en desktop amplio;
  - 2 columnas en tablet;
  - 1 columna en movil.
- Las tarjetas tienen altura aproximada consistente, hover suave, mejor espaciado y estilo premium.
- Cada sala muestra capacidad, planta, precio desde, descripcion corta y estado `Disponible`.
- La Sala Dorada muestra el badge `Mas exclusiva` y CTA `Reservar premium`.
- Los CTAs principales cambiaron a `Reservar sala` o `Reservar premium`, evitando `Compartir acceso` como accion primaria antes de reservar.
- El empty state se mantuvo claro cuando no hay salas activas.

### 3. Conexion real mantenida

- Se mantiene `listVipRooms()`.
- Se mantiene la consulta real a `club_zones`.
- Se mantienen los filtros existentes de tipo `vip_room` y `private_room`.
- Se mantiene el filtro `active=true`.
- No se agregaron mocks nuevos ni datos falsos.
- No se cambiaron migraciones, middleware, roles ni RLS.

### 4. Como probar manualmente

1. Iniciar sesion y abrir `/app/vip`.
2. Confirmar que aparece el hero `Reserva tu espacio privado`.
3. Confirmar que las salas activas de `club_zones` aparecen en tarjetas premium.
4. Confirmar que Sala Negra, Sala Roja y Sala Dorada tienen diferencias visuales.
5. Confirmar que la Sala Dorada muestra `Mas exclusiva` y `Reservar premium`.
6. Confirmar que ninguna tarjeta usa `Compartir acceso` como CTA principal.
7. Probar desktop, tablet y movil para validar 3/2/1 columnas.
8. Si no hay salas activas, confirmar que se ve el estado vacio.

## Fase actual: refinamiento premium de cards VIP

### 1. Que se cambio en `/app/vip`

Se mantuvo la estructura y la logica de la fase anterior, pero se refinaron las cards para que cada sala tenga mas identidad visual sin sobrecargar la pagina:

- Sala Negra: acentos negro/plata, badge `Intima`, estilo lounge reservado.
- Sala Roja: acentos rojo vino, badge `Social`, tono mas energetico.
- Sala Dorada: acentos dorados, badges `Premium` y `Mas exclusiva`, glow mas marcado y CTA `Reservar premium`.
- Todas las salas mantienen badge `Disponible`.
- Se agrego hover suave con elevacion ligera, borde/glow sutil y movimiento de flecha en el CTA.
- Se ajusto el espaciado del hero y de la grilla para que las cards respiren mejor.
- Se igualo el peso visual de Sala Dorada con las demas cards: conserva badges premium, pero usa un glow mas sutil y una zona de badges con altura estable.
- Se suavizo el hover de las cajas principales con menor desplazamiento, sombras mas limpias y movimiento de flecha mas discreto.
- Se agrego jerarquia interna a cada card con una linea de ambiente por sala, detalles con acento propio y botones redondeados mas consistentes.
- Se agrego titulo propio para `/app/vip` en el shell de cliente, evitando que la ruta use el encabezado generico de bienvenida.

### 2. Que no se toco

- No se modifico `listVipRooms()`.
- No se cambio la consulta a `club_zones`.
- No se modificaron filtros `vip_room` / `private_room` ni `active=true`.
- No se tocaron migraciones, RLS, middleware, auth ni roles.
- No se introdujeron mocks nuevos.
- No se modificaron rutas fuera de `/app/vip`.
- Solo se ajusto `app/app/layout.tsx` para definir el titulo especifico de `/app/vip`; no se cambiaron permisos, roles ni navegacion.

### 3. Como probar visualmente

1. Abrir `/app/vip`.
2. Confirmar que la grilla mantiene 3/2/1 columnas segun ancho.
3. Confirmar que Sala Negra, Roja y Dorada tienen identidad visual distinta.
4. Confirmar que Sala Dorada se percibe como la mas exclusiva.
5. Pasar el cursor sobre las cards y verificar hover suave, glow y movimiento de flecha.
6. Confirmar que los CTAs siguen navegando a la ruta actual de cada sala.
7. Confirmar que el encabezado de desktop dice `Salas VIP` y no el texto generico de bienvenida.

### 4. Riesgos o pendientes

- Los estilos dependen del nombre o `color_theme` de la sala para clasificar Negra, Roja o Dorada.
- La accion de reserva aun navega al flujo existente de compartir/acceso; queda pendiente implementar reserva real si se define el flujo de pagos o booking.

## Fase actual: rediseño visual de Mi turno en vivo

### 1. Que se cambio en `/app/my-turn`

- Se reemplazo la presentacion basica por una vista premium con hero propio `Mi turno en vivo`.
- Se agrego el subtitulo `Apúntate para cantar, tocar o subir al escenario esta noche.`
- Se evito el encabezado generico `Bienvenido a FLEX` en esta ruta mediante un titulo especifico en el shell de usuario.
- El estado del turno ahora muestra `Sin turno activo` cuando el usuario aun no esta en cola.
- Cuando hay posicion, la vista muestra posicion, espera estimada y estado en tarjetas claras con badges.
- El formulario se encapsulo en una tarjeta premium con los campos `Nombre artístico`, `Tipo de participación` e `Instrumento opcional`.
- El CTA principal queda como `Unirme a la lista`.
- Se agrego una tarjeta lateral `Cómo funciona` con cuatro pasos cortos para dar contexto a la experiencia.
- Se agregaron hovers y transiciones suaves en tarjetas, campos y elementos visuales.

### 2. Que no se toco

- No se modifico `joinLiveQueue()`.
- No se cambio la conexion real con Supabase.
- No se cambiaron validaciones funcionales existentes.
- No se tocaron middleware, migraciones, RLS, roles ni rutas.
- No se agregaron dependencias ni mocks.

### 3. Como probar manualmente

1. Iniciar sesion como usuario y abrir `/app/my-turn`.
2. Confirmar que el encabezado de desktop dice `Mi turno en vivo` y no `Bienvenido a FLEX`.
3. Confirmar que el estado inicial muestra `Sin turno activo`.
4. Intentar enviar sin nombre artistico y validar que aparece el error existente.
5. Seleccionar `Instrumento` sin completar el instrumento y validar que aparece el error existente.
6. Completar el formulario y confirmar que se llama al flujo real de cola.
7. Confirmar que al recibir posicion se muestran posicion, espera estimada y estado activo.
8. Revisar desktop y movil para validar layout de dos columnas y una columna respectivamente.

### 4. Riesgos o pendientes

- La espera `20 - 30 min` sigue siendo el valor estimado que ya mostraba la pantalla anterior.
- Queda pendiente conectar una estimacion dinamica si se define una regla de calculo desde la cola real.

## Fase actual: simplificacion de Mi turno en vivo

### 1. Que se cambio en `/app/my-turn`

- Se redujo el hero superior a una franja compacta dentro del bloque principal.
- El estado actual del turno paso a ser el primer bloque visible y la jerarquia principal de la pagina.
- Se unio visualmente el estado con el formulario en una sola tarjeta, separada por columnas en desktop y por secciones en movil.
- Se redujo la cantidad de tarjetas, bordes y badges para evitar competencia visual.
- La guia rapida lateral se compacto en una sola tarjeta secundaria, sin cajas internas por cada paso.
- Se mantuvo el estilo FLEX oscuro, dorado y rojo oscuro con bordes suaves.
- Se mantuvo el responsive: panel principal + guia en desktop, una columna en movil.

### 2. Que no se toco

- No se modifico `joinLiveQueue()`.
- No se cambiaron validaciones, estado local ni flujo de envio.
- No se cambio la conexion real con Supabase.
- No se tocaron middleware, migraciones, RLS, roles ni rutas.
- No se agregaron mocks ni dependencias.

### 3. Como probar manualmente

1. Iniciar sesion como usuario y abrir `/app/my-turn`.
2. Confirmar que el estado actual aparece como primer foco de lectura.
3. Confirmar que el estado inicial muestra `Sin turno activo`.
4. Enviar sin nombre artistico y validar que aparece el error existente.
5. Seleccionar `Instrumento` sin completar instrumento y validar que aparece el error existente.
6. Completar el formulario y confirmar que se mantiene el flujo real de cola.
7. Confirmar que al recibir posicion se muestra el numero, espera estimada y estado.
8. Revisar desktop y movil para confirmar que la pagina queda limpia y legible.

### 4. Riesgos o pendientes

- La espera `20 - 30 min` sigue siendo un valor fijo heredado de la vista anterior.
- Queda pendiente una estimacion dinamica si se define una regla de calculo basada en la cola real.

## Fase actual: mejora visual de pedir cancion

### 1. Que se cambio en `/app/song-request`

- Se reemplazo la vista basica por una composicion premium con tarjeta principal y columna secundaria.
- Se agrego encabezado contextual para la ruta: `Pide tu canción`, evitando el encabezado generico `Bienvenido a FLEX`.
- La tarjeta principal ahora presenta el formulario como accion central con mejor jerarquia, padding y espaciado.
- Los campos se organizaron en una grilla responsive: cancion y artista en dos columnas cuando hay espacio, genero y dedicatoria debajo.
- Se agrego estado visual del pedido: `Pendiente` antes de enviar y `Enviado` cuando la accion termina correctamente.
- Se agrego un bloque lateral ligero con consejos rapidos para pedir canciones sin cargar la interfaz.
- Se mantuvo la estetica FLEX: fondo oscuro, acento dorado, rojo oscuro sutil, bordes suaves y botones claros.

### 2. Que no se toco

- No se modifico `submitSongRequest()`.
- No se cambiaron validaciones ni flujo de envio.
- No se cambio la conexion real con Supabase.
- No se tocaron middleware, roles, RLS, migraciones ni base de datos.
- No se agregaron mocks ni dependencias.
- No se cambiaron rutas existentes.

### 3. Como probar manualmente

1. Iniciar sesion como usuario y abrir `/app/song-request`.
2. Confirmar que el header de desktop muestra `Pide tu canción` y no `Bienvenido a FLEX`.
3. Confirmar que el formulario es el elemento principal de la pantalla.
4. Enviar sin completar cancion, artista o genero y validar el error existente.
5. Completar cancion, artista y genero, enviar y confirmar el feedback de exito.
6. Confirmar que el estado visual cambia de `Pendiente` a `Enviado`.
7. Revisar desktop y movil para validar que el layout pasa de dos columnas a una columna sin overflow.

### 4. Riesgos o pendientes

- El estado visual `Enviado` depende del feedback local existente tras enviar la solicitud.
- Queda pendiente conectar estados reales como `approved`, `playing`, `played` o `rejected` si se implementa una vista de seguimiento por usuario.
