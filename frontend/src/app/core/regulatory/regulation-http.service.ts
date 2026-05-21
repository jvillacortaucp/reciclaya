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
  RegulationRequirementReviewPageResponse,
  RegulationRequirementReviewRequest,
  RegulationRequirementUploadResult,
  RegulationReviewPageApiResponse,
  RegulationUploadRequirementApiResponse,
  RegulationValidateApiResponse,
  RegulationValidateOperationRequest,
  RegulationValidationResult
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
}
