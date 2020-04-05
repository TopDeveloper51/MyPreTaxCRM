import { Injectable,EventEmitter } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { configuration } from '@environments/environment';
import { interval } from 'rxjs/observable/interval';
@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {
  public isAppNeedUpdate = false;
  versionChanged: EventEmitter<any> = new EventEmitter();

  constructor(private updates: SwUpdate) { }

   /**
   * subscribe available event.
   * if update available then ask to user for take update
   */
  public updateAvailable() {
    if (this.updates.isEnabled) {
      this.checkForUpdate();
      this.updates.available.subscribe(event => {
        this.isAppNeedUpdate = true;
        this.versionChanged.emit(true);
      });
    } else {
      console.log("Service Worker is Disabled");
    }
  }

  /**
   * as per interval function check update to server
   * if update available then fire available event
   */
  private checkForUpdate() {
    this.updates.checkForUpdate();
    interval(configuration.checkforUpdate).subscribe(() => {
      this.updates.checkForUpdate();
    });
  }


  /**
   * Forcefully Update the Version
   */
  public updateVersion() {
    if (this.updates.isEnabled) {
      this.updates.activateUpdate().then(() => document.location.reload(true));
    } else {
      document.location.reload(true);
    }
  }

  public getVersionChangedEmitter() {
    return this.versionChanged;
  }
}
