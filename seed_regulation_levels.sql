BEGIN;

DO $$
DECLARE
    v_next_version integer;
    v_version_id uuid;
BEGIN
    SELECT COALESCE(MAX("VersionNumber"), 0) + 1
    INTO v_next_version
    FROM regulation_catalog_versions;

    UPDATE regulation_catalog_versions
    SET "IsActive" = FALSE,
        "UpdatedAt" = NOW()
    WHERE "IsActive" = TRUE;

    v_version_id := gen_random_uuid();

    INSERT INTO regulation_catalog_versions ("Id", "VersionNumber", "IsActive", "Notes", "CreatedAt", "UpdatedAt")
    VALUES (v_version_id, v_next_version, TRUE, 'Seed normativo Peru niveles 1-4', NOW(), NOW());

    -- LEVEL 1
    INSERT INTO regulation_level_requirements_catalog
    ("Id","VersionId","Level","RequirementCode","Title","Description","IsRequired","ActorType","AcceptedFileTypesJson","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 1, 'l1-seller-dni-ruc', 'Identificacion del operador', 'DNI para persona natural o RUC activo para empresa.', TRUE, 'seller', '["pdf","image"]', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'l1-seller-contact', 'Datos de contacto del vendedor', 'Telefono y correo de contacto actualizados.', TRUE, 'seller', '["pdf","image","document"]', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'l1-seller-address', 'Direccion de operacion', 'Direccion valida de operacion para recojo/entrega.', FALSE, 'seller', '["pdf","image","document"]', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'l1-buyer-ruc', 'RUC activo del comprador', 'Constancia de RUC activo y habido.', TRUE, 'buyer', '["pdf","image"]', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'l1-buyer-license', 'Licencia municipal del comprador', 'Licencia municipal del centro de acopio o local comercial.', TRUE, 'buyer', '["pdf","image"]', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'l1-buyer-formal-evidence', 'Evidencia de operacion formal', 'Evidencia de centro de acopio identificado y operacion formal.', FALSE, 'buyer', '["pdf","image","document"]', 60, TRUE, NOW(), NOW());

    INSERT INTO regulation_allowed_residues_catalog
    ("Id","VersionId","Level","CategoryId","CategoryTitle","ResidueName","QuantityMin","QuantityMax","Unit","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 1, 'paper-cardboard', 'Papel y carton', 'Cajas', NULL, NULL, NULL, 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'paper-cardboard', 'Papel y carton', 'Periodicos', NULL, NULL, NULL, 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'paper-cardboard', 'Papel y carton', 'Revistas', NULL, NULL, NULL, 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'paper-cardboard', 'Papel y carton', 'Cuadernos', NULL, NULL, NULL, 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'common-plastics', 'Plasticos comunes', 'PET', NULL, NULL, NULL, 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'common-plastics', 'Plasticos comunes', 'HDPE', NULL, NULL, NULL, 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'common-plastics', 'Plasticos comunes', 'Botellas', NULL, NULL, NULL, 70, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'common-plastics', 'Plasticos comunes', 'Envases', NULL, NULL, NULL, 80, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'glass', 'Vidrio', 'Botellas de vidrio', NULL, NULL, NULL, 90, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'glass', 'Vidrio', 'Frascos de vidrio', NULL, NULL, NULL, 100, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'metals', 'Metales reciclables', 'Aluminio', NULL, NULL, NULL, 110, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'metals', 'Metales reciclables', 'Fierro', NULL, NULL, NULL, 120, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'metals', 'Metales reciclables', 'Latas', NULL, NULL, NULL, 130, TRUE, NOW(), NOW());

    INSERT INTO regulation_level_rules_catalog
    ("Id","VersionId","Level","RuleGroup","ItemText","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 1, 'objective', 'Facilitar reciclaje basico', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'objective', 'Impulsar economia circular', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'objective', 'Promover formalizacion inicial', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'objective', 'Crecimiento masivo del marketplace', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'platform_allowed', 'Publicacion inmediata', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'platform_allowed', 'Negociacion libre', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'platform_allowed', 'Operaciones abiertas', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'platform_required', 'Identificacion del material', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'platform_required', 'Origen basico del residuo', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'restriction', 'Residuos contaminados', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'restriction', 'Mezcla con quimicos', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'restriction', 'Materiales peligrosos ocultos', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'traceability', 'Usuario', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'traceability', 'Fecha', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'traceability', 'Peso aproximado', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'traceability', 'Ubicacion', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'legal_risk', 'Informalidad', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'legal_risk', 'Disposicion incorrecta', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'legal_risk', 'Conflictos municipales', 30, TRUE, NOW(), NOW());

    INSERT INTO regulation_normative_references_catalog
    ("Id","VersionId","Level","Code","Title","Article","ReferenceUrl","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 1, 'D.L. 1278', 'Ley de Gestion Integral de Residuos Solidos', NULL, NULL, 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'D.S. 014-2017-MINAM', 'Reglamento del D.L. 1278', NULL, NULL, 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 1, 'Ordenanzas municipales', 'Normativa municipal de limpieza publica y acopio', NULL, NULL, 30, TRUE, NOW(), NOW());

    -- LEVEL 2
    INSERT INTO regulation_level_requirements_catalog
    ("Id","VersionId","Level","RequirementCode","Title","Description","IsRequired","ActorType","AcceptedFileTypesJson","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 2, 'l2-seller-dni-address', 'DNI y direccion del generador', 'DNI y direccion cuando aplica persona natural.', TRUE, 'seller', '["pdf","image"]', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'l2-seller-ruc-volume', 'RUC para volumen comercial', 'RUC obligatorio cuando supera volumen comercial.', TRUE, 'seller', '["pdf","image"]', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'l2-seller-license', 'Licencia municipal del vendedor', 'Licencia municipal segun actividad.', TRUE, 'seller', '["pdf","image"]', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'l2-seller-sanitary-or-storage', 'Permiso sanitario o almacenamiento', 'Permiso sanitario municipal o autorizacion de almacenamiento, segun aplique.', FALSE, 'seller', '["pdf","image","document"]', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'l2-buyer-ruc-license', 'RUC y licencia del comprador', 'RUC y licencia municipal del comprador.', TRUE, 'buyer', '["pdf","image"]', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'l2-buyer-storage-zone', 'Zona de almacenamiento', 'Evidencia de zona de almacenamiento del comprador.', FALSE, 'buyer', '["pdf","image"]', 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'l2-buyer-basic-plan', 'Plan basico de manejo', 'Plan basico de manejo de residuos controlados.', FALSE, 'buyer', '["pdf","image","document"]', 70, TRUE, NOW(), NOW());

    INSERT INTO regulation_allowed_residues_catalog
    ("Id","VersionId","Level","CategoryId","CategoryTitle","ResidueName","QuantityMin","QuantityMax","Unit","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 2, 'organic', 'Organicos', 'Restos de comida', NULL, 10000, 'kg', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'organic', 'Organicos', 'Frutas', NULL, 10000, 'kg', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'organic', 'Organicos', 'Verduras', NULL, 10000, 'kg', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'organic', 'Organicos', 'Cascaras', NULL, 10000, 'kg', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'agroindustrial', 'Agroindustriales', 'Bagazo', NULL, 10000, 'kg', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'agroindustrial', 'Agroindustriales', 'Residuos agricolas', NULL, 10000, 'kg', 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'agroindustrial', 'Agroindustriales', 'Residuos vegetales', NULL, 10000, 'kg', 70, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'livestock', 'Pecuarios', 'Estiercol', NULL, 10000, 'kg', 80, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'livestock', 'Pecuarios', 'Residuos avicolas', NULL, 10000, 'kg', 90, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'livestock', 'Pecuarios', 'Residuos ganaderos', NULL, 10000, 'kg', 100, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'industrial-simple', 'Industriales simples', 'Madera tratada', NULL, 10000, 'kg', 110, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'industrial-simple', 'Industriales simples', 'Textiles industriales', NULL, 10000, 'kg', 120, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'industrial-simple', 'Industriales simples', 'Caucho no peligroso', NULL, 10000, 'kg', 130, TRUE, NOW(), NOW());

    INSERT INTO regulation_level_rules_catalog
    ("Id","VersionId","Level","RuleGroup","ItemText","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 2, 'objective', 'Controlar residuos con contaminacion organica', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'objective', 'Asegurar almacenamiento adecuado', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'objective', 'Reducir riesgos a la salud publica', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'platform_allowed', 'Publicaciones controladas', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'platform_allowed', 'Revision documental parcial', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'platform_allowed', 'Limites de volumen', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'platform_required', 'Clasificacion basica', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'platform_required', 'Control de volumen y frecuencia', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'platform_required', 'Evidencia fotografica', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'restriction', 'Acumulacion excesiva', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'restriction', 'Residuos sin clasificacion', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'restriction', 'Almacenamiento inseguro', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'traceability', 'Origen', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'traceability', 'Volumen', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'traceability', 'Frecuencia', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'traceability', 'Comprador', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'traceability', 'Evidencia fotografica', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'legal_risk', 'Olores', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'legal_risk', 'Vectores', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'legal_risk', 'Contaminacion biologica', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'legal_risk', 'Conflictos sanitarios', 40, TRUE, NOW(), NOW());

    INSERT INTO regulation_normative_references_catalog
    ("Id","VersionId","Level","Code","Title","Article","ReferenceUrl","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 2, 'D.L. 1278', 'Ley de Gestion Integral de Residuos Solidos', NULL, NULL, 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'D.S. 014-2017-MINAM', 'Reglamento del D.L. 1278', NULL, NULL, 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'Ley General del Ambiente', 'Marco general de obligaciones ambientales', NULL, NULL, 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 2, 'Regulacion sanitaria municipal', 'Normativa sanitaria local aplicable', NULL, NULL, 40, TRUE, NOW(), NOW());

    -- LEVEL 3
    INSERT INTO regulation_level_requirements_catalog
    ("Id","VersionId","Level","RequirementCode","Title","Description","IsRequired","ActorType","AcceptedFileTypesJson","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 3, 'l3-seller-dni-origin', 'DNI y declaracion de origen', 'DNI y declaracion de origen para persona natural.', TRUE, 'seller', '["pdf","image"]', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'l3-seller-ruc-classification', 'RUC y clasificacion del residuo', 'RUC y clasificacion tecnica del residuo.', TRUE, 'seller', '["pdf","image","document"]', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'l3-seller-inventory', 'Control interno / inventario', 'Control interno e inventario recomendado.', FALSE, 'seller', '["pdf","image","document"]', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'l3-buyer-eors', 'EO-RS autorizada', 'Acreditar autorizacion vigente EO-RS.', TRUE, 'buyer', '["pdf","image"]', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'l3-buyer-valorization-auth', 'Autorizacion de valorizacion', 'Autorizacion para valorizacion y almacenamiento seguro.', TRUE, 'buyer', '["pdf","image","document"]', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'l3-buyer-traceability', 'Trazabilidad operativa', 'Protocolos de trazabilidad operativa y control documental.', TRUE, 'buyer', '["pdf","image","document"]', 60, TRUE, NOW(), NOW());

    INSERT INTO regulation_allowed_residues_catalog
    ("Id","VersionId","Level","CategoryId","CategoryTitle","ResidueName","QuantityMin","QuantityMax","Unit","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 3, 'raee', 'RAEE', 'Laptops', NULL, NULL, NULL, 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'raee', 'RAEE', 'Celulares', NULL, NULL, NULL, 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'raee', 'RAEE', 'TVs', NULL, NULL, NULL, 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'raee', 'RAEE', 'Impresoras', NULL, NULL, NULL, 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'raee', 'RAEE', 'Monitores', NULL, NULL, NULL, 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'electronics', 'Electronicos', 'Placas', NULL, NULL, NULL, 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'electronics', 'Electronicos', 'Cables', NULL, NULL, NULL, 70, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'electronics', 'Electronicos', 'Perifericos', NULL, NULL, NULL, 80, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'minor-batteries', 'Baterias menores', 'Pilas', NULL, NULL, NULL, 90, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'minor-batteries', 'Baterias menores', 'Baterias pequenas', NULL, NULL, NULL, 100, TRUE, NOW(), NOW());

    INSERT INTO regulation_level_rules_catalog
    ("Id","VersionId","Level","RuleGroup","ItemText","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 3, 'objective', 'Garantizar trazabilidad', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'objective', 'Asegurar reciclaje formal', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'objective', 'Valorizacion segura y control ambiental', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'platform_allowed', 'Validacion documental', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'platform_allowed', 'Aprobacion administrativa', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'platform_allowed', 'Verificacion de permisos', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'platform_required', 'Permisos vigentes', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'platform_required', 'Trazabilidad del operador', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'platform_required', 'Control documental', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'restriction', 'Compradores no autorizados', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'restriction', 'Operaciones anonimas', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'restriction', 'Recoleccion informal', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'traceability', 'Operador', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'traceability', 'Documentos', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'traceability', 'Historial', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'traceability', 'Rutas', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'traceability', 'Peso exacto', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'traceability', 'Evidencia de entrega', 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'legal_risk', 'Contaminacion por metales pesados', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'legal_risk', 'Disposicion ilegal', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'legal_risk', 'Incumplimiento ambiental', 30, TRUE, NOW(), NOW());

    INSERT INTO regulation_normative_references_catalog
    ("Id","VersionId","Level","Code","Title","Article","ReferenceUrl","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 3, 'D.L. 1278', 'Ley de Gestion Integral de Residuos Solidos', NULL, NULL, 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'D.S. 014-2017-MINAM', 'Reglamento del D.L. 1278', NULL, NULL, 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'Ley 29325', 'Ley del Sistema Nacional de Evaluacion y Fiscalizacion Ambiental', NULL, NULL, 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 3, 'Normativa RAEE', 'Normativa aplicable a residuos de aparatos electricos y electronicos', NULL, NULL, 40, TRUE, NOW(), NOW());

    -- LEVEL 4
    INSERT INTO regulation_level_requirements_catalog
    ("Id","VersionId","Level","RequirementCode","Title","Description","IsRequired","ActorType","AcceptedFileTypesJson","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 4, 'l4-seller-ruc-classification', 'RUC y clasificacion del residuo critico', 'RUC y clasificacion tecnica del residuo peligroso.', TRUE, 'seller', '["pdf","image","document"]', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'l4-seller-manifests-plan', 'Manifiestos y plan de manejo', 'Manifiestos y plan de manejo del residuo.', TRUE, 'seller', '["pdf","image","document"]', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'l4-seller-sanitary-security', 'Autorizacion sanitaria y protocolos', 'Autorizacion sanitaria y protocolos de seguridad segun residuo.', FALSE, 'seller', '["pdf","image","document"]', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'l4-buyer-eors-hazmat', 'EO-RS para peligrosos', 'Acreditar EO-RS para residuos peligrosos.', TRUE, 'buyer', '["pdf","image","document"]', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'l4-buyer-matpel', 'Autorizacion MATPEL', 'Autorizacion de transporte MATPEL vigente.', TRUE, 'buyer', '["pdf","image"]', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'l4-buyer-full-traceability', 'Trazabilidad completa y certificados', 'Manifiestos, destino final, certificados y control operativo completo.', TRUE, 'buyer', '["pdf","image","document"]', 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'l4-buyer-emergency-insurance', 'Seguros y protocolos de emergencia', 'Seguro ambiental y protocolos de respuesta a emergencias.', FALSE, 'buyer', '["pdf","image","document"]', 70, TRUE, NOW(), NOW());

    INSERT INTO regulation_allowed_residues_catalog
    ("Id","VersionId","Level","CategoryId","CategoryTitle","ResidueName","QuantityMin","QuantityMax","Unit","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 4, 'chemical', 'Quimicos', 'Solventes', NULL, NULL, NULL, 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'chemical', 'Quimicos', 'Reactivos', NULL, NULL, NULL, 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'chemical', 'Quimicos', 'Pinturas', NULL, NULL, NULL, 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'hydrocarbons', 'Hidrocarburos', 'Aceite usado', NULL, NULL, NULL, 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'hydrocarbons', 'Hidrocarburos', 'Lubricantes', NULL, NULL, NULL, 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'biocontaminated', 'Biocontaminados', 'Residuos hospitalarios', NULL, NULL, NULL, 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'biocontaminated', 'Biocontaminados', 'Material infeccioso', NULL, NULL, NULL, 70, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'industrial-hazardous', 'Industriales peligrosos', 'Corrosivos', NULL, NULL, NULL, 80, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'industrial-hazardous', 'Industriales peligrosos', 'Toxicos', NULL, NULL, NULL, 90, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'industrial-hazardous', 'Industriales peligrosos', 'Inflamables', NULL, NULL, NULL, 100, TRUE, NOW(), NOW());

    INSERT INTO regulation_level_rules_catalog
    ("Id","VersionId","Level","RuleGroup","ItemText","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 4, 'objective', 'Controlar residuos peligrosos', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'objective', 'Reducir riesgos sanitarios y quimicos', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'objective', 'Mitigar impacto ambiental grave', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'platform_allowed', 'Aprobacion manual', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'platform_allowed', 'Auditoria documental', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'platform_allowed', 'Validacion avanzada', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'platform_allowed', 'Trazabilidad obligatoria', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'platform_required', 'Verificacion humana integral', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'platform_required', 'Permisos vigentes de alto riesgo', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'platform_required', 'Soporte documental completo', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'restriction', 'Marketplace abierto', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'restriction', 'Operaciones informales', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'restriction', 'Usuarios no verificados', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'restriction', 'Transporte no autorizado', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Manifiestos', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Operador', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Vehiculo', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Conductor', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Ruta', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Destino final', 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Evidencias', 70, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Permisos', 80, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'traceability', 'Certificados', 90, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'legal_risk', 'Sanciones OEFA', 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'legal_risk', 'Responsabilidad civil', 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'legal_risk', 'Responsabilidad administrativa', 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'legal_risk', 'Clausuras', 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'legal_risk', 'Multas ambientales', 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'legal_risk', 'Posibles delitos ambientales', 60, TRUE, NOW(), NOW());

    INSERT INTO regulation_normative_references_catalog
    ("Id","VersionId","Level","Code","Title","Article","ReferenceUrl","SortOrder","IsActive","CreatedAt","UpdatedAt")
    VALUES
    (gen_random_uuid(), v_version_id, 4, 'D.L. 1278', 'Ley de Gestion Integral de Residuos Solidos', NULL, NULL, 10, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'D.S. 014-2017-MINAM', 'Reglamento del D.L. 1278', NULL, NULL, 20, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'Ley 28256', 'Ley que regula el transporte terrestre de materiales y residuos peligrosos', NULL, NULL, 30, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'D.S. 021-2008-MTC', 'Reglamento nacional de transporte terrestre de materiales y residuos peligrosos', NULL, NULL, 40, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'Ley 28611', 'Ley General del Ambiente', NULL, NULL, 50, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'Ley 29325', 'Ley del SINEFA', NULL, NULL, 60, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'Regulacion DIGESA', 'Normativa sanitaria aplicable a residuos peligrosos', NULL, NULL, 70, TRUE, NOW(), NOW()),
    (gen_random_uuid(), v_version_id, 4, 'Regulacion OEFA', 'Normativa de fiscalizacion ambiental aplicable', NULL, NULL, 80, TRUE, NOW(), NOW());
END $$;

COMMIT;
