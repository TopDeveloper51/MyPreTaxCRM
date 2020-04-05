// External imports
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  // To handle error from response
  public handleError(error: Error | HttpErrorResponse): any {
    // In a real world app, we might use a remote logging infrastructure
    const errMsg: string =
      error instanceof HttpErrorResponse
        ? `${error.status} - ${error.statusText || ''} `
        : error.message
        ? error.message
        : error.toString();
    return throwError(errMsg);
  }

  // To handle error from response
  public handleErrorPromise(error: Error | HttpErrorResponse): any {
    const errMsg: string =
      error instanceof HttpErrorResponse
        ? `${error.status} - ${error.statusText || ''} `
        : error.message
        ? error.message
        : error.toString();
    return throwError(errMsg).toPromise();
  }
}
