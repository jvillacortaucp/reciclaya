import { CanDeactivateFn } from '@angular/router';
import { PendingChangesAware } from '../models/pending-changes.model';

export const pendingChangesGuard: CanDeactivateFn<PendingChangesAware> = (component) => {
  if (!component?.hasPendingChanges()) {
    return true;
  }

  return window.confirm('Tienes cambios sin guardar. ¿Deseas salir igualmente?');
};
