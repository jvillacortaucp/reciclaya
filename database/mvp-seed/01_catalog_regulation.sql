-- MVP Seed - Catalogo regulatorio (idempotente)
-- Entorno objetivo: desarrollo

BEGIN;

-- 1) Definir version activa del catalogo
UPDATE regulation_catalog_versions
SET "IsActive" = FALSE,
    "UpdatedAt" = NOW();

INSERT INTO regulation_catalog_versions ("Id", "VersionNumber", "IsActive", "Notes", "CreatedAt", "UpdatedAt")
VALUES ('11111111-1111-1111-1111-111111111001', 1001, TRUE, 'MVP regulacion Peru v1', NOW(), NOW())
ON CONFLICT ("VersionNumber")
DO UPDATE SET
    "IsActive" = EXCLUDED."IsActive",
    "Notes" = EXCLUDED."Notes",
    "UpdatedAt" = NOW();

-- 2) Limpiar datos de version activa (idempotencia fuerte)
DELETE FROM regulation_level_requirements_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001';
DELETE FROM regulation_allowed_residues_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001';
DELETE FROM regulation_level_rules_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001';
DELETE FROM regulation_normative_references_catalog WHERE "VersionId" = '11111111-1111-1111-1111-111111111001';

-- 3) Requisitos por nivel (seller/buyer/both)
INSERT INTO regulation_level_requirements_catalog
("Id","VersionId","Level","RequirementCode","Title","Description","IsRequired","ActorType","AcceptedFileTypesJson","SortOrder","IsActive","CreatedAt","UpdatedAt")
VALUES
('21111111-1111-1111-1111-111111111001','11111111-1111-1111-1111-111111111001',1,'l1-seller-dni-ruc','Identificacion del operador','DNI vigente para persona natural o RUC activo para empresa.',TRUE,'seller','["pdf","image"]',1,TRUE,NOW(),NOW()),
('21111111-1111-1111-1111-111111111002','11111111-1111-1111-1111-111111111001',1,'l1-seller-address','Direccion operativa','Documento simple de direccion operativa.',FALSE,'seller','["pdf","image"]',2,TRUE,NOW(),NOW()),
('21111111-1111-1111-1111-111111111003','11111111-1111-1111-1111-111111111001',1,'l1-buyer-license','Licencia municipal comprador','Licencia municipal o constancia de funcionamiento.',TRUE,'buyer','["pdf","image"]',3,TRUE,NOW(),NOW()),

('21111111-1111-1111-1111-111111111004','11111111-1111-1111-1111-111111111001',2,'l2-seller-ruc-volume','RUC para volumen comercial','RUC activo para volumen comercial recurrente.',TRUE,'seller','["pdf","image"]',1,TRUE,NOW(),NOW()),
('21111111-1111-1111-1111-111111111005','11111111-1111-1111-1111-111111111001',2,'l2-seller-license','Licencia municipal','Licencia municipal del punto de operacion.',TRUE,'seller','["pdf","image"]',2,TRUE,NOW(),NOW()),
('21111111-1111-1111-1111-111111111006','11111111-1111-1111-1111-111111111001',2,'l2-seller-classification','Clasificacion declarada del residuo','Ficha o declaracion de clasificacion del residuo.',TRUE,'seller','["pdf","image"]',3,TRUE,NOW(),NOW()),

('21111111-1111-1111-1111-111111111007','11111111-1111-1111-1111-111111111001',3,'l3-seller-classification','Clasificacion tecnica del residuo','Clasificacion tecnica para residuos regulados.',TRUE,'seller','["pdf","image","document"]',1,TRUE,NOW(),NOW()),
('21111111-1111-1111-1111-111111111008','11111111-1111-1111-1111-111111111001',3,'l3-buyer-eors','EO-RS autorizado','Documento EO-RS o equivalente autorizado.',TRUE,'buyer','["pdf","image","document"]',2,TRUE,NOW(),NOW()),

('21111111-1111-1111-1111-111111111009','11111111-1111-1111-1111-111111111001',4,'l4-seller-manifest','Manifiestos y plan de manejo','Manifiestos y plan de manejo del residuo peligroso.',TRUE,'seller','["pdf","image","document"]',1,TRUE,NOW(),NOW()),
('21111111-1111-1111-1111-111111111010','11111111-1111-1111-1111-111111111001',4,'l4-buyer-matpel','MATPEL y EO-RS','Autorizacion de transporte MATPEL y EO-RS vigente.',TRUE,'buyer','["pdf","image","document"]',2,TRUE,NOW(),NOW());

-- 4) Residuos permitidos por nivel (con sinonimos operativos)
INSERT INTO regulation_allowed_residues_catalog
("Id","VersionId","Level","CategoryId","CategoryTitle","ResidueName","QuantityMin","QuantityMax","Unit","SortOrder","IsActive","CreatedAt","UpdatedAt")
VALUES
-- Nivel 1
('31111111-1111-1111-1111-111111111001','11111111-1111-1111-1111-111111111001',1,'paper-cardboard','Papel y carton','Carton corrugado',NULL,NULL,NULL,1,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111002','11111111-1111-1111-1111-111111111001',1,'paper-cardboard','Papel y carton','Papel archivo',NULL,NULL,NULL,2,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111003','11111111-1111-1111-1111-111111111001',1,'common-plastics','Plasticos comunes','PET',NULL,NULL,NULL,3,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111004','11111111-1111-1111-1111-111111111001',1,'common-plastics','Plasticos comunes','HDPE',NULL,NULL,NULL,4,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111005','11111111-1111-1111-1111-111111111001',1,'common-plastics','Plasticos comunes','Bandejas plasticas',NULL,NULL,NULL,5,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111006','11111111-1111-1111-1111-111111111001',1,'glass','Vidrio','Botellas de vidrio',NULL,NULL,NULL,6,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111007','11111111-1111-1111-1111-111111111001',1,'metals','Metales reciclables','Latas de aluminio',NULL,NULL,NULL,7,TRUE,NOW(),NOW()),

-- Nivel 2
('31111111-1111-1111-1111-111111111008','11111111-1111-1111-1111-111111111001',2,'organic','Organicos','Cascara de mango',NULL,NULL,NULL,1,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111009','11111111-1111-1111-1111-111111111001',2,'organic','Organicos','Restos de comida',NULL,NULL,NULL,2,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111010','11111111-1111-1111-1111-111111111001',2,'agroindustrial','Agroindustriales','Bagazo de cana',NULL,NULL,NULL,3,TRUE,NOW(),NOW()),

-- Nivel 3
('31111111-1111-1111-1111-111111111011','11111111-1111-1111-1111-111111111001',3,'raee','RAEE','Laptop en desuso',NULL,NULL,NULL,1,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111012','11111111-1111-1111-1111-111111111001',3,'raee','RAEE','Celular en desuso',NULL,NULL,NULL,2,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111013','11111111-1111-1111-1111-111111111001',3,'electronics','Electronicos','Placas electronicas',NULL,NULL,NULL,3,TRUE,NOW(),NOW()),

-- Nivel 4
('31111111-1111-1111-1111-111111111014','11111111-1111-1111-1111-111111111001',4,'chemicals','Quimicos','Solventes usados',NULL,NULL,NULL,1,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111015','11111111-1111-1111-1111-111111111001',4,'hydrocarbons','Hidrocarburos','Aceite usado',NULL,NULL,NULL,2,TRUE,NOW(),NOW()),
('31111111-1111-1111-1111-111111111016','11111111-1111-1111-1111-111111111001',4,'biohazard','Biocontaminados','Residuos hospitalarios',NULL,NULL,NULL,3,TRUE,NOW(),NOW());

-- 5) Reglas por nivel (objetivo, restricciones, plataforma, trazabilidad, riesgo legal)
INSERT INTO regulation_level_rules_catalog
("Id","VersionId","Level","RuleGroup","ItemText","SortOrder","IsActive","CreatedAt","UpdatedAt")
VALUES
-- Level 1
('41111111-1111-1111-1111-111111111001','11111111-1111-1111-1111-111111111001',1,'objective','Facilitar reciclaje basico y economia circular.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111002','11111111-1111-1111-1111-111111111001',1,'restriction','No residuos contaminados ni ocultamiento de peligrosos.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111003','11111111-1111-1111-1111-111111111001',1,'platform_allowed','Publicacion inmediata y negociacion libre.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111004','11111111-1111-1111-1111-111111111001',1,'platform_required','Identificacion basica del material y origen.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111005','11111111-1111-1111-1111-111111111001',1,'traceability','Usuario, fecha, peso aproximado, ubicacion.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111006','11111111-1111-1111-1111-111111111001',1,'legal_risk','Riesgo bajo por informalidad/disposicion incorrecta.',1,TRUE,NOW(),NOW()),

-- Level 2
('41111111-1111-1111-1111-111111111007','11111111-1111-1111-1111-111111111001',2,'objective','Controlar residuos organicos y almacenamiento adecuado.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111008','11111111-1111-1111-1111-111111111001',2,'restriction','No acumulacion excesiva ni almacenamiento inseguro.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111009','11111111-1111-1111-1111-111111111001',2,'platform_required','Revision documental parcial y limites de volumen.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111010','11111111-1111-1111-1111-111111111001',2,'traceability','Origen, volumen, frecuencia, comprador, evidencia.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111011','11111111-1111-1111-1111-111111111001',2,'legal_risk','Riesgo medio por vectores y contaminacion biologica.',1,TRUE,NOW(),NOW()),

-- Level 3
('41111111-1111-1111-1111-111111111012','11111111-1111-1111-1111-111111111001',3,'objective','Garantizar trazabilidad y reciclaje formal RAEE.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111013','11111111-1111-1111-1111-111111111001',3,'platform_required','Validacion documental y verificacion de permisos.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111014','11111111-1111-1111-1111-111111111001',3,'restriction','No compradores no autorizados ni operaciones anonimas.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111015','11111111-1111-1111-1111-111111111001',3,'legal_risk','Riesgo alto por disposicion ilegal de metales pesados.',1,TRUE,NOW(),NOW()),

-- Level 4
('41111111-1111-1111-1111-111111111016','11111111-1111-1111-1111-111111111001',4,'objective','Control estricto de residuos peligrosos.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111017','11111111-1111-1111-1111-111111111001',4,'platform_required','Aprobacion manual, auditoria documental, trazabilidad total.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111018','11111111-1111-1111-1111-111111111001',4,'restriction','No marketplace abierto para operadores no autorizados.',1,TRUE,NOW(),NOW()),
('41111111-1111-1111-1111-111111111019','11111111-1111-1111-1111-111111111001',4,'legal_risk','Riesgo muy alto con posibles sanciones OEFA y delitos ambientales.',1,TRUE,NOW(),NOW());

-- 6) Normativa por nivel
INSERT INTO regulation_normative_references_catalog
("Id","VersionId","Level","Code","Title","Article","ReferenceUrl","SortOrder","IsActive","CreatedAt","UpdatedAt")
VALUES
('51111111-1111-1111-1111-111111111001','11111111-1111-1111-1111-111111111001',1,'DL-1278','Decreto Legislativo 1278',NULL,NULL,1,TRUE,NOW(),NOW()),
('51111111-1111-1111-1111-111111111002','11111111-1111-1111-1111-111111111001',1,'DS-014-2017-MINAM','Reglamento D.S. 014-2017-MINAM',NULL,NULL,2,TRUE,NOW(),NOW()),
('51111111-1111-1111-1111-111111111003','11111111-1111-1111-1111-111111111001',2,'LGA-28611','Ley General del Ambiente 28611',NULL,NULL,1,TRUE,NOW(),NOW()),
('51111111-1111-1111-1111-111111111004','11111111-1111-1111-1111-111111111001',3,'LEY-29325','Ley 29325 (SINEFA/OEFA)',NULL,NULL,1,TRUE,NOW(),NOW()),
('51111111-1111-1111-1111-111111111005','11111111-1111-1111-1111-111111111001',4,'LEY-28256','Ley 28256 (MATPEL)',NULL,NULL,1,TRUE,NOW(),NOW()),
('51111111-1111-1111-1111-111111111006','11111111-1111-1111-1111-111111111001',4,'DS-021-2008-MTC','D.S. 021-2008-MTC',NULL,NULL,2,TRUE,NOW(),NOW());

-- 7) Payload legacy por nivel (consumido por /regulation/levels)
INSERT INTO regulation_level_catalogs ("Level","PayloadJson","CreatedAt","UpdatedAt")
VALUES
(1, '{
  "id":1,"slug":"level1","title":"Nivel 1 - Residuos libres","subtitle":"Regularizacion basica","regularizationLabel":"Regularizacion Basica","riskLevel":"low","fiscalization":"Baja: municipal/comercial/tributaria",
  "objective":["Facilitar reciclaje basico","Impulsar economia circular"],
  "includedWasteCategories":[{"id":"paper-cardboard","title":"Papel y carton","examples":["Carton corrugado","Papel archivo"]},{"id":"common-plastics","title":"Plasticos comunes","examples":["PET","HDPE","Bandejas plasticas"]}],
  "sellerRequirements":[{"id":"seller-business-l1","title":"Empresa o negocio","requiredItems":["RUC activo","Direccion comercial"],"recommendedItems":["Licencia municipal"]}],
  "buyerRequirements":[{"id":"buyer-general-l1","title":"Comprador","requiredItems":["RUC activo","Licencia municipal"],"recommendedItems":["Centro de acopio identificado"]}],
  "platformValidations":{"allowed":["Publicacion inmediata","Negociacion libre"],"required":["Identificacion basica del material","Origen basico"]},
  "restrictions":["Residuos contaminados","Materiales peligrosos ocultos"],
  "traceability":{"label":"Trazabilidad basica","items":["Usuario","Fecha","Peso aproximado","Ubicacion"]},
  "legalRisks":{"label":"Riesgo bajo","items":["Informalidad","Disposicion incorrecta"]},
  "regulations":["D.L. 1278","D.S. 014-2017-MINAM"],
  "requirementsForUpload":[
    {"id":"l1-seller-dni-ruc","levelId":1,"title":"Identificacion del operador","description":"DNI o RUC activo","required":true,"actorType":"seller","acceptedFileTypes":["pdf","image"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null},
    {"id":"l1-seller-address","levelId":1,"title":"Direccion operativa","description":"Documento de direccion","required":false,"actorType":"seller","acceptedFileTypes":["pdf","image"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null},
    {"id":"l1-buyer-license","levelId":1,"title":"Licencia municipal comprador","description":"Licencia municipal","required":true,"actorType":"buyer","acceptedFileTypes":["pdf","image"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null}
  ]
}', NOW(), NOW()),
(2, '{
  "id":2,"slug":"level2","title":"Nivel 2 - Residuos controlados","subtitle":"Regularizacion intermedia","regularizationLabel":"Regularizacion Intermedia","riskLevel":"medium","fiscalization":"Municipal + sanitaria parcial",
  "objective":["Controlar residuos organicos","Asegurar almacenamiento adecuado"],
  "includedWasteCategories":[{"id":"organic","title":"Organicos","examples":["Cascara de mango","Restos de comida"]},{"id":"agroindustrial","title":"Agroindustriales","examples":["Bagazo de cana"]}],
  "sellerRequirements":[{"id":"seller-business-l2","title":"Empresa o negocio","requiredItems":["RUC activo","Licencia municipal","Clasificacion declarada del residuo"],"recommendedItems":["Permiso sanitario"]}],
  "buyerRequirements":[{"id":"buyer-general-l2","title":"Comprador","requiredItems":["RUC","Licencia municipal"],"recommendedItems":["Autorizacion sanitaria"]}],
  "platformValidations":{"allowed":["Publicaciones controladas"],"required":["Revision documental parcial","Limites de volumen"]},
  "restrictions":["Acumulacion excesiva","Almacenamiento inseguro"],
  "traceability":{"label":"Trazabilidad media","items":["Origen","Volumen","Frecuencia","Comprador","Evidencia"]},
  "legalRisks":{"label":"Riesgo medio","items":["Olores","Vectores","Contaminacion biologica"]},
  "regulations":["D.L. 1278","D.S. 014-2017-MINAM","Ley 28611"],
  "requirementsForUpload":[
    {"id":"l2-seller-ruc-volume","levelId":2,"title":"RUC para volumen comercial","description":"RUC activo","required":true,"actorType":"seller","acceptedFileTypes":["pdf","image"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null},
    {"id":"l2-seller-license","levelId":2,"title":"Licencia municipal","description":"Licencia del punto operativo","required":true,"actorType":"seller","acceptedFileTypes":["pdf","image"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null},
    {"id":"l2-seller-classification","levelId":2,"title":"Clasificacion declarada del residuo","description":"Ficha de clasificacion","required":true,"actorType":"seller","acceptedFileTypes":["pdf","image"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null}
  ]
}', NOW(), NOW()),
(3, '{
  "id":3,"slug":"level3","title":"Nivel 3 - Residuos regulados","subtitle":"Regularizacion avanzada","regularizationLabel":"Regularizacion Avanzada","riskLevel":"medium_high","fiscalization":"MINAM + OEFA",
  "objective":["Garantizar trazabilidad","Reciclaje formal de RAEE"],
  "includedWasteCategories":[{"id":"raee","title":"RAEE","examples":["Laptop en desuso","Celular en desuso"]}],
  "sellerRequirements":[{"id":"seller-business-l3","title":"Empresa","requiredItems":["RUC","Clasificacion tecnica del residuo"],"recommendedItems":["Inventario interno"]}],
  "buyerRequirements":[{"id":"buyer-general-l3","title":"Comprador","requiredItems":["EO-RS autorizado"],"recommendedItems":["Protocolos de seguridad"]}],
  "platformValidations":{"allowed":["Validacion documental"],"required":["Verificacion de permisos"]},
  "restrictions":["No operaciones anonimas","No compradores no autorizados"],
  "traceability":{"label":"Trazabilidad alta","items":["Operador","Documentos","Rutas","Evidencia de entrega"]},
  "legalRisks":{"label":"Riesgo alto","items":["Contaminacion por metales pesados","Disposicion ilegal"]},
  "regulations":["D.L. 1278","Ley 29325","Normativa RAEE"],
  "requirementsForUpload":[
    {"id":"l3-seller-classification","levelId":3,"title":"Clasificacion tecnica del residuo","description":"Clasificacion tecnica RAEE","required":true,"actorType":"seller","acceptedFileTypes":["pdf","image","document"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null},
    {"id":"l3-buyer-eors","levelId":3,"title":"EO-RS autorizado","description":"Autorizacion EO-RS","required":true,"actorType":"buyer","acceptedFileTypes":["pdf","image","document"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null}
  ]
}', NOW(), NOW()),
(4, '{
  "id":4,"slug":"level4","title":"Nivel 4 - Residuos criticos","subtitle":"Regularizacion especializada","regularizationLabel":"Regularizacion Especializada","riskLevel":"high","fiscalization":"MINAM + OEFA + DIGESA + MTC",
  "objective":["Controlar residuos peligrosos","Mitigar riesgos quimicos y sanitarios"],
  "includedWasteCategories":[{"id":"chemicals","title":"Quimicos","examples":["Solventes usados"]},{"id":"hydrocarbons","title":"Hidrocarburos","examples":["Aceite usado"]}],
  "sellerRequirements":[{"id":"seller-business-l4","title":"Empresa o institucion","requiredItems":["Manifiestos","Plan de manejo"],"recommendedItems":["Protocolos de seguridad"]}],
  "buyerRequirements":[{"id":"buyer-general-l4","title":"Comprador","requiredItems":["EO-RS peligrosos","MATPEL","Trazabilidad completa"],"recommendedItems":["Seguros ambientales"]}],
  "platformValidations":{"allowed":["Aprobacion manual"],"required":["Auditoria documental","Trazabilidad obligatoria"]},
  "restrictions":["No marketplace abierto","No operadores no verificados"],
  "traceability":{"label":"Trazabilidad completa","items":["Manifiestos","Vehiculo","Conductor","Ruta","Destino final"]},
  "legalRisks":{"label":"Riesgo muy alto","items":["Sanciones OEFA","Multas ambientales","Posibles delitos ambientales"]},
  "regulations":["D.L. 1278","Ley 28256","D.S. 021-2008-MTC","Ley 29325"],
  "requirementsForUpload":[
    {"id":"l4-seller-manifest","levelId":4,"title":"Manifiestos y plan de manejo","description":"Manifiestos y plan para peligrosos","required":true,"actorType":"seller","acceptedFileTypes":["pdf","image","document"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null},
    {"id":"l4-buyer-matpel","levelId":4,"title":"MATPEL y EO-RS","description":"Autorizaciones MATPEL/EO-RS","required":true,"actorType":"buyer","acceptedFileTypes":["pdf","image","document"],"currentStatus":"pending","uploadedFileName":null,"uploadedFileUrl":null,"uploadedFileKind":null,"notes":null}
  ]
}', NOW(), NOW())
ON CONFLICT ("Level")
DO UPDATE SET
  "PayloadJson" = EXCLUDED."PayloadJson",
  "UpdatedAt" = NOW();

COMMIT;
