import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { unwrapApiResponse } from '../http/api-response.helpers';
import {
  RegulationLevelResponse,
  RegulationLevelsApiResponse,
  RegulationMeApiResponse,
  RegulationMeResponse,
  RegulationAdminCatalogApiResponse,
  RegulationAdminCatalogResponse,
  RegulationAdminLevelApiResponse,
  RegulationAdminCatalogLevelResponse,
  RegulationAdminLevelUpdateRequest,
  RegulationAdminRequirementApiResponse,
  RegulationAdminRequirementResponse,
  RegulationAdminRequirementUpsertRequest,
  RegulationAdminAllowedResidueApiResponse,
  RegulationAdminAllowedResidueResponse,
  RegulationAdminAllowedResidueUpsertRequest,
  RegulationAdminNormativeApiResponse,
  RegulationAdminNormativeResponse,
  RegulationAdminNormativeUpsertRequest,
  RegulationRequirementReviewPageResponse,
  RegulationRequirementReviewRequest,
  RegulationRequirementUploadResult,
  RegulationReviewPageApiResponse,
  RegulationUploadRequirementApiResponse,
  RegulationValidateApiResponse,
  RegulationValidateOperationRequest,
  RegulationValidationResult
  ,RegulationEvidenceVerificationRequest
  ,RegulationEvidenceVerificationResult
  ,RegulationEvidenceVerifyApiResponse
} from './regulation-api.models';

@Injectable({ providedIn: 'root' })
export class RegulationHttpService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<RegulationMeResponse> {
    return this.http
      .get<RegulationMeApiResponse>(`${environment.apiBaseUrl}/regulation/me`)
      .pipe(map(unwrapApiResponse));
  }

  getLevels(): Observable<readonly RegulationLevelResponse[]> {
    return this.http
      .get<RegulationLevelsApiResponse>(`${environment.apiBaseUrl}/regulation/levels`)
      .pipe(map(unwrapApiResponse));
  }

  validateOperation(payload: RegulationValidateOperationRequest): Observable<RegulationValidationResult> {
    return this.http
      .post<RegulationValidateApiResponse>(`${environment.apiBaseUrl}/regulation/validate-operation`, payload)
      .pipe(map(unwrapApiResponse));
  }

  uploadRequirementEvidence(requirementId: string, file: File): Observable<RegulationRequirementUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<RegulationUploadRequirementApiResponse>(
        `${environment.apiBaseUrl}/regulation/requirements/${encodeURIComponent(requirementId)}/evidence`,
        formData
      )
      .pipe(map(unwrapApiResponse));
  }

  deleteRequirementEvidence(requirementId: string): Observable<RegulationRequirementUploadResult> {
    return this.http
      .delete<RegulationUploadRequirementApiResponse>(
        `${environment.apiBaseUrl}/regulation/requirements/${encodeURIComponent(requirementId)}/evidence`
      )
      .pipe(map(unwrapApiResponse));
  }

  getPendingRequirementReviews(page = 1, pageSize = 20): Observable<RegulationRequirementReviewPageResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http
      .get<RegulationReviewPageApiResponse>(`${environment.apiBaseUrl}/regulation/review/pending`, { params })
      .pipe(map(unwrapApiResponse));
  }

  getRequirementReviewHistory(
    page = 1,
    pageSize = 20,
    status?: string | null
  ): Observable<RegulationRequirementReviewPageResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<RegulationReviewPageApiResponse>(`${environment.apiBaseUrl}/regulation/review/history`, { params })
      .pipe(map(unwrapApiResponse));
  }

  reviewRequirement(
    requirementRecordId: string,
    payload: RegulationRequirementReviewRequest
  ): Observable<RegulationRequirementUploadResult> {
    return this.http
      .patch<RegulationUploadRequirementApiResponse>(
        `${environment.apiBaseUrl}/regulation/review/${encodeURIComponent(requirementRecordId)}`,
        payload
      )
      .pipe(map(unwrapApiResponse));
  }

  downloadRequirementEvidence(requirementRecordId: string): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/regulation/review/${encodeURIComponent(requirementRecordId)}/download`, {
      responseType: 'blob'
    });
  }

  verifyListingEvidence(payload: RegulationEvidenceVerificationRequest): Observable<RegulationEvidenceVerificationResult> {
    return this.http
      .post<RegulationEvidenceVerifyApiResponse>(`${environment.apiBaseUrl}/regulation/verify-listing-evidence`, payload)
      .pipe(map(unwrapApiResponse));
  }

  getAdminCatalog(): Observable<RegulationAdminCatalogResponse> {
    return this.http
      .get<RegulationAdminCatalogApiResponse>(`${environment.apiBaseUrl}/regulation/admin/catalog`)
      .pipe(map(unwrapApiResponse));
  }

  updateAdminLevel(levelId: number, payload: RegulationAdminLevelUpdateRequest): Observable<RegulationAdminCatalogLevelResponse> {
    return this.http
      .put<RegulationAdminLevelApiResponse>(`${environment.apiBaseUrl}/regulation/admin/levels/${levelId}`, payload)
      .pipe(map(unwrapApiResponse));
  }

  addAdminRequirement(levelId: number, payload: RegulationAdminRequirementUpsertRequest): Observable<RegulationAdminRequirementResponse> {
    return this.http
      .post<RegulationAdminRequirementApiResponse>(
        `${environment.apiBaseUrl}/regulation/admin/levels/${levelId}/requirements`,
        payload
      )
      .pipe(map(unwrapApiResponse));
  }

  updateAdminRequirement(requirementId: string, payload: RegulationAdminRequirementUpsertRequest): Observable<RegulationAdminRequirementResponse> {
    return this.http
      .patch<RegulationAdminRequirementApiResponse>(
        `${environment.apiBaseUrl}/regulation/admin/requirements/${encodeURIComponent(requirementId)}`,
        payload
      )
      .pipe(map(unwrapApiResponse));
  }

  deleteAdminRequirement(requirementId: string): Observable<void> {
    return this.http
      .delete(`${environment.apiBaseUrl}/regulation/admin/requirements/${encodeURIComponent(requirementId)}`)
      .pipe(map(() => void 0));
  }

  addAdminAllowedResidue(levelId: number, payload: RegulationAdminAllowedResidueUpsertRequest): Observable<RegulationAdminAllowedResidueResponse> {
    return this.http
      .post<RegulationAdminAllowedResidueApiResponse>(
        `${environment.apiBaseUrl}/regulation/admin/levels/${levelId}/allowed-residues`,
        payload
      )
      .pipe(map(unwrapApiResponse));
  }

  updateAdminAllowedResidue(residueId: string, payload: RegulationAdminAllowedResidueUpsertRequest): Observable<RegulationAdminAllowedResidueResponse> {
    return this.http
      .patch<RegulationAdminAllowedResidueApiResponse>(
        `${environment.apiBaseUrl}/regulation/admin/allowed-residues/${encodeURIComponent(residueId)}`,
        payload
      )
      .pipe(map(unwrapApiResponse));
  }

  deleteAdminAllowedResidue(residueId: string): Observable<void> {
    return this.http
      .delete(`${environment.apiBaseUrl}/regulation/admin/allowed-residues/${encodeURIComponent(residueId)}`)
      .pipe(map(() => void 0));
  }

  addAdminNormative(levelId: number, payload: RegulationAdminNormativeUpsertRequest): Observable<RegulationAdminNormativeResponse> {
    return this.http
      .post<RegulationAdminNormativeApiResponse>(
        `${environment.apiBaseUrl}/regulation/admin/levels/${levelId}/normatives`,
        payload
      )
      .pipe(map(unwrapApiResponse));
  }

  updateAdminNormative(normativeId: string, payload: RegulationAdminNormativeUpsertRequest): Observable<RegulationAdminNormativeResponse> {
    return this.http
      .patch<RegulationAdminNormativeApiResponse>(
        `${environment.apiBaseUrl}/regulation/admin/normatives/${encodeURIComponent(normativeId)}`,
        payload
      )
      .pipe(map(unwrapApiResponse));
  }

  deleteAdminNormative(normativeId: string): Observable<void> {
    return this.http
      .delete(`${environment.apiBaseUrl}/regulation/admin/normatives/${encodeURIComponent(normativeId)}`)
      .pipe(map(() => void 0));
  }
}
