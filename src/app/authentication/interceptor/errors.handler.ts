
import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SentryService } from '@app/shared/services';


// errors-handler.ts
@Injectable({
    providedIn: 'root'
})
export class ErrorsHandler implements ErrorHandler {
    constructor(private sentryService: SentryService) { }

    handleError(error: Error | HttpErrorResponse) {
        let errMsg: string;
        console.error(error);
        if (error instanceof HttpErrorResponse) {
            errMsg = `${error.status} - ${error.statusText || ''} `;
            this.sentryService.moveErrorToSentry(errMsg);
        } else {
            // Handle Client Error (Angular Error, ReferenceError...)
            errMsg = error.message ? error.message : error.toString();
            this.sentryService.moveErrorToSentry(error.stack);
        }

    }
}
