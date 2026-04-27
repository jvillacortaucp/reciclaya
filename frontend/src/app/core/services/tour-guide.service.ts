import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DriveStep, driver } from 'driver.js';
import { APP_ROUTES } from '../constants/app.constants';
import {
  RECOMMENDATION_TOUR_ORDER_BY_INITIAL_TAB,
  RecommendationTourTab,
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
  readonly onAdvance?: () => void;
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
    description: 'Comencemos aquí. Este es tu primer producto publicado.'
  },
  {
    id: 1,
    label: TOUR_STEP_LABELS.GO_VALUE_SECTOR,
    route: APP_ROUTES.myListings,
    selector: TOUR_GUIDE_SELECTORS.recommendationsButton,
    title: 'Ir a Sector de valor',
    description: 'Aquí pasarás a explorar oportunidades de valorización para tu residuo.'
  },
  {
    id: 2,
    label: TOUR_STEP_LABELS.SELECT_VALUE_SECTOR,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.firstValueSectorToggle,
    title: 'Selecciona el primer sector',
    description: 'Abre esta ruta para ver productos sugeridos según el residuo.',
    onAdvance: () => {
      const toggle = document.querySelector(TOUR_GUIDE_SELECTORS.firstValueSectorToggle);
      if (toggle instanceof HTMLElement) toggle.click();
    }
  },
  {
    id: 3,
    label: TOUR_STEP_LABELS.SELECT_VALUE_PRODUCT,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.firstValueProduct,
    title: 'Selecciona el primer producto sugerido',
    description: 'Elige este producto para activar el resumen y continuar.',
    onAdvance: () => {
      const product = document.querySelector(TOUR_GUIDE_SELECTORS.firstValueProduct);
      if (product instanceof HTMLElement) product.click();
    }
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
    selector: TOUR_GUIDE_SELECTORS.explanationButton,
    title: 'Ver explicación',
    description: 'Aquí comprenderás el porqué técnico y ambiental de cada etapa.'
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
    description: 'Selecciona una de las opciones para continuar.'
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

const EXPLANATION_TAB_STEPS: readonly RecommendationsTourStep[] = [
  {
    label: TOUR_STEP_LABELS.EXPLANATION_HEADER,
    selector: TOUR_GUIDE_SELECTORS.recommendationsHeader,
    title: 'Explicación del proceso',
    description: 'Ahora estás en el tab explicativo del flujo seleccionado.'
  },
  {
    label: TOUR_STEP_LABELS.EXPLANATION_SELECTOR,
    selector: TOUR_GUIDE_SELECTORS.explanationStepSelector,
    title: 'Selector de etapas',
    description: 'Puedes cambiar de etapa para entender cada transformación.'
  },
  {
    label: TOUR_STEP_LABELS.EXPLANATION_DETAIL,
    selector: TOUR_GUIDE_SELECTORS.explanationDetailCard,
    title: 'Detalle de la etapa',
    description: 'Aquí se explica qué ocurre, su impacto y recomendaciones prácticas.'
  },
  {
    label: TOUR_STEP_LABELS.ENVIRONMENTAL_FACTORS,
    selector: TOUR_GUIDE_SELECTORS.explanationFactors,
    title: 'Factores ambientales',
    description: 'Aquí ves factores a favor y en contra para la etapa seleccionada.'
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
  }
];

@Injectable({ providedIn: 'root' })
export class TourGuideService {
  private readonly router = inject(Router);
  private activeDriver: ReturnType<typeof driver> | null = null;
  private isInitialized = false;
  private recommendationsTourRunning = false;

  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!TOUR_GUIDE_TEST_CONFIG.ENABLED) return;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.runCurrentStepIfPending();
    });

    this.runCurrentStepIfPending();
  }

  launchFromBot(): void {
    if (!TOUR_GUIDE_TEST_CONFIG.ENABLED) return;

    const currentPath = this.getCurrentPath();
    const startStep = currentPath.startsWith(APP_ROUTES.valueSector) ? 2 : 0;

    this.setCurrentStep(startStep);
    this.setCompleted(false);
    this.setPendingRecommendationTour(false);
    this.removeRecommendationTourState();
    this.setAttemptCount(0);
    this.recommendationsTourRunning = false;
    this.runCurrentStepIfPending();
  }

  private runCurrentStepIfPending(): void {
    if (this.isPendingRecommendationTour()) {
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

    if (!this.getCurrentPath().startsWith(step.route)) {
      void this.router.navigateByUrl(step.route);
      return;
    }

    void this.mountStep(step);
  }

  private async mountStep(step: GuidedFlowStep): Promise<void> {
    const element = await this.waitForElement(step.selector, TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS);
    if (!element) return;

    this.destroyDriver();

    const isChoiceStep = step.id === FLOW_STEPS.length - 1;
    const tourStep: DriveStep = {
      element,
      popover: {
        title: this.getStepTitle(step.label, step.title),
        description: step.description,
        side: 'bottom',
        align: 'start',
        showButtons: ['close', 'next'],
        nextBtnText: isChoiceStep ? 'Entendido' : 'Siguiente',
        prevBtnText: 'Atrás',
        onNextClick: () => this.handleNext(step.id),
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

  private handleNext(currentStep: number): void {
    FLOW_STEPS[currentStep]?.onAdvance?.();
    this.destroyDriver();

    const nextStep = currentStep + 1;
    this.setCurrentStep(nextStep);

    if (currentStep === 1) {
      void this.router.navigateByUrl(APP_ROUTES.valueSector);
      return;
    }

    if (currentStep === FLOW_STEPS.length - 1) {
      this.setPendingRecommendationTour(true);
      return;
    }

    this.runCurrentStepIfPending();
  }

  private async runRecommendationsFlow(): Promise<void> {
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

    if (currentTab !== targetTab) {
      void this.router.navigate(['/app/recommendations', productId], {
        queryParams: { tab: targetTab }
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
    const element = await this.waitForElement(step.selector, TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS);
    if (!element) {
      void this.mountRecommendationsStep(tab, steps, index + 1);
      return;
    }

    this.destroyDriver();

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
    void this.router.navigate(['/app/recommendations', productId], {
      queryParams: { tab: nextTab }
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
    if (tab === 'explanation') return EXPLANATION_TAB_STEPS;
    if (tab === 'market') return MARKET_TAB_STEPS;
    return PROCESS_TAB_STEPS;
  }

  private getRecommendationsTab(): RecommendationTourTab {
    const rawTab = this.router.parseUrl(this.router.url).queryParams['tab'];
    if (rawTab === 'explanation' || rawTab === 'market' || rawTab === 'process') {
      return rawTab;
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
          tab === 'process' || tab === 'explanation' || tab === 'market'
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

  private async mountTourCompletionStep(): Promise<void> {
    const element = await this.waitForElement(
      TOUR_GUIDE_SELECTORS.recommendationsHeader,
      TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS
    );

    if (!element) {
      this.finishFlow();
      return;
    }

    this.destroyDriver();

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
    this.setPendingRecommendationTour(false);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.CURRENT_STEP);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.ATTEMPT_COUNT);
    this.removeRecommendationTourState();
    this.destroyDriver();
  }

  private async waitForElement(selector: string, maxAttempts: number): Promise<HTMLElement | null> {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) {
        this.setAttemptCount(0);
        return element;
      }
      attempts += 1;
      this.setAttemptCount(attempts);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
    }
    return null;
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
