import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { DialogService, UserService, PostalChannelService, CommonApiService, CDRService } from '@app/shared/services';
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { APINAME } from '@app/chat/chat-constants';
import { ChatSocketService } from '@app/chat/socket/chat-socket.service';

@Component({
  selector: 'mtpo-activity-action',
  templateUrl: './activity-action.component.html',
  styleUrls: ['./activity-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivityActionComponent implements OnInit, OnDestroy {
  @Input() modelData: any;
  @Input() windowId: string;
  activityData: any = {}
  public isViewMode: boolean; // for handling view or edit mode when activity open in new tab
  public saveObject: any = {};
  isSaveDisabled: boolean;
  componentsForDataRetrieval = [];
  public lookup: any;
  public userDetails: any; // to hold user data
  public activityAvailable: boolean = true;
  defaultMessageList: any;
  defaultMessage: any;
  chatDataSubscriptions: Subscription;
  chatData: any;
  //  public isOldTicket = false // this flag is used when Ticket type is old , we make true this flag and disabled all buttons

  private activityActionSubscription: Subscription;
  // public isTicketActivityValid: boolean = false;
  public isTicketActivityValid: any = {
    'customer': true, 'ticketDetails': true, 'activity-order': true, 'activity-bpVolume': true, 'activity-mailDetails': true,
    'activity-specialTask': true, 'activity-detail': true, 'activity-header': true, 'documentList': true
  }

  public hasTicketActivityChanges: boolean = false;
  public activityMode: string = 'Edit';
  public setupTrainingObj: any;
  private callingSystemWatcher: Subscription;
  private displayKendoCloseButton: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService, private userService: UserService, private postalChannelService: PostalChannelService,
    private CDRService: CDRService, private commonAPIService: CommonApiService,
    private detailService: TicketActivityDetailService, private integrityService: TicketActivityIntegrityService,
    private chatSocketService: ChatSocketService
  ) { }


  checkChanges(type) {
    if (this.displayKendoCloseButton) {
      const dialogData = { title: 'Attention', text: 'Call is Running' };
      this.dialogService.confirm(dialogData, { backdrop: true });
    } else {
      this.integrityService.sendMessage({ channel: 'activity-action', topic: 'save', data: { type: type }, id: this.modelData.id });
    }
  }

  // to confirm with user whether to save the changes made to the existing ticket activity open or not
  confirmChanges(saveObject: any, id?) {
    const dialogData = { title: 'Confirmation', text: 'Do you want to save the changes?' };
    this.dialogService.confirm(dialogData, {}).result.then((result) => {
      if (result === 'YES') {
        this.saveData(saveObject, this.isTicketActivityValid);
      } else if (result === 'No') {
        let windowData = { 'windowId': this.windowId, 'id': this.modelData.id, 'screen': this.modelData.screen }
        this.detailService.redirectToMainFunction(saveObject, this.isTicketActivityValid, windowData, id);
      }
    }, (error) => {
      console.error(error);
    });
  }


  public updateActivityForTrainingSetup(status, reason) {
    this.setupTrainingObj = {
      'status': status, 'reason': reason
    }
    this.integrityService.sendMessage({ channel: 'activity-action', topic: 'save', data: { type: '1On1SetupTraining' }, id: this.modelData.id });
  }

  // to save the complete data for the existing ticket activity open
  saveData(saveObject: any, isTicketActivityValid?, id?) {
    let windowData = { 'windowId': this.windowId, 'id': this.modelData.id, 'screen': this.modelData.screen }
    this.detailService.saveData(saveObject, isTicketActivityValid, windowData, id, this.setupTrainingObj);
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.componentsForDataRetrieval = ['customer', 'ticketDetails', 'activity-order', 'activity-bpVolume', 'activity-mailDetails', 'activity-specialTask', 'activity-detail', 'activity-header', 'documentList'];

    this.activityActionSubscription = this.integrityService.getMessage().subscribe(messageObj => {

      if (messageObj.topic == 'lookup') {
        this.lookup = messageObj.data;
      }

      if (this.modelData && messageObj.id == this.modelData.id) {
        if (messageObj.topic === 'isViewMode') {
          this.isViewMode = messageObj.data;
        } else if (messageObj.topic === 'activityData') {
          this.activityData = messageObj.data;
          this.activityMode = (messageObj.data.id !== undefined) ? 'Edit' : 'New';
          this.hasTicketActivityChanges = false;
          if (this.activityData && this.activityData.type.toLowerCase() == "chat") {
            /** Get  Default chat message*/
            this.getDefaultMessage();
            /** Disabled save button when type is chat  */
            // added this condition of chatdetails because in some scenario save btn is disable
            if (this.activityData.chatDetails && Object.keys(this.activityData.chatDetails).length > 0) {
              if (this.activityData && this.activityData.responsiblePerson_value && this.activityData.type && this.activityData.responsiblePerson_value !== this.userDetails.id) {
                this.isSaveDisabled = true;
              }
            }
          }

        } else if (messageObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
        }
        if (messageObj.topic == 'saveData') {
          this.saveObject.activityData = this.activityData;
          this.saveObject.requestType = messageObj.data.requestType;
          if (messageObj.channel == 'customer') {
            this.isTicketActivityValid['customer'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.customerInfo = messageObj.data.customerInfo;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }

          } else if (messageObj.channel === 'ticketDetails') {
            this.isTicketActivityValid['ticketDetails'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            // this.saveObject.ticketDetails = messageObj.data.ticketDetails;
            this.saveObject.preserveNotSavedticketList = messageObj.data.ticketDetails;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }
          } else if (messageObj.channel === 'activity-order') {
            this.isTicketActivityValid['activity-order'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.orderDetails = messageObj.data.orderDetails;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }

          } else if (messageObj.channel === 'activity-bpVolume') {
            this.isTicketActivityValid['activity-bpVolume'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.BPVolumeDetails = messageObj.data.BPVolumeDetails;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }

          } else if (messageObj.channel === 'activity-mailDetails') {
            this.isTicketActivityValid['activity-mailDetails'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.activityMailDetails = messageObj.data.activityMailDetails;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }

          } else if (messageObj.channel === 'activity-specialTask') {
            this.isTicketActivityValid['activity-specialTask'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.timePeriod = messageObj.data.timePeriod;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }

          } else if (messageObj.channel === 'activity-detail') {
            this.isTicketActivityValid['activity-detail'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.activityDetails = messageObj.data.activityDetails;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }

          } else if (messageObj.channel === 'activity-header') {
            this.isTicketActivityValid['activity-header'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.activityHeader = messageObj.data.activityHeader;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }

          } else if (messageObj.channel === 'documentList') {
            this.isTicketActivityValid['documentList'] = messageObj.data.isValid;
            if (messageObj.data.hasChanges) {
              this.hasTicketActivityChanges = messageObj.data.hasChanges;
            }
            this.saveObject.documentList = messageObj.data.documentList;
            if (this.componentsForDataRetrieval.indexOf(messageObj.channel) > -1) {
              this.componentsForDataRetrieval.splice(this.componentsForDataRetrieval.indexOf(messageObj.channel), 1);
            }
          }
          let windowData = { 'windowId': this.windowId, 'id': this.modelData.id, 'screen': this.modelData.screen }
          if (!this.isViewMode) {
            if (this.componentsForDataRetrieval && this.componentsForDataRetrieval.length === 0) {
              // if (isValidDataToSave) {
              if (this.hasTicketActivityChanges) {
                //  if(!this.isOldTicket){
                // added 'CustTicSelection' condition to solve issue('ticket not assign on row click on particular ticket number="1140367")
                if ((this.saveObject.requestType === 'CustTicSelection') || (this.saveObject.requestType === 'Save' || this.saveObject.requestType === 'Email' || this.saveObject.requestType === 'Draft' || this.saveObject.requestType === '1On1SetupTraining')) {
                  this.detailService.redirectToMainFunction(this.saveObject, this.isTicketActivityValid, windowData, messageObj.data.id);
                } else {
                  if(this.saveObject.requestType ==="Next" || this.saveObject.requestType === "Prev")
                  {

                    let windowData = { 'windowId': this.windowId, 'id': this.modelData.id, 'screen': this.modelData.screen }
                    this.detailService.redirectToMainFunction(this.saveObject, this.isTicketActivityValid, windowData,  messageObj.data.id);
                  }
                  else{
                    this.confirmChanges(this.saveObject, messageObj.data.id);
                  }   
                }
              } else {
                this.detailService.redirectToMainFunction(this.saveObject, this.isTicketActivityValid, windowData, messageObj.data.id, this.setupTrainingObj);
              }
              this.componentsForDataRetrieval = ['customer', 'ticketDetails', 'activity-order', 'activity-bpVolume', 'activity-mailDetails', 'activity-specialTask', 'activity-detail', 'activity-header', 'documentList'];
              this.hasTicketActivityChanges = false;
            }
          } else {
            this.detailService.redirectToMainFunction(this.saveObject, this.isTicketActivityValid, windowData, messageObj.data.id);
          }
        }



      } else if (!this.activityData) {
        if (messageObj.topic === 'activityData') {
          this.activityData = messageObj.data;
          this.activityMode = (messageObj.data.id !== undefined) ? 'Edit' : 'New';
          this.hasTicketActivityChanges = false;
          if (this.activityData && this.activityData.type.toLowerCase() == "chat") {
            /** Get  Default chat message*/
            this.getDefaultMessage();
            /** Disabled save button when type is chat  */
            // added this condition of chatdetails because in some scenario save btn is disable
            if (this.activityData.chatDetails && Object.keys(this.activityData.chatDetails).length > 0) {
              if (this.activityData && this.activityData.responsiblePerson_value && this.activityData.type && this.activityData.responsiblePerson_value !== this.userDetails.id) {
                this.isSaveDisabled = true;
              }
            }
          }
        }
      }
      this.CDRService.callDetectChanges(this.cdr);
    });
    if (this.postalChannelService) {
      this.callingSystemWatcher = this.postalChannelService.postalMessage$.subscribe((postalMsg: any) => {
        if (postalMsg.channel === 'HANGUP_CALL_FROM_TICKET') {
          if (postalMsg.data && postalMsg.data.iscallRunning && postalMsg.data.id === this.modelData.id) {
            this.displayKendoCloseButton = true;
          } else {
            this.displayKendoCloseButton = false;
          }
        }
      });
    }

    /** Grt chat data message */
    this.chatDataSubscriptions = this.chatSocketService.chatData.subscribe(data => {
      setTimeout(() => {
        this.chatData = data;
        if (this.chatData.ownerId) {
          if (this.chatData.ownerId == this.userDetails.id) {
            this.isSaveDisabled = false;
          }
          else {
            this.isSaveDisabled = true;
          }
        }
      });
    });
  }

  /**
   * Chat Related Function
   */
  /** Get can chat list */
  private getDefaultMessage() {
    let department: any
    if (this.userDetails.chatDepartment && this.userDetails.chatDepartment.length > 0) {
      if (this.userDetails.chatDepartment.length > 1) {
        department = 'Both'
      } else {
        department = this.userDetails.chatDepartment[0];
      }
    }
    this.commonAPIService.getPromiseResponse({ apiName: APINAME.GET_CANNEDMSGS, parameterObject: { 'userId': this.userDetails.id, 'department': department } }).then(response => { this.defaultMessageList = response; });
  }

  /** Send Message */
  sendDefaultMessage() {
    if (this.defaultMessage) {
      this.chatSocketService.defaultMessage.next(this.defaultMessage.message);
      this.defaultMessage = undefined;
    }
  }

  ngOnDestroy() {
    if (this.activityActionSubscription) { this.activityActionSubscription.unsubscribe(); }
    if (this.callingSystemWatcher) { this.callingSystemWatcher.unsubscribe(); }
    if (this.chatDataSubscriptions) { this.chatDataSubscriptions.unsubscribe(); }
  }

  // ngDoCheck() {
  //   console.log('TActCheck1')
  // }

}
