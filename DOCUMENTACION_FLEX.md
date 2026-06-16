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

## Fase actual: refinamiento visual de pedir cancion

### 1. Que se cambio en `/app/song-request`

- Se ajusto el encabezado especifico de la ruta a `Pide tu cancion` con el subtitulo `Envia el tema que quieres escuchar esta noche.`.
- La tarjeta principal se centro en el formulario `Solicitud musical` con el texto `Completa los datos para que el DJ revise tu pedido.`.
- Se mantuvieron los campos actuales: cancion, artista, genero y dedicatoria opcional.
- El boton principal cambio a `Enviar solicitud`.
- Se agrego feedback claro para `Enviando...`, `Solicitud enviada` y `Error al enviar`.
- Se agrego una tarjeta lateral `Como funciona` con cuatro pasos del flujo de revision del DJ.
- Se agrego la mini card `Consejo FLEX` para recomendar escribir bien cancion y artista.
- El layout queda en dos columnas en desktop y una columna en movil, manteniendo estilo oscuro, dorado y rojo vino sutil.

### 2. Que no se toco

- No se modifico `submitSongRequest()`.
- No se cambio la conexion real con Supabase.
- No se tocaron middleware, roles, RLS, migraciones ni base de datos.
- No se agregaron mocks ni dependencias.
- No se cambiaron rutas existentes.

### 3. Como probar manualmente

1. Iniciar sesion como usuario y abrir `/app/song-request`.
2. Confirmar que el encabezado de desktop muestra `Pide tu cancion` y no `Bienvenido a FLEX`.
3. Confirmar que el subtitulo muestra `Envia el tema que quieres escuchar esta noche.`.
4. Confirmar que el formulario muestra `Solicitud musical` y conserva cancion, artista, genero y dedicatoria opcional.
5. Enviar sin completar datos requeridos y confirmar el feedback `Error al enviar`.
6. Completar cancion, artista y genero, enviar y confirmar `Enviando...` y luego `Solicitud enviada`.
7. Revisar desktop y movil para validar dos columnas y una columna sin overflow.

### 4. Riesgos o pendientes

- La pantalla sigue sin mostrar seguimiento historico del estado real del pedido (`approved`, `playing`, `played` o `rejected`).
- El genero sigue viajando por el flujo existente de `submitSongRequest()`; no se creo columna ni backend nuevo.

## Fase actual: pulido visual de home cliente

### 1. Que se cambio en `/app`

- Se ajusto el espaciado general entre hero, accesos rapidos, Hoy en FLEX, columna derecha y proximos eventos.
- El hero mantiene la imagen y el evento actual, pero usa padding mas respirado y un badge `Proxima Live Session` mas compacto.
- Los accesos rapidos mantienen las cuatro cards existentes y actualizan sus textos:
  - `Pedir cancion`: `Envia tu tema al DJ`.
  - `Mi turno`: `Consulta tu posicion`.
  - `Mis entradas`: `Muestra tu QR`.
  - `Salas VIP`: `Reserva para tu grupo`.
- Las cards de accesos rapidos ahora se perciben mas clicables con hover/focus suave, icono en superficie dorada y flecha con micro desplazamiento.
- El empty state de `Hoy en FLEX` cambio a `Hoy todavia esta tranquilo` y `Cuando haya promociones, actividades o avisos apareceran aqui.`
- El bloque vacio de Hoy en FLEX queda mas compacto y mantiene el CTA `Ver avisos`.
- La columna derecha mantiene `Mi turno`, `Mis entradas` y `Reserva privada`, con spacing alineado al contenido principal.

### 2. Que no se toco

- No se cambio la logica del evento mostrado en el hero.
- No se modifico la consulta real de `daily_feed_posts`.
- No se tocaron middleware, auth, roles, RLS, migraciones ni base de datos.
- No se agregaron mocks nuevos ni dependencias.
- No se cambiaron rutas ni logica de negocio.

### 3. Como probar manualmente

1. Iniciar sesion como usuario y abrir `/app`.
2. Confirmar que el hero conserva la imagen, evento, fecha, hora, zona y boton `Ver detalles`.
3. Confirmar que el badge `Proxima Live Session` se ve mas compacto.
4. Confirmar que los accesos rapidos muestran los cuatro textos nuevos y que toda la card es clicable.
5. Confirmar que `Hoy en FLEX` muestra avisos reales si existen.
6. Si no hay avisos, confirmar que aparece `Hoy todavia esta tranquilo` con el CTA `Ver avisos`.
7. Revisar en movil que el orden sea hero, accesos rapidos, Hoy en FLEX, columna derecha y proximos eventos, sin overflow horizontal.

### 4. Riesgos o pendientes

- La home sigue usando datos demo para algunos bloques laterales y proximos eventos, segun el estado actual del proyecto.
- Queda pendiente conectar esos resumenes a datos reales si se define esa fase.

## Fase actual: microinteracciones y navegación fluida

### 1. Problema detectado

La app ya tenia una base visual coherente, pero algunos elementos interactivos se sentian mas estaticos que las nuevas tarjetas de accesos rapidos en `/app`. El sidebar, botones y cards accionables necesitaban feedback visual mas claro para hover, focus y click sin perder la sobriedad FLEX.

### 2. Cambios aplicados al sidebar

- Se refinaron los items del sidebar en `AppShell` con hover dorado sutil, borde suave y transiciones de 200ms.
- El item activo ahora combina fondo dorado discreto, borde visible e indicador lateral, para no depender solo del color.
- Los iconos y textos cambian de color de forma gradual en hover y estado activo.
- Se agrego `aria-current="page"` a los items activos de navegacion desktop y movil.
- La navegacion movil adopta el mismo patron: estado activo con borde/fondo dorado sutil, hover claro y active state leve.
- Los botones de cabecera del shell, como notificaciones, menu y salir, ahora comparten hover/focus/active sobrio.

### 3. Cambios aplicados a botones/cards

- `FlexButton` centraliza transiciones de background, border, shadow, color y transform en 200ms.
- Los botones primarios, secundarios, danger y success tienen hover/focus mas coherente y active state leve al click.
- `FlexCard` soporta transiciones suaves de fondo, borde, sombra y transform para que las cards clicables no cambien bruscamente.
- `AdminQuickActionCard` se suavizo para alinear su hover con el resto de la app y evitar desplazamientos exagerados.
- El focus global `.gold-focus` ahora muestra aro dorado con halo suave para teclado.
- Se agrego soporte global simple a `prefers-reduced-motion` para reducir animaciones y transiciones si el usuario lo solicita.

### 4. Que no se toco

- No se modifico middleware.
- No se cambio auth, Supabase, roles, RLS ni migraciones.
- No se ejecutaron resets.
- No se agregaron mocks ni dependencias.
- No se cambiaron rutas ni navegacion por rol.
- No se modifico logica de negocio.

### 5. Como probar manualmente

1. Iniciar sesion y navegar por `/app`, `/app/today`, `/app/song-request`, `/app/my-turn`, `/app/tickets` y `/app/vip`.
2. En desktop, pasar el cursor por el sidebar y confirmar hover dorado sutil, iconos dorados y item activo claro.
3. Usar Tab para recorrer sidebar, botones de cabecera y botones principales; confirmar focus visible con aro dorado.
4. En movil, revisar la navegacion inferior y confirmar estado activo, hover/tap y ausencia de saltos de layout.
5. Probar botones primarios y secundarios en distintas pantallas y confirmar hover suave y active state leve.
6. Revisar tarjetas accionables como accesos rapidos y acciones admin para confirmar transiciones sobrias.

### 6. Pendientes

- Revisar pantallas placeholder futuras cuando se conviertan en flujos reales para aplicar el mismo patron.
- Si se define un sistema de componentes mas completo, extraer tokens de movimiento y estados interactivos a utilidades compartidas.

## Fase actual: próximos eventos con artistas

### 1. Carpeta usada para imágenes

Las imágenes locales de artistas/eventos se usan desde:

- `public/images/events/arcangel.jpg`
- `public/images/events/john-coltrane.jpg`
- `public/images/events/nejo.jpg`

Los archivos se normalizaron desde nombres con doble extension `.jpg.jpg` a nombres estables con extension real `.jpg`.

### 2. Eventos integrados

- `Jazz Nights`
  - Artista: `John Coltrane`
  - Fecha: `25 MAY`
  - Zona: `Pista principal`
  - Imagen: `/images/events/john-coltrane.jpg`
  - Spotify: `https://open.spotify.com/intl-es/track/7b9GTuHH5QPglZrKQATW8Q`
- `Latin Urban Night`
  - Artista: `Arcangel`
  - Fecha: `31 MAY`
  - Zona: `Escenario live`
  - Imagen: `/images/events/arcangel.jpg`
  - Spotify: `https://open.spotify.com/intl-es/artist/4SsVbpTthjScTS7U2hmr1X`
- `Reggaeton Classics`
  - Artista: `Nejo`
  - Fecha: `07 JUN`
  - Zona: `Pista principal`
  - Imagen: `/images/events/nejo.jpg`
  - Spotify: `https://open.spotify.com/intl-es/artist/2OHKEe204spO7G7NcbeO2o`

### 3. Rutas afectadas

- `/`
- `/app`
- `/app/events/[eventId]`

La ruta `/app/events` se mantiene con su carga real desde Supabase mediante `listPublishedEvents()`.
El hero de `/` y el hero principal de `/app` apuntan ahora a `/images/events/john-coltrane.jpg` porque los assets anteriores de `public/images/` ya no estaban disponibles en el directorio.

### 4. Fallback local o Supabase real

Para esta fase se uso un fallback local documentado en `lib/featured-events.ts` para la seccion `Proximos eventos` de la home y para los detalles internos. No se crearon migraciones ni columnas nuevas porque la tabla real `events` no tiene todavia campos como `artist`, `image_url` o `artist_url` documentados para este flujo.

### 5. Como funcionan los links

- Las cards de `Proximos eventos` en `/app` son clickeables completas.
- Cada card navega a una pagina interna de detalle:
  - `/app/events/jazz-nights`
  - `/app/events/latin-urban-night`
  - `/app/events/reggaeton-classics`
- Spotify no se abre desde la card de la home.
- El boton `Ver artista en Spotify` vive en el detalle y abre el enlace externo en una nueva pestaña.

### 6. Como agregar nuevos eventos/artistas

1. Agregar la imagen en `public/images/events/` con nombre estable, sin espacios ni tildes.
2. Agregar una entrada nueva en `lib/featured-events.ts` con `id`, `title`, `artist`, `date`, `zone`, `description`, `image` y `artistUrl`.
3. Usar un `id` limpio porque sera parte de la ruta `/app/events/[eventId]`.
4. Si en una fase futura se agregan campos reales a Supabase, migrar este fallback a datos reales sin reemplazar silenciosamente errores de Supabase por mocks.

### 7. Como probar

1. Abrir `/app`.
2. Confirmar que `Proximos eventos` muestra John Coltrane, Arcangel y Nejo con sus imagenes locales.
3. Confirmar que cada card completa navega a su detalle interno.
4. Abrir cada detalle y confirmar imagen grande, titulo, artista, fecha, zona y descripcion.
5. Pulsar `Ver artista en Spotify` y confirmar que abre el enlace externo correcto.
6. Pulsar `Volver` y confirmar que regresa a la home de usuario.

### 8. Pendientes

- Conectar artistas, imagenes y enlaces externos a Supabase cuando se definan columnas o tablas reales para esos metadatos.
- Mantener `/app/events` como lista real de eventos publicados y decidir si debe mezclar o no estos destacados locales.

## Fase actual: eventos reales con imágenes administrables

### 1. Problema detectado

La home `/app` mostraba `Proximos eventos` con cards visuales buenas, imagenes locales y enlaces de Spotify, pero esos datos vivian como fallback local en `lib/featured-events.ts`. El panel `/admin/events` seguia limitado a campos basicos y no permitia administrar artista, imagen, link externo ni destacado en home.

### 2. Auditoria de `public.events`

Columnas existentes antes de esta fase:

- `id`
- `title`
- `description`
- `starts_at`
- `ends_at`
- `cover_image_path`
- `capacity`
- `ticket_price_cents`
- `is_published`
- `created_at`
- `updated_at`

Policies existentes:

- `published events readable`: permite leer eventos publicados o a staff autenticado.
- `admin manage events`: permite gestionar eventos solo a `public.is_admin()`.

Columnas que faltaban para el flujo visual:

- `image_url`
- `artist_name`
- `artist_url`
- `external_url`
- `featured`
- `zone_name`

`starts_at` e `is_published` ya existian, asi que no se duplicaron.

### 3. Columnas agregadas

Se creo la migracion incremental:

- `supabase/migrations/20260603120000_event_media_admin_fields.sql`

Agrega con `IF NOT EXISTS`:

- `image_url text`
- `artist_name text`
- `artist_url text`
- `external_url text`
- `featured boolean not null default false`
- `zone_name text`

Tambien agrega el indice:

- `events_featured_starts_at_idx`

No se modificaron migraciones antiguas y no se ejecuto `supabase db reset`.

### 4. Bucket usado

Se define el bucket:

- `event-images`

La migracion lo crea como bucket publico para lectura de imagenes de eventos:

- usuarios normales pueden ver imagenes publicas del bucket;
- solo admin real puede insertar, actualizar o borrar objetos en `event-images`;
- la validacion usa `public.is_admin()`.

Si el proyecto ya esta corriendo y la migracion no se aplico aun, hay que aplicar migraciones desde el flujo normal de Supabase. No requiere reset por ser incremental.

### 5. Cambios en `/admin/events`

El admin ahora permite crear y editar:

- titulo;
- artista;
- fecha/hora de inicio;
- fecha/hora de fin;
- zona;
- descripcion;
- imagen subida al bucket `event-images` o `image_url` pegada manualmente;
- link Spotify/artista (`artist_url`);
- link externo opcional (`external_url`);
- capacidad;
- precio en cents;
- publicado/borrador;
- destacado en home.

Validaciones:

- titulo requerido;
- fecha requerida;
- capacidad mayor que 0;
- precio no negativo;
- `artist_url` y `external_url` deben ser URL validas si se completan.

### 6. Como aparecen en `/app`

La seccion `Proximos eventos` ahora consulta eventos reales publicados desde Supabase:

- filtra `is_published=true`;
- prioriza `featured=true`;
- muestra fechas futuras;
- ordena por destacado y fecha;
- usa `image_url` o `cover_image_path` si existe;
- si falta imagen, muestra fallback visual elegante con gradiente FLEX;
- mantiene hover premium: elevacion leve, borde dorado, zoom interno de imagen y flecha con desplazamiento.

Si no hay eventos reales publicados futuros, se mantiene el fallback local de compatibilidad desde `lib/featured-events.ts`.

### 7. Detalle de evento

La ruta `/app/events/[eventId]` ahora carga eventos reales publicados por UUID desde Supabase. Tambien mantiene compatibilidad con los slugs locales anteriores:

- `/app/events/jazz-nights`
- `/app/events/latin-urban-night`
- `/app/events/reggaeton-classics`

El detalle muestra:

- imagen grande o fallback visual;
- titulo;
- artista;
- fecha/hora;
- zona;
- descripcion;
- boton `Ver artista en Spotify` si existe `artist_url`;
- boton `Volver`.

### 8. Compatibilidad con imagenes locales

Se mantienen como fallback/compatibilidad:

- `public/images/events/arcangel.jpg`
- `public/images/events/john-coltrane.jpg`
- `public/images/events/nejo.jpg`

Los nuevos eventos creados desde admin no dependen de estos archivos: usan `image_url` generado desde Supabase Storage o pegado manualmente.

### 9. Como probar

1. Aplicar la migracion incremental en Supabase local sin ejecutar reset.
2. Iniciar sesion con un usuario admin real.
3. Abrir `/admin/events`.
4. Crear un evento con titulo, artista, fecha, zona, descripcion, imagen, link Spotify, `Publicado` y `Destacar en home`.
5. Guardar y confirmar mensaje de exito.
6. Abrir `/app` y confirmar que el evento aparece en `Proximos eventos`.
7. Entrar en la card y confirmar que `/app/events/[eventId]` muestra el detalle real.
8. Pulsar `Ver artista en Spotify` y confirmar que abre el enlace externo.
9. Volver a `/admin/events`, editar imagen o quitar destacado y confirmar que `/app` refleja el cambio.

### 10. Pendientes tecnicos

- Decidir si `/app/events` debe mostrar tambien borradores a staff o solo publicados a usuarios.
- Conectar compra real de entradas cuando el flujo Stripe de UI quede definido.
- Evaluar si conviene relacionar `zone_name` con `club_zones` en vez de mantenerlo como texto libre.
- Agregar borrado fisico de imagenes antiguas del bucket cuando se reemplacen, si se quiere limpiar storage automaticamente.

---

## Diagnostico y correccion de Proximos eventos en `/app` - 2026-06-04

### Causa encontrada

La migracion `supabase/migrations/20260603120000_event_media_admin_fields.sql` existia en el repositorio, pero no estaba aplicada en la base local. En `supabase_migrations.schema_migrations` solo aparecian las migraciones hasta `20260521103200`.

Por eso la consulta de `listFeaturedPublishedEvents()` fallaba al seleccionar columnas que no existian todavia en `public.events`:

- `image_url`
- `artist_name`
- `artist_url`
- `external_url`
- `featured`
- `zone_name`

Tambien faltaba el bucket publico `event-images`.

### Correccion aplicada

Se aplicaron las migraciones pendientes con:

```bash
supabase migration up
```

No se ejecuto `supabase db reset` y no se borraron usuarios ni datos locales.

Despues de aplicar la migracion, `public.events` ya tiene las columnas de media/admin y `storage.buckets` contiene `event-images` como bucket publico.

### Datos actuales observados

La base local tenia estos eventos relevantes:

- `Flex Live Sessions: Jazz Night`: publicado, pero con `starts_at` vencido.
- `Llegada de Cosculluela`: publicado y futuro, pero sin `image_url`, `artist_name`, `artist_url`, `zone_name` ni `featured`.

Esto significa que `/app` ya puede cargar un evento real futuro, pero el contenido visual/demo sigue incompleto hasta que se edite desde `/admin/events` o se ejecute un seed seguro.

### Cambios de codigo

- `components/app/HomeUpcomingEvents.tsx`: si Supabase devuelve un error real, se registra en consola solo en desarrollo y se muestra un mensaje elegante en UI.
- `app/app/events/[eventId]/page.tsx`: la ruta dinamica ahora usa `await params`, compatible con Next 16.
- `app/app/events/[eventId]/EventDetailClient.tsx`: se movio la logica cliente del detalle a un componente separado.

### Snippet seguro creado

Se creo:

- `supabase/snippets/seed_demo_events_without_reset.sql`

El snippet es idempotente y no hace reset. Actualiza por titulo si ya existen o inserta si faltan estos eventos demo:

- John Coltrane / `Jazz Nights`
- Arcangel / `Latin Urban Night`
- Nejo / `Reggaeton Classics`

Usa imagenes locales existentes en `public/images/events` y marca los eventos como publicados y destacados.

### Consulta verificada en `/app`

`listFeaturedPublishedEvents(3)` consulta `public.events` con:

- `select`: `id, title, description, starts_at, ends_at, cover_image_path, image_url, artist_name, artist_url, external_url, featured, zone_name`
- filtro `is_published=true`
- filtro `starts_at >= now`
- orden `featured desc`
- orden `starts_at asc`
- `limit 3`

El fallback local solo se usa si no hay eventos reales publicados futuros. Si Supabase devuelve un error real y mocks no estan habilitados, no se oculta con mocks.

### RLS verificado

La politica activa en `public.events` sigue siendo:

- `published events readable`: permite leer eventos publicados o eventos visibles para staff.
- `admin manage events`: mantiene la gestion limitada a admin real.

No se debilito middleware, roles ni auth.

### Como probar

1. Confirmar que Supabase local esta activo con `supabase status`.
2. Abrir `/app`.
3. Confirmar que `Proximos eventos` muestra el evento real futuro publicado.
4. Abrir la card y confirmar navegacion a `/app/events/[eventId]`.
5. Para tener las tres cards demo, ejecutar `supabase/snippets/seed_demo_events_without_reset.sql` desde Supabase Studio SQL Editor.
6. Recargar `/app` y confirmar que los destacados aparecen primero.
7. Abrir `/admin/events`, editar una imagen/artista/destacado y confirmar que `/app` refleja el cambio.

### Pendiente

- Ejecutar el snippet demo solo si se quieren datos demo completos en la base local. No se ejecuto automaticamente para evitar mezclar diagnostico de schema con cambios de contenido.

---

## Mejora visual de Hoy en FLEX `/app/today` - 2026-06-04

### Que se cambio

Se mejoro la presentacion visual de la pagina de usuario `/app/today` sin cambiar la logica de negocio ni la lectura real de Supabase.

Cambios aplicados:

- El layout de usuario ahora tiene encabezado especifico para `/app/today`:
  - titulo: `Hoy en FLEX`
  - subtitulo: `Promociones, eventos y avisos oficiales para vivir la noche.`
- Se agrego una cabecera visual compacta tipo mural oficial del dia con fondo oscuro, dorado y rojo vino sutil.
- Los filtros existentes se mantienen con los mismos valores y mejoran hover, focus, estado activo y scroll horizontal en mobile.
- El empty state ahora es mas util y premium:
  - titulo `La noche aun esta tranquila`
  - texto explicativo para publicaciones futuras
  - accesos secundarios a `/app` y `/app/vip`
- Se agrego una tarjeta secundaria `Feed oficial` para explicar el uso del feed cuando hay poco contenido.
- Las cards existentes de publicaciones mantienen su estructura y datos, con hover suave y elevacion ligera.

### Logica no tocada

No se modifico:

- consulta a `daily_feed_posts`;
- filtros por `is_published`, `starts_at` o `ends_at`;
- ordenamiento por fijado, prioridad, fecha y creacion;
- Supabase;
- middleware;
- auth;
- roles;
- RLS;
- migraciones;
- rutas existentes;
- mocks.

### Como probar

1. Abrir `/app/today` con sesion de usuario.
2. Confirmar que ya no aparece el encabezado generico `Bienvenido a FLEX` en desktop.
3. Confirmar que la cabecera visual muestra `Hoy en FLEX`.
4. Probar filtros: Todos, Eventos, Promos, Actividades, VIP, Escenario y Avisos.
5. En mobile, confirmar que los filtros hacen scroll horizontal sin overflow de pagina.
6. Si no hay publicaciones activas, confirmar el empty state con CTAs a `/app` y `/app/vip`.
7. Si hay publicaciones activas, confirmar que se siguen renderizando y que las cards mantienen prioridad, tipo, titulo, descripcion y CTA.

### Pendiente

- Revisar copy final con acentos cuando se normalice la codificacion de textos existentes en el proyecto.

---

## Mejora de gestion de eventos reales en `/admin/events` - 2026-06-04

### Que se cambio

Se reforzo la pantalla `/admin/events` para crear y editar eventos reales que alimentan la seccion `Proximos eventos` de `/app`.

La pantalla permite:

- crear eventos;
- editar eventos existentes;
- publicar y despublicar;
- marcar o quitar `featured`;
- subir imagen al bucket publico `event-images`;
- usar `image_url` manual con URL absoluta o ruta local;
- abrir el detalle publicado en `/app/events/[eventId]`;
- ver en el listado si un evento publicado y futuro queda `Visible home`.

### Campos gestionados

El formulario usa los campos reales de `public.events`:

- `title` requerido;
- `description`;
- `starts_at` requerido;
- `ends_at` opcional;
- `capacity` opcional, con fallback local a `600` si se deja vacio;
- `ticket_price_cents` opcional, con fallback local a `0` si se deja vacio;
- `cover_image_path`;
- `image_url`;
- `artist_name`;
- `artist_url`;
- `external_url`;
- `zone_name`;
- `is_published`;
- `featured`.

### Validaciones

- `title` y `starts_at` son obligatorios.
- `artist_url` debe ser URL valida si se completa.
- `external_url` debe ser URL valida si se completa.
- `image_url` manual debe ser URL valida o ruta local que empiece por `/`.
- `capacity` debe ser mayor que `0` si se completa.
- `ticket_price_cents` no puede ser negativo.

### Upload de imagen

El upload real quedo implementado desde UI usando Supabase Storage:

- bucket: `event-images`;
- solo admins reales pueden subir por la policy del bucket;
- despues de subir, se guarda la URL publica en `image_url` y tambien en `cover_image_path` para compatibilidad visual.

Tambien se mantiene el campo manual `image_url` para pegar imagenes externas o rutas locales existentes.

### Seguridad y logica no tocada

No se modifico:

- middleware;
- auth;
- roles;
- RLS;
- migraciones;
- bucket policies;
- lectura de `/app`;
- detalle `/app/events/[eventId]`;
- mocks.

La pantalla sigue usando `requireAdmin()` antes de leer, crear, editar, publicar, destacar o subir imagenes.

### Como hacer que aparezca en `/app`

1. Entrar con usuario admin real.
2. Abrir `/admin/events`.
3. Crear o editar un evento.
4. Completar `Titulo` y `Inicio`.
5. Usar una fecha futura en `Inicio`.
6. Activar `Publicado`.
7. Activar `Destacar en home` si debe aparecer primero.
8. Guardar.
9. Abrir `/app` y revisar `Proximos eventos`.

### Pendientes

- Borrado fisico de imagenes antiguas en `event-images` cuando se reemplaza una imagen.
- Relacionar `zone_name` con `club_zones` si se decide dejar de usar texto libre.
- Conectar compra real de entradas cuando Stripe UI quede definido.

---

## Dinamismo visual de home `/app` y carrusel de eventos - 2026-06-04

### Que se cambio

Se reemplazo el hero fijo de `/app` por un carrusel visual de eventos, manteniendo la estetica FLEX oscura, dorada y premium.

Archivos principales:

- `components/app/HomeEventCarousel.tsx`
- `app/app/page.tsx`
- `components/app/HomeUpcomingEvents.tsx`
- `components/app/HomeTodayPreview.tsx`
- `app/globals.css`

### Como funciona el carrusel

El hero consulta eventos publicados futuros con la misma fuente usada para `Proximos eventos`:

- `listFeaturedPublishedEvents(5)`
- orden por `featured desc`
- orden por `starts_at asc`
- limite de 5 eventos

Si hay menos de 3 eventos reales disponibles, el hero completa visualmente con el fallback local existente de `lib/featured-events.ts`. Esto es solo para que el carrusel no quede vacio o estatico; no cambia la consulta real ni crea mocks nuevos.

El carrusel:

- rota automaticamente cada 5.6 segundos;
- pausa el autoplay cuando el usuario hace hover;
- permite flecha anterior y siguiente;
- muestra puntos indicadores;
- el boton `Ver detalles` navega a `/app/events/[eventId]`;
- respeta `prefers-reduced-motion` desactivando autoplay y animaciones fuertes.

### Animaciones agregadas

- Hero: transicion suave de opacidad, escala leve y entrada del contenido.
- Proximos eventos: hover con elevacion leve, borde dorado, zoom interno de imagen, overlay dorado sutil y flecha con desplazamiento de 2px.
- Accesos rapidos: hover alineado con elevacion leve y flecha contenida.
- Hoy en FLEX: aparicion suave mediante clase `soft-enter`.

### Logica no tocada

No se modifico:

- Supabase;
- middleware;
- auth;
- roles;
- RLS;
- migraciones;
- rutas;
- `/app/events/[eventId]`;
- `/admin/events`;
- consulta de `daily_feed_posts`;
- flujo de tickets, VIP, cola ni canciones.

### Como probar

1. Abrir `/app`.
2. Confirmar que el hero muestra evento real publicado futuro si existe.
3. Confirmar que rota cada 5 o 6 segundos.
4. Hacer hover sobre el hero y verificar que se pausa.
5. Usar flechas e indicadores para cambiar manualmente.
6. Pulsar `Ver detalles` y confirmar navegacion a `/app/events/[eventId]`.
7. Revisar hover de cards en `Proximos eventos`.
8. Revisar mobile y confirmar que no hay overflow horizontal.
9. Si el sistema tiene `prefers-reduced-motion`, confirmar que la experiencia queda estable y manual.

### Pendientes

- Evaluar si en el futuro conviene cargar imagenes con `next/image` cuando se estandaricen dominios remotos de Supabase Storage.

---

## Refinamiento minimalista del hero carrusel `/app` - 2026-06-04

### Que se cambio

Se refino el hero/carrusel principal de `/app` para que se vea mas limpio, sobrio y premium sin cambiar la logica de carga de eventos.

Cambios visuales:

- Se elimino el texto auxiliar `Rotacion suave`.
- El badge queda fijo como `Evento destacado`.
- El titulo del evento queda como elemento protagonista.
- Artista, fecha, hora y zona se compactan en una sola linea secundaria.
- La descripcion se limita a un bloque mas estrecho y con mas aire vertical.
- El bloque de texto usa un ancho maximo menor para evitar saturacion visual.
- Los controles se agruparon en una unica pastilla discreta con flechas e indicadores.
- El overlay se ajusto para oscurecer mas la zona del texto y abrir suavemente hacia la imagen.

### Logica no tocada

No se modifico:

- `listFeaturedPublishedEvents(5)`;
- fallback visual existente;
- autoplay de 5.6 segundos;
- pausa en hover;
- navegacion a `/app/events/[eventId]`;
- Supabase;
- auth;
- middleware;
- roles;
- RLS;
- migraciones;
- `/admin/events`.

### Como probar

1. Abrir `/app`.
2. Confirmar que el hero mantiene el carrusel y la rotacion automatica.
3. Confirmar que ya no aparece `Rotacion suave`.
4. Verificar que la linea secundaria muestra artista, fecha, hora y zona.
5. Usar flechas e indicadores agrupados arriba a la derecha.
6. Hacer hover sobre el hero y confirmar que el autoplay se pausa.
7. Probar en mobile que controles y texto no se superponen ni generan overflow horizontal.

---

## Microinteracciones premium en home `/app` - 2026-06-04

### Que se cambio

Se agregaron microinteracciones sutiles para que la home se sienta mas viva sin perder sobriedad ni rendimiento.

Cambios aplicados:

- Barra de progreso fina en el hero/carrusel:
  - se llena durante el intervalo de autoplay;
  - se reinicia al cambiar de evento;
  - se pausa cuando el carrusel esta en hover;
  - se oculta si `prefers-reduced-motion` esta activo.
- Entrada suave de secciones principales:
  - hero;
  - accesos rapidos;
  - Hoy en FLEX;
  - Proximos eventos.
- Botones principales:
  - brillo dorado sutil en hover;
  - elevacion minima;
  - active con escala leve.
- Skeletons:
  - base mas oscura;
  - brillo dorado muy suave;
  - sin animacion agresiva.
- Cards de eventos mantienen hover premium con zoom interno leve, overlay dorado sutil, borde dorado y flecha contenida.

### Que se evito

- No se agregaron librerias.
- No se usaron rebotes ni animaciones tipo gaming.
- No se animaron todas las piezas con la misma intensidad.
- No se cambiaron textos, rutas ni datos.
- No se agregaron animaciones pesadas sobre imagenes grandes.

### Logica no tocada

No se modifico:

- Supabase;
- auth;
- middleware;
- roles;
- RLS;
- migraciones;
- consulta de eventos;
- consulta de `daily_feed_posts`;
- `/app/events/[eventId]`;
- `/admin/events`;
- reglas de negocio.

### Como probar

1. Abrir `/app`.
2. Confirmar que el hero muestra una linea fina de progreso dorada abajo.
3. Esperar el autoplay y verificar que la barra se reinicia al cambiar de evento.
4. Hacer hover sobre el hero y confirmar que la barra se pausa.
5. Usar flechas o puntos y confirmar que el progreso reinicia.
6. Recargar y observar entrada suave de hero, accesos, Hoy en FLEX y Proximos eventos.
7. Revisar hover/active de botones.
8. Revisar loading de eventos o feed y confirmar skeleton oscuro con brillo suave.
9. En mobile, confirmar que no aparece overflow horizontal.

---

## Fase actual: precios de entradas por zona - 2026-06-04

### Problema detectado

`public.events.ticket_price_cents` solo permite un precio generico por evento. Para eventos reales de FLEX se necesita manejar precios por zona o tipo de entrada, por ejemplo General, Pista principal o VIP Lounge.

### Base de datos

Se creo la migracion incremental:

- `supabase/migrations/20260604160000_event_ticket_tiers.sql`

Nueva tabla:

- `public.event_ticket_tiers`

Campos principales:

- `event_id`: referencia a `public.events(id)` con `on delete cascade`.
- `name`: nombre del tipo de entrada.
- `zone_name`: zona asociada.
- `description`: descripcion visible.
- `price_cents`: precio en centimos.
- `currency`: moneda, por defecto `EUR`.
- `capacity`: cupo opcional.
- `available_quantity`: disponibilidad opcional.
- `active`: controla si se muestra al usuario.
- `sort_order`: orden visual.

La migracion agrega indices por `event_id`, `active` y `sort_order`, y reutiliza `public.set_updated_at()` para mantener `updated_at`.

### RLS aplicada

RLS queda habilitado en `public.event_ticket_tiers`.

Policies:

- Usuarios autenticados pueden leer tiers activos de eventos publicados.
- Staff autenticado con rol operativo puede leer todos los tiers.
- Admin puede insertar, actualizar y eliminar tiers.

No se modificaron middleware, auth, roles ni policies existentes de otras tablas.

### App usuario

En `/app`, las cards de `Proximos eventos` muestran el precio minimo activo:

- Si hay tiers activos: `Desde 20 EUR`.
- Si no hay tiers: fallback a `events.ticket_price_cents`.
- Si no hay precio disponible: `Precio por anunciar`.

En `/app/events/[eventId]` se agrego la seccion `Entradas disponibles`:

- lista los tiers activos del evento;
- muestra nombre, zona, descripcion, precio y disponibilidad si existe;
- incluye boton visual `Seleccionar` por tier.

### Admin events

En `/admin/events` se agrego la seccion `Precios por zona` al editar un evento existente.

El admin puede:

- listar tiers del evento;
- crear tiers;
- editar tiers;
- activar o desactivar tiers.

No se implemento borrado desde UI en esta fase. La alternativa segura es desactivar el tier.

### Snippet demo

Se creo:

- `supabase/snippets/seed_event_ticket_tiers_without_reset.sql`

El snippet es idempotente y agrega o actualiza tiers demo para eventos publicados existentes:

- General
- Pista principal
- VIP Lounge

Uso recomendado:

1. Aplicar la migracion con `supabase migration up`.
2. Ejecutar el snippet en Supabase SQL Editor o `psql`.
3. Abrir `/app` y confirmar precios en `Proximos eventos`.
4. Abrir `/app/events/[eventId]` y confirmar `Entradas disponibles`.

### Pendientes

- Checkout real por tier.
- Reserva/stock real por `available_quantity`.
- Integracion Stripe por tipo de entrada.
- Historial de cambios de precios.

---

## Mejora visual del detalle de evento `/app/events/[eventId]` - 2026-06-08

### Que se cambio

Se amplio la pagina de detalle de evento para que el contenido posterior al hero no quede vacio y mantenga una presentacion mas completa, premium y util para el usuario.

Cambios aplicados:

- Se mantiene el hero principal con imagen grande, overlay oscuro, badge `Proximo evento` o `Evento destacado`, titulo, artista y descripcion.
- Si la descripcion esta vacia o es demasiado corta, se usa un fallback editorial breve:
  `Una experiencia musical disenada para vivir la noche con ritmo, ambiente premium y conexion con el escenario.`
- Debajo del hero se agrego una zona principal con tarjetas:
  - `Sobre el evento`;
  - `Programacion`;
  - `Experiencia incluida`.
- `Experiencia incluida` muestra highlights visuales con iconos existentes de `lucide-react`:
  - Ambiente premium;
  - Pista principal;
  - Musica en vivo / DJ set;
  - Zonas VIP disponibles.
- `Programacion` muestra una card compacta con apertura, live session / show principal y DJ set / cierre, usando la hora real de `starts_at` para el show principal y copy de proximamente para los detalles no existentes.
- La sidebar mantiene fecha, zona, artista, entradas, boton Spotify si existe `artist_url` y boton `Volver`, con espaciado y bloques internos mas suaves.
- `Entradas disponibles` muestra el resumen `Desde X EUR` cuando hay tiers activos o precio base; si no hay tiers, mantiene un mensaje elegante sin crear nueva logica.

### Logica no tocada

No se modifico:

- Supabase;
- migraciones;
- `event_ticket_tiers`;
- pagos;
- Stripe;
- middleware;
- auth;
- roles;
- RLS;
- rutas `/app` ni `/app/events`;
- consultas existentes de detalle de evento y tiers activos.

### Como probar

1. Abrir `/app/events/[eventId]` con un evento publicado.
2. Confirmar que el hero conserva imagen, badge, titulo, artista y descripcion legible.
3. Revisar que debajo del hero aparecen `Sobre el evento`, `Programacion` y `Experiencia incluida`.
4. Confirmar que la sidebar muestra fecha, zona, artista, resumen de precio y tiers si existen.
5. Confirmar que `Ver artista en Spotify` solo aparece si el evento tiene `artist_url`.
6. Probar en mobile que la sidebar baja debajo del contenido y no hay overflow horizontal.

### Pendiente

- Sustituir el copy generico de `Programacion` por datos reales si en el futuro se define una tabla o modelo de agenda por evento.

---

## Fase actual: responsive y fluidez de la home - 2026-06-08

### Problema detectado

En `/app`, el layout activaba el modo desktop completo desde `xl` dentro de una pantalla que ya tenia sidebar izquierda fija. En portatiles cercanos a 1280px, la home quedaba con:

- sidebar izquierda de navegacion;
- sidebar derecha de 390px;
- contenido principal demasiado estrecho;
- `Proximos eventos` forzado a tres columnas desde `md`.

Esa combinacion hacia que las cards de eventos quedaran angostas y que titulos/precios se partieran de forma poco legible.

### Ajustes al grid principal

Se cambio el layout de `/app` para que el modo contenido + sidebar derecha solo entre en `2xl`.

Cambios principales:

- El grid principal usa `minmax(0, 1fr)` y `min-w-0` para evitar overflow horizontal.
- La sidebar derecha baja debajo del contenido en pantallas medianas y portatiles.
- En `2xl`, la sidebar vuelve a la derecha con ancho menor y comportamiento sticky.
- La sidebar izquierda del shell reduce ancho/padding en `lg` y recupera el ancho anterior en `xl`.
- El `main` del shell usa `overflow-x-hidden` como proteccion contra desbordes accidentales.

### Ajustes a Proximos eventos

La seccion `Proximos eventos` dejo de usar `md:grid-cols-3` fijo.

Ahora usa un grid responsive con cards de ancho minimo aproximado de 260px:

- en mobile: una columna;
- en tablets/portatiles: una o dos columnas segun espacio real;
- en escritorio amplio: tres columnas cuando el ancho lo permite.

Tambien se ajusto:

- altura de card estable;
- titulo con `line-clamp-2`;
- precio y zona con truncado elegante;
- mantenimiento del hover premium existente.

### Ajustes de scroll y fluidez

Se revisaron efectos visuales que podian penalizar el scroll:

- se elimino `backdrop-blur` del nav mobile;
- se elimino `backdrop-blur` de los controles del carrusel;
- se quito la transicion de `filter` y el `blur` en slides inactivos del carrusel;
- se redujo la escala de imagen inactiva del carrusel;
- se reemplazaron transiciones genericas por transiciones especificas en controles frecuentes.

Se mantiene `prefers-reduced-motion` ya existente para animaciones globales, progreso de hero y skeletons.

### Que no se toco

No se modifico:

- Supabase;
- queries de eventos;
- auth;
- middleware;
- roles;
- RLS;
- migraciones;
- datos demo;
- pagos;
- Stripe;
- logica de negocio.

### Como probar

1. Abrir `/app`.
2. Probar ancho 1366px y confirmar que el contenido principal no queda apretado por la sidebar derecha.
3. Probar ancho 1280px y confirmar que la sidebar derecha baja debajo del contenido principal.
4. Probar ancho 1024px y confirmar que no hay overflow horizontal.
5. Revisar `Proximos eventos` y confirmar que las cards mantienen ancho razonable y texto legible.
6. Revisar el hero/carrusel y confirmar que controles, texto y CTA no se superponen.
7. Probar mobile y confirmar que bottom nav, hero, eventos y cards laterales no desbordan.
8. Hacer scroll por la home y confirmar que se siente mas estable y sin efectos pesados visibles.

---

## Fase actual: optimizacion de scroll y performance visual - 2026-06-08

### Causa probable

La home `/app` mantenia varios costes visuales acumulados:

- imagenes de hero y eventos pintadas como `background-image`, sin `sizes`, `priority` ni lazy loading controlado;
- varias imagenes del carrusel montadas simultaneamente aunque solo una estuviera visible;
- sombras grandes repetidas en cards, botones y superficies;
- animacion de ancho en indicadores del carrusel;
- secciones inferiores renderizadas y pintadas aunque estuvieran fuera del viewport.

No se encontro `background-attachment: fixed` ni `scroll-behavior: smooth` global activo.

### Optimizaciones aplicadas

Se creo `OptimizedBackdropImage` para usar `next/image` como fondo visual cuando la imagen es local o viene de Supabase local/hosted. Si una URL externa no esta contemplada por Next, mantiene fallback visual con `background-image` para no romper eventos existentes.

Tambien se ajusto `next.config.ts` con `remotePatterns` para:

- Supabase local `127.0.0.1:54321`;
- Supabase local `localhost:54321`;
- proyectos `*.supabase.co` en Storage publico.

### Imagenes revisadas

Se actualizaron:

- hero/carrusel de `/app`;
- cards de `Proximos eventos`.

Cambios:

- `next/image` con `fill`;
- `sizes` segun viewport;
- `priority` solo para la primera imagen inicial del carrusel;
- hover zoom mas leve;
- fallback conservado para URLs externas no optimizables.

### Animaciones optimizadas

Se mantuvo:

- fade/scale suave del carrusel;
- barra de progreso del hero;
- hover premium de cards;
- respeto a `prefers-reduced-motion`.

Se aligero:

- el carrusel renderiza solo slide activo y vecinos cercanos, no todas las imagenes;
- el componente del carrusel se memoizo;
- el indicador activo dejo de animar `width` y usa `transform`;
- la transicion de imagenes sigue usando `opacity/transform`, no `filter`;
- el shimmer de skeleton es mas lento para reducir actividad continua.

### CSS ajustado

Se redujeron sombras globales y de hover sin cambiar la estetica:

- `.surface`;
- botones principales y ghost;
- cards de accesos rapidos;
- cards de eventos;
- estado activo del nav lateral.

Se agrego:

- `content-visibility: auto` en secciones inferiores de `/app`;
- `contain: layout paint style` en cards donde no afecta el layout.

### Que no se toco

No se modifico:

- Supabase;
- queries;
- auth;
- middleware;
- roles;
- RLS;
- migraciones;
- pagos;
- Stripe;
- rutas;
- datos demo;
- textos;
- estructura general de la UI.

### Como probar manualmente

1. Abrir `/app`.
2. Hacer scroll rapido arriba y abajo.
3. Confirmar que el hero conserva imagen, overlay, texto, controles y progreso.
4. Probar hover en accesos rapidos y `Proximos eventos`.
5. Confirmar que las imagenes de eventos siguen cargando.
6. Probar el carrusel manual y automatico.
7. Probar en pantalla de portatil, especialmente 1280px y 1366px.
8. Confirmar que no hay overflow horizontal ni saltos visuales al entrar a secciones inferiores.

---

## Fase actual: diagnostico de rendimiento del area privada - 2026-06-08

### Problema detectado

En build local con `npm run start`, login y register ya respondian mejor, pero la navegacion dentro de `/app` seguia sintiendose pesada. La lentitud estaba concentrada en el area privada de usuario y no en toda la aplicacion.

### Causa encontrada

La causa mas probable era una combinacion de trabajo repetido en cada navegacion privada:

- `app/app/layout.tsx` era un Client Component y envolvia todo `/app` con `RoleGate`.
- `RoleGate` hacia una validacion client-side de Supabase Auth antes de pintar el area privada de usuario.
- El middleware ya protegia `/app`, por lo que esa validacion cliente duplicaba trabajo y podia retrasar el render inicial del area privada.
- El middleware usaba la ruta completa de rol para todas las rutas protegidas, incluyendo `/app`, lo que podia consultar `staff_profiles` aunque el area de usuario solo necesita una sesion autenticada.
- La sidebar, bottom nav y cards visibles de `/app` tenian muchos `Link` internos susceptibles de prefetch automatico, disparando trabajo de rutas privadas que el usuario no habia abierto.

### Cambios en AppShell/layout

`app/app/layout.tsx` volvio a ser Server Component y dejo de envolver `/app` con `RoleGate`. El control real de acceso se mantiene en middleware.

La navegacion de usuario se movio a `UserAppShell`, un wrapper cliente pequeño que importa `userNav` y entrega `role="user"` a `AppShell`. Esto evita pasar iconos/componentes desde Server Components a Client Components y mantiene fuera del layout la validacion client-side duplicada.

En `AppShell` se memoizaron:

- navegacion visible;
- navegacion segura de fallback;
- header segun ruta.

Tambien se desactivo el prefetch automatico en la navegacion persistente lateral y movil del area privada.

### Optimizaciones de navegacion

Se agrego `getServerUser` para validar solo sesion autenticada cuando la ruta pertenece a `/app`. Las areas operativas `/admin`, `/guard` y `/storage` siguen usando `getServerUserAndRole`, por lo que continuan consultando rol activo en `staff_profiles`.

Esto evita una consulta de rol innecesaria para rutas normales de usuario sin debilitar la proteccion:

- usuario sin sesion en `/app`: sigue redirigido a `/login`;
- rutas staff/admin/guard/storage: siguen protegidas por rol;
- `canRoleAccessPath` sigue siendo la comprobacion final del middleware.

Tambien se desactivo `prefetch` en enlaces internos visibles de la home, carrusel, proximos eventos, Hoy en FLEX y cards de salas VIP para reducir trabajo de fondo durante scroll y navegacion.

### Componentes client reducidos

Se redujo el alcance client del area privada eliminando `RoleGate` del layout de usuario. Los componentes que necesitan interaccion siguen siendo Client Components:

- `UserAppShell`, porque contiene la navegacion con iconos importados en cliente;
- `AppShell`, por navegacion activa y logout;
- carrusel de eventos;
- previews con carga cliente;
- formularios y vistas interactivas.

No se migraron formularios ni paginas con interaccion a Server Components para evitar cambios de logica.

### Carrusel

No se cambio el diseno del carrusel en esta fase. Se mantuvieron las optimizaciones visuales anteriores y se desactivo el prefetch del CTA `Ver detalles` para que el carrusel no prepare automaticamente la pagina de detalle mientras el usuario solo navega la home.

### CSS

No se agrego un rediseño visual. Se mantienen los ajustes de performance visual previos: menos blur, sombras mas ligeras, transiciones especificas, contencion visual y `next/image` para hero/cards donde aplica.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- roles;
- flujo de auth;
- middleware como proteccion real;
- pagos;
- Stripe;
- consultas de negocio de eventos, VIP, tickets o feed;
- estructura visual principal de la marca.

### Como probar manualmente

1. Ejecutar `npm run dev` y abrir `/app`.
2. Navegar entre `/app`, `/app/vip`, `/app/my-turn`, `/app/events` y volver a `/app`.
3. Confirmar que la sidebar y bottom nav responden sin bloqueo perceptible.
4. Hacer scroll arriba/abajo en `/app` y probar hover en cards.
5. Probar el carrusel y abrir `Ver detalles` manualmente.
6. Ejecutar `npm run build` y luego `npm run start`.
7. Repetir la navegacion anterior en produccion local.
8. Confirmar que login/register siguen funcionando y que una sesion no autenticada en `/app` redirige a `/login`.

---

## Ajuste visual del carrusel principal - 2026-06-08

### Problema detectado

Despues de la fase de optimizacion, el carrusel principal de `/app` quedo funcional pero visualmente desbalanceado:

- altura demasiado protagonista en laptop;
- titulos muy grandes y con cortes poco elegantes;
- controles con demasiado peso visual;
- progreso inferior como linea suelta;
- overlay demasiado plano y oscuro sobre la imagen;
- demasiado empuje vertical antes de `Accesos rapidos`.

### Cambios de tamaño y jerarquia

Se ajusto `HomeEventCarousel` para mantener el hero como elemento principal sin ocupar tanto alto en pantallas de portatil.

Cambios:

- altura responsive mas contenida en mobile/laptop y mas amplia solo en escritorio grande;
- skeleton de carga con la misma proporcion del hero final;
- badge en mayusculas `EVENTO DESTACADO`;
- titulo con maximo dos lineas, ancho maximo y tamaño responsive mas moderado;
- `line-height` mas compacto y equilibrado;
- descripcion limitada a una linea en mobile y dos lineas desde `sm`;
- CTA mas cerca del contenido para reducir espacio muerto.

### Cambios en controles

Los controles del carrusel se hicieron mas discretos:

- capsula superior mas pequeña y menos opaca;
- flechas con menor tamaño y menor protagonismo;
- indicadores mas pequeños;
- indicador activo animado con `transform`, no con ancho;
- se mantienen `aria-label`, navegacion manual y autoplay.

### Cambios en progreso

La barra de progreso se integro dentro del hero como una pista redondeada inferior con margen lateral. Sigue reiniciandose al cambiar de slide mediante `key={activeIndex}` y mantiene animacion basada en `transform` a traves de `.hero-progress`.

### Cambios en overlay

El overlay se rebalanceo para conservar legibilidad sin apagar toda la imagen:

- lado izquierdo mas oscuro para texto;
- centro/derecha mas visible para imagen/artista;
- degradado inferior mas suave;
- brillo dorado radial mas sutil;
- sin filtros pesados.

### Que no se toco

No se modifico:

- Supabase;
- migraciones;
- RLS;
- roles;
- auth;
- middleware;
- queries de eventos;
- cards de accesos rapidos;
- Hoy en FLEX;
- Proximos eventos;
- sidebar;
- pagos;
- Stripe;
- rutas o datos de imagenes.

### Como probar

1. Abrir `/app` en Google Chrome.
2. Revisar el carrusel a 1366px y confirmar que no empuja demasiado `Accesos rapidos`.
3. Revisar a 1280px y 1024px que titulo, controles y CTA no se superponen.
4. Probar mobile y confirmar que el texto queda legible y sin overflow horizontal.
5. Probar flechas, indicadores y autoplay.
6. Confirmar que la imagen sigue visible y el texto mantiene contraste.

### Nota: ajuste visual de controles del carrusel

Se revirtio parcialmente la ubicacion de los controles del carrusel principal: dejan de estar junto al CTA `Ver detalles` y vuelven a la esquina superior derecha del hero. Se conserva una capsula mas sutil, con fondo oscuro translucido, borde fino, flechas discretas, indicador activo dorado claro e indicadores inactivos de baja opacidad.

Se mantuvieron las mejoras de titulo, overlay, progreso inferior y altura responsive. No se modifico autoplay, pausa en hover, datos de eventos, render de slides, Supabase, auth, middleware, roles, RLS, migraciones ni otras secciones de la home.

### Nota: ajuste de indicadores del carrusel

Se ajustaron los puntos indicadores para evitar el cambio fuerte de tamaño del estado activo. Todos mantienen el mismo ancho y alto; el slide activo se diferencia por color dorado claro y opacidad, reduciendo el salto visual al cambiar de evento.

---

## Fase actual: pulido visual del detalle de evento - 2026-06-08

### Problema detectado

La pagina `/app/events/[eventId]` ya cargaba eventos reales y mostraba imagen, titulo, artista, fecha, zona, entradas y enlace del artista, pero la experiencia se sentia incompleta:

- el hero tenia demasiado peso en laptop;
- el contenido inferior quedaba poco aprovechado;
- la informacion del evento estaba concentrada en la columna derecha;
- la descripcion corta no ayudaba a vender la noche;
- entradas y tiers necesitaban una lectura mas clara.

### Cambios visuales aplicados

Se refino el hero para mantener protagonismo sin ocupar tanto alto:

- altura responsive mas contenida;
- overlay con lectura clara sin apagar por completo la imagen;
- badge `Evento destacado` o `Proximo evento`;
- titulo, artista y descripcion con ancho controlado;
- degradado dorado sutil para reforzar la estetica FLEX.

Tambien se ajusto el layout general:

- sidebar derecha pasa a modo columna solo en escritorio amplio (`2xl`);
- en laptop/tablet/mobile baja debajo del contenido para evitar compresion;
- se agrego `min-w-0` para reducir riesgo de overflow horizontal;
- cards con hover suave y bordes dorados discretos.

### Secciones nuevas agregadas

Debajo del hero se organizo el contenido en tarjetas:

- `Sobre el evento`: usa la descripcion real si existe. Si es corta, la mantiene y agrega copy editorial de apoyo; si no existe, usa fallback elegante.
- `Programacion`: muestra apertura, show principal con hora real del evento y DJ set / cierre, sin crear tabla nueva.
- `Experiencia incluida`: incluye Ambiente premium, Pista principal, Musica en vivo / DJ set y Zonas VIP disponibles con iconos existentes.

### Entradas

La columna de entradas ahora muestra un resumen mas claro:

- `Desde X EUR` cuando hay tiers activos o precio base;
- tiers reales si existen;
- disponibilidad por tier cuando hay cupos;
- mensaje elegante si no hay tiers:
  `El equipo de FLEX publicara los tipos de entrada disponibles para este evento.`

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- logica de negocio sensible;
- pagos;
- Stripe;
- `/app` home ni carrusel principal;
- `/admin/events`;
- otras secciones de usuario.

### Como probar manualmente

1. Abrir `/app/events/[eventId]` con un evento publicado.
2. Confirmar que el hero muestra imagen, badge, titulo, artista y descripcion legible.
3. Revisar que debajo aparecen `Sobre el evento`, `Programacion` y `Experiencia incluida`.
4. Verificar que la sidebar muestra fecha, zona, artista, entradas, Spotify si existe y `Volver`.
5. Probar un evento con tiers activos y confirmar que se listan.
6. Probar un evento sin tiers y confirmar el mensaje elegante.
7. Revisar laptop/tablet/mobile y confirmar que la sidebar baja debajo del contenido sin overflow horizontal.

### Pendientes

- Modelar una programacion real por evento si en el futuro se decide crear una tabla especifica.
- Conectar el boton `Seleccionar` a un flujo de compra/reserva cuando pagos y tickets finales esten listos.

---

## Fase actual: pulido visual de Salas VIP - 2026-06-08

### Problema detectado

La pagina `/app/vip` ya leia salas reales desde `club_zones` y mostraba cards premium, pero en laptop podia sentirse pesada e irregular:

- hero superior con demasiado peso visual;
- cards altas y con padding amplio;
- jerarquia interna mejorable;
- Sala Dorada destacaba, pero podia desbalancear la grilla;
- faltaba una explicacion ligera del proceso de reserva.

### Cambios en hero

Se mantuvo el titulo `Reserva tu espacio privado` y se compacto el bloque superior:

- copy directo: `Elige una sala, reserva tu ambiente y comparte el acceso con tu grupo.`;
- highlights mas compactos: QR compartido, Hasta 10 invitados y Servicio exclusivo;
- fondo premium mas sutil, con menos sombra y altura visual mas contenida.

### Cambios en cards

Las cards VIP se hicieron mas compactas y equilibradas:

- altura minima reducida;
- padding mas contenido;
- icono y acento superior mas discretos;
- detalles internos en bloques rectangulares compactos;
- hover premium mas ligero;
- grilla a 3 columnas solo en escritorio amplio (`2xl`) y 2 columnas en laptop/tablet cuando cabe.

La jerarquia interna queda organizada como:

- estado `Disponible`;
- nombre de sala;
- frase de ambiente;
- capacidad, planta y precio desde;
- CTA.

La Sala Dorada mantiene badge `Mas exclusiva` y CTA `Reservar premium`, sin crecer ni romper la grilla.

### Seccion Como funciona

Se agrego una seccion ligera con 3 pasos:

1. Elige tu sala.
2. Confirma la reserva con el equipo.
3. Comparte el acceso con tus invitados.

Tambien se agrego microcopy de confianza sobre capacidad limitada para mantener una experiencia comoda y exclusiva.

### Que no se toco

No se modifico:

- `listVipRooms()`;
- consultas Supabase;
- filtros `vip_room` / `private_room`;
- filtro `active=true`;
- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- pagos;
- Stripe;
- flujo real de reserva;
- `private_room_access`;
- `/app` home ni carrusel;
- `/app/events/[eventId]`;
- `/admin/vip`.

### Como probar manualmente

1. Abrir `/app/vip`.
2. Confirmar que el hero se ve compacto y mantiene los highlights.
3. Revisar Sala Negra, Sala Roja y Sala Dorada en desktop/laptop/tablet/mobile.
4. Confirmar que la Sala Dorada destaca sin desbalancear la grilla.
5. Verificar que los CTAs navegan al mismo flujo existente de compartir/acceso.
6. Probar loading, error y empty state si aplica.
7. Confirmar que no hay overflow horizontal ni cards aplastadas.

### Pendientes

- Conectar reservas reales a `private_room_access` cuando se defina el flujo.
- Integrar pagos/Stripe en una fase posterior.
- Validar disponibilidad real por horario si se modela agenda de salas.

---

## Fase actual: pulido visual de Mi turno - 2026-06-08

### Problema detectado

La pagina `/app/my-turn` ya permitia apuntarse a la cola en vivo, pero el contenido se sentia mas informativo que accionable. El estado actual, el formulario y la guia lateral competian visualmente y podian ocupar demasiado espacio en laptop/tablet.

### Cambios en estado actual

Se reforzo la card principal para que el usuario entienda rapido si tiene turno activo:

- estado visible `Sin turno activo` o `Turno activo`;
- posicion destacada si existe turno;
- espera estimada y estado de revision;
- empty state mas humano: `Aun no estas en la lista. Cuando te unas, veremos tu posicion aqui.`;
- badge `Lista abierta` o `En cola`.

### Cambios en formulario

El formulario se compacto sin cambiar validaciones ni la llamada a `joinLiveQueue()`:

- campos con menos altura y separacion mas ajustada;
- copy directo: `Completa tus datos para unirte a la lista del escenario.`;
- CTA mantenido como `Unirme a la lista`;
- feedback de error, exito y loading conservado;
- microcopy sobre cambios de orden segun la dinamica de la noche.

### Cambios en guia

La guia `Como funciona` se hizo secundaria y ligera:

1. Te apuntas.
2. El staff revisa la lista.
3. Te avisamos cuando estes cerca.
4. Subes al escenario.

En pantallas intermedias la guia baja debajo del bloque principal para no apretar el formulario.

### Que no se toco

No se modifico:

- `joinLiveQueue()`;
- consultas Supabase;
- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- admin;
- eventos;
- VIP;
- home ni carrusel;
- logica de negocio sensible.

### Como probar manualmente

1. Abrir `/app/my-turn`.
2. Confirmar que el estado inicial muestra `Sin turno activo` y el mensaje de lista vacia.
3. Intentar enviar sin nombre artistico y revisar el error existente.
4. Completar nombre, tipo de participacion e instrumento si aplica.
5. Enviar y confirmar que aparece posicion y estado activo.
6. Probar en desktop, laptop, tablet y mobile verificando que no haya overflow horizontal.

### Pendientes

- Sustituir la espera estimada fija por datos reales si se modela tiempo de cola.
- Mostrar avisos en tiempo real si se incorpora Supabase Realtime para la cola.

---

## Nota: correccion de params en compartir VIP - 2026-06-09

### Cambio aplicado

Se corrigio `/app/vip/[roomId]/share` para Next.js 16: la pagina es Client Component y ahora desenvuelve `params` con `use(params)` antes de leer `roomId`.

La URL compartida se mantiene con el mismo formato:

- `https://flex.app/vip/${roomId}/guest?token=demo_private_room_token`

### Como probar

1. Abrir `/app/vip`.
2. Entrar a una sala.
3. Abrir `/app/vip/[roomId]/share`.
4. Confirmar que no aparece el error de acceso directo a `params.roomId`.

### Pendiente

- No hay pendiente nuevo; el cambio solo adapta el acceso a parametros dinamicos al comportamiento de Next.js 16.

---

## Fase actual: encabezados internos y empty states - 2026-06-09

### Problema detectado

Varias paginas internas del area de usuario dependian del encabezado generico del shell o tenian bloques de titulo escritos de forma distinta. Algunos estados vacios eran textos planos, lo que hacia que secciones funcionales como entradas, avisos, eventos, Hoy en FLEX o VIP se sintieran incompletas cuando no habia datos.

### Componente de header

Se creo `components/app/AppPageHeader.tsx` como encabezado interno sencillo para paginas de usuario. Soporta:

- eyebrow opcional;
- title;
- description;
- actions opcionales;
- estilo FLEX oscuro/dorado;
- comportamiento responsive.

En paginas donde el shell ya muestra titulo en desktop, el header interno se usa solo en mobile para evitar duplicar jerarquia. Hoy en FLEX y Salas VIP mantienen encabezado visual completo porque funcionan como pantallas destacadas.

### Componente de empty state

Se creo `components/app/AppEmptyState.tsx` para estados vacios premium pero livianos. Soporta:

- icono opcional;
- title;
- description;
- primaryAction opcional;
- secondaryAction opcional;
- acciones apiladas correctamente en mobile.

### Paginas actualizadas

- `/app/today`: encabezado unificado y empty state con acciones a proximos eventos y VIP.
- `/app/vip`: encabezado unificado y empty state con accion a inicio.
- `/app/my-turn`: header interno responsive y estado sin turno con copy mas claro.
- `/app/song-request`: header interno responsive manteniendo formulario y feedback.
- `/app/profile`: header interno responsive compartido.
- `/app/tickets`: header interno responsive y empty state con accion a proximos eventos.
- `/app/notifications`: estado vacio profesional para avisos, sin placeholders estaticos.
- `/app/events`: header interno responsive y empty state para agenda sin eventos.
- `/app/events/[eventId]`: no se forzo header generico; el detalle conserva su propio hero/titulo.

Tambien se ajustaron los route headers del shell de usuario para que desktop muestre titulos propios en eventos, tickets y avisos.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- queries Supabase;
- mutaciones;
- admin;
- pagos;
- Stripe;
- logica de reservas VIP;
- logica de canciones;
- logica de turnos;
- carrusel principal de `/app`.

### Como probar manualmente

1. Abrir `/app` y confirmar que la home mantiene `Bienvenido a FLEX`.
2. Abrir `/app/today` y revisar encabezado, filtros y empty state si no hay publicaciones.
3. Abrir `/app/vip` y revisar encabezado, cards y empty state si no hay salas activas.
4. Abrir `/app/my-turn` y confirmar que el estado sin turno usa copy claro y el formulario sigue enviando.
5. Abrir `/app/song-request` y confirmar que el formulario mantiene validaciones y feedback.
6. Abrir `/app/tickets` y revisar empty state cuando no haya entradas o QR cuando existan.
7. Abrir `/app/notifications` y confirmar el estado vacio con accion a inicio.
8. Abrir `/app/events` y revisar empty state si no hay eventos.
9. Abrir `/app/events/[eventId]` y confirmar que el detalle usa su hero propio, sin `Bienvenido a FLEX`.
10. Probar desktop, laptop, tablet y mobile verificando que no haya overflow horizontal ni acciones desbordadas.

### Pendientes

- Conectar `/app/notifications` a notificaciones reales cuando se implemente la vista de datos final.
- Conectar empty states a flujos reales de compra/reserva cuando pagos y tickets finales esten listos.

---

## Fase actual: mejora de administracion de staff - 2026-06-09

### Problema anterior

El panel `/admin/staff` permitia agregar o actualizar perfiles operativos en `staff_profiles`, pero obligaba al admin a copiar manualmente el `user_id` desde Supabase. Esto hacia incomodo asignar roles como `admin`, `guard`, `storage` o `dj` a usuarios ya registrados.

### Nueva busqueda por email segura

Se agrego una accion server-side para buscar usuarios existentes de Supabase Auth por email. La busqueda:

- se ejecuta solo en servidor;
- valida primero que la sesion actual pertenece a un staff `admin` activo;
- usa `SUPABASE_SERVICE_ROLE_KEY` solo del lado servidor;
- busca email exacto con comparacion case-insensitive;
- devuelve solo datos minimos.

### Validacion admin server-side

Antes de buscar usuarios, listar staff, guardar staff o actualizar filas, las acciones server-side validan:

1. usuario autenticado con Supabase Auth;
2. fila activa en `staff_profiles`;
3. rol `admin`.

Si la validacion falla, la accion devuelve error de permisos y no consulta `auth.users`.

### Datos que devuelve la busqueda

La busqueda por email devuelve:

- `user_id`;
- `email`;
- `full_name` desde `profiles` si existe.

No devuelve passwords, tokens, metadata de Auth, providers, fechas internas ni otros datos sensibles.

### Variable de entorno

Se documento en `.env.example`:

- `SUPABASE_SERVICE_ROLE_KEY`

Esta variable es server-only y no debe llevar prefijo `NEXT_PUBLIC_`.

### Como crear y asignar staff

1. Crear primero el usuario desde `/register`.
2. Entrar con un usuario admin a `/admin/staff`.
3. Buscar el email exacto del usuario registrado.
4. Confirmar la card de usuario encontrado.
5. Elegir rol operativo: `admin`, `guard`, `storage` o `dj`.
6. Completar `display_name`.
7. Marcar `Activo` si corresponde.
8. Pulsar `Guardar staff`.

La opcion manual por `user_id` se mantiene como fallback.

### Que no se toco

No se modifico:

- migraciones;
- Supabase schema;
- RLS;
- middleware;
- roles existentes;
- auth flow de login/register;
- trigger de `profiles`;
- creacion de usuarios desde admin;
- invitaciones;
- paginas de usuario;
- pagos;
- Stripe.

### Pendientes

- Crear flujo real de invitaciones para staff.
- Crear usuarios desde admin cuando se defina el modelo de seguridad.
- Mejorar paginacion/busqueda de Auth si el volumen de usuarios crece mucho.

---

## Fase actual: creacion segura de staff desde admin - 2026-06-09

### Problema anterior

`/admin/staff` ya permitia buscar un usuario por email y asignarle rol operativo, pero el formulario de guardado seguia aceptando texto libre en el campo `user_id`. Si un admin escribia un email en ese campo, Postgres devolvia:

```text
invalid input syntax for type uuid
```

Ademas, crear un usuario staff nuevo todavia obligaba a salir del panel, usar Supabase Studio o registrar manualmente el usuario en `/register`.

### Buscar existente vs crear nuevo

El panel ahora separa tres flujos:

- `Crear usuario staff`: crea usuario en Supabase Auth con email y contrasena temporal, crea/actualiza `profiles` y crea/actualiza `staff_profiles`.
- `Buscar usuario existente`: busca por email un usuario ya registrado y permite asignarle rol staff sin copiar UUID.
- `Guardar por UUID manual`: queda como fallback menos protagonista y valida que el valor sea UUID antes de guardar.

Si el admin escribe un email en el campo manual de UUID, la UI muestra un error claro:

```text
Este campo requiere un UUID. Usa la busqueda por email o crea un usuario nuevo.
```

### Uso server-side de service role

La creacion y busqueda de usuarios usan `SUPABASE_SERVICE_ROLE_KEY` solo dentro de server actions. La clave no se expone al navegador y no lleva prefijo `NEXT_PUBLIC_`.

La variable esta documentada en `.env.example`:

- `SUPABASE_SERVICE_ROLE_KEY`

### Validacion de admin activo

Cada accion server-side valida antes de operar:

1. sesion Supabase Auth actual;
2. fila activa en `staff_profiles`;
3. rol `admin`.

Esto aplica a:

- buscar usuario por email;
- crear usuario staff;
- guardar staff por usuario existente;
- guardar staff por UUID manual;
- actualizar rol, nombre operativo o estado activo.

### Datos creados

Cuando se crea un usuario staff nuevo desde admin:

- en `auth.users`: email, password temporal y email confirmado;
- en `profiles`: `id` del usuario y `full_name`;
- en `staff_profiles`: `user_id`, `role`, `display_name` y `active`.

Si el usuario ya existe:

- no se duplica;
- no se cambia su password automaticamente;
- se reutiliza su `user_id`;
- se actualizan `profiles` y `staff_profiles`;
- se muestra el mensaje `El usuario ya existia; se actualizo su rol staff.`

### Que no se expone

No se expone:

- `SUPABASE_SERVICE_ROLE_KEY`;
- passwords;
- tokens;
- metadata sensible de Auth;
- passwords existentes;
- password temporal en la tabla de staff.

La password temporal solo se usa en la server action para crear el usuario con Supabase Auth Admin. No se guarda en tablas publicas ni se escribe en logs.

### Como probar manualmente

1. Configurar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` y reiniciar el dev server.
2. Entrar como admin a `/admin/staff`.
3. En `Crear usuario staff`, escribir email nuevo, contrasena temporal de minimo 6 caracteres, display name, rol y estado activo.
4. Pulsar `Crear staff`.
5. Confirmar el mensaje `Usuario creado. Comparte la contrasena temporal de forma segura.`
6. Cerrar sesion.
7. Entrar con ese email y password temporal.
8. Confirmar acceso segun rol: admin a `/admin`, guard a `/guard`, storage a `/storage`, dj a `/admin/queue`.
9. Volver como admin, buscar por email un usuario existente y asignarle rol.
10. Probar escribir un email en `Guardar por UUID manual` y confirmar el error de UUID.

### Pendientes

- Implementar invitaciones reales por email.
- Agregar flujo separado para resetear contrasena de staff si se necesita.
- Definir politica de cambio obligatorio de contrasena temporal en produccion.

### Nota de pulido visual

Se refino visualmente `/admin/staff` para que el flujo sea mas claro y compacto:

1. Crear nuevo staff.
2. Asignar rol a usuario existente.
3. Usar UUID manual como modo avanzado/fallback.

Los formularios redujeron altura, padding y peso visual de botones. El modo UUID manual quedo en una seccion colapsable de menor protagonismo. La tabla de staff usa filas, inputs, selects y acciones mas compactas.

No se modificaron server actions, validaciones de admin, RLS, middleware, roles, Supabase schema, migraciones, auth normal ni paginas de usuario.

---

## Ajuste visual final de Staff - 2026-06-09

### Cambios aplicados

Se pulio el listado de `/admin/staff` para corregir detalles visuales:

- la columna `Nombre` ya no muestra un input vacio por defecto;
- `display_name` aparece como texto principal;
- `full_name` aparece como dato secundario cuando aporta informacion;
- si no hay dato secundario, se muestra un UUID corto como apoyo;
- `user_id` se muestra truncado visualmente;
- se agrego boton compacto `Copiar` para copiar el UUID completo;
- el boton `Buscar usuario` evita partir el texto en dos lineas y queda mas compacto;
- la tabla mantiene filas compactas, acciones alineadas y badge de estado compacto.

### Que no se toco

No se modifico:

- server actions;
- creacion de staff;
- busqueda por email;
- validacion admin;
- `SUPABASE_SERVICE_ROLE_KEY`;
- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles.

---

## Fase actual: pulido visual de Admin Eventos - 2026-06-09

### Problema anterior

`/admin/events` funcionaba, pero el formulario se sentia largo, tecnico y con poca jerarquia. Campos como `Precio cents opcional`, imagen, publicacion, destacado, precios por zona y acciones del listado competian visualmente en el mismo nivel.

### Reorganizacion del formulario

El formulario principal quedo agrupado sin crear pasos obligatorios:

- `Informacion principal`: titulo, artista, inicio y fin opcional.
- `Detalles`: zona, link artista, link externo opcional y descripcion.
- `Capacidad y precio`: capacidad opcional y precio base.

El modo edicion ahora muestra `Editando evento`, el evento seleccionado y una accion clara para cancelar edicion.

### Mejoras en imagen

El bloque de imagen se compacto y mantiene:

- preview;
- subida de archivo;
- URL manual;
- estado vacio `Imagen recomendada`.

El copy visible ahora indica: `Sube una imagen del artista o pega una URL.`

### Mejoras en publicacion y destacado

`Publicado` y `Destacar en home` quedaron agrupados como controles compactos con helper text:

- `Visible para usuarios.`
- `Puede aparecer en el carrusel principal.`

### Mejoras en precios por zona

La seccion se redujo visualmente. Si no hay evento seleccionado, muestra una card ligera: `Guarda o edita un evento para gestionar sus entradas.`

Cuando hay evento seleccionado, mantiene la gestion existente de tiers, pero con cards mas compactas, acciones alineadas y formulario lateral mas liviano.

### Mejoras en listado

El listado de eventos se refino con:

- thumbnail compacto;
- evento como titulo principal con artista/zona debajo;
- fecha compacta;
- precio desde;
- badges agrupados;
- acciones compactas y alineadas.

`Despublicar` conserva su funcion, pero tiene menor peso visual.

### Labels y copy

Se cambio `Precio cents opcional` por `Precio desde` con input humano en EUR. Internamente se convierte y guarda en centavos.

Tambien se ajustaron mensajes visibles:

- `Completa titulo e inicio.`
- `Evento creado.`
- `Evento actualizado.`

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- logica de creacion/edicion/publicacion;
- subida de imagenes;
- listado de eventos;
- logica de precios por zona;
- admin staff, pagos, VIP ni paginas de usuario.

### Como probar manualmente

1. Entrar como admin a `/admin/events`.
2. Crear un evento con titulo, inicio, imagen por subida o URL, precio desde, publicacion y destacado.
3. Confirmar que el evento aparece en el listado.
4. Pulsar `Editar` y confirmar que el formulario cambia a modo edicion.
5. Guardar cambios.
6. Seleccionar un evento y gestionar precios por zona.
7. Confirmar que `/app` muestra eventos publicados futuros.

### Pendientes

- Evaluar mas adelante si los precios por zona tambien deben pasar a input humano EUR en vez de centavos.
- Definir un patron compartido de formularios admin si se repite este nivel de agrupacion.

---

## Fase actual: simplificacion de Admin Eventos - 2026-06-09

### Problema anterior

Aunque `/admin/events` ya tenia mejor jerarquia visual, el formulario completo seguia siempre visible. Eso hacia que la pantalla se sintiera cargada y que el listado de eventos existentes perdiera protagonismo.

### Nuevo flujo con Nuevo evento

La pantalla ahora abre con el listado como area principal de gestion. El formulario queda oculto por defecto y aparece solo cuando el admin:

- pulsa `Nuevo evento`;
- pulsa `Editar` en un evento existente.

El header incluye una accion principal `Nuevo evento` para iniciar el flujo de creacion.

### Modo crear/editar

El formulario diferencia claramente:

- `Crear evento`: formulario limpio con datos iniciales.
- `Editando evento`: carga el evento seleccionado y muestra su nombre como contexto.

El cierre usa:

- `Cerrar formulario` en modo creacion;
- `Cancelar edicion` en modo edicion.

El CTA mantiene:

- `Crear evento` al crear;
- `Guardar cambios` al editar.

### Listado con mas protagonismo

`Eventos existentes` se muestra inmediatamente despues del header y feedback de carga/error/exito. La tabla mantiene el patron responsive existente, pero queda como centro de la pantalla cuando no hay formulario abierto.

El listado conserva:

- imagen;
- titulo;
- artista / zona;
- fecha;
- precio;
- estado;
- acciones compactas.

`Editar` queda como accion principal de gestion; `Ver`, `Destacar` y publicar/despublicar se mantienen como acciones operativas.

### Formulario compactado

El formulario se redujo a tres grupos:

- `Informacion`: titulo, artista, inicio, fin opcional, zona y descripcion.
- `Imagen y enlaces`: preview, subida, URL manual, link artista y link externo.
- `Publicacion y precio`: capacidad, precio desde, publicado, destacado y CTA.

El precio sigue usando UX humana en EUR y se convierte internamente a centavos.

### Precios por zona compactos

Cuando no hay evento seleccionado, la seccion muestra una card compacta:

- `Entradas por zona`
- `Selecciona o edita un evento para gestionar sus precios.`

Cuando se edita un evento, aparece la gestion real de tiers sin cambiar su logica.

### Que no se toco

No se modifico:

- Supabase;
- migraciones;
- schema;
- RLS;
- auth;
- middleware;
- roles;
- server actions;
- logica sensible de eventos;
- subida de imagenes;
- publicacion/destacado;
- precios por zona;
- admin staff;
- app publica/usuario;
- carrusel.

### Como probar

1. Abrir `/admin/events`.
2. Confirmar que el listado aparece sin formulario dominante.
3. Pulsar `Nuevo evento` y confirmar que aparece `Crear evento`.
4. Crear un evento con imagen o URL, precio desde, publicacion y destacado.
5. Pulsar `Editar` en un evento existente.
6. Confirmar modo `Editando evento`.
7. Cancelar edicion y verificar que el formulario se oculta.
8. Publicar/despublicar y destacar desde el listado.
9. Editar un evento y gestionar entradas por zona.
10. Confirmar que `/app` muestra eventos publicados futuros.

---

## Fase actual: refinamiento visual de Admin Eventos - 2026-06-09

### Problema visual detectado

La estructura de `/admin/events` ya era correcta, con listado arriba y formulario solo al crear/editar, pero todavia se percibia pesada. Los botones secundarios tenian demasiado peso, las tarjetas internas del formulario eran rigidas, las acciones del listado competian entre si y el input de precio conservaba controles nativos poco premium.

### Mejoras en botones

Se agrego un boton local compacto para acciones de esta pagina. El listado ahora diferencia mejor:

- `Editar` como accion principal pequena;
- `Ver` y `Destacar` como acciones secundarias;
- `Despublicar` como danger discreto;
- `Cerrar formulario` y `Cancelar edicion` como acciones secundarias menos dominantes.

Los CTAs principales `Nuevo evento`, `Crear evento` y `Guardar cambios` redujeron altura y tracking para verse mas contenidos.

### Mejoras en listado

El listado mantiene la tabla existente, pero se refino visualmente:

- filas mas compactas;
- hover suave;
- thumbnail consistente;
- titulo limitado visualmente a dos lineas;
- artista/zona como texto secundario;
- fecha y precio alineados;
- badges agrupados;
- acciones con botones pequenos y sin textos partidos.

### Mejoras en formulario

Los grupos `Informacion`, `Imagen y enlaces` y `Publicacion y precio` se mantienen, pero ahora tienen:

- menos padding;
- bordes mas sutiles;
- fondo mas liviano;
- titulos mas pequenos;
- menos separacion vertical;
- descripcion con altura mas razonable.

El formulario se siente mas como panel premium compacto y menos como varias tarjetas pesadas.

### Mejoras en publicacion y precio

`Precio desde` conserva UX humana en EUR y conversion interna a centavos. Se redujo el protagonismo del helper y se ocultaron controles nativos del input numerico con CSS local.

`Publicado` y `Destacar en home` ahora se ven como opciones compactas, con hover suave y menor peso visual.

### Precios por zona

La seccion de entradas por zona se mantuvo compacta:

- estado sin evento con borde y padding reducidos;
- tiers con cards mas livianas;
- acciones pequenas;
- formulario de precio con menos padding.

No se cambio la logica de tiers.

### Que no se toco

No se modifico:

- Supabase;
- migraciones;
- schema;
- RLS;
- auth;
- middleware;
- roles;
- server actions;
- creacion/edicion/publicacion de eventos;
- destacado;
- subida de imagenes;
- precios por zona;
- admin staff;
- admin pagos;
- app usuario;
- carrusel.

### Como probar manualmente

1. Abrir `/admin/events`.
2. Revisar que el listado se vea compacto y que las acciones no dominen la fila.
3. Pulsar `Nuevo evento`.
4. Revisar que el formulario se vea mas liviano y compacto.
5. Crear evento con imagen o URL.
6. Editar un evento existente.
7. Cerrar formulario o cancelar edicion.
8. Publicar/despublicar.
9. Destacar/quitar destacado.
10. Probar responsive en laptop, tablet y mobile.

---

## Fase actual: correccion de imagen en carrusel principal - 2026-06-09

### Bug detectado

La imagen subida desde `/admin/events` se guardaba bien y aparecia correctamente en el detalle del evento, pero el carrusel principal de `/app` la renderizaba rota.

### Causa

El carrusel dependia de la ruta de imagen tratada por su componente de fondo, y no compartia el mismo render seguro que el detalle. El dato seguia siendo valido, pero el render era mas fragil para URLs remotas de Supabase Storage local.

### Fix aplicado

Se unifico la resolucion de imagen de evento para que el flujo use:

- `image_url` primero;
- `cover_image_path` como fallback;
- `null` si no hay imagen.

El carrusel principal ya usa esa misma URL normalizada y el fondo remoto se dibuja sin icono roto cuando la imagen es una URL `http/https` de Supabase Storage local.

### Formato correcto de imagen

Una imagen valida puede llegar como:

- URL publica de Supabase Storage local, por ejemplo `http://127.0.0.1:54321/storage/v1/object/public/event-images/...`;
- URL publica remota;
- ruta local tipo `/images/events/...`.

### Que no se toco

No se modifico:

- Supabase;
- Storage;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- detalle del evento;
- admin/events salvo para confirmar el campo que se guarda;
- autoplay ni diseño general del carrusel.

### Como probar manualmente

1. Subir una imagen desde `/admin/events`.
2. Publicar y destacar el evento.
3. Abrir `/app/events/[eventId]` y confirmar que la imagen aparece.
4. Abrir `/app` y confirmar que el carrusel principal muestra la misma imagen.
5. Confirmar que un evento sin imagen muestra fallback y no un icono roto.

### Guia rapida para crear eventos con imagen

1. Entrar a `/admin/events`.
2. Pulsar `Nuevo evento`.
3. Completar titulo, fecha de inicio y los datos basicos del evento.
4. Elegir una imagen de una de estas formas:
   - usar una ruta local existente como `/images/events/nejo.jpg`;
   - subir una imagen desde el selector del admin, que generara una URL publica de Supabase Storage;
   - pegar una URL publica valida en `image_url`.
5. Publicar el evento con `Publicado`.
6. Marcar `Destacar en home` si debe aparecer en el carrusel principal.
7. Guardar el evento.
8. Abrir `/app` y verificar que el carrusel muestra la imagen correcta.
9. Abrir `/app/events/[eventId]` y confirmar que el detalle usa la misma imagen.

### Errores comunes

- Pegar `public/images/...` en lugar de `/images/...`.
- Pegar solo el nombre del archivo, como `nejo.jpg`, en vez de una ruta o URL completa.
- Olvidar marcar el evento como `Publicado`.
- Dejar el evento sin fecha futura, lo que impide que aparezca como proximo evento.
- Olvidar marcar `Destacar en home` si se espera verlo en el carrusel principal.

---

## Fase actual: simplificación de Admin Eventos y eliminación

### Por que se agrego eliminar

`/admin/events` ya permitia crear, editar, publicar, despublicar, destacar y ver eventos, pero no habia una accion clara para limpiar eventos viejos, finalizados o de prueba. Se agrego `Eliminar` en cada fila del listado para que el admin pueda mantener la gestion de eventos enfocada en eventos utiles y visibles para usuarios.

### Confirmacion antes de borrar

La accion usa confirmacion simple del navegador con el mensaje:

```text
¿Eliminar este evento? Esta acción no se puede deshacer.
```

No se agregaron librerias nuevas ni un sistema modal nuevo. Si el admin cancela, no se llama a la accion server-side.

### Validacion admin server-side

La eliminacion se ejecuta en `app/admin/events/actions.ts` como server action. Antes de borrar valida:

- sesion real de Supabase Auth;
- fila activa en `staff_profiles`;
- rol `admin`;
- UUID valido del evento;
- existencia del evento.

La UI no es la unica barrera de seguridad.

### Eventos con registros asociados

Antes de borrar, la accion revisa registros asociados en:

- `tickets`;
- `order_items`;
- `private_room_access`;
- `song_requests`;
- `live_session_queue`;
- `daily_feed_posts`.

Si encuentra registros, no elimina el evento y muestra:

```text
No se puede eliminar este evento porque tiene registros asociados. Despublicalo como alternativa.
```

`event_ticket_tiers` se mantiene como dato dependiente del evento. Si el evento no tiene registros operativos asociados, la relacion `on delete cascade` existente elimina esos tiers junto con el evento.

### Entradas por zona

La seccion grande de `Entradas por zona` ya no se muestra por defecto. Ahora aparece como `Opciones avanzadas de entradas`:

- sin evento en edicion, queda como una linea discreta;
- al editar un evento, queda cerrada por defecto;
- el admin puede abrirla manualmente con `Abrir`;
- la logica de tiers existente se conserva sin tocar schema.

### Que no se toco

No se modifico:

- migraciones;
- Supabase schema;
- RLS;
- auth;
- middleware;
- roles;
- subida ni render de imagenes;
- carrusel;
- detalle de evento;
- proximos eventos;
- app de usuario;
- admin staff;
- pagos;
- VIP.

### Como probar manualmente

1. Entrar como admin a `/admin/events`.
2. Crear un evento de prueba sin tickets, ordenes, accesos VIP, feed, canciones ni cola.
3. Confirmar que aparece en el listado.
4. Pulsar `Eliminar`, cancelar el confirm y verificar que sigue visible.
5. Pulsar `Eliminar` otra vez, aceptar el confirm y verificar que desaparece del listado.
6. Crear o elegir un evento publicado y probar `Despublicar`.
7. Probar `Destacar` y `Quitar destacado`.
8. Intentar eliminar un evento con registros asociados y confirmar que aparece el mensaje de bloqueo.
9. Editar un evento y verificar que `Opciones avanzadas de entradas` esta cerrada hasta pulsar `Abrir`.
10. Abrir `/app` y confirmar que no muestra eventos eliminados.

### Pendientes

- Definir mas adelante si otros flujos operativos deben ofrecer archivado historico en vez de borrado fisico.
- Evaluar si conviene convertir la confirmacion simple en modal compartido cuando exista un patron global.

---

## Fase actual: rediseño visual de Hoy en FLEX

### Objetivo

Se rediseño `/app/today` para que el feed oficial se sienta mas vivo, comercial y util durante la noche. La pagina mantiene la misma fuente de datos (`daily_feed_posts`) y conserva el concepto de mural oficial, sin convertirlo en chat libre.

### Nueva estructura visual

La pantalla ahora se organiza en:

- hero visual con fondo fotografico, estado `En vivo`, `Actualizado hoy`, contador de anuncios activos, fijados y agenda del dia;
- spotlight principal de la noche, con imagen de fondo, overlay, badge de categoria, titulo, descripcion, meta info y CTA;
- filtros por categoria como chips compactos con iconos;
- feed de cards mas expresivas para eventos, promos, actividades, VIP, escenario y avisos;
- sidebar simplificada con un bloque importante y un CTA comercial.

### Hero

El hero mantiene el titulo `Hoy en FLEX`, pero agrega:

- jerarquia mas fuerte;
- subtitulo corto orientado a marketing nocturno;
- estado `En vivo`;
- indicador `Actualizado hoy`;
- resumen rapido de actividad.

### Spotlight

El spotlight toma primero un post fijado, luego uno urgente/alta prioridad y, si no hay publicaciones reales, usa un fallback demo coherente con FLEX. Incluye:

- badge `Spotlight`;
- categoria del post;
- titulo;
- descripcion corta;
- horario o disponibilidad;
- ubicacion;
- prioridad;
- CTA.

### Feed y filtros

Las cards del feed se rediseñaron en `components/feed/FeedPostCard.tsx`:

- se reemplazo el aspecto plano por cards con icono, borde lateral dorado, badges y meta info;
- se mantienen `cta_label`, `cta_url`, horarios, prioridad, fijado y zona;
- se usan iconos `lucide-react`, sin dependencias nuevas;
- los filtros siguen usando las categorias existentes y ahora se presentan como chips mas limpios.

### Sidebar

La columna lateral se redujo a dos bloques:

- `Importante`: muestra un post fijado/urgente si existe, o una explicacion breve del feed oficial;
- `Plan de noche`: CTA a reservar VIP y ver eventos.

Se eliminaron cajitas pequeñas de menor impacto visual.

### Empty states

El estado vacio ahora diferencia:

- no hay contenido publicado: invita a ver proximos eventos o reservar VIP;
- no hay contenido para el filtro seleccionado: sugiere probar otra categoria.

### Que no se toco

No se modifico:

- auth;
- middleware;
- roles;
- RLS;
- migraciones;
- schema de Supabase;
- logica de admin;
- pagos;
- carrusel del home;
- navegacion global;
- consultas o reglas de publicacion del feed.

### Como probar manualmente

1. Abrir `/app/today`.
2. Confirmar que se ve el hero con `Hoy en FLEX`, `En vivo` y `Actualizado hoy`.
3. Confirmar que aparece el spotlight principal.
4. Probar filtros: Todos, Eventos, Promos, Actividades, VIP, Escenario y Avisos.
5. Revisar que las cards muestren categoria, prioridad, horario, zona y CTA cuando existan.
6. Verificar empty state con una categoria sin resultados.
7. Probar responsive en mobile, laptop y desktop.
8. Confirmar que `/admin/feed` sigue siendo la fuente de publicaciones y que no se convirtio en chat libre.

### Pendientes

- Definir imagenes especificas por tipo de publicacion si se agregan campos multimedia al feed.
- Evaluar animaciones discretas adicionales cuando haya realtime real.

---

## Fase actual: simplificación de Hoy en FLEX

### Motivo del ajuste

El rediseño anterior de `/app/today` hacia que el mural oficial se sintiera mas vivo, pero tambien quedo demasiado cargado: hero con muchos indicadores, spotlight con imagen grande, contadores visibles aunque no hubiera datos y una sidebar con demasiado peso. Se simplifico para que Hoy en FLEX funcione como feed oficial claro, editorial y elegante.

### Reduccion del spotlight

El spotlight grande con imagen ya no aparece por defecto. Ahora:

- no se muestra spotlight demo cuando no hay anuncios;
- solo se muestra una card destacada limpia si existe un post fijado real;
- la card destacada usa fondo sutil sin imagen grande;
- el contenido se presenta como anuncio oficial, no como carrusel o evento.

### Comportamiento con anuncios reales

Cuando hay publicaciones reales en `daily_feed_posts`:

- el header muestra `Hoy en FLEX`, el badge `Mural oficial` y una descripcion corta;
- las estadisticas aparecen solo de forma compacta y solo si hay contenido;
- si hay un post fijado, aparece arriba como destacado limpio;
- el resto del feed se muestra en cards compactas con tipo, titulo, descripcion, hora/zona, prioridad importante y CTA si existe;
- los filtros siguen disponibles por categoria con chips compactos y scroll horizontal en mobile;
- la sidebar se reduce a una sola card util: `Avisos fijados primero`.

### Comportamiento sin anuncios

Cuando no hay publicaciones activas:

- no aparece spotlight falso ni imagen grande;
- no se muestran contadores en cero como protagonistas;
- no se muestra sidebar;
- aparece una sola card de empty state:

```text
La noche todavía está tranquila
Cuando el equipo publique promociones, actividades o avisos, aparecerán aquí.
```

El empty state mantiene acciones hacia `Ver eventos` y `Reservar VIP`.

### Mejoras de empty state

El estado vacio ahora es mas claro y menos promocional. Tambien diferencia el caso de una categoria sin resultados, sugiriendo probar otro filtro sin llenar la pantalla con modulos extra.

### Componentes modificados

- `app/app/today/page.tsx`: simplifica hero, elimina spotlight demo, condiciona destacado real, compacta filtros, reduce sidebar y empty state.
- `components/feed/FeedPostCard.tsx`: compacta las cards del mural, reduce bordes dorados, baja el tamaño tipografico y conserva metadata/CTA.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- admin;
- consultas a `daily_feed_posts`;
- logica de filtros;
- carrusel de `/app`;
- eventos;
- VIP;
- pagos.

### Como probar manualmente

1. Abrir `/app/today` sin publicaciones activas y confirmar que solo aparece el header limpio, filtros y empty state.
2. Confirmar que no hay spotlight demo, imagen grande ni contadores en cero.
3. Publicar un post desde `/admin/feed` y volver a `/app/today`.
4. Confirmar que el post aparece como card limpia en el mural.
5. Fijar un post y confirmar que aparece como destacado superior sutil.
6. Probar filtros por categoria en desktop y mobile.
7. Confirmar que los CTA de posts siguen funcionando.
8. Revisar que `/app`, el carrusel, `/admin/feed`, roles y auth no cambiaron.

### Pendientes

- Definir si en el futuro `daily_feed_posts` tendra imagen propia por anuncio. Hasta entonces, Hoy en FLEX evita imagenes pesadas por defecto.

---

## Fase actual: rediseño editorial de Hoy en FLEX

### Objetivo

Se ajusto nuevamente `/app/today` para que deje de parecer una mini copia del home y funcione como mural editorial de anuncios, promociones y momentos comerciales de la noche.

### Cambios visuales

- El encabezado queda limpio: badge `Mural oficial`, titulo `Hoy en FLEX` y subtitulo breve.
- Los filtros pasan a pills compactas, sin scrollbar visible y con scroll horizontal oculto en mobile.
- El contenido principal ahora usa un layout editorial:
  - una card principal destacada;
  - hasta tres cards secundarias;
  - imagen, badge de categoria, titulo, descripcion y CTA.
- Si hay posts reales, se convierten en cards editoriales usando los datos de `daily_feed_posts`.
- Si no hay posts reales, se muestran cards editoriales de apoyo para mantener una presentacion comercial sin tocar datos.
- Debajo aparece `Avisos rápidos` solo cuando hay publicaciones reales, con cards compactas informativas.

### Que se mantuvo

Se mantiene:

- la consulta actual a `daily_feed_posts`;
- la logica de filtros por categoria;
- los CTA definidos por cada post;
- el feed oficial como mural, no chat libre.

### Que no se toco

No se modifico Supabase, schema, migraciones, RLS, auth, middleware, roles, admin, rutas, carrusel de `/app`, eventos, VIP ni pagos.

### Como probar visualmente

1. Abrir `/app/today`.
2. Confirmar que el header no parece otro hero/carrusel.
3. Revisar que los filtros no muestran scrollbar blanco y que `Todos` no se rompe.
4. Confirmar que el grid editorial muestra una card principal y cards secundarias.
5. Probar hover en cards: elevacion suave y scale minimo de imagen.
6. Publicar posts desde `/admin/feed` y confirmar que alimentan las cards editoriales.
7. Confirmar que `Avisos rápidos` aparece solo cuando hay posts reales.
---

## Fase actual: organización visual de Hoy en FLEX

### Objetivo

Se ordeno `/app/today` para que el mural visual tenga una jerarquia mas clara: primero destacados de la noche, luego secciones por categoria y finalmente un feed compacto de avisos.

### Nueva estructura de destacados

Cuando el filtro activo es `Todos` y hay publicaciones reales:

- aparece `Destacados de la noche`;
- se muestra una card principal grande;
- se muestran hasta tres cards secundarias;
- las cards usan imagen solo cuando aplica o un fondo visual elegante por categoria;
- los CTA principales usan dorado para mantener coherencia FLEX.

### Secciones por categoria

Debajo de destacados, `Todos` agrupa el contenido real en secciones:

- Promos;
- Eventos;
- Actividades;
- VIP;
- Escenario;
- Avisos.

Cada seccion tiene titulo, descripcion breve y grid de cards. Las categorias sin contenido no se muestran.

### Comportamiento de filtros

Los filtros se mantienen funcionales y ahora:

- usan pills compactas;
- evitan que `Todos` se rompa visualmente;
- ocultan la scrollbar horizontal;
- permiten scroll horizontal en mobile;
- muestran solo las cards de la categoria seleccionada cuando el filtro no es `Todos`.

### Mejoras de cards y CTAs

Las cards editoriales tienen:

- overlay menos oscuro para que la imagen o fondo respire mas;
- badge de categoria;
- titulo y descripcion con jerarquia mas clara;
- CTA dorado para accion principal;
- hover suave con elevacion y scale leve;
- animacion `soft-enter`, que respeta `prefers-reduced-motion`.

El feed compacto inferior conserva cards mas sobrias para lectura rapida.

### Empty state

Si no hay anuncios reales, no se muestran cards demo ni secciones vacias. Solo aparece:

```text
La noche todavía está tranquila
Cuando el equipo publique promociones, actividades o avisos, aparecerán aquí.
```

con acciones hacia `Ver eventos` y `Reservar VIP`.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- admin/feed;
- admin/events;
- logica de `daily_feed_posts`;
- carrusel del home;
- eventos;
- VIP;
- pagos.

### Como probar

1. Abrir `/app/today`.
2. Revisar `Todos`: destacados arriba, secciones por categoria debajo y feed compacto al final.
3. Probar cada filtro: Promos, Eventos, Actividades, VIP, Escenario y Avisos.
4. Verificar que los filtros no muestran scrollbar blanca y que `Todos` no se rompe.
5. Revisar responsive en desktop, laptop y mobile.
6. Confirmar empty state cuando no existan anuncios activos.

---

## Fase actual: correccion de visibilidad de Hoy en FLEX

### Causa del bug

`/admin/feed` mostraba una publicacion `PUBLISHED` y `PINNED`, pero `/app/today` no la mostraba porque la fila tenia una ventana de fechas vencida:

- `starts_at`: `2022-02-22 21:22:00+00`;
- `ends_at`: `2022-02-23 01:22:00+00`.

La tabla `daily_feed_posts` y su RLS solo consideran visible una publicacion cuando:

- `is_published = true`;
- `starts_at` es `null` o `starts_at <= now()`;
- `ends_at` es `null` o `ends_at >= now()`.

Por eso una publicacion puede verse publicada y fijada en admin, pero no aparecer para usuarios si ya vencio.

### Campos reales de daily_feed_posts

`/admin/feed` guarda y lista:

- `title`;
- `body`;
- `type`;
- `priority`;
- `starts_at`;
- `ends_at`;
- `cta_label`;
- `cta_url`;
- `is_published`;
- `is_pinned`;
- `event_id`;
- `zone_id`.

No existe `status`, `category`, `pinned` ni `context_label` en el schema actual.

### Ajuste en /app/today

`/app/today` ahora:

- consulta publicaciones con `is_published = true`;
- aplica en cliente la regla explicita de ventana `starts_at` / `ends_at` sobre las filas accesibles;
- mantiene el orden por `is_pinned`, `starts_at` y `created_at`;
- registra en desarrollo un `console.info` si hay publicaciones publicadas accesibles, pero ninguna esta activa por fecha;
- muestra un error generico al usuario si falla la carga y deja el detalle tecnico solo en `console.error` de desarrollo.

La RLS existente sigue protegiendo la lectura publica de publicaciones vencidas para usuarios normales.

### Reglas de categorias

Se normalizaron aliases para evitar que diferencias de idioma impidan renderizar o filtrar:

- `event`, `evento`, `eventos`;
- `promotion`, `promo`, `promos`;
- `activity`, `actividad`, `actividades`;
- `vip`;
- `stage`, `escenario`;
- `announcement`, `notice`, `aviso`, `avisos`;
- `storage`, `guardarropa`;
- `security`, `seguridad`.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- admin/feed visual;
- admin/events;
- carrusel del home;
- pagos.

### Como probar

1. Crear una publicacion en `/admin/feed`.
2. Marcarla como `Publicado` y `Fijado`.
3. Dejar `starts_at` y `ends_at` vacios, o usar una fecha actual/futura no vencida.
4. Abrir `/app/today` y revisar `Todos`.
5. Probar el filtro correspondiente, por ejemplo `Actividades`.
6. Cambiar `ends_at` a una fecha pasada y confirmar que deja de aparecer.

---

## Fase actual: validacion de fechas y visibilidad en Admin Feed

### Causa exacta

`/admin/feed` permitia guardar publicaciones con `ends_at` anterior o igual a `starts_at`. En ese estado la publicacion podia verse como `PUBLISHED` y `PINNED` en admin, pero `/app/today` no la mostraba porque la ventana de fechas nunca estaba activa para usuarios.

### Validacion agregada

En crear y editar publicaciones se valida que, si existen `starts_at` y `ends_at`, la fecha de fin sea posterior a la fecha de inicio. Si no se cumple, no se guarda y se muestra:

```text
La fecha de fin debe ser posterior a la fecha de inicio.
```

La misma regla se revisa antes de acciones rapidas del listado para evitar publicar o modificar una publicacion con una ventana invalida.

### Badges de visibilidad

El listado de `/admin/feed` muestra un badge operativo:

- `VISIBLE AHORA`: publicada y dentro de la ventana de fechas;
- `PROGRAMADA`: publicada con `starts_at` futuro;
- `VENCIDA`: publicada con `ends_at` pasado;
- `SIN PUBLICAR`: `is_published = false`.

Esto no cambia la publicacion por si solo; solo explica por que aparece o no aparece en `/app/today`.

### Helper del formulario

El formulario ahora aclara:

```text
Deja las fechas vacías para mostrarlo inmediatamente sin expiración. Si usas fecha de fin, debe ser posterior al inicio.
```

### Confirmacion de /app/today

No se redisenio `/app/today`. La pantalla sigue mostrando publicaciones que cumplen:

- `is_published = true`;
- `starts_at` es `null` o `starts_at <= now()`;
- `ends_at` es `null` o `ends_at >= now()`.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- admin/events;
- carrusel del home;
- pagos.

### Como probar

1. Abrir `/admin/feed`.
2. Crear o editar una publicacion con `starts_at` posterior a `ends_at`.
3. Confirmar que aparece el error y no se guarda.
4. Crear una publicacion publicada sin fechas y confirmar badge `VISIBLE AHORA`.
5. Crear una publicacion publicada con `starts_at` futuro y confirmar badge `PROGRAMADA`.
6. Editar una publicacion publicada con `ends_at` pasado y confirmar badge `VENCIDA`.
7. Abrir `/app/today` y confirmar que solo aparecen publicaciones publicadas dentro de la ventana activa.

---

## Fase actual: limpieza de fechas en Admin Feed

### Problema de UX

Los inputs `datetime-local` del formulario de `/admin/feed` podian quedar en un estado invalido del navegador al intentar borrar la fecha manualmente. En ese caso el navegador bloqueaba el envio con `Debes introducir un valor válido`, aunque la intencion del admin fuera dejar la fecha vacia.

### Ajuste aplicado

Se agregaron botones pequenos `Limpiar` junto a:

- `Inicio`;
- `Fin`.

Al pulsarlos, el valor controlado queda como `""`. En el guardado, `fromDateTimeLocal` convierte ese valor a `null`, por lo que la publicacion queda sin inicio o sin expiracion.

### Helper dinamico

Cuando `starts_at` y `ends_at` estan vacios, el formulario muestra:

```text
Visible inmediatamente y sin expiración.
```

Si alguna fecha esta presente, mantiene la ayuda general sobre dejar fechas vacias y usar fin posterior al inicio.

### Reglas conservadas

Se mantiene la validacion:

- si `starts_at` y `ends_at` existen, `ends_at` debe ser posterior a `starts_at`;
- una publicacion publicada sin ventana invalida se marca como `VISIBLE AHORA`;
- `starts_at` futuro se marca como `PROGRAMADA`;
- `ends_at` pasado se marca como `VENCIDA`.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- `/app/today` visual;
- admin/events.

### Como probar

1. Abrir `/admin/feed`.
2. Editar una publicacion con fechas.
3. Pulsar `Limpiar` en `Inicio` y `Fin`.
4. Confirmar que aparece `Visible inmediatamente y sin expiración.`
5. Guardar la publicacion.
6. Confirmar que el listado muestra `VISIBLE AHORA` si esta publicada.
7. Abrir `/app/today` y confirmar que la publicacion aparece.

---

## Fase actual: corrección de carga de Hoy en FLEX con image_url

### Causa del error

`/app/today` consultaba `daily_feed_posts.image_url`, pero la base local todavia no tenia aplicada la migracion que agrega esa columna. Supabase/PostgREST devolvia error de columna inexistente y la pantalla mostraba el mensaje generico de carga.

Se confirmo en la base local:

- `public.events` ya tenia `image_url` y `cover_image_path`;
- `public.daily_feed_posts` no tenia `image_url` antes de aplicar la migracion;
- la relacion `daily_feed_posts_event_id_fkey` existe, por lo que el join con `events` es valido.

### Migracion aplicada

Se mantiene la migracion incremental:

```sql
alter table public.daily_feed_posts
  add column if not exists image_url text;
```

Se aplico con:

```bash
supabase migration up
```

No se ejecuto `supabase db reset`.

### Consulta de /app/today

La consulta de `/app/today` sigue leyendo:

- posts publicados;
- ventana activa `starts_at` / `ends_at`;
- `post.image_url`;
- imagen del evento vinculado mediante `events(title, image_url, cover_image_path)`.

La prioridad visual se mantiene:

1. `post.image_url`;
2. `event.image_url` o `event.cover_image_path`;
3. fallback visual por categoria.

### Debug en desarrollo

El `console.error` de desarrollo ahora muestra un objeto con:

- `message`;
- `details`;
- `hint`;
- `code`.

En produccion no se deja logging ruidoso y el usuario solo ve un mensaje generico si falla la carga.

### Que no se toco

No se modifico:

- diseño de tarjetas;
- selector interactivo;
- admin/events;
- auth;
- middleware;
- roles;
- RLS;
- migraciones antiguas;
- carrusel del home.

### Como probar

1. Abrir `/admin/feed`.
2. Crear una publicacion con `image_url` vacio.
3. Crear una publicacion con `/images/feed/test.jpg`.
4. Abrir `/app/today`.
5. Confirmar que no crashea.
6. Confirmar que la publicacion sin imagen usa fallback visual.
7. Confirmar que la publicacion con imagen intenta mostrar la ruta indicada.

---

## Fase actual: subida de imágenes en Admin Feed

### Columna nueva

Se agrego una migracion incremental para `daily_feed_posts`:

```sql
image_url text null
```

No se modificaron migraciones antiguas ni RLS. La columna queda cubierta por las politicas existentes de lectura y gestion de `daily_feed_posts`.

### Bucket usado

Se agrego el bucket publico `feed-images` con politicas para:

- lectura publica;
- insercion, actualizacion y borrado solo para admin activo.

### Flujo en `/admin/feed`

El formulario de crear/editar publicaciones ahora prioriza la subida por archivo:

- selector `input type="file"`;
- preview visual inmediata;
- boton `Quitar imagen`;
- campo manual opcional como respaldo.

Formatos recomendados:

- JPG;
- PNG;
- WebP.

Tamano maximo:

- 5 MB.

Si el admin pega una ruta manual:

- `images/feed/archivo.jpg` se normaliza a `/images/feed/archivo.jpg`;
- `public/images/feed/archivo.jpg` se normaliza a `/images/feed/archivo.jpg`;
- URLs `http://` y `https://` se conservan;
- strings vacios se guardan como `null`.

Al subir un archivo:

- se guarda en `feed-images`;
- se genera un nombre unico con prefijo seguro;
- se guarda la URL publica resultante en `daily_feed_posts.image_url`.

### Prioridad de imagen en `/app/today`

Las publicaciones del mural usan:

1. `post.image_url`;
2. `event.image_url` o `event.cover_image_path` cuando la publicacion esta vinculada a un evento;
3. fallback visual por categoria.

Si una publicacion VIP, Promo, Actividad, Escenario o Aviso tiene imagen propia, esa imagen se muestra en las cards editoriales y en el feed compacto. Si no hay imagen, no se muestra icono roto: queda el fondo degradado FLEX.

### Listado admin

El listado de `/admin/feed` muestra una miniatura discreta en la columna de publicacion. Si no hay `image_url`, se muestra un placeholder visual sutil sin hacer la tabla pesada.

### Pendiente

En esta fase no se borra automaticamente la imagen anterior del storage cuando una publicacion se reemplaza o se elimina. Eso queda pendiente para una fase posterior si se quiere limpiar el bucket.

### Que no se toco

No se modifico:

- auth;
- middleware;
- roles;
- RLS;
- migraciones antiguas;
- admin/events;
- carrusel del home;
- pagos;
- VIP;
- tickets.

### Como probar

1. Aplicar la migracion nueva en el entorno correspondiente.
2. Crear una publicacion VIP desde `/admin/feed` seleccionando una imagen local.
3. Crear una publicacion Promo con una imagen local diferente.
4. Editar una publicacion y cambiar la imagen.
5. Quitar la imagen y guardar.
6. Abrir `/app/today` y revisar `Todos`.
7. Revisar filtro `VIP`.
8. Revisar filtro `Promos`.
9. Confirmar que las publicaciones sin imagen usan fallback visual y que no aparece imagen rota.

---

## Fase actual: normalizacion Supabase local entre computadores

### Diagnostico

El problema de sincronizacion entre computadores no era GitHub ni Next.js. Git solo mueve codigo y archivos versionados. Las tablas, columnas, buckets, policies y datos creados manualmente en Supabase Studio local viven dentro del Docker/local Postgres de cada computador y no viajan a otro equipo.

Por eso una maquina podia tener `daily_feed_posts.image_url`, publicaciones, zonas o eventos creados manualmente, mientras otra maquina solo tenia lo que existia en `supabase/migrations`. Cuando la app consultaba `/app/today`, `/admin/feed` u otras secciones contra una base local incompleta, aparecian errores de tabla/columna/datos faltantes.

### Auditoria de estructura

Las tablas principales estan versionadas en migraciones:

- `profiles`
- `staff_profiles`
- `club_zones`
- `events`
- `event_ticket_tiers`
- `tickets`
- `private_room_access`
- `private_room_guests`
- `song_requests`
- `live_session_queue`
- `notifications`
- `storage_items`
- `access_logs`
- `orders`
- `order_items`
- `daily_feed_posts`

Tambien esta versionado:

- `daily_feed_posts.image_url` en `supabase/migrations/20260610120000_daily_feed_posts_image_url.sql`.
- bucket publico `event-images` en `supabase/migrations/20260603120000_event_media_admin_fields.sql`.
- bucket publico `feed-images` en `supabase/migrations/20260610123000_feed_images_bucket.sql`.
- RLS y policies principales para tablas operativas y storage.

No se modificaron migraciones antiguas y no se borro ninguna migracion.

### Seed versionado

Se agrego `supabase/seed.sql` para reconstruir datos base en cualquier computador despues de aplicar migraciones.

Datos obligatorios versionados:

- `club_zones`:
  - Entrada Principal
  - Pista Principal
  - Bar Principal
  - Escenario
  - Guardarropa / Storage
  - Banos
  - Sala Negra
  - Sala Roja
  - Sala Dorada

Datos demo opcionales versionados:

- eventos demo/base:
  - Flex Live Sessions: Jazz Night
  - Jazz Nights
  - Latin Urban Night
  - Reggaeton Classics
- tiers base para esos eventos en `event_ticket_tiers`.
- publicaciones demo de Hoy en FLEX en `daily_feed_posts`:
  - Live Jazz Session
  - 2x1 en cocteles
  - Open Mic
  - Ultimos cupos VIP

El seed es idempotente:

- actualiza datos existentes por nombre/titulo cuando ya existen;
- inserta solo lo que falta;
- usa UUIDs fijos para datos base/demo;
- usa `on conflict (id)` como proteccion adicional;
- no crea usuarios Auth;
- no guarda contrasenas;
- no contiene datos personales reales.

### Usuario admin local

El seed no crea usuario admin porque los usuarios pertenecen a Supabase Auth y no conviene commitear credenciales ni contrasenas.

Flujo recomendado para admin local:

1. Crear un usuario desde `/register` o Supabase Studio Auth.
2. Promover ese usuario con un snippet local controlado, por ejemplo `supabase/snippets/promote_existing_user_to_admin.sql`, ajustando email y rol.
3. Verificar que exista fila activa en `staff_profiles` con `role = 'admin'`.

### Flujo para cambiar de computador

Comandos base:

```bash
git pull
npm install
npx supabase start
npx supabase db reset
npm run dev
```

Advertencia importante:

`npx supabase db reset` destruye y recrea la base local. En local borra datos de `auth.users`, `profiles`, `staff_profiles` y cualquier dato operativo creado en Studio. Solo debe ejecutarse cuando se acepta perder/recrear esos datos locales.

Antes de resetear:

1. Guardar cualquier cambio de estructura como nueva migracion.
2. Guardar cualquier dato base necesario en `supabase/seed.sql`.
3. Exportar datos locales importantes si no se quieren perder.

Los datos creados manualmente en Supabase Studio no viajan a otro computador. Toda estructura debe estar en `supabase/migrations` y todo dato base debe estar en `supabase/seed.sql`.

### Comandos utiles Supabase

Crear migracion:

```bash
npx supabase migration new nombre
```

Aplicar migraciones local sin reset:

```bash
npx supabase migration up
```

Reset local destructivo:

```bash
npx supabase db reset
```

Ver estado de migraciones:

```bash
npx supabase migration list
```

Generar dump de datos antes de reset:

```bash
npx supabase db dump --local --data-only > backup-local.sql
```

### Checklist de seguridad

- Nunca commitear `.env.local`.
- Mantener `.env.example` sin secretos reales.
- No usar `service_role` en cliente.
- No meter datos reales o personales en `supabase/seed.sql`.
- No depender de datos creados manualmente en Supabase Studio.
- No ejecutar `supabase db reset` sin confirmar que se acepta perder la base local.
- No borrar ni reescribir migraciones antiguas para corregir una base local.

### Como probar

En un computador nuevo o base local descartable:

1. Ejecutar `git pull`.
2. Ejecutar `npm install`.
3. Ejecutar `npx supabase start`.
4. Si se acepta perder datos locales, ejecutar `npx supabase db reset`.
5. Crear o registrar usuario local.
6. Promover el usuario a admin si se necesita acceder a `/admin`.
7. Ejecutar `npm run dev`.
8. Abrir `/app/today` y confirmar publicaciones base.
9. Abrir `/admin/feed` con admin activo y confirmar que carga sin error de columna `image_url`.
10. Abrir `/app/events` y confirmar eventos/tiers demo.

### Pendiente

- Validar el flujo completo en una base local reseteada solo con confirmacion explicita.
- Decidir si se versiona `supabase/config.toml`. En este repo no aparece actualmente; agregarlo puede cambiar la identidad local de contenedores Supabase existentes, por eso no se creo automaticamente en esta fase.
- Definir si los datos demo deben mantenerse siempre activos o moverse a un seed opcional separado en una fase posterior.
- Limpiar o reemplazar snippets antiguos que contengan pruebas locales no reutilizables.

---

## Fase actual: modelo conceptual de Hoy en FLEX como mural de marketing

### Problema corregido

Hoy en FLEX estaba funcionando de forma ambigua: una publicacion tipo `event` podia terminar vinculada a eventos demo/base y `/app/today` generaba botones tipo `Ver evento` aunque la tarjeta fuera realmente una promo, aviso o anuncio independiente.

Eso generaba confusion porque el feed no debe ser la fuente principal de entidades. Los eventos reales se crean y administran en `/admin/events`. El feed solo promociona, anuncia o dirige a acciones concretas ya existentes.

### Nueva regla de negocio

- `/admin/events` crea eventos reales.
- `/admin/feed` solo publica piezas de marketing, avisos o accesos directos.
- Una publicacion tipo `event` debe estar vinculada a un evento real existente.
- Si una publicacion no es tipo `event`, no usa `event_id` para navegar.
- Las publicaciones de Hoy no deben mandar a eventos demo/base del seed por accidente.
- El CTA se calcula por tipo de publicacion y por URL manual cuando exista.

### Reglas de CTA por tipo

Prioridad general:

1. Si existe `cta_url` manual, se usa como destino.
2. Si `type = event` y existe `event_id` real, se usa `/app/events/[event_id]`.
3. Si `type = vip`, se usa `/app/vip`.
4. Si `type = stage`, se usa `/app/my-turn`.
5. Si `type = promotion`, `activity` o `announcement` no tienen `cta_url`, no se muestra boton.
6. Nunca se usa `event_id` si `type` no es `event`.

Labels por defecto:

- `event`: `Ver evento`
- `vip`: `Reservar VIP`
- `promotion`: `Ver promo`
- `stage`: `Participar`
- `activity`: `Ver actividad`
- `announcement`: `Mas informacion` solo cuando tiene CTA manual.

### Como funciona `event_id`

En `/admin/feed`, el selector de evento solo aparece cuando el tipo es `event`.

Si el usuario cambia una publicacion de `event` a otro tipo, el formulario limpia `event_id`. Al guardar, cualquier tipo distinto de `event` envia `event_id = null`.

Para tipo `event`, guardar sin evento vinculado muestra error:

```text
Los anuncios de evento deben vincularse a un evento creado en /admin/events.
```

El selector de eventos del feed excluye los eventos demo/base conocidos del seed para evitar enlaces accidentales desde Hoy en FLEX.

### Comportamiento por tipo

- `event`: exige evento real vinculado; CTA por defecto a `/app/events/[event_id]`.
- `promotion`: no usa evento; usa `cta_url` si existe; si no, no muestra boton. A futuro puede existir `/admin/promos`.
- `vip`: no usa evento; CTA por defecto a `/app/vip`; `zone_id` puede dar contexto visual de sala.
- `stage`: no usa evento; CTA por defecto a `/app/my-turn`.
- `activity`: no usa evento salvo que se convierta explicitamente en `event`; usa `cta_url` si existe; si no, no muestra boton.
- `announcement`: no usa evento; CTA opcional; si no hay `cta_url`, no muestra boton.

### Archivos modificados

- `app/admin/feed/page.tsx`
- `app/app/today/page.tsx`
- `components/feed/FeedPostCard.tsx`
- `components/feed/FeedPostForm.tsx`
- `components/feed/FeedBadges.tsx`
- `DOCUMENTACION_FLEX.md`

### Que no se toco

No se modifico:

- auth;
- middleware;
- roles;
- RLS;
- pagos;
- Stripe;
- carrusel del home;
- migraciones antiguas;
- seed de Supabase.

No se ejecuto `supabase db reset`.

### Como probar

1. Abrir `/admin/feed`.
2. Crear publicacion tipo `event` sin seleccionar evento y confirmar que no permite guardar.
3. Crear publicacion tipo `event` con evento real de `/admin/events` y confirmar que el CTA manda a `/app/events/[event_id]`.
4. Crear publicacion tipo `vip` sin CTA manual y confirmar en `/app/today` que el boton dice `Reservar VIP` y manda a `/app/vip`.
5. Crear publicacion tipo `stage` sin CTA manual y confirmar que el boton dice `Participar` y manda a `/app/my-turn`.
6. Crear publicacion tipo `promotion` sin CTA manual y confirmar que no aparece boton.
7. Crear publicacion tipo `promotion` con `cta_url` y confirmar que usa esa URL.
8. Editar una publicacion de `event` a `vip` y confirmar que ya no conserva ni usa `event_id`.

---

## Fase actual: rails horizontales en Hoy en FLEX

### Objetivo

Se ajusto `/app/today` para que el mural no acumule tarjetas verticalmente cuando hay muchas publicaciones. Las secciones ahora se presentan como filas horizontales tipo catalogo premium, con scroll-snap, swipe natural en mobile y flechas discretas en desktop.

### Nuevo componente

Se creo `components/feed/FeedRail.tsx`.

Recibe:

- `title`
- `subtitle`
- `posts`
- `variant`: `featured`, `standard` o `compact`

El rail:

- renderiza una fila horizontal de tarjetas;
- usa `scroll-snap` para que cada tarjeta encaje al desplazarse;
- oculta scrollbars nativas;
- evita overflow horizontal global;
- muestra flechas izquierda/derecha en desktop;
- permite swipe horizontal natural en mobile;
- usa `aria-label="Ver tarjetas anteriores"` y `aria-label="Ver más tarjetas"`;
- respeta `prefers-reduced-motion` usando desplazamiento inmediato cuando corresponde.

### Tarjetas

`components/feed/FeedPostCard.tsx` ahora acepta variantes visuales:

- `list`: comportamiento compacto anterior;
- `featured`: tarjeta amplia para destacados;
- `standard`: tarjeta media para rails por categoria;
- `compact`: tarjeta reducida para avisos rapidos.

La logica de CTA por tipo se mantiene centralizada en `getFeedPostCta(post)`. No se cambio la consulta a `daily_feed_posts` ni el modelo de datos.

### Organizacion de `/app/today`

En filtro `Todos`:

1. Rail `Destacados de la noche` con variante `featured`.
2. Rails por categoria cuando existan posts:
   - `Promos`
   - `Eventos`
   - `Actividades`
   - `VIP`
   - `Escenario`
   - `Avisos`
3. Rail compacto `Avisos rapidos`.

Si una categoria no tiene publicaciones, no se renderiza su rail.

En filtros especificos:

- se muestra un unico rail de la categoria seleccionada;
- si no hay publicaciones en esa categoria, se conserva el empty state existente.

### Responsive

- Desktop: se ven varias tarjetas por rail y las flechas permiten avanzar/retroceder.
- Laptop: aproximadamente dos tarjetas visibles segun ancho.
- Tablet: una tarjeta y media aproximadamente.
- Mobile: una tarjeta casi completa con un peek de la siguiente y swipe horizontal.

No hay autoplay y no se replica el carrusel del home. El rail es navegacion horizontal por catalogo, no un hero carousel.

### Performance

- No se agregaron dependencias.
- No se usan librerias de animacion.
- No se anima `width` ni `height`.
- Las transiciones son ligeras y se limitan a `transform`, `opacity`, color, borde y sombra sutil.
- El movimiento respeta `prefers-reduced-motion`.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- pagos;
- Stripe;
- carrusel del home;
- admin/feed;
- admin/events.

No se ejecuto `supabase db reset`.

### Como probar

1. Crear 5 publicaciones tipo `event` en `/admin/feed`.
2. Crear 3 publicaciones tipo `promotion`.
3. Crear 2 publicaciones tipo `vip`.
4. Abrir `/app/today`.
5. Confirmar que `Destacados de la noche` aparece como rail horizontal.
6. Confirmar que `Eventos`, `Promos` y `VIP` aparecen como rails separados.
7. Probar flechas en desktop.
8. Probar swipe horizontal en mobile.
9. Confirmar que la pagina completa no genera scroll horizontal global.
10. Confirmar que los CTA siguen respetando la regla por tipo.

---

## Fase actual: Spotlight de la noche en Hoy en FLEX

### Objetivo

Se rediseño la parte superior de `/app/today` para que no toda la pantalla funcione como rails horizontales. El mural ahora abre con un bloque editorial grande llamado `Spotlight de la noche` y mantiene los rails horizontales solo para exploracion inferior por categoria.

### Nuevo componente

Se creo `components/feed/TodaySpotlight.tsx`.

El componente renderiza:

- una card principal grande y visual;
- una columna lateral `Agenda cercana` / `Proximos en FLEX`;
- CTA coherente usando la logica existente de `getFeedPostCta(post)`;
- imagen del post, del evento vinculado o fallback visual;
- agenda de eventos publicados proximos.

### Diferencia entre spotlight y rails

`TodaySpotlight` es jerarquico y editorial: muestra una sola pieza principal para orientar la noche.

`FeedRail` sigue siendo exploratorio: organiza listas horizontales por categorias como Promos, Eventos, Actividades, VIP, Escenario y Avisos.

La estructura en filtro `Todos` queda:

1. Header y filtros.
2. `TodaySpotlight`.
3. Rails por categoria.

Ya no existe rail superior `Destacados de la noche`.

### Como se elige el contenido principal

Prioridad:

1. Publicacion fijada con prioridad `high` o `urgent`.
2. Publicacion fijada mas reciente.
3. Evento publicado mas cercano en fecha futura o del dia.
4. Primera publicacion activa.
5. Si no hay posts ni eventos, se mantiene el empty state de pagina.

Si el spotlight viene de una publicacion:

- `event` con `event_id`: CTA `Ver evento` a `/app/events/[event_id]`;
- `vip`: CTA `Reservar VIP` a `/app/vip`;
- `stage`: CTA `Participar` a `/app/my-turn`;
- `promotion`, `activity` o `announcement`: usan `cta_url` si existe; si no hay destino, no muestran CTA.

Si el spotlight viene de un evento:

- usa `/app/events/[id]`;
- label `Ver evento`;
- imagen `image_url`, luego `cover_image_path`, luego fallback local.

### Proximos eventos cercanos

`/app/today` consulta eventos publicados desde la tabla `events`:

- `is_published = true`;
- `starts_at >= inicio del dia actual`;
- orden `starts_at asc`;
- maximo 6 en la consulta y hasta 4 visibles en la columna.

La columna lateral muestra:

- dia/mes o `Hoy`;
- hora;
- titulo;
- zona si existe;
- estado `Proximo`, `Hoy` o `Destacado`;
- CTA compacto `Ver` a `/app/events/[id]`.

Si el evento del spotlight tambien aparece en la agenda, se oculta de la columna lateral para evitar repeticion visual.

Si no hay proximos eventos, se muestra:

```text
La agenda se esta preparando.
```

### Responsive

- Desktop: card principal a la izquierda y agenda a la derecha.
- Laptop: proporcion aproximada 2/1.
- Tablet/mobile: agenda baja debajo del spotlight y los items quedan compactos.

No hay autoplay ni intervalos. Las transiciones son ligeras y se mantienen dentro de transform, color, borde y sombra sutil. Se respeta `prefers-reduced-motion` mediante las reglas globales existentes.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- pagos;
- Stripe;
- carrusel del home;
- admin/feed;
- admin/events.

No se ejecuto `supabase db reset`.

### Como probar

1. Crear una publicacion fijada y prioridad alta en `/admin/feed`.
2. Crear o publicar eventos proximos en `/admin/events`.
3. Abrir `/app/today` en filtro `Todos`.
4. Confirmar que la publicacion fijada alta ocupa el spotlight.
5. Confirmar que la columna `Proximos en FLEX` lista hasta 4 eventos cercanos.
6. Confirmar que el evento del spotlight no se duplica en la agenda lateral.
7. Probar filtros `Promos`, `Eventos` y `VIP`; deben ocultar el spotlight y mostrar el rail filtrado.
8. Probar responsive en desktop, laptop y mobile.
9. Confirmar que los CTA siguen respetando la regla por tipo.

---

## Fase actual: Spotlight mixto y agenda rapida en Hoy en FLEX

### Objetivo

Se pulio el bloque superior de `/app/today` manteniendo la card protagonista del spotlight, pero reduciendo el lateral para que funcione como widget util y no como otra seccion pesada de eventos.

La pagina queda:

- arriba: `Spotlight de la noche` grande;
- derecha: panel compacto `Esta noche`;
- abajo: rails por categoria.

No se agrego una nueva seccion de proximos eventos debajo para evitar saturar la zona inferior.

### Panel `Esta noche`

El lateral de `TodaySpotlight` ahora se presenta como `Agenda rapida` / `Esta noche`.

Muestra maximo 3 items:

- fecha o `Hoy`;
- hora;
- titulo;
- zona si existe;
- estado `Proximo`, `Hoy` o `Destacado`;
- CTA pequeno `Ver`.

El panel usa:

- fondo oscuro/transparente;
- borde sutil;
- padding reducido;
- separadores suaves;
- items tipo lista premium.

Si no hay proximos eventos, intenta mostrar hasta 3 acciones destacadas de tipo:

- `promotion`;
- `vip`;
- `stage`.

Si tampoco hay acciones con CTA, muestra:

```text
La agenda se esta preparando.
```

### Cards de evento

Las cards de `type = event` en `FeedPostCard` cambian de comportamiento:

- la card completa es clickeable cuando existe `event_id` valido;
- el destino es `/app/events/[event_id]`;
- no se muestra body largo dentro de la card;
- se muestra contexto corto, titulo y affordance discreto `Ver evento`;
- no se anidan botones ni links dentro del link principal.

Esto evita que descripciones largas tapen la imagen, el artista/contexto visual o el acceso al evento.

### Otros tipos de cards

Las publicaciones que no son evento mantienen body corto y CTA por tipo:

- `vip`: `Reservar VIP` hacia `/app/vip`;
- `stage`: `Participar` hacia `/app/my-turn`;
- `promotion`: `Ver promo` solo si hay `cta_url`;
- `activity`: `Ver actividad` solo si hay `cta_url`;
- `announcement`: `Mas informacion` solo si hay `cta_url`.

Se mantiene la regla: nunca se usa `event_id` si `type` no es `event`.

### Responsive

- Desktop/laptop: spotlight izquierda y panel `Esta noche` derecha.
- Tablet/mobile: el panel baja debajo del spotlight, manteniendose compacto.
- No se convierte el panel en rail ni se duplica como seccion inferior.

### Que no se toco

No se modifico:

- Supabase schema;
- migraciones;
- RLS;
- auth;
- middleware;
- roles;
- pagos;
- Stripe;
- carrusel del home;
- admin/feed;
- admin/events.

No se ejecuto `supabase db reset`.

### Como probar

1. Crear una publicacion fijada alta en `/admin/feed`.
2. Crear eventos proximos publicados.
3. Abrir `/app/today` en `Todos`.
4. Confirmar que la card principal grande se mantiene.
5. Confirmar que el lateral dice `Esta noche` y muestra maximo 3 items compactos.
6. Confirmar que no aparece una seccion extra de proximos eventos abajo.
7. Abrir el rail `Eventos` y confirmar que las cards event completas son clickeables.
8. Confirmar que las cards event no muestran body largo.
9. Probar filtros `Promos`, `Eventos` y `VIP`.
10. Probar responsive desktop, laptop y mobile.
## Fase actual: reparación técnica de admin/feed - 2026-06-15

### Contexto

Se revisó primero la parte técnica de `/admin/feed` y la navegación del área admin antes de continuar con cualquier cambio visual en `/app/today`.

El archivo de ruta `app/admin/feed/page.tsx` existe y no contiene `notFound()` ni redirects propios. El 404 observado en `/admin/feed` apunta a estado generado/dev server desincronizado, especialmente porque `npm run lint` ya fallaba leyendo `.next/dev/types` corruptos. La validación final debe hacerse con `.next` limpio si vuelve a aparecer.

### Cambios realizados

- `components/layout/AppShell.tsx`
  - Se agregó timeout de 8 segundos a la validación de rol staff.
  - Si Supabase Auth o `staff_profiles` no responde, la pantalla deja de quedarse indefinidamente en `Validando navegación...` y muestra un mensaje claro.
  - No se cambió middleware ni la lógica de auth server-side.

- `app/admin/feed/page.tsx`
  - Se mantiene la ruta `/admin/feed`.
  - Se agregó confirmación antes de eliminar:
    `¿Eliminar esta publicación? Esta acción no se puede deshacer.`
  - Se endureció la validación de CTA: solo acepta rutas internas que empiezan por `/` y no por `//`, o URLs `https://` válidas.

- `components/feed/FeedPostCard.tsx`
  - `getFeedPostCta` ahora ignora `cta_url` inseguras o inválidas.
  - Se rechazan valores como `javascript:`, `data:`, `http://` externo y URLs protocol-relative `//...`.
  - La prioridad queda:
    1. `cta_url` válido.
    2. `event_id` si `type === "event"`.
    3. destino default por tipo (`vip`, `stage`).
    4. sin botón si no hay destino seguro.

- `components/feed/FeedPostForm.tsx`, `components/feed/FeedBadges.tsx`, `components/feed/TodaySpotlight.tsx`
  - Se corrigieron textos con mojibake.
  - Se reemplazaron emojis corruptos del badge admin por marcadores de texto limpios (`EV`, `PR`, `AC`, `AV`, `VIP`, `ST`).

- `supabase/seed.sql`
  - El seed `Live Jazz Session` dejó de ser `type='event'` sin `event_id`.
  - Ahora queda como `type='stage'`, evitando enlaces de evento huérfanos.

- `supabase/migrations/20260615100000_harden_daily_feed_posts_admin_rls.sql`
  - Nueva migración incremental.
  - No modifica migraciones antiguas.
  - Reemplaza policies de escritura `staff insert/update/delete daily feed` por policies admin-only:
    - `admin insert daily feed`
    - `admin update daily feed`
    - `admin delete daily feed`
  - Mantiene lectura de publicaciones publicadas para usuarios autenticados.
  - Mantiene lectura completa del feed para staff activo.
  - Corrige filas publicadas `type='event'` sin `event_id` para que no queden huérfanas tras un reset.

### Verificación local de base de datos

Se ejecutó:

```bash
supabase migration up
```

Resultado:

- La migración nueva se aplicó sin reset.
- `daily_feed_posts` mantiene 5 policies:
  - lectura publicada para usuarios autenticados;
  - lectura completa para staff;
  - insert/update/delete solo con `public.is_admin()`.
- `Live Jazz Session` quedó como `stage`.
- Hay `0` publicaciones publicadas tipo `event` sin `event_id`.

### Usuario admin local

No se crearon usuarios Auth.

Para verificar un admin local después de un reset:

```sql
select id, email from auth.users order by created_at desc;

select p.id, p.full_name, sp.role, sp.active
from public.profiles p
left join public.staff_profiles sp on sp.user_id = p.id
order by p.created_at desc;
```

Si falta `staff_profiles` activo con `role='admin'`, la app debe mostrar un estado claro de rol no disponible o redirigir a `/unauthorized`; no debe quedarse indefinidamente en `Validando navegación...`.

### Qué no se tocó

- No se rediseñó `/app/today`.
- No se quitaron rails/carruseles.
- No se tocó el carrusel del home.
- No se tocó pagos ni Stripe.
- No se modificaron migraciones antiguas.
- No se ejecutó `supabase db reset`.
- No se cambió middleware salvo diagnóstico.

### Cómo probar

1. Iniciar sesión con un usuario que tenga `staff_profiles.role = 'admin'` y `active = true`.
2. Abrir `/admin`.
3. Abrir `/admin/events`.
4. Abrir `/admin/feed`.
5. Crear una publicación.
6. Editar la publicación.
7. Publicar/despublicar y fijar/desfijar.
8. Intentar eliminar y confirmar que aparece el diálogo de confirmación.
9. Crear un CTA con `/app/vip` o `https://...` y confirmar que se renderiza.
10. Intentar CTA inseguro (`javascript:...`, `data:...`, `http://...`, `//...`) y confirmar que no se renderiza en `/app/today`.
11. Abrir `/app/today` y confirmar que no hay error ni pantalla blanca.

### Validación técnica

Se ejecutó:

```bash
npm run lint
npm run build
npm run lint
```

Resultado:

- `npm run lint`: correcto.
- `npm run build`: correcto.
- `npm run lint` final: correcto.
- El build de Next detecta `/admin/feed`, `/admin/events`, `/admin/staff` y el resto de rutas admin.
- Una request sin sesión a `/admin/feed` responde `307` hacia `/login?redirectTo=%2Fadmin%2Ffeed`, no `404`.

## Fase actual: herencia de imagen evento/feed y acciones admin/feed - 2026-06-15

### Contexto

Después de reparar `/admin/feed`, RLS y CTA seguro, se hizo un pulido acotado para integrar mejor publicaciones del feed con eventos reales y ordenar la columna de acciones del administrador.

No se rediseñó `/app/today`; se mantienen los rails/carruseles existentes.

### Prioridad de imagen en Hoy en FLEX

Las tarjetas del feed usan esta prioridad visual:

1. `daily_feed_posts.image_url`
2. `events.image_url` cuando la publicación tiene `event_id`
3. `events.cover_image_path` como respaldo del evento
4. fallback visual por tipo de publicación

Esto permite crear una publicación tipo `event` vinculada a un evento real sin subir una imagen duplicada al feed. Si después se sube una imagen propia en `/admin/feed`, esa imagen tiene prioridad sobre la del evento. Si se quita la imagen propia, vuelve a usarse la imagen heredada del evento.

### Cambios realizados

- `components/feed/FeedPostCard.tsx`
  - `getFeedPostImageUrl(post)` mantiene la prioridad `feed image -> event image -> event cover`.
  - El tipo `FeedPostView.events` ahora contempla `artist_name`, `zone_name` y `starts_at` como campos opcionales.
  - Las cards pueden mostrar `events.zone_name` si la publicación no tiene `club_zones.name`.

- `components/feed/TodaySpotlight.tsx`
  - `TodayEventPreview` contempla `artist_name`.
  - Las publicaciones destacadas siguen usando `getFeedPostImageUrl`, por lo que heredan imagen del evento cuando aplica.

- `app/app/today/page.tsx`
  - La consulta de `daily_feed_posts` ahora trae del evento relacionado:
    - `title`
    - `image_url`
    - `cover_image_path`
    - `artist_name`
    - `zone_name`
    - `starts_at`
  - La consulta de agenda de eventos también trae `artist_name`.

- `app/admin/feed/page.tsx`
  - La miniatura de la tabla usa la misma prioridad de imagen que las cards del feed.
  - Si una publicación vinculada a evento no tiene imagen propia, se ve la imagen heredada del evento.
  - La columna `Acciones` ahora usa una grilla estable:
    - desktop/tablet: 2x2
    - mobile: apilada en una columna
  - Se mantienen las mismas acciones: editar, publicar/despublicar, fijar/desfijar y eliminar.

- `components/feed/FeedPostForm.tsx`
  - El formulario puede usar la imagen del evento seleccionado como preview cuando no hay imagen propia.
  - Se agregó helper:
    `Si esta publicación está vinculada a un evento y no subes imagen, se usará la imagen del evento.`

### Qué no se tocó

- No se ejecutó `supabase db reset`.
- No se modificaron migraciones antiguas.
- No se tocó auth.
- No se tocó middleware.
- No se tocaron roles.
- No se tocó pagos ni Stripe.
- No se tocó el carrusel del home.
- No se rediseñó completamente `/app/today`.
- No se quitaron rails/carruseles existentes.
- No se agregaron dependencias.
- No se cambió la RLS ya corregida.
- No se relajó la validación CTA segura.

### Cómo probar

1. Crear o editar un evento en `/admin/events` con `image_url`.
2. Crear en `/admin/feed` una publicación tipo `event` vinculada a ese evento sin subir imagen propia.
3. Confirmar en `/admin/feed` que la miniatura hereda la imagen del evento.
4. Abrir `/app/today` y confirmar que la card usa la imagen del evento.
5. Editar la publicación y subir una imagen propia.
6. Confirmar que `/admin/feed` y `/app/today` usan la imagen propia del feed.
7. Quitar la imagen propia.
8. Confirmar que vuelve a usarse la imagen del evento.
9. Crear una publicación promo sin evento y sin imagen.
10. Confirmar que usa fallback visual y no intenta heredar imagen de evento.
11. Revisar la columna `Acciones` en desktop y mobile: botones alineados, sin `Eliminar` suelto en una línea rara.

### Validación técnica

Se ejecutó:

```bash
npm run lint
npm run build
```

Resultado:

- `npm run lint`: correcto.
- `npm run build`: correcto.
- El build sigue detectando `/admin/feed` y `/app/today`.

## Fase actual: separación de Hoy en FLEX y eventos en home - 2026-06-15

### Contexto

En `/app`, el bloque `Hoy en FLEX` y el bloque `Próximos eventos` podían repetir contenido cuando el feed incluía publicaciones tipo `event`. Esto hacía que la pantalla se sintiera saturada y con dos secciones cumpliendo una función parecida.

### Nueva regla de contenido

- `/app` es un resumen rápido de la noche.
- `/app/today` es el mural completo de Hoy en FLEX.
- `/app/events` es la vista oficial de eventos reales.

En el home, `Hoy en FLEX` prioriza publicaciones operativas o comerciales:

- `promotion`
- `vip`
- `stage`
- `activity`
- `announcement`

Por defecto no muestra publicaciones `type='event'` para evitar duplicarlas con `Próximos eventos`. Si no hay publicaciones activas no-event, puede mostrar como fallback máximo 1 publicación tipo `event`. El bloque sigue limitado a máximo 3 publicaciones.

### Cambios realizados

- `components/app/HomeTodayPreview.tsx`
  - La consulta trae hasta 6 publicaciones activas para poder filtrar del lado cliente.
  - Se seleccionan hasta 3 publicaciones no-event.
  - Si no hay publicaciones no-event activas, se permite 1 evento como fallback.
  - El CTA cambió de `Ver avisos` a `Ver mural` y mantiene destino `/app/today`.
  - El copy del bloque aclara su función: `Promos, avisos y movimientos rápidos de la noche.`

### Qué no se tocó

- No se tocó Supabase schema.
- No se crearon migraciones.
- No se ejecutó `supabase db reset`.
- No se tocó RLS.
- No se tocó auth.
- No se tocó middleware.
- No se tocó pagos ni Stripe.
- No se tocó `/app/today`.
- No se tocó `/admin/feed`.
- No se tocó `/admin/events`.
- No se agregaron dependencias.

### Cómo probar

1. Crear varias publicaciones activas no-event en `/admin/feed`.
2. Crear una publicación activa tipo `event`.
3. Abrir `/app`.
4. Confirmar que `Hoy en FLEX` muestra promos, avisos, VIP, escenario o actividades, no el evento duplicado.
5. Confirmar que `Próximos eventos` sigue mostrando eventos reales.
6. Si solo existe una publicación tipo `event` y no hay no-event activas, confirmar que `Hoy en FLEX` muestra máximo 1 fallback.
7. Abrir `Ver mural` y confirmar que lleva a `/app/today`.

## Fase actual: Stripe Checkout base - 2026-06-15

### Contexto

Se implemento la Fase 1 de pagos reales: configuracion servidor de Stripe, creacion de Checkout Session desde backend, ordenes `pending` en Supabase, webhook validado y generacion de accesos solo cuando Stripe confirma el pago.

No se implementaron graficas, KPIs ni estadisticas avanzadas en `/admin/payments`; eso queda para una fase posterior.

### Variables de entorno

`.env.example` incluye:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
```

Reglas:

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y `SUPABASE_SERVICE_ROLE_KEY` son solo servidor.
- Ninguna clave secreta debe llevar prefijo `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` queda documentada para fases cliente posteriores.

### Flujo Checkout

Endpoint:

- `POST /api/checkout`

Body permitido:

- `item_type`: `ticket` o `vip`
- `event_id`: requerido para tickets
- `ticket_tier_id`: requerido para tickets
- `zone_id`: requerido para VIP
- `quantity`: entre 1 y 10; VIP se limita a 1

El backend valida usuario autenticado, producto real, disponibilidad basica y precios desde Supabase. Despues crea `orders.status = pending`, crea `order_items`, crea Stripe Checkout Session, guarda `stripe_checkout_session_id` y devuelve `session.url`.

URLs:

- success: `/app/tickets?checkout=success&session_id={CHECKOUT_SESSION_ID}`
- cancel: `/app/tickets?checkout=cancelled`

El frontend no crea tickets ni marca ordenes como pagadas.

### Webhook Stripe

Endpoint:

- `POST /api/stripe/webhook`

El webhook lee raw body, valida `Stripe-Signature` con `STRIPE_WEBHOOK_SECRET`, usa cliente servidor con `SUPABASE_SERVICE_ROLE_KEY`, responde 400 si la firma no es valida y responde 200 si el evento se procesa o se ignora de forma segura.

Eventos manejados:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.payment_failed`
- `charge.refunded`

### Confirmacion de pago y accesos

`checkout.session.completed` busca la orden por `stripe_checkout_session_id`, valida `amount_total` y `currency`, marca `status = paid`, guarda `paid_at`, `stripe_payment_intent_id`, `stripe_customer_id` y `customer_email`, y crea fulfillment segun `order_items`.

Fulfillment:

- `ticket`: crea filas en `tickets` con `order_id`, `user_id`, `event_id`, `zone_id` si aplica y `status = active`.
- `vip`: crea filas en `private_room_access` con `order_id`, `user_id`, `zone_id`, `active = true` y `max_guests` segun capacidad de sala hasta 10.

Idempotencia:

- Antes de crear tickets o accesos, el webhook revisa si ya existe fulfillment para ese `order_id` en `tickets` o `private_room_access`.
- Si Stripe reintenta el webhook despues de una orden ya pagada, responde sin duplicar.

Estados adicionales:

- `checkout.session.expired`: si la orden sigue `pending`, se marca `failed`.
- `payment_intent.payment_failed`: marca `failed` cuando puede vincularse por `stripe_payment_intent_id`.
- `charge.refunded`: marca `refunded` cuando puede vincularse por `stripe_payment_intent_id`.

### Cambios en UI

- `/app/events/[eventId]`: cada tier activo tiene boton `Comprar` que llama a `/api/checkout` y redirige a Stripe.
- `/app/vip`: cada sala VIP activa inicia Checkout para reservar la sala; VIP se compra de una en una.
- `/app/tickets`: lee `checkout=success` y `checkout=cancelled` y muestra aviso sin marcar nada como pagado.
- `/admin/payments`: mantiene vista basica sin graficas, con filtros `pending`, `paid`, `failed` y `refunded`.

### Migracion nueva

`supabase/migrations/20260615110000_add_stripe_checkout_to_orders.sql` agrega:

- `orders.stripe_customer_id`
- `orders.customer_email`
- `orders.paid_at`
- `order_items.ticket_tier_id`
- `order_items.total_amount_cents`
- `tickets.zone_id`
- indices para session, status, created_at, order items y fulfillment por order.

No se modificaron migraciones antiguas.

### Como probar local con Stripe CLI

1. Ejecutar `stripe login`.
2. Ejecutar `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3. Copiar el `whsec_...` generado a `.env.local` como `STRIPE_WEBHOOK_SECRET`.
4. Configurar `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
5. Ejecutar `npm run dev`.
6. Crear o verificar un evento publicado con tier activo, o una sala VIP activa con precio.
7. Comprar usando tarjeta test `4242 4242 4242 4242`, fecha futura y CVC cualquiera.
8. Confirmar que la orden inicia `pending`, el webhook la cambia a `paid`, se crea ticket o acceso VIP, `/app/tickets` muestra la entrada y `/admin/payments` muestra la orden pagada.

### Que queda pendiente para fase 2

- Graficas en `/admin/payments`.
- KPIs.
- Top eventos.
- Ingresos por dia.
- Reembolsos manuales desde admin.
- Mejor pantalla de detalle de orden.

### Que no se toco

- No se ejecuto `supabase db reset`.
- No se modificaron migraciones antiguas.
- No se borraron migraciones.
- No se toco `/app/today`.
- No se toco feed.
- No se toco carrusel del home.
- No se tocaron pagos visuales avanzados ni graficas.
- No se expusieron secretos en cliente.

## Fase actual: diagnostico temporal de Checkout local - 2026-06-15

### Contexto

Se agrego diagnostico acotado a desarrollo para investigar por que `POST /api/checkout` devuelve 500 en local al reservar una sala VIP desde `/app/vip`.

### Cambios realizados

- `app/api/checkout/route.ts`
  - Se agregaron logs temporales solo cuando `NODE_ENV !== "production"`.
  - Los logs no imprimen claves completas; solo indican si existen variables sensibles.
  - Se registra el payload normalizado recibido.
  - Se registra el resultado de auth con prefijo parcial del usuario y si hay email, sin imprimir el email.
  - Se registra el lookup de `club_zones` para VIP, incluyendo si encontro zona, tipo, estado, precio y capacidad.
  - Se registra el lookup de `events` y `event_ticket_tiers` para tickets.
  - Se registra el resultado de insertar `orders` y `order_items`.
  - Se captura especificamente el error de `stripe.checkout.sessions.create`.
  - En desarrollo, los 500 devuelven JSON con `error`, `step` y `details`.
  - En produccion, el mensaje sigue siendo seguro y generico.

### Como probar

1. Ejecutar `npm run dev`.
2. Mantener Stripe CLI con `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3. Iniciar sesion en la app.
4. Abrir `/app/vip`.
5. Reservar una sala.
6. Revisar la terminal de Next.js buscando logs con prefijo `[checkout]`.
7. Si vuelve a responder 500, revisar el JSON de desarrollo para ver `step` y `details`.

### Que queda pendiente

- Retirar o reducir estos logs temporales cuando se identifique la causa.
- Aplicar el fix real segun el paso que falle.
- No se cambio la logica de negocio de Checkout.

## Fase actual: correccion local de Stripe Checkout en `/app/vip` - 2026-06-16

### Causa encontrada

En este computador `POST /api/checkout` fallaba antes de crear la sesion de Stripe por dos problemas locales:

- `.env.local` no tenia `SUPABASE_SERVICE_ROLE_KEY`, necesaria para crear el cliente admin de Supabase en `app/api/checkout/route.ts`.
- La base Supabase local no tenia aplicada la migracion `20260615110000_add_stripe_checkout_to_orders.sql`, por lo que faltaban columnas usadas por Checkout en `orders`, `order_items` y `tickets`.

No era un problema de diseno ni de la pagina `/app/vip`. Los datos base VIP si existian: habia 3 salas `private_room` activas con `vip_price_cents > 0`.

### Cambios realizados

- `app/api/checkout/route.ts`
  - Se ampliaron los logs seguros solo en desarrollo.
  - El chequeo de entorno ahora registra existencia y huella parcial de `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` y `NEXT_PUBLIC_APP_URL`.
  - Las respuestas de desarrollo para errores esperados de payload/auth devuelven `{ error, step, details }`.
  - No se imprimen claves completas ni emails.
- `.env.local`
  - Se agrego `SUPABASE_SERVICE_ROLE_KEY` usando el valor local de `npx supabase status`.
- Base local Supabase
  - Se ejecuto `npx.cmd supabase migration up --local`.
  - Quedaron aplicadas `20260615100000_harden_daily_feed_posts_admin_rls.sql` y `20260615110000_add_stripe_checkout_to_orders.sql`.

### Verificaciones realizadas

- `.env.local` contiene valores reales y no los vacios de `.env.example`.
- `NEXT_PUBLIC_SUPABASE_URL` coincide con `http://127.0.0.1:54321`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` coincide con la publishable key reportada por Supabase local.
- La migracion `add_stripe_checkout_to_orders` figura en `supabase_migrations.schema_migrations` con version `20260615110000`.
- Columnas presentes tras migrar:
  - `orders.stripe_customer_id`
  - `orders.customer_email`
  - `orders.paid_at`
  - `order_items.ticket_tier_id`
  - `order_items.total_amount_cents`
  - `tickets.zone_id`
- Datos VIP presentes:
  - 3 filas `club_zones.type = 'private_room'`
  - todas activas
  - precio minimo activo `12000` centimos

### Como probar

1. Reiniciar `npm run dev` para que Next.js recargue `.env.local`.
2. Iniciar sesion con un usuario real local.
3. Abrir `/app/vip`.
4. Reservar una sala VIP activa.
5. Si falla, revisar el JSON de desarrollo de `/api/checkout` y los logs `[checkout]` para identificar `step` y `details`.

### Que queda pendiente

- Mantener Stripe CLI escuchando si se quiere completar el webhook local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- Reducir los logs de diagnostico cuando el flujo quede estable.

## Fase actual: webhook Stripe robusto e idempotente - 2026-06-15

### Contexto

Stripe CLI puede enviar eventos auxiliares como `payment_intent.created`, `payment_intent.succeeded` o `charge.updated`. Esos eventos no deben romper el webhook de FLEX si no forman parte del fulfillment operativo.

### Cambios realizados

- `app/api/stripe/webhook/route.ts`
  - `checkout.session.completed` sigue siendo el evento que confirma la orden.
  - Busca la orden por `stripe_checkout_session_id` y usa `metadata.order_id` o `client_reference_id` como fallback.
  - Valida importe y divisa antes de marcar la orden como `paid`.
  - Si la orden no estaba pagada, actualiza `orders.status = paid`, `paid_at`, `stripe_payment_intent_id`, `stripe_customer_id` y `customer_email`.
  - Si la orden ya estaba `paid`, no duplica el pago pero revisa si falta fulfillment.
  - Antes de crear fulfillment comprueba si ya existen `tickets` o `private_room_access` para el `order_id`.
  - Para `ticket`, crea filas en `tickets`.
  - Para `vip_reservation`, crea filas en `private_room_access` y no crea tickets.
  - Eventos no manejados responden `200` con `{ received: true, ignored: true }`.
  - En desarrollo agrega logs seguros con prefijo `[stripe-webhook]`: `event_type`, `order_id`, si la orden paso a `paid`, si habia fulfillment previo, tickets creados, accesos VIP creados y eventos ignorados.
  - No se imprimen secretos ni payloads completos de Stripe.
- `app/api/checkout/route.ts`
  - La URL de exito agrega `item_type` para que el frontend distinga compras VIP de entradas al volver de Stripe.
- `lib/flex-actions.ts`
  - Se agrego `getCheckoutOrderSummary(sessionId)` para leer la orden propia del usuario y detectar si fue ticket o VIP.
- `app/app/tickets/page.tsx`
  - Si `checkout=success` corresponde a VIP, muestra `Reserva VIP recibida` y enlaces a `/app/vip` y `/app/profile`.
  - Evita mostrar `Aun no tienes entradas` como si una reserva VIP hubiera fallado.

### Como probar

1. Ejecutar `npm run dev`.
2. Ejecutar `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3. Comprar una entrada normal desde `/app/events/[eventId]`.
4. Confirmar que `checkout.session.completed` marca la orden `paid` y crea `tickets`.
5. Reservar una sala desde `/app/vip`.
6. Confirmar que `checkout.session.completed` marca la orden `paid` y crea `private_room_access`, sin crear `tickets`.
7. Reenviar el mismo evento desde Stripe CLI y confirmar que responde `200` sin duplicar fulfillment.
8. Enviar eventos auxiliares como `payment_intent.created`, `payment_intent.succeeded` o `charge.updated` y confirmar `200` con `ignored:true`.
9. Volver a `/app/tickets?checkout=success&item_type=vip...` y confirmar que muestra mensaje de reserva VIP en lugar del empty state de entradas.

### Que queda pendiente

- Revisar si se quiere una pantalla dedicada de reservas VIP activas.
- Considerar una proteccion transaccional en base de datos si se espera alta concurrencia de eventos duplicados simultaneos.
