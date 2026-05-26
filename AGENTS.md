# AGENTS.md  FLEX

## Contexto general

FLEX es una app para una discoteca tematica jazz/live sessions. Permite gestionar eventos, entradas QR, salas VIP, storage/guardarropa, pedidos de canciones, cola de escenario, guardias, administracion y el feed oficial Hoy en FLEX.

La app debe mantenerse simple, clara y robusta porque puede usarse en un ambiente de discoteca, con poca luz, ruido, prisa y usuarios no tecnicos.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase local
- Supabase Auth
- Supabase RLS
- Supabase Storage
- Supabase Realtime cuando aplique
- Stripe preparado
- Vercel como objetivo de deploy

## Reglas generales obligatorias

- Leer el codigo existente antes de modificar.
- No reescribir todo el proyecto sin necesidad.
- No borrar migraciones existentes.
- No hacer cambios destructivos sin avisar.
- No ejecutar `supabase db reset` sin avisar.
- Recordar que `supabase db reset` borra usuarios locales de `auth.users`, `profiles` y `staff_profiles`.
- No usar mocks si `NEXT_PUBLIC_ENABLE_MOCKS=false`.
- Si se usan mocks, deben depender explicitamente de `NEXT_PUBLIC_ENABLE_MOCKS=true`.
- Mantener el estilo visual FLEX: oscuro, dorado, jazz premium.
- No cambiar el diseno visual salvo que la tarea lo pida explicitamente.
- Todo cambio importante debe documentarse en `DOCUMENTACION_FLEX.md`.
- Despues de cambios de codigo ejecutar `npm run lint` y `npm run build`.

## Estado de documentacion

`DOCUMENTACION_FLEX.md` no se reemplaza con este archivo. Es la documentacion del proyecto y debe actualizarse con cada fase importante.

La documentacion debe indicar que se cambio, como probarlo y que queda pendiente.

## Roles del sistema

- `user`: usa la app normal.
- `guard`: valida QR, entradas, invitados y accesos.
- `storage`: gestiona guardarropa/storage.
- `dj`: gestiona canciones y cola de escenario.
- `admin`: gestiona todo el sistema.

El rol operativo se valida desde `staff_profiles`. No depender de `localStorage` como seguridad real.

## Rutas principales

Usuario:

- `/app`
- `/app/events`
- `/app/today`
- `/app/song-request`
- `/app/my-turn`
- `/app/tickets`
- `/app/vip`
- `/app/profile`
- `/app/notifications`

Admin:

- `/admin`
- `/admin/events`
- `/admin/vip`
- `/admin/feed`
- `/admin/songs`
- `/admin/queue`
- `/admin/staff`
- `/admin/tickets`
- `/admin/payments`

Guardias:

- `/guard`
- `/guard/scan`
- `/guard/tickets`
- `/guard/guests`
- `/guard/alerts`
- `/guard/reports`

Storage:

- `/storage`
- `/storage/new`
- `/storage/scan`
- `/storage/active`
- `/storage/history`

## Hoy en FLEX

Hoy en FLEX no es chat libre. Es un feed oficial de eventos, promociones, actividades y avisos.

Usa `daily_feed_posts`.

Rutas:

- `/app/today`
- `/admin/feed`

No implementar chat libre salvo que el usuario lo pida explicitamente.

## Entrega esperada al finalizar tareas

Codex debe responder siempre con:

1. Archivos creados/modificados.
2. Resumen de cambios.
3. Resultado de lint.
4. Resultado de build.
5. Como probar.
6. Que queda pendiente.
