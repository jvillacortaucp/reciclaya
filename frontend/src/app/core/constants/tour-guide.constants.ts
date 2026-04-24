export const TOUR_GUIDE_STORAGE_KEYS = {
    HAS_COMPLETED_MAIN_FLOW: 'ecovalor_has_completed_main_tour',
    ATTEMPT_COUNT: 'ecovalor_tour_attempt_count',
    CURRENT_STEP: 'ecovalor_tour_current_step',
} as const;

export const TOUR_GUIDE_TEST_CONFIG = {
    ENABLED: true,
    MAX_ATTEMPTS: 10,
    RESET_ON_RELOAD: false,
} as const;

export const TOUR_GUIDE_SELECTORS = {
    botButton: '[data-tour="bot-guide-button"]',
    recommendationsButton: '[data-tour="recommendations-button"]',
    firstListingCard: '[data-tour="first-listing-card"]',
    selectedListingCard: '[data-tour="selected-listing-card"]',
    firstValueSector: '[data-tour="first-value-sector"]',
    firstValueSectorToggle: '[data-tour="first-value-sector-toggle"]',
    firstValueProduct: '[data-tour="first-value-product"]',
    continueButton: '[data-tour="value-sector-continue"]',
} as const;