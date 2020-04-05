// External Imports
import { Injectable } from '@angular/core';
import * as Raven from 'raven-js';
// Intenal imports
import { environment } from '@environments/environment';

/**
 * Sentry Service which stores error message in raven
 */
@Injectable({
  providedIn: 'root'
})
export class SentryService {

  constructor() { }

  moveErrorToSentry(error: any) {
    if (environment.platform === 'local') {
      console.error(error);
      // throw error;
    } else {
      console.error(error);
      Raven.captureException(error, {
        level: 'error' // one of 'info', 'warning', or 'error'
      });
    }
  }
}
