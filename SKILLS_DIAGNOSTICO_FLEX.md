# SKILLS_DIAGNOSTICO_FLEX.md

## 1. Resumen ejecutivo

Se evaluaron las skills y herramientas relevantes para FLEX contra el estado actual del proyecto y las reglas de `AGENTS.md`, `frontend/AGENTS.md` y `supabase/AGENTS.md`.

Resultado principal:

- FLEX se beneficiaria mucho de skills especificas de proyecto para migraciones Supabase, modulos admin, flujos usuario, auditoria de seguridad, sincronizacion documental, checks Playwright y QR.
- En este entorno solo estan instaladas como skills locales relevantes `skill-installer`, `skill-creator` y `openai-docs`.
- No estan disponibles como skills instaladas: `create-plan`, `codebase-recon`, `Project Skill Audit`, `Playwright Interactive`, `React Component Performance`, `gh-fix-ci`, `gh-address-comments`, `GitHub skill` ni `Firecrawl`.
- Hay herramientas GitHub disponibles como conector, pero el repo local no tiene remote ni `.github/workflows`, asi que no conviene usarlas ahora.
- No se hizo scraping, no se navego fuera, no se ejecuto `supabase db reset`, no se cambiaron migraciones y no se modifico logica de negocio.

## 2. Skills disponibles

| Skill/categoria | Disponible | Requiere instalacion | Permisos externos | Segura ahora | Conviene para FLEX |
| --- | --- | --- | --- | --- | --- |
| `skill-installer` | Si | No | Si se lista/instala desde GitHub, requiere red | Si, solo evaluada | Si, para instalar skills futuras |
| `skill-creator` | Si | No | No para disenar; si se crean skills fuera del repo puede requerir permisos | Si | Si, muy util para crear skills FLEX |
| `openai-docs` | Si | No | Solo si consulta docs/MCP/web oficial | Si, no se uso red | Util mas adelante para IA en FLEX |

## 3. Skills no disponibles

| Skill/categoria | Disponible | Requiere instalacion | Permisos externos | Segura ahora | Conviene para FLEX |
| --- | --- | --- | --- | --- | --- |
| `create-plan` / plan skills | No como skill instalada | Si | No necesariamente | Si, si se instala | Si, para fases grandes |
| `codebase-recon` | No | Si | No necesariamente | Si, si se instala | Si, para auditorias sin cambios |
| `Project Skill Audit` | No | Si | No necesariamente | Si, si se instala | Si, para revisar skills existentes |
| `Playwright Interactive` | No | Si, mas dependencias si no existen | Puede requerir navegador/dev server | No se uso | Si, prioritario para flujos UI |
| `React Component Performance` | No | Si | No necesariamente | Si, si se instala | Si, despues de estabilizar flujos |
| `gh-fix-ci` | No | Si o conector GitHub configurado | Si, GitHub | No aplica ahora | Mas adelante |
| `gh-address-comments` | No | Si o conector GitHub configurado | Si, GitHub | No aplica ahora | Mas adelante |
| GitHub skill | No como skill local; hay conector GitHub disponible | No para conector, si para skill | Si, GitHub | No aplica ahora | Mas adelante |
| Firecrawl | No | Si | Si, red/API externa | No se uso | Opcional, no prioritario |

## 4. Skills recomendadas para instalar

Prioritarias:

- `codebase-recon`: para mapear rutas, componentes, acciones Supabase y deuda sin modificar archivos.
- `Playwright Interactive`: para validar flujos reales de usuario, admin, guardia y storage.
- `create-plan` o una skill de planificacion: para dividir fases grandes como middleware, QR real o Stripe.

Secundarias:

- `React Component Performance`: util cuando haya listas largas reales en admin/feed/tickets.
- `Project Skill Audit`: util cuando existan skills FLEX propias.
- `gh-fix-ci` y `gh-address-comments`: utiles cuando el repo tenga GitHub remoto, Actions y PRs activos.

## 5. Skills que no convienen ahora

- `gh-fix-ci`: no hay remote GitHub ni workflows locales.
- `gh-address-comments`: no hay PR local asociado ni comentarios que atender.
- Firecrawl: no hace falta para el estado actual; puede introducir ruido externo antes de cerrar seguridad, docs y flujos base.
- `openai-docs`: no es prioritario hasta que FLEX incorpore IA, moderacion, asistente admin o generacion de promociones.

## 6. Diagnostico del proyecto

### Estructura general

La app Next.js vive en la raiz:

- `app/`: rutas App Router.
- `components/`: componentes UI, admin, auth, feed, guard y layout.
- `lib/`: cliente Supabase, acciones de negocio, mocks y datos demo.
- `supabase/migrations/`: esquema, RLS, seeds y feed oficial.
- `supabase/snippets/`: helper local para promover admin.
- `docs/`: documentacion mas alineada con el estado actual.

### Modulos criticos

- Auth y roles: `components/auth/AuthForm.tsx`, `components/auth/RoleGate.tsx`, `lib/admin-actions.ts`.
- Acciones Supabase: `lib/flex-actions.ts`.
- Cliente Supabase: `lib/supabase.ts`.
- Admin: `app/admin/*`.
- Hoy en FLEX: `app/app/today/page.tsx`, `app/admin/feed/page.tsx`, `components/feed/*`.
- QR: `components/guard/QrValidationPanel.tsx`, RPC `validate_qr_token`.
- Storage: `app/storage/*`, `storage_items`.
- Migraciones y RLS: `supabase/migrations/*`.

### Rutas complejas

Usuario:

- `/app/today`: feed oficial con filtros, orden por fijado/prioridad/fecha y CTA.
- `/app/song-request`: inserta `song_requests` o mock explicito.
- `/app/my-turn`: calcula posicion e inserta en `live_session_queue`.
- `/app/tickets`: lista tickets reales o mock.
- `/app/vip`: lista `club_zones`.

Admin:

- `/admin/feed`: CRUD de `daily_feed_posts`, relaciones con `events` y `club_zones`.
- `/admin/events`: CRUD basico y validaciones.
- `/admin/vip`: edicion de capacidad/precio/estado en `club_zones`.
- `/admin/staff`: gestiona `staff_profiles` por `user_id`.
- `/admin/payments`: lectura de `orders` y `order_items`.

Guardia/storage:

- `/guard/scan`: valida QR por RPC/mock.
- `/storage/active`: lista y entrega prendas.

### Dependencias frontend-Supabase

- `events`: usuario y admin events.
- `club_zones`: VIP usuario/admin y contexto del feed.
- `daily_feed_posts`: Hoy en FLEX y admin feed.
- `tickets`: tickets usuario/admin y QR.
- `song_requests`: canciones.
- `live_session_queue`: cola de escenario.
- `storage_items`: guardarropa.
- `staff_profiles`: roles operativos/admin.
- `orders` y `order_items`: pagos.

## 7. Riesgos actuales del proyecto

- Falta `middleware.ts` server-side para proteger rutas antes de renderizar.
- Algunas pantallas siguen usando datos estaticos de `lib/demo-data.ts`.
- No hay suite de tests automatizados.
- No hay Playwright instalado/configurado para validar flujos UI.
- No hay GitHub remote ni CI visible.
- `DOCUMENTACION_FLEX.md` de raiz conserva partes antiguas; `docs/DOCUMENTACION_FLEX.md` esta mas alineado.
- Stripe no tiene checkout/webhooks reales en el proyecto actual.
- QR real valida, pero falta registrar `access_logs` en el flujo operativo.
- VIP sharing usa token/enlace demo; falta flujo real con `private_room_access`.
- Faltan tipos generados de Supabase para endurecer TypeScript.

## 8. Como cada skill ayudaria a FLEX

- `skill-installer`: permitiria instalar skills de testing, recon, GitHub o performance cuando el proyecto este listo.
- `skill-creator`: permitiria convertir reglas repetitivas de FLEX en skills propias reutilizables.
- `create-plan`: ayudaria a partir fases grandes en pasos verificables, por ejemplo middleware, Stripe o QR.
- `codebase-recon`: reduciria errores al mapear dependencias antes de tocar codigo.
- `Project Skill Audit`: serviria cuando existan skills FLEX propias para verificar que no se contradicen con `AGENTS.md`.
- `Playwright Interactive`: validaria rutas reales con navegador, estados visuales, formularios y redirecciones.
- `React Component Performance`: detectaria renders caros en tablas, feed y listas largas.
- `gh-fix-ci`: arreglaria CI cuando existan GitHub Actions.
- `gh-address-comments`: ayudaria a responder comentarios de PR.
- GitHub skill/conector: serviria para PRs, issues, reviews y checks cuando el repo tenga remoto.
- `openai-docs`: serviria si FLEX agrega IA para promociones, moderacion, asistente admin o recomendaciones.
- Firecrawl: serviria para investigacion externa controlada, no para cambios directos de negocio.

## 9. Skills personalizadas recomendadas

### `flex-supabase-migration`

Objetivo: crear y revisar migraciones Supabase seguras para FLEX.

Cuando usarla: al agregar tablas, columnas, enums, RLS, policies o seeds.

Instrucciones:

- Leer `supabase/AGENTS.md`.
- No ejecutar `supabase db reset` sin aprobacion.
- Crear migraciones incrementales.
- Separar `ALTER TYPE ADD VALUE` de inserts que usen nuevos valores.
- Usar `IF NOT EXISTS` y `WHERE NOT EXISTS` cuando aplique.
- Revisar RLS y documentar policies.

Archivos que tocaria:

- `supabase/migrations/*`
- `supabase/snippets/*`
- `DOCUMENTACION_FLEX.md`

Riesgos que reduce:

- Resets accidentales.
- Seeds inseguros.
- Errores de enum PostgreSQL.
- Tablas sensibles sin RLS.

### `flex-admin-module`

Objetivo: crear o ampliar modulos admin consistentes.

Cuando usarla: al trabajar en `/admin/events`, `/admin/vip`, `/admin/feed`, `/admin/songs`, `/admin/queue`, `/admin/staff`, `/admin/tickets` o `/admin/payments`.

Instrucciones:

- Usar `requireAdmin()` y `staff_profiles`.
- Incluir loading, error, empty y feedback de acciones.
- Reutilizar componentes admin existentes.
- No cambiar estilo visual.
- Documentar el modulo.

Archivos que tocaria:

- `app/admin/*`
- `components/admin/*`
- `lib/admin-actions.ts`
- `DOCUMENTACION_FLEX.md`

Riesgos que reduce:

- Admin placeholders.
- Rutas sin proteccion.
- CRUD inconsistente.
- Pantallas sin estados.

### `flex-user-flow`

Objetivo: implementar flujos de usuario simples y seguros.

Cuando usarla: eventos, tickets, VIP, canciones, cola, perfil, notificaciones y Hoy en FLEX.

Instrucciones:

- Validar sesion Supabase cuando haya datos privados.
- No usar mocks salvo `NEXT_PUBLIC_ENABLE_MOCKS=true`.
- Mantener UX simple para discoteca.
- Incluir estados de carga/error/vacio.

Archivos que tocaria:

- `app/app/*`
- `components/ui/*`
- `lib/flex-actions.ts`
- `DOCUMENTACION_FLEX.md`

Riesgos que reduce:

- Fallbacks silenciosos.
- Flujos rotos sin feedback.
- UX complicada en ambiente de discoteca.

### `flex-security-audit`

Objetivo: auditar auth, roles, RLS, rutas sensibles y datos privados.

Cuando usarla: antes de deploy, despues de cambios en roles, o antes de abrir admin/staff.

Instrucciones:

- Revisar `staff_profiles`, helpers SQL y RLS.
- Buscar `localStorage`, mocks, secrets y rutas sin middleware.
- No modificar migraciones antiguas salvo necesidad explicita.
- Entregar hallazgos por severidad.

Archivos que tocaria:

- Normalmente ninguno.
- Si se corrige: `middleware.ts`, `components/auth/*`, `lib/*`, `supabase/migrations/*`, `DOCUMENTACION_FLEX.md`.

Riesgos que reduce:

- Proteccion solo visual/client-side.
- Exposicion de datos por RLS incompleta.
- Mocks activos por error.

### `flex-doc-sync`

Objetivo: mantener documentacion alineada con codigo real.

Cuando usarla: tras cada fase importante o auditoria.

Instrucciones:

- Comparar `DOCUMENTACION_FLEX.md`, `docs/DOCUMENTACION_FLEX.md`, `AGENTS.md` y estructura real.
- No reescribir todo si basta una seccion.
- Documentar que cambio, como probar y pendientes.

Archivos que tocaria:

- `DOCUMENTACION_FLEX.md`
- `docs/DOCUMENTACION_FLEX.md`
- `AGENTS.md` solo si cambian reglas operativas.

Riesgos que reduce:

- Documentacion antigua.
- Instrucciones contradictorias.
- Perdida de contexto entre fases.

### `flex-playwright-check`

Objetivo: ejecutar checks UI seguros sin resetear datos.

Cuando usarla: antes de cerrar una fase frontend o admin.

Instrucciones:

- No ejecutar `supabase db reset`.
- Usar datos existentes o mocks explicitos.
- Validar login/register, rutas usuario, admin, guardia y storage.
- Capturar errores de consola y screenshots en fallos.

Archivos que tocaria:

- `tests/e2e/*`
- `playwright.config.ts`
- Documentacion de pruebas.

Riesgos que reduce:

- Regresiones visuales.
- Formularios rotos.
- Rutas inaccesibles.
- Estados loading/error/empty ausentes.

### `flex-qr-flow`

Objetivo: endurecer flujos QR de tickets, VIP y storage.

Cuando usarla: al modificar `validate_qr_token`, guardias, storage o tickets.

Instrucciones:

- Revisar tickets, `private_room_access`, `storage_items` y `access_logs`.
- No invalidar datos sin pruebas.
- Validar estados `valid`, `used`, `expired`, `invalid`, `full`, `inactive`.
- Documentar impacto operativo.

Archivos que tocaria:

- `components/guard/QrValidationPanel.tsx`
- `lib/flex-actions.ts`
- `supabase/migrations/*`
- `app/guard/*`
- `app/storage/*`

Riesgos que reduce:

- QR validos sin trazabilidad.
- Accesos duplicados.
- Storage entregado dos veces.
- VIP sin control de aforo.

## 10. Orden recomendado de adopcion

1. Crear `flex-doc-sync` para resolver la desalineacion documental.
2. Crear `flex-security-audit` para middleware, roles y mocks.
3. Instalar o crear `codebase-recon`.
4. Crear `flex-supabase-migration`.
5. Instalar/configurar Playwright y crear `flex-playwright-check`.
6. Crear `flex-admin-module`.
7. Crear `flex-user-flow`.
8. Crear `flex-qr-flow`.
9. Evaluar `React Component Performance` cuando haya volumen real de datos.
10. Activar GitHub/CI skills cuando exista remoto, Actions y PRs.

## 11. Proximos pasos

- Consolidar `DOCUMENTACION_FLEX.md` raiz con el contenido actualizado de `docs/DOCUMENTACION_FLEX.md`.
- Crear `middleware.ts` con Supabase SSR para rutas privadas y staff.
- Instalar/configurar Playwright para smoke tests.
- Crear las primeras skills propias: `flex-doc-sync`, `flex-security-audit` y `flex-supabase-migration`.
- Agregar GitHub remote y CI cuando el proyecto este listo para PRs.
