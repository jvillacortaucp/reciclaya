import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideCalendarDays, LucideSearch, LucideSparkles } from '@lucide/angular';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { APP_ROUTES } from '../../../../core/constants/app.constants';
import { ToastService } from '../../../../core/services/toast.service';
import {
  RecommendationsHttpRepository,
  SavedAnalysisListItem
} from '../../recommendations-http.repository';

@Component({
  selector: 'app-recommendations-history-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideSearch, LucideSparkles, LucideCalendarDays],
  templateUrl: './recommendations-history.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsHistoryPageComponent {
  private readonly repository = inject(RecommendationsHttpRepository);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly items = signal<readonly SavedAnalysisListItem[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly total = signal(0);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly fromDateControl = new FormControl('', { nonNullable: true });
  protected readonly toDateControl = new FormControl('', { nonNullable: true });

  protected readonly filteredItems = computed(() => {
    const search = this.searchControl.value.trim().toLowerCase();
    const fromDate = this.parseDate(this.fromDateControl.value);
    const toDate = this.parseDate(this.toDateControl.value);

    return this.items().filter((item) => {
      const haystack = [
        item.title,
        item.recommendedProduct ?? '',
        item.sectorName ?? '',
        item.residueInput ?? '',
        item.listingId
      ]
        .join(' ')
        .toLowerCase();

      if (search && !haystack.includes(search)) {
        return false;
      }

      const created = this.parseDate(item.createdAt ?? item.updatedAt ?? '');
      if (fromDate && (!created || created < fromDate)) {
        return false;
      }
      if (toDate && (!created || created > toDate)) {
        return false;
      }

      return true;
    });
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // computed will refresh template automatically
      });

    this.loadPage(1);
  }

  protected nextPage(): void {
    if (this.page() >= this.totalPages()) {
      return;
    }
    this.loadPage(this.page() + 1);
  }

  protected previousPage(): void {
    if (this.page() <= 1) {
      return;
    }
    this.loadPage(this.page() - 1);
  }

  protected openIdea(item: SavedAnalysisListItem): void {
    if (!item.listingId) {
      this.toast.error('La idea no tiene listing asociado.');
      return;
    }

    const slug = this.slugify(item.recommendedProduct || item.title || 'idea-guardada');
    void this.router.navigate([APP_ROUTES.recommendations, slug], {
      queryParams: {
        tab: 'process',
        listing: item.listingId,
        selectedProductId: slug,
        history: 1,
        readonly: 1
      }
    });
  }

  protected resetFilters(): void {
    this.searchControl.setValue('');
    this.fromDateControl.setValue('');
    this.toDateControl.setValue('');
  }

  protected trackById(_index: number, item: SavedAnalysisListItem): string {
    return item.id;
  }

  private loadPage(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.repository.getMySavedAnalyses(page, this.pageSize()).subscribe({
      next: (result) => {
        this.items.set(result.items);
        this.page.set(result.page);
        this.pageSize.set(result.pageSize);
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
        this.toast.error(error.message);
      }
    });
  }

  private slugify(value: string): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }
}

