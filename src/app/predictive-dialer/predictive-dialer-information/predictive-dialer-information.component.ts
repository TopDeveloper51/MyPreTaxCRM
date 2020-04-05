import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';

import { DialogService } from '@app/shared/services/dialog.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service'

@Component({
  selector: 'app-predictive-dialer-information',
  templateUrl: './predictive-dialer-information.component.html',
  styleUrls: ['./predictive-dialer-information.component.scss']
})
export class PredictiveDialerInformationComponent implements OnInit {

  @Input('customerInfo') customerInfo: any;
  @Input('overviewForDialer') overviewForDialer: any;
  @Input('overviewForRenewalDetails') overviewForRenewalDetails: any;
  @Input('ticketInfo') ticketInfo: any;
  @Input() configureOutCome: string;

  constructor(private viewContainerRef: ViewContainerRef, private dialogService: DialogService, private ticketActivityOverlayService: TicketActivityOverlayService) { }

  goToCustomerCart(): void {
    window.open('/#/customer/edit/' + this.customerInfo.customerId, '_blank');
  };

  goToActivity(): void {
    window.open('/#/activity/edit/' + this.customerInfo.actId, '_blank');
  };

  goToTicket() {
    let dialogData = { id: this.customerInfo.ticketInfo.id, screen: 'ticket' };
    this.ticketActivityOverlayService.openWindow(dialogData);
  }

  ngOnInit() {
  }

}
