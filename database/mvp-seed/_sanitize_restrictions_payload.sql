BEGIN;

UPDATE regulation_level_catalogs
SET "PayloadJson" = jsonb_set(
    "PayloadJson"::jsonb,
    '{Restrictions}',
    '[]'::jsonb,
    true
)::text,
"UpdatedAt" = NOW()
WHERE
    NOT ("PayloadJson"::jsonb ? 'Restrictions')
    OR jsonb_typeof("PayloadJson"::jsonb -> 'Restrictions') <> 'array';

COMMIT;
