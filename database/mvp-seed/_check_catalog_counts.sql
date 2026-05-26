SELECT COUNT(*) AS levels_catalog FROM regulation_level_catalogs;
SELECT COUNT(*) AS requirements_catalog FROM regulation_level_requirements_catalog WHERE "IsActive" = true;
SELECT COUNT(*) AS allowed_residues_catalog FROM regulation_allowed_residues_catalog WHERE "IsActive" = true;
SELECT COUNT(*) AS level_rules_catalog FROM regulation_level_rules_catalog WHERE "IsActive" = true;
SELECT COUNT(*) AS normatives_catalog FROM regulation_normative_references_catalog WHERE "IsActive" = true;
