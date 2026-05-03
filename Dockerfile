FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ReciclaYa.sln ./
COPY ReciclaYa.Domain/ReciclaYa.Domain.csproj ReciclaYa.Domain/
COPY ReciclaYa.Application/ReciclaYa.Application.csproj ReciclaYa.Application/
COPY ReciclaYa.Infrastructure/ReciclaYa.Infrastructure.csproj ReciclaYa.Infrastructure/
COPY ReciclaYa.Api/ReciclaYa.Api.csproj ReciclaYa.Api/

RUN dotnet restore ReciclaYa.Api/ReciclaYa.Api.csproj

COPY . .
RUN dotnet publish ReciclaYa.Api/ReciclaYa.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "ReciclaYa.Api.dll"]
