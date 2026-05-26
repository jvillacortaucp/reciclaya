CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users
SET "PasswordHash" = crypt('password', gen_salt('bf', 10)),
    "UpdatedAt" = NOW()
WHERE "Email" IN (
  'seller@reciclaya.pe',
  'biociclo@reciclaya.pe',
  'amazonia.organica@reciclaya.pe',
  'tecnoreclaim@reciclaya.pe',
  'quimicontrol@reciclaya.pe'
);

SELECT "Email", LEFT("PasswordHash", 4) AS hash_prefix
FROM users
WHERE "Email" IN (
  'seller@reciclaya.pe',
  'biociclo@reciclaya.pe',
  'amazonia.organica@reciclaya.pe',
  'tecnoreclaim@reciclaya.pe',
  'quimicontrol@reciclaya.pe'
)
ORDER BY "Email";
