import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DriveStep, driver } from 'driver.js';
import { APP_ROUTES } from '../constants/app.constants';
import {
  RECOMMENDATION_TOUR_ORDER_BY_INITIAL_TAB,
  RecommendationTourTab,
  TourFlowStep,
  TOUR_STEP_LABELS,
  TOUR_TOTAL_STEPS,
  TOUR_GUIDE_SELECTORS,
  TOUR_GUIDE_STORAGE_KEYS,
  TOUR_GUIDE_TEST_CONFIG
} from '../constants/tour-guide.constants';

interface GuidedFlowStep {
  readonly id: number;
  readonly label: number;
  readonly route: string;
  readonly selector: string;
  readonly title: string;
  readonly description: string;
  readonly requiresUserAction?: boolean;
  readonly actionHint?: string;
}

interface RecommendationsTourStep {
  readonly label: number;
  readonly selector: string;
  readonly title: string;
  readonly description: string;
}

const FLOW_STEPS: readonly GuidedFlowStep[] = [
  {
    id: 0,
    label: TOUR_STEP_LABELS.SELECT_LISTING,
    route: APP_ROUTES.myListings,
    selector: TOUR_GUIDE_SELECTORS.firstListingCard,
    title: 'Selecciona tu primera publicación',
    description: 'Comencemos aquí. Este es tu primer producto publicado.',
    requiresUserAction: true,
    actionHint: 'Selecciona una publicación para continuar.'
  },
  {
    id: 1,
    label: TOUR_STEP_LABELS.GO_VALUE_SECTOR,
    route: APP_ROUTES.myListings,
    selector: TOUR_GUIDE_SELECTORS.recommendationsButton,
    title: 'Ir a Sector de valor',
    description: 'Aquí pasarás a explorar oportunidades de valorización para tu residuo.',
    requiresUserAction: true,
    actionHint: 'Pulsa "Recomendaciones" para avanzar.'
  },
  {
    id: 2,
    label: TOUR_STEP_LABELS.SELECT_VALUE_SECTOR,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.firstValueSectorToggle,
    title: 'Selecciona el primer sector',
    description: 'Abre esta ruta para ver productos sugeridos según el residuo.',
    requiresUserAction: true,
    actionHint: 'Selecciona una ruta de valor para continuar.'
  },
  {
    id: 3,
    label: TOUR_STEP_LABELS.SELECT_VALUE_PRODUCT,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.firstValueProduct,
    title: 'Selecciona el primer producto sugerido',
    description: 'Elige este producto para activar el resumen y continuar.',
    requiresUserAction: true,
    actionHint: 'Selecciona un producto sugerido para continuar.'
  },
  {
    id: 4,
    label: TOUR_STEP_LABELS.EXPLAIN_PROCESS_BUTTON,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.processButton,
    title: 'Ver proceso',
    description: 'Esta opción te lleva al flujo operativo paso a paso de fabricación.'
  },
  {
    id: 5,
    label: TOUR_STEP_LABELS.EXPLAIN_EXPLANATION_BUTTON,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.complexityButton,
    title: 'Ver nivel de complejidad',
    description: 'Aquí comprenderás el esfuerzo técnico y operativo de esta ruta.'
  },
  {
    id: 6,
    label: TOUR_STEP_LABELS.EXPLAIN_MARKET_BUTTON,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.marketButton,
    title: 'Ver análisis de mercado',
    description: 'Esta opción muestra demanda potencial, márgenes y oportunidad comercial.'
  },
  {
    id: 7,
    label: TOUR_STEP_LABELS.CHOOSE_NEXT_ROUTE,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.valueSectorActions,
    title: 'Elige una ruta de continuación',
    description: 'Selecciona una de las opciones para continuar.',
    requiresUserAction: true,
    actionHint: 'Elige Ver proceso, Ver nivel de complejidad o Ver análisis de mercado.'
  }
] as const;

const PROCESS_TAB_STEPS: readonly RecommendationsTourStep[] = [
  {
    label: TOUR_STEP_LABELS.PROCESS_HEADER,
    selector: TOUR_GUIDE_SELECTORS.recommendationsHeader,
    title: 'Motor de recomendaciones',
    description: 'Esta vista centraliza las decisiones para fabricar a partir de tu residuo.'
  },
  {
    label: TOUR_STEP_LABELS.PROCESS_SUMMARY,
    selector: TOUR_GUIDE_SELECTORS.processProductCard,
    title: 'Producto recomendado',
    description: 'Aquí ves el producto objetivo, complejidad, tiempo y potencial comercial.'
  },
  {
    label: TOUR_STEP_LABELS.PROCESS_TECHNICAL,
    selector: TOUR_GUIDE_SELECTORS.processSummaryCard,
    title: 'Resumen técnico',
    description: 'Usa este panel para validar viabilidad y saltar a explicación o mercado.'
  },
  {
    label: TOUR_STEP_LABELS.PROCESS_STEPS,
    selector: TOUR_GUIDE_SELECTORS.processTimeline,
    title: 'Proceso de fabricación',
    description: 'Revisa cada etapa operativa para ejecutar una producción consistente.'
  }
];

const COMPLEXITY_TAB_STEPS: readonly RecommendationsTourStep[] = [
  {
    label: TOUR_STEP_LABELS.EXPLANATION_HEADER,
    selector: TOUR_GUIDE_SELECTORS.recommendationsHeader,
    title: 'Nivel de complejidad',
    description: 'Ahora estás en el tab explicativo del flujo seleccionado.'
  },
  {
    label: TOUR_STEP_LABELS.EXPLANATION_SELECTOR,
    selector: TOUR_GUIDE_SELECTORS.explanationStepSelector,
    title: 'Criterios de complejidad',
    description: 'Aquí se organiza la evaluación técnica del producto recomendado.'
  },
  {
    label: TOUR_STEP_LABELS.EXPLANATION_DETAIL,
    selector: TOUR_GUIDE_SELECTORS.explanationDetailCard,
    title: 'Detalle técnico',
    description: 'Aquí se explica el nivel técnico, tiempo y esfuerzo esperado.'
  },
  {
    label: TOUR_STEP_LABELS.ENVIRONMENTAL_FACTORS,
    selector: TOUR_GUIDE_SELECTORS.explanationFactors,
    title: 'Factores ambientales',
    description: 'Aquí ves factores a favor y en contra para la recomendación.'
  },
  {
    label: TOUR_STEP_LABELS.NATURE_BENEFITS,
    selector: TOUR_GUIDE_SELECTORS.explanationBenefits,
    title: 'Beneficios para la naturaleza',
    description: 'Este bloque resume beneficios ecosistémicos clave del aprovechamiento.'
  }
];

const MARKET_TAB_STEPS: readonly RecommendationsTourStep[] = [
  {
    label: TOUR_STEP_LABELS.MARKET_HEADER,
    selector: TOUR_GUIDE_SELECTORS.recommendationsHeader,
    title: 'Análisis de mercado',
    description: 'Esta pestaña muestra la viabilidad comercial de tu producto.'
  },
  {
    label: TOUR_STEP_LABELS.MARKET_PRODUCT,
    selector: TOUR_GUIDE_SELECTORS.marketFinishedProduct,
    title: 'Producto terminado',
    description: 'Visualiza propuesta de valor, formato sugerido y precio de referencia.'
  },
  {
    label: TOUR_STEP_LABELS.MARKET_BUYERS,
    selector: TOUR_GUIDE_SELECTORS.marketBuyersGrid,
    title: 'Compradores potenciales',
    description: 'Identifica segmentos, volúmenes y probabilidad de cierre.'
  },
  {
    label: TOUR_STEP_LABELS.MARKET_COSTS,
    selector: TOUR_GUIDE_SELECTORS.marketCosts,
    title: 'Costos y rentabilidad',
    description: 'Aquí analizas estructura de costos, margen y precio sugerido.'
  },
  {
    label: TOUR_STEP_LABELS.SAVE_RECOMMENDATION,
    selector: TOUR_GUIDE_SELECTORS.saveRecommendationButton,
    title: 'Guardar recomendación',
    description: 'Guarda esta recomendación para revisarla luego y compararla con otras rutas.'
  }
];

@Injectable({ providedIn: 'root' })
export class TourGuideService {
  private readonly router = inject(Router);
  private activeDriver: ReturnType<typeof driver> | null = null;
  private isInitialized = false;
  private isRunningStepResolver = false;
  private recommendationsTourRunning = false;
  private readonly stepFlowMap: Record<number, TourFlowStep> = {
    0: 'my_listings_focus_first_card',
    1: 'my_listings_wait_listing_selection',
    2: 'value_sector_focus_first_sector',
    3: 'value_sector_focus_first_product',
    4: 'value_sector_explain_options',
    5: 'value_sector_explain_options',
    6: 'value_sector_explain_options',
    7: 'value_sector_wait_option_selection'
  };

  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!TOUR_GUIDE_TEST_CONFIG.ENABLED) return;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (!this.isTourSessionActive()) return;
      this.logDebug('NavigationEnd detectado; reintentando montaje de paso.');
      void this.runCurrentStepIfPending('navigation');
    });
  }

  launchFromBot(): void {
    if (!TOUR_GUIDE_TEST_CONFIG.ENABLED) return;
    this.init();

    const currentPath = this.getCurrentPath();
    const startStep = currentPath.startsWith(APP_ROUTES.recommendations)
      ? 7
      : currentPath.startsWith(APP_ROUTES.valueSector)
        ? 2
        : 0;

    this.setCurrentStep(startStep);
    this.setCompleted(false);
    this.setTourActive(true);
    this.setStartedByUser(true);
    this.setPendingRecommendationTour(false);
    this.removeRecommendationTourState();
    this.removeSelectionState();
    this.setAttemptCount(0);
    this.setFlowStep(this.stepFlowMap[startStep] ?? 'idle');
    this.recommendationsTourRunning = false;
    this.clearLastError();
    this.logDebug(`Tour lanzado desde bot en ruta ${currentPath}. Paso inicial: ${startStep}.`);
    void this.runCurrentStepIfPending('launch-from-bot');
  }

  notifyListingSelected(listingId: string): void {
    if (!this.isTourSessionActive()) return;
    this.setSelectedListingId(listingId);
    const flow = this.getFlowStep();
    if (flow === 'my_listings_focus_first_card' || flow === 'my_listings_wait_listing_selection') {
      this.logDebug(`Listing seleccionado (${listingId}). Avanzando flujo hacia Value Sector.`);
      this.setCurrentStep(1);
      this.setFlowStep('my_listings_wait_listing_selection');
      void this.runCurrentStepIfPending('listing-selected');
    }
  }

  notifyValueSectorSelected(routeId: string): void {
    if (!this.isTourSessionActive()) return;
    this.setSelectedValueSectorId(routeId);
    const flow = this.getFlowStep();
    if (flow === 'value_sector_focus_first_sector' || flow === 'value_sector_wait_sector_selection') {
      this.logDebug(`Sector seleccionado (${routeId}). Avanzando a selección de producto.`);
      this.setCurrentStep(3);
      this.setFlowStep('value_sector_focus_first_product');
      this.destroyDriver();
      void this.runCurrentStepIfPending('value-sector-selected');
    }
  }

  notifyValueProductSelected(routeId: string, productId: string): void {
    if (!this.isTourSessionActive()) return;
    this.setSelectedValueSectorId(routeId);
    this.setSelectedSuggestedProductId(productId);
    const flow = this.getFlowStep();
    if (flow === 'value_sector_focus_first_product' || flow === 'value_sector_wait_product_selection') {
      this.logDebug(`Producto seleccionado (${productId}) en ruta ${routeId}. Habilitando opciones de continuación.`);
      this.setCurrentStep(4);
      this.setFlowStep('value_sector_explain_options');
      this.destroyDriver();
      void this.runCurrentStepIfPending('value-product-selected');
    }
  }

  notifyRecommendationsClicked(listingId: string): void {
    if (!this.isTourSessionActive()) return;
    this.setSelectedListingId(listingId);
    const flow = this.getFlowStep();
    if (flow !== 'my_listings_wait_listing_selection') {
      return;
    }
    this.logDebug(`Click en recomendaciones con listing ${listingId}. Navegando a Sector de valor.`);
    this.setCurrentStep(2);
    this.setFlowStep('value_sector_focus_first_sector');
    this.destroyDriver();
  }

  notifyRecommendationRouteChosen(tab: RecommendationTourTab, productId: string): void {
    if (!this.isTourSessionActive()) return;
    this.logDebug(`Ruta de recomendación elegida por usuario: ${tab}, producto ${productId}.`);
    const order = RECOMMENDATION_TOUR_ORDER_BY_INITIAL_TAB[tab];
    this.setRecommendationProductId(productId);
    this.setRecommendationTourOrder(order);
    this.setRecommendationTourIndex(0);
    this.setPendingRecommendationTour(true);
    this.setFlowStep('recommendations_running');
    this.destroyDriver();
  }

  private async runCurrentStepIfPending(origin: string): Promise<void> {
    if (!this.isTourSessionActive()) return;
    if (this.isRunningStepResolver) {
      this.logDebug(`Se omite runCurrentStepIfPending (${origin}) porque ya hay una resolución en curso.`);
      return;
    }

    this.isRunningStepResolver = true;
    try {
    this.syncStateFromRoute();
    if (this.isPendingRecommendationTour()) {
      this.setFlowStep('recommendations_running');
      if (this.getCurrentPath().startsWith(APP_ROUTES.recommendations)) {
        void this.runRecommendationsFlow();
      }
      return;
    }

    if (this.hasCompleted()) return;

    const stepIndex = this.getCurrentStep();
    const step = FLOW_STEPS[stepIndex];
    if (!step) {
      this.finishFlow();
      return;
    }

    this.setFlowStep(this.stepFlowMap[stepIndex] ?? 'idle');

    if (!this.getCurrentPath().startsWith(step.route)) {
      await this.navigateToRoute(step.route);
      return;
    }

    if (step.route === APP_ROUTES.valueSector) {
      const ready = await this.waitForValueSectorReady();
      if (!ready) {
        this.stopTourWithMessage('No se encontraron rutas de valor disponibles para continuar el tour.');
        return;
      }
    }

    await this.mountStep(step);
    } finally {
      this.isRunningStepResolver = false;
    }
  }

  private syncStateFromRoute(): void {
    const parsed = this.router.parseUrl(this.router.url);
    const listingId = parsed.queryParams['listing'];
    if (typeof listingId === 'string' && listingId.trim()) {
      this.setSelectedListingId(listingId);
    }
    const pathProduct = this.getRecommendationProductId();
    if (pathProduct) {
      this.setSelectedSuggestedProductId(pathProduct);
    }
  }

  private async mountStep(step: GuidedFlowStep): Promise<void> {
    const element = await this.waitForElement(step.selector, TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS, `flow-step-${step.id}`);
    if (!element) {
      this.handleMissingFlowStep(step);
      return;
    }

    this.destroyDriver();
    this.prepareElementForFocus(element);

    const isChoiceStep = step.id === FLOW_STEPS.length - 1;
    const isActionStep = Boolean(step.requiresUserAction);
    const tourStep: DriveStep = {
      element,
      popover: {
        title: this.getStepTitle(step.label, step.title),
        description: isActionStep && step.actionHint ? `${step.description}<br/><br/><strong>${step.actionHint}</strong>` : step.description,
        side: 'bottom',
        align: 'start',
        showButtons: isActionStep ? ['close'] : ['close', 'next'],
        nextBtnText: isChoiceStep ? 'Entendido' : 'Siguiente',
        prevBtnText: 'Atrás',
        onNextClick: () => void this.handleNext(step.id),
        onCloseClick: () => this.finishFlow()
      }
    };

    this.activeDriver = driver({
      animate: true,
      allowClose: true,
      showProgress: false,
      smoothScroll: true,
      stagePadding: 22,
      stageRadius: 22,
      popoverClass: 'ecovalor-driver-popover',
      steps: [tourStep]
    });

    this.activeDriver.drive();
  }

  private async handleNext(currentStep: number): Promise<void> {
    const current = FLOW_STEPS[currentStep];
    if (!current) return;
    if (!this.canAdvanceFromStep(currentStep)) {
      this.logDebug(`Paso ${currentStep} bloqueado: acción obligatoria pendiente.`);
      return;
    }
    this.destroyDriver();

    const nextStep = currentStep + 1;
    this.setCurrentStep(nextStep);
    this.setFlowStep(this.stepFlowMap[nextStep] ?? 'idle');

    if (currentStep === 1) {
      const listingId = this.getSelectedListingId();
      if (!listingId) {
        this.logDebug('No hay listing seleccionado para navegar a value-sector.');
        this.setCurrentStep(1);
        this.setFlowStep('my_listings_wait_listing_selection');
        await this.runCurrentStepIfPending('missing-listing-before-value-sector');
        return;
      }
      this.setFlowStep('value_sector_focus_first_sector');
      await this.navigateToRoute(`${APP_ROUTES.valueSector}?listing=${encodeURIComponent(listingId)}`);
      return;
    }

    if (currentStep === FLOW_STEPS.length - 1) {
      this.setPendingRecommendationTour(true);
      this.setFlowStep('value_sector_wait_option_selection');
      this.logDebug('Tour marcado como pendiente de recomendaciones. Esperando selección de botón del usuario.');
      return;
    }

    await this.runCurrentStepIfPending('next-flow-step');
  }
  private canAdvanceFromStep(stepId: number): boolean {
    if (stepId === 0 || stepId === 1) {
      return Boolean(this.getSelectedListingId());
    }
    if (stepId === 2) {
      return Boolean(this.getSelectedValueSectorId());
    }
    if (stepId === 3) {
      return Boolean(this.getSelectedSuggestedProductId());
    }
    return true;
  }

  private async runRecommendationsFlow(): Promise<void> {
    if (!this.isTourSessionActive()) return;
    if (this.recommendationsTourRunning) return;

    this.initializeRecommendationTourStateIfNeeded();

    const order = this.getRecommendationTourOrder();
    const index = this.getRecommendationTourIndex();
    const productId = this.getRecommendationProductId();

    if (!productId || !order.length || index >= order.length) {
      this.finishFlow();
      return;
    }

    const targetTab = order[index];
    const currentTab = this.getRecommendationsTab();
    const ready = await this.waitForRecommendationsReady(targetTab);
    if (!ready) {
      this.stopTourWithMessage('No se pudo cargar la recomendación para continuar el recorrido.');
      return;
    }

    if (currentTab !== targetTab) {
      const listingId = this.getSelectedListingId();
      await this.router.navigate(['/app/recommendations', productId], {
        queryParams: {
          tab: targetTab,
          listing: listingId ?? undefined
        }
      });
      return;
    }

    this.recommendationsTourRunning = true;
    const steps = this.getRecommendationsStepsByTab(targetTab);
    void this.mountRecommendationsStep(targetTab, steps, 0);
  }

  private async mountRecommendationsStep(
    tab: RecommendationTourTab,
    steps: readonly RecommendationsTourStep[],
    index: number
  ): Promise<void> {
    if (!this.isTourSessionActive()) return;
    if (index >= steps.length) {
      this.recommendationsTourRunning = false;
      if (this.isLastRecommendationTab()) {
        void this.mountTourCompletionStep();
      } else {
        this.advanceRecommendationTab();
      }
      return;
    }

    const step = steps[index];
    const element = await this.waitForElement(
      step.selector,
      TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS,
      `recommendations-${tab}-${index}`
    );
    if (!element) {
      this.logDebug(`No se encontró selector ${step.selector} en tab ${tab}. Se salta al siguiente paso.`);
      void this.mountRecommendationsStep(tab, steps, index + 1);
      return;
    }

    this.destroyDriver();
    this.prepareElementForFocus(element);

    const isLastStepInTab = index === steps.length - 1;
    const isLastOverall = isLastStepInTab && this.isLastRecommendationTab();
    const nextBtnText = isLastOverall
      ? 'Finalizar'
      : isLastStepInTab
        ? 'Siguiente sección'
        : 'Siguiente';

    const tourStep: DriveStep = {
      element,
      popover: {
        title: this.getStepTitle(step.label, step.title),
        description: step.description,
        side: 'bottom',
        align: 'start',
        showButtons: ['close', 'next'],
        nextBtnText,
        prevBtnText: 'Atrás',
        onNextClick: () => {
          this.destroyDriver();
          if (isLastStepInTab) {
            this.recommendationsTourRunning = false;
            if (this.isLastRecommendationTab()) {
              void this.mountTourCompletionStep();
            } else {
              this.advanceRecommendationTab();
            }
            return;
          }
          void this.mountRecommendationsStep(tab, steps, index + 1);
        },
        onCloseClick: () => {
          this.recommendationsTourRunning = false;
          this.finishFlow();
        }
      }
    };

    this.activeDriver = driver({
      animate: true,
      allowClose: true,
      showProgress: false,
      smoothScroll: true,
      stagePadding: 22,
      stageRadius: 22,
      popoverClass: 'ecovalor-driver-popover',
      steps: [tourStep]
    });

    this.activeDriver.drive();
  }

  private advanceRecommendationTab(): void {
    if (!this.isTourSessionActive()) return;
    const order = this.getRecommendationTourOrder();
    const nextIndex = this.getRecommendationTourIndex() + 1;
    this.setRecommendationTourIndex(nextIndex);

    if (nextIndex >= order.length) {
      this.finishFlow();
      return;
    }

    const productId = this.getRecommendationProductId();
    if (!productId) {
      this.finishFlow();
      return;
    }

    const nextTab = order[nextIndex];
    const listingId = this.getSelectedListingId();
    void this.router.navigate(['/app/recommendations', productId], {
      queryParams: {
        tab: nextTab,
        listing: listingId ?? undefined
      }
    });
  }

  private initializeRecommendationTourStateIfNeeded(): void {
    if (this.getRecommendationTourOrder().length) return;

    const initialTab = this.getRecommendationsTab();
    const order = RECOMMENDATION_TOUR_ORDER_BY_INITIAL_TAB[initialTab];
    const productId = this.getRecommendationProductId();

    this.setRecommendationTourOrder(order);
    this.setRecommendationTourIndex(0);
    if (productId) {
      this.setRecommendationProductId(productId);
    }
  }

  private getRecommendationsStepsByTab(tab: RecommendationTourTab): readonly RecommendationsTourStep[] {
    if (tab === 'complexity') return COMPLEXITY_TAB_STEPS;
    if (tab === 'market') return MARKET_TAB_STEPS;
    return PROCESS_TAB_STEPS;
  }

  private async waitForRecommendationsReady(tab: RecommendationTourTab): Promise<boolean> {
    const loadingGone = await this.waitUntil(
      () => !document.querySelector('[data-tour="recommendations-loading"]'),
      12000,
      180
    );
    if (!loadingGone) {
      return false;
    }

    const hasError = document.querySelector('[data-tour="recommendations-error"]');
    if (hasError) {
      return false;
    }

    const readySelector =
      tab === 'market'
        ? TOUR_GUIDE_SELECTORS.marketBuyersGrid
        : tab === 'complexity'
          ? TOUR_GUIDE_SELECTORS.complexityOverview
          : TOUR_GUIDE_SELECTORS.processProductCard;

    const element = await this.waitForElement(
      readySelector,
      TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS,
      `recommendations-ready-${tab}`
    );

    return Boolean(element);
  }

  private async waitForValueSectorReady(): Promise<boolean> {
    const loadingGone = await this.waitUntil(
      () => !document.querySelector('[data-tour="value-sector-loading"]'),
      12000,
      180
    );

    if (!loadingGone) {
      return false;
    }

    const hasTerminalState = document.querySelector('[data-tour="value-sector-empty"], [data-tour="value-sector-error"], [data-tour="value-sector-missing-listing"]');
    if (hasTerminalState) {
      return false;
    }

    const firstToggle = await this.waitForElement(
      TOUR_GUIDE_SELECTORS.firstValueSectorToggle,
      TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS,
      'value-sector-ready'
    );

    return Boolean(firstToggle);
  }

  private getRecommendationsTab(): RecommendationTourTab {
    const rawTab = this.router.parseUrl(this.router.url).queryParams['tab'];
    if (rawTab === 'complexity' || rawTab === 'market' || rawTab === 'process') {
      return rawTab;
    }
    if (rawTab === 'explanation') {
      return 'complexity';
    }
    return 'process';
  }

  private isLastRecommendationTab(): boolean {
    const order = this.getRecommendationTourOrder();
    const index = this.getRecommendationTourIndex();
    return index >= order.length - 1;
  }

  private getRecommendationProductId(): string | null {
    const stored = this.getValue(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_PRODUCT_ID);
    if (stored) return stored;

    const match = this.getCurrentPath().match(/^\/app\/recommendations\/([^/?#]+)/);
    const productId = match?.[1] ?? null;
    if (productId) {
      this.setRecommendationProductId(productId);
    }
    return productId;
  }

  private setRecommendationProductId(productId: string): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_PRODUCT_ID, productId);
  }

  private getRecommendationTourOrder(): RecommendationTourTab[] {
    const raw = this.getValue(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_TOUR_ORDER);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (tab): tab is RecommendationTourTab =>
          tab === 'process' || tab === 'complexity' || tab === 'market'
      );
    } catch {
      return [];
    }
  }

  private setRecommendationTourOrder(order: readonly RecommendationTourTab[]): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_TOUR_ORDER, JSON.stringify(order));
  }

  private getRecommendationTourIndex(): number {
    const raw = this.getValue(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_TOUR_INDEX);
    const parsed = Number(raw ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private setRecommendationTourIndex(index: number): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_TOUR_INDEX, String(index));
  }

  private removeRecommendationTourState(): void {
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_TOUR_ORDER);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_TOUR_INDEX);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.RECOMMENDATION_PRODUCT_ID);
  }

  private getSelectedListingId(): string | null {
    return this.getValue(TOUR_GUIDE_STORAGE_KEYS.SELECTED_LISTING_ID);
  }

  private setSelectedListingId(listingId: string): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.SELECTED_LISTING_ID, listingId);
  }

  private getSelectedValueSectorId(): string | null {
    return this.getValue(TOUR_GUIDE_STORAGE_KEYS.SELECTED_VALUE_SECTOR_ID);
  }

  private setSelectedValueSectorId(routeId: string): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.SELECTED_VALUE_SECTOR_ID, routeId);
  }

  private getSelectedSuggestedProductId(): string | null {
    return this.getValue(TOUR_GUIDE_STORAGE_KEYS.SELECTED_SUGGESTED_PRODUCT_ID);
  }

  private setSelectedSuggestedProductId(productId: string): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.SELECTED_SUGGESTED_PRODUCT_ID, productId);
  }

  private removeSelectionState(): void {
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.SELECTED_LISTING_ID);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.SELECTED_VALUE_SECTOR_ID);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.SELECTED_SUGGESTED_PRODUCT_ID);
  }

  private isTourSessionActive(): boolean {
    return this.getValue(TOUR_GUIDE_STORAGE_KEYS.IS_ACTIVE) === 'true' &&
      this.getValue(TOUR_GUIDE_STORAGE_KEYS.STARTED_BY_USER) === 'true';
  }

  private setTourActive(value: boolean): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.IS_ACTIVE, String(value));
  }

  private setStartedByUser(value: boolean): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.STARTED_BY_USER, String(value));
  }

  private async mountTourCompletionStep(): Promise<void> {
    const element = await this.waitForElement(
      TOUR_GUIDE_SELECTORS.recommendationsHeader,
      TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS,
      'tour-complete'
    );

    if (!element) {
      this.finishFlow();
      return;
    }

    this.destroyDriver();
    this.prepareElementForFocus(element);

    const completionStep: DriveStep = {
      element,
      popover: {
        title: this.getStepTitle(TOUR_STEP_LABELS.TOUR_COMPLETE, 'Tour completado'),
        description:
          'Excelente. Ya recorriste proceso, explicación y análisis de mercado para tomar decisiones informadas.',
        side: 'bottom',
        align: 'start',
        showButtons: ['close', 'next'],
        nextBtnText: 'Finalizar',
        prevBtnText: 'Atrás',
        onNextClick: () => {
          this.destroyDriver();
          this.finishFlow();
        },
        onCloseClick: () => {
          this.destroyDriver();
          this.finishFlow();
        }
      }
    };

    this.activeDriver = driver({
      animate: true,
      allowClose: true,
      showProgress: false,
      smoothScroll: true,
      stagePadding: 22,
      stageRadius: 22,
      popoverClass: 'ecovalor-driver-popover',
      steps: [completionStep]
    });

    this.activeDriver.drive();
  }

  private finishFlow(): void {
    this.setCompleted(true);
    this.setTourActive(false);
    this.setStartedByUser(false);
    this.setPendingRecommendationTour(false);
    this.setFlowStep('completed');
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.CURRENT_STEP);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.ATTEMPT_COUNT);
    this.recommendationsTourRunning = false;
    this.removeRecommendationTourState();
    this.removeSelectionState();
    this.destroyDriver();
  }

  private async waitForElement(selector: string, maxAttempts: number, context: string): Promise<HTMLElement | null> {
    let attempts = 0;
    let timeoutMs: number = TOUR_GUIDE_TEST_CONFIG.ATTEMPT_TIMEOUT_MS;

    while (attempts < maxAttempts) {
      const directElement = document.querySelector(selector);
      if (directElement instanceof HTMLElement) {
        this.logDebug(`[${context}] selector encontrado inmediatamente: ${selector}`);
        this.setAttemptCount(0);
        return directElement;
      }

      attempts += 1;
      this.setAttemptCount(attempts);
      this.logDebug(`[${context}] intento ${attempts}/${maxAttempts} para selector: ${selector}`);

      const observed = await this.observeSelector(selector, timeoutMs);
      if (observed) {
        this.logDebug(`[${context}] selector encontrado por MutationObserver: ${selector}`);
        this.setAttemptCount(0);
        return observed;
      }

      timeoutMs = Math.min(
        Math.round(timeoutMs * TOUR_GUIDE_TEST_CONFIG.BACKOFF_FACTOR),
        TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPT_TIMEOUT_MS
      );
    }

    const errorMessage = `[${context}] No se encontró selector "${selector}" tras ${maxAttempts} intentos.`;
    this.setLastError(errorMessage);
    console.warn(errorMessage);
    return null;
  }

  private async waitUntil(
    predicate: () => boolean,
    timeoutMs = 10000,
    intervalMs = 150
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (!this.isTourSessionActive()) {
        return false;
      }
      if (predicate()) {
        return true;
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, intervalMs));
    }
    return false;
  }

  private async observeSelector(selector: string, timeoutMs: number): Promise<HTMLElement | null> {
    return new Promise<HTMLElement | null>((resolve) => {
      let resolved = false;
      const resolveOnce = (element: HTMLElement | null): void => {
        if (resolved) return;
        resolved = true;
        observer.disconnect();
        window.clearTimeout(timer);
        resolve(element);
      };

      const immediate = document.querySelector(selector);
      if (immediate instanceof HTMLElement) {
        resolve(immediate);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          resolveOnce(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });

      const timer = window.setTimeout(() => resolveOnce(null), timeoutMs);
    });
  }

  private async navigateToRoute(route: string): Promise<void> {
    this.logDebug(`Navegando a ${route}`);
    await this.router.navigateByUrl(route);
    await this.waitForNavigationEnd();
  }

  private async waitForNavigationEnd(timeoutMs = 2000): Promise<void> {
    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => {
        subscription.unsubscribe();
        this.logDebug('Timeout esperando NavigationEnd; se continúa con fallback.');
        resolve();
      }, timeoutMs);

      const subscription = this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          window.clearTimeout(timer);
          subscription.unsubscribe();
          resolve();
        });
    });
  }

  private handleMissingFlowStep(step: GuidedFlowStep): void {
    const reason = `No se pudo montar el step ${step.id} (${step.selector}).`;
    this.setLastError(reason);
    this.logDebug(reason);

    if (TOUR_GUIDE_TEST_CONFIG.ON_STEP_NOT_FOUND === 'skip') {
      const nextStep = step.id + 1;
      this.setCurrentStep(nextStep);
      this.setFlowStep(this.stepFlowMap[nextStep] ?? 'idle');
      void this.runCurrentStepIfPending('missing-step-skip');
      return;
    }

    this.finishFlow();
  }

  private stopTourWithMessage(message: string): void {
    this.setLastError(message);
    console.warn(`[TourGuide] ${message}`);
    this.finishFlow();
  }

  private prepareElementForFocus(element: HTMLElement): void {
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    const hasTabIndex = element.hasAttribute('tabindex');
    if (!hasTabIndex) {
      element.setAttribute('tabindex', '-1');
    }
    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  }

  private destroyDriver(): void {
    this.activeDriver?.destroy();
    this.activeDriver = null;
  }

  private getCurrentPath(): string {
    return this.router.url.split('?')[0]?.split('#')[0] ?? '';
  }

  private getCurrentStep(): number {
    const raw = this.getValue(TOUR_GUIDE_STORAGE_KEYS.CURRENT_STEP);
    const parsed = Number(raw ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private setCurrentStep(step: number): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.CURRENT_STEP, String(step));
  }

  private hasCompleted(): boolean {
    return this.getValue(TOUR_GUIDE_STORAGE_KEYS.HAS_COMPLETED_MAIN_FLOW) === 'true';
  }

  private setCompleted(value: boolean): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.HAS_COMPLETED_MAIN_FLOW, String(value));
  }

  private isPendingRecommendationTour(): boolean {
    return this.getValue(TOUR_GUIDE_STORAGE_KEYS.PENDING_RECOMMENDATION_TOUR) === 'true';
  }

  private setPendingRecommendationTour(value: boolean): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.PENDING_RECOMMENDATION_TOUR, String(value));
  }

  private setAttemptCount(value: number): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.ATTEMPT_COUNT, String(value));
  }

  private getFlowStep(): TourFlowStep {
    const raw = this.getValue(TOUR_GUIDE_STORAGE_KEYS.FLOW_STEP);
    if (
      raw === 'idle' ||
      raw === 'my_listings_focus_first_card' ||
      raw === 'my_listings_wait_listing_selection' ||
      raw === 'value_sector_focus_first_sector' ||
      raw === 'value_sector_wait_sector_selection' ||
      raw === 'value_sector_focus_first_product' ||
      raw === 'value_sector_wait_product_selection' ||
      raw === 'value_sector_explain_options' ||
      raw === 'value_sector_wait_option_selection' ||
      raw === 'recommendations_running' ||
      raw === 'completed'
    ) {
      return raw;
    }
    return 'idle';
  }

  private setFlowStep(step: TourFlowStep): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.FLOW_STEP, step);
  }

  private setLastError(message: string): void {
    this.setValue(TOUR_GUIDE_STORAGE_KEYS.LAST_ERROR, message);
  }

  private clearLastError(): void {
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.LAST_ERROR);
  }

  private logDebug(message: string): void {
    if (!TOUR_GUIDE_TEST_CONFIG.DEBUG) return;
    console.log(`[TourGuide] ${message}`);
  }

  private getValue(key: string): string | null {
    return localStorage.getItem(key);
  }

  private setValue(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private removeKey(key: string): void {
    localStorage.removeItem(key);
  }

  private getStepTitle(label: number, title: string): string {
    return `Paso ${label} de ${TOUR_TOTAL_STEPS}: ${title}`;
  }
}
