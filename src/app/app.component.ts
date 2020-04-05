// External imports
import { Component } from '@angular/core';
// Internal imports
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { ServiceWorkerService } from '@app/shared/services/service-worker.service';
import { DialogService } from '@app/shared/services/dialog.service';
import { NewVersionReleaseComponent } from '@app/shared/components/new-version-release/new-version-release.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CRM-NGX';

  constructor(private ticketActivityOverlayService: TicketActivityOverlayService,
    private serviceWorkerService: ServiceWorkerService,
    private dialogServices:DialogService
    ) { }

  ngOnInit() {
    this.ticketActivityOverlayService.getMinimizedWindowsList();
    this.serviceWorkerService.updateAvailable();
    this.serviceWorkerService.getVersionChangedEmitter().subscribe((result) => {
     let updateVersionDialog = this.dialogServices.custom(NewVersionReleaseComponent, {}, { 'keyboard': false, 'backdrop': true, 'size': 'md' });
      updateVersionDialog.result.then((response) => { }, (doItLater) => { });
     // this.serviceWorkerService.updateVersion();
    })
  }
}
