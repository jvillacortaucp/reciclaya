import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import {
  RegulationAdminAllowedResidueResponse,
  RegulationAdminAllowedResidueUpsertRequest,
  RegulationAdminCatalogLevelResponse,
  RegulationAdminCatalogResponse,
  RegulationAdminLevelUpdateRequest,
  RegulationAdminNormativeResponse,
  RegulationAdminNormativeUpsertRequest,
  RegulationAdminRequirementResponse,
  RegulationAdminRequirementUpsertRequest,
  RegulationRequirementReviewItemResponse,
  RegulationRequirementReviewPageResponse,
  RegulationRequirementReviewRequest
} from '../../core/regulatory/regulation-api.models';
import { CardComponent } from '../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { AdminCompaniesRepository, AdminCompany } from './admin-companies.repository';
import { AdminRegulationCatalogRepository } from './admin-regulation-catalog.repository';
import { AdminRegulationReviewsRepository } from './admin-regulation-reviews.repository';

type AdminTab = 'companies' | 'reviews' | 'catalog';
type ReviewTab = 'pending' | 'history';
type ReviewModalMode = 'approved' | 'rejected' | null;
type HistoryStatusFilter = 'all' | 'approved' | 'rejected';

const REVIEW_PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, EmptyStateComponent, LoaderComponent, ModalComponent, SectionHeaderComponent],
  templateUrl: './admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPageComponent implements OnInit {
  private readonly companiesRepository = inject(AdminCompaniesRepository);
  private readonly reviewsRepository = inject(AdminRegulationReviewsRepository);
  private readonly catalogRepository = inject(AdminRegulationCatalogRepository);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly activeTab = signal<AdminTab>('companies');
  protected readonly reviewTab = signal<ReviewTab>('pending');

  protected readonly companies = signal<readonly AdminCompany[]>([]);
  protected readonly companiesLoading = signal(false);
  protected readonly companiesUpdatingId = signal<string | null>(null);
  protected readonly companiesError = signal<string | null>(null);

  protected readonly pendingReviews = signal<RegulationRequirementReviewPageResponse | null>(null);
  protected readonly pendingLoading = signal(false);
  protected readonly pendingError = signal<string | null>(null);

  protected readonly historyReviews = signal<RegulationRequirementReviewPageResponse | null>(null);
  protected readonly historyLoading = signal(false);
  protected readonly historyError = signal<string | null>(null);
  protected readonly historyStatusFilter = signal<HistoryStatusFilter>('all');

  protected readonly reviewUpdatingId = signal<string | null>(null);
  protected readonly downloadLoadingId = signal<string | null>(null);

  protected readonly previewOpen = signal(false);
  protected readonly previewItem = signal<RegulationRequirementReviewItemResponse | null>(null);
  protected readonly previewPdfUrl = signal<SafeResourceUrl | null>(null);

  protected readonly reviewModalOpen = signal(false);
  protected readonly reviewModalMode = signal<ReviewModalMode>(null);
  protected readonly reviewModalItem = signal<RegulationRequirementReviewItemResponse | null>(null);
  protected readonly reviewModalNotes = signal('');
  protected readonly reviewModalExpiresAt = signal('');
  protected readonly reviewModalError = signal<string | null>(null);

  protected readonly catalog = signal<RegulationAdminCatalogResponse | null>(null);
  protected readonly catalogLoading = signal(false);
  protected readonly catalogSaving = signal(false);
  protected readonly catalogError = signal<string | null>(null);
  protected readonly selectedCatalogLevel = signal<number>(1);

  protected levelEditModel: RegulationAdminLevelUpdateRequest = this.createEmptyLevelEditModel();
  protected objectiveText = '';
  protected restrictionsText = '';
  protected platformAllowedText = '';
  protected platformRequiredText = '';
  protected traceabilityText = '';
  protected legalRiskText = '';
  protected requirementDrafts = new Map<string, RegulationAdminRequirementUpsertRequest>();
  protected residueDrafts = new Map<string, RegulationAdminAllowedResidueUpsertRequest>();
  protected normativeDrafts = new Map<string, RegulationAdminNormativeUpsertRequest>();
  protected newRequirementDraft: RegulationAdminRequirementUpsertRequest = this.createNewRequirementDraft();
  protected newResidueDraft: RegulationAdminAllowedResidueUpsertRequest = this.createNewResidueDraft();
  protected newNormativeDraft: RegulationAdminNormativeUpsertRequest = this.createNewNormativeDraft();

  ngOnInit(): void {
    this.loadCompanies();
    this.loadPendingReviews();
  }

  protected setActiveTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    if (tab === 'reviews') {
      this.ensureReviewTabLoaded(this.reviewTab());
      return;
    }

    if (tab === 'catalog' && !this.catalog()) {
      this.loadCatalog();
    }
  }

  protected setReviewTab(tab: ReviewTab): void {
    this.reviewTab.set(tab);
    this.ensureReviewTabLoaded(tab);
  }

  protected setHistoryStatusFilter(value: string): void {
    const nextValue = (value || 'all') as HistoryStatusFilter;
    this.historyStatusFilter.set(nextValue);
    this.loadReviewHistory(1);
  }

  protected verifyCompany(id: string): void {
    this.updateCompanyVerification(id, 'verify');
  }

  protected rejectCompany(id: string): void {
    this.updateCompanyVerification(id, 'reject');
  }

  protected statusLabel(status: AdminCompany['verificationStatus']): string {
    switch (status) {
      case 'verified':
        return 'Verificada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  }

  protected statusClass(status: AdminCompany['verificationStatus']): string {
    switch (status) {
      case 'verified':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  protected reviewStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'in_review':
        return 'En revisión';
      case 'uploaded':
        return 'Subido';
      default:
        return status;
    }
  }

  protected reviewStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'in_review':
        return 'bg-sky-100 text-sky-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  protected deadlineBadgeClass(item: RegulationRequirementReviewItemResponse): string {
    if (item.isOverdue) {
      return 'border-red-200 bg-red-50 text-red-700';
    }

    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  protected levelLabel(levelId: number): string {
    return `Nivel ${levelId}`;
  }

  protected actorTypeLabel(actorType: string): string {
    switch (actorType) {
      case 'seller':
        return 'Seller';
      case 'buyer':
        return 'Buyer';
      case 'both':
        return 'Seller + Buyer';
      default:
        return actorType;
    }
  }

  protected formatDateTime(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  protected deadlineText(item: RegulationRequirementReviewItemResponse): string {
    if (!item.reviewDeadlineAt) {
      return 'Sin plazo';
    }

    const deadline = new Date(item.reviewDeadlineAt).getTime();
    const diffMs = deadline - Date.now();
    const absolute = this.formatRelative(Math.abs(diffMs));

    if (diffMs <= 0) {
      return `Vencido hace ${absolute}`;
    }

    return `Restan ${absolute}`;
  }

  protected canPreview(item: RegulationRequirementReviewItemResponse): boolean {
    return !!item.evidenceUrl;
  }

  protected isPreviewImage(): boolean {
    return this.previewItem()?.uploadedFileKind === 'image';
  }

  protected isPreviewPdf(): boolean {
    return this.previewItem()?.uploadedFileKind === 'pdf';
  }

  protected isPendingActionDisabled(item: RegulationRequirementReviewItemResponse): boolean {
    return this.reviewUpdatingId() === item.requirementRecordId || item.isOverdue;
  }

  protected openPreview(item: RegulationRequirementReviewItemResponse): void {
    if (!item.evidenceUrl) {
      this.reviewsErrorForCurrentTab().set('No hay evidencia disponible para este requisito.');
      return;
    }

    const openModal = () => {
      this.previewItem.set(item);
      this.previewPdfUrl.set(
        item.uploadedFileKind === 'pdf' && item.evidenceUrl
          ? this.sanitizer.bypassSecurityTrustResourceUrl(item.evidenceUrl)
          : null
      );
      this.previewOpen.set(true);
    };

    if (item.currentStatus !== 'uploaded') {
      openModal();
      return;
    }

    this.reviewUpdatingId.set(item.requirementRecordId);
    this.reviewsErrorForCurrentTab().set(null);

    this.reviewsRepository
      .reviewRequirement(item.requirementRecordId, { status: 'in_review' })
      .pipe(
        catchError((error: unknown) => {
          this.reviewsErrorForCurrentTab().set(
            getErrorMessage(error, 'No se pudo marcar la evidencia como en revisión.')
          );
          return EMPTY;
        }),
        finalize(() => this.reviewUpdatingId.set(null))
      )
      .subscribe(() => {
        this.loadPendingReviews(this.pendingReviews()?.page ?? 1);
        openModal();
      });
  }

  protected closePreview(): void {
    this.previewOpen.set(false);
    this.previewItem.set(null);
    this.previewPdfUrl.set(null);
  }

  protected previewTitle(): string {
    const item = this.previewItem();
    if (!item) {
      return 'Visualizar evidencia';
    }

    return `${this.displayCompanyName(item)} · ${item.requirementTitle}`;
  }

  protected openApproveModal(item: RegulationRequirementReviewItemResponse): void {
    this.reviewModalMode.set('approved');
    this.reviewModalItem.set(item);
    this.reviewModalNotes.set(item.notes ?? '');
    this.reviewModalExpiresAt.set('');
    this.reviewModalError.set(null);
    this.reviewModalOpen.set(true);
  }

  protected openRejectModal(item: RegulationRequirementReviewItemResponse): void {
    this.reviewModalMode.set('rejected');
    this.reviewModalItem.set(item);
    this.reviewModalNotes.set(item.notes ?? '');
    this.reviewModalExpiresAt.set('');
    this.reviewModalError.set(null);
    this.reviewModalOpen.set(true);
  }

  protected closeReviewModal(): void {
    this.reviewModalOpen.set(false);
    this.reviewModalMode.set(null);
    this.reviewModalItem.set(null);
    this.reviewModalNotes.set('');
    this.reviewModalExpiresAt.set('');
    this.reviewModalError.set(null);
  }

  protected onReviewNotesChange(value: string): void {
    this.reviewModalNotes.set(value);
  }

  protected onReviewExpiresAtChange(value: string): void {
    this.reviewModalExpiresAt.set(value);
  }

  protected submitReviewModal(): void {
    const item = this.reviewModalItem();
    const mode = this.reviewModalMode();

    if (!item || !mode) {
      return;
    }

    const notes = this.reviewModalNotes().trim();
    if (mode === 'rejected' && !notes) {
      this.reviewModalError.set('Debes agregar una nota explicando el rechazo.');
      return;
    }

    const expiresAtValue = this.reviewModalExpiresAt().trim();
    let expiresAt: string | null | undefined;
    if (mode === 'approved' && expiresAtValue) {
      const parsedDate = new Date(expiresAtValue);
      if (Number.isNaN(parsedDate.getTime())) {
        this.reviewModalError.set('La vigencia ingresada no es válida.');
        return;
      }

      expiresAt = parsedDate.toISOString();
    }

    const payload: RegulationRequirementReviewRequest = {
      status: mode,
      ...(notes ? { notes } : {}),
      ...(expiresAt ? { expiresAt } : {})
    };

    this.submitReview(item, payload, () => this.closeReviewModal());
  }

  protected downloadEvidence(item: RegulationRequirementReviewItemResponse): void {
    this.downloadLoadingId.set(item.requirementRecordId);
    this.reviewsErrorForCurrentTab().set(null);

    this.reviewsRepository
      .downloadEvidence(item.requirementRecordId)
      .pipe(
        catchError((error: unknown) => {
          this.reviewsErrorForCurrentTab().set(getErrorMessage(error, 'No se pudo descargar la evidencia.'));
          return EMPTY;
        }),
        finalize(() => this.downloadLoadingId.set(null))
      )
      .subscribe((blob) => {
        const fileName = item.uploadedFileName || `${item.requirementCode}.bin`;
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.rel = 'noopener';
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      });
  }

  protected downloadPreviewEvidence(): void {
    const item = this.previewItem();
    if (!item) {
      return;
    }

    this.downloadEvidence(item);
  }

  protected pendingRows(): readonly RegulationRequirementReviewItemResponse[] {
    return this.pendingReviews()?.items ?? [];
  }

  protected historyRows(): readonly RegulationRequirementReviewItemResponse[] {
    return this.historyReviews()?.items ?? [];
  }

  protected pendingHasRows(): boolean {
    return this.pendingRows().length > 0;
  }

  protected historyHasRows(): boolean {
    return this.historyRows().length > 0;
  }

  protected pendingPageLabel(): string {
    const page = this.pendingReviews();
    if (!page) {
      return 'Página 1';
    }

    return `Página ${page.page}`;
  }

  protected historyPageLabel(): string {
    const page = this.historyReviews();
    if (!page) {
      return 'Página 1';
    }

    return `Página ${page.page}`;
  }

  protected goToPendingPage(direction: -1 | 1): void {
    const page = this.pendingReviews();
    const nextPage = Math.max(1, (page?.page ?? 1) + direction);
    if (direction > 0 && page && !page.hasMore) {
      return;
    }

    this.loadPendingReviews(nextPage);
  }

  protected goToHistoryPage(direction: -1 | 1): void {
    const page = this.historyReviews();
    const nextPage = Math.max(1, (page?.page ?? 1) + direction);
    if (direction > 0 && page && !page.hasMore) {
      return;
    }

    this.loadReviewHistory(nextPage);
  }

  protected reviewModalTitle(): string {
    return this.reviewModalMode() === 'approved' ? 'Aprobar requisito regulatorio' : 'Rechazar requisito regulatorio';
  }

  protected reviewModalActionLabel(): string {
    return this.reviewModalMode() === 'approved' ? 'Aprobar evidencia' : 'Rechazar evidencia';
  }

  protected selectedReviewSummary(): string {
    const item = this.reviewModalItem();
    if (!item) {
      return '';
    }

    return `${this.displayCompanyName(item)} · ${this.levelLabel(item.levelId)} · ${item.requirementTitle}`;
  }

  protected displayCompanyName(item: RegulationRequirementReviewItemResponse): string {
    return item.companyName?.trim() || item.requesterName?.trim() || 'Solicitante sin razón social';
  }

  protected displayRequesterName(item: RegulationRequirementReviewItemResponse): string {
    return item.requesterName?.trim() || 'Solicitante sin nombre';
  }

  protected displayFileName(item: RegulationRequirementReviewItemResponse): string {
    return item.uploadedFileName?.trim() || 'Archivo adjunto';
  }

  protected processLabel(item: RegulationRequirementReviewItemResponse): string {
    return item.currentStatus === 'in_review' ? 'En revisión' : 'Subido';
  }

  protected processClass(item: RegulationRequirementReviewItemResponse): string {
    return item.currentStatus === 'in_review'
      ? 'bg-sky-100 text-sky-700'
      : 'bg-amber-100 text-amber-700';
  }

  protected levelOptions(): readonly RegulationAdminCatalogLevelResponse[] {
    return this.catalog()?.levels ?? [];
  }

  protected currentCatalogLevel(): RegulationAdminCatalogLevelResponse | null {
    const levelId = this.selectedCatalogLevel();
    return this.levelOptions().find((item) => item.levelId === levelId) ?? null;
  }

  protected onSelectCatalogLevel(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 4) {
      return;
    }

    this.selectedCatalogLevel.set(parsed);
    this.refreshLevelEditModel();
  }

  protected saveLevelMetadata(): void {
    const levelId = this.selectedCatalogLevel();
    const payload: RegulationAdminLevelUpdateRequest = {
      ...this.levelEditModel,
      objective: this.parseMultiLine(this.objectiveText),
      restrictions: this.parseMultiLine(this.restrictionsText),
      platformAllowed: this.parseMultiLine(this.platformAllowedText),
      platformRequired: this.parseMultiLine(this.platformRequiredText),
      traceabilityItems: this.parseMultiLine(this.traceabilityText),
      legalRiskItems: this.parseMultiLine(this.legalRiskText)
    };
    this.catalogSaving.set(true);
    this.catalogError.set(null);

    this.catalogRepository
      .updateLevel(levelId, payload)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo actualizar el nivel regulatorio.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => this.loadCatalog(levelId));
  }

  protected saveRequirement(requirement: RegulationAdminRequirementResponse): void {
    const draft = this.requirementDrafts.get(requirement.id);
    if (!draft) {
      return;
    }

    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .updateRequirement(requirement.id, draft)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo actualizar el requisito.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => this.loadCatalog(this.selectedCatalogLevel()));
  }

  protected deleteRequirement(requirementId: string): void {
    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .deleteRequirement(requirementId)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo eliminar el requisito.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => this.loadCatalog(this.selectedCatalogLevel()));
  }

  protected addRequirement(): void {
    const levelId = this.selectedCatalogLevel();
    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .addRequirement(levelId, this.newRequirementDraft)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo crear el requisito.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => {
        this.newRequirementDraft = this.createNewRequirementDraft();
        this.loadCatalog(levelId);
      });
  }

  protected saveResidue(residue: RegulationAdminAllowedResidueResponse): void {
    const draft = this.residueDrafts.get(residue.id);
    if (!draft) {
      return;
    }

    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .updateResidue(residue.id, draft)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo actualizar el residuo.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => this.loadCatalog(this.selectedCatalogLevel()));
  }

  protected deleteResidue(residueId: string): void {
    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .deleteResidue(residueId)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo eliminar el residuo.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => this.loadCatalog(this.selectedCatalogLevel()));
  }

  protected addResidue(): void {
    const levelId = this.selectedCatalogLevel();
    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .addResidue(levelId, this.newResidueDraft)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo crear el residuo.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => {
        this.newResidueDraft = this.createNewResidueDraft();
        this.loadCatalog(levelId);
      });
  }

  protected saveNormative(normative: RegulationAdminNormativeResponse): void {
    const draft = this.normativeDrafts.get(normative.id);
    if (!draft) {
      return;
    }

    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .updateNormative(normative.id, draft)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo actualizar la normativa.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => this.loadCatalog(this.selectedCatalogLevel()));
  }

  protected deleteNormative(normativeId: string): void {
    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .deleteNormative(normativeId)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo eliminar la normativa.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => this.loadCatalog(this.selectedCatalogLevel()));
  }

  protected addNormative(): void {
    const levelId = this.selectedCatalogLevel();
    this.catalogSaving.set(true);
    this.catalogError.set(null);
    this.catalogRepository
      .addNormative(levelId, this.newNormativeDraft)
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo crear la normativa.'));
          return EMPTY;
        }),
        finalize(() => this.catalogSaving.set(false))
      )
      .subscribe(() => {
        this.newNormativeDraft = this.createNewNormativeDraft();
        this.loadCatalog(levelId);
      });
  }

  protected requirementDraft(id: string): RegulationAdminRequirementUpsertRequest | undefined {
    return this.requirementDrafts.get(id);
  }

  protected residueDraft(id: string): RegulationAdminAllowedResidueUpsertRequest | undefined {
    return this.residueDrafts.get(id);
  }

  protected normativeDraft(id: string): RegulationAdminNormativeUpsertRequest | undefined {
    return this.normativeDrafts.get(id);
  }

  private loadCompanies(): void {
    this.companiesLoading.set(true);
    this.companiesError.set(null);

    this.companiesRepository
      .getCompanies()
      .pipe(
        catchError((error: unknown) => {
          this.companiesError.set(getErrorMessage(error, 'No se pudieron cargar las empresas.'));
          return EMPTY;
        }),
        finalize(() => this.companiesLoading.set(false))
      )
      .subscribe((companies) => this.companies.set(companies));
  }

  private updateCompanyVerification(id: string, action: 'verify' | 'reject'): void {
    this.companiesUpdatingId.set(id);
    this.companiesError.set(null);

    const request = action === 'verify' ? this.companiesRepository.verifyCompany(id) : this.companiesRepository.rejectCompany(id);
    request
      .pipe(
        catchError((error: unknown) => {
          this.companiesError.set(getErrorMessage(error, 'No se pudo actualizar la empresa.'));
          return EMPTY;
        }),
        finalize(() => this.companiesUpdatingId.set(null))
      )
      .subscribe((updatedCompany) => {
        this.companies.update((companies) =>
          companies.map((company) => (company.id === updatedCompany.id ? updatedCompany : company))
        );
      });
  }

  private ensureReviewTabLoaded(tab: ReviewTab): void {
    if (tab === 'pending') {
      if (!this.pendingReviews()) {
        this.loadPendingReviews();
      }
      return;
    }

    if (!this.historyReviews()) {
      this.loadReviewHistory();
    }
  }

  private loadPendingReviews(page = 1): void {
    this.pendingLoading.set(true);
    this.pendingError.set(null);

    this.reviewsRepository
      .getPendingReviews(page, REVIEW_PAGE_SIZE)
      .pipe(
        catchError((error: unknown) => {
          this.pendingError.set(getErrorMessage(error, 'No se pudieron cargar las revisiones pendientes.'));
          return EMPTY;
        }),
        finalize(() => this.pendingLoading.set(false))
      )
      .subscribe((response) => this.pendingReviews.set(response));
  }

  private loadReviewHistory(page = 1): void {
    this.historyLoading.set(true);
    this.historyError.set(null);

    const status = this.historyStatusFilter() === 'all' ? null : this.historyStatusFilter();
    this.reviewsRepository
      .getReviewHistory(page, REVIEW_PAGE_SIZE, status)
      .pipe(
        catchError((error: unknown) => {
          this.historyError.set(getErrorMessage(error, 'No se pudo cargar el historial regulatorio.'));
          return EMPTY;
        }),
        finalize(() => this.historyLoading.set(false))
      )
      .subscribe((response) => this.historyReviews.set(response));
  }

  private submitReview(
    item: RegulationRequirementReviewItemResponse,
    payload: RegulationRequirementReviewRequest,
    onSuccess?: () => void
  ): void {
    this.reviewUpdatingId.set(item.requirementRecordId);
    this.reviewsErrorForCurrentTab().set(null);
    this.reviewModalError.set(null);

    this.reviewsRepository
      .reviewRequirement(item.requirementRecordId, payload)
      .pipe(
        catchError((error: unknown) => {
          const message = getErrorMessage(error, 'No se pudo actualizar la revisión regulatoria.');
          if (this.reviewModalOpen()) {
            this.reviewModalError.set(message);
          } else {
            this.reviewsErrorForCurrentTab().set(message);
          }
          return EMPTY;
        }),
        finalize(() => this.reviewUpdatingId.set(null))
      )
      .subscribe(() => {
        this.loadPendingReviews(this.pendingReviews()?.page ?? 1);
        this.loadReviewHistory(this.historyReviews()?.page ?? 1);
        onSuccess?.();
      });
  }

  private reviewsErrorForCurrentTab() {
    return this.reviewTab() === 'pending' ? this.pendingError : this.historyError;
  }

  private formatRelative(diffMs: number): string {
    const totalMinutes = Math.max(1, Math.floor(diffMs / 60000));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }

  private loadCatalog(targetLevel?: number): void {
    this.catalogLoading.set(true);
    this.catalogError.set(null);

    this.catalogRepository
      .getCatalog()
      .pipe(
        catchError((error: unknown) => {
          this.catalogError.set(getErrorMessage(error, 'No se pudo cargar el catálogo regulatorio.'));
          return EMPTY;
        }),
        finalize(() => this.catalogLoading.set(false))
      )
      .subscribe((catalog) => {
        this.catalog.set(catalog);
        const selected = targetLevel ?? this.selectedCatalogLevel();
        const exists = catalog.levels.some((item) => item.levelId === selected);
        this.selectedCatalogLevel.set(exists ? selected : (catalog.levels[0]?.levelId ?? 1));
        this.refreshLevelEditModel();
      });
  }

  private refreshLevelEditModel(): void {
    const level = this.currentCatalogLevel();
    if (!level) {
      this.levelEditModel = this.createEmptyLevelEditModel();
      this.requirementDrafts.clear();
      this.residueDrafts.clear();
      this.normativeDrafts.clear();
      return;
    }

    this.levelEditModel = {
      title: level.title,
      subtitle: level.subtitle,
      regularizationLabel: level.regularizationLabel,
      riskLevel: level.riskLevel,
      fiscalization: level.fiscalization,
      objective: [...level.objective],
      restrictions: [...level.restrictions],
      platformAllowed: [...level.platformAllowed],
      platformRequired: [...level.platformRequired],
      traceabilityItems: [...level.traceabilityItems],
      legalRiskItems: [...level.legalRiskItems]
    };
    this.objectiveText = this.levelEditModel.objective.join('\n');
    this.restrictionsText = this.levelEditModel.restrictions.join('\n');
    this.platformAllowedText = this.levelEditModel.platformAllowed.join('\n');
    this.platformRequiredText = this.levelEditModel.platformRequired.join('\n');
    this.traceabilityText = this.levelEditModel.traceabilityItems.join('\n');
    this.legalRiskText = this.levelEditModel.legalRiskItems.join('\n');

    this.requirementDrafts = new Map(
      level.requirements.map((item) => [
        item.id,
        {
          requirementCode: item.requirementCode,
          title: item.title,
          description: item.description,
          required: item.required,
          actorType: item.actorType,
          acceptedFileTypes: [...item.acceptedFileTypes],
          sortOrder: item.sortOrder,
          isActive: item.isActive
        }
      ])
    );

    this.residueDrafts = new Map(
      level.allowedResidues.map((item) => [
        item.id,
        {
          categoryId: item.categoryId,
          categoryTitle: item.categoryTitle,
          residueName: item.residueName,
          quantityMin: item.quantityMin,
          quantityMax: item.quantityMax,
          unit: item.unit,
          sortOrder: item.sortOrder,
          isActive: item.isActive
        }
      ])
    );

    this.normativeDrafts = new Map(
      level.normatives.map((item) => [
        item.id,
        {
          code: item.code,
          title: item.title,
          article: item.article,
          referenceUrl: item.referenceUrl,
          sortOrder: item.sortOrder,
          isActive: item.isActive
        }
      ])
    );
  }

  private createEmptyLevelEditModel(): RegulationAdminLevelUpdateRequest {
    return {
      title: '',
      subtitle: '',
      regularizationLabel: '',
      riskLevel: 'medium',
      fiscalization: '',
      objective: [],
      restrictions: [],
      platformAllowed: [],
      platformRequired: [],
      traceabilityItems: [],
      legalRiskItems: []
    };
  }

  private createNewRequirementDraft(): RegulationAdminRequirementUpsertRequest {
    return {
      requirementCode: '',
      title: '',
      description: '',
      required: true,
      actorType: 'both',
      acceptedFileTypes: ['pdf', 'image'],
      sortOrder: 0,
      isActive: true
    };
  }

  private createNewResidueDraft(): RegulationAdminAllowedResidueUpsertRequest {
    return {
      categoryId: '',
      categoryTitle: '',
      residueName: '',
      quantityMin: null,
      quantityMax: null,
      unit: null,
      sortOrder: 0,
      isActive: true
    };
  }

  private createNewNormativeDraft(): RegulationAdminNormativeUpsertRequest {
    return {
      code: '',
      title: '',
      article: null,
      referenceUrl: null,
      sortOrder: 0,
      isActive: true
    };
  }

  private parseMultiLine(value: string): string[] {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
