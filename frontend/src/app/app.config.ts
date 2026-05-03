import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { appRoutes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { errorHandlingInterceptor } from './core/interceptors/error-handling.interceptor';
import { mockLatencyInterceptor } from './core/interceptors/mock-latency.interceptor';
import { requestLoggingInterceptor } from './core/interceptors/request-logging.interceptor';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      withInterceptors([
        requestLoggingInterceptor,
        authTokenInterceptor,
        mockLatencyInterceptor,
        errorHandlingInterceptor
      ])
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};
