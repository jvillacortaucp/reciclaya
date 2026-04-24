import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideBadgeInfo,
  LucideBookmark,
  LucideCircleAlert,
  LucideInfo,
  LucideLoaderCircle,
  LucideMapPin,
  LucideTruck
} from '@lucide/angular';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PERMISSIONS } from '../../core/constants/app.constants';
import { AuthFacade } from '../auth/services/auth.facade';
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
    LucideLoaderCircle,
    LucideInfo,
    LucideBookmark,
    LucideBadgeInfo,
    LucideMapPin,
    LucideTruck,
    LucideCircleAlert
  ],
  templateUrl: './presentation/listing-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ListingDetailFacade);
  private readonly authFacade = inject(AuthFacade);

  protected readonly copy = LISTING_DETAIL_COPY;
  protected readonly messages = LISTING_DETAIL_MESSAGES;
  protected readonly loading = this.facade.loading;
  protected readonly saving = this.facade.saving;
  protected readonly contacting = this.facade.contacting;
  protected readonly detail = this.facade.detail;
  protected readonly activeMedia = this.facade.activeMedia;
  protected readonly toast = this.facade.toastMessage;
  protected readonly canCreatePreOrder = computed(() => this.authFacade.hasPermission(PERMISSIONS.CREATE_PRE_ORDER));
  protected readonly canOpenMessages = computed(() => this.authFacade.hasPermission(PERMISSIONS.VIEW_MESSAGES));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.load(id);
    }
  }

  protected goBack(): void {
    this.router.navigateByUrl('/app/marketplace');
  }

  protected save(): void {
    this.facade.save();
  }

  protected contact(): void {
    this.facade.contactSeller();
  }

  protected selectMedia(id: string): void {
    this.facade.selectMedia(id);
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  protected deliveryModeLabel(): string {
    const detail = this.detail();
    return detail ? buildDeliveryModeLabel(detail) : '';
  }

  protected exchangeLabel(): string {
    const detail = this.detail();
    return detail ? buildExchangeTypeLabel(detail) : '';
  }
}
