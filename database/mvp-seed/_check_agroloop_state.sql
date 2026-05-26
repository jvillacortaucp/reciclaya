SELECT u."Email", p."CurrentLevel", p."UpdatedAt"
FROM users u
LEFT JOIN user_regulation_profiles p ON p."UserId" = u."Id"
WHERE u."Email" = 'seller@reciclaya.pe';

SELECT r."RequirementCode", r."Level", r."Status", r."ReviewedAt", r."ExpiresAt"
FROM user_regulation_requirements r
JOIN users u ON u."Id" = r."UserId"
WHERE u."Email" = 'seller@reciclaya.pe'
ORDER BY r."Level", r."RequirementCode";
