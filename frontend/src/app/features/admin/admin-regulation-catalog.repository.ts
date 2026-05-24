import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { normalizeHttpError } from '../../core/http/api-response.helpers';
import {
  RegulationAdminAllowedResidueResponse,
  RegulationAdminAllowedResidueUpsertRequest,
  RegulationAdminCatalogResponse,
  RegulationAdminCatalogLevelResponse,
  RegulationAdminLevelUpdateRequest,
  RegulationAdminNormativeResponse,
  RegulationAdminNormativeUpsertRequest,
  RegulationAdminRequirementResponse,
  RegulationAdminRequirementUpsertRequest
} from '../../core/regulatory/regulation-api.models';
import { RegulationHttpService } from '../../core/regulatory/regulation-http.service';

@Injectable({ providedIn: 'root' })
export class AdminRegulationCatalogRepository {
  private readonly regulationHttp = inject(RegulationHttpService);

  getCatalog(): Observable<RegulationAdminCatalogResponse> {
    return this.regulationHttp.getAdminCatalog().pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo cargar el catálogo regulatorio.'))
      )
    );
  }

  updateLevel(levelId: number, payload: RegulationAdminLevelUpdateRequest): Observable<RegulationAdminCatalogLevelResponse> {
    return this.regulationHttp.updateAdminLevel(levelId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo actualizar el nivel regulatorio.'))
      )
    );
  }

  addRequirement(levelId: number, payload: RegulationAdminRequirementUpsertRequest): Observable<RegulationAdminRequirementResponse> {
    return this.regulationHttp.addAdminRequirement(levelId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo crear el requisito regulatorio.'))
      )
    );
  }

  updateRequirement(requirementId: string, payload: RegulationAdminRequirementUpsertRequest): Observable<RegulationAdminRequirementResponse> {
    return this.regulationHttp.updateAdminRequirement(requirementId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo actualizar el requisito regulatorio.'))
      )
    );
  }

  deleteRequirement(requirementId: string): Observable<void> {
    return this.regulationHttp.deleteAdminRequirement(requirementId).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo eliminar el requisito regulatorio.'))
      )
    );
  }

  addResidue(levelId: number, payload: RegulationAdminAllowedResidueUpsertRequest): Observable<RegulationAdminAllowedResidueResponse> {
    return this.regulationHttp.addAdminAllowedResidue(levelId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo crear el residuo permitido.'))
      )
    );
  }

  updateResidue(residueId: string, payload: RegulationAdminAllowedResidueUpsertRequest): Observable<RegulationAdminAllowedResidueResponse> {
    return this.regulationHttp.updateAdminAllowedResidue(residueId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo actualizar el residuo permitido.'))
      )
    );
  }

  deleteResidue(residueId: string): Observable<void> {
    return this.regulationHttp.deleteAdminAllowedResidue(residueId).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo eliminar el residuo permitido.'))
      )
    );
  }

  addNormative(levelId: number, payload: RegulationAdminNormativeUpsertRequest): Observable<RegulationAdminNormativeResponse> {
    return this.regulationHttp.addAdminNormative(levelId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo crear la referencia normativa.'))
      )
    );
  }

  updateNormative(normativeId: string, payload: RegulationAdminNormativeUpsertRequest): Observable<RegulationAdminNormativeResponse> {
    return this.regulationHttp.updateAdminNormative(normativeId, payload).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo actualizar la referencia normativa.'))
      )
    );
  }

  deleteNormative(normativeId: string): Observable<void> {
    return this.regulationHttp.deleteAdminNormative(normativeId).pipe(
      catchError((error: unknown) =>
        throwError(() => normalizeHttpError(error, 'No se pudo eliminar la referencia normativa.'))
      )
    );
  }
}
