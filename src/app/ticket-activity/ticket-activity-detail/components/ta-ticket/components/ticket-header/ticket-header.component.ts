//External imports
import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/Rx';
import * as moment from 'moment-timezone';

//Internal exports
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service'
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service'
import { DialogService, MessageService, UserService, CopyToClipboardService, CommonApiService, CDRService } from '@app/shared/services';
import { ActivityTicketComponent } from '@app/activity/dialog/activity-ticket/activity-ticket.component';
import { TicketHistoryComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket/dialogs/ticket-history/ticket-history.component';
import { APINAME } from '@app/ticket-activity/ticket-activity.constants';
import { environment } from '@environments/environment.prod';

@Component({
  selector: 'mtpo-ticket-header',
  templateUrl: './ticket-header.component.html',
  styleUrls: ['./ticket-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NgbPopoverConfig]
})

export class TicketHeaderComponent implements OnInit {
  @Input() modelData: any = {};
  @Input('windowId') windowId: string;

  public ticketID: string;
  public ticketList: any = [];
  public currentTicketIndex: number = -1;  // index number of the current selected ticket out of the array list of tickets
  public arrOfTicketIds: any = [];
  private integrityServiceSubscription: Subscription;
  public isViewMode: boolean;  // for handling view or edit mode when activity open in new tab
  public activityData: any;
  public lookup: any;
  public isDefaultReseller = this.userService.isDefaultReseller();
  public activityMode = 'Edit';
  public newTicketStatus: Array<any> = []; // store added ticket but not associated to show msg
  public seasonReadiness: any; // to hold controls when ticket type is selected as setup
  public isTicketValid: boolean = false;
  public isSeasonReadiness: boolean = false;
  public isTicketNotLinked: boolean = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private detailService: TicketActivityDetailService,
    private integrityService: TicketActivityIntegrityService,
    private copyToClipboardService: CopyToClipboardService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private commonApiService: CommonApiService,
    private userService: UserService, private CDRService: CDRService,
    config: NgbPopoverConfig
  ) {
    // customize default values of popovers used by this component tree
    config.placement = 'right';
    config.triggers = 'hover';
  }

  // pending :checkValidationforSaveButton

  public removeTicketFromListAndEmitTicketId(index) {
    this.ticketList.splice(index, 1);
    this.arrOfTicketIds = this.ticketList.map(t => t.id);
    this.currentTicketIndex = 0;
    this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketList', data: this.ticketList, id: this.modelData.id });
    if (this.ticketList && this.ticketList.length === 0) {
      this.isTicketNotLinked = true;
      this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: undefined, id: this.modelData.id });
      // send static height when no data in ticket
      // this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 786, id: this.modelData.id });
      // this.integrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data:786, id: this.modelData.id });
      // this.integrityService.sendMessage({ channel: 'set-dynamic-chat-height', topic: 'set-dynamic-chat-height', data: 634, id: this.modelData.id });
      // this.integrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: 620, id: this.modelData.id });
    } else {
      if (this.ticketList[this.currentTicketIndex].id) {
        this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: this.ticketList[this.currentTicketIndex].id, id: this.modelData.id });
        //   this.integrityService.sendMessage({ channel: 'ticket', topic: 'removeTicket', data: undefined, id: this.modelData.id });
      } else {
        this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: undefined, id: this.modelData.id });
        this.integrityService.sendMessage({ channel: 'ticket', topic: 'currentTicketIndex', data: 0, id: this.modelData.id });
      }

    }

  }

  public removeTicketConfirmation(index) {
    const dialogData = { title: 'Confirmation', text: `Are you sure, you want to remove ticket?` };
    this.dialogService.confirm(dialogData, {}).result.then(
      (result) => {
        if (result === 'YES') {
          this.removeTicketFromListAndEmitTicketId(index);
        }
      })
  }

  /**
   * @description Used for deleting ticket from the Ticket list
   * @param {object} ticketData
   * @param {number} index
   * @memberof TicketHeaderComponent
   */
  public removeTicket(ticketData: any, index: number) {
    if (this.activityData.id || this.activityMode == 'New') {
      if (ticketData.id === undefined || ticketData.id === null || ticketData.id === '') { // if ticket is new , it has no id
        this.removeTicketConfirmation(index);
      } else if (ticketData.id !== undefined && this.activityData.id) { // if ticket is existing
        if (ticketData.activityId) { // check if ticket is linked up with current activity
          let foundActIndex = ticketData.activityId.findIndex(d => d == this.activityData.id);
          if (foundActIndex == -1) { // if not linked up
            this.removeTicketConfirmation(index);
          }
          else if (ticketData.id !== undefined && ticketData.id !== null && this.activityData.id) { // if ticket is linked up with activity                
            const dialogData = { title: 'Confirmation', text: `Are you sure, you want to remove ticket reference for this activity?` };
            this.dialogService.confirm(dialogData, {}).result.then(
              (result) => {
                if (result === 'YES') {
                  this.commonApiService.getPromiseResponse({ apiName: APINAME.REMOVE_TICKET_DETAILS, parameterObject: { actId: this.activityData.id, ticketId: ticketData.id } }).then((response) => {
                    this.removeTicketFromListAndEmitTicketId(index);
                    // this.checkValidationforSaveButton(true, index);
                    this.messageService.showMessage('Ticket deleted successfully', 'success');
                  }, error => {
                    const self = this;
                    setTimeout(() => {
                      self.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: undefined, id: this.modelData.id });
                    }, 100);
                    this.messageService.showMessage('Error while removing ticket reference', 'error');
                  });
                }
              }, error => {
                console.error(error);
              });
          }
        } else { // ticket has no activity , it is not linked up with any activity
          this.removeTicketConfirmation(index);
        }
      }
      else { // if any activity is not there
        this.messageService.showMessage('No Activities found to remove ticket reference', 'error');
      }
    }
  }
  /**
   *
   * @description Used for deleting ticket from the Ticket list
   * @param {*} ticketData
   * @param {number} index
   * @memberof TicketHeaderComponent
   */
  // public deleteTicket(ticketData: any, index: number) {
  //   if (ticketData.id !== undefined && ticketData.id !== null) { // if ticket is there and linked up with activities
  //     // Open dialog for conformation before Change
  //     const dialogData = { title: 'Confirmation', text: `Are you sure, you want to delete this ticket?` };
  //     this.dialogService.confirm(dialogData, {}).result.then(
  //       (result) => {
  //         if (result === 'YES') {
  //           this.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_TICKET, parameterObject: { ticketId: ticketData.id } }).then(response => {
  //             if (response) {
  //               this.ticketList.splice(index, 1);
  //               this.integrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: this.ticketList, id: this.modelData.id });
  //               this.messageService.showMessage('Ticket deleted successfully', 'success');
  //             }
  //           }, error => {
  //             if (error && error.code == 4019) {
  //               this.messageService.showMessage('Please delete the reference of this ticket from the all activities', 'error');
  //             }
  //           });
  //         }
  //       }, (error) => {
  //         console.error(error);
  //       });
  //   }
  // }
  /**
   *
   *
   * @memberof TicketHeaderComponent
   */
  updateSeasonReadinessFlagsOnRefresh() {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_SEASON_READINESS_FLAG_ON_REFRESH, parameterObject: { customerId: this.activityData.customerId } }).then(response => {
      if (response && typeof (response) === 'string') {
        let data = {
          ticketId: response.split('_')[1],
          customerId: this.activityData.customerId
        }
        this.detailService.getTicketDetails(data.ticketId, this.modelData, 'ticket', data.customerId).then((response: any) => {
          if (response) {
            if (response.seasonReadiness) {
              this.seasonReadiness = response.seasonReadiness;
              setTimeout(() => {
                this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketseasonReadiness', data: this.seasonReadiness, id: this.modelData.id });
              }, 3000);

            }

          }
        });
      } else if (response && typeof (response) === 'boolean') {
        this.messageService.showMessage('This customer does not have any ticket for setup', 'error');
      }
    },
      error => { }
    );
  }


  /**
   * Used for getting the history of the ticket id passed
   * @param {string} id
   * @memberof CentricTicketComponent
   */
  getTicketHistory(id: string): void {
    // open dialog
    let data = { ticketId: 'TKT_' + id };
    this.dialogService.custom(TicketHistoryComponent, data, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
      (response) => {
      }, (error) => {
        console.error(error);
      }
    );
  }

  // Allows to open ticket in new tab
  goToTicket(id: string): void {
    if ((this.activityData && this.activityData.id) || this.activityMode == 'New') {
      this.integrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'save', data: { type: 'OpenTicketInNewTab', id: this.ticketID }, id: this.modelData.id });
    } else {
      this.integrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'saveTicket', data: { type: 'OpenTicketInNewTab', id: this.ticketID }, id: this.modelData.id });
    }
  }

  /**
   * Allows copying the URL with ticket ID to be able to open ticket in a new tab
   * @param {string} id
   * @memberof CentricTicketComponent
   */
  copyTicketLinkToClipboard(id: string): void {
    this.copyToClipboardService.copy(`${environment.host}/#/detail-view/ticket/details/` + this.ticketID);
    this.messageService.showMessage('Ticket Link Copied Successfully', 'success');
  };




  /**
   * @author Dhruvi shah
   * @cretedDate 26-12-19
   * @description open dlg to assign/create ticket 
   * @memberof TicketHeaderComponent
   */
  getActivityTicket() {
    let data = {
      "customerId": this.activityData.customerId,
      "activityId": this.activityData.id,
      "year": [this.activityData.taxSeason],
      "department": [this.activityData.department],
      "lookup": this.lookup,
      modelData: this.modelData
    }
    this.dialogService.custom(ActivityTicketComponent, data, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
      (response) => {
        if (response && response.ticket === 'old') {
          if (response.ticketId !== undefined && response.ticketId !== null) {
            let isExists = this.ticketList.findIndex(t => t.id === response.ticketId);
            if (isExists !== -1) {
              this.detailService.assignTicket(this.modelData, this.activityData, response.ticketId, false, response.year);
            } else {
              this.detailService.assignTicket(this.modelData, this.activityData, response.ticketId, true, response.year);
            }
          }
        } else if (response && response.ticket === 'new') {
          this.detailService.newTicket(this.activityData, response.ticketType, response.errorType, response.year, this.modelData.id);

        }
      }, (error) => {
        console.error(error);
      }
    );
  }


  prevNext(action: string, id?: string) {
    let newTicketID;
    if (action === 'Next') {
      newTicketID = this.ticketList[this.currentTicketIndex + 1].id;
      this.currentTicketIndex += 1;
    } else if (action === 'Prev') {
      newTicketID = this.ticketList[this.currentTicketIndex - 1].id;
      this.currentTicketIndex -= 1;
    }
    if (!newTicketID && this.currentTicketIndex > -1) {
      let currentTicketIndex = this.currentTicketIndex;
      this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: undefined, id: this.modelData.id });
      this.integrityService.sendMessage({ channel: 'ticket', topic: 'currentTicketIndex', data: currentTicketIndex, id: this.modelData.id });
    } else {
      this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: newTicketID, id: this.modelData.id });
    }



  }

  public saveTicketDetails() {
    if (!this.isTicketValid) {
      this.messageService.showMessage('Mandatory data needs to be filled', 'error');
    } else {
      this.integrityService.sendMessage({ channel: 'ticket', topic: 'saveTicket', data: this.currentTicketIndex, id: this.modelData.id });
    }
  }

  /** Lifecycle hook called on first time initialization of the component */
  ngOnInit() {
    this.integrityServiceSubscription = this.integrityService.getMessage().subscribe(messageObj => {
      if (this.modelData && messageObj.id == this.modelData.id) {
        switch (messageObj.topic) {
          case 'OpenDialogForCreateTicket':
            this.isTicketNotLinked = messageObj.data;
            if (this.isTicketNotLinked) {
              this.getActivityTicket();
            }
            break;
          case 'ticketNotLinkedyet':
            this.isTicketNotLinked = messageObj.data;
            break;
          case 'ticketList':
            this.ticketList = messageObj.data;
            if (this.ticketList && this.ticketList.length === 0) {
              this.isTicketNotLinked = true;
              // send static height when no data in ticket
              this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 786, id: this.modelData.id });
              this.integrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data: 785, id: this.modelData.id });
              this.integrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: 620, id: this.modelData.id });
            } else {
              this.isTicketNotLinked = false;
              if (this.ticketID) {
                let ticketExists = this.ticketList.findIndex(t => t.id == this.ticketID)
                if (ticketExists == -1) {
                  this.currentTicketIndex = 0;
                }
              }
            }
            this.ticketList.forEach((element) => {
              element.createdDateWithFormate = element.createdDate ? moment(element.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A') : undefined;
              element.updatedDateWithFormate = element.updatedDate ? moment(element.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A') : undefined;
            });
            this.arrOfTicketIds = this.ticketList.map(t => t.id);


            break;
          case 'ticketID':
            this.ticketID = messageObj.data;
            if (this.ticketID) {
              this.currentTicketIndex = this.ticketList.findIndex(obj => obj.id === this.ticketID);
            } else {
              this.currentTicketIndex = -1;
            }
            break;
          case 'currentTicketIndex':
            this.currentTicketIndex = messageObj.data;
            break;
          case 'activityData':
            this.activityData = messageObj.data;
            this.activityMode = (messageObj.data.id !== undefined) ? 'Edit' : 'New';
            break;
          case 'isViewMode':
            this.isViewMode = messageObj.data;
            break;
          case 'lookup':
            this.lookup = messageObj.data;
          case 'newTicketStatus':
            this.newTicketStatus = messageObj.data;
            break;
          case 'seasonReadiness':
            this.isSeasonReadiness = messageObj.data;
            break;
          case 'isTicketValid':
            this.isTicketValid = messageObj.data;
            break;
        }
        this.CDRService.callDetectChanges(this.cdr);
      }
    });
  }

  /** Lifecycle hook called when component is destroyed */
  ngOnDestroy() {
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }
  }

  // ngDoCheck() {
  //   console.log('TicCheck1')
  // }

}
