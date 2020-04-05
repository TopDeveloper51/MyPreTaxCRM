// External imports
import { Component, OnInit, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, OnDestroy, Input, ViewChild, QueryList, ViewChildren } from '@angular/core';
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment-timezone';
// import * as Raven from 'raven-js';
import * as _ from 'lodash';
// Internal imports
import { UserService } from '@app/shared/services/user.service';
import { Configuration, SOCKETNAME } from '@app/layout/layout.constants';
import { DialerService } from '@app/shared/services/dialer.service';
import { SocketService } from '@app/shared/services/socket.service';
import { IncomingCallNotificationComponent } from '@app/dialer/dialog/incoming-call-notification/incoming-call-notification.component';
import { MessageService } from '@app/shared/services/message.service';
import { PostalChannelService } from '@app/shared/services/postChannel.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
import { LoaderService } from '@app/shared/loader/loader.service';
import { CDRService, DialogService } from '@app/shared/services';
import { DialersService } from '@app/dialer/dialers.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
declare var window: any;
declare var Notification: any;

@Component({
  selector: 'app-dialer',
  templateUrl: './dialer.component.html',
  styleUrls: ['./dialer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialerComponent implements OnInit, OnDestroy {
  @Input() isDialog: boolean;
  @ViewChildren('windowTitleBar') windowTitleBar: QueryList<any>;
  public dialerDetailsForm: FormGroup;
  public subscriptionCheckUserStatus: Subscription;
  public currentUserStatusAllowedCalling: boolean = false;
  public check;
  public countryDetails: any = [];
  public selectedCountry: any = [];
  public userDetails: any = {};
  public isPlivoUser: Boolean;
  public dialerData: any = { makeCall: true, phoneNo: '', countryCode: 'us', dialCode: '(+1)' };
  public plivoUser: any = {};
  public plivoExtension: any;
  public totalNotificationCount: number = 0;
  public language: any;
  public phoneTitle;
  public queue: any;
  public diaolgisOpen: boolean = false;
  public onMediaPermissionSet: boolean = false;
  public phoneNumberToDial;
  public callMode: string;
  public opendedActivitiesCustomerData: any = [];
  plivoOptions: any = {
    "debug": "DEBUG",
    "permOnClick": false,
    "audioConstraints": { "optional": [{ "googAutoGainControl": false }, { "googEchoCancellation": false }] },
    "enableTracking": true
  };
  public plivoUsersOnline: any = [];
  public loadPlivoUsersOnline: any = [];
  public startRefresh: boolean = false;
  public isResuming: boolean = false;
  public isHolding: boolean = false;
  public isChangeUserStatus = false;
  public showDialPad: boolean = false;
  public displayKendoTitleBar: boolean;
  public customerData: any = {};
  public userResellerId: string;
  private callingSystemWatcher: Subscription;
  activityId: any;


  // public modal: NgbActiveModal,
  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private dialerService: DialerService,
    private zone: NgZone,
    private socketService: SocketService,
    private messageService: MessageService,
    private postalChannelService: PostalChannelService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private cdrService: CDRService,
    private dialersService: DialersService,
    private ticketActivityOverlayService: TicketActivityOverlayService) { }

  // Browser Notification
  public _getPermissionForNotification(): void {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission: any): void {
        // Whatever the user answers, we make sure we store the information
        if (!('permission' in Notification)) {
          Notification.permission = permission;
        }
      });
    }
  };

  public goToCustomerCart(customerId) {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }

  public clickDigit(value: string): void {
    if (this.dialerData.makeCall === false) {
      console.log('send dtmf=' + value);
      this.dialerService.plivoWebSdk.client.sendDtmf(value);
      this.dialerService.writeLogsToPBX('sendDtmf', { 'valueSelected': value });
    } else if (this.dialerData.makeCall === true) {
      if (this.dialerData.phoneNo.length <= 30) {
        this.dialerData.phoneNo = this.dialerData.phoneNo + value;
      }
    }
  }

  // Call API for Call Notification
  public getCallNotification() {
    this.dialersService.getCallNotification(this.userDetails.id).then((result: any) => {
      if (result !== undefined && result.wait !== undefined) {
        this.totalNotificationCount = result.wait.length;
        this.cdr.detectChanges();
      }
    });
  }

  // handle call events 
  public handleCallEvents(direction: string, callType: string) {
    if (direction !== undefined) {
      if (callType === 'incoming' || callType === 'outgoing') {
        this.dialerData.makeCall = false;
        this.dialerService.makeCall = false;
        this.dialerData.isMute = false;
        this.dialerService.isMute = false;
        if (direction.toLowerCase() !== 'internal' && direction.toLowerCase() !== 'out') {
          this.dialerData.isResumeShow = false;
          this.dialerService.isResumeShow = false;
          this.dialerData.isHoldShow = true;
          this.dialerService.isHoldShow = true;
        } else {
          this.dialerData.isHoldShow = false;
          this.dialerService.isHoldShow = false;

        }
      } else if (callType === 'hold') {
        this.isHolding = false;
        this.dialerData.isHoldShow = false;
        this.dialerService.isHoldShow = false;
        this.dialerData.isResumeShow = true;
        this.dialerService.isResumeShow = true;
      } else if (callType === 'holdHangup') {
        this.dialerData.isResumeShow = false;
        this.dialerService.isResumeShow = false;
      } else if (callType === 'undohold') {
        this.isHolding = false;
        this.dialerData.isHoldShow = true;
        this.dialerService.isHoldShow = true;
        this.dialerData.isResumeShow = false;
        this.dialerService.isResumeShow = false;
      } else if (callType === 'resume') {
        this.isResuming = false;
        this.dialerData.isResumeShow = false;
        this.dialerService.isResumeShow = false;
        this.dialerData.makeCall = false;
        this.dialerService.makeCall = false;
        this.dialerData.isMute = false;
        this.dialerService.isMute = false;
        this.dialerData.isHoldShow = true;
        this.dialerService.isHoldShow = true;
      } else if (callType === 'undoresume') {
        this.isResuming = false;
        this.dialerData.isResumeShow = true;
        this.dialerService.isResumeShow = true;
        this.dialerData.makeCall = false;
        this.dialerService.makeCall = false;
        this.dialerData.isMute = false;
        this.dialerService.isMute = false;
        this.dialerData.isHoldShow = false;
        this.dialerService.isHoldShow = false;
      }
      this.cdr.detectChanges();
    }
  }

  // check user status
  checkUserStatus() {
    const self = this;
    let currentStatus = this.userService.USER_STATUS;
    let allowedUser = Configuration.allowCallingForUserStatus;
    self.currentUserStatusAllowedCalling = allowedUser.includes(currentStatus);
    self.cdr.detectChanges();

    this.subscriptionCheckUserStatus = this.userService.getUserStatusChangedEmitter().subscribe((status) => {
      let allowedUser = Configuration.allowCallingForUserStatus;
      self.currentUserStatusAllowedCalling = allowedUser.includes(status);
      if (status === 'online') {
        this.plivoUser.userStatus = true;
      } else {
        this.plivoUser.userStatus = false;
      }
      self.cdr.detectChanges();
    });
  }

  // Unregister All Plivo Events
  public unregisterPlivoEvents(): void {
    if (this.dialerService.plivoWebSdk && this.dialerService.plivoWebSdk.client && this.dialerService.plivoWebSdk.client._events) {
      this.dialerService.plivoWebSdk.client._events.onMediaPermission = undefined;
      this.dialerService.plivoWebSdk.client._events.onLogout = undefined;
      this.dialerService.plivoWebSdk.client._events.onCalling = undefined;
      this.dialerService.plivoWebSdk.client._events.onCallRemoteRinging = undefined;
      this.dialerService.plivoWebSdk.client._events.onIncomingCall = undefined;
      this.dialerService.plivoWebSdk.client._events.onIncomingCallCanceled = undefined;
      this.dialerService.plivoWebSdk.client._events.onCallTerminated = undefined;
      this.dialerService.plivoWebSdk.client._events.onCallFailed = undefined;
    }
  }

  public initCallUI() {
    const self = this;
    setTimeout(() => { self.dialerService.plivoWebSdk.client.logout(); self.dialerService.writeLogsToPBX('logout') }, 500);
    self.zone.run(() => { self.callUI(); });
  }

  // Register Call Related Event from PlivoWEBSdk
  public registerPlivoCallRelatedEvents(): void {
    const self = this;
    /** On Call Remote Ringing */
    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onCallRemoteRinging = undefined;
    this.dialerService.plivoWebSdk.client.on('onCallRemoteRinging', function (): void {
      self.dialerService.writeLogsToPBX('onCallRemoteRinging');
      self.zone.run(() => {
        self.dialerData.statusText = 'Ringing..';
        self.cdr.detectChanges();
      });
    });

    /**onCallAnswered */
    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onCallAnswered = undefined;
    this.dialerService.plivoWebSdk.client.on('onCallAnswered', function (): void {
      self.dialerService.writeLogsToPBX('onCallAnswered', { agentId: self.userDetails.id });
      console.log("CaLL aNSWERD ui");
      self.zone.run(() => {
        self.dialerData.statusText = "";
        self.cdr.detectChanges();
        self.handleCallEvents(self.callMode, 'outgoing');
      });
    });

    /** On Incoming */
    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onIncomingCall = undefined;
    this.dialerService.plivoWebSdk.client.on('onIncomingCall', function (account_name: any, extraHeaders: any): void {
      console.log("Event Occur Dialer");
      self.dialerService.writeLogsToPBX('onIncomingCall', { 'account_name': account_name, 'extraHeaders': extraHeaders });
      self.zone.run(() => {
        self.dialerData.statusText = "";
        self.cdr.detectChanges();
        if (self.callMode == 'out') {
          let plainPhonesNumber = (self.dialerData.dialCode + self.dialerData.phoneNo).replace('(', '').replace(')', '').replace('-', '').replace('+', '').replace(' ', '');
          let data: any = {
            'id': self.userDetails.id, 'callUUID': self.dialerService.callUUID, 'phoneNo': plainPhonesNumber, 'queue': self.userDetails.queue, 'direction': 'Out', 'status': 0
          };
          if (plainPhonesNumber) {
            self.localStorageUtilityService.addToLocalStorage('phoneNumber', plainPhonesNumber);
          }

          self.dialersService.getActivityId(data).then((response) => {
            data.actId = response;
            this.displayKendoTitleBar = true;
            self.activityId = data.actId;
            self.socketService.emit(SOCKETNAME.emitUpdateActId, data, function (): void { });
            const dialogDataSet = { 'id': data.actId, 'screen': 'activity', 'searchActivityData': { data: [] }, 'fromHeader': true, dialCode: self.dialerData.dialCode, phoneNo: self.dialerData.phoneNo, 'dateTimeOfCall': moment().tz('America/New_York').format('MM/DD/YY hh:mm A'), callNotification: true, flag: true }
            self.ticketActivityOverlayService.openWindow(dialogDataSet, undefined);
          });
        }
        self.handleCallEvents(self.callMode, 'incoming');
        self.dialerService.plivoWebSdk.client.answer();
        self.dialerService.writeLogsToPBX('answer')
        self.dialerData.statusText = '';
        self.cdr.detectChanges();
      });
    });


    // On Incoming Call Cancelled
    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onIncomingCallCanceled = undefined;
    this.dialerService.plivoWebSdk.client.on('onIncomingCallCanceled', function (): void { self.dialerService.writeLogsToPBX('onIncomingCallCanceled'); self.initCallUI(); });

    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onCallTerminated = undefined;
    this.dialerService.plivoWebSdk.client.on('onCallTerminated', function (cause): void {
      self.dialerService.writeLogsToPBX('onCallTerminated', { 'cause': cause });
      self.postalChannelService.PublishPostalEvent({
        data: { id: self.activityId, iscallRunning: false },
        channel: 'HANGUP_CALL_FROM_TICKET',
        envelope: '',
        topic: ''
      });
      self.initCallUI();
    });

    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onCallFailed = undefined;
    this.dialerService.plivoWebSdk.client.on('onCallFailed', function (cause: any): void {
      self.dialerService.writeLogsToPBX('onCallFailed', { 'cause': cause })
      self.postalChannelService.PublishPostalEvent({
        data: { id: this.activityId, iscallRunning: false },
        channel: 'HANGUP_CALL_FROM_TICKET',
        envelope: '',
        topic: ''
      });
      if (cause === 'Unavailable') {
        self.messageService.showMessage('The person you are trying to call seems "Unavailable" at the moment. please try again later.', 'error');
      } else if (cause === 'Busy') {
        self.messageService.showMessage('The person you are trying to reach is "Busy" at the moment. please callback after sometime.', 'error');
      }
      else if (cause === 'Address Incomplete' || cause === 'Not Found') {
        self.messageService.showMessage('The number you are trying to call is invalid. Please check the number again.', 'error');
      } else if (cause === 'Canceled') {
      }
      // please enter a valid number
      // Raven.captureMessage("Plivo onCallFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      console.error("Plivo onCallFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      self.initCallUI();
    });


    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onLogout = undefined;
    this.dialerService.plivoWebSdk.client.on('onLogout', function (): void {
      self.dialerService.writeLogsToPBX('onLogout')
      self.zone.run(() => { self.callUI(); });
      self.cdr.detectChanges();
    });
  };

  public callUI(): void {
    this.dialerData.makeCall = true;
    this.dialerService.makeCall = true;
    this.dialerData.statusText = '';
    this.showDialPad = false;
    // this.callMode = undefined;
    this.getCallNotification();
    this.cdr.detectChanges();
  };

  // Initialize User Status
  public initUserStatus() {
    if (this.userDetails.userStatus === 'offline') {
      this.socketService.emit(SOCKETNAME.emitUserStatusUpdate, { status: 'online', agentId: this.userDetails.id }, function (): void { });
    } else if (this.userDetails.userStatus === 'online') {
      this.plivoUser.userStatus = true;
    } else {
      this.plivoUser.userStatus = false;
    }
  }

  // phone call dial function
  public dial(phoneNo, phoneNumberToDial, dialCode) {
    this.dialerData.phoneNo = phoneNo ? phoneNo : '';
    this.dialerData.dialCode = dialCode ? dialCode : '(+1)';
    if (phoneNo) {
      this.dialerData.statusText = 'Calling';
      this.cdr.detectChanges();
      this.dialerService.callUUID = undefined;
      this.phoneNumberToDial = phoneNumberToDial;
      this.callMode = 'out';
      this.dialerService.plivoWebSdk.client.login(this.userDetails.plivoUserName, this.userDetails.plivoPwd);
      this.dialerService.writeLogsToPBX('login');
      this.registerOnLoginAndOnLoginFailed();
      this.registerPlivoCallRelatedEvents();
    }
  }

  // Call Internally Between the Agents
  public dialInternalCall(endPointNumber): void {
    // this.loaderService.show();
    if (this.dialerData.makeCall === true) {
      let plivoNumber = 'sip:' + endPointNumber + '@phone.plivo.com';
      this.dialerService.callUUID = undefined;
      this.phoneNumberToDial = plivoNumber;
      this.callMode = 'internal';
      this.dialerService.plivoWebSdk.client.login(this.userDetails.plivoUserName, this.userDetails.plivoPwd);
      this.dialerService.writeLogsToPBX('login')
      this.registerOnLoginAndOnLoginFailed();
      this.registerPlivoCallRelatedEvents();
    }
  };

  // PLIVO WEBSDK METHOD
  public callPlivoNumber(): void {
    const self = this;
    // this.dialerService.connectOutGoingCall(this.phoneNumberToDial).subscribe((result) => { });
    let extraHeaders = { 'X-PH-Mode': this.callMode, 'X-PH-AgentId': this.userDetails.id.replace(/-/gi, '%') };
    this.dialerService.plivoWebSdk.client.call(this.phoneNumberToDial, extraHeaders);
    this.dialerData.makeCall = false;
    this.dialerService.makeCall = false;
    this.dialerData.isMute = false;
    this.dialerService.isMute = false;
    if (this.callMode !== 'internal' && this.callMode !== 'out') {
      this.dialerData.isHoldShow = true;
      this.dialerService.isHoldShow = true;
    } else {
      this.dialerData.isHoldShow = false;
      this.dialerService.isHoldShow = false;
    }
    this.socketService.unregister(SOCKETNAME.onOutCallId, () => { });
    this.socketService.on(SOCKETNAME.onOutCallId, (socketResponse: any) => {
      this.dialerService.callUUID = socketResponse;
      this.handleCallEvents(this.callMode, 'incoming');
      this.dialerData.statusText = "Connecting";
      this.loaderService.hide();
      this.cdr.detectChanges();

      self.zone.run(() => {
        self.dialerData.statusText = "";
        this.cdr.detectChanges();
        if (self.callMode == 'out') {
          let plainPhonesNumber = (self.dialerData.dialCode + self.dialerData.phoneNo).replace('(', '').replace(')', '').replace('-', '').replace('+', '').replace(' ', '');
          let data: any = {
            'id': self.userDetails.id, 'callUUID': self.dialerService.callUUID, 'phoneNo': plainPhonesNumber, 'queue': self.userDetails.queue, 'direction': 'Out', 'status': 0
          };
          if (plainPhonesNumber) {
            self.localStorageUtilityService.addToLocalStorage('phoneNumber', plainPhonesNumber);
          }
          self.dialersService.getActivityId(data).then((response) => {
            data.actId = response;
            this.activityId = data.actId;
            self.socketService.emit(SOCKETNAME.emitUpdateActId, data, function (): void { });
            const dialogDataSet = { 'id': data.actId, 'screen': 'activity', 'searchActivityData': { data: [] }, 'fromHeader': true, dialCode: self.dialerData.dialCode, phoneNo: self.dialerData.phoneNo, 'dateTimeOfCall': moment().tz('America/New_York').format('MM/DD/YY hh:mm A'), callNotification: true, flag: true }
            self.ticketActivityOverlayService.openWindow(dialogDataSet);
            setTimeout(() => {
              this.postalChannelService.PublishPostalEvent({
                data: { id: this.activityId, iscallRunning: true },
                channel: 'HANGUP_CALL_FROM_TICKET',
                envelope: '',
                topic: ''
              });
            }, 2000);
          });
        }
        self.handleCallEvents(self.callMode, 'outgoing');
      });
    });
    this.cdr.detectChanges();
  };

  // Register Event For Login Failed and On Login
  public registerOnLoginAndOnLoginFailed(): void {
    let self = this;
    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events || this.dialerService.plivoWebSdk.client._events.onLogin)
      this.dialerService.plivoWebSdk.client._events.onLogin = undefined;
    this.dialerService.plivoWebSdk.client.on('onLogin', function (): void { self.dialerService.writeLogsToPBX('onLogin'); self.callPlivoNumber(); });

    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events)
      this.dialerService.plivoWebSdk.client._events.onLoginFailed = undefined;
    this.dialerService.plivoWebSdk.client.on('onLoginFailed', function (cause): void {
      self.dialerService.writeLogsToPBX('onLoginFailed', { 'cause': cause });
      self.messageService.showMessage('Error in processing request. please try again', 'error');
      // Raven.captureMessage("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      console.error("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      this.loaderService.hide();
    });
  };

  // Initialize Phone
  public initPhone(): void {
    let self = this;
    if (self.dialerService.plivoWebSdk === undefined || self.dialerService.plivoWebSdk === null || self.dialerService.plivoWebSdk === '' || self.dialerService.plivoWebSdk.client == undefined || self.dialerService.plivoWebSdk.client.callSession === undefined || self.dialerService.plivoWebSdk.client.callSession === null) {
      self.dialerService.plivoWebSdk = new window.Plivo(self.plivoOptions);
    }
    self.dialerService.plivoWebSdk.client.on('onMediaPermission', function (response) {
      self.dialerService.writeLogsToPBX('onMediaPermission', response)
      if (response !== undefined && response.status === "success" && response.stream === true) {
        if (self.onMediaPermissionSet === false) {
          self.onMediaPermissionSet = true;
          console.log('User has a right to access Phone System');

          self._registerSocketEvents();
          self.zone.run(() => {
            self.getCallNotification();
            self.isPlivoUser = true;
            self.dialerService.isPlivoUser = true;
            self.cdr.detectChanges();
          });
        }
      } else {
        self.isPlivoUser = false;
        self.dialerService.isPlivoUser = false;
        self.plivoUser.userStatus = false;
        self.cdr.detectChanges();
      }
    });
    this.dialerService.plivoWebSdk.client.on('onCalling', function (): void {
      self.dialerService.writeLogsToPBX('onCalling')
      self.zone.run(() => { self.handleCallEvents('out', 'outgoing'); });
    });
    this.registerPlivoCallRelatedEvents();
  }

  // Mute the Plivo Call
  public muteUnMuteTheMic(value) {
    this.dialerData.isMute = this.dialerService.isMute = value;
    value ? this.dialerService.plivoWebSdk.client.mute() : this.dialerService.plivoWebSdk.client.unmute();
    value ? this.dialerService.writeLogsToPBX('mute') : this.dialerService.writeLogsToPBX('unmute')
  }
  // Hold Call
  holdCall(): void {
    this.isHolding = true;
    this.cdrService.callDetectChanges(this.cdr);
    const requestObj = this.dialerService.callUUID ? {
      "userId": this.userDetails.id,
      "callUUID": this.dialerService.callUUID
    } : { "userId": this.userDetails.id, "phoneNumber": this.phoneNumberToDial };
    this.socketService.emit(SOCKETNAME.emitCallHold, requestObj, function (): void { });
  }

  // Call API for getting all Online User
  // public getAllPilvoUserOnline() {
  //   const self = this;
  //   this.dialersService.getAllPlivoUserOnline().then((response) => {
  //     if (response) {
  //       self.loadPlivoUsersOnline = response;
  //       _.remove(self.loadPlivoUsersOnline, { "id": this.userDetails.id });
  //       this.cdr.detectChanges();
  //       // self.plivoUsersOnline = process(self.loadPlivoUsersOnline, this.state);
  //     }
  //     else {
  //       self.loadPlivoUsersOnline = [];
  //       self.plivoUsersOnline = [];
  //     }
  //     self.startRefresh = false;
  //     this.cdr.detectChanges();
  //   }, error => {
  //     console.error(error);
  //     self.startRefresh = false;
  //     this.cdr.detectChanges();
  //   });
  // }

  // This function is used when user end call
  public endCall(): void {
    this.loaderService.show();
    if (this.dialerService.plivoWebSdk.client.callSession) {
      // this.dialerService.plivoWebSdk.client.hangup();
      this.socketService.emit(SOCKETNAME.emitHangup, { callId: this.dialerService.callUUID, agentId: this.userDetails.id }, () => { });
    } else {
      this.dialerService.plivoWebSdk.client.logout();
      this.dialerService.writeLogsToPBX('logout')
      this.callUI();
      this.loaderService.hide();
    }
    this.socketService.unregister(SOCKETNAME.onHangup, () => { });
    this.socketService.on(SOCKETNAME.onHangup, (socketResponse: any) => {
      this.callMode = undefined;
      this.callUI();
      this.loaderService.hide();
    });
    this.postalChannelService.PublishPostalEvent({
      data: { id: this.activityId, iscallRunning: false },
      channel: 'HANGUP_CALL_FROM_TICKET',
      envelope: '',
      topic: ''
    });
  }

  _openNotificationDialog(data: any, isOpenFromNotificationIcon: boolean) {
    let path = '';
    if (this.diaolgisOpen === false) {
      if (this.activatedRoute.snapshot && this.activatedRoute.snapshot.url && this.activatedRoute.snapshot.url.length > 0) {
        path = this.activatedRoute.snapshot.url[0].path;
      }
      // notification for incoming call
      if (isOpenFromNotificationIcon === undefined || isOpenFromNotificationIcon === false) {
        this._notifyMe(data.no);
        if (path !== 'dialer') {
          this.openCallOverviewDialog();
        }
      } else {
        if (path !== 'dialer') {
          this.openCallOverviewDialog();
        }
      }
    }
  }

  // Resume Call
  resumeCall(): void {
    this.isResuming = true;
    this.cdrService.callDetectChanges(this.cdr);
    if (this.dialerService.plivoWebSdk.client.callSession) {
      const self = this;
      this.socketService.unregister(SOCKETNAME.onHangup, () => { });
      this.socketService.emit(SOCKETNAME.emitHangup, { callId: this.dialerService.callUUID, agentId: this.userDetails.id }, () => { })
      this.socketService.on(SOCKETNAME.onHangup, (socketResponse: any) => {
        self.onResumeSuccess();
      });
    } else {
      this.onResumeSuccess();
    }
  }

  onResumeSuccess() {
    this.cdrService.callDetectChanges(this.cdr);
    const requestObj = {
      "userId": this.userDetails.id, "callUUID": this.dialerService.holdData.callUUID,
      "queueType": this.dialerService.holdData.queueType, "endPoint": this.userDetails.plivoUserName
    };
    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events) {
      this.dialerService.plivoWebSdk.client._events.onLogin = undefined;
    }
    this.dialerService.plivoWebSdk.client.login(this.userDetails.plivoUserName, this.userDetails.plivoPwd);
    this.dialerService.writeLogsToPBX('login');


    const self = this;
    this.dialerService.plivoWebSdk.client.on('onLogin', function (): void {
      self.dialerService.writeLogsToPBX('onLogin');
      self.callMode = 'In';
      self.socketService.emit(SOCKETNAME.emitCallResume, requestObj, function (): void { });
    });

    if (this.dialerService.plivoWebSdk.client || this.dialerService.plivoWebSdk.client._events) {
      this.dialerService.plivoWebSdk.client._events.onLoginFailed = undefined;
    }

    this.dialerService.plivoWebSdk.client.on('onLoginFailed', function (cause): void {
      self.dialerService.writeLogsToPBX('onLoginFailed', { 'cause': cause });
      // self.messageService.showMessage({ 'type': 'error', 'message': 'Error in processing request. please try again', 'locale': 'ERROR_PROCESS_REQ' });
      self.messageService.showMessage('Error in processing request. please try again', 'error', 'ERROR_PROCESS_REQ');
      // Raven.captureMessage("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      console.error("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
    });
  }


  // Open Call Over view Dialog
  public openCallOverviewDialog() {
    this.diaolgisOpen = true;
    this.dialogService.custom(IncomingCallNotificationComponent, {},
      { keyboard: false, backdrop: 'static', size: 'xl' }).result.then((response) => {
        this.diaolgisOpen = false;
        if (response && Object.keys(response).length > 0) {
          if (response !== undefined && response.isAccept === true) {
            this.dialerService.callUUID = response.callUUID;
            const self = this;
            self.zone.run(() => {
              console.log(response);
              self.handleCallEvents(response.direction, 'incoming');
              self.dialerService.plivoWebSdk.client.answer();
              self.dialerService.writeLogsToPBX('answer');
            });
          }
          // make total notification minus only if notification isd greater then 0
          if (this.totalNotificationCount > 0) {
            this.totalNotificationCount = this.totalNotificationCount - 1;
            this.cdr.detectChanges();
          }
          this.registerPlivoCallRelatedEvents();
        }
        this.cdrService.callDetectChanges(this.cdr);
      });
  }

  // notify for any incoming call
  public _notifyMe(phoneNumber: string): void {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      //   /  alert('This browser does not support desktop notification');
    } else if (Notification.permission === 'granted') { // Let's check if the user is okay to get some notification
      // If it's okay let's create a notification
      const notification = new Notification('Incoming Call from ' + phoneNumber, { body: 'Click Here' });

      notification.onclick = function (e: any): void {
        window.focus();
        // this.cancel();
      };
      setTimeout(notification.close.bind(notification), 10000);
    } else if (Notification.permission !== 'denied') {
      // Otherwise, we need to ask the user for permission
      // Note, Chrome does not implement the permission static property
      // So we have to check for NOT 'denied' instead of 'default'
      Notification.requestPermission(function (permission: any): void {

        // Whatever the user answers, we make sure we store the information
        if (!('permission' in Notification)) {
          Notification.permission = permission;
        }

        // If the user is okay, let's create a notification
        if (permission === 'granted') {
          const notification = new Notification('Hi there!', { body: 'Click Me' });

          notification.onclick = function (e: any): any {
            window.focus();
            // this.cancel();
          };
          setTimeout(notification.close.bind(notification), 5000);
        }
      });
    }

    // At last, if the user already denied any notification, and you
    // want to be respectful there is no need to bother him any more.
  }

  // This function is used to register socket events
  public _registerSocketEvents(): void {
    const self = this;
    self.socketService.on(SOCKETNAME.onUserStatusUpdate, (socketResponse: any) => {
      if (socketResponse && socketResponse.code === 2000) {
        self.userDetails.userStatus = socketResponse.data.status;
        if (self.isChangeUserStatus) {
          self.isChangeUserStatus = false;
          self.messageService.showMessage('Status updated successfully', 'success');
        }
      } else {
        self.userDetails.userStatus = (self.userDetails.userStatus === 'online') ? 'doNotDisturb' : 'online';
        if (self.isChangeUserStatus) {
          self.isChangeUserStatus = false;
          self.messageService.showMessage('Error while updating user status', 'error');
        }
      }
    });

    self.socketService.on(SOCKETNAME.onCallHold, (socketResponse: any) => {
      self.zone.run(() => {
        if (socketResponse && socketResponse.code === 2000) {
          // self.callMode = undefined;
          self.handleCallEvents('', 'hold');
          if (socketResponse && socketResponse.data) {
            self.dialerService.holdData = socketResponse.data;
          }
        } else {
          self.messageService.showMessage('Error while processing call on hold', 'error');
          self.handleCallEvents('', 'undohold');
        }
      });
    });

    self.socketService.on(SOCKETNAME.onCallHungupByCustWhenOnHold, (socketResponse: any) => {
      self.messageService.showMessage('Customer has disconnected the call', 'error');
      self.handleCallEvents('', 'holdHangup');
    });

    self.socketService.on(SOCKETNAME.onCallResume, (socketResponse: any) => {
      self.zone.run(() => {
        if (socketResponse && socketResponse.code === 2000) {
          self.dialerService.callUUID = socketResponse.data.callUUID;
          self.handleCallEvents('', 'resume');
        } else {
          self.messageService.showMessage('Call was resumed by other agent', 'error');
          self.handleCallEvents('', 'undoresume');
        }
      });
      self.postalChannelService.PublishPostalEvent({
        channel: '',
        topic: SOCKETNAME.onCallResume,
        data: socketResponse,
        envelope: ''
      });
    });

    self.socketService.on(SOCKETNAME.onCallResumeByOtherAgent, (socketResponse: any) => {
      self.dialerData.isResumeShow = false;
      self.dialerService.isResumeShow = false;
      self.cdr.detectChanges();
    });

    self.socketService.on(SOCKETNAME.onIncomingCallAcceptedByOtherAgent, (socketResponse: any) => {
      self.postalChannelService.PublishPostalEvent({
        channel: '',
        topic: SOCKETNAME.onIncomingCallAcceptedByOtherAgent,
        data: socketResponse,
        envelope: ''
      });
      self.zone.run(() => {
        self.totalNotificationCount = self.totalNotificationCount > 0 ? self.totalNotificationCount - 1 : self.totalNotificationCount;
        self.cdr.detectChanges();
      });

    });

    self.socketService.on(SOCKETNAME.onIncomingCall, (socketResponse: any) => {
      self.zone.run(() => {
        // on every new notificaiton just increase the notification counter
        self.totalNotificationCount = self.totalNotificationCount + 1;
        self.cdr.detectChanges();
        // not open notification dialog if user status is do not disturb or in call
        if (self.diaolgisOpen === false) {
          self._openNotificationDialog(socketResponse, false);
        }
      });

      self.postalChannelService.PublishPostalEvent({
        channel: '',
        topic: SOCKETNAME.onIncomingCall,
        data: socketResponse,
        envelope: ''
      });
    });

    self.socketService.on(SOCKETNAME.onCallEnded, (socketResponse: any) => {
      if (this.localStorageUtilityService.checkLocalStorageKey('activeCallDetails')) {
        this.localStorageUtilityService.removeFromLocalStorage('activeCallDetails');
      }
      if (socketResponse.reason === 'UNALLOCATED_NUMBER' || socketResponse.reason === 'INVALID_NUMBER_FORMAT') {
        self.messageService.showMessage('Phone Number you have dial is invalid / unallocated', 'error');
      } else if (socketResponse.reason === 'INCOMPATIBLE_DESTINATION') {
        self.messageService.showMessage('Incompatible Destination, Please try after sometime', 'error');
      } else if (socketResponse.reason === 'NO_USER_RESPONSE') {
        self.messageService.showMessage('Customer do not answer the call try after sometime', 'error');
      } else if (socketResponse.reason === 'CALL_REJECTED') {
        self.messageService.showMessage('Call Rejected', 'error');
      } else if (socketResponse.reason === 'NORMAL_CLEARING') {

      }
      self.initCallUI();
      self.postalChannelService.PublishPostalEvent({
        channel: '',
        topic: SOCKETNAME.onCallEnded,
        data: socketResponse,
        envelope: ''
      });
    });
    this.postalChannelService.PublishPostalEvent({
      data: { id: this.activityId, iscallRunning: false },
      channel: 'HANGUP_CALL_FROM_TICKET',
      envelope: '',
      topic: ''
    });
  }

  // This function is used to change user status
  public updateUserStatus(): void {
    let userStatus;
    if (this.plivoUser.userStatus === true) {
      userStatus = 'online';
      this.phoneTitle = "call enable";
    } else {
      userStatus = 'doNotDisturb';
      this.phoneTitle = "call disabld";
    }
    this.socketService.emit(SOCKETNAME.emitUserStatusUpdate, { status: userStatus, agentId: this.userDetails.id }, function (): void { });
    this.isChangeUserStatus = true;
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
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.checkUserStatus();
    if (this.userDetails && this.userDetails.isPlivoUser === true) {
      this.unregisterPlivoEvents();
      this.initPhone();
      this.initUserStatus();
      this._getPermissionForNotification();
      this.dialerData.makeCall = (this.dialerService.makeCall) ? this.dialerService.makeCall : undefined;
      this.dialerData.isMute = (this.dialerService.isMute) ? this.dialerService.isMute : undefined;
      this.dialerData.isHoldShow = (this.dialerService.isHoldShow) ? this.dialerService.isHoldShow : undefined;
      this.dialerData.isResumeShow = (this.dialerService.isResumeShow) ? this.dialerService.isResumeShow : undefined;
      if (this.dialerService.isPlivoUser !== undefined) {
        this.isPlivoUser = this.dialerService.isPlivoUser;
        if (this.isPlivoUser === true) {
          this.getCallNotification();
          this.initUserStatus();
        }
      }
      // this.getAllPilvoUserOnline();
      this.plivoExtension = this.userDetails.plivoExtension;
      this.queue = this.userDetails.queue;
      this.language = this.userDetails.language;
    }
    this.callingSystemWatcher = this.postalChannelService.postalMessage$.subscribe((postalMsg: any) => {
      if (postalMsg.channel === 'CALL_DIALMETHOD' && postalMsg.data) {
        this.dial(postalMsg.data.phoneNo, postalMsg.data.phoneNoToDial, postalMsg.data.dialCode);
      } else if (postalMsg.channel === 'CALL_DIAL_INTERNAL_METHOD' && postalMsg.data) {
        this.dialInternalCall(postalMsg.data.endPointNumber);
      } else if (postalMsg.channel === 'SEND_CUSTOMERDATA_TO_DIALER' && postalMsg.data) {
        this.setTitleBarData(postalMsg.data);
      }
    });
  }

  ngOnDestroy() {
    if (this.cdr) {
      this.cdr.detach();
    }
    if (this.subscriptionCheckUserStatus) {
      this.subscriptionCheckUserStatus.unsubscribe();
    }
    if (this.callingSystemWatcher) {
      this.callingSystemWatcher.unsubscribe();
    }
    this.socketService.unregister(SOCKETNAME.onCallHold, () => { });
    this.socketService.unregister(SOCKETNAME.onCallHungupByCustWhenOnHold, () => { });
    this.socketService.unregister(SOCKETNAME.onCallResume, () => { });
    this.socketService.unregister(SOCKETNAME.onIncomingCall, () => { });
    this.socketService.unregister(SOCKETNAME.onIncomingCallAcceptedByOtherAgent, () => { });
    this.socketService.unregister(SOCKETNAME.onUserStatusUpdate, () => { });
    this.socketService.unregister(SOCKETNAME.onOutgoingCall, () => { });
    this.socketService.unregister(SOCKETNAME.onCallResumeByOtherAgent, () => { });
    this.socketService.unregister(SOCKETNAME.onCallEnded, () => { });
    this.socketService.unregister(SOCKETNAME.onOutCallId, () => { });
  }
}
