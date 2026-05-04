import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideBadgeInfo,
  LucideCircleAlert,
  LucideInfo,
  LucideMapPin,
  LucideTruck
} from '@lucide/angular';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { APP_ROUTES, PERMISSIONS } from '../../core/constants/app.constants';
import { AuthFacade } from '../auth/services/auth.facade';
import { ProtectedActionService } from '../../core/services/protected-action.service';
import { LISTING_DETAIL_COPY, LISTING_DETAIL_MESSAGES, buildDeliveryModeLabel, buildExchangeTypeLabel } from './data/listing-detail.constants';
import { ListingDetailFacade } from './application/listing-detail.facade';
import { DetailBreadcrumbComponent } from './presentation/components/detail-breadcrumb/detail-breadcrumb.component';
import { ListingImageGalleryComponent } from './presentation/components/listing-image-gallery/listing-image-gallery.component';
import { ListingSummaryCardComponent } from './presentation/components/listing-summary-card/listing-summary-card.component';
import { RelatedListingCardComponent } from './presentation/components/related-listing-card/related-listing-card.component';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [
    EmptyStateComponent,
    DetailBreadcrumbComponent,
    ListingImageGalleryComponent,
    ListingSummaryCardComponent,
    RelatedListingCardComponent,
    LucideInfo,
    LucideBadgeInfo,
    LucideMapPin,
    LucideTruck,
    LucideCircleAlert
  ],
  templateUrl: './presentation/listing-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ListingDetailFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly protectedActions = inject(ProtectedActionService);

  protected readonly copy = LISTING_DETAIL_COPY;
  protected readonly messages = LISTING_DETAIL_MESSAGES;
  protected readonly loading = this.facade.loading;
  protected readonly saving = this.facade.saving;
  protected readonly contacting = this.facade.contacting;
  protected readonly detail = this.facade.detail;
  protected readonly activeMedia = this.facade.activeMedia;
  protected readonly toast = this.facade.toastMessage;
  protected readonly valorizationIdeas = this.facade.valorizationIdeas;
  protected readonly valorizationIdeasLoading = this.facade.valorizationIdeasLoading;
  protected readonly valorizationIdeasGenerating = this.facade.valorizationIdeasGenerating;
  protected readonly valorizationIdeasLoaded = this.facade.valorizationIdeasLoaded;
  protected readonly user = this.authFacade.user;
  protected readonly canCreatePreOrder = computed(() => this.authFacade.hasPermission(PERMISSIONS.CREATE_PRE_ORDER));
  protected readonly canOpenMessages = computed(() => this.authFacade.hasPermission(PERMISSIONS.VIEW_MESSAGES));
  protected readonly canBuyNow = computed(() => this.user()?.role === 'buyer');
  protected readonly valorizationSectionTitle = computed(() => {
    const role = this.user()?.role;
    if (role === 'buyer') {
      return 'Que podrias hacer si compras este producto';
    }

    if (role === 'seller') {
      return 'Como valorizar o vender mejor este residuo';
    }

    return 'Ideas de valorizacion con IA';
  });

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('listingId') ??
      this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.load(id);
    }
  }

  ngOnDestroy(): void {
    this.facade.resetValorizationIdeasView();
  }

  protected goBack(): void {
    this.router.navigateByUrl(APP_ROUTES.marketplace);
  }

  protected save(): void {
    this.protectedActions.requireAuthForAction({
      actionName: 'Guardar publicación',
      returnUrl: this.router.url,
      onAllowed: () => this.facade.save()
    });
  }

  protected generatePreOrder(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    // Prevent navigating to pre-order creation for the listing owner
    const currentUserId = this.authFacade.user()?.id;
    const sellerId = (detail as any)?.seller?.id ?? null;
    if (currentUserId && sellerId && currentUserId === sellerId) {
      this.facade.toastMessage.set('No puedes generar una pre-orden sobre tu propia publicación.');
      return;
    }

    this.protectedActions.requireAuthForAction({
      actionName: 'Generar pre-orden',
      returnUrl: `${APP_ROUTES.preOrders}/new/${detail.id}`,
      onAllowed: () => {
        void this.router.navigate([APP_ROUTES.preOrders, 'new', detail.id]);
      }
    });
  }

  protected requestInfo(): void {
    this.protectedActions.requireAuthForAction({
      actionName: 'Solicitar información',
      returnUrl: this.router.url,
      onAllowed: () => this.facade.contactSeller()
    });
  }

  protected buyNow(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    void this.router.navigateByUrl(`${APP_ROUTES.checkout}/${detail.id}`);
  }

  protected selectMedia(id: string): void {
    this.facade.selectMedia(id);
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  protected generateValorizationIdeas(): void {
    this.facade.generateValorizationIdeas();
  }

  protected loadValorizationIdeas(): void {
    this.facade.loadValorizationIdeas();
  }

  protected deliveryModeLabel(): string {
    const detail = this.detail();
    return detail ? buildDeliveryModeLabel(detail) : '';
  }

  protected exchangeLabel(): string {
    const detail = this.detail();
    return detail ? buildExchangeTypeLabel(detail) : '';
  }

  protected isSellerView(): boolean {
    return this.user()?.role === 'seller';
  }

  protected isBuyerView(): boolean {
    return this.user()?.role === 'buyer';
  }

  protected sourceBadge(source: string): string {
    return source === 'deepseek' ? 'Generado con IA' : 'Recomendacion base';
  }

  protected viabilityLabel(level: string): string {
    switch (level) {
      case 'high':
        return 'Alta viabilidad';
      case 'low':
        return 'Viabilidad baja';
      default:
        return 'Viabilidad media';
    }
  }

  protected viabilityBadgeClasses(level: string): string {
    switch (level) {
      case 'high':
        return 'bg-emerald-100 text-emerald-700';
      case 'low':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }
}
