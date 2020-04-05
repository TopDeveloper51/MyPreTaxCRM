import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';

// import { TicketDetailSearchComponent } from '../../activity/ticket-details-dialog/ticket-details-dialog.component';
import { UserService } from '@app/shared/services/user.service';
import { DialogService } from '@app/shared/services/dialog.service';
import { SocketService } from '@app/shared/services/socket.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
// import { DemoSchedulerComponent } from '@app/demo-scheduler/demo-scheduler/demo-scheduler.component';

@Component({
  selector: 'app-further-action',
  templateUrl: './further-action.component.html',
  styleUrls: ['./further-action.component.scss']
})
export class FurtherActionComponent implements OnInit {

  @Input('customerInfo') customerInfo: any = {};
  @Input('showFurtherAction') showFurtherAction: boolean;
  @Input() rule: string;
  @Output() ruleNameChange = new EventEmitter<any>();
  @Output() predictiveStatus = new EventEmitter<any>();
  userDetails: any = {}

  constructor(private userService: UserService, private dialogService: DialogService,
    private ticketActivityOverlayService: TicketActivityOverlayService) { }

  public ruleNameChangeEvent(ruleName) {
    this.ruleNameChange.emit(ruleName);
  }

  public updatePredictiveStatus(ruleName) {
    this.predictiveStatus.emit(ruleName);
  }

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

  goToTrainingPlanner() {
    window.open('/#/training-planning', '_blank');
  }

  //function introduced specially for call hangup on the scenario of further action
  hangUpForFurtherAction() {
    //to hang up the ongoing call
    this.ruleNameChange.emit(undefined);
    //to set the status of agent to PD Further Action
    this.predictiveStatus.emit('PDFurtherAction');
  }

  demoScheduler(){
    // this.dialogService.custom(DemoSchedulerComponent, { showClose: true}, { keyboard: true, backdrop: 'static', size: 'xl' })
    //   .result.then((result) => {
    //   }, function (btn: any): void {
    //   });
    window.open('/#/demo-scheduler', '_blank');
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail()
  }

}
