BEGIN;
DELETE FROM regulation_level_catalogs;

INSERT INTO regulation_level_catalogs ("Level", "PayloadJson", "CreatedAt", "UpdatedAt") VALUES
(1, $$
{
  "Id": 1,
  "Slug": "residuos-libres",
  "Title": "Nivel 1 - Residuos libres",
  "Subtitle": "Regularizacion basica",
  "RegularizationLabel": "Regularizacion Basica",
  "RiskLevel": "low",
  "Fiscalization": "Baja. Principalmente municipal, comercial y tributaria.",
  "Objective": ["Facilitar reciclaje basico", "Impulsar economia circular"],
  "IncludedWasteCategories": [
    { "Id": "paper-cardboard", "Title": "Papel y carton", "Examples": ["Cajas", "Revistas"] },
    { "Id": "common-plastics", "Title": "Plasticos comunes", "Examples": ["PET", "HDPE"] }
  ],
  "SellerRequirements": [
    { "Id": "seller-natural-l1", "Title": "Persona natural", "RequiredItems": ["DNI vigente", "Datos de contacto"], "RecommendedItems": ["Direccion valida"] }
  ],
  "BuyerRequirements": [
    { "Id": "buyer-general-l1", "Title": "Comprador", "RequiredItems": ["RUC activo", "Licencia municipal"], "RecommendedItems": ["Centro de acopio identificado"] }
  ],
  "PlatformValidations": { "Allowed": ["Publicacion inmediata", "Negociacion libre"], "Required": ["Identificacion del material"] },
  "Restrictions": ["Residuos contaminados", "Materiales peligrosos ocultos"],
  "Traceability": { "Label": "Trazabilidad basica", "Items": ["Usuario", "Fecha", "Peso aproximado", "Ubicacion"] },
  "LegalRisks": { "Label": "Riesgo bajo", "Items": ["Informalidad", "Disposicion incorrecta"] },
  "Regulations": ["D.L. 1278", "D.S. 014-2017-MINAM"],
  "RequirementsForUpload": [
    { "Id": "l1-seller-dni-ruc", "LevelId": 1, "Title": "Identificacion del operador", "Description": "DNI o RUC activo", "Required": true, "ActorType": "seller", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null },
    { "Id": "l1-buyer-license", "LevelId": 1, "Title": "Licencia municipal del comprador", "Description": "Licencia vigente", "Required": true, "ActorType": "buyer", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null }
  ]
}
$$, NOW(), NOW()),
(2, $$
{
  "Id": 2,
  "Slug": "residuos-controlados",
  "Title": "Nivel 2 - Residuos controlados",
  "Subtitle": "Regularizacion intermedia",
  "RegularizationLabel": "Regularizacion Intermedia",
  "RiskLevel": "medium",
  "Fiscalization": "Municipal + sanitaria parcial.",
  "Objective": ["Controlar residuos organicos", "Asegurar almacenamiento"],
  "IncludedWasteCategories": [
    { "Id": "organic", "Title": "Organicos", "Examples": ["Restos de comida", "Cascaras"] }
  ],
  "SellerRequirements": [
    { "Id": "seller-business-l2", "Title": "Empresa o negocio", "RequiredItems": ["RUC activo", "Licencia municipal"], "RecommendedItems": ["Permiso sanitario"] }
  ],
  "BuyerRequirements": [
    { "Id": "buyer-general-l2", "Title": "Comprador", "RequiredItems": ["RUC", "Licencia municipal"], "RecommendedItems": ["Zona de almacenamiento"] }
  ],
  "PlatformValidations": { "Allowed": ["Publicaciones controladas"], "Required": ["Clasificacion basica", "Control de volumen"] },
  "Restrictions": ["Acumulacion excesiva", "Almacenamiento inseguro"],
  "Traceability": { "Label": "Trazabilidad media", "Items": ["Origen", "Volumen", "Frecuencia", "Comprador"] },
  "LegalRisks": { "Label": "Riesgo medio", "Items": ["Olores", "Vectores"] },
  "Regulations": ["D.L. 1278", "D.S. 014-2017-MINAM", "Ley General del Ambiente"],
  "RequirementsForUpload": [
    { "Id": "l2-seller-ruc-volume", "LevelId": 2, "Title": "RUC para volumen comercial", "Description": "RUC para operaciones comerciales", "Required": true, "ActorType": "seller", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null },
    { "Id": "l2-seller-classification", "LevelId": 2, "Title": "Clasificacion del residuo", "Description": "Ficha de clasificacion basica", "Required": true, "ActorType": "seller", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null }
  ]
}
$$, NOW(), NOW()),
(3, $$
{
  "Id": 3,
  "Slug": "residuos-regulados",
  "Title": "Nivel 3 - Residuos regulados",
  "Subtitle": "Regularizacion avanzada",
  "RegularizationLabel": "Regularizacion Avanzada",
  "RiskLevel": "medium_high",
  "Fiscalization": "MINAM + OEFA.",
  "Objective": ["Garantizar trazabilidad", "Asegurar reciclaje formal"],
  "IncludedWasteCategories": [
    { "Id": "raee", "Title": "RAEE", "Examples": ["Laptops", "Celulares", "TVs"] }
  ],
  "SellerRequirements": [
    { "Id": "seller-business-l3", "Title": "Empresa", "RequiredItems": ["RUC", "Registro comercial", "Clasificacion de residuos"], "RecommendedItems": ["Inventario"] }
  ],
  "BuyerRequirements": [
    { "Id": "buyer-general-l3", "Title": "Comprador", "RequiredItems": ["EO-RS autorizada", "Autorizacion de valorizacion"], "RecommendedItems": ["Protocolos de seguridad"] }
  ],
  "PlatformValidations": { "Allowed": ["Validacion documental"], "Required": ["Permisos vigentes", "Trazabilidad del operador"] },
  "Restrictions": ["Compradores no autorizados", "Operaciones anonimas"],
  "Traceability": { "Label": "Trazabilidad alta", "Items": ["Operador", "Documentos", "Rutas", "Peso exacto"] },
  "LegalRisks": { "Label": "Riesgo alto", "Items": ["Contaminacion por metales pesados", "Disposicion ilegal"] },
  "Regulations": ["D.L. 1278", "D.S. 014-2017-MINAM", "Ley 29325"],
  "RequirementsForUpload": [
    { "Id": "l3-seller-origin", "LevelId": 3, "Title": "Declaracion de origen", "Description": "Acreditar origen y trazabilidad", "Required": true, "ActorType": "seller", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null },
    { "Id": "l3-buyer-eors", "LevelId": 3, "Title": "Autorizacion EO-RS", "Description": "Registro EO-RS vigente", "Required": true, "ActorType": "buyer", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null }
  ]
}
$$, NOW(), NOW()),
(4, $$
{
  "Id": 4,
  "Slug": "residuos-criticos",
  "Title": "Nivel 4 - Residuos criticos",
  "Subtitle": "Regularizacion especializada",
  "RegularizationLabel": "Regularizacion Especializada",
  "RiskLevel": "high",
  "Fiscalization": "MINAM + OEFA + DIGESA + MTC.",
  "Objective": ["Controlar residuos peligrosos", "Reducir riesgos quimicos y sanitarios"],
  "IncludedWasteCategories": [
    { "Id": "chemical", "Title": "Quimicos", "Examples": ["Solventes", "Reactivos", "Pinturas"] }
  ],
  "SellerRequirements": [
    { "Id": "seller-company-l4", "Title": "Empresa o institucion", "RequiredItems": ["RUC", "Clasificacion del residuo", "Manifiestos"], "RecommendedItems": ["Protocolos de seguridad"] }
  ],
  "BuyerRequirements": [
    { "Id": "buyer-general-l4", "Title": "Comprador", "RequiredItems": ["EO-RS peligrosos", "MATPEL", "Trazabilidad completa"], "RecommendedItems": ["Seguro ambiental"] }
  ],
  "PlatformValidations": { "Allowed": ["Aprobacion manual", "Auditoria documental"], "Required": ["Validacion humana", "Soporte documental integral"] },
  "Restrictions": ["Marketplace abierto", "Transporte no autorizado"],
  "Traceability": { "Label": "Trazabilidad completa", "Items": ["Manifiestos", "Operador", "Vehiculo", "Conductor", "Ruta", "Destino"] },
  "LegalRisks": { "Label": "Riesgo muy alto", "Items": ["Sanciones OEFA", "Multas ambientales", "Posibles delitos ambientales"] },
  "Regulations": ["D.L. 1278", "D.S. 014-2017-MINAM", "Ley 28256", "D.S. 021-2008-MTC"],
  "RequirementsForUpload": [
    { "Id": "l4-seller-classification", "LevelId": 4, "Title": "Clasificacion del residuo critico", "Description": "Documento tecnico del residuo", "Required": true, "ActorType": "seller", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null },
    { "Id": "l4-buyer-matpel", "LevelId": 4, "Title": "Autorizacion MATPEL", "Description": "Autorizacion de transporte MATPEL vigente", "Required": true, "ActorType": "buyer", "AcceptedFileTypes": ["pdf", "image"], "CurrentStatus": "pending", "UploadedFileName": null, "UploadedFileUrl": null, "UploadedFileKind": null, "Notes": null }
  ]
}
$$, NOW(), NOW());

COMMIT;
