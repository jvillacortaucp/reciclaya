SELECT "Level", "Slug",
       ("PayloadJson"::jsonb ? 'Restrictions') AS has_restrictions_key,
       jsonb_typeof("PayloadJson"::jsonb -> 'Restrictions') AS restrictions_type
FROM regulation_level_catalogs
ORDER BY "Level";
