SELECT "Level",
       ("PayloadJson"::jsonb ->> 'title') AS title,
       jsonb_array_length(COALESCE("PayloadJson"::jsonb -> 'objective', '[]'::jsonb)) AS objective_count,
       jsonb_array_length(COALESCE("PayloadJson"::jsonb -> 'restrictions', '[]'::jsonb)) AS restrictions_count,
       jsonb_array_length(COALESCE("PayloadJson"::jsonb -> 'regulations', '[]'::jsonb)) AS regulations_count,
       jsonb_array_length(COALESCE("PayloadJson"::jsonb -> 'requirementsForUpload', '[]'::jsonb)) AS upload_requirements_count
FROM regulation_level_catalogs
ORDER BY "Level";
