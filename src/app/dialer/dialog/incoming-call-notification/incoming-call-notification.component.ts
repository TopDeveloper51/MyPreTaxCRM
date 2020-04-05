import { Component, OnInit } from '@angular/core';
import { DialersService } from '@app/dialer/dialers.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-incoming-call-notification',
  templateUrl: './incoming-call-notification.component.html',
  styleUrls: ['./incoming-call-notification.component.scss']
})
export class IncomingCallNotificationComponent implements OnInit {

  public refreshing: boolean;
  constructor(private dialerService: DialersService, public modal: NgbActiveModal) { }
  // To close Dialog
  public close(data: any): void {
    this.modal.close(data);
  }

  refreshData() {
    this.refreshing = true;
    this.dialerService.emitRefreshEvent(false);
    this.refreshing = false;
  }

  ngOnInit() {
    this.dialerService.getRefreshStopEmitter().subscribe((response) => {
      this.refreshing = false;
    });
  }
}
