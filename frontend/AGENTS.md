# AGENTS.md  Frontend FLEX

## Stack frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase client

## Diseno visual

- Fondo oscuro.
- Detalles dorados.
- Estetica jazz premium.
- Cards claras y legibles.
- Botones grandes.
- Interfaz simple.
- UX pensada para usuarios en discoteca.

## Estados obligatorios

Toda pantalla conectada a Supabase debe tener:

- loading state
- error state
- empty state
- success/error feedback cuando haya acciones

## Mocks

- No usar mocks si `NEXT_PUBLIC_ENABLE_MOCKS=false`.
- Si `NEXT_PUBLIC_ENABLE_MOCKS=true`, los mocks pueden usarse como fallback explicito.
- No ocultar errores reales de Supabase cayendo silenciosamente a mock.

## Seguridad frontend

- No usar `localStorage` como seguridad real.
- Las rutas sensibles deben validar rol real con Supabase/`staff_profiles`.
- Si falta middleware real, documentarlo como pendiente.

## Rutas clave

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

Guardia:

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

## Componentes

- Reutilizar componentes existentes.
- Crear componentes pequenos y enfocados.
- Mantener TypeScript estricto.
- Evitar duplicar logica.
- Mantener diseno responsive.

## Validacion

Despues de cambios frontend:

- `npm run lint`
- `npm run build`
