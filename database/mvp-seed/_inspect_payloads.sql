SELECT "Level", LEFT("PayloadJson", 400) AS payload_head
FROM regulation_level_catalogs
ORDER BY "Level";
