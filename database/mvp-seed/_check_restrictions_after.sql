SELECT "Level", "Slug",
       ("PayloadJson"::jsonb ? 'Restrictions') AS has_restrictions_key,
       jsonb_typeof("PayloadJson"::jsonb -> 'Restrictions') AS restrictions_type,
       jsonb_array_length(COALESCE("PayloadJson"::jsonb -> 'Restrictions','[]'::jsonb)) AS restrictions_count
FROM regulation_level_catalogs
ORDER BY "Level";
