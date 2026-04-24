# ReciclaYa

Convertir los residuos y mermas de la agroindustria en oportunidades de negocio concretas, conectando empresas que generan residuos con empresas que pueden reutilizarlos.

## Backend .NET

### Estructura

- `ReciclaYa.Api`: Web API, controllers, Swagger y CORS.
- `ReciclaYa.Application`: servicios y casos de uso.
- `ReciclaYa.Domain`: entidades y enums.
- `ReciclaYa.Infrastructure`: EF Core, PostgreSQL y servicios externos.

### Ejecutar la API

```powershell
dotnet restore ReciclaYa.sln
dotnet run --project ReciclaYa.Api
```

Swagger queda disponible en:

```text
http://localhost:5021/swagger
```

### Migraciones EF Core

Instala la herramienta si no la tienes:

```powershell
dotnet tool install --global dotnet-ef
```

Crea una migracion:

```powershell
dotnet ef migrations add InitialCreate --project ReciclaYa.Infrastructure --startup-project ReciclaYa.Api --output-dir Persistence/Migrations
```

Aplica la migracion:

```powershell
dotnet ef database update --project ReciclaYa.Infrastructure --startup-project ReciclaYa.Api
```
