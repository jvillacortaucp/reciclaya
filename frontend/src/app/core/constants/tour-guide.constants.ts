export type RecommendationTourTab = 'process' | 'complexity' | 'market';
export type TourFlowStep =
    | 'idle'
    | 'my_listings_focus_first_card'
    | 'my_listings_wait_listing_selection'
    | 'value_sector_focus_first_sector'
    | 'value_sector_wait_sector_selection'
    | 'value_sector_focus_first_product'
    | 'value_sector_wait_product_selection'
    | 'value_sector_explain_options'
    | 'value_sector_wait_option_selection'
    | 'recommendations_running'
    | 'completed';

export const RECOMMENDATION_TOUR_ORDER_BY_INITIAL_TAB: Record<
    RecommendationTourTab,
    RecommendationTourTab[]
> = {
    process: ['process', 'complexity', 'market'],
    complexity: ['complexity', 'process', 'market'],
    market: ['market', 'process', 'complexity'],
};

export const TOUR_TOTAL_STEPS = 23;

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
    SAVE_RECOMMENDATION: 22,
    TOUR_COMPLETE: 23,
} as const;

export const TOUR_GUIDE_STORAGE_KEYS = {
    HAS_COMPLETED_MAIN_FLOW: 'ecovalor_has_completed_main_tour',
    ATTEMPT_COUNT: 'ecovalor_tour_attempt_count',
    CURRENT_STEP: 'ecovalor_tour_current_step',
    LAST_ERROR: 'ecovalor_tour_last_error',
    FLOW_STEP: 'ecovalor_tour_flow_step',
    PENDING_RECOMMENDATION_TOUR: 'ecovalor_pending_recommendation_tour',
    RECOMMENDATION_TOUR_ORDER: 'ecovalor_recommendation_tour_order',
    RECOMMENDATION_TOUR_INDEX: 'ecovalor_recommendation_tour_index',
    RECOMMENDATION_PRODUCT_ID: 'ecovalor_recommendation_product_id',
    SELECTED_LISTING_ID: 'ecovalor_tour_selected_listing_id',
    SELECTED_VALUE_SECTOR_ID: 'ecovalor_tour_selected_value_sector_id',
    SELECTED_SUGGESTED_PRODUCT_ID: 'ecovalor_tour_selected_suggested_product_id',
    IS_ACTIVE: 'ecovalor_tour_is_active',
    STARTED_BY_USER: 'ecovalor_tour_started_by_user',
} as const;

export const TOUR_GUIDE_TEST_CONFIG = {
    ENABLED: true,
    DEBUG: true,
    MAX_ATTEMPTS: 20,
    ATTEMPT_TIMEOUT_MS: 250,
    MAX_ATTEMPT_TIMEOUT_MS: 650,
    BACKOFF_FACTOR: 1.15,
    ON_STEP_NOT_FOUND: 'skip' as 'skip' | 'finish',
    RESET_ON_RELOAD: false,
} as const;

export const TOUR_GUIDE_SELECTORS = {
    botButton: '[data-tour="bot-guide-button"]',
    recommendationsButton: '[data-tour="recommendations-button"]',
    firstListingCard: '[data-tour="first-listing-card"]',
    selectedListingCard: '[data-tour-selected="selected-listing-card"]',
    firstValueSector: '[data-tour="first-value-sector"]',
    firstValueSectorToggle: '[data-tour="first-value-sector-toggle"]',
    firstValueProduct: '[data-tour="first-value-product"]',
    processButton: '[data-tour="go-process-button"]',
    explanationButton: '[data-tour="go-explanation-button"]',
    complexityButton: '[data-tour="go-complexity-button"]',
    marketButton: '[data-tour="go-market-button"]',
    valueSectorActions: '[data-tour="value-sector-actions"]',
    recommendationsHeader: '[data-tour="recommendations-header"]',
    processProductCard: '[data-tour="process-product-card"]',
    processTimeline: '[data-tour="process-timeline"]',
    processSteps: '[data-tour="process-timeline"]',
    processSummaryCard: '[data-tour="process-summary-card"]',
    environmentalSummary: '[data-tour="process-summary-card"]',
    complexityOverview: '[data-tour="complexity-overview"]',
    complexityCriteria: '[data-tour="complexity-criteria"]',
    complexitySummary: '[data-tour="complexity-summary"]',
    complexityOutcome: '[data-tour="complexity-outcome"]',
    explanationStepSelector: '[data-tour="complexity-overview"]',
    explanationDetailCard: '[data-tour="complexity-criteria"]',
    explanationFactors: '[data-tour="complexity-summary"]',
    explanationBenefits: '[data-tour="complexity-outcome"]',
    explanationEnvironmentSummary: '[data-tour="explanation-environment-summary"]',
    marketFinishedProduct: '[data-tour="market-finished-product"]',
    marketBuyersGrid: '[data-tour="market-buyers-grid"]',
    marketScopeTabs: '[data-tour="market-scope-tabs"]',
    marketCosts: '[data-tour="market-costs"]',
    marketOpportunitySummary: '[data-tour="market-opportunity-summary"]',
    saveRecommendationButton: '[data-tour="save-recommendation-button"]',
} as const;
