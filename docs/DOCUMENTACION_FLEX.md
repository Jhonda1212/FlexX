# DOCUMENTACION FLEX

Documento verificado contra el estado actual del proyecto independiente en `C:\Users\Dia\Desktop\JJ-FLEX`.

La documentacion antigua se conserva en `DOCUMENTACION_FLEX.md` en la raiz. Este archivo es la version principal actualizada para el nuevo proyecto.

## 1. Estado general

FLEX es una app Next.js para una discoteca/live sessions con registro de usuarios, eventos, tickets QR, canciones, cola de escenario, salas VIP, guardarropa/storage y panel admin.

Estado real actual:

- Implementado: estructura Next.js App Router en la raiz del repo.
- Implementado: cliente Supabase de navegador en `lib/supabase.ts`.
- Implementado: migraciones SQL en `supabase/migrations`.
- Implementado: rutas principales de usuario, guardia, storage y admin.
- Parcial: proteccion de rutas staff/admin; hoy se apoya en controles client-side y RLS.
- Parcial: algunos paneles usan datos reales y otros usan datos demo/estaticos.
- Pendiente: `supabase/config.toml` no existe actualmente.
- Pendiente: no existe `supabase/functions`.
- Pendiente: checkout Stripe real y webhooks no estan presentes en el proyecto actual.
- Pendiente: middleware server-side para proteger rutas privadas antes de renderizar.

## 2. Stack tecnico

- Next.js App Router.
- React.
- TypeScript estricto.
- Tailwind CSS v4.
- Supabase Auth y Postgres local.
- Supabase RLS/policies en migraciones.
- `@supabase/supabase-js` para el cliente browser.
- `qrcode.react` para QR en cliente.
- `lucide-react` para iconos.

Scripts actuales en `package.json`:

- `npm run dev`: inicia Next.js.
- `npm run build`: compila produccion.
- `npm run start`: inicia build producida.
- `npm run lint`: ejecuta `tsc --noEmit`.

## 3. Estructura real del proyecto

La app ya no vive en `frontend/`. La estructura actual esta en la raiz:

- `app/`: rutas Next.js App Router.
- `components/`: componentes reutilizables.
- `lib/`: cliente Supabase, acciones y datos auxiliares.
- `public/`: assets publicos.
- `supabase/migrations/`: migraciones SQL versionables.
- `supabase/snippets/`: existe como carpeta, actualmente sin archivos.
- `.env.local`: variables locales, no debe subirse.
- `.env.example`: ejemplo versionable sin secretos.

No existen actualmente:

- `frontend/`.
- `docs/` antes de esta actualizacion.
- `supabase/config.toml`.
- `supabase/functions`.
- `middleware.ts`.
- `lib/supabase/client.ts`.
- `lib/supabase/server.ts`.

## 4. Archivos verificados

Existen:

- `lib/supabase.ts`: crea el cliente Supabase del navegador. Usa `NEXT_PUBLIC_SUPABASE_URL` y acepta `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con fallback a `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/flex-actions.ts`: concentra acciones de usuario/storage/guardia: eventos, VIP, tickets, storage, canciones, cola y validacion QR.
- `lib/admin-actions.ts`: verifica admin real contra `staff_profiles` y expone helpers admin.
- `components/`: contiene componentes admin, auth, feed, guard, layout y UI.
- `supabase/migrations`: contiene las migraciones copiadas al nuevo proyecto.

No existen actualmente:

- `supabase/functions/validate-qr`.
- `supabase/functions/create-checkout-session`.
- `supabase/functions/stripe-webhook`.
- `supabase/functions/_shared`.

Nota: la documentacion antigua hablaba de Edge Functions para QR y Stripe. En el codigo actual la validacion QR usa RPC directa a `public.validate_qr_token`.

## 5. Variables de entorno

`.env.local` existe y no debe subirse al repo.

Variables publicas esperadas:

- `NEXT_PUBLIC_SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` tambien es aceptada por compatibilidad.
- `NEXT_PUBLIC_ENABLE_MOCKS=true` es opcional para modo demo local.

No se documentan valores reales ni claves completas.

## 6. Rutas verificadas

Estas rutas existen actualmente en `app/`:

| Ruta | Archivo | Estado |
| --- | --- | --- |
| `/` | `app/page.tsx` | Implementado |
| `/login` | `app/login/page.tsx` | Implementado |
| `/register` | `app/register/page.tsx` | Implementado |
| `/app` | `app/app/page.tsx` | Implementado, mezcla datos demo y enlaces reales |
| `/app/events` | `app/app/events/page.tsx` | Implementado, lee `events` |
| `/app/song-request` | `app/app/song-request/page.tsx` | Implementado, inserta en `song_requests` o mock |
| `/app/my-turn` | `app/app/my-turn/page.tsx` | Implementado, inserta en `live_session_queue` o mock |
| `/app/tickets` | `app/app/tickets/page.tsx` | Implementado, lee `tickets` o mock |
| `/app/vip` | `app/app/vip/page.tsx` | Implementado, lee `club_zones` |
| `/app/today` | `app/app/today/page.tsx` | Implementado, lee `daily_feed_posts` |
| `/guard` | `app/guard/page.tsx` | Implementado con metricas/datos demo |
| `/guard/scan` | `app/guard/scan/page.tsx` | Implementado, valida QR con `validateQrToken` |
| `/storage` | `app/storage/page.tsx` | Implementado con datos demo |
| `/admin` | `app/admin/page.tsx` | Implementado, metricas reales con admin |
| `/admin/events` | `app/admin/events/page.tsx` | Implementado, CRUD basico `events` |
| `/admin/vip` | `app/admin/vip/page.tsx` | Implementado, gestiona zonas VIP en `club_zones` |
| `/admin/songs` | `app/admin/songs/page.tsx` | Implementado, gestiona `song_requests` |
| `/admin/queue` | `app/admin/queue/page.tsx` | Implementado, gestiona `live_session_queue` |
| `/admin/staff` | `app/admin/staff/page.tsx` | Implementado, gestiona `staff_profiles` por `user_id` |
| `/admin/tickets` | `app/admin/tickets/page.tsx` | Implementado, consulta/actualiza `tickets` |
| `/admin/payments` | `app/admin/payments/page.tsx` | Implementado, lectura de `orders` y `order_items` |
| `/admin/feed` | `app/admin/feed/page.tsx` | Implementado, gestiona `daily_feed_posts` |

Rutas adicionales existentes:

- `/app/profile`: parcial/placeholder.
- `/app/notifications`: parcial/placeholder.
- `/app/vip/[roomId]/share`: parcial; genera enlace demo con `https://flex.app` y token demo.
- `/guard/tickets`, `/guard/guests`, `/guard/alerts`, `/guard/reports`: parciales/listas simples.
- `/storage/new`: implementado, crea `storage_items` o mock.
- `/storage/scan`: implementado, reutiliza validador QR.
- `/storage/active`: implementado, lista y entrega `storage_items` o mock.
- `/storage/history`: parcial/lista simple.

## 7. Supabase y base de datos

Migraciones actuales:

- `supabase/migrations/20260519140000_initial_flex_schema.sql`.
- `supabase/migrations/20260521103000_flex_seed_and_zone_fix.sql`.
- `supabase/migrations/20260521103100_flex_seed_zones_and_demo_event.sql`.
- `supabase/migrations/20260521103200_create_daily_feed_posts.sql`.

Tablas declaradas en las migraciones actuales:

- `profiles`.
- `staff_profiles`.
- `events`.
- `club_zones`.
- `orders`.
- `order_items`.
- `tickets`.
- `private_room_access`.
- `private_room_guests`.
- `song_requests`.
- `live_session_queue`.
- `storage_items`.
- `access_logs`.
- `notifications`.
- `daily_feed_posts`.

Enums declarados:

- `staff_role`: `guard`, `storage`, `dj`, `admin`.
- `ticket_status`: `active`, `used`, `expired`, `cancelled`.
- `order_status`: `pending`, `paid`, `failed`, `refunded`.
- `order_item_type`: `ticket`, `vip_reservation`.
- `zone_type`: inicialmente `main_floor`, `stage`, `vip_room`, `private_room`, `storage`; luego se agregan `entrance`, `bar`, `bathroom`, `lounge`.
- `access_result`: `valid`, `used`, `expired`, `invalid`, `full`, `inactive`.
- `storage_status`: `active`, `delivered`, `lost`.
- `queue_status`: `waiting`, `called`, `done`, `cancelled`.
- `song_status`: `pending`, `approved`, `playing`, `played`, `rejected`.
- `notification_type`: `ticket`, `vip`, `song`, `queue`, `storage`, `system`.
- `feed_post_type`: `event`, `promotion`, `activity`, `announcement`, `vip`, `stage`, `security`, `storage`.
- `feed_priority`: `low`, `normal`, `high`, `urgent`.

Funciones SQL declaradas:

- `set_updated_at`.
- `secure_token`.
- `current_staff_role`.
- `is_staff`.
- `is_admin`.
- `create_profile_for_new_user`.
- `enforce_private_room_guest_limit`.
- `validate_qr_token`.

RLS esta habilitado para las tablas principales. Las policies cubren lectura propia, gestion admin, gestion staff por rol y lectura/gestion de feed por staff autenticado.

Tambien se crea el bucket `flex-assets` en `storage.buckets`.

## 8. Tablas usadas por el codigo actual

Uso directo encontrado en el codigo:

- `staff_profiles`: verificacion admin y gestion staff.
- `events`: listado usuario, admin events y dashboard.
- `club_zones`: VIP usuario/admin y feed admin.
- `tickets`: entradas usuario/admin y dashboard.
- `storage_items`: storage usuario/staff y dashboard.
- `song_requests`: peticiones de canciones y admin songs.
- `live_session_queue`: cola de escenario y admin queue.
- `daily_feed_posts`: Hoy en FLEX y admin feed.
- `orders`: dashboard admin y pagos.
- `order_items`: detalle en pagos admin.

Tablas presentes en DB pero con uso parcial o indirecto:

- `profiles`: trigger de auth y referencias; algunas pantallas admin pueden necesitar joins futuros.
- `private_room_access`: prevista para acceso VIP real, pero la pantalla de compartir usa token demo.
- `private_room_guests`: prevista para invitados VIP reales.
- `access_logs`: prevista para registrar accesos; la RPC actual `validate_qr_token` valida pero no inserta logs por si sola.
- `notifications`: tabla creada; UI de notificaciones esta parcial.

## 9. Flujos actuales

### Auth

`components/auth/AuthForm.tsx` usa Supabase Auth para login/register. En registro envia `full_name` en metadata. La migracion tiene trigger `create_profile_for_new_user()` para crear `profiles`.

Estado: implementado.

### Usuario

- `/app/events`: lee eventos publicados.
- `/app/song-request`: requiere usuario autenticado y crea `song_requests`.
- `/app/my-turn`: requiere usuario autenticado y crea `live_session_queue`.
- `/app/tickets`: requiere usuario autenticado y lista `tickets`.
- `/app/vip`: lista salas activas en `club_zones`.
- `/app/today`: lista posts publicados en `daily_feed_posts`.

Estado: implementado/parcial segun pantalla. Compra real de tickets y reserva real VIP siguen pendientes.

### QR

`components/guard/QrValidationPanel.tsx` llama `validateQrToken()` en `lib/flex-actions.ts`.

Estado actual:

- Con mocks activos, valida tokens demo en `localStorage`.
- Con Supabase real, llama `rpc("validate_qr_token", { input_token })`.
- No existe Edge Function `validate-qr`.
- La RPC valida tickets, accesos VIP y storage segun la funcion SQL.
- Pendiente: registrar `access_logs` desde el flujo real y aplicar efectos operativos adicionales si se requieren.

### Storage

- `/storage/new`: crea `storage_items` o mock.
- `/storage/active`: lista items activos/entregados y marca entregas.
- `/storage/scan`: reutiliza QR validation.

Estado: implementado/parcial. Algunas vistas de resumen/historial usan datos demo.

### Admin

`lib/admin-actions.ts` verifica usuario autenticado y rol `admin` activo en `staff_profiles`.

Pantallas admin reales:

- Dashboard: metricas desde tablas reales.
- Eventos: crea/edita/publica eventos.
- VIP: gestiona salas VIP.
- Canciones: cambia estado de solicitudes.
- Cola: cambia estado de participantes.
- Staff: upsert/update por `user_id`.
- Tickets: filtra y actualiza estado.
- Pagos: lectura de ordenes e items.
- Feed: CRUD de `daily_feed_posts`.

Estado: implementado, con proteccion client-side mas RLS. Pendiente middleware server-side.

## 10. Funcionalidades pendientes o parciales

Pendiente:

- Crear `supabase/config.toml` para reproducibilidad local del proyecto nuevo.
- Crear README principal.
- Generar tipos Supabase y tipar `createClient` con `Database`.
- Middleware server-side para `/admin`, `/guard`, `/storage` y rutas privadas.
- Flujo real de compra Stripe.
- Edge Functions de Stripe, si se decide mantener ese enfoque.
- Reserva real de sala VIP y generacion real de `private_room_access`.
- Registro real de `private_room_guests`.
- Sustituir enlace demo `https://flex.app/...demo_private_room_token`.
- Registrar accesos en `access_logs` durante validacion QR.
- Definir proceso seguro para crear/promover admins.

Parcial:

- `RoleGate` usa `localStorage` para roles mock en user/guard/storage.
- Algunas paginas operativas muestran datos estaticos desde `lib/demo-data.ts`.
- `notifications` existe en DB, pero UI no esta conectada plenamente.
- `profiles` existe, pero perfil de usuario esta parcial.

## 11. Preparacion para GitHub

Debe subirse:

- `app/`.
- `components/`.
- `lib/`.
- `public/`.
- `supabase/migrations/`.
- `package.json`.
- `package-lock.json`.
- `.env.example`.
- `.gitignore`.
- `docs/`.

No debe subirse:

- `.env.local`.
- `node_modules/`.
- `.next/`.
- `tsconfig.tsbuildinfo`.
- logs locales.
- `supabase/.branches`.
- `supabase/.temp`.

Antes de subir:

1. Crear `README.md`.
2. Crear o regenerar `supabase/config.toml`.
3. Decidir si conservar `DOCUMENTACION_FLEX.md` antiguo en raiz o moverlo a archivo historico.
4. Revisar textos con encoding roto heredado.
5. Ejecutar `npm run lint`.
6. Ejecutar `npm run build`.

## 12. Validacion reciente

Validaciones ejecutadas durante la auditoria:

- `npm run lint`: correcto.
- `npm run build`: correcto.

No se exponen secretos en esta documentacion.
