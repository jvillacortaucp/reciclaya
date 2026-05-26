SELECT c."BusinessName", u."Email", p."CurrentLevel"
FROM companies c
JOIN users u ON u."Id" = c."UserId"
LEFT JOIN user_regulation_profiles p ON p."UserId" = u."Id"
WHERE u."Email" IN ('biociclo@reciclaya.pe','amazonia.organica@reciclaya.pe','tecnoreclaim@reciclaya.pe','quimicontrol@reciclaya.pe')
ORDER BY u."Email";

SELECT u."Email", COUNT(*) AS published_count
FROM listings l
JOIN users u ON u."Id" = l."SellerId"
WHERE u."Email" IN ('biociclo@reciclaya.pe','amazonia.organica@reciclaya.pe','tecnoreclaim@reciclaya.pe','quimicontrol@reciclaya.pe')
  AND l."Status" = 'Published'
GROUP BY u."Email"
ORDER BY u."Email";
