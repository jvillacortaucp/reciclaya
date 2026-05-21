import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { normalizeHttpError } from '../../core/http/api-response.helpers';
import {
  RegulationRequirementReviewPageResponse,
  RegulationRequirementReviewRequest,
  RegulationRequirementUploadResult
} from '../../core/regulatory/regulation-api.models';
import { RegulationHttpService } from '../../core/regulatory/regulation-http.service';

@Injectable({ providedIn: 'root' })
export class AdminRegulationReviewsRepository {
  private readonly regulationHttp = inject(RegulationHttpService);

  getPendingReviews(page = 1, pageSize = 20): Observable<RegulationRequirementReviewPageResponse> {
    return this.regulationHttp.getPendingRequirementReviews(page, pageSize).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudieron cargar las revisiones pendientes.'))
      )
    );
  }

  getReviewHistory(
    page = 1,
    pageSize = 20,
    status?: string | null
  ): Observable<RegulationRequirementReviewPageResponse> {
    return this.regulationHttp.getRequirementReviewHistory(page, pageSize, status).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo cargar el historial regulatorio.'))
      )
    );
  }

  reviewRequirement(
    requirementRecordId: string,
    payload: RegulationRequirementReviewRequest
  ): Observable<RegulationRequirementUploadResult> {
    return this.regulationHttp.reviewRequirement(requirementRecordId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo actualizar la revisión regulatoria.'))
      )
    );
  }

  downloadEvidence(requirementRecordId: string): Observable<Blob> {
    return this.regulationHttp.downloadRequirementEvidence(requirementRecordId).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo descargar la evidencia.'))
      )
    );
  }
}
