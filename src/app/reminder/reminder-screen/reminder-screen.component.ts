import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment-timezone';
import { ReminderService } from '@app/reminder/reminder.service';
import { CDRService, UserService } from '@app/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutService } from '@app/layout/layout.service';
import { LoaderService } from '@app/shared/loader/loader.service';

@Component({
  selector: 'app-reminder-screen',
  templateUrl: './reminder-screen.component.html',
  styleUrls: ['./reminder-screen.component.scss']
})
export class ReminderScreenComponent implements OnInit {

  public isInNewTab: boolean = true;
  public data: any;
  public createdDate: any;
  public updatedDate: any;
  public filterForBreakDetails: any = [];
  public filterForPendingRequests: any = [];
  public filterForPendingApprovals: any = {};
  public reminderAttempts: any;
  public reminderEnforce: any;
  public breakDetailsLoaded: boolean = false;
  public pendingRequestsLoaded: boolean = false;
  public pendingApprovalsLoaded: boolean = false;
  public dataForBreakDetails: any = {};
  public dataForPendingRequests: any = {};
  public dataForPendingApprovals: any = {};
  public searchObject: any = {};

  constructor(private reminderService: ReminderService, private cdrService: CDRService, private cdr: ChangeDetectorRef,
    private modal: NgbActiveModal, private layoutService: LayoutService, private userService: UserService, private loader: LoaderService) { }

  getTimeJobDetails(event?) {
    this.layoutService.TimeAccountingReminder().then((response: any) => {
      if (this.reminderEnforce) {
        if (response.breakDetails && response.breakDetails.length > 0) {
          this.filterForBreakDetails = [moment(response.breakDetails[0].date).format('YYYY-MM-DD')];
        } else {
          this.filterForBreakDetails = [];
        }
        this.breakDetailsLoaded = false;
        const self = this;
        setTimeout(() => {
          self.userService.setUpdatedCount(response);
        }, 0);

        if (this.filterForBreakDetails && this.filterForBreakDetails.length > 0) {
          this.getDataForBreakDetails();
        } else {
          this.modal.close(response);
        }
      } else {
        if (response.breakDetails.length > 0 || (response.notRequestedForApproval.length > 0) || (response.approvalPending.length > 0)) {
          if (response.breakDetails && response.breakDetails.length > 0) {
            this.filterForBreakDetails = [moment(response.breakDetails[0].date).format('YYYY-MM-DD')];
          } else {
            this.filterForBreakDetails = [];
          }
          this.filterForPendingRequests = response.notRequestedForApproval;
          this.filterForPendingApprovals = response.approvalPending;
          this.breakDetailsLoaded = false;
          this.pendingRequestsLoaded = false;
          this.pendingApprovalsLoaded = false;
          const self = this;
          setTimeout(() => {
            self.userService.setUpdatedCount(response);
          }, 0);

          this.getDataForBreakDetails();
          this.getDataForPendingRequests();
          this.getDataForPendingApprovals();
          self.cdrService.callDetectChanges(self.cdr);
        } else {
          this.modal.close(response);
        }
      }
    });
  }

  private getDataForBreakDetails() {
    if (this.filterForBreakDetails && this.filterForBreakDetails.length > 0) {
      this.breakDetailsLoaded = false;
      this.reminderService.getDataForBreakDetails(this.filterForBreakDetails).then((response) => {
        this.breakDetailsLoaded = true;
        setTimeout(() => {
          this.dataForBreakDetails = response;
        }, 0);
        this.cdrService.callDetectChanges(this.cdr);
      })
    } else {
      this.dataForBreakDetails = {};
    }
  }

  private getDataForPendingRequests() {
    if (this.filterForPendingRequests && this.filterForPendingRequests.length > 0) {
      this.breakDetailsLoaded = false;
      this.reminderService.getDataForBreakDetails(this.filterForPendingRequests).then((response) => {
        this.breakDetailsLoaded = true;
        this.dataForPendingRequests = response;
        this.cdrService.callDetectChanges(this.cdr);
      })
    } else {
      this.dataForPendingRequests = {};
    }
  }

  private getDataForPendingApprovals() {
    if (this.filterForPendingApprovals && this.filterForPendingApprovals.length > 0) {
      this.breakDetailsLoaded = false;
      this.reminderService.getDataForPendingApprovals(this.filterForPendingApprovals).then((response) => {
        this.breakDetailsLoaded = true;
        setTimeout(() => {
          this.dataForPendingApprovals = response;
        }, 0);
        this.cdrService.callDetectChanges(this.cdr);
      })
    } else {
      this.dataForPendingApprovals = {};
    }
  }

  public attemptLater() {
    this.reminderService.attemptLater().then((response) => {
      this.reminderAttempts += 1;
      this.cdrService.callDetectChanges(this.cdr);
      this.modal.close(this.reminderAttempts);
    })
  }

  public close() {
    this.modal.close();
  }

  public isBreakDetailsLoaded(event) {
    this.breakDetailsLoaded = event;
    if (this.reminderEnforce) {
      this.loader.hide()
    } else {
      if (this.breakDetailsLoaded && ((this.filterForPendingRequests && this.filterForPendingRequests.length > 0 && this.pendingRequestsLoaded) || ((this.filterForPendingRequests == undefined || this.filterForPendingRequests.length == 0) && !this.pendingRequestsLoaded)) && ((this.filterForPendingApprovals && this.filterForPendingApprovals.length > 0 && this.pendingApprovalsLoaded) || ((this.filterForPendingApprovals == undefined || this.filterForPendingApprovals.length == 0) && !this.pendingApprovalsLoaded))) {
        this.loader.hide()
      }
    }

  }

  public isPendingReqestsLoaded(event) {
    this.pendingRequestsLoaded = event;
    if (this.pendingRequestsLoaded && ((this.filterForBreakDetails && this.filterForBreakDetails.length > 0 && this.breakDetailsLoaded) || ((this.filterForBreakDetails == undefined || this.filterForBreakDetails.length == 0) && !this.breakDetailsLoaded)) && ((this.filterForPendingApprovals && this.filterForPendingApprovals.length > 0 && this.pendingApprovalsLoaded) || ((this.filterForPendingApprovals == undefined || this.filterForPendingApprovals.length == 0) && !this.pendingApprovalsLoaded))) {
      this.loader.hide()
    }
  }

  public isPendingApprovalsLoaded(event) {
    this.pendingApprovalsLoaded = event;
    if (this.pendingApprovalsLoaded && ((this.filterForBreakDetails && this.filterForBreakDetails.length > 0 && this.breakDetailsLoaded) || ((this.filterForBreakDetails == undefined || this.filterForBreakDetails.length == 0) && !this.breakDetailsLoaded)) && ((this.filterForPendingRequests && this.filterForPendingRequests.length > 0 && this.pendingRequestsLoaded) || ((this.filterForPendingRequests == undefined || this.filterForPendingRequests.length == 0) && !this.pendingRequestsLoaded))) {
      this.loader.hide()
    }
  }

  ngOnInit(): void {
    if (this.data.data) {
      this.isInNewTab = false;
      this.searchObject.userId = [];
      // this.searchObject.userId = this.data.data.userId;
      this.searchObject.userId.push(this.data.data.userId);
      let response = this.data.data.reminderData;
      this.reminderAttempts = this.data.data.reminderAttempts;
      this.reminderEnforce = this.data.data.reminderEnforce;
      if (response.breakDetails && response.breakDetails.length > 0) {
        this.filterForBreakDetails = [moment(response.breakDetails[0].date).format('YYYY-MM-DD')];
      }
      this.filterForPendingRequests = response.notRequestedForApproval;
      this.filterForPendingApprovals = response.approvalPending;
      this.createdDate = moment(response.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      if (response.updatedDate) {
        this.updatedDate = moment(response.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      } else {
        this.updatedDate = undefined;
      }
      this.getDataForBreakDetails();
      this.getDataForPendingRequests();
      this.getDataForPendingApprovals();
    } else {
      this.isInNewTab = true;
      this.getTimeJobDetails();
    }

  }

}
