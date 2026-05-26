-- MVP Seed - Usuarios, empresas y perfiles regulatorios demo (idempotente)
-- Password hash demo (bcrypt): "password"

BEGIN;

-- 1) Usuarios demo
INSERT INTO users ("Id","Email","PasswordHash","FullName","AvatarUrl","Role","ProfileType","Status","CreatedAt","UpdatedAt")
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001','admin@reciclaya.pe','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','ReciclaYa Admin',NULL,'Admin','Company','Active',NOW(),NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002','seller@reciclaya.pe','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Agroloop SAC',NULL,'Seller','Company','Active',NOW(),NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003','buyer@reciclaya.pe','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','EcoCompras SAC',NULL,'Buyer','Company','Active',NOW(),NOW())
ON CONFLICT ("Email")
DO UPDATE SET
  "FullName" = EXCLUDED."FullName",
  "Role" = EXCLUDED."Role",
  "ProfileType" = EXCLUDED."ProfileType",
  "Status" = EXCLUDED."Status",
  "UpdatedAt" = NOW();

-- 2) Empresas demo
INSERT INTO companies ("Id","UserId","Ruc","BusinessName","LogoUrl","MobilePhone","Address","PostalCode","LegalRepresentative","Position","VerificationStatus","CreatedAt","UpdatedAt")
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  u."Id",
  '20111111111',
  'ReciclaYa Admin SAC',
  NULL,
  '+51 900 000 001',
  'Lima, Peru',
  '15001',
  'Admin ReciclaYa',
  'Administrador',
  'Verified',
  NOW(),
  NOW()
FROM users u
WHERE u."Email" = 'admin@reciclaya.pe'
ON CONFLICT ("Ruc")
DO UPDATE SET
  "UserId" = EXCLUDED."UserId",
  "BusinessName" = EXCLUDED."BusinessName",
  "MobilePhone" = EXCLUDED."MobilePhone",
  "Address" = EXCLUDED."Address",
  "PostalCode" = EXCLUDED."PostalCode",
  "LegalRepresentative" = EXCLUDED."LegalRepresentative",
  "Position" = EXCLUDED."Position",
  "VerificationStatus" = EXCLUDED."VerificationStatus",
  "UpdatedAt" = NOW();

INSERT INTO companies ("Id","UserId","Ruc","BusinessName","LogoUrl","MobilePhone","Address","PostalCode","LegalRepresentative","Position","VerificationStatus","CreatedAt","UpdatedAt")
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  u."Id",
  '20222222222',
  'Agroloop SAC',
  NULL,
  '+51 900 000 002',
  'Av. Industrial 123, Lima',
  '15001',
  'Diego Salazar',
  'Gerente General',
  'Verified',
  NOW(),
  NOW()
FROM users u
WHERE u."Email" = 'seller@reciclaya.pe'
ON CONFLICT ("Ruc")
DO UPDATE SET
  "UserId" = EXCLUDED."UserId",
  "BusinessName" = EXCLUDED."BusinessName",
  "MobilePhone" = EXCLUDED."MobilePhone",
  "Address" = EXCLUDED."Address",
  "PostalCode" = EXCLUDED."PostalCode",
  "LegalRepresentative" = EXCLUDED."LegalRepresentative",
  "Position" = EXCLUDED."Position",
  "VerificationStatus" = EXCLUDED."VerificationStatus",
  "UpdatedAt" = NOW();

INSERT INTO companies ("Id","UserId","Ruc","BusinessName","LogoUrl","MobilePhone","Address","PostalCode","LegalRepresentative","Position","VerificationStatus","CreatedAt","UpdatedAt")
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
  u."Id",
  '20333333333',
  'EcoCompras SAC',
  NULL,
  '+51 900 000 003',
  'Av. Comercio 456, Lima',
  '15001',
  'Camila Rojas',
  'Jefa de Compras',
  'Verified',
  NOW(),
  NOW()
FROM users u
WHERE u."Email" = 'buyer@reciclaya.pe'
ON CONFLICT ("Ruc")
DO UPDATE SET
  "UserId" = EXCLUDED."UserId",
  "BusinessName" = EXCLUDED."BusinessName",
  "MobilePhone" = EXCLUDED."MobilePhone",
  "Address" = EXCLUDED."Address",
  "PostalCode" = EXCLUDED."PostalCode",
  "LegalRepresentative" = EXCLUDED."LegalRepresentative",
  "Position" = EXCLUDED."Position",
  "VerificationStatus" = EXCLUDED."VerificationStatus",
  "UpdatedAt" = NOW();

-- 3) Perfil regulatorio por usuario (seller en nivel 1, buyer en nivel 1, admin en nivel 4)
INSERT INTO user_regulation_profiles ("Id","UserId","CurrentLevel","CreatedAt","UpdatedAt")
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0001', u."Id", 'Level4', NOW(), NOW()
FROM users u WHERE u."Email" = 'admin@reciclaya.pe'
ON CONFLICT ("UserId")
DO UPDATE SET "CurrentLevel" = EXCLUDED."CurrentLevel", "UpdatedAt" = NOW();

INSERT INTO user_regulation_profiles ("Id","UserId","CurrentLevel","CreatedAt","UpdatedAt")
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0002', u."Id", 'Level1', NOW(), NOW()
FROM users u WHERE u."Email" = 'seller@reciclaya.pe'
ON CONFLICT ("UserId")
DO UPDATE SET "CurrentLevel" = EXCLUDED."CurrentLevel", "UpdatedAt" = NOW();

INSERT INTO user_regulation_profiles ("Id","UserId","CurrentLevel","CreatedAt","UpdatedAt")
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0003', u."Id", 'Level1', NOW(), NOW()
FROM users u WHERE u."Email" = 'buyer@reciclaya.pe'
ON CONFLICT ("UserId")
DO UPDATE SET "CurrentLevel" = EXCLUDED."CurrentLevel", "UpdatedAt" = NOW();

-- 4) Requisitos aprobados de nivel 1 (seller/buyer demo)
WITH admin_user AS (
  SELECT "Id" AS admin_id FROM users WHERE "Email" = 'admin@reciclaya.pe' LIMIT 1
),
seller_user AS (
  SELECT "Id" AS seller_id FROM users WHERE "Email" = 'seller@reciclaya.pe' LIMIT 1
),
buyer_user AS (
  SELECT "Id" AS buyer_id FROM users WHERE "Email" = 'buyer@reciclaya.pe' LIMIT 1
)
INSERT INTO user_regulation_requirements
("Id","UserId","Level","RequirementCode","Status","EvidenceUrl","Notes","ReviewedByUserId","ReviewedAt","ExpiresAt","CreatedAt","UpdatedAt")
SELECT
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  s.seller_id,
  1,
  'l1-seller-dni-ruc',
  'approved',
  'https://example.local/evidence/l1-seller-dni-ruc.pdf',
  'Aprobado para demo MVP',
  a.admin_id,
  NOW(),
  NOW() + INTERVAL '365 days',
  NOW(),
  NOW()
FROM seller_user s CROSS JOIN admin_user a
ON CONFLICT ("UserId","Level","RequirementCode")
DO UPDATE SET
  "Status" = EXCLUDED."Status",
  "EvidenceUrl" = EXCLUDED."EvidenceUrl",
  "Notes" = EXCLUDED."Notes",
  "ReviewedByUserId" = EXCLUDED."ReviewedByUserId",
  "ReviewedAt" = EXCLUDED."ReviewedAt",
  "ExpiresAt" = EXCLUDED."ExpiresAt",
  "UpdatedAt" = NOW();

WITH admin_user AS (
  SELECT "Id" AS admin_id FROM users WHERE "Email" = 'admin@reciclaya.pe' LIMIT 1
),
seller_user AS (
  SELECT "Id" AS seller_id FROM users WHERE "Email" = 'seller@reciclaya.pe' LIMIT 1
)
INSERT INTO user_regulation_requirements
("Id","UserId","Level","RequirementCode","Status","EvidenceUrl","Notes","ReviewedByUserId","ReviewedAt","ExpiresAt","CreatedAt","UpdatedAt")
SELECT
  'dddddddd-dddd-dddd-dddd-dddddddd0002',
  s.seller_id,
  1,
  'l1-seller-address',
  'approved',
  'https://example.local/evidence/l1-seller-address.pdf',
  'Aprobado para demo MVP',
  a.admin_id,
  NOW(),
  NOW() + INTERVAL '365 days',
  NOW(),
  NOW()
FROM seller_user s CROSS JOIN admin_user a
ON CONFLICT ("UserId","Level","RequirementCode")
DO UPDATE SET
  "Status" = EXCLUDED."Status",
  "EvidenceUrl" = EXCLUDED."EvidenceUrl",
  "Notes" = EXCLUDED."Notes",
  "ReviewedByUserId" = EXCLUDED."ReviewedByUserId",
  "ReviewedAt" = EXCLUDED."ReviewedAt",
  "ExpiresAt" = EXCLUDED."ExpiresAt",
  "UpdatedAt" = NOW();

WITH admin_user AS (
  SELECT "Id" AS admin_id FROM users WHERE "Email" = 'admin@reciclaya.pe' LIMIT 1
),
buyer_user AS (
  SELECT "Id" AS buyer_id FROM users WHERE "Email" = 'buyer@reciclaya.pe' LIMIT 1
)
INSERT INTO user_regulation_requirements
("Id","UserId","Level","RequirementCode","Status","EvidenceUrl","Notes","ReviewedByUserId","ReviewedAt","ExpiresAt","CreatedAt","UpdatedAt")
SELECT
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  b.buyer_id,
  1,
  'l1-buyer-license',
  'approved',
  'https://example.local/evidence/l1-buyer-license.pdf',
  'Aprobado para demo MVP',
  a.admin_id,
  NOW(),
  NOW() + INTERVAL '365 days',
  NOW(),
  NOW()
FROM buyer_user b CROSS JOIN admin_user a
ON CONFLICT ("UserId","Level","RequirementCode")
DO UPDATE SET
  "Status" = EXCLUDED."Status",
  "EvidenceUrl" = EXCLUDED."EvidenceUrl",
  "Notes" = EXCLUDED."Notes",
  "ReviewedByUserId" = EXCLUDED."ReviewedByUserId",
  "ReviewedAt" = EXCLUDED."ReviewedAt",
  "ExpiresAt" = EXCLUDED."ExpiresAt",
  "UpdatedAt" = NOW();

COMMIT;
