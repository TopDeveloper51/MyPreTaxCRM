// External imports
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderSubject = new Subject<LoaderState>();
  loaderState = this.loaderSubject.asObservable();
  constructor() {}
  show() {
    // tslint:disable-next-line:no-object-literal-type-assertion
    this.loaderSubject.next({ show: true } as LoaderState);
  }
  hide() {
    // tslint:disable-next-line:no-object-literal-type-assertion
    this.loaderSubject.next({ show: false } as LoaderState);
  }
}
export interface LoaderState {
  show: boolean;
}