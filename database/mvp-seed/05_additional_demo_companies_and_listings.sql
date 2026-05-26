-- MVP Seed - 4 empresas verificadas adicionales + 3 productos publicados cada una
-- Idempotente por Email/RUC/ReferenceCode

BEGIN;

-- 1) Usuarios demo adicionales (todos sellers)
INSERT INTO users ("Id","Email","PasswordHash","FullName","AvatarUrl","Role","ProfileType","Status","CreatedAt","UpdatedAt")
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0101','biociclo@reciclaya.pe','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','BioCiclo SAC',NULL,'Seller','Company','Active',NOW(),NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0102','amazonia.organica@reciclaya.pe','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Amazonia Organica SAC',NULL,'Seller','Company','Active',NOW(),NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0103','tecnoreclaim@reciclaya.pe','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','TecnoReclaim SAC',NULL,'Seller','Company','Active',NOW(),NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0104','quimicontrol@reciclaya.pe','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Quimicontrol Peru SAC',NULL,'Seller','Company','Active',NOW(),NOW())
ON CONFLICT ("Email")
DO UPDATE SET
  "FullName" = EXCLUDED."FullName",
  "Role" = EXCLUDED."Role",
  "ProfileType" = EXCLUDED."ProfileType",
  "Status" = EXCLUDED."Status",
  "UpdatedAt" = NOW();

-- 2) Empresas verificadas
INSERT INTO companies ("Id","UserId","Ruc","BusinessName","LogoUrl","MobilePhone","Address","PostalCode","LegalRepresentative","Position","VerificationStatus","CreatedAt","UpdatedAt")
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', u."Id", '20444444441', 'BioCiclo SAC', NULL, '+51 900 010 101', 'Lima', '15001', 'Lucia Perez', 'Gerente', 'Verified', NOW(), NOW()
FROM users u WHERE u."Email"='biociclo@reciclaya.pe'
ON CONFLICT ("Ruc")
DO UPDATE SET
  "UserId"=EXCLUDED."UserId","BusinessName"=EXCLUDED."BusinessName","VerificationStatus"=EXCLUDED."VerificationStatus","UpdatedAt"=NOW();

INSERT INTO companies ("Id","UserId","Ruc","BusinessName","LogoUrl","MobilePhone","Address","PostalCode","LegalRepresentative","Position","VerificationStatus","CreatedAt","UpdatedAt")
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', u."Id", '20444444442', 'Amazonia Organica SAC', NULL, '+51 900 010 102', 'Iquitos', '16001', 'Marco Ruiz', 'Director Operaciones', 'Verified', NOW(), NOW()
FROM users u WHERE u."Email"='amazonia.organica@reciclaya.pe'
ON CONFLICT ("Ruc")
DO UPDATE SET
  "UserId"=EXCLUDED."UserId","BusinessName"=EXCLUDED."BusinessName","VerificationStatus"=EXCLUDED."VerificationStatus","UpdatedAt"=NOW();

INSERT INTO companies ("Id","UserId","Ruc","BusinessName","LogoUrl","MobilePhone","Address","PostalCode","LegalRepresentative","Position","VerificationStatus","CreatedAt","UpdatedAt")
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0103', u."Id", '20444444443', 'TecnoReclaim SAC', NULL, '+51 900 010 103', 'Lima', '15024', 'Javier Poma', 'Jefe Tecnico', 'Verified', NOW(), NOW()
FROM users u WHERE u."Email"='tecnoreclaim@reciclaya.pe'
ON CONFLICT ("Ruc")
DO UPDATE SET
  "UserId"=EXCLUDED."UserId","BusinessName"=EXCLUDED."BusinessName","VerificationStatus"=EXCLUDED."VerificationStatus","UpdatedAt"=NOW();

INSERT INTO companies ("Id","UserId","Ruc","BusinessName","LogoUrl","MobilePhone","Address","PostalCode","LegalRepresentative","Position","VerificationStatus","CreatedAt","UpdatedAt")
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0104', u."Id", '20444444444', 'Quimicontrol Peru SAC', NULL, '+51 900 010 104', 'Callao', '07001', 'Ana Mena', 'Coordinadora HSE', 'Verified', NOW(), NOW()
FROM users u WHERE u."Email"='quimicontrol@reciclaya.pe'
ON CONFLICT ("Ruc")
DO UPDATE SET
  "UserId"=EXCLUDED."UserId","BusinessName"=EXCLUDED."BusinessName","VerificationStatus"=EXCLUDED."VerificationStatus","UpdatedAt"=NOW();

-- 3) Niveles regulatorios aleatorios (1,2,3,4)
INSERT INTO user_regulation_profiles ("Id","UserId","CurrentLevel","CreatedAt","UpdatedAt")
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0101', u."Id", 'Level1', NOW(), NOW() FROM users u WHERE u."Email"='biociclo@reciclaya.pe'
ON CONFLICT ("UserId") DO UPDATE SET "CurrentLevel"=EXCLUDED."CurrentLevel","UpdatedAt"=NOW();

INSERT INTO user_regulation_profiles ("Id","UserId","CurrentLevel","CreatedAt","UpdatedAt")
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0102', u."Id", 'Level2', NOW(), NOW() FROM users u WHERE u."Email"='amazonia.organica@reciclaya.pe'
ON CONFLICT ("UserId") DO UPDATE SET "CurrentLevel"=EXCLUDED."CurrentLevel","UpdatedAt"=NOW();

INSERT INTO user_regulation_profiles ("Id","UserId","CurrentLevel","CreatedAt","UpdatedAt")
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0103', u."Id", 'Level3', NOW(), NOW() FROM users u WHERE u."Email"='tecnoreclaim@reciclaya.pe'
ON CONFLICT ("UserId") DO UPDATE SET "CurrentLevel"=EXCLUDED."CurrentLevel","UpdatedAt"=NOW();

INSERT INTO user_regulation_profiles ("Id","UserId","CurrentLevel","CreatedAt","UpdatedAt")
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0104', u."Id", 'Level4', NOW(), NOW() FROM users u WHERE u."Email"='quimicontrol@reciclaya.pe'
ON CONFLICT ("UserId") DO UPDATE SET "CurrentLevel"=EXCLUDED."CurrentLevel","UpdatedAt"=NOW();

-- 4) Requisitos aprobados por nivel para cada empresa (solo seller)
WITH admin_user AS (
  SELECT "Id" AS admin_id FROM users WHERE "Email"='admin@reciclaya.pe' LIMIT 1
),
all_targets AS (
  SELECT u."Id" AS user_id, p."CurrentLevel"
  FROM users u
  JOIN user_regulation_profiles p ON p."UserId"=u."Id"
  WHERE u."Email" IN ('biociclo@reciclaya.pe','amazonia.organica@reciclaya.pe','tecnoreclaim@reciclaya.pe','quimicontrol@reciclaya.pe')
)
INSERT INTO user_regulation_requirements
("Id","UserId","Level","RequirementCode","Status","EvidenceUrl","Notes","ReviewedByUserId","ReviewedAt","ExpiresAt","CreatedAt","UpdatedAt")
SELECT
  gen_random_uuid(),
  t.user_id,
  req.level_id,
  req.requirement_code,
  'approved',
  'https://example.local/evidence/' || req.requirement_code || '.pdf',
  'Aprobado automatico para demo MVP',
  a.admin_id,
  NOW(),
  NOW() + INTERVAL '365 days',
  NOW(),
  NOW()
FROM all_targets t
CROSS JOIN admin_user a
JOIN (
  VALUES
    (1,'l1-seller-dni-ruc'),
    (1,'l1-seller-address'),
    (2,'l2-seller-ruc-volume'),
    (2,'l2-seller-license'),
    (2,'l2-seller-classification'),
    (3,'l3-seller-classification'),
    (4,'l4-seller-manifest')
) AS req(level_id, requirement_code)
ON req.level_id <= CAST(REPLACE(t."CurrentLevel",'Level','') AS INT)
ON CONFLICT ("UserId","Level","RequirementCode")
DO UPDATE SET
  "Status"='approved',
  "EvidenceUrl"=EXCLUDED."EvidenceUrl",
  "Notes"=EXCLUDED."Notes",
  "ReviewedByUserId"=EXCLUDED."ReviewedByUserId",
  "ReviewedAt"=EXCLUDED."ReviewedAt",
  "ExpiresAt"=EXCLUDED."ExpiresAt",
  "UpdatedAt"=NOW();

-- 5) 3 listings por empresa (12 total)
WITH sellers AS (
  SELECT "Id","Email" FROM users
  WHERE "Email" IN ('biociclo@reciclaya.pe','amazonia.organica@reciclaya.pe','tecnoreclaim@reciclaya.pe','quimicontrol@reciclaya.pe')
),
seed AS (
  SELECT * FROM (VALUES
  ('RCY-MVPX-BC-001','biociclo@reciclaya.pe','paper','manufacturing','Carton','Carton corrugado','Carton limpio post consumo',8.0,'tons','single',410.0,'PEN','Lima','72h','sale','warehouse_pickup','dry','Published'),
  ('RCY-MVPX-BC-002','biociclo@reciclaya.pe','plastic','retail','HDPE','Bandejas plasticas','Bandejas plasticas limpias',5.0,'tons','weekly',590.0,'PEN','Lima','48h','sale','seller_delivery','processed','Published'),
  ('RCY-MVPX-BC-003','biociclo@reciclaya.pe','metal','transport','Aluminio','Latas de aluminio','Latas compactadas',3.5,'tons','monthly',760.0,'PEN','Callao','96h','sale','warehouse_pickup','dry','Published'),

  ('RCY-MVPX-AO-001','amazonia.organica@reciclaya.pe','organic','agriculture','Organico','Cascara de mango','Residuo organico para compost',14.0,'tons','weekly',250.0,'PEN','Iquitos','24h','sale','seller_delivery','fresh','Published'),
  ('RCY-MVPX-AO-002','amazonia.organica@reciclaya.pe','agroindustrial','agriculture','Agroindustrial','Bagazo de cana','Bagazo seco para energia',18.0,'tons','monthly',305.0,'PEN','Iquitos','120h','sale','warehouse_pickup','dry','Published'),
  ('RCY-MVPX-AO-003','amazonia.organica@reciclaya.pe','organic','agriculture','Organico','Restos de comida','Restos separados y clasificados',9.0,'tons','weekly',200.0,'PEN','Iquitos','24h','sale','seller_delivery','fresh','Published'),

  ('RCY-MVPX-TR-001','tecnoreclaim@reciclaya.pe','electronic','manufacturing','RAEE','Laptop en desuso','RAEE para desmontaje',2.2,'tons','monthly',1500.0,'PEN','Lima','240h','sale','warehouse_pickup','processed','Published'),
  ('RCY-MVPX-TR-002','tecnoreclaim@reciclaya.pe','electronic','manufacturing','Electronico','Placas electronicas','Placas separadas por tipo',1.7,'tons','monthly',1650.0,'PEN','Lima','240h','sale','warehouse_pickup','processed','Published'),
  ('RCY-MVPX-TR-003','tecnoreclaim@reciclaya.pe','electronic','manufacturing','RAEE','Celular en desuso','Lote de celulares fuera de servicio',1.1,'tons','monthly',1720.0,'PEN','Lima','240h','sale','seller_delivery','processed','Published'),

  ('RCY-MVPX-QP-001','quimicontrol@reciclaya.pe','hazardous','industrial','Hidrocarburo','Aceite usado','Aceite usado industrial controlado',4.0,'tons','weekly',990.0,'PEN','Callao','24h','sale','seller_delivery','wet','Published'),
  ('RCY-MVPX-QP-002','quimicontrol@reciclaya.pe','hazardous','industrial','Quimico','Solventes usados','Solventes para gestion especializada',2.8,'tons','weekly',1300.0,'PEN','Callao','24h','sale','warehouse_pickup','wet','Published'),
  ('RCY-MVPX-QP-003','quimicontrol@reciclaya.pe','hazardous','industrial','Biocontaminado','Residuos hospitalarios','Residuo critico para operador autorizado',1.3,'tons','weekly',2200.0,'PEN','Callao','12h','sale','seller_delivery','wet','Published')
  ) AS t(reference_code,email,waste_type,sector,product_type,specific_residue,description,quantity,unit,generation_frequency,price,currency,location,max_storage,exchange_type,delivery_mode,cond,status)
)
INSERT INTO listings
("Id","SellerId","ReferenceCode","WasteType","Sector","ProductType","SpecificResidue","Description","Quantity","Unit","GenerationFrequency","PricePerUnitUsd","Currency","Location","MaxStorageTime","ExchangeType","DeliveryMode","ImmediateAvailability","Condition","Restrictions","NextAvailabilityDate","Status","MatchScore","AiSuggestionNote","DraftSavedAt","PublishedAt","CreatedAt","UpdatedAt","DeletedAt")
SELECT
  gen_random_uuid(),
  s."Id",
  sd.reference_code,
  sd.waste_type,
  sd.sector,
  sd.product_type,
  sd.specific_residue,
  sd.description,
  sd.quantity::numeric,
  sd.unit,
  sd.generation_frequency,
  sd.price::numeric,
  sd.currency,
  sd.location,
  sd.max_storage,
  sd.exchange_type,
  sd.delivery_mode,
  TRUE,
  sd.cond,
  NULL,
  NULL,
  sd.status,
  NULL,
  'Demo empresa adicional',
  NULL,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW(),
  NULL
FROM seed sd
JOIN sellers s ON s."Email" = sd.email
ON CONFLICT ("ReferenceCode")
DO UPDATE SET
  "SellerId" = EXCLUDED."SellerId",
  "WasteType" = EXCLUDED."WasteType",
  "Sector" = EXCLUDED."Sector",
  "ProductType" = EXCLUDED."ProductType",
  "SpecificResidue" = EXCLUDED."SpecificResidue",
  "Description" = EXCLUDED."Description",
  "Quantity" = EXCLUDED."Quantity",
  "Unit" = EXCLUDED."Unit",
  "GenerationFrequency" = EXCLUDED."GenerationFrequency",
  "PricePerUnitUsd" = EXCLUDED."PricePerUnitUsd",
  "Currency" = EXCLUDED."Currency",
  "Location" = EXCLUDED."Location",
  "MaxStorageTime" = EXCLUDED."MaxStorageTime",
  "ExchangeType" = EXCLUDED."ExchangeType",
  "DeliveryMode" = EXCLUDED."DeliveryMode",
  "ImmediateAvailability" = EXCLUDED."ImmediateAvailability",
  "Condition" = EXCLUDED."Condition",
  "Status" = EXCLUDED."Status",
  "AiSuggestionNote" = EXCLUDED."AiSuggestionNote",
  "PublishedAt" = EXCLUDED."PublishedAt",
  "UpdatedAt" = NOW();

COMMIT;
