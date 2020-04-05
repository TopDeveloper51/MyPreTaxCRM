import { Component, OnInit, NgZone, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnChanges, ɵɵNgOnChangesFeature, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import * as _ from 'lodash';
import * as moment from 'moment-timezone';

import { TicketActivityDetailService } from "@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service";
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { Subscription } from 'rxjs';
import { Configuration, SOCKETNAME } from '@app/ticket-activity/ticket-activity.constants';
import { UserService } from '@app/shared/services/user.service';
import { DialerService } from '@app/shared/services/dialer.service';
import { MessageService } from '@app/shared/services/message.service';
import { SocketService } from '@app/shared/services/socket.service';
import { LoaderService } from '@app/shared/loader/loader.service';
import { PostalChannelService } from '@app/shared/services/postChannel.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
import { SystemConfigurationService } from '@app/shared/services/system-configuration.service';
import { DialogService } from '@app/shared/services/dialog.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { CopyToClipboardService } from '@app/shared/services/copy-clipboard.service';
import { ActivityCallHangupComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/activity-call-hangup/activity-call-hangup.component';

declare var window: any;

@Component({
  selector: 'mtpo-ta-customer',
  templateUrl: './ta-customer.component.html',
  styleUrls: ['./ta-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TACustomerComponent implements OnInit, OnDestroy {
  @Input('activityId') currentActivityId;
  @Input() modelData: any = {};
  @Output() dialStatusEmit: EventEmitter<any> = new EventEmitter<any>();
  public lookup: any = {};
  public activityData: any = {};
  public dialerData: any = {};
  public customerInfo: any;
  private initCustomerInfo: any;
  public isInValidNumber = false;
  public integrityServiceSubscription: Subscription;
  public customerDetailsForm: FormGroup;
  // User Details
  public userDetails: any = {};
  public endCallPostMsg: any = {};
  public isInNewTab: boolean;
  public showLoading: boolean;
  /** Plivo Related Variables Start */
  private plivoWebSdk;
  public dialStatus: string = '';
  public callUUID: string = '';
  public plivoPostalMsg: Subscription;
  private zone: NgZone;
  public isDoNotCall: boolean = false;
  public incomingCallNotification = false;
  plivoOptions: any = {
    "debug": "DEBUG",
    "permOnClick": false,
    "audioConstraints": { "optional": [{ "googAutoGainControl": false }, { "googEchoCancellation": false }] },
    "enableTracking": true
  };
  public plivoSettings: any = { hasMediaPermision: false, onMediaPermissionSet: false, isPlivoUser: false, isOnHold: false, currentUserStatusAllowedCalling: false };
  public subscriptionCheckUserStatus: Subscription;
  private outcomeLookupDialog = false;
  public contactPersonChatEmail;
  /** Plivo Related Variables End */

  constructor(private fb: FormBuilder,
    private integrityService: TicketActivityIntegrityService,
    private detailService: TicketActivityDetailService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private dialerService: DialerService,
    private messageService: MessageService,
    private socketService: SocketService,
    private loaderService: LoaderService,
    private postalChannelService: PostalChannelService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private systemConfig: SystemConfigurationService,
    private dialogService: DialogService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private clipboard: CopyToClipboardService, ) { }

  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "contactPerson":
        selected = [];
        selected = this.lookup.contactPersonData.map(
          item => item.id
        );
        this.customerDetailsForm.get("contactPerson").patchValue(selected);
        break;
    }
  }

  public onClearAll(clearSelectfor) {
    switch (clearSelectfor) {
      case "contactPerson":
        this.customerDetailsForm.get("contactPerson").patchValue([]);
        break;
    }
  }

  public initCustomerDetailsForm() {
    this.customerDetailsForm = this.fb.group({
      customerId: this.fb.control(''),
      salesProcessStatus: this.fb.control(''),
      userPhoneNumber: this.fb.control(''),
      selectedCountry: this.fb.control(''),
      contactPerson: [],
      countryCodeList: this.fb.control(undefined)
    })
  }

  /**
   * Purpose to get the customer information using customerId
   * @param id : customerId
   */
  public getCustomerDetails(customerId) {
    this.detailService.getCustomerDetails(customerId).then(
      (response: any) => {
        if (this.lookup && Object.keys(this.lookup).length > 0) {
          this.showLoading = false;
        }
        this.customerInfo = JSON.parse(JSON.stringify(response));
        this.customerInfo.customerId = customerId;
        //  response.contactPerson = _.map(response.contactPerson, 'contactPersonId');
        if (this.activityData && this.activityData.contactPerson) {
          response.contactPerson = this.activityData.contactPerson;
          response.contactPerson.sort((a, b) => 0 - (a.contactPerson > b.contactPerson ? -1 : 1));
        } else {
          response.contactPerson = _.map(response.contactPerson, 'contactPersonId');
        }
        if(response.contactPerson && this.contactPersonChatEmail)
        {
          for(let key of response.contactPerson)
          {
            if(key === this.contactPersonChatEmail)
            {
              let chatEmail = [];
              chatEmail.push(JSON.parse(JSON.stringify(key))); 
              response.contactPerson = chatEmail;
            }
          }
        }
        this.customerDetailsForm.patchValue(response);

        this.initCustomerInfo = this.customerDetailsForm.value;
        if (this.lookup && Object.keys(this.lookup).length > 0) {
          this.initContactPersonLookup();
        }

        let activityCustomerFinalInformation = '';
        if (this.customerInfo != undefined && this.customerInfo != null) {
          activityCustomerFinalInformation += this.customerInfo.customerName;
          if (this.customerInfo.address1 !== '' && this.customerInfo.address1 !== undefined && this.customerInfo.address1 !== null) {
            activityCustomerFinalInformation += ', ' + this.customerInfo.address1;
          }
          if (this.customerInfo.zipCode !== '' && this.customerInfo.zipCode !== undefined && this.customerInfo.zipCode !== null) {
            activityCustomerFinalInformation += ', ' + this.customerInfo.zipCode;
          }
          if (this.customerInfo.state !== '' && this.customerInfo.state !== undefined && this.customerInfo.state !== null) {
            activityCustomerFinalInformation += ', ' + this.customerInfo.state;
          }
          if (this.customerInfo.city !== '' && this.customerInfo.city !== undefined && this.customerInfo.city !== null) {
            activityCustomerFinalInformation += ', ' + this.customerInfo.city;
          }
          if (this.customerInfo.customerNumber !== '' && this.customerInfo.customerNumber !== undefined && this.customerInfo.customerNumber !== null) {
            activityCustomerFinalInformation += ' ( ' + this.customerInfo.customerNumber + ' )';
          }
          if (this.activityData.doNotCall !== undefined && this.activityData.doNotCall == true && (this.activityData.type == 'phonecall' && this.activityData.direction === 'out')) {
            this.isDoNotCall = true;
          } else {
            this.isDoNotCall = false;
          }
        }

        this.integrityService.sendMessage({ channel: 'customer', topic: 'customerInfo', data: { 'id': this.activityData.id, info: this.customerInfo, 'shortInfo': activityCustomerFinalInformation }, id: this.modelData.id })
        this.customerInfo.activityCustomerFinalInformation = activityCustomerFinalInformation;

      }, error => {
        this.showLoading = false;
        this.cdr.detectChanges();
      }
    )
  }

 
  private initContactPersonLookup() {
    const self = this;
    self.customerInfo.contactPerson.sort((a, b) => 0 - (a.contactPersonName > b.contactPersonName ? -1 : 1));
    if (self.customerInfo.contactPerson) {
      self.lookup.contactPersonData = [];
      self.customerInfo.contactPerson.forEach(function (obj: any): void {
        let contactPersonObj: any = {};
        contactPersonObj.id = obj.contactPersonId;
        contactPersonObj.name = obj.contactPersonName;
        contactPersonObj.name += obj.phone ? ' ' + obj.phone : '';
        contactPersonObj.name += obj.isInvalidNumber ? ' - Invalid Number' : '';
        contactPersonObj.name += obj.isWrongNumber ? ' - Wrong Number' : '';
        contactPersonObj.name += obj.email ? ' ' + obj.email : '';
        contactPersonObj.name += (obj.role && obj.role.length > 0) ? ' ' + '(' + obj.role + ')' : '';
        contactPersonObj.phone = obj.phone;
        contactPersonObj.email = obj.email;
        contactPersonObj.nameInSmall = obj.contactPersonName.toLowerCase();
        self.lookup.contactPersonData.push(contactPersonObj);
        self.setInvalidFlagForNumber();
      });
      self.setUserSelected();
      self.setUserPhoneNumber();

      if (!self.activityData.to) {
        if (self.activityData.contactPerson && self.activityData.contactPerson.length > 0 && self.customerInfo.contactPerson.find((obj: any) => { obj.contactPersonId == self.activityData.contactPerson[0] })) {
          const obj = self.customerInfo.contactPerson.find((obj: any) => { obj.contactPersonId == self.activityData.contactPerson[0] })
          if (obj) {
            self.activityData.to = obj.email;
          }
        } else {
          if (self.customerInfo.contactPerson && self.customerInfo.contactPerson.length > 0) {
            self.activityData.to = self.customerInfo.contactPerson[0].email;
          }
        }
      }
      self.cdr.detectChanges();
    }
    this.plivoSettings.hasMediaPermision = false; // flag for media permission
    this.dialerService.hasMediaPermission = false
    this.dialerData.isMute = false;
    let isCountryisAlreadySelected = false;
    if (this.userDetails !== undefined && this.userDetails.isPlivoUser === true) {
      const countryDetailsData = this.systemConfig.getCountryDetail();
      this.lookup.countryDetails = [];
      for (const obj of countryDetailsData) {
        this.lookup.countryDetails.push({ value: obj.dialCode.replace(/[^\w]/gi, '').trim(), dialCode: obj.dialCode, label: obj.countryName + ' ' + obj.dialCode, countryCode: obj.countryCode });
      };
      this.plivoSettings.isPlivoUser = true;
      this.plivoSettings.onMediaPermissionSet = false;
      this.RegisterPlivoEvents();

      _.forEach(this.lookup.countryDetails, function (country) {
        if (country.isSelected === true) {
          isCountryisAlreadySelected = true;
        }
      });

      if (isCountryisAlreadySelected === false) {
        this.lookup.countryDetails[0].isSelected = true;
      }
    }

  }
  public setUserPhoneNumber(event?) {

    if (event == undefined) {
      if (this.customerInfo != undefined && this.customerInfo.country != undefined && this.userDetails.isPlivoUser == true) {
        var currentIndexOfCountry = _.indexOf(_.map(this.lookup.countryDetails, 'countryCode'), this.customerInfo.country.toLowerCase());
        if (currentIndexOfCountry !== -1) {
          _.forEach(this.lookup.countryDetails, function (country) {
            country.isSelected = false;
          });
          this.lookup.countryDetails[currentIndexOfCountry].isSelected = true;
          this.dialerData.dialCode = this.lookup.countryDetails[currentIndexOfCountry].dialCode;
          this.activityData.selectedCountry = this.lookup.countryDetails[currentIndexOfCountry].value;
        }
      }
    }

    let contactPersonID;
    this.customerDetailsForm.get('userPhoneNumber').setValue(undefined);
    if (this.customerDetailsForm.value && this.customerDetailsForm.value.contactPerson && this.customerDetailsForm.value.contactPerson.length > 0) {
      if (this.customerDetailsForm.value.contactPerson.length === 1) {
        contactPersonID = this.customerDetailsForm.value.contactPerson[0];
      }
    }
    if (contactPersonID !== undefined) {
      let currentObject = this.customerInfo.contactPerson.find((obj) => {
        if (obj.contactPersonId == contactPersonID) {
          return obj;
        }
      })
      if (currentObject !== undefined) {
        this.customerDetailsForm.get('userPhoneNumber').setValue(currentObject.phone);
        this.customerDetailsForm.get('countryCodeList').setValue(this.modelData && this.modelData.dialCode && this.modelData.dialCode || '1');
        this.activityData.userPhoneNumber = currentObject.phone;
      }
    } else {
      this.customerDetailsForm.get('countryCodeList').setValue(this.modelData.dialCode || '1');
    }
    this.dialerData.dialCode = '(+' + this.customerDetailsForm.value.selectedCountry + ')';
    this.initCustomerInfo = Object.assign(this.initCustomerInfo, this.customerDetailsForm.value);
    this.cdr.detectChanges();
  }

  private setUserSelected(): void {
    if (this.activityData.id == undefined && this.activityData.id == null) {
      if (this.lookup.contactPersonData !== undefined && this.lookup.contactPersonData.length > 0) {
        if (!this.customerDetailsForm.value.contactPerson || this.customerDetailsForm.value.contactPerson.length > 0) {
          this.customerDetailsForm.controls.contactPerson.setValue([]);
          this.customerDetailsForm.controls.contactPerson.setValue([this.lookup.contactPersonData[0].id]);
          this.setInvalidFlagForNumber();
        }
      }
    }
    this.cdr.detectChanges();
  }

  public setInvalidFlagForNumber() {
    if (this.customerDetailsForm.value.contactPerson && this.customerDetailsForm.value.contactPerson.length > 0) {
      for (let obj of this.customerDetailsForm.value.contactPerson) {
        for (let object of this.lookup.contactPersonData) {
          if (object.id == obj) {
            if ((object.name.indexOf('Invalid') !== -1) || (object.name.indexOf('Wrong') !== -1)) {
              this.isInValidNumber = true;
              break;
            } else {
              this.isInValidNumber = false;
            }
          }
        }
        if (this.isInValidNumber) {
          break;
        }
      }
    }
  }

  public onContactSelected(event) {
    if (event.length == 0) {
      this.activityData.to = undefined;
    } else if (event.length > 0) {
      for (const obj of this.customerInfo.contactPerson) {
        if (obj.contactPersonId == event[0].id) {
          this.activityData.to = obj.email;
          break;
        }
      }
    }
    this.setUserPhoneNumber();
    this.setInvalidFlagForNumber();
    if(event[0]) {
      this.integrityService.sendMessage({ channel: 'activityDialogToEmail', topic: 'activityDialogToEmail', data: event[0].email });
    }
    this.cdr.detectChanges();
  }

  /********************************************************************* Plivo code start ****************************************************/

  /**
    * @author Satyam Jasoliya
    * @createdDate 24/10/2019
    * @description check user status right
    * @memberof TACustomerComponent
    */
  private checkUserStatus() {
    const self = this;
    let currentStatus = this.userService.USER_STATUS;
    let allowedUser = Configuration.allowCallingForUserStatus;
    self.plivoSettings.currentUserStatusAllowedCalling = allowedUser.includes(currentStatus);

    this.subscriptionCheckUserStatus = this.userService.getUserStatusChangedEmitter().subscribe((status) => {
      let allowedUser = Configuration.allowCallingForUserStatus;
      self.plivoSettings.currentUserStatusAllowedCalling = allowedUser.includes(status);
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 24/10/2019
  * @description mute unmute the microphone
  * @memberof TACustomerComponent
  */
  public muteUnMuteTheMic(value: boolean) {
    if (this.modelData && this.modelData['fromHeader']) {
      this.dialerData.isMute = this.dialerService.isMute = value;
      value ? this.dialerService.plivoWebSdk.client.mute() : this.dialerService.plivoWebSdk.client.unmute();
      value ? this.dialerService.writeLogsToPBX('mute') : this.dialerService.writeLogsToPBX('unmute');
    } else {
      this.dialerData.isMute = value;
      if (value) {
        this.plivoWebSdk.client.mute();
        this.dialerService.writeLogsToPBX('mute');
      } else {
        this.plivoWebSdk.client.unmute();
        this.dialerService.writeLogsToPBX('unmute');
      }
    }
    this.cdr.detectChanges();
  };

  /**
  * @author Satyam Jasoliya
  * @createdDate 24/10/2019
  * @description unmute the microphone
  * @memberof TACustomerComponent
  */

  public unmuteTheMic() {
    this.dialerData.isMute = false;
    this.plivoWebSdk.client.unmute();
    this.dialerService.writeLogsToPBX('unmute');
    this.cdr.detectChanges();
  };

  /**
  * @author Satyam Jasoliya
  * @createdDate 24/10/2019
  * @description call dial (handle dial method)
  * @memberof TACustomerComponent
  */

  public dial(data): void {
    if (this.dialerService.plivoWebSdk && this.dialerService.plivoWebSdk.client.callSession) {
      this.messageService.showMessage('Another Call Session is running', 'error');
    } else {
      this.dialStatus = 'Connecting';
      this.dialStatusEmit.emit(this.dialStatus);
      if (this.customerInfo.doNotCall !== undefined && this.customerInfo.doNotCall == true) {
        this.messageService.showMessage("This customer has opted for Don't Call Again", 'error');
      } //this.dialerData.dialCode
      const phoneNumber = (this.customerDetailsForm.value.countryCodeList + this.customerDetailsForm.value.userPhoneNumber).replace('(', '').replace(')', '').replace('-', '').replace(' ', '').replace(/[.*+?^${}()|[\]\\]/g, '');
      let selectedActivityID;
      if (this.activityData.id) {
        selectedActivityID = this.activityData.id;
      }
      const self = this;
      this.plivoWebSdk.client.login(this.userDetails.plivoUserName, this.userDetails.plivoPwd);
      self.dialerService.writeLogsToPBX('login');
      if (this.plivoWebSdk.client || this.plivoWebSdk.client._events) {
        this.plivoWebSdk.client._events.onLogin = undefined;
      }
      this.plivoWebSdk.client.on('onLogin', function (): void {
        self.dialerService.writeLogsToPBX('onLogin');
        self.callPlivoNumber(phoneNumber, selectedActivityID)
      });

      if (self.plivoWebSdk.client || self.plivoWebSdk.client._events) {
        self.plivoWebSdk.client._events.onLoginFailed = undefined;
      }
      self.plivoWebSdk.client.on('onLoginFailed', function (cause): void {
        self.dialerService.writeLogsToPBX('onLoginFailed', { 'cause': cause });
        self.messageService.showMessage('Error in processing request. please try again', 'erorr');
        // Raven.captureMessage("Plivo onLoginFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      });
    }
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 24/10/2019
  * @description call plivo number and socket integration (this method is use first for make call) (PLIVO WEBSDK METHOD)
  * @memberof TACustomerComponent
  */

  public callPlivoNumber(phoneNumber, selectedActivityID): void {
    const self = this;
    // this.dialerService.connectOutGoingCall(this.phoneNumberToDial).subscribe((result) => { });
    let extraHeaders = { 'X-PH-Mode': 'out', 'X-PH-ACT': selectedActivityID.replace(/-/gi, '%'), 'X-PH-AgentId': this.userDetails.id.replace(/-/gi, '%') };
    this.plivoWebSdk.client.call(phoneNumber, extraHeaders);
    this.modelData['fromHeader'] = undefined;
    this.dialerData.makeCall = false;
    this.dialerService.makeCall = false;
    this.dialerData.isMute = false;
    this.dialerService.isMute = false;
    this.dialerData.isHoldShow = true;
    this.dialerService.isHoldShow = true;
    this.handleCall(phoneNumber);
    this.postalChannelService.PublishPostalEvent({
      data: { id: this.currentActivityId, iscallRunning: true },
      channel: 'HANGUP_CALL_FROM_TICKET',
      envelope: '',
      topic: ''
    });
    this.socketService.unregister(SOCKETNAME.onOutCallId, () => { });
    this.socketService.on(SOCKETNAME.onOutCallId, (socketResponse: any) => {
      this.callUUID = socketResponse;
      this.handleCall(phoneNumber);
      this.dialerData.makeCall = false;
      this.dialerData.isMute = false;
      this.dialerData.isHoldShow = true;
      this.loaderService.hide();
      this.cdr.detectChanges();
    });
    this.cdr.detectChanges();

    this.socketService.unregister(SOCKETNAME.onOutgoingCall, () => { });
    self.socketService.on(SOCKETNAME.onOutgoingCall, (socketResponse: any) => {
      self.callUUID = socketResponse.data;
      self.handleCall(phoneNumber);
      self.dialerData.makeCall = false;
      self.dialerData.isMute = false;
      self.dialerData.isHoldShow = true;
      self.loaderService.hide();
      self.cdr.detectChanges();
    });
    if (this.plivoPostalMsg) {
      this.plivoPostalMsg.unsubscribe();
    }
    this.plivoPostalMsg = this.postalChannelService.postalMessage$.subscribe((postalMsg) => {
      if (postalMsg.topic === SOCKETNAME.onCallEnded) {
        if (postalMsg.data.actId === this.modelData.id) {
          this.onCallEnded(postalMsg);
        }
      }
    });
    // this.plivoPostalMsg = this.postalChannelService.postalMessage$.subscribe((postalMsg) => {
    //   if ("onCallEnded" === SOCKETNAME.onCallEnded) {
    //    // if ("b3a22e24-a0de-4f6a-a60e-a287d1809e98" === "b3a22e24-a0de-4f6a-a60e-a287d1809e98") {
    //       this.onCallEnded(postalMsg);
    //    // }
    //   }
    // });
  }

  /**
    * @author Satyam Jasoliya
    * @createdDate 24/10/2019
    * @description handle dialer click send dtmf signal
    * @memberof TACustomerComponent
    */

  public clickDigit(digit: any): void {
    if (this.modelData && this.modelData['fromHeader']) {
      this.dialerService.plivoWebSdk.client.sendDtmf(digit);
    } else {
      this.plivoWebSdk.client.sendDtmf(digit);
    }

    this.dialerService.writeLogsToPBX('sendDtmf', { 'valueSelected': digit });
  };

  /**
    * @author Satyam Jasoliya
    * @createdDate 24/10/2019
    * @description handle on end call click event (CRM To Phone)
    * @memberof TACustomerComponent
    */
  public endCall(data): void {
    this.loaderService.show();
    if (this.dialerData.makeCall === false && this.modelData && this.modelData['fromHeader']) {
      // this.modelData['fromHeader'] = undefined;
      if (this.dialerService.plivoWebSdk.client.callSession) {
        this.dialerService.plivoWebSdk.client.hangup();
        // this.dialerService.callUUID
        this.socketService.emit(SOCKETNAME.emitHangup, { callId: this.callUUID, agentId: this.userDetails.id }, () => { })
      } else {
        this.dialerService.plivoWebSdk.client.logout();
        this.dialerService.writeLogsToPBX('logout');
        this.dialerData.makeCall = true;
        this.dialerData.isHoldShow = false;
        this.dialerData.isResumeShow = false;
        this.plivoSettings.isOnHold = false;
        this.loaderService.hide();
        this.cdr.detectChanges();
      }
    } else {
      if (this.dialerData.makeCall === false) {
        if (this.plivoWebSdk.client.callSession) {
          this.plivoWebSdk.client.hangup();
          this.socketService.emit(SOCKETNAME.emitHangup, { callId: this.callUUID, agentId: this.userDetails.id }, () => { })
          this.dialerService.plivoWebSdk.client.logout();
        } else {
          this.plivoWebSdk.client.logout();
          this.dialerService.writeLogsToPBX('logout');
          this.dialerData.makeCall = true;
          this.dialerData.isHoldShow = false;
          this.dialerData.isResumeShow = false;
          this.plivoSettings.isOnHold = false;
          this.loaderService.hide();
          this.cdr.detectChanges();
        }
      }
    }
    this.socketService.unregister(SOCKETNAME.onHangup, () => { });
    this.socketService.on(SOCKETNAME.onHangup, (socketResponse: any) => {
      this.dialerData.makeCall = true;
      this.dialerData.isHoldShow = false;
      this.dialerData.isResumeShow = false;
      this.plivoSettings.isOnHold = false;
      this.loaderService.hide();
      this.cdr.detectChanges();
    });
    this.postalChannelService.PublishPostalEvent({
      data: { id: this.currentActivityId, iscallRunning: false },
      channel: 'HANGUP_CALL_FROM_TICKET',
      envelope: '',
      topic: ''
    });
    this.dialStatus = '';
    this.dialStatusEmit.emit(this.dialStatus);
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 24/10/2019
   * @description handle call
   * @memberof TACustomerComponent
   */
  public handleCall(phoneNumber?: any) {
    const self = this;
    if (self.plivoWebSdk.client || self.plivoWebSdk.client._events)
      self.plivoWebSdk.client._events.onIncomingCall = undefined;
    self.plivoWebSdk.client.on('onIncomingCall', () => {
      self.dialerService.writeLogsToPBX('onIncomingCall');
      self.zone.run(() => {
        self.plivoWebSdk.client.answer();
        if (phoneNumber) {
          let activeCallDetails = {
            customerID: self.activityData.customerId,
            customerName: self.customerInfo.customerName,
            phoneNumber: phoneNumber,
            contactPersonId: self.activityData.contactPerson
          }
          self.localStorageUtilityService.addToLocalStorage('activeCallDetails', activeCallDetails);
        }
        self.dialerService.writeLogsToPBX('answer');
        self.dialStatus = '';
        self.dialStatusEmit.emit(this.dialStatus);
        self.cdr.detectChanges();
      });
    });

    if (self.plivoWebSdk.client || self.plivoWebSdk.client._events)
      self.plivoWebSdk.client._events.onCallAnswered = undefined;
    self.plivoWebSdk.client.on('onCallAnswered', () => {
      self.dialerService.writeLogsToPBX('onCallAnswered', { agentId: self.userDetails.id });
      self.zone.run(() => {
        self.plivoWebSdk.client.answer();
        if (phoneNumber) {
          let activeCallDetails = {
            customerID: self.activityData.customerId,
            customerName: self.customerInfo.customerName,
            phoneNumber: phoneNumber,
            contactPersonId: self.activityData.contactPerson
          }
          self.localStorageUtilityService.addToLocalStorage('activeCallDetails', activeCallDetails);
        }
        self.dialerService.writeLogsToPBX('answer');
        self.dialStatus = '';
        self.dialStatusEmit.emit(this.dialStatus);
        self.cdr.detectChanges();
      });
    });
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 24/10/2019
   * @description transform number
   * @memberof TACustomerComponent
   */
  private transformNumber(val) {
    val = val ? val.replace('+', '') : '';
    if (val !== undefined && val !== null) {
      var val1 = val.substring(0, val.length - 10);
      var val2 = val.substring(val.length - 10);
      var s2 = ("" + val2).replace(/\D/g, '');
      var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      return (!m) ? null : (((val1) ? "+" + val1 + " " : "") + "(" + m[1] + ") " + m[2] + "-" + m[3]);
    } else {
      return '';
    }
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 24/10/2019
   * @description register plivo events all event is handle this function (oncallTerminated,onHold etc...)
   * @memberof TACustomerComponent
   */
  private RegisterPlivoEvents(): void {
    this.plivoWebSdk = new window.Plivo(this.plivoOptions);
    const self = this;
    // event on media permission
    this.plivoWebSdk.client.on('onMediaPermission', function (response) {
      self.dialerService.writeLogsToPBX('onMediaPermission', response);
      if (response !== undefined && response.status === "success" && response.stream === true) {
        if (self.plivoSettings.onMediaPermissionSet === false) {
          self.zone.run(() => {
            self.plivoSettings.onMediaPermissionSet = true;
            if (self.modelData && self.modelData['fromHeader']) {
              self.dialerData.makeCall = false;
            } else {
              self.dialerData.makeCall = true;
            }
            self.plivoSettings.hasMediaPermision = true;
            self.dialerService.hasMediaPermission = true;
            self.cdr.detectChanges();
          });
        }
      }
    });

    // Dialer Service Call for the Header Calling Only
    if (self.modelData && self.modelData['fromHeader']) {
      self.dialerData.makeCall = false;
      self.cdr.detectChanges();
      if (self.plivoPostalMsg) {
        self.plivoPostalMsg.unsubscribe();
      }
      self.plivoPostalMsg = self.postalChannelService.postalMessage$.subscribe((postalMsg) => {
        if (postalMsg.topic === SOCKETNAME.onCallEnded) {
          if (postalMsg.data.actId === self.modelData.id) {
            self.onCallEnded(postalMsg);
          }
        }
      });

    }
    // event on call Ringing
    self.plivoWebSdk.client.on('onCallRemoteRinging', (): void => {
      self.dialerService.writeLogsToPBX('onCallRemoteRinging');
      self.dialStatus = '';
      self.dialStatusEmit.emit(self.dialStatus);
      self.cdr.detectChanges();
    });

    // event on call terminated
    self.plivoWebSdk.client.on('onCallTerminated', function (cause: any): void {
      self.dialerService.writeLogsToPBX('onCallTerminated', { 'cause': cause });
      // logout user when call is terminated
      self.endCallPostMsg = {
        //actId: "4739cbbb-e279-4c1b-a832-7282dba1a5f2",
        actId: self.activityData.id,
        callId: self.callUUID,
        reason: cause.reason
      };
      self.dialStatus = '';
      self.dialStatusEmit.emit(this.dialStatus);
      self.onCallEnded(self.endCallPostMsg);
      setTimeout(() => {
        self.plivoWebSdk.client.logout();
        self.dialerService.writeLogsToPBX('logout');
      }, 500);
      self.postalChannelService.PublishPostalEvent({
        data: { id: self.currentActivityId, iscallRunning: false },
        channel: 'HANGUP_CALL_FROM_TICKET',
        envelope: '',
        topic: ''
      });
    });

    self.plivoWebSdk.client.on('onCallFailed', function (cause: any): void {
      self.dialerService.writeLogsToPBX('onCallFailed', { 'cause': cause });
      self.dialStatus = '';
      self.dialStatusEmit.emit(this.dialStatus);
      self.postalChannelService.PublishPostalEvent({
        data: { id: this.currentActivityId, iscallRunning: false },
        channel: 'HANGUP_CALL_FROM_TICKET',
        envelope: '',
        topic: ''
      });
      if (cause === 'Unavailable') {
        self.zone.run(() => {
          self.messageService.showMessage('The person you are trying to call seems "Unavailable" at the moment. please try again later.', 'error');
          //   Raven.captureMessage("Plivo onCallFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
          // let phoneNumber2 = (self.dialerData.dialCode + self.userPhoneNumber).replace('(', '').replace(')', '').replace('-', '').replace(' ', '').replace(/[.*+?^${}()|[\]\\]/g, '');
          // self.openDialogOnHangUpActivityCall(phoneNumber2);
        });

      } else if (cause === 'Busy') {
        self.zone.run(() => {
          self.messageService.showMessage('The person you are trying to reach is "Busy" at the moment. please callback after sometime.', 'error');
          // Raven.captureMessage("Plivo onCallFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
          // let phoneNumber3 = (self.dialerData.dialCode + self.userPhoneNumber).replace('(', '').replace(')', '').replace('-', '').replace(' ', '').replace(/[.*+?^${}()|[\]\\]/g, '');
          // self.openDialogOnHangUpActivityCall(phoneNumber3);
        });
      } else if (cause === 'Address Incomplete' || cause === 'Not Found') {
        self.messageService.showMessage('The number you are trying to call is invalid. Please check the number again.', 'error');
        // Raven.captureMessage("Plivo onCallFailed " + cause + " 'UserId': " + self.userDetails.id + " 'EndPoint': " + self.userDetails.plivoUserName + " 'Time': " + moment().tz('America/New_York').format('MM/DD/YY hh:mm A'));
      } else if (cause === 'Canceled') {
        // nothig to do
      }
      self.zone.run(() => {
        self.dialerData.makeCall = true;
        self.cdr.detectChanges();
      });
      setTimeout(() => {
        self.plivoWebSdk.client.logout();
        self.dialerService.writeLogsToPBX('logout');
      }, 500);
      self.cdr.detectChanges();
    });
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 24/10/2019
   * @description open dialog activity call
   * @memberof TACustomerComponent
   */
  private openDialogOnHangUpActivityCall(phoneNumberOnEndCall?: any): any {
    // this.isMaximize = false;
    this.outcomeLookupDialog = true;
    this.dialogService.custom(ActivityCallHangupComponent, { 'data': {}, 'disableClose': true }, { 'keyboard': false, 'backdrop': 'static', 'size': 'lg' })
      .result.then((response) => {
        if (response) {
          this.outcomeLookupDialog = false;
          let callId = this.callUUID;
          if (this.modelData && this.modelData['fromHeader']) {
            callId = this.dialerService.callUUID;
          }
          let obj: any = {
            'callHangupAction': response,
            'activityId': this.activityData.id,
            'callId': callId,
            'agentId': this.userDetails.id,
            'customerId': this.customerInfo.id,
            'phoneNumber': phoneNumberOnEndCall
          };
          this.loaderService.show();
          this.socketService.emit(SOCKETNAME.CallOutDocCreate, obj, (): void => { });
          this.socketService.unregister(SOCKETNAME.onCallOutDocCreate, () => { });
          this.socketService.on(SOCKETNAME.onCallOutDocCreate, (socketResponse: any) => {
            if (socketResponse && socketResponse.code === 2000) {
              response = response.replace(/\w\S*/g, (l) => { return l.charAt(0).toUpperCase() + l.substr(1).toLowerCase(); });  //to capitalize first letter of each word
              this.activityData.information = 'On ' + moment().tz('America/New_York').format('MM/DD/YY hh:mm A') + ', ' + this.userDetails.firstName + ' ' + this.userDetails.lastName + ' called on ' + this.transformNumber(phoneNumberOnEndCall) + ' - ' + response + '<br>' +
                ((this.activityData.information !== undefined && this.activityData.information !== '') ? '<br>' + this.activityData.information : '');
              if (socketResponse.data.callHangupAction === 'wrong number' || socketResponse.data.callHangupAction === 'talked to customer') {
                this.activityData.subject = (this.activityData.subject !== undefined && this.activityData.subject !== '') ? this.activityData.subject + ' - ' + response : ''
              }
              if (socketResponse.data.callHangupAction === 'wrong number') {
                this.activityData.status_value = '2';
              }
              this.integrityService.sendMessage({ id: this.modelData.id, channel: '', topic: 'activityData', data: this.activityData });
              if (socketResponse.data.callHangupAction !== 'talked to customer') {
                if (!(this.activityData.type === '1on1setup' && this.activityData.direction === 'out')) {
                  if (this.isInNewTab === true) {
                    window.close();
                  } else {
                    const arrOfActivityIds = this.ticketActivityOverlayService.getPreserveGridData();
                    let currentActivityIndex;
                    if (arrOfActivityIds && arrOfActivityIds.length > 0) {
                      currentActivityIndex = arrOfActivityIds.findIndex(obj => obj === this.modelData.id);
                    }
                    if (currentActivityIndex === (arrOfActivityIds.length - 1)) {
                      this.detailService.saveData('SaveAndClose');
                    } else {
                      const data: any = {};
                      data.id = this.modelData.id;
                      data.for = this.modelData.screen;
                      this.detailService.saveData('SaveAndNext', data);
                    }
                  }
                }
              }
              this.dialerData.makeCall = true;
              if (this.modelData && this.modelData['fromHeader']) {
                this.modelData['fromHeader'] = undefined;
              }
            } else {
              this.messageService.showMessage('Error while processing call out document creation', 'error');
            }
            this.loaderService.hide();
          });
        }
        //       let callId = this.callUUID;
        //       if (this.modelData && this.modelData['fromHeader']) {
        //         callId = this.dialerService.callUUID;
        //       }



      }, (error) => {
        console.log(error);
        this.outcomeLookupDialog = false;
      });
    // this.dialogService.custom(ActivityCallHangupComponent, { 'data': {}, 'disableClose': true }, this.viewContainerRef)
    //   .subscribe((response: any) => {
    //   //  this.isMaximize = true;
    //     if (response !== undefined && response !== '') {
    //       let callId = this.callUUID;
    //       if (this.modelData && this.modelData['fromHeader']) {
    //         callId = this.dialerService.callUUID;
    //       }

    //       let obj: any = {
    //         'callHangupAction': response,
    //         'activityId': this.activityData.id,
    //         'callId': callId,
    //         'agentId': this.userDetails.id,
    //         'customerId': this.customerInfo.id,
    //         'phoneNumber': phoneNumberOnEndCall
    //       }
    //       this.loaderService.show();
    //       this.socketService.emit(SOCKETNAME.CallOutDocCreate, obj, function (): void { });
    //       this.socketService.unregister(SOCKETNAME.onCallOutDocCreate, () => { });
    //       this.socketService.on(SOCKETNAME.onCallOutDocCreate, (socketResponse: any) => {
    //         if (socketResponse && socketResponse.code === 2000) {
    //           response = response.replace(/\b\w/g, function (l) { return l.toUpperCase() })  //to capitalize first letter of each word
    //           this.activityData.information = 'On ' + moment().tz('America/New_York').format('MM/DD/YY hh:mm A') + ', ' + this.userDetails.firstName + ' ' + this.userDetails.lastName + ' called on ' + this.transformNumber(phoneNumberOnEndCall) + ' - ' + response + '<br>' +
    //             ((this.activityData.information !== undefined && this.activityData.information !== '') ? '<br>' + this.activityData.information : '');
    //           if (socketResponse.data.callHangupAction === 'wrong number' || socketResponse.data.callHangupAction === 'talked to customer') {
    //             this.activityData.subject = (this.activityData.subject !== undefined && this.activityData.subject !== '') ? this.activityData.subject + ' - ' + response : ''
    //           }
    //           if (socketResponse.data.callHangupAction === 'wrong number') {
    //             this.activityData.status_value = '2';
    //           }
    //           if (socketResponse.data.callHangupAction !== 'talked to customer') {
    //             if (!(this.activityData.type === '1on1setup' && this.activityData.direction === 'out')) {
    //               if (this.isInNewTab == true) {
    //                 window.close();
    //               } else {
    //                 // if (this.currentActivityIndex == (this.arrOfActivityIds.length - 1)) {
    //                 //   this.saveData('SaveAndClose')
    //                 // } else {
    //                 //   let data: any = {};
    //                 //   data.id = this.arrOfActivityIds[this.currentActivityIndex + 1].id;
    //                 //   data.for = this.modelData.screen;
    //                 //   this.saveData('SaveAndNext', data);
    //                 // }
    //               }
    //             }
    //           }
    //           this.dialerData.makeCall = true;
    //           if (this.modelData && this.modelData['fromHeader']) {
    //             this.modelData['fromHeader'] = undefined;
    //           }
    //           this.cdr.detectChanges();
    //         } else {
    //           this.messageService.showMessage('Error while processing call out document creation', 'error');
    //         }
    //         this.loaderService.hide();
    //       })
    //     }
    //     this.cdr.detectChanges();
    //   }, (error) => {
    //     this.cdr.detectChanges();
    //   });
  };

  /**
   * @author Mansi Makwana
   * @createdDate 11/02/2019
   * @description this method is use to copy contact person name
   * @memberof TACustomerComponent
   */

  public copyClipboard(copyText: any): void {
    this.clipboard.copy(copyText);
    this.messageService.showMessage('Copied successfully', 'success');
  };

  /**
   * @author Satyam Jasoliya
   * @createdDate 24/10/2019
   * @description handle on end call click event (phone To CRM)
   * @memberof TACustomerComponent
   */
  private onCallEnded(endCallPostMsg) {
    const self = this;
    if (self.localStorageUtilityService.checkLocalStorageKey('activeCallDetails')) {
      self.localStorageUtilityService.removeFromLocalStorage('activeCallDetails');
    }
    if (endCallPostMsg.reason === 'UNALLOCATED_NUMBER' || endCallPostMsg.reason === 'INVALID_NUMBER_FORMAT') {
      setTimeout(() => {
        let phoneNumber = (self.customerDetailsForm.value.countryCodeList + self.customerDetailsForm.value.userPhoneNumber).replace('(', '').replace(')', '').replace('-', '').replace(' ', '').replace(/[.*+?^${}()|[\]\\]/g, '');
        self.activityData.information = 'On ' + moment().tz('America/New_York').format('MM/DD/YY hh:mm A') + ', ' + self.userDetails.firstName + ' ' + self.userDetails.lastName + ' called on <span style=\"color:#ff0000;\">' + self.transformNumber(phoneNumber) + ' - Invalid Number </span> <br>' +
          ((self.activityData.information !== undefined && self.activityData.information !== '') ? '<br>' + self.activityData.information : '');
        self.cdr.detectChanges()
      }, 500);
    } else if (endCallPostMsg.reason === 'INCOMPATIBLE_DESTINATION') {
      if (self.isInNewTab) {
        self.messageService.showMessage('Incompatible Destination, Please try after sometime', 'error');
      }
    } else {
      self.zone.run(() => {
        self.dialerData.makeCall = true;
        // if (self.isInNewTab !== true) {
        // self.overlayDialogService.maximizeDialog(self.modelData['dialogId']);
        // }
        self.ticketActivityOverlayService.maximizeWindow(this.modelData.id, this.modelData.screen);
        //if (this.modelData.id === postalMsg.data.actId)
        if ((endCallPostMsg && endCallPostMsg.data && this.activityData.id === endCallPostMsg.data.actId) || (endCallPostMsg && endCallPostMsg.actId && this.activityData.id === endCallPostMsg.actId)) {
          let phoneNumber1 = (this.customerDetailsForm.value.countryCodeList + this.customerDetailsForm.value.userPhoneNumber).replace('(', '').replace(')', '').replace('-', '').replace(' ', '').replace(/[.*+?^${}()|[\]\\]/g, '');
          if (!this.outcomeLookupDialog) {
            self.openDialogOnHangUpActivityCall(phoneNumber1);
          }
        }
      });
      self.cdr.detectChanges();
    }
    self.handleCall();
    self.dialerData.makeCall = true;
    self.dialStatus = '';
    self.dialStatusEmit.emit(this.dialStatus);
    self.loaderService.hide();
    self.cdr.detectChanges();
  }
  // reister call hangup event. 
  _registerCallHangup() {
    this.socketService.on(SOCKETNAME.onCallEnded, (socketResponse: any) => {
      if (socketResponse.reason === 'UNALLOCATED_NUMBER' || socketResponse.reason === 'INVALID_NUMBER_FORMAT') {
        this.messageService.showMessage('Phone Number you have dial is invalid / unallocated', 'error');
      } else if (socketResponse.reason === 'INCOMPATIBLE_DESTINATION') {
        this.messageService.showMessage('Incompatible Destination, Please try after sometime', 'error');
      } else if (socketResponse.reason === 'NO_USER_RESPONSE') {
        this.messageService.showMessage('Customer do not answer the call try after sometime', 'error');
      } else if (socketResponse.reason === 'CALL_REJECTED') {
        this.messageService.showMessage('Call Rejected', 'error');
      } else if (socketResponse.reason === 'NORMAL_CLEARING') {

      }
      if (this.modelData['fromHeader']) {
        this.onCallEnded(socketResponse);
      }
      // this.plivoWebSdk.client.logout();
      // this.dialerService.writeLogsToPBX('logout');
    });
    this.socketService.unregister(SOCKETNAME.onHangup, () => { });
    this.socketService.on(SOCKETNAME.onHangup, (socketResponse: any) => {
      this.dialerData.makeCall = true;
      this.dialerData.isHoldShow = false;
      this.dialerData.isResumeShow = false;
      this.plivoSettings.isOnHold = false;
      this.dialStatus = '';
      this.dialStatusEmit.emit(this.dialStatus);
      this.cdr.detectChanges();
    });



  }

  /********************************************************************* Plivo code end ****************************************************/

  /** Lifecycle hook called on first time initialization of the component */
  ngOnInit() {
    // this._registerCallHangup();
    this.showLoading = true;
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.checkUserStatus();
    this.initCustomerDetailsForm();
    this.userDetails = this.userService.getUserDetail();
    this.integrityServiceSubscription = this.integrityService.getMessage().subscribe(msgObj => {

      if (msgObj.topic == 'lookup') {
        this.lookup = msgObj.data;
        if (this.customerInfo) {
          this.showLoading = false;
          this.initContactPersonLookup();
        }
      }

      if (msgObj.id === this.modelData.id && this.modelData) {
        // && this.currentActivityId && this.currentActivityId === msgObj.id
        if (msgObj.topic == 'customerID') {
          this.showLoading = true;
          this.cdr.detectChanges();
          this.getCustomerDetails(msgObj.data);
        } else {
          // this.showLoading = false;
          // this.cdr.detectChanges();
        }
        if (msgObj.topic === 'activityId') {
          this.currentActivityId = msgObj.data;
        }
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
        }
        if (msgObj.topic == 'save') {
          let hasChanges = !_.isEqual(this.customerDetailsForm.value, this.initCustomerInfo);
          this.integrityService.sendMessage({ channel: 'customer', topic: 'saveData', data: { 'isValid': this.customerDetailsForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'customerInfo': this.customerDetailsForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
        }
      }
      else if (!this.currentActivityId) {
        /**  
         * description : when open dialog for new activity that time currentActivityId is undefined and cond won't fullfil to get customerdetail   
         */
        if (msgObj.topic === 'customerID') {
          this.getCustomerDetails(msgObj.data);
        }
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
        }
      }
      if (msgObj.topic === 'chatEmail') {
          this.contactPersonChatEmail = msgObj.data.contactPersonId;
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
  //   console.log('TCustCheck')
  // }
}
