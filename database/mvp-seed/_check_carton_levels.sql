SELECT "Level", "CategoryId", "CategoryTitle", "ResidueName", "IsActive"
FROM regulation_allowed_residues_catalog
WHERE lower("ResidueName") LIKE '%carton%'
   OR lower("CategoryTitle") LIKE '%carton%'
   OR lower("CategoryId") LIKE '%carton%'
ORDER BY "Level", "ResidueName";
