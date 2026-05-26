-- MVP Seed - Limpieza de ruido de datos demo
-- Objetivo: dejar consistentes requisitos regulatorios de usuarios demo para presentacion.

BEGIN;

WITH seller_user AS (
  SELECT "Id" AS user_id FROM users WHERE "Email" = 'seller@reciclaya.pe' LIMIT 1
),
buyer_user AS (
  SELECT "Id" AS user_id FROM users WHERE "Email" = 'buyer@reciclaya.pe' LIMIT 1
)
DELETE FROM user_regulation_requirements r
USING seller_user s, buyer_user b
WHERE r."UserId" IN (s.user_id, b.user_id)
  AND NOT (
    (r."UserId" = s.user_id AND r."Level" = 1 AND r."RequirementCode" IN ('l1-seller-dni-ruc','l1-seller-address'))
    OR
    (r."UserId" = b.user_id AND r."Level" = 1 AND r."RequirementCode" IN ('l1-buyer-license'))
  );

-- Reforzar estado final esperado para demo
WITH admin_user AS (
  SELECT "Id" AS admin_id FROM users WHERE "Email" = 'admin@reciclaya.pe' LIMIT 1
),
seller_user AS (
  SELECT "Id" AS seller_id FROM users WHERE "Email" = 'seller@reciclaya.pe' LIMIT 1
)
UPDATE user_regulation_requirements r
SET
  "Status" = 'approved',
  "ReviewedByUserId" = a.admin_id,
  "ReviewedAt" = NOW(),
  "ExpiresAt" = NOW() + INTERVAL '365 days',
  "UpdatedAt" = NOW()
FROM admin_user a, seller_user s
WHERE r."UserId" = s.seller_id
  AND r."Level" = 1
  AND r."RequirementCode" IN ('l1-seller-dni-ruc','l1-seller-address');

WITH admin_user AS (
  SELECT "Id" AS admin_id FROM users WHERE "Email" = 'admin@reciclaya.pe' LIMIT 1
),
buyer_user AS (
  SELECT "Id" AS buyer_id FROM users WHERE "Email" = 'buyer@reciclaya.pe' LIMIT 1
)
UPDATE user_regulation_requirements r
SET
  "Status" = 'approved',
  "ReviewedByUserId" = a.admin_id,
  "ReviewedAt" = NOW(),
  "ExpiresAt" = NOW() + INTERVAL '365 days',
  "UpdatedAt" = NOW()
FROM admin_user a, buyer_user b
WHERE r."UserId" = b.buyer_id
  AND r."Level" = 1
  AND r."RequirementCode" = 'l1-buyer-license';

COMMIT;
