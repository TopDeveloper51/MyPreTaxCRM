// External imports
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { interval } from 'rxjs/observable/interval';

// Internal imports
import { UserService, MessageService, CDRService, DialerService, PostalChannelService, CommonApiService, LocalStorageUtilityService } from '@app/shared/services';
import { DialogService } from '@app/shared/services/dialog.service';
import { DialerDialogComponent } from '@app/dialer/dialog/dialer-dialog/dialer-dialog.component';
// import { DialerComponent } from '@app/layout/dialog/dialer/dialer.component';
import { LayoutService } from '@app/layout/layout.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { SocketService } from '@app/shared/services/socket.service';
import { SOCKETNAME } from '@app/layout/layout.constants';
import { ChatHistoryComponent } from '@app/chat/dialog/chat-history/chat-history.component';
import { APINAME, CHAT_SOCKETNAME } from '@app/chat/chat-constants';
import { ChatSocketService } from '@app/chat/socket/chat-socket.service';
import { environment } from '@environments/environment'
import { TimeAccountingReminderSettings, Configuration } from '@app/layout/layout.constants';
import { ReminderScreenComponent } from '@app/reminder/reminder-screen/reminder-screen.component';
import { ServiceWorkerService } from '@app/shared/services/service-worker.service';
declare var window: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // public variable
  public disableUrl = false;  // to disable menus in header
  public userName: string;
  public isManagement: boolean = false;
  public chatHistoryResponse: any;
  public interval: any;
  public userDetails: any = null;
  public pendingChatCount: any;
  public openedWindowList: any = [];
  public windowListToShowcase: any = [];
  public currentBatch: number;
  public lastBatch: number;
  public subscription: Subscription
  public isAMManagement: boolean = false; // for isAMManagement user role 
  public answeringMachine: boolean;
  private isChangedAM = false;
  public isCallOverviewUser: boolean;
  public settingsReminder: any = TimeAccountingReminderSettings.settings1x;
  public subscriptionCheckTimeAccountingReminder: Subscription = new Subscription();
  public subscriptionUpdateReminderCount: Subscription;
  public pendingSocketCount: any;
  public liveCRMMenuName = []; // to store menu list which is need to be hide from header menu 
  plivoOptions: any = {
    "debug": "DEBUG",
    "permOnClick": false,
    "audioConstraints": { "optional": [{ "googAutoGainControl": false }, { "googEchoCancellation": false }] },
    "enableTracking": true
  };

  public isChecking: boolean = false;
  public checkInStatus: boolean = false;

  public chat: { IsOnline?: boolean, chatStatus?: string, chatStatustoolTip?: string } = {};

  private chatNotificationSubs: Subscription;
  public isPlivoUser: boolean;
  public endCallSubscription: Subscription;
  public displayKendoCloseButton: boolean = true;
  callRunningActivityId: any;
  public dialerData: any = {};
  public environment = environment;
  public isDefaultReseller: any
  public isToShowReminder = false;
  public totalOfAllReminders: number = 0;
  public tooltipReminder: any = '';
  public reminderDialogIsOpen: boolean = false;
  public reminderAttempts: any;
  public breakEnforceUpdateTime: string;
  public reminderDataAccountingData: any;

  constructor(private userService: UserService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private socketService: SocketService,
    private chatSocketService: ChatSocketService,
    private _commonAPI: CommonApiService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private zone: NgZone,
    private dialerService: DialerService,
    private serviceWorkerService: ServiceWorkerService,
    private postalChannelService: PostalChannelService) { }

  /**
 * @author Satyam Jasoliya
 * @createdDate 29/11/2019
 * @description open dialer dialog box
 * @memberof HeaderComponent
 */

  goToPredictiveDialer() {
    if (this.userDetails.isPlivoUser) {
      if (this.userService.USER_STATUS === 'onCall') {
        this.messageService.showMessage('Your Call is Running. Please Complete in order to participate in PD Agent Screen', 'error');
      } else {
        window.open('/#/predictiveDialer/predictiveDialerView/', '_blank');
      }
    } else {
      this.messageService.showMessage('User do not have right to access Phone System', 'error');
    }
  }

  public goToTestPredictiveDialer(): any {
    window.open('/#/predictiveDialer/predictiveDialerView/demo', '_blank');
  };

  public dialPad() {
    this.dialogService.custom(DialerDialogComponent, { 'data': {}, 'disableClose': true }, { keyboard: false, backdrop: 'static', size: 'lg' }).result.then(response => {
    }, (error) => {
      console.log(error);
    });
  }

  public changeAnswerMachine(value: boolean): any {
    // check user role if managenet or ammanagment user then allow to change
    if ((this.isManagement !== undefined && this.isManagement !== null && this.isManagement === true) ||
      (this.isAMManagement !== undefined && this.isAMManagement !== null && this.isAMManagement === true)) {
      this.answeringMachine = value;
      this.socketService.emit(SOCKETNAME.emitChangeAnsweringMachineStatus, { 'status': this.answeringMachine, agentId: this.userDetails.id }, function (): void { });
      this.isChangedAM = true;
    }
  }

  public updateReminderCount() {
    const self = this
    this.subscriptionUpdateReminderCount = this.userService.getUpdateReminderCount().subscribe((response) => {
      self.processReminder(response);
      self.cdr.detectChanges();
    });
  }

  public processReminder(response) {
    if (response.breakDetails.length > 0 || response.notRequestedForApproval.length > 0 || response.approvalPending.length > 0) {
      this.isToShowReminder = true;
      this.settingsReminder = TimeAccountingReminderSettings.settings1x;

      let duration = moment.duration(moment().diff(moment(response.createdDate))).asMinutes();
      let reminderSettings = _.orderBy(this.userDetails.crmAppConfig.reminderSettings, ['ageInMin'], ['desc']);
      for (let setting of reminderSettings) {
        if (duration >= setting.ageInMin) {
          this.settingsReminder = setting;
          break;
        }
      }
      this.totalOfAllReminders = (response.breakDetails.length > 0 ? 1 : response.breakDetails.length) + response.notRequestedForApproval.length + response.approvalPending.length
      this.tooltipReminder = '';
      if (response.breakDetails.length > 0) {
        this.tooltipReminder += ` Break Explanation Missing (${response.breakDetails.length})`
      }

      if (response.notRequestedForApproval.length > 0) {
        this.tooltipReminder += ` Not Requested For Approval (${response.notRequestedForApproval.length})`
      }
      if (response.approvalPending.length > 0) {
        this.tooltipReminder += ` Pending Approvals (${response.approvalPending.length})`
      }
      if (response.reminderAttempts !== undefined && response.reminderAttempts !== null) {
        this.reminderAttempts = response.reminderAttempts
      } else {
        this.reminderAttempts = undefined
      }
      this.cdrService.callDetectChanges(this.cdr);
    } else {
      this.totalOfAllReminders = 0;
      this.tooltipReminder = '';
      this.isToShowReminder = false;
      this.settingsReminder = TimeAccountingReminderSettings.settings1x;
      this.reminderAttempts = undefined
      this.cdrService.callDetectChanges(this.cdr);
    }
    this.reminderDataAccountingData = response;

    let diff = moment().utc().diff(moment(this.breakEnforceUpdateTime), 'minutes');

    if (((response.breakReminderEnforce && !this.reminderDialogIsOpen) || (!this.reminderDialogIsOpen && this.localStorageUtilityService.checkLocalStorageKey('reminderDialogIsOpen') && response.breakDetails && response.breakDetails.length > 0)) &&
      (!this.breakEnforceUpdateTime || diff >= response.maxAutoReminderDiffTime)) {
      this.reminder(true);
    }
  }

  public checkTimeAccountingReminder(): void {
    this.initTimeAccountingReminder();
    this.subscriptionCheckTimeAccountingReminder = interval(this.userDetails.crmAppConfig.crmConfig.checkforTimeAccountingReminder).subscribe(val => {
      this.initTimeAccountingReminder();
    });
  }

  public initTimeAccountingReminder() {
    if (!(Configuration.doNotCheckReminderOnUserStatus.includes(this.userService.USER_STATUS))) {
      this.layoutService.TimeAccountingReminder().then((response) => {
        this.processReminder(response);
      });
    }
  }

  reminder(reminderEnforce?) {
    if (this.reminderDataAccountingData.breakDetails.length > 0 || this.reminderDataAccountingData.notRequestedForApproval.length > 0 || this.reminderDataAccountingData.approvalPending.length > 0) {
      this.reminderDialogIsOpen = true;
      if (reminderEnforce) {
        this.updateTTLDoc();
        this.localStorageUtilityService.addToLocalStorage('reminderDialogIsOpen', this.reminderDialogIsOpen);
      }
      this.cdrService.markForCheck(this.cdr);
      this.dialogService.custom(ReminderScreenComponent, { 'data': { 'reminderData': this.reminderDataAccountingData, 'reminderAttempts': this.reminderAttempts, 'reminderEnforce': reminderEnforce ? true : false, 'userId': this.userDetails.id } }, { keyboard: false, backdrop: 'static', size: 'xl' }).result.then(
        (result: any) => {
          this.reminderDialogIsOpen = false;
          if (reminderEnforce) {
            this.localStorageUtilityService.removeFromLocalStorage('reminderDialogIsOpen');
          }
          if (result) {
            if (typeof result == 'number') {
              this.reminderAttempts = result;
              this.breakEnforceUpdateTime = moment().utc().format();
            } else {
              if (result.breakDetails.length > 0 || result.notRequestedForApproval.length > 0 || result.approvalPending.length > 0) {
              } else {
                this.totalOfAllReminders = 0;
                this.tooltipReminder = '';
                this.isToShowReminder = false;
                this.settingsReminder = TimeAccountingReminderSettings.settings1x;
              }
            }
            this.cdrService.callDetectChanges(this.cdr);
          }
        },
        (error) => {
        }

      );
    } else {
      this.messageService.showMessage('No Data Avaialable for Reminders', 'error');
    }
  }

  public updateTTLDoc() {
    this.layoutService.updateTTLDoc().then((response) => {
      console.log("Successfully Updated TTL Doc");
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/12/2019
   * @description check status of checkIn and checkOut
   * @memberof HeaderComponent
   */
  public checkInOut(): void {
    this.isChecking = true;
    this.userDetails.checkInStatus = !this.checkInStatus;
    this.layoutService.checkInOutStatus(this.userDetails.checkInStatus).then((response) => {
      this.isChecking = false;
      this.cdrService.callDetectChanges(this.cdr);
      if (response == false) {
        if (this.checkInStatus) {
          this.messageService.showMessage('You were already Checked-Out', 'error');
        } else {
          this.messageService.showMessage('You were already Checked-In', 'error');
        }
      }
      this.checkInStatus = this.userDetails.checkInStatus;
    }, error => {
      this.isChecking = false;
      this.cdrService.callDetectChanges(this.cdr);
      console.error(error);
    });
  }

  maximizeWindow(id, screen) {
    this.ticketActivityOverlayService.maximizeWindow(id, screen);
  }


  closeWindow(event, windowId, id) {
    event.stopPropagation();
    if (this.displayKendoCloseButton && id === this.callRunningActivityId) {
      const dialogData = { title: 'Attention', text: 'Call is Running' };
      this.dialogService.confirm(dialogData, { backdrop: true });
    } else {
      this.ticketActivityOverlayService.checkChanges('Close', windowId, id);
    }
  }

  prevNext(action) {
    if (action == 'next') {
      this.currentBatch += 1
    } else {
      this.currentBatch -= 1
    }
  }

  public appReLoad() {
    // this.serviceWorkerService.updateAvailable();
    // this.serviceWorkerService.getVersionChangedEmitter().subscribe((result) => {
    //   this.serviceWorkerService.updateVersion();
    // })
    document.location.reload(true);
  }
  /** Open chat History */
  openHistory() {
    let dialog = this.dialogService.custom(ChatHistoryComponent, {}, { keyboard: false, backdrop: 'static', size: 'xl' });
  }

  /** Change chat status */
  manageUserChat() {
    if (this.chat.IsOnline) {
      this.userDetails.userChatStatus = 'online';
      this.chat.chatStatustoolTip = "Go Offline with Chat";
    }
    else {
      this.userDetails.userChatStatus = 'offline';
      this.chat.chatStatustoolTip = "Go Online with Chat"
    }
    this.chatSocketService.emit(CHAT_SOCKETNAME.emitChatStatusUpdate, { status: this.userDetails.userChatStatus, userId: this.userDetails.id }, function (): void { });
  }

  /** Enable chat status */
  manageAllChat() {
    if (this.chat.chatStatus.toLowerCase() == "on") {
      this.chat.chatStatus = "off";
      this.userDetails.userChatStatus = 'offline';
    }
    else {
      this.chat.chatStatus = 'on';
      this.userDetails.userChatStatus = 'online';
    }
    this.chatSocketService.emit(CHAT_SOCKETNAME.emitChangeChatStatus, { chatStatus: this.chat.chatStatus, userId: this.userDetails.id }, function (): void { });
    this.chatSocketService.on(CHAT_SOCKETNAME.emitChangeChatStatus, (socketResponse) => {
      if (socketResponse && socketResponse.code !== 2000) {
        this.messageService.showMessage('Error accured while changing status', 'error');
      }
    });
  }

  registerPlivoEvents() {
    const self = this;
    if (!(self.dialerService.plivoWebSdk && self.dialerService.plivoWebSdk.client && self.dialerService.plivoWebSdk.client.callSession)) {
      self.dialerService.plivoWebSdk = new window.Plivo(self.plivoOptions);
    }
    self.dialerService.plivoWebSdk.client.on('onMediaPermission', (response) => {
      self.dialerService.writeLogsToPBX('onMediaPermission', response);
      if (response !== undefined && response.status === "success" && response.stream === true) {
        self.isPlivoUser = true;
      } else {
        self.isPlivoUser = false;
      }
    });
  }


  ngOnInit() {
    //this.updateReminderCount();
    this.getChatStatusHistoryData();
    this.interval = setInterval((): void => {
      this.getChatStatusHistoryData();
    }, 10000);
    this.userDetails = this.userService.getUserDetail();
    if (this.userDetails && this.userDetails.crmAppConfig && this.userDetails.crmAppConfig.crmConfig && this.userDetails.crmAppConfig.crmConfig.hideLiveCRMMenu) {
      if (this.userDetails.crmAppConfig.crmConfig.liveCRMURLList && this.userDetails.crmAppConfig.crmConfig.liveCRMURLList.length > 0) {
        if (this.userDetails.crmAppConfig.crmConfig.liveCRMMenuName && this.userDetails.crmAppConfig.crmConfig.liveCRMMenuName.length > 0) {
          this.liveCRMMenuName = this.userDetails.crmAppConfig.crmConfig.liveCRMMenuName;
          this.disableUrl = true;
        } else {
          this.disableUrl = false;
        }
      }
    }
    this.isCallOverviewUser = this.userService.getProperty('isCallOverviewUser');
    this.isDefaultReseller = this.userService.isDefaultReseller();
    this.dialerData.makeCall = (this.dialerService.makeCall) ? this.dialerService.makeCall : false;
    if (this.dialerService.isPlivoUser) {
      this.isPlivoUser = true;
    }
    this.registerPlivoEvents();

    const userInfo = this.userService.userDetail;
    this.isManagement = this.userService.getProperty('isManagementUser');
    this.isAMManagement = this.userService.getProperty('isAMManagementUser');
    this.isCallOverviewUser = this.userService.getProperty('isCallOverviewUser');
    this.socketService.emit(SOCKETNAME.emitAnsweringMachineStatus, { agentId: this.userDetails.id }, function (): void { });
    this.socketService.on(SOCKETNAME.onAnsweringMachineStatus, (socketResponse) => {
      if (socketResponse && socketResponse.code === 2000) {
        const self = this;
        self.zone.run(() => {
          self.answeringMachine = socketResponse.data;
        }, 10)
        if (this.isChangedAM) {
          if (this.answeringMachine) {
            this.messageService.showMessage('Answering Machine Enabled Successfully', 'success');
          } else {
            this.messageService.showMessage('Answering Machine Disabled Successfully', 'success');
          }
          this.isChangedAM = false;
        }
      } else {
        this.messageService.showMessage('Error while fetching the Answering Machine Status', 'error');
      }
    });
    // this.chatSocketService.on(CHAT_SOCKETNAME.onPendingChatCount,(socketResponse)=>{
    //   if(socketResponse)
    //   {
    //     const self = this;
    //     self.zone.run(() => {
    //       self.pendingSocketCount = socketResponse.data;
    //     }, 10)
    //   }
    // });
    this.userName = userInfo.firstName + ' ' + userInfo.lastName;
    if (this.userDetails.checkInStatus !== undefined) {
      this.checkInStatus = this.userDetails.checkInStatus;
    }

    let windowArray = this.ticketActivityOverlayService.minimizedWindowArray;
    this.currentBatch = 0;
    this.lastBatch = windowArray.length ? (Math.ceil(windowArray.length / 5) - 1) : windowArray.length;
    this.openedWindowList = _.chunk(windowArray, 5);


    this.ticketActivityOverlayService.arrayList.subscribe((result: any) => {
      if (this.currentBatch && (result.list.length && (Math.ceil(result.list.length / 5) - 1) < this.currentBatch)) {
        this.currentBatch -= 1;
      }
      this.lastBatch = result.list.length ? (Math.ceil(result.list.length / 5) - 1) : result.list.length;
      this.openedWindowList = _.chunk(result.list, 5);
    });

    this.endCallSubscription = this.postalChannelService.postalMessage$.subscribe((postalMsg) => {
      if (postalMsg.channel === 'HANGUP_CALL_FROM_TICKET') {
        this.callRunningActivityId = postalMsg.data.id;
        if (postalMsg.data && postalMsg.data.iscallRunning) {
          this.displayKendoCloseButton = true;
        } else {
          this.displayKendoCloseButton = false;
        }
      }
    });
    this.checkTimeAccountingReminder();
    /** Set Chat variable */
    this.getChatStatus();
    this.initChatStatus();

    /** Chat notification when window is closed */
    this.chatNotificationSubs = this.chatSocketService.messageNotification.subscribe(
      (result: any) => {
        if (result) {
          let index = this.ticketActivityOverlayService.minimizedWindowArray.findIndex(x => x.id == result.activityId);
          if (index != -1) {
            if (!this.openedWindowList[this.currentBatch][index].messageCount) {
              this.openedWindowList[this.currentBatch][index].messageCount = 1;
            }
            else {
              this.openedWindowList[this.currentBatch][index].messageCount += 1;
            }
            // this.lastBatch = Math.ceil(index / 5);
            // if (this.lastBatch > 0) { this.lastBatch = this.lastBatch - 1 };
            // if (!this.ticketActivityOverlayService.minimizedWindowArray[index].messageCount) {
            //   this.ticketActivityOverlayService.minimizedWindowArray[index].messageCount = 0;
            // }
            // else {
            //   this.ticketActivityOverlayService.minimizedWindowArray[index].messageCount += 1;
            // }
            // this.openedWindowList = _.chunk(this.ticketActivityOverlayService.minimizedWindowArray, 5);
            // console.log("chat coming....");
          }
        }
      });
  }


  // Initialize Chat Status
  public initChatStatus() {
    if (this.userDetails.userChatStatus === 'offline') {
      this.chat.IsOnline = false;
      this.chat.chatStatustoolTip = "Go Online with Chat"
      this.chatSocketService.emit(CHAT_SOCKETNAME.emitChatStatusUpdate, { status: 'offline', userId: this.userDetails.id }, function (): void { });
    } else if (this.userDetails.userChatStatus === 'online') {
      this.chat.IsOnline = true;
      this.chat.chatStatustoolTip = "Go Offline with Chat"
    } else {
      this.chat.IsOnline = false;
      this.chat.chatStatustoolTip = "Go Online with Chat"
    }
  }

  /**
   * Get chat status
   */
  private getChatStatus() {
    this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_CHAT_STATUS, isCachable: true, showLoading: false, methodType: 'get' }).then((response) => {
      this.chat.chatStatus = response.status;
    }, error => {
      console.error(error);
    });
  }

  private getChatStatusHistoryData() {
    let self = this;
    this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_CHAT_HISTORY_DATA, showLoading: false }).then(
      (response: any) => {
        if (response !== undefined && response !== null && Object.keys(response).length > 0) {
          self.chatHistoryResponse = response;
          if (self.chatHistoryResponse.wait.length) {
            self.pendingChatCount = self.chatHistoryResponse.wait.length;
            self.cdrService.callDetectChanges(this.cdr);
          }
        }
        self.cdrService.callDetectChanges(this.cdr);
      }, (error) => { });
  }

  ngOnDestroy() {
    if (this.subscriptionUpdateReminderCount) {
      this.subscriptionUpdateReminderCount.unsubscribe();
    }
    if (this.subscriptionCheckTimeAccountingReminder) {
      this.subscriptionCheckTimeAccountingReminder.unsubscribe();
    }
    this.socketService.unregister(SOCKETNAME.onAnsweringMachineStatus, () => { });
    clearInterval(this.interval);
    if (this.chatNotificationSubs) { this.chatNotificationSubs.unsubscribe(); }
    if (this.endCallSubscription) {
      this.endCallSubscription.unsubscribe();
    }
  }
}

