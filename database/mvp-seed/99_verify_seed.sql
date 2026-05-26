-- MVP Seed - Verificacion post-carga

-- 1) Version activa catalogo
SELECT
  "VersionNumber",
  "IsActive",
  "Notes",
  "UpdatedAt"
FROM regulation_catalog_versions
WHERE "IsActive" = TRUE
ORDER BY "VersionNumber" DESC;

-- 2) Conteos de catalogo
SELECT 'regulation_level_catalogs' AS table_name, COUNT(*) AS total FROM regulation_level_catalogs
UNION ALL
SELECT 'regulation_level_requirements_catalog', COUNT(*) FROM regulation_level_requirements_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001'
UNION ALL
SELECT 'regulation_allowed_residues_catalog', COUNT(*) FROM regulation_allowed_residues_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001'
UNION ALL
SELECT 'regulation_level_rules_catalog', COUNT(*) FROM regulation_level_rules_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001'
UNION ALL
SELECT 'regulation_normative_references_catalog', COUNT(*) FROM regulation_normative_references_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001';

-- 3) Usuarios demo y nivel regulatorio
SELECT
  u."Email",
  u."Role",
  p."CurrentLevel",
  c."Ruc",
  c."BusinessName"
FROM users u
LEFT JOIN user_regulation_profiles p ON p."UserId" = u."Id"
LEFT JOIN companies c ON c."UserId" = u."Id"
WHERE u."Email" IN ('admin@reciclaya.pe','seller@reciclaya.pe','buyer@reciclaya.pe')
ORDER BY u."Email";

-- 4) Requisitos nivel 1 de usuarios demo
SELECT
  u."Email",
  r."Level",
  r."RequirementCode",
  r."Status",
  r."ReviewedAt",
  r."ExpiresAt"
FROM user_regulation_requirements r
JOIN users u ON u."Id" = r."UserId"
WHERE u."Email" IN ('seller@reciclaya.pe','buyer@reciclaya.pe')
ORDER BY u."Email", r."Level", r."RequirementCode";

-- 5) Publicaciones demo y distribucion por nivel inferido
SELECT
  l."ReferenceCode",
  l."SpecificResidue",
  l."WasteType",
  l."Sector",
  l."Status",
  l."Currency",
  l."PricePerUnitUsd",
  l."PublishedAt"
FROM listings l
WHERE l."ReferenceCode" LIKE 'RCY-MVP-%'
ORDER BY l."ReferenceCode";

SELECT
  CASE
    WHEN l."ReferenceCode" LIKE 'RCY-MVP-L1-%' THEN 'level1'
    WHEN l."ReferenceCode" LIKE 'RCY-MVP-L2-%' THEN 'level2'
    WHEN l."ReferenceCode" LIKE 'RCY-MVP-L3-%' THEN 'level3'
    WHEN l."ReferenceCode" LIKE 'RCY-MVP-L4-%' THEN 'level4'
    ELSE 'unknown'
  END AS inferred_level,
  COUNT(*) AS total
FROM listings l
WHERE l."ReferenceCode" LIKE 'RCY-MVP-%'
GROUP BY 1
ORDER BY 1;

-- 6) Checklist esperado (manual):
-- - 1 version activa (1001)
-- - 4 levels en regulation_level_catalogs
-- - >= 10 requirements catalog
-- - >= 16 allowed residues
-- - >= 19 rules catalog
-- - >= 6 normativas
-- - seller@reciclaya.pe en Level1
-- - buyer@reciclaya.pe en Level1
-- - 8 listings RCY-MVP-*
