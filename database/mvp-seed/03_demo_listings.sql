-- MVP Seed - Publicaciones demo por nivel (idempotente)

BEGIN;

WITH seller AS (
  SELECT "Id" AS seller_id FROM users WHERE "Email" = 'seller@reciclaya.pe' LIMIT 1
)
INSERT INTO listings
("Id","SellerId","ReferenceCode","WasteType","Sector","ProductType","SpecificResidue","Description","Quantity","Unit","GenerationFrequency","PricePerUnitUsd","Currency","Location","MaxStorageTime","ExchangeType","DeliveryMode","ImmediateAvailability","Condition","Restrictions","NextAvailabilityDate","Status","MatchScore","AiSuggestionNote","DraftSavedAt","PublishedAt","CreatedAt","UpdatedAt","DeletedAt")
SELECT
  seed."Id",
  s.seller_id,
  seed."ReferenceCode",
  seed."WasteType",
  seed."Sector",
  seed."ProductType",
  seed."SpecificResidue",
  seed."Description",
  seed."Quantity",
  seed."Unit",
  seed."GenerationFrequency",
  seed."PricePerUnitUsd",
  seed."Currency",
  seed."Location",
  seed."MaxStorageTime",
  seed."ExchangeType",
  seed."DeliveryMode",
  seed."ImmediateAvailability",
  seed."Condition",
  seed."Restrictions",
  seed."NextAvailabilityDate"::timestamptz,
  seed."Status",
  seed."MatchScore"::int,
  seed."AiSuggestionNote",
  seed."DraftSavedAt"::timestamptz,
  seed."PublishedAt",
  seed."CreatedAt",
  seed."UpdatedAt",
  seed."DeletedAt"::timestamptz
FROM (
  VALUES
  ('e1111111-1111-1111-1111-111111111001'::uuid,'RCY-MVP-L1-001','paper','manufacturing','Carton','Carton corrugado','Carton corrugado limpio post-embalaje.','10.000'::numeric,'tons','single','450.00'::numeric,'PEN','Lima','72h','sale','warehouse_pickup',TRUE,'dry',NULL,NULL,'Published',NULL,'Demo nivel 1',NULL,NOW() - INTERVAL '15 days',NOW() - INTERVAL '15 days',NOW(),NULL),
  ('e1111111-1111-1111-1111-111111111002'::uuid,'RCY-MVP-L1-002','plastic','manufacturing','Plastico HDPE','Bandejas plasticas','Bandejas plasticas limpias de proceso industrial.','6.000'::numeric,'tons','weekly','620.00'::numeric,'PEN','Lima','48h','sale','seller_delivery',TRUE,'processed',NULL,NULL,'Published',NULL,'Demo nivel 1',NULL,NOW() - INTERVAL '12 days',NOW() - INTERVAL '12 days',NOW(),NULL),
  ('e1111111-1111-1111-1111-111111111003'::uuid,'RCY-MVP-L1-003','metal','transport','Aluminio','Latas de aluminio','Latas de aluminio compactadas y limpias.','4.500'::numeric,'tons','biweekly','780.00'::numeric,'PEN','Callao','96h','sale','warehouse_pickup',TRUE,'dry',NULL,NULL,'Published',NULL,'Demo nivel 1',NULL,NOW() - INTERVAL '10 days',NOW() - INTERVAL '10 days',NOW(),NULL),
  ('e1111111-1111-1111-1111-111111111004'::uuid,'RCY-MVP-L1-004','glass','retail','Vidrio reciclable','Botellas de vidrio','Botellas de vidrio clasificadas por color.','7.250'::numeric,'tons','monthly','390.00'::numeric,'PEN','Arequipa','120h','sale','seller_delivery',TRUE,'processed',NULL,NULL,'Published',NULL,'Demo nivel 1',NULL,NOW() - INTERVAL '8 days',NOW() - INTERVAL '8 days',NOW(),NULL),

  ('e1111111-1111-1111-1111-111111111005'::uuid,'RCY-MVP-L2-001','organic','agriculture','Organico','Cascara de mango','Residuo organico para compostaje y biotransformacion.','12.000'::numeric,'tons','weekly','260.00'::numeric,'PEN','Piura','24h','sale','seller_delivery',TRUE,'fresh','Requiere cadena logistica rapida.',NULL,'Published',NULL,'Demo nivel 2',NULL,NOW() - INTERVAL '6 days',NOW() - INTERVAL '6 days',NOW(),NULL),
  ('e1111111-1111-1111-1111-111111111006'::uuid,'RCY-MVP-L2-002','agroindustrial','agriculture','Agroindustrial','Bagazo de cana','Bagazo seco para usos energeticos y sustratos.','20.000'::numeric,'tons','monthly','310.00'::numeric,'PEN','La Libertad','120h','sale','warehouse_pickup',TRUE,'dry',NULL,NULL,'Published',NULL,'Demo nivel 2',NULL,NOW() - INTERVAL '5 days',NOW() - INTERVAL '5 days',NOW(),NULL),

  ('e1111111-1111-1111-1111-111111111007'::uuid,'RCY-MVP-L3-001','electronic','manufacturing','RAEE','Laptop en desuso','Equipos RAEE para desensamble controlado.','2.000'::numeric,'tons','monthly','1450.00'::numeric,'PEN','Lima','240h','sale','warehouse_pickup',TRUE,'processed','Solo operadores autorizados EO-RS.',NULL,'Published',NULL,'Demo nivel 3',NULL,NOW() - INTERVAL '3 days',NOW() - INTERVAL '3 days',NOW(),NULL),
  ('e1111111-1111-1111-1111-111111111008'::uuid,'RCY-MVP-L4-001','hazardous','industrial','Hidrocarburo','Aceite usado','Aceite usado industrial para gestion especializada.','3.500'::numeric,'tons','weekly','980.00'::numeric,'PEN','Lima','24h','sale','seller_delivery',TRUE,'wet','Requiere MATPEL y manifiestos.',NULL,'Published',NULL,'Demo nivel 4',NULL,NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days',NOW(),NULL)
) AS seed("Id","ReferenceCode","WasteType","Sector","ProductType","SpecificResidue","Description","Quantity","Unit","GenerationFrequency","PricePerUnitUsd","Currency","Location","MaxStorageTime","ExchangeType","DeliveryMode","ImmediateAvailability","Condition","Restrictions","NextAvailabilityDate","Status","MatchScore","AiSuggestionNote","DraftSavedAt","PublishedAt","CreatedAt","UpdatedAt","DeletedAt")
CROSS JOIN seller s
ON CONFLICT ("ReferenceCode")
DO UPDATE SET
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
  "Restrictions" = EXCLUDED."Restrictions",
  "NextAvailabilityDate" = EXCLUDED."NextAvailabilityDate",
  "Status" = EXCLUDED."Status",
  "AiSuggestionNote" = EXCLUDED."AiSuggestionNote",
  "PublishedAt" = EXCLUDED."PublishedAt",
  "UpdatedAt" = NOW();

-- Media demo (1 por listing)
INSERT INTO listing_media ("Id","ListingId","Url","Alt","Name","SizeKb","Type","SortOrder","CreatedAt","UpdatedAt")
VALUES
('f1111111-1111-1111-1111-111111111001','e1111111-1111-1111-1111-111111111001','https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1200&q=60','Carton corrugado','carton-1.jpg',220,'image/jpeg',0,NOW(),NOW()),
('f1111111-1111-1111-1111-111111111002','e1111111-1111-1111-1111-111111111002','https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1200&q=60','Plastico HDPE','plastico-1.jpg',240,'image/jpeg',0,NOW(),NOW()),
('f1111111-1111-1111-1111-111111111003','e1111111-1111-1111-1111-111111111003','https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&q=60','Latas de aluminio','aluminio-1.jpg',205,'image/jpeg',0,NOW(),NOW()),
('f1111111-1111-1111-1111-111111111004','e1111111-1111-1111-1111-111111111004','https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=60','Botellas de vidrio','vidrio-1.jpg',215,'image/jpeg',0,NOW(),NOW()),
('f1111111-1111-1111-1111-111111111005','e1111111-1111-1111-1111-111111111005','https://images.unsplash.com/photo-1611250188496-e966043a0629?auto=format&fit=crop&w=1200&q=60','Cascara de mango','organico-1.jpg',210,'image/jpeg',0,NOW(),NOW()),
('f1111111-1111-1111-1111-111111111006','e1111111-1111-1111-1111-111111111006','https://images.unsplash.com/photo-1615486363979-4f4600a67f1d?auto=format&fit=crop&w=1200&q=60','Bagazo de cana','bagazo-1.jpg',225,'image/jpeg',0,NOW(),NOW()),
('f1111111-1111-1111-1111-111111111007','e1111111-1111-1111-1111-111111111007','https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&w=1200&q=60','Laptop en desuso','raee-1.jpg',235,'image/jpeg',0,NOW(),NOW()),
('f1111111-1111-1111-1111-111111111008','e1111111-1111-1111-1111-111111111008','https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1200&q=60','Aceite usado','aceite-1.jpg',245,'image/jpeg',0,NOW(),NOW())
ON CONFLICT ("Id")
DO UPDATE SET
  "ListingId" = EXCLUDED."ListingId",
  "Url" = EXCLUDED."Url",
  "Alt" = EXCLUDED."Alt",
  "Name" = EXCLUDED."Name",
  "SizeKb" = EXCLUDED."SizeKb",
  "Type" = EXCLUDED."Type",
  "SortOrder" = EXCLUDED."SortOrder",
  "UpdatedAt" = NOW();

-- Fichas tecnicas basicas
INSERT INTO listing_technical_specs ("Id","ListingId","Key","Label","Value","CreatedAt","UpdatedAt")
VALUES
('a1111111-1111-1111-1111-111111111001','e1111111-1111-1111-1111-111111111001','humedad','Humedad','Baja',NOW(),NOW()),
('a1111111-1111-1111-1111-111111111002','e1111111-1111-1111-1111-111111111002','contaminacion','Contaminacion','Sin contaminacion visible',NOW(),NOW()),
('a1111111-1111-1111-1111-111111111003','e1111111-1111-1111-1111-111111111005','manejo','Manejo','Refrigeracion recomendada',NOW(),NOW()),
('a1111111-1111-1111-1111-111111111004','e1111111-1111-1111-1111-111111111007','seguridad','Seguridad','Desensamble por operador autorizado',NOW(),NOW()),
('a1111111-1111-1111-1111-111111111005','e1111111-1111-1111-1111-111111111008','transporte','Transporte','Requiere unidad autorizada MATPEL',NOW(),NOW())
ON CONFLICT ("Id")
DO UPDATE SET
  "ListingId" = EXCLUDED."ListingId",
  "Key" = EXCLUDED."Key",
  "Label" = EXCLUDED."Label",
  "Value" = EXCLUDED."Value",
  "UpdatedAt" = NOW();

COMMIT;
