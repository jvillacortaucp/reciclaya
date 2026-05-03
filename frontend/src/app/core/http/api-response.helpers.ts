import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/app.models';

const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la operacion.';
const FORBIDDEN_MESSAGE = 'No tienes permisos para esta accion.';

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null || response.data === undefined) {
    throw new Error(resolveApiMessage(response) ?? DEFAULT_ERROR_MESSAGE);
  }

  return response.data;
}

export function normalizeHttpError(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): Error {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 403) {
      return new Error(FORBIDDEN_MESSAGE);
    }

    return new Error(resolveApiMessage(error.error) ?? fallback);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallback);
}

export function getErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  return normalizeHttpError(error, fallback).message;
}

function resolveApiMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (isApiErrorBody(value)) {
    return value.message ?? value.errors?.[0] ?? null;
  }

  return null;
}

function isApiErrorBody(value: unknown): value is Pick<ApiResponse<unknown>, 'message' | 'errors'> {
  return typeof value === 'object' && value !== null && ('message' in value || 'errors' in value);
}
