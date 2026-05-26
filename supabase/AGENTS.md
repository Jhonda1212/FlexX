# AGENTS.md  Supabase FLEX

## Reglas criticas

- No ejecutar `supabase db reset` sin avisar.
- `supabase db reset` borra usuarios locales.
- No guardar contrasenas reales en migrations o seeds.
- No guardar claves secretas.
- No hacer cambios destructivos sin avisar.
- Preferir migraciones incrementales.

## Migraciones

- Crear nueva migracion para cambios nuevos.
- No modificar migraciones antiguas salvo que sea estrictamente necesario.
- Usar `IF NOT EXISTS` cuando aplique.
- Evitar duplicados con `WHERE NOT EXISTS`.
- Mantener seeds seguros.

## Enums PostgreSQL

Si se agregan nuevos valores a un enum, no usar esos valores en inserts dentro de la misma migracion.

Crear dos migraciones:

1. Una para `ALTER TYPE ADD VALUE`.
2. Otra posterior para usar esos valores.

Esto evita el error:

```text
unsafe use of new value of enum type
```

## RLS

- Toda tabla sensible debe tener RLS.
- Toda tabla con datos de usuarios debe tener policies.
- Las policies deben documentarse.
- Staff/admin se valida con helpers existentes como `current_staff_role()` si aplica.

## Tablas principales

- `profiles`
- `staff_profiles`
- `events`
- `club_zones`
- `orders`
- `order_items`
- `tickets`
- `private_room_access`
- `private_room_guests`
- `song_requests`
- `live_session_queue`
- `storage_items`
- `access_logs`
- `notifications`
- `daily_feed_posts`

## Usuarios locales

Despues de `supabase db reset`, hay que crear usuario desde `/register`. Luego hay que promoverlo con `supabase/snippets/promote_existing_user_to_admin.sql`.

No crear usuarios con contrasena en seeds.

## Verificacion

Si se cambian migraciones:

- avisar si se requiere `supabase db reset`;
- no ejecutarlo sin aprobacion;
- luego verificar tablas y seeds en Supabase Studio.
