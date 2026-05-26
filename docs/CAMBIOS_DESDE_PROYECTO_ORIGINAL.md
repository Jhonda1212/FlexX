# CAMBIOS DESDE PROYECTO ORIGINAL

Este archivo registra los cambios y contradicciones detectadas al independizar FLEX desde el proyecto/fork anterior.

## 1. Documentacion antigua conservada

Existe un archivo antiguo en la raiz:

- `DOCUMENTACION_FLEX.md`.

No se borro. Se uso como referencia, pero contiene rutas y funcionalidades que ya no coinciden con el proyecto actual.

La documentacion principal verificada ahora vive en:

- `docs/DOCUMENTACION_FLEX.md`.

## 2. Cambio de estructura

Antes la documentacion hablaba de:

- `frontend/app`.
- `frontend/components`.
- `frontend/lib`.
- `frontend/public`.
- `frontend/.env.local`.

En el proyecto nuevo la app esta en la raiz:

- `app/`.
- `components/`.
- `lib/`.
- `public/`.
- `.env.local`.

Contradiccion corregida: cualquier referencia nueva debe usar rutas desde la raiz, no `frontend/`.

## 3. Supabase local y migraciones

Segun el contexto del proyecto nuevo:

- Las migraciones antiguas ya fueron copiadas a `supabase/migrations`.
- Se ejecuto `npx supabase db reset`.
- Las tablas se crearon correctamente en Supabase Studio.

Migraciones presentes:

- `supabase/migrations/20260519140000_initial_flex_schema.sql`.
- `supabase/migrations/20260521103000_flex_seed_and_zone_fix.sql`.
- `supabase/migrations/20260521103100_flex_seed_zones_and_demo_event.sql`.
- `supabase/migrations/20260521103200_create_daily_feed_posts.sql`.

Tablas confirmadas por migraciones:

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

## 4. Supabase config y carpetas locales

Estado actual:

- `supabase/migrations` existe.
- `supabase/snippets` existe, pero no contiene archivos actualmente.
- `supabase/.branches` existe como metadata local.
- `supabase/.temp` existe como metadata local.
- `supabase/config.toml` no existe actualmente.
- `supabase/functions` no existe actualmente.

Accion tomada previamente:

- `.gitignore` ignora `supabase/.branches` y `supabase/.temp`.

Pendiente antes de GitHub:

- Crear o regenerar `supabase/config.toml` si quieres que el entorno local sea reproducible desde cero.

## 5. Edge Functions y QR

La documentacion antigua afirmaba que existian:

- `supabase/functions/validate-qr`.
- `supabase/functions/create-checkout-session`.
- `supabase/functions/stripe-webhook`.
- `supabase/functions/_shared`.

Estado actual real:

- No existe `supabase/functions`.
- No hay Edge Functions versionadas en este proyecto.
- La validacion QR usa `rpc("validate_qr_token")` desde `lib/flex-actions.ts`.
- La funcion SQL `public.validate_qr_token` existe en la migracion principal.

Contradiccion corregida:

- La documentacion nueva marca Edge Functions como pendientes/no implementadas actualmente.

Riesgo pendiente:

- La RPC valida tokens, pero el flujo actual no documenta una insercion de `access_logs` desde el cliente. Si se necesita auditoria de accesos, hay que implementarla de forma segura.

## 6. Stripe

La documentacion antigua describia checkout y webhook de Stripe mediante Edge Functions.

Estado actual real:

- Existen tablas `orders` y `order_items`.
- Existe pantalla admin de pagos en `/admin/payments`.
- No existen Edge Functions Stripe.
- No se encontro flujo UI de checkout real.

Estado documentado ahora:

- Stripe queda como pendiente.
- Pagos admin es lectura de datos existentes, no un checkout completo.

## 7. Variables de entorno locales

`.env.local` existe en la raiz y no debe subirse.

No se exponen claves reales.

Variables esperadas por el codigo actual:

- `NEXT_PUBLIC_SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback compatible.
- `NEXT_PUBLIC_ENABLE_MOCKS` opcional para pruebas locales.

Cambios ya hechos:

- Se creo `.env.example` sin secretos.
- `lib/supabase.ts` acepta `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `lib/flex-actions.ts` usa la misma estrategia compatible cuando aplica.

## 8. Rutas verificadas

La documentacion nueva verifica que existen estas rutas solicitadas:

- `/`.
- `/login`.
- `/register`.
- `/app`.
- `/app/events`.
- `/app/song-request`.
- `/app/my-turn`.
- `/app/tickets`.
- `/app/vip`.
- `/app/today`.
- `/guard`.
- `/guard/scan`.
- `/storage`.
- `/admin`.
- `/admin/events`.
- `/admin/vip`.
- `/admin/songs`.
- `/admin/queue`.
- `/admin/staff`.
- `/admin/tickets`.
- `/admin/payments`.
- `/admin/feed`.

Tambien existen rutas adicionales:

- `/app/profile`.
- `/app/notifications`.
- `/app/vip/[roomId]/share`.
- `/guard/tickets`.
- `/guard/guests`.
- `/guard/alerts`.
- `/guard/reports`.
- `/storage/new`.
- `/storage/scan`.
- `/storage/active`.
- `/storage/history`.

## 9. Estado funcional corregido frente a documentacion antigua

Correcciones principales:

- Admin ya no se documenta como placeholders reutilizando dashboard. Existen paginas reales para events, VIP, songs, queue, staff, tickets, payments y feed.
- `/app/today` y `/admin/feed` existen actualmente.
- QR ya no se documenta como Edge Function versionada; se documenta como RPC directa.
- `frontend/` ya no se documenta como carpeta activa.
- `supabase/config.toml` no se documenta como existente.
- `supabase/functions` no se documenta como existente.
- `supabase/snippets/promote_existing_user_to_admin.sql` aparecia en la documentacion antigua, pero no existe actualmente en este proyecto.

## 10. Archivos que no deben subirse

No subir:

- `.env.local`.
- `node_modules/`.
- `.next/`.
- `tsconfig.tsbuildinfo`.
- `dev-server.*.log`.
- `supabase/.branches`.
- `supabase/.temp`.

Mantener versionado:

- `supabase/migrations`.
- `.env.example`.
- `docs/`.
- `app/`, `components/`, `lib/`, `public/`.

## 11. Pendiente antes de subir a GitHub

Antes del primer commit/repo nuevo:

1. Crear `README.md`.
2. Crear o restaurar `supabase/config.toml`.
3. Decidir si `DOCUMENTACION_FLEX.md` antiguo queda en raiz como historico o se mueve despues a `docs/`.
4. Revisar textos con encoding roto heredado.
5. Decidir si los mocks (`RoleGate`, `mock-store`, `demo-data`) quedan como modo demo explicito.
6. Reemplazar el enlace demo `https://flex.app/...demo_private_room_token`.
7. Ejecutar `npm run lint`.
8. Ejecutar `npm run build`.

## 12. Validaciones realizadas

Validaciones recientes durante auditoria del proyecto:

- `npm run lint`: correcto.
- `npm run build`: correcto.

No se ejecuto un nuevo `supabase db reset` durante esta actualizacion de documentacion porque el usuario ya indico que lo habia ejecutado correctamente.
