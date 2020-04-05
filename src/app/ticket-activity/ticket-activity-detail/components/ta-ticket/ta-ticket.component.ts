// External imports
import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';

// Internal imports
import { UserService } from '@app/shared/services';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';

@Component({
  selector: 'mtpo-ta-ticket',
  templateUrl: './ta-ticket.component.html',
  styleUrls: ['./ta-ticket.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TATicketComponent implements OnInit, OnDestroy {
  @Input('windowId') windowId: string;
  @Input() modelData: any = {};

  public ticketID: string;
  public ticketList: any = [];
  public originalTicketList: any = [];
  private integrityServiceSubscription: Subscription;
  public isViewMode: boolean;  // for handling view or edit mode when activity open in new tab
  public activityData: any;
  public lookup: any;
  public fieldList: any;
  public isDefaultReseller = this.userService.isDefaultReseller();
  public currentIndex: any = -1;

  constructor(private userService: UserService, private integrityService: TicketActivityIntegrityService, private detailService: TicketActivityDetailService) { }

  /**
   * This function is used to get all lookup data for ticket activity detail screen from API
   */
  private getNewLookupForTicketSearch() {
    this.detailService.getAllLookupNew().then(
      response => {
        this.lookup = response;
        this.integrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'lookupForNewTicketActivity', data: this.lookup, id: this.modelData.id })
      }, error => { }
    )
  }

  /**
  * This function is used to get all lookup data for ticket activity detail screen from API
  */
  private getTicketTypeFieldList() {
    this.detailService.getTicketTypeFieldList().then(
      response => {
        this.fieldList = response;
        this.integrityService.sendMessage({ channel: 'ticket-field-list', topic: 'ticketFieldList', data: this.fieldList, id: this.modelData.id })
      }, error => { }
    )
  }

  public assignTicket(data) {
    if (data.id !== undefined && data.id !== null) {
      let isExists = this.ticketList.findIndex(t => t.id === data.id);
      if (isExists !== -1) {
        this.detailService.assignTicket(this.modelData, this.activityData, data.id, false, data.year, this.currentIndex);
      } else {
        this.detailService.assignTicket(this.modelData, this.activityData, data.id, true, data.year);
      }
    }
  }


  /** Lifecycle hook called on first time initialization of the component */
  ngOnInit() {
    if (this.originalTicketList) {
      this.ticketList = this.originalTicketList;
    }
    this.getTicketTypeFieldList();
    this.integrityServiceSubscription = this.integrityService.getMessage().subscribe(messageObj => {
      if (messageObj.topic == 'lookup') {
        this.lookup = messageObj.data;
      } else if (this.modelData && messageObj.id == this.modelData.id) {
        if (messageObj.topic == 'isViewMode') {
          this.isViewMode = messageObj.data;
        } else if (messageObj.topic == 'activityData') {
          this.activityData = messageObj.data;
        } else if (messageObj.topic == 'ticketList') {
          this.ticketList = messageObj.data;
          if (this.ticketList && this.ticketList.length > 0) {
            if (!this.ticketID) {
              setTimeout(() => {
                this.currentIndex = 0;
                if (this.ticketList[this.currentIndex].id) {
                  this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: this.ticketList[this.currentIndex].id, id: this.modelData.id });
                }
              }, 100);
            } else {
              let ticketExists = this.ticketList.findIndex(t => t.id == this.ticketID)
              if (ticketExists == -1) {
                setTimeout(() => {
                  this.currentIndex = 0;
                  if (this.ticketList[this.currentIndex].id) {
                    this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: this.ticketList[this.currentIndex].id, id: this.modelData.id });
                  }
                }, 100);
              }
            }
          }
        } else if (messageObj.topic == 'ticketID') {
          this.ticketID = messageObj.data;
          if (this.ticketID) {
            this.currentIndex = this.ticketList.findIndex(obj => obj.id === this.ticketID);
          } else {
            this.currentIndex = -1;
          }
        } else if (messageObj.topic == 'assign-ticket') {
          this.assignTicket(messageObj.data)
        }
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
  //   console.log('TicCheck')
  // }

}
