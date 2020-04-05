// Import External
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs/Subscription';

import { Component, OnInit, OnDestroy, NgZone, ViewContainerRef, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { UserService } from '@app/shared/services/user.service';
import { PouchDbService } from '@app/shared/services/pouch-db.service';
import { DialerService } from '@app/shared/services/dialer.service';
import { MessageService } from '@app/shared/services/message.service';
import { CommonApiService } from '@app/shared/services/common-api.service';
import { APINAME, Configuration, SOCKETNAME } from '@app/predictive-dialer/predictive-dialer-constants';
import { SocketService } from '@app/shared/services/socket.service';
import { LoaderService } from '@app/shared/loader/loader.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
import { PredictiveDialerListComponent } from '@app/predictive-dialer/dialogs/predictive-dialer-list/predictive-dialer-list.component';
import { DialogService } from '@app/shared/services/dialog.service';
import { PredictiveDialerService } from '@app/predictive-dialer/predictive-dialer.service';
declare var window: any;

@Component({
    templateUrl: 'predictive-dialer-view.component.html',
    styleUrls: ['predictive-dialer-view.component.scss']
})

export class PredictiveDialerViewComponent implements OnInit, OnDestroy {

    public subscriptionCheckUserStatus: Subscription;
    public currentUserStatusAllowedCalling: boolean = false;

    public interval: any;
    public stats: any;

    isDemo: boolean = false;
    demoData: any = {};
    ruleNameForMandatoryFields = ['Dont Call again', 'pd customer already renewed', 'call this year again', 'call next year again', 'further action'];

    sessionLookup: any = []

    appointmentDetails: any = [];
    timePeriod: any = [];
    showMonthYear: boolean = false;
    mandatoryBPDetails: boolean = false;
    showFurtherAction: boolean = true;
    showDialPad: boolean = false;
    callActive: boolean;
    currentTime: any = 0;
    plivoWebSdk;

    userDetails: any = {};
    onMediaPermissionSet: boolean = false;
    predictiveDialer: any = { 'bankName': [] };
    predictiveMakeCall: Boolean = true;
    isCustomerInformationReady: boolean = false;
    iscallComing: boolean = false;
    customerInfo: any = { "mainAddress": {} };
    ticketInfo: any = {};
    overviewForDialer: any = {};
    overviewForRenewalDetails: any = {};
    isMute: Boolean = false;
    showRenewal: boolean = false;
    timeoutForIncompleteCustomerInfo: any;
    predictiveDialerStatus: boolean = false;
    plivoOptions: any = {
        "debug": "DEBUG",
        "permOnClick": false,
        "audioConstraints": { "optional": [{ "googAutoGainControl": false }, { "googEchoCancellation": false }] },
        "enableTracking": true
    };
    rules: string;


    bankLookup: any = [];
    renewalType: any = [];
    currentSoftware: any = [
        { 'id': 'NewToMarket', 'name': 'New To Market' },
        { 'id': 'IDidNotAsk', 'name': 'I didn\'t Ask' },
        { 'id': 'CustNotWillingToAnswer', 'name': 'Cust. not willing' }
    ];

    bankProduct: any = [
        { 'id': 'NotBPCustomer', 'name': 'Not a Bank Product Cust.' },
        { 'id': 'IDidNotAsk', 'name': 'I didn\'t Ask' },
        { 'id': 'CustNotWillingToAnswer', 'name': 'Cust. not willing' }
    ];

    preferredLanguageLookup: any = [{
        'id': 'sp', 'name': 'Spanish'
    }]


    // constructor for intitialize service intsance
    constructor(private userService: UserService, private dialogService: DialogService, private viewContainerRef: ViewContainerRef, private dialerService: DialerService, private messageService: MessageService, private socketService: SocketService, private zone: NgZone,
        private cdr: ChangeDetectorRef, private _commonAPI: CommonApiService, private pouchDbService: PouchDbService, private loaderService: LoaderService, private route: ActivatedRoute, private localStorageUtilityService: LocalStorageUtilityService, private predictiveDialerService:PredictiveDialerService) {
    }


    public startTimeOutForIncompleteCustomerInfo() {
        let self = this;
        this.timeoutForIncompleteCustomerInfo = setTimeout(function () {
            self.messageService.showMessage('Error in getting customer information', 'error');
            self.rules = undefined;
        }, 500000);
    };

    public getStats() {
        const self = this;
        if (self.userDetails.agentCurrentSession) {
            self.socketService.emit(SOCKETNAME.emitPDSessionStatistics, { 'agentId': self.userService.getUserDetail().id, 'sessionId': self.userDetails.agentCurrentSession }, function (): void { });
        }
        self.interval = setInterval(function (): void {
            if (self.userDetails.agentCurrentSession) {
                self.socketService.emit(SOCKETNAME.emitPDSessionStatistics, { 'agentId': self.userService.getUserDetail().id, 'sessionId': self.userDetails.agentCurrentSession }, function (): void { });
            }
        }, 3000);
    };

    // Initialize PlivoWebSdkEvent
    private initPhone(): void {
        let self = this;
        if (this.plivoWebSdk === undefined || this.plivoWebSdk === null || this.plivoWebSdk === '' || this.plivoWebSdk.client == undefined || this.plivoWebSdk.client.callSession === undefined || this.plivoWebSdk.client.callSession === null) {
            // self.logger.info('PD Plivo SDK Initialized', '');
            this.plivoWebSdk = new window.Plivo(this.plivoOptions);
        }

        this.plivoWebSdk.client.on('onMediaPermission', function (response) {
            self.dialerService.writeLogsToPBX('onMediaPermission', response);
            // self.logger.info('PD Plivo SDK onMediaPermission', JSON.stringify(response));
            if (response !== undefined && response.status === "success" && response.stream === true) {
                if (self.onMediaPermissionSet === false) {
                    self.onMediaPermissionSet = true;
                    self.plivoWebSdk.client.login(self.userDetails.plivoUserName, self.userDetails.plivoPwd);
                    self.dialerService.writeLogsToPBX('login');
                    self.publishSockets();
                }
            }
        });

        this.plivoWebSdk.client.on('onLoginFailed', function (cause): void {
            self.dialerService.writeLogsToPBX('onLoginFailed', { 'cause': cause });
            // self.logger.info('PD Plivo SDK onLoginFailed', '');
            self.messageService.showMessage('Error in processing request. Please try again', 'error');
            self.rules = undefined;
            console.log('LoginFailed');
        });

        this.plivoWebSdk.client.on('onLogout', function (): void {
            self.dialerService.writeLogsToPBX('onLogout');
            // self.logger.info('PD Plivo SDK onLogout', '');
        });

        this.plivoWebSdk.client.on('onLogin', function (): void {
            self.dialerService.writeLogsToPBX('onLogin');
            // self.logger.info('PD Plivo SDK onLogin', '');
        });

        this.plivoWebSdk.client.on('onIncomingCall', function (account_name: any, extraHeaders: any): void {
            self.dialerService.writeLogsToPBX('onIncomingCall', { 'account_name': account_name, 'extraHeaders': extraHeaders });
            self.callLogAPI('OnIncomingCall', { 'account_name': account_name, 'extraHeaders': extraHeaders, callId: self.customerInfo ? self.customerInfo.callId : undefined });
            // self.logger.info('PD Plivo SDK onIncomingCall', JSON.stringify({ account_name: account_name, extraHeaders: extraHeaders, callId: self.customerInfo.callId }));
            self.zone.run(() => {
                console.log("Event Occur Predictive Dialer");
                self.plivoWebSdk.client.answer();
                self.dialerService.writeLogsToPBX('answer');

                self.dialerService.predictiveMakeCall = false;
                self.predictiveMakeCall = false;
                self.callActive = true;
                if (self.isCustomerInformationReady === false) {
                    self.startTimeOutForIncompleteCustomerInfo();
                } else {
                    clearTimeout(self.timeoutForIncompleteCustomerInfo);
                }

                // self.cdrService.callDetectChanges(self.cdr);
            });
        });

        this.plivoWebSdk.client.on('onIncomingCallCanceled', function (): void {
            self.dialerService.writeLogsToPBX('onIncomingCallCanceled')
            self.callLogAPI('OnIncomingCallCanceled', { callId: self.customerInfo ? self.customerInfo.callId : undefined });
            // self.logger.info('PD Plivo SDK onIncomingCallCanceled', JSON.stringify({ userId: self.userDetails.id, callId: self.customerInfo.callId }));
            self.zone.run(() => {
                self.dialerService.predictiveMakeCall = true;
                self.predictiveMakeCall = true;
                // self.cdrService.callDetectChanges(self.cdr);
            });
        });

        this.plivoWebSdk.client.on('onCallTerminated', function (cause): void {
            self.dialerService.writeLogsToPBX('onCallTerminated', { 'cause': cause });
            self.callLogAPI('onCallTerminated', { callId: self.customerInfo ? self.customerInfo.callId : undefined });
            // self.logger.info('PD Plivo SDK onCallTerminated', JSON.stringify({ userId: self.userDetails.id, callId: self.customerInfo.callId }));
            self.zone.run(() => {
                self.dialerService.predictiveMakeCall = true;
                self.predictiveMakeCall = true;
                self.callActive = false;
                // self.cdrService.callDetectChanges(self.cdr);
            });
        });

        this.plivoWebSdk.client.on('onCallFailed', function (cause: any): void {
            self.dialerService.writeLogsToPBX('onCallFailed', { 'cause': cause });
            self.callLogAPI('onCallFailed', { callId: self.customerInfo ? self.customerInfo.callId : undefined });
            self.zone.run(() => {
                // self.logger.info('PD Plivo SDK onCallFailed', JSON.stringify({ userId: self.userDetails.id, callId: self.customerInfo.callId, cause: cause }));
                self.dialerService.predictiveMakeCall = true;
                self.predictiveMakeCall = true;
                // self.cdrService.callDetectChanges(self.cdr);
            });
        });

    };

    // this function is used to check digit
    public clickDigit(value: string): void {
        if (!this.isDemo) {
            if (this.predictiveMakeCall === false) {
                // this.logger.info('PD Plivo SDK SendDtmf', JSON.stringify({ userId: this.userDetails.id, callId: this.customerInfo.callId, value: value }));
                this.plivoWebSdk.client.sendDtmf(value);
                this.dialerService.writeLogsToPBX('sendDtmf', { 'valueSelected': value });
            }
        }
    };

    // Mute/UnMute The Mic
    public muteTheMic(value) {
        this.isMute = value;
        if (!this.isDemo) {
            if (value) {
                // this.logger.info('PD Plivo SDK Mute', JSON.stringify({ userId: this.userDetails.id, callId: this.customerInfo.callId }));
                this.plivoWebSdk.client.mute();
                this.dialerService.writeLogsToPBX('mute');
            } else {
                // this.logger.info('PD Plivo SDK Unmute', JSON.stringify({ userId: this.userDetails.id, callId: this.customerInfo.callId }));
                this.plivoWebSdk.client.unmute();
                this.dialerService.writeLogsToPBX('unmute');
            }
        }
    };

    // Update Agent Status
    updatePredictiveStatus(isfromInit, status): void {
        // Call Socket For Update Agent Status
        if (!this.isDemo) {
            this.callLogAPI('emitUserStatusUpdate', { callId: this.customerInfo ? this.customerInfo.callId : undefined, userId: this.userDetails.id, status: status });
            this.socketService.emit(SOCKETNAME.emitUserStatusUpdate, { status: status, agentId: this.userDetails.id }, function () { });
        } else {
            let isPDOnCallOrFurtherAction = false;
            if ((this.userDetails.userStatus === 'PDOnCall' || this.userDetails.userStatus === 'PDPostCall' || this.userDetails.userStatus === 'PDFurtherAction') && status === 'PDPause') {
                this.userDetails.agentNextStatus = 'PDPause';
                isPDOnCallOrFurtherAction = true;
            } else {
                this.userDetails.userStatus = status;
            }
            if (status == 'PDOnline') {
                this.messageService.showMessage('Power Dialer Started', 'success');
            } else if (status == 'PDPause') {
                if (isPDOnCallOrFurtherAction) {
                    this.messageService.showMessage('Power Dialer will be paused after completing this call. Click on session in order to start or resume the session', 'info');
                } else {
                    this.messageService.showMessage('Power Dialer Paused. Click on session in order to start or resume session', 'success');
                }
            } else if (status == 'PDFurtherAction') {
                this.messageService.showMessage('Power Dialer Paused For Further Action', 'success');
                this.showFurtherAction = false;
                // this.cdrService.callDetectChanges(this.cdr);
            }
        }
    };

    // This function is used when user end call
    public endCall(ruleName: string): void {
        this.rules = ruleName;
        // if (this.plivoWebSdk.client.callSession) {
        //after success of hangup we have to call api to set status post call and api for creating activity 
        if (!this.isDemo) {
            this.loaderService.show();
            if (this.callActive !== undefined && this.predictiveMakeCall === false && this.callActive === true) {
                let hangupData = { callId: this.customerInfo ? this.customerInfo.callId : undefined, sessionId: this.customerInfo.sessionId, phoneNumber: this.customerInfo.phone, agentId: this.userDetails.id, ticketId: this.customerInfo.ticketInfo.id };
                console.log(hangupData);
                this.callLogAPI('emitPDHangup', { callId: this.customerInfo.callId, userId: this.userDetails.id, hangupData: hangupData });
                this.socketService.emit(SOCKETNAME.emitPDHangup, hangupData, function (): void { });
                this.socketService.unregister(SOCKETNAME.onPDHangup, () => { });
                this.socketService.on(SOCKETNAME.onPDHangup, (socketResponse: any) => {
                    if (ruleName) {
                        if (ruleName !== 'further action') {
                            this.showFurtherAction = true;
                        }
                        this.predictiveMakeCall = true;
                        this.dialerService.predictiveMakeCall = true;
                        this.callActive = false;
                        this.showDialPad = false;
                        this.rules = undefined;
                        let saveObject = this.prepareCallOutDoc(ruleName);
                        if (saveObject) {
                            this.callLogAPI('emitPDCallOutDocCreate', { callId: this.customerInfo ? this.customerInfo.callId : undefined, userId: this.userDetails.id, saveObject: saveObject });
                            this.socketService.emit('PDCallOutDocCreate', saveObject, function (): void { });
                        }
                    } else {
                        this.predictiveMakeCall = true;
                        this.dialerService.predictiveMakeCall = true;
                        this.callActive = false;
                        this.showDialPad = false;
                        this.rules = undefined;
                        this.loaderService.hide();
                    }

                });
            } else {
                if (ruleName) {
                    if (ruleName !== 'further action') {
                        this.showFurtherAction = true;
                    }
                    this.predictiveMakeCall = true;
                    this.dialerService.predictiveMakeCall = true;
                    this.callActive = false;
                    this.showDialPad = false;
                    this.rules = undefined;
                    let saveObject = this.prepareCallOutDoc(ruleName);
                    if (saveObject) {
                        this.callLogAPI('emitPDCallOutDocCreate', { callId: this.customerInfo ? this.customerInfo.callId : undefined, userId: this.userDetails.id, saveObject: saveObject });
                        this.socketService.emit('PDCallOutDocCreate', saveObject, function (): void { });
                    }
                } else {
                    this.predictiveMakeCall = true;
                    this.dialerService.predictiveMakeCall = true;
                    this.callActive = false;
                    this.showDialPad = false;
                    this.rules = undefined;
                    this.loaderService.hide();
                }
            }
        } else {
            this.userDetails.userStatus = 'PDPostCall';
            if (ruleName) {
                if (ruleName !== 'further action') {
                    this.showFurtherAction = true;
                }
                this.predictiveMakeCall = true;
                this.dialerService.predictiveMakeCall = true;
                this.callActive = false;
                this.showDialPad = false;
                this.rules = undefined;
                let saveObject = this.prepareCallOutDoc(ruleName);
                console.log(saveObject);
                if (saveObject) {
                  //  this.messageService.showMessage('Outcome you have selected is ','success');
                    this.messageService.showMessage("Outcome you have selected is" ,'success');
                    const self = this;
                    setTimeout(() => {
                        self.isCustomerInformationReady = false;
                        self.predictiveDialer = { 'bankName': [] };
                        self.showRenewal = false;
                        self.showMonthYear = false;
                        self.predictiveDialerStatus = true;
                        self.isMute = false;
                        self.mandatoryBPDetails = false;
                        self.showFurtherAction = true;
                        self.callActive = undefined;
                        self.rules = undefined;
                        if (this.userDetails.nextMarketingListDocKey) {
                            this.userDetails.marketingListDocKey = this.userDetails.nextMarketingListDocKey;
                            this.userDetails.nextMarketingListDocKey = undefined;
                        }
                        if (this.userDetails.agentNextStatus) {
                            this.userDetails.userStatus = this.userDetails.agentNextStatus;
                        } else {
                            this.userDetails.userStatus = 'PDOnline';
                        }
                        if (this.localStorageUtilityService.checkLocalStorageKey('activeCallDetails')) {
                            this.localStorageUtilityService.removeFromLocalStorage('activeCallDetails')
                        }
                        self.showDemo();
                    }, 2000);
                }
            } else {
                this.predictiveMakeCall = true;
                this.dialerService.predictiveMakeCall = true;
                this.callActive = false;
                this.showDialPad = false;
                this.rules = undefined;
                this.loaderService.hide();
            }
        }
    };

    // Logout From the Session
    public logoutFromSession(): void {
        if (this.predictiveDialerStatus == true && this.predictiveMakeCall && this.isCustomerInformationReady === false) {
            const self = this;
            const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to save changes?' };
            this.callLogAPI('emitPDCallOutDocCreate', { callId: this.customerInfo ? this.customerInfo.callId : undefined, userId: this.userDetails.id, data: 'LOGOUT' });
            this.dialogService.confirm(dialogData,{}).result.then((result) =>{
                    if (result) {
                        this.pouchDbService.deleteDB();
                        this.updatePredictiveStatus(false, 'online');
                    }
                },
                (error) => { }
            );
        } else {
            this.messageService.showMessage('Please complete the running call before logout', 'error');
        }
    };


    // Validate the Input
    checkValidation(rule: string): string {
        if (this.ruleNameForMandatoryFields.includes(rule)) {
            if ((this.predictiveDialer.currentSoftwareQuestionReply !== undefined || this.predictiveDialer.currentSoftware !== undefined) && this.predictiveDialer.bankProductQuestionReply !== undefined) {
                if ((this.predictiveDialer.bankProductQuestionReply === 'BPCustomer' && ((this.predictiveDialer.noOfBankProducts == undefined && (this.predictiveDialer.isUnknownVolume == undefined || this.predictiveDialer.isUnknownVolume == false)) || (this.predictiveDialer.bankName == undefined || this.predictiveDialer.bankName.length == 0)))) {
                    this.mandatoryBPDetails = true;
                    return 'type1';
                } else {
                    if (rule === 'call this year again' && (this.predictiveDialer.followupMonth == undefined || this.predictiveDialer.followupYear == undefined)) {
                        return 'type3';
                    }
                    return '';
                }
            }
            return 'type2';
        }
        return '';
    }

    // Prepare Followup Month & Year
    private getYear() {
        let currentyear = parseInt(moment().format('YYYY'));
        let nextYear = parseInt(moment().format('YYYY')) + 1;
        let month = parseInt(moment().format('MM'));
        if (month <= 3 && month > 0) {
            currentyear = currentyear - 1
            nextYear = nextYear - 1
        }
        this.timePeriod[currentyear] = [{ month: "Apr", year: currentyear.toString() }, { month: "May", year: currentyear.toString() }, { month: "Jun", year: currentyear.toString() }, { month: "Jul", year: currentyear.toString() }, { month: "Aug", year: currentyear.toString() }, { month: "Sep", year: currentyear.toString() }, { month: "Oct", year: currentyear.toString() }, { month: "Nov", year: currentyear.toString() }, { month: "Dec", year: currentyear.toString() }];
        this.timePeriod[nextYear] = [{ month: "Jan", year: nextYear.toString() }, { month: "Feb", year: nextYear.toString() }, { month: "Mar", year: nextYear.toString() }];
        if (month >= 4 && month <= 12) {
            for (let mon = 4; mon < month; mon++) {
                let monthName = moment(mon, 'M').format('MMM');
                let index = _.findIndex(this.timePeriod[currentyear], function (obj) { return obj.month === monthName });
                if (index !== -1) {
                    this.timePeriod[currentyear][index] = {};
                }
            }
        } else {
            this.timePeriod[currentyear] = [];
            for (let mon = 1; mon < month; mon++) {
                let monthName = moment(mon, 'M').format('MMM');
                let index = _.findIndex(this.timePeriod[nextYear], function (obj) { return obj.month === monthName });
                if (index !== -1) {
                    this.timePeriod[nextYear][index] = {};
                }
            }
        }
    }

    // Emit the Event From 'app-pd-followup-month-year'
    public selectTime(time: any) {
        this.predictiveDialer.followupMonth = time.month;
        this.predictiveDialer.followupYear = time.year;
        this.PDRuleAfterHangup('call this year again');
    }

    // Pass the CallOutDoc to the Socket
    public PDRuleAfterHangup(ruleName: string): void {
        this.endCall(ruleName);
    }

    // Prepare Call Out Doc
    private prepareCallOutDoc(ruleName: string): boolean {
        console.log(this.customerInfo);
        let saveObject: any = {};
        let validationType = this.checkValidation(ruleName);
        if (validationType === '') {
            try {
                saveObject = { "callId": this.customerInfo.callId, sessionId: this.customerInfo.sessionId, "callHangupAction": ruleName, "phoneNumber": this.customerInfo.phone, "ticketId": this.customerInfo.ticketInfo.id, "customerId": this.customerInfo.customerId, "agentId": this.userDetails.id };
                // saveObject = Object.assign(saveObject, this.predictiveDialer);
                for (const obj in this.predictiveDialer) {
                    if (!saveObject.hasOwnProperty(obj) && obj !== 'activityId' && obj !== 'actId') {
                        saveObject[obj] = this.predictiveDialer[obj];
                    }
                }

                // Split the Notes Array by the New Line
                let notesArray = [];
                if (saveObject.notes !== undefined && saveObject.notes !== null && saveObject.notes !== '') {
                    notesArray = saveObject.notes.split('\n');
                }

                // Remove the BLank Lines
                _.remove(notesArray, function (line) {
                    return line === '->' || line === '-> ' || line === '';
                });

                // Add Bullets (->) to the Notes
                let newNotesArray = [];
                for (let item of notesArray) {
                    if (item.includes('->') === false) {
                        item = "-> " + item;
                    }
                    newNotesArray.push(item);
                }

                // Add the Information like Written By, Data & Agent Name
                if (newNotesArray !== undefined && newNotesArray !== null && newNotesArray.length > 0) {
                    for (let i = 0; i < newNotesArray.length; i++) {
                        let index = newNotesArray[i].indexOf('Written By');
                        if (index === -1) {
                            newNotesArray[i] += ' (Written By : ' + this.userDetails.firstName + ' ' + this.userDetails.lastName + ' on ' + moment().tz('America/New_York').format('MM/DD/YYYY hh:mm a') + ')';
                        }
                    }
                    saveObject.notes = newNotesArray.join('\n');
                }

                // Check Rule Name
                if (ruleName !== 'call this year again') {
                    if (this.showMonthYear) {
                        this.showMonthYear = false;
                        this.predictiveDialer.followupMonth = undefined;
                        this.predictiveDialer.followupYear = undefined;
                    }
                }
                return saveObject;
            } catch (ex) {
                console.log("error" + this.rules);
            }
        } else {
            if (ruleName == 'call this year again' && this.showMonthYear === false) {
                this.showMonthYear = true;
            }

            if (validationType == 'type3') {
                this.messageService.showMessage("Please select 'Month-Year'",'error');
            } else if (validationType == 'type2') {
                this.messageService.showMessage("Please select from 'Current Software' and 'Financial Partners'" ,'error');
            } else if (validationType == 'type1') {
                this.messageService.showMessage('Please fill in mandatory fields or select a bank product', 'error');
            }
            this.rules = undefined;
            this.loaderService.hide();
        }
    }

    // Wrap the Data Object to store TTL and Status
    private addStatusAndTtl(data: any) {
        if (data && data.length > 0) {
            data.forEach(element => {
                element._id = element.phone;
                element.onlineStatus = false;
                element.ttl = 40;
                element.time_store_ttl = Math.floor(Date.now() / 1000);
            });
            return data;
        }
        return [];
    }

    // Function to Store Bulk Call-In Doc to the IndexedDB
    private addBulkDataPouchDB(data: any) {
        let callInDoc = this.addStatusAndTtl(data);
        this.pouchDbService.addBulkData(callInDoc, 40).then((result) => { });
    }

    updatePDSession(sessionDetails: any) {
        if (!this.isDemo) {
            this.socketService.emit(SOCKETNAME.emitUpdateAgentSession, { sessionId: sessionDetails.sessionId, sessionName: sessionDetails.sessionName, agentId: this.userDetails.id }, () => { });
            this.socketService.unregister(SOCKETNAME.onUpdateAgentSession, () => { });
            this.socketService.on(SOCKETNAME.onUpdateAgentSession, (socketResponse) => {
                if (this.userDetails.userStatus === 'PDOnCall' || this.userDetails.userStatus === 'PDPostCall' || this.userDetails.userStatus === 'PDFurtherAction') {
                    if (sessionDetails.sessionId !== this.userDetails.agentCurrentSession) {
                        this.userDetails.nextSession = sessionDetails.sessionId;
                        if (socketResponse.data && socketResponse.data.marketingListDocKey) {
                            this.userDetails.nextMarketingListDocKey = socketResponse.data.marketingListDocKey
                        }
                        this.messageService.showMessage(`Your Next Call will be from the Session : ${sessionDetails.sessionName}`,'info');
                    } else {
                        this.messageService.showMessage(`You are already on the session : ${sessionDetails.sessionName}`,'info');
                    }
                } else {
                    this.userDetails.agentCurrentSession = sessionDetails.sessionId;
                    if (socketResponse.data && socketResponse.data.marketingListDocKey) {
                        this.userDetails.marketingListDocKey = socketResponse.data.marketingListDocKey
                    }
                }
            });
        } else {
            if (this.userDetails.userStatus === 'PDOnCall' || this.userDetails.userStatus === 'PDPostCall' || this.userDetails.userStatus === 'PDFurtherAction') {
                if (sessionDetails.sessionId !== this.userDetails.agentCurrentSession) {
                    this.userDetails.nextSession = sessionDetails.sessionId;
                    this.userDetails.nextMarketingListDocKey = sessionDetails.sessionId;
                    this.messageService.showMessage(`Your Next Call will be from the Session : ${sessionDetails.sessionName}`,'info');
                } else {
                    this.messageService.showMessage(`You are already on the session : ${sessionDetails.sessionName}`,'info');
                }
            } else {
                this.userDetails.userStatus = 'PDOnline';
                this.userDetails.agentCurrentSession = sessionDetails.sessionId;
                this.userDetails.marketingListDocKey = sessionDetails.sessionId;
                this.showDemo();
            }
        }
    }

    public showDialerList(dialerKey: any, dialerName: any) {
        this.dialogService.custom(PredictiveDialerListComponent, {'data': { 'dialerKey': dialerKey, 'dialerName': dialerName } }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(response => { }, error => { })
    }

    viewPDDetails(doc: any) {
        const self = this;
        self.dialerService.predictiveMakeCall = false;
        self.predictiveMakeCall = false;
        self.customerInfo = { "mainAddress": {}, callId: doc.callUUID, sessionId: doc.sessionId };
        let notesArray;
        self.customerInfo = doc;
        self.isCustomerInformationReady = true;
        // self.isCustomerInformationReady = true;
        // self.customerInfo = data;

        let activeCallDetails = {
            customerID: self.customerInfo.customerId,
            customerName: self.customerInfo.customerName,
            phoneNumber: self.customerInfo.phone
            // contactPersonId: self.contactPersonModel
        }
        self.localStorageUtilityService.addToLocalStorage('activeCallDetails', activeCallDetails);

        if (self.customerInfo != undefined && self.customerInfo != null && self.customerInfo.infoCollectedOnPdCall !== undefined && self.customerInfo.infoCollectedOnPdCall !== null) {
            self.predictiveDialer = self.customerInfo.infoCollectedOnPdCall;
            if (self.customerInfo.infoCollectedOnPdCall.bankName && self.customerInfo.infoCollectedOnPdCall.bankName.length > 0) {
                self.predictiveDialer.bankName = self.customerInfo.infoCollectedOnPdCall.bankName;
            } else {
                self.predictiveDialer.bankName = [];
            }

            if (self.customerInfo.infoCollectedOnPdCall.currentSoftwareQuestionReply == 'IDidNotAsk' || self.customerInfo.infoCollectedOnPdCall.currentSoftwareQuestionReply == 'CustNotWillingToAnswer') {
                self.predictiveDialer.currentSoftwareQuestionReply = undefined;
            }

            if (self.customerInfo.infoCollectedOnPdCall.currentSoftware == 'Other') {
                self.predictiveDialer.currentSoftware = undefined;
                self.predictiveDialer.currentSoftwareQuestionReply = undefined;
            }

            if (self.customerInfo.infoCollectedOnPdCall.bankProductQuestionReply == 'IDidNotAsk' || self.customerInfo.infoCollectedOnPdCall.bankProductQuestionReply == 'CustNotWillingToAnswer') {
                self.predictiveDialer.bankProductQuestionReply = undefined;
            }

            if (self.customerInfo.infoCollectedOnPdCall.notes !== undefined && self.customerInfo.infoCollectedOnPdCall.notes !== null && self.customerInfo.infoCollectedOnPdCall.notes !== '') {
                notesArray = self.predictiveDialer.notes.split('\n');
            }

            let newNotesArray = [];
            if (notesArray) {
                for (let item of notesArray) {
                    if (item) {
                        if (item.includes('->') === false) {
                            item = "-> " + item;
                        }
                    }
                    newNotesArray.push(item);
                }
            }

            if (newNotesArray !== undefined && newNotesArray !== null && newNotesArray.length > 0) {
                self.predictiveDialer.notes = newNotesArray.join('\n');
            }

            // self.cdrService.callDetectChanges(self.cdr);
        }

        if (self.customerInfo != undefined && self.customerInfo != null && self.customerInfo.renewalDetails !== undefined && self.customerInfo.renewalDetails !== null) {
            self.overviewForRenewalDetails = self.customerInfo.renewalDetails;
            if (self.overviewForRenewalDetails.returnStatus && self.overviewForRenewalDetails.returnStatus.length > 0) {
                self.overviewForRenewalDetails.returnStatus = _.orderBy(self.overviewForRenewalDetails.returnStatus, ['year'], ['desc']);
            }
        } else {
            self.overviewForRenewalDetails = {};
        }

        if (self.customerInfo != undefined && self.customerInfo != null && self.customerInfo.stateType && self.customerInfo.customerType) {
            if (self.customerInfo.stateType == 'NTPF' && self.customerInfo.customerType == 'CPA') {
                self.customerInfo.bgColor = 'lightblue'
            } else if (self.customerInfo.stateType == 'NTPF' && self.customerInfo.customerType == 'BP') {
                self.customerInfo.bgColor = 'lightblue'
            } else if (self.customerInfo.stateType == 'SalesRest' && self.customerInfo.customerType == 'CPA') {
                self.customerInfo.bgColor = '#B4EEB4'
            } else if (self.customerInfo.stateType == 'SalesRest' && self.customerInfo.customerType == 'BP') {
                self.customerInfo.bgColor = '#B4EEB4'
            }
        }


        if (self.customerInfo != undefined && self.customerInfo != null && self.customerInfo.ticketInfo !== undefined && self.customerInfo.ticketInfo !== null) {
            if (self.customerInfo.ticketInfo.overview !== undefined && self.customerInfo.ticketInfo.overview !== null) {
                self.overviewForDialer = self.customerInfo.ticketInfo.overview
            } else {
                self.overviewForDialer = {};
            }
        }

        if (self.customerInfo && self.customerInfo.ticketInfo) {
            self.ticketInfo = self.customerInfo.ticketInfo;
        } else {
            self.ticketInfo = {};
        }

        if (self.overviewForDialer.webSiteVisit !== undefined && self.overviewForDialer.webSiteVisit !== null) {
            if (self.overviewForDialer.webSiteVisit.recentVisits !== undefined && self.overviewForDialer.webSiteVisit.recentVisits !== null && self.overviewForDialer.webSiteVisit.recentVisits.length > 0) {
                for (const obj of self.overviewForDialer.webSiteVisit.recentVisits) {
                    obj.date = moment(obj.date).tz('America/New_York').format('MM/DD/YY hh:mm A');
                }
            }
        }

        if (self.overviewForDialer.revertedBackToDialerDate) {
            self.overviewForDialer.revertedBackToDialerETDate = moment(self.overviewForDialer.revertedBackToDialerDate).tz('America/New_York').format('MM/DD/YY');
        }

        if (self.overviewForDialer.EFINFlagData !== undefined && self.overviewForDialer.EFINFlagData !== null) {
            if (self.overviewForDialer.EFINFlagData.addedEFIN_IRS_DB_After) {
                self.overviewForDialer.EFINFlagData.addedEFIN_IRS_DB_After = moment(self.overviewForDialer.EFINFlagData.addedEFIN_IRS_DB_After, 'YYYY-MM-DD').format('MM/DD/YYYY');
            }
        }



        if (self.overviewForDialer.customerStatus !== undefined && self.overviewForDialer.customerStatus !== null) {
            if (self.overviewForDialer.customerStatus.lastestRegistrationDate !== undefined && self.overviewForDialer.customerStatus.lastestRegistrationDate !== null) {
                self.overviewForDialer.customerStatus.lastestRegistrationDate = moment(self.overviewForDialer.customerStatus.lastestRegistrationDate).tz('America/New_York').format('MM/DD/YY');
            }
        }

        if (self.customerInfo != undefined && self.customerInfo.mainAddress === undefined) {
            self.customerInfo.mainAddress = {};
        }
        clearInterval(self.timeoutForIncompleteCustomerInfo);
    }

    checkUserStatus() {
        const self = this;
        let currentStatus = this.userService.USER_STATUS;
        let allowedUser = Configuration.notAllowCallingForUserStatus;
        self.currentUserStatusAllowedCalling = allowedUser.includes(currentStatus);
        self.cdr.detectChanges();

        this.subscriptionCheckUserStatus = this.userService.getUserStatusChangedEmitter().subscribe((status) => {
            let allowedUser = Configuration.notAllowCallingForUserStatus;
            self.currentUserStatusAllowedCalling = allowedUser.includes(status);
            if (status === 'online') {
                window.close();
            }
            self.cdr.detectChanges();
        });
    }

    getPDDetails(data) {
        // this.localStorageUtilityService.addToLocalStorage('phoneNumber', data.phoneNumber);
        const self = this;
        self.pouchDbService.getDocById(data.phoneNumber).then((doc: any) => {
            doc.callId = data.callUUID;
            this.viewPDDetails(doc);
        }, error => {
            this.socketService.emit('PDCallDetails', data, function (): void { });
        });
    }

    publishSockets() {

        this.socketService.on(SOCKETNAME.onUserStatusUpdate, (socketResponse: any) => {
            if (socketResponse && socketResponse.code === 2000) {
                let isPDOnCallOrFurtherAction = false;
                if ((this.userDetails.userStatus === 'PDOnCall' || this.userDetails.userStatus === 'PDPostCall' || this.userDetails.userStatus === 'PDFurtherAction') && socketResponse.data.status === 'PDPause') {
                    isPDOnCallOrFurtherAction = true;
                    this.messageService.showMessage('Power Dialer will be paused after completing this call. Click on session in order to start or resume the session','info');
                } else {
                    this.userDetails.userStatus = socketResponse.data.status;
                    if (this.userDetails.userStatus == 'PDOnline') {
                        this.messageService.showMessage('Power Dialer Started', 'success');
                    } else if (this.userDetails.userStatus == 'PDPause') {
                        this.messageService.showMessage('Power Dialer Paused. Click on session in order to start or resume session', 'success');
                    } else if (this.userDetails.userStatus == 'PDFurtherAction') {
                        this.messageService.showMessage('Power Dialer Paused For Further Action', 'success');
                        this.showFurtherAction = false;
                    }
                }
                this.checkUserStatus();
            }
        });
        this.socketService.on(SOCKETNAME.onPDCallInitialize, (socketResponse: any) => {
            this.addBulkDataPouchDB(socketResponse);
        });
        this.socketService.on(SOCKETNAME.onPDCallView, (socketResponse: any) => {
            this.getPDDetails(socketResponse);
        });
        this.socketService.on(SOCKETNAME.onPDCallDetails, (socketResponse: any) => {
            this.viewPDDetails(socketResponse.data);
        });


        this.socketService.on(SOCKETNAME.onAgentPDDetails, (socketResponse: any) => {
            let sessionlookupDetails = _.sortBy(socketResponse.sessionDetails, [function (o) { return o.sessionName; }]);
            this.sessionLookup = sessionlookupDetails;
            this.userDetails.userStatus = socketResponse.agentStatus;
            this.userDetails.agentCurrentSession = socketResponse.agentCurrentSession;
            this.userDetails.agentNextStatus = socketResponse.agentNextStatus;
            if (this.userDetails.userStatus === 'PDOnCall' || this.userDetails.userStatus === 'PDPostCall' || this.userDetails.userStatus === 'PDFurtherAction') {
                if (socketResponse.data && socketResponse.data.marketingListDocKey) {
                    this.userDetails.nextMarketingListDocKey = socketResponse.data.marketingListDocKey
                }
            } else {
                this.userDetails.marketingListDocKey = socketResponse.marketingListDocKey;
            }
        });

        this.socketService.on(SOCKETNAME.onPDCallEnded, (socketResponse: any) => {
            this.predictiveMakeCall = true;
            this.dialerService.predictiveMakeCall = true;
            this.callActive = false;
            this.showDialPad = false;
            this.rules = undefined;
            this.loaderService.hide();
        });

        this.socketService.on(SOCKETNAME.onPDCallOutDocCreate, (socketResponse: any) => {
            if (this.localStorageUtilityService.checkLocalStorageKey('activeCallDetails')) {
                this.localStorageUtilityService.removeFromLocalStorage('activeCallDetails')
            }
            this.isCustomerInformationReady = false;
            this.predictiveDialer = { 'bankName': [] };
            this.showRenewal = false;
            this.showMonthYear = false;
            this.predictiveDialerStatus = true;
            this.isMute = false;
            this.mandatoryBPDetails = false;
            this.showFurtherAction = true;
            this.callActive = undefined;
            this.rules = undefined;
            this.userDetails.nextSession = undefined;
            if (this.userDetails.nextMarketingListDocKey) {
                this.userDetails.marketingListDocKey = this.userDetails.nextMarketingListDocKey;
                this.userDetails.nextMarketingListDocKey = undefined;
            }
            this.loaderService.hide();
            // this.cdrService.callDetectChanges(this.cdr);
        });

        this.socketService.on(SOCKETNAME.onPDSessionStatistics, (socketResponse: any) => {
            if (socketResponse.code === 2000) {
                this.stats = socketResponse.data || {};
            }
        });

        this.getStats();
    }

    // called on initialization to get lookup values for bank list
    getLookupForbankList(params?:any): void {
        const parameterData:any = {};
        if (this.bankLookup.length == 0) {
            this.predictiveDialerService.getLookupForbankListData(parameterData).then(response => {
                this.bankLookup = _.orderBy(response, ['value'], ['asc']);
                this.bankLookup = this.bankLookup.filter(obj => obj.value !== 'Other');
                if (this.bankLookup !== undefined && this.bankLookup.length > 0) {
                    this.bankLookup.push({ 'id': 'Other', 'value': 'Other' });
                }
                for (const obj of this.bankLookup) {
                    obj.name = obj.value;
                }
            });
        }
    }

    // called on initialization to get lookup values for tax software list 
    getLookupForTaxSoftwareList(params?:any): void {
        const parameterData:any = {};
        if (this.renewalType.length == 0) {
            this.predictiveDialerService.getLookupForTaxSoftwareList(parameterData).then(response => {
                this.renewalType = _.orderBy(response, ['name'], ['asc']);
                if (this.renewalType !== undefined && this.renewalType.length > 0) {
                    this.renewalType.push({ 'id': 'Other', 'name': 'Other' });
                }
            });
        }
    }

    callLogAPI(eventName: string, data: any) {
        let obj = { eventName: eventName, userId: this.userDetails.id, data: data };
       // this._commonAPI.getPromiseResponse({ apiName: '/predictiveDialer/addUpdaterequestLogs', parameterObject: obj, showLoading: false }).then((response) => { });
        this.predictiveDialerService.AddUpdateRequestLog(obj).then(response => {
        });
    }

    showDemo(responseDemoData?: any) {

        const self = this;
        self.predictiveDialerStatus = true;

        if (this.userDetails.nextSession) {
            this.userDetails.agentCurrentSession = this.userDetails.nextSession;
            this.userDetails.nextSession = undefined;
        }
        setTimeout(() => {
            if (responseDemoData) {
                self.demoData = responseDemoData;
            }
            self.demoData.infoCollectedOnPdCall = {};
            self.demoData.callId = 'demo';
            self.userDetails.agentNextStatus = undefined;
            if (this.userDetails.userStatus === 'PDOnline') {
                this.userDetails.userStatus = 'PDOnCall';
                self.viewPDDetails(self.demoData);
                self.callActive = true;
            }
        }, 5000)
    }

    //function called on event emitter to get waiting time in milliseconds of the agent when in PDPostCall status
    postCallTime(event) {
        let ss = Math.floor(event / 1000) + '';
        while (ss.length < 2) {
            ss = '0' + ss;
        }
        this.predictiveDialer.postCallTime = ss;
    }

    ngAfterViewInit() {
        const self = this;
        if (!self.isDemo) {
            window.addEventListener("unload", function (event) {
                // self.logger.info('PD Plivo SDK Close Browser or Logout or Refresh', '');
                self.updatePredictiveStatus(false, 'online');
                self.callLogAPI('Browser Close', { callId: self.customerInfo ? self.customerInfo.callId : undefined, userId: self.userDetails.id });
                self.dialerService.writeLogsToPBX('Browser Close', { callId: self.customerInfo ? self.customerInfo.callId : undefined, userId: self.userDetails.id });
            });
        }
    }

    // Calls On Init
    ngOnInit(): void {
        // when user open this screen we have to login user to plivo if user is plivo user
        let demoUrl = this.route.snapshot.params['id'];
        this.isDemo = demoUrl === 'demo' ? true : false;
        if (!this.isDemo) {
            this.userDetails = this.userService.getUserDetail();
            this.pouchDbService.clearDB();
            // only call if user have permission of Plivo
            if (this.userDetails !== undefined && this.userDetails.isPlivoUser === true) {
                this.initPhone(); // Register PlivoWebSdk & Register Socket
                if (this.dialerService.predictiveMakeCall) {
                    this.predictiveMakeCall = this.dialerService.predictiveMakeCall;
                }
                this.predictiveDialerStatus = true;
                this.getYear();
                this.updatePredictiveStatus(true, 'PDPause');
                // this.cdrService.callDetectChanges(this.cdr);
            } else {
                // User Don't have right to access the phone system
                this.messageService.showMessage('User Don\'t have right to access the phone system','error');
            }
        } else {
            this.userDetails = this.userService.getUserDetail();
            this.getYear();
            this.predictiveDialerStatus = true;
            this.userDetails.userStatus = 'PDPause';
            this.sessionLookup = [{ sessionId: 'DML_RENEWAL_1', sessionName: 'Renewal' }, { sessionId: 'DML_SALES_NTPF_1', sessionName: 'Sales NTPF Dialer' }, { sessionId: 'DML_SALES_REST_1', sessionName: 'Sales Rest Dialer' }, { sessionId: 'DML_SETUP_1', sessionName: 'Setup Dialer' }, { sessionId: 'DML_TAXVISION_1', sessionName: 'Taxvision' }];
            this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_PD_DEMO_DOC, showLoading: false }).then((response) => {
                this.userDetails.userStatus = 'PDPause';
                this.showDemo(response);
            });
        }
        this.getLookupForbankList();
        this.getLookupForTaxSoftwareList();
    };

    // Calls On Destroy
    ngOnDestroy(): void {
        if (this.subscriptionCheckUserStatus) {
            this.subscriptionCheckUserStatus.unsubscribe();
        }
        this.socketService.unregister(SOCKETNAME.onUserStatusUpdate, () => { });
        this.socketService.unregister(SOCKETNAME.onPDCallInitialize, () => { });
        this.socketService.unregister(SOCKETNAME.onPDCallView, () => { });
        this.socketService.unregister(SOCKETNAME.onPDCallDetails, () => { });
        this.socketService.unregister(SOCKETNAME.onPDCallOutDocCreate, () => { });
        this.socketService.unregister(SOCKETNAME.onPDHangup, () => { });
        this.socketService.unregister(SOCKETNAME.onPDSessionStatistics, () => { });
        clearInterval(this.interval);
        clearInterval(this.timeoutForIncompleteCustomerInfo);
        this.cdr.detach();
    }
};

// Pipes filtered keys of activity types
@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
    transform(value: any): any {
        const keys = [];
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }
}