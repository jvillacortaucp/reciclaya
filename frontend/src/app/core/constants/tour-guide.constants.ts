export type RecommendationTourTab = 'process' | 'explanation' | 'market';

export const RECOMMENDATION_TOUR_ORDER_BY_INITIAL_TAB: Record<
    RecommendationTourTab,
    RecommendationTourTab[]
> = {
    process: ['process', 'explanation', 'market'],
    explanation: ['explanation', 'process', 'market'],
    market: ['market', 'process', 'explanation'],
};

export const TOUR_TOTAL_STEPS = 22;

export const TOUR_STEP_LABELS = {
    SELECT_LISTING: 1,
    GO_VALUE_SECTOR: 2,
    SELECT_VALUE_SECTOR: 3,
    SELECT_VALUE_PRODUCT: 4,
    EXPLAIN_PROCESS_BUTTON: 5,
    EXPLAIN_EXPLANATION_BUTTON: 6,
    EXPLAIN_MARKET_BUTTON: 7,
    CHOOSE_NEXT_ROUTE: 8,
    PROCESS_HEADER: 9,
    PROCESS_SUMMARY: 10,
    PROCESS_TECHNICAL: 11,
    PROCESS_STEPS: 12,
    EXPLANATION_HEADER: 13,
    EXPLANATION_SELECTOR: 14,
    EXPLANATION_DETAIL: 15,
    ENVIRONMENTAL_FACTORS: 16,
    NATURE_BENEFITS: 17,
    MARKET_HEADER: 18,
    MARKET_PRODUCT: 19,
    MARKET_BUYERS: 20,
    MARKET_COSTS: 21,
    TOUR_COMPLETE: 22,
} as const;

export const TOUR_GUIDE_STORAGE_KEYS = {
    HAS_COMPLETED_MAIN_FLOW: 'ecovalor_has_completed_main_tour',
    ATTEMPT_COUNT: 'ecovalor_tour_attempt_count',
    CURRENT_STEP: 'ecovalor_tour_current_step',
    PENDING_RECOMMENDATION_TOUR: 'ecovalor_pending_recommendation_tour',
    RECOMMENDATION_TOUR_ORDER: 'ecovalor_recommendation_tour_order',
    RECOMMENDATION_TOUR_INDEX: 'ecovalor_recommendation_tour_index',
    RECOMMENDATION_PRODUCT_ID: 'ecovalor_recommendation_product_id',
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
    processButton: '[data-tour="go-process-button"]',
    explanationButton: '[data-tour="go-explanation-button"]',
    marketButton: '[data-tour="go-market-button"]',
    valueSectorActions: '[data-tour="value-sector-actions"]',
    recommendationsHeader: '[data-tour="recommendations-header"]',
    processProductCard: '[data-tour="process-product-card"]',
    processTimeline: '[data-tour="process-timeline"]',
    processSummaryCard: '[data-tour="process-summary-card"]',
    explanationStepSelector: '[data-tour="explanation-step-selector"]',
    explanationDetailCard: '[data-tour="explanation-detail-card"]',
    explanationFactors: '[data-tour="explanation-factors"]',
    explanationBenefits: '[data-tour="explanation-benefits"]',
    explanationEnvironmentSummary: '[data-tour="explanation-environment-summary"]',
    marketFinishedProduct: '[data-tour="market-finished-product"]',
    marketBuyersGrid: '[data-tour="market-buyers-grid"]',
    marketCosts: '[data-tour="market-costs"]',
    marketOpportunitySummary: '[data-tour="market-opportunity-summary"]',
} as const;
