import { EventEmitter, Component, OnInit, Input, ChangeDetectorRef, NgZone, Output, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialersService } from '@app/dialer/dialers.service';
import { UserService, SocketService, PostalChannelService, MessageService, DialerService, CDRService, DialogService, LocalStorageUtilityService } from '@app/shared/services';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { Configuration, SOCKETNAME } from '@app/dialer/dialer-constants';
import * as Raven from 'raven-js';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-incoming-calls',
  templateUrl: './incoming-calls.component.html',
  styleUrls: ['./incoming-calls.component.scss']
})
export class IncomingCallsComponent implements OnInit, OnDestroy {
  @Input() isDialog: boolean;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @ViewChildren('windowTitleBar') windowTitleBar: QueryList<any>;
  public userDetails: any = {};
  public callSettings: any;
  public isDataLoading: boolean;
  public refreshDataSubscription: Subscription;
  public callOverviewScreenRefreshInterval: any;
  public refreshInterval: number;
  public clearRefreshInterval: any;
  public startRefresh: boolean;
  public callerList: any = [];
  public currentUserStatusAllowedCalling: boolean;
  public subscriptionCheckUserStatus: Subscription;
  public plivoPostalMsg: any;
  public callUUIDForResume: any;
  plivoObjectToStoreWithLink: any;
  plivoObjectToStoreWithOutLink: any;
  public customerData: any = {};
  public opendedActivitiesCustomerData: any = [];
  public userResellerId: any;
  incomingCallresponseData: { "direction": any; "isAccept": boolean; "callUUID": any; };
  dialStatus: any;
  public callingSystemWatcher: Subscription;
  activityId: any;
  constructor(private messageService: MessageService, private layoutService: DialersService,
    private userService: UserService, private cdrService: CDRService, private cdr: ChangeDetectorRef,
    private socketService: SocketService, private postalChannelService: PostalChannelService, private dialerService: DialerService,
    private zone: NgZone,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private dialogService: DialogService) { }

  getCallOverviewRefreshInterval() {
    this.layoutService.getCallOverviewRefreshInterval().then((response: any) => {
      this.cdrService.callDetectChanges(this.cdr);
      if (response !== undefined && response.callOverviewScreenRefreshInterval !== undefined &&
        response.callOverviewScreenRefreshInterval !== null && response.callOverviewScreenRefreshInterval !== '') {
        this.callOverviewScreenRefreshInterval = response.callOverviewScreenRefreshInterval;
        this.refreshInterval = response.callOverviewScreenRefreshInterval * 1000;
        this.clearRefreshInterval = setInterval(() => {
          this.refreshData();
        }, this.refreshInterval);
        this.cdrService.callDetectChanges(this.cdr);
      }
    });
  }
  public unregisterSocketEvent() {
    if (this.plivoPostalMsg) {
      this.plivoPostalMsg.unsubscribe();
    }
    this.socketService.unregister(SOCKETNAME.onIncomingCallConnectDenied, () => { });
    this.registerSocketEventOnInit();
  }

  public goToCustomerCart(customerId) {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }
  public registerSocketEventOnInit() {
    this.plivoPostalMsg = this.postalChannelService.postalMessage$.subscribe((postalMsg) => {
      if (postalMsg.topic === SOCKETNAME.onIncomingCallAcceptedByOtherAgent) {
        this.zone.run(() => {
          // Remove from incoming caller List
          const currentIndex = this.callerList.findIndex(t => t.callUUID === postalMsg.data.callUUID);
          if (currentIndex !== -1) {
            this.callerList.splice(currentIndex, 1);
          }
          // After remove if there is no record in list then just close the
          if (this.callerList.length <= 0) {
            // self.close(false);
            this.onClose.emit(false);
          }
          this.cdrService.callDetectChanges(this.cdr);
        });
      } else if (postalMsg.topic === SOCKETNAME.onIncomingCall) {
        this.zone.run(() => {
          this.getCallNotification();
        });
      } else if (postalMsg.topic === SOCKETNAME.onCallResume) {
        const self = this;
        this.zone.run(() => {
          if (postalMsg.data && postalMsg.data.code === 2000) {
            this.callUUIDForResume = postalMsg.data.data.callUUID;
            // let responseData = { "isAccept": true, "callUUID": postalMsg.data.data.callUUID, direction: '' };
            // self.onClose.emit(responseData);
          } else {
            this.messageService.showMessage('Call was resumed by other agent', 'error');
            this.dialerService.isResumeShow = false;
            this.callUUIDForResume = undefined;
          }
          // self.close(responseData);
        });
        this.cdrService.callDetectChanges(self.cdr);
      } else if (postalMsg.topic === SOCKETNAME.onCallEnded) {
        if (postalMsg.data.reason === 'NORMAL_CLEARING') {
          this.zone.run(() => {
            // Remove from incoming caller List
            const currentIndex = this.callerList.findIndex(t => t.callUUID === postalMsg.data.callId);
            if (currentIndex !== -1) {
              this.callerList.splice(currentIndex, 1);
            }
            // After remove if there is no record in list then just close the
            if (this.callerList.length <= 0) {
              // self.close(false);
              this.onClose.emit(false);
            }
            this.cdrService.callDetectChanges(this.cdr);
          });
        }
      }
    });
  }

  // Delete contact data
  public deleteCall(event: any, contact: any): void {
    event.stopPropagation();
    // Open dialog for conformation before deleting contact data
    const dialogData = { title: '', text: 'Are you sure, you want to delete?' };
    this.dialogService.confirm(dialogData).result.then((result) => {
      if (result) {
        this.layoutService.deleteCalls(contact.callUUID).then(() => {
          this.messageService.showMessage('Call deleted successfully', 'success');
        }).catch((err) => {
          this.messageService.showMessage('Getting Error While delete Call', 'error');
        });
      }
    });
  }

  onResumeSuccess(plivoObj) {
    plivoObj.isResuming = true;
    this.cdrService.callDetectChanges(this.cdr);
    const requestObj = {
      "userId": this.userDetails.id, "callUUID": plivoObj.callUUID,
      "queueType": (plivoObj.direction).toLowerCase(), "endPoint": this.userDetails.plivoUserName
    };
    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events) {
      this.dialerService.plivoWebSdk.client._events.onLogin = undefined;
    }
    this.dialerService.plivoWebSdk.client.login(this.userDetails.plivoUserName, this.userDetails.plivoPwd);
    this.dialerService.writeLogsToPBX('login');
    const self = this;
    this.dialerService.plivoWebSdk.client.on('onLogin', function (): void {
      self.dialerService.writeLogsToPBX('onLogin');
      if (self.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events) {
        self.dialerService.plivoWebSdk.client._events.onIncomingCall = undefined;
      }
      const that = self;
      self.dialerService.plivoWebSdk.client.on('onIncomingCall', function (account_name: any, extraHeaders: any): void {
        self.dialerService.writeLogsToPBX('onIncomingCall', { 'account_name': account_name, 'extraHeaders': extraHeaders });
        that.zone.run(() => {
          const responseData = { "isAccept": true, "callUUID": that.callUUIDForResume, direction: '' };
          that.onClose.emit(responseData);
          // self.close(responseData);
        });
      });
      self.socketService.emit(SOCKETNAME.emitCallResume, requestObj, function (): void { });
    });

    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events) {
      this.dialerService.plivoWebSdk.client._events.onLoginFailed = undefined;
    }
    this.dialerService.plivoWebSdk.client.on('onLoginFailed', function (cause): void {
      self.dialerService.writeLogsToPBX('onLoginFailed', { 'cause': cause });
      self.messageService.showMessage('Error in processing request. please try again', 'error');
      Raven.captureMessage("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      console.error("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
    });
  }

  // When user resume call 
  resume(plivoObj): void {
    if (this.dialerService.plivoWebSdk.client.callSession) {
      this.socketService.unregister(SOCKETNAME.onHangup, () => { });
      this.socketService.emit(SOCKETNAME.emitHangup, { callId: this.dialerService.callUUID, agentId: this.userDetails.id }, () => { })
      this.socketService.on(SOCKETNAME.onHangup, (socketResponse: any) => {
        this.onResumeSuccess(plivoObj);
      });
    } else {
      console.log("Fired Else");
      this.onResumeSuccess(plivoObj);
    }
  }

  // When user accept call make socket request for
  accept(plivoObj: any): void {
    if (this.dialerService.plivoWebSdk.client.callSession) {
      this.messageService.showMessage('Another Call Session is running', 'error', 'ERROR_PROCESS_REQ');
    } else {

      try {
        const self = this;

        plivoObj.isAccepting = true;
        self.plivoObjectToStoreWithLink = plivoObj;
        self.plivoObjectToStoreWithOutLink = JSON.parse(JSON.stringify(plivoObj));
        self.dialerService.plivoWebSdk.client.login(self.userDetails.plivoUserName, self.userDetails.plivoPwd);
        self.dialerService.writeLogsToPBX('login');
        // onlogin success


        if (self.dialerService.plivoWebSdk.client || self.dialerService.plivoWebSdk.client._events) {
          self.dialerService.plivoWebSdk.client._events.onLogin = undefined;
        }

        self.dialerService.plivoWebSdk.client.on('onLogin', (): void => {
          self.dialerService.writeLogsToPBX('onLogin');
          self.afterLogin();
        });
        if (self.dialerService.plivoWebSdk.client || self.dialerService.plivoWebSdk.client._events) {
          self.dialerService.plivoWebSdk.client._events.onLoginFailed = undefined;
        }
        self.dialerService.plivoWebSdk.client.on('onLoginFailed', (cause): void => {
          self.dialerService.writeLogsToPBX('onLoginFailed', { 'cause': cause });
          self.messageService.showMessage('Error in processing request. please try again', 'error');
          Raven.captureMessage("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
          console.error("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
        });

        if (self.dialerService.plivoWebSdk.client || self.dialerService.plivoWebSdk.client._events) {
          self.dialerService.plivoWebSdk.client._events.onIncomingCall = undefined;
        }

        self.dialerService.plivoWebSdk.client.on('onIncomingCall', (account_name: any, extraHeaders: any): void => {
          self.dialerService.writeLogsToPBX('onIncomingCall', { 'account_name': account_name, 'extraHeaders': extraHeaders });
          console.log("OnIncoming Call Fired");
          self.zone.run(() => {
            self.plivoObjectToStoreWithLink.isAccepting = false;
            self.dialerService.callUUID = plivoObj.callUUID;
            self.incomingCallresponseData = { "direction": plivoObj.direction, "isAccept": true, "callUUID": plivoObj.callUUID };
            self.onClose.emit(self.incomingCallresponseData);
          });
        });

        if (self.dialerService.isEventRegister === false) {
          self.dialerService.isEventRegister = true;

          self.socketService.on(SOCKETNAME.onIncomingCallConnectDenied, (socketResponse) => {
            self.zone.run(() => {
              const data = socketResponse;
              if (data.status === 0 && data.direction !== 'Internal') {
                self.layoutService.getActivityId(data).then((response) => {
                  data.actId = response;
                  self.activityId = data.actId;
                  self.socketService.emit(SOCKETNAME.emitUpdateActId, data, (): void => { });
                  const dialogDataSet = { 'id': data.actId, 'screen': 'activity', 'searchActivityData': { data: [] }, callNotification: true, flag: true };
                  self.ticketActivityOverlayService.openWindow(dialogDataSet, undefined);
                  setTimeout(() => {
                    self.postalChannelService.PublishPostalEvent({
                      data: { id: self.activityId, iscallRunning: true },
                      channel: 'HANGUP_CALL_FROM_TICKET',
                      envelope: '',
                      topic: ''
                    });
                  }, 1000);
                });
              } else if (data.status === 1) {
                self.messageService.showMessage('Call is already accepted by other agent', 'error', 'CALL_CONNECTED');
              } else if (data.status === 2) {
                self.messageService.showMessage('Call is already droped', 'error', 'CALL_DROPPED');
              }
              if (data.status === 1 || data.status === 2) {
                const currentIndex = self.callerList.findIndex(i => i.callUUID === self.plivoObjectToStoreWithOutLink.callUUID);
                if (currentIndex !== -1) {
                  self.callerList.splice(currentIndex, 1);
                }
                if (self.callerList.length <= 0) {
                  // self.close(false);
                  self.onClose.emit(false);
                }
              }
              self.cdrService.callDetectChanges(self.cdr);
            });
          });
        }
      } catch (err) {
        console.log("IncCallAcceptError", err);
      }
    }
  }
  // manually set max length
  public onlyNumeric(event: any, seconds: any): boolean {
    if (parseInt(seconds, 0) === 0) {
      this.callOverviewScreenRefreshInterval = undefined;
      return false;
    } else if (seconds === undefined || seconds === null || seconds === '' || seconds.length === 0) {
      if (!(event.keyCode >= 49 && event.keyCode <= 57)) {
        return false;
      }
    } else if (seconds.length > 0) {
      if (!(event.keyCode >= 48 && event.keyCode <= 57)) {
        return false;
      }
    }
    return true;
  }
  // clear interval if seconds become 0
  public refreshIntervalChange(seconds): any {
    if (parseInt(seconds, 0) === 0) {
      this.callOverviewScreenRefreshInterval = undefined;
    }
  }

  public changeInterval(): any {
    this.cdrService.callDetectChanges(this.cdr);
    this.layoutService.saveCallOverviewRefreshInterval(this.callOverviewScreenRefreshInterval).then((response) => {
      if (response !== undefined && response !== null && response === true) {
        this.messageService.showMessage('Refresh Interval updated successfully', 'success');
        this.refreshInterval = parseInt(this.callOverviewScreenRefreshInterval, 0) * 1000;
        this.cdrService.callDetectChanges(this.cdr);
        // first clear the interval and then
        if (this.clearRefreshInterval) {
          clearInterval(this.clearRefreshInterval);
        }
        // Call At given seconds
        const self = this;
        if (!self.isDialog) {
          self.clearRefreshInterval = setInterval(() => {
            self.refreshData();
          }, this.refreshInterval);
        }
      } else if (response === undefined || response === false) {
        this.messageService.showMessage('Error while updating refresh interval', 'error');
      }
    });
  }

  public afterLogin(): void {
    this.plivoObjectToStoreWithOutLink.plivoUserName = this.userDetails.plivoUserName;
    this.zone.run(() => {
      this.socketService.emit(SOCKETNAME.emitIncomingCallConnect, this.plivoObjectToStoreWithOutLink, (): void => { });
    });
  }
  // To close Dialod
  close(data: any): void {
    this.onClose.emit(data);
    this.cdrService.callDetectChanges(this.cdr);
  }

  public getCallNotification() {
    this.layoutService.getCallNotification(this.userDetails.id).then((response: any
    ) => {
      this.isDataLoading = false;
      this.startRefresh = false;
      if (response !== undefined) {
        this.callerList = (response.wait).concat(response.hold);
        this.callerList = this.callerList.concat(response.active);
      }
      this.cdrService.callDetectChanges(this.cdr);
      this.layoutService.emitRefreshStopEvent(false);
    }, (error) => {
      this.callerList = [];
      this.isDataLoading = false;
    });
  }

  checkUserStatus() {
    const currentStatus = this.userService.USER_STATUS;
    const allowedUser = Configuration.allowCallingForUserStatus;
    this.currentUserStatusAllowedCalling = allowedUser.includes(currentStatus);
    this.cdr.detectChanges();

    this.subscriptionCheckUserStatus = this.userService.getUserStatusChangedEmitter().subscribe((status) => {
      const allowedUser = Configuration.allowCallingForUserStatus;
      this.currentUserStatusAllowedCalling = allowedUser.includes(status);
      this.cdr.detectChanges();
    });
  }

  public refreshData(): void {
    this.callerList = [];
    this.isDataLoading = true;
    this.startRefresh = true;
    this.cdrService.callDetectChanges(this.cdr);
    this.getCallNotification();
  }

  public trackByFn(index, ele) {
    return index;
  }

  public updateSettings(element) {
    this.callSettings.forEach((setting: any) => {
      const key = element.status + 'Duration';
      if (setting.type === element.status && element[key] > (setting.durationInMin * 60 * 1000)) {
        element.backgroundColor = setting.backgroundColor;
      }
    });
    return element.backgroundColor;
  }


  ngOnDestroy() {
    if (this.subscriptionCheckUserStatus) {
      this.subscriptionCheckUserStatus.unsubscribe();
    }
    if (this.plivoPostalMsg) {
      this.plivoPostalMsg.unsubscribe();
    }
    if (this.callingSystemWatcher) {
      this.callingSystemWatcher.unsubscribe();
    }
    this.socketService.unregister(SOCKETNAME.onIncomingCallConnectDenied, () => { });
    if (this.refreshDataSubscription) {
      this.refreshDataSubscription.unsubscribe();
    }
    clearTimeout(this.clearRefreshInterval);
    this.dialerService.isEventRegister = false;
    this.cdr.detach();
  }

  setTitleBarData(data) {
    if (data && data.activityData && data.activityData.customerData) {
      this.opendedActivitiesCustomerData = [];
      this.customerData = data.activityData.customerData;
      this.customerData.customerId = data.activityData.customerId;
      this.customerData.activityId = data.activityData.ID;
      this.userResellerId = this.userService.getResellerId();
      this.customerData.userResellerId = this.userService.getResellerId();
      this.customerData.activityCustomerFinalInformation = '';
      if (this.customerData !== undefined && this.customerData != null) {
        this.customerData.activityCustomerFinalInformation += this.customerData.customerName;
        if (this.customerData.address1 !== '' && this.customerData.address1 !== undefined && this.customerData.address1 !== null) {
          this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.address1;
        }
        if (this.customerData.zipCode !== '' && this.customerData.zipCode !== undefined && this.customerData.zipCode !== null) {
          this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.zipCode;
        }
        if (this.customerData.state !== '' && this.customerData.state !== undefined && this.customerData.state !== null) {
          this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.state;
        }
        if (this.customerData.city !== '' && this.customerData.city !== undefined && this.customerData.city !== null) {
          this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.city;
        }
        if (this.customerData.customerNumber !== '' &&
          this.customerData.customerNumber !== undefined && this.customerData.customerNumber !== null) {
          this.customerData.activityCustomerFinalInformation += ' ( ' + this.customerData.customerNumber + ' )';
        }
      }
      if (this.customerData.salesProcessStatus !== undefined && this.customerData.salesProcessStatus === 'BlackListed') {
        this.customerData.showBlacklistIcon = true;
      } else {
        this.customerData.showBlacklistIcon = false;
      }
      if (this.customerData.doNotCall !== undefined && this.customerData.doNotCall === true &&
        (this.customerData.type === 'phonecall' && this.customerData.direction === 'out')) {
        this.customerData.isDoNotCall = true;
      } else {
        this.customerData.isDoNotCall = false;
      }
    }
    this.opendedActivitiesCustomerData.push(this.customerData);
    this.cdr.detectChanges();
    this.onClose.emit(this.incomingCallresponseData);
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.callSettings = this.userDetails.crmAppConfig.callNotificationDialogSettings;
    this.isDataLoading = true;
    this.refreshDataSubscription = this.layoutService.getRefreshEmitter().subscribe((response) => {
      this.refreshData();
    });
    this.checkUserStatus();
    this.getCallNotification();
    this.unregisterSocketEvent();
    if (!this.isDialog) {
      this.getCallOverviewRefreshInterval();
    }
    this.callingSystemWatcher = this.postalChannelService.postalMessage$.subscribe((postalMsg: any) => {
      if (postalMsg.channel === 'SEND_CUSTOMERDATA_TO_DIALER' && postalMsg.data) {
        // this.setTitleBarData(postalMsg.data);
      }
    });
  }

}
