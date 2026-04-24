import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { driver, DriveStep } from 'driver.js';
import { APP_ROUTES } from '../constants/app.constants';
import {
  TOUR_GUIDE_SELECTORS,
  TOUR_GUIDE_STORAGE_KEYS,
  TOUR_GUIDE_TEST_CONFIG
} from '../constants/tour-guide.constants';

interface GuidedFlowStep {
  readonly id: number;
  readonly route: string;
  readonly selector: string;
  readonly title: string;
  readonly description: string;
  readonly onAdvance?: () => void;
}

const FLOW_STEPS: readonly GuidedFlowStep[] = [
  {
    id: 0,
    route: APP_ROUTES.myListings,
    selector: TOUR_GUIDE_SELECTORS.firstListingCard,
    title: 'Paso 1: Selecciona tu primera publicación',
    description: 'Comencemos aquí. Este es tu primer producto publicado.'
  },
  {
    id: 1,
    route: APP_ROUTES.myListings,
    selector: TOUR_GUIDE_SELECTORS.recommendationsButton,
    title: 'Paso 2: Ir a Sector de valor',
    description: 'Aquí pasarás a explorar oportunidades de valorización para tu residuo.'
  },
  {
    id: 2,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.firstValueSectorToggle,
    title: 'Paso 3: Selecciona el primer sector',
    description: 'Abre esta ruta para ver productos sugeridos según el residuo.',
    onAdvance: () => {
      const toggle = document.querySelector(TOUR_GUIDE_SELECTORS.firstValueSectorToggle);
      if (toggle instanceof HTMLElement) toggle.click();
    }
  },
  {
    id: 3,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.firstValueProduct,
    title: 'Paso 4: Selecciona el primer producto sugerido',
    description: 'Elige este producto para activar el resumen y continuar.',
    onAdvance: () => {
      const product = document.querySelector(TOUR_GUIDE_SELECTORS.firstValueProduct);
      if (product instanceof HTMLElement) product.click();
    }
  },
  {
    id: 4,
    route: APP_ROUTES.valueSector,
    selector: TOUR_GUIDE_SELECTORS.continueButton,
    title: 'Paso 5: Continuar',
    description: 'Cuando estés listo, usa este botón para avanzar en el flujo.'
  }
] as const;

@Injectable({ providedIn: 'root' })
export class TourGuideService {
  private readonly router = inject(Router);
  private activeDriver: ReturnType<typeof driver> | null = null;
  private isInitialized = false;

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
    this.setAttemptCount(0);
    this.runCurrentStepIfPending();
  }

  private runCurrentStepIfPending(): void {
    if (this.hasCompleted()) return;

    const stepIndex = this.getCurrentStep();
    const step = FLOW_STEPS[stepIndex];
    if (!step) {
      this.finishFlow();
      return;
    }

    const currentPath = this.getCurrentPath();
    if (!currentPath.startsWith(step.route)) {
      this.router.navigateByUrl(step.route);
      return;
    }

    this.mountStep(step);
  }

  private async mountStep(step: GuidedFlowStep): Promise<void> {
    const element = await this.waitForElement(step.selector, TOUR_GUIDE_TEST_CONFIG.MAX_ATTEMPTS);
    if (!element) return;

    this.destroyDriver();

    const isLastStep = step.id === FLOW_STEPS.length - 1;

    const tourStep: DriveStep = {
      element,
      popover: {
        title: step.title,
        description: step.description,
        side: 'bottom',
        align: 'start',
        showButtons: ['close', 'next'],
        nextBtnText: isLastStep ? 'Finalizar' : 'Siguiente',
        prevBtnText: 'Atrás',
        onNextClick: () => this.handleNext(step.id),
        onCloseClick: () => this.destroyDriver()
      }
    };

    this.activeDriver = driver({
      animate: true,
      allowClose: true,
      showProgress: true,
      smoothScroll: true,
      popoverClass: 'ecovalor-driver-popover',
      steps: [tourStep]
    });

    this.activeDriver.drive();
  }

  private handleNext(currentStep: number): void {
    const current = FLOW_STEPS[currentStep];
    current?.onAdvance?.();
    this.destroyDriver();

    const nextStep = currentStep + 1;
    this.setCurrentStep(nextStep);

    if (currentStep === 1) {
      this.router.navigateByUrl(APP_ROUTES.valueSector);
      return;
    }

    if (nextStep >= FLOW_STEPS.length) {
      this.finishFlow();
      return;
    }

    this.runCurrentStepIfPending();
  }

  private finishFlow(): void {
    this.setCompleted(true);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.CURRENT_STEP);
    this.removeKey(TOUR_GUIDE_STORAGE_KEYS.ATTEMPT_COUNT);
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
}
