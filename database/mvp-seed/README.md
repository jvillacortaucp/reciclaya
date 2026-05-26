# MVP Seed (desarrollo)

Scripts SQL idempotentes para poblar datos de demo MVP:

1. Catalogo regulatorio (niveles, requisitos, residuos permitidos, normativas)
2. Usuarios/empresas demo y niveles regulatorios
3. Publicaciones demo del marketplace
4. Script de verificacion post-carga

## Orden de ejecucion

```sql
\i database/mvp-seed/01_catalog_regulation.sql
\i database/mvp-seed/02_demo_users_companies.sql
\i database/mvp-seed/03_demo_listings.sql
\i database/mvp-seed/99_verify_seed.sql
```

## Ejecucion con psql (ejemplo)

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" `
  "host=aws-1-us-east-1.pooler.supabase.com port=5432 dbname=postgres user=postgres.<tu-proyecto> sslmode=require" `
  -f "C:\Users\NAYCOLL\source\repos\reciclaya\database\mvp-seed\01_catalog_regulation.sql"
```

Repite con los archivos `02`, `03` y `99`.

## Cuentas demo creadas/actualizadas

- `admin@reciclaya.pe`
- `seller@reciclaya.pe`
- `buyer@reciclaya.pe`

> Nota: los scripts usan hash bcrypt de demo y no deben usarse en produccion real.

## Notas de idempotencia

- Catalogo: se reemplaza el contenido de la version `1001`.
- Usuarios: `ON CONFLICT (Email)`.
- Empresas: `ON CONFLICT (Ruc)`.
- Listings: `ON CONFLICT (ReferenceCode)`.
- Media/specs: `ON CONFLICT (Id)`.
