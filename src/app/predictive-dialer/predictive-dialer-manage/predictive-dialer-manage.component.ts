// External Imports
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

// Internal Imports
import { MessageService } from '@app/shared/services/message.service';
import { UserService } from '@app/shared/services/user.service';
import { DialogService } from '@app/shared/services/dialog.service';
import { SocketService } from '@app/shared/services/socket.service';
import { LoaderService } from '@app/shared/loader/loader.service';
import { PredictiveDialerListComponent } from '@app/predictive-dialer/dialogs/predictive-dialer-list/predictive-dialer-list.component';
import { SOCKETNAME } from '@app/predictive-dialer/predictive-dialer-constants';
import { NewDialerSessionComponent } from '@app/predictive-dialer/dialogs/new-dialer-session/new-dialer-session.component';
import { configuration } from '@environments/environment';
import { PredictiveDialerManageService } from '@app/predictive-dialer/predictive-dialer-manage/predictive-dialer-manage.service';
import { PredictiveDialerService } from '@app/predictive-dialer/predictive-dialer.service';

@Component({
    templateUrl: 'predictive-dialer-manage.component.html',
    styleUrls: ['predictive-dialer-manage.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [PredictiveDialerManageService]
})

export class PredictiveDialerManageComponent implements OnInit, OnDestroy {

    public allowedUserToChangeSpeed = configuration.allowedUserForDialerUpdation;
    public notParticipated: any = [];
    public offline: any = [];
    public participated: any = [];
    public count: any = { PDOnline: 0, PDOnCall: 0, PDPostCall: 0, PDPause: 0, PDFurtherAction: 0, online: 0, onCall: 0, doNotDisturb: 0, offline: 0 };
    public marketingListData: any = {}; // store value of marketing data
    public agentsListData: any = []; // online UserList
    public marketingData: any = {}; // store marketing
    public isDataLoadingNew = false;
    public isplay: any = {};
    public interval: any;
    public invervalForGetStatisticsForPDSession: any;
    public statisticsOfPdSession: any = { statistics: {}, outcomeStatistics: {} }; // store statistics of session
    public isDataLoading = true;
    public statusOfPdSession: any = {};
    public sessionList: any = [];
    public uncreatedSessionList: any = [];
    public openIndex: any = [];
    public userDetails: any = {};
    public dialerLookup = [];
    public dialerUserData: any = [];
    public showInfo = false;

    constructor(private cdr: ChangeDetectorRef, public messageService: MessageService, private userService: UserService, private dialogService: DialogService, private viewContainerRef: ViewContainerRef, private socketService: SocketService, private loaderService: LoaderService, private predictiveDialerManageService: PredictiveDialerManageService, private predictiveDialerService: PredictiveDialerService) { }

    // function for Only positive Number allowed
    public isPositiveNumber(event: any): any {
        if (event.keyCode === 45 || event.keyCode === 101 || event.keyCode === 43 || event.keyCode === 69) {
            return false;
        }
    }
    // get online Agent Data
    public getOnlineAgents(response: any): void {
        // this.agentsListData = response;
        this.agentsListData = [];
        this.count = { PDOnline: 0, PDOnCall: 0, PDPostCall: 0, PDPause: 0, PDFurtherAction: 0, online: 0, onCall: 0, doNotDisturb: 0, offline: 0 };
        for (const obj of this.dialerUserData) {
            for (const obj1 of obj.agents) {
                for (const obj2 of response) {
                    const objname = this.agentsListData.find(o => obj.department === o.department);
                    if (obj2.id === obj1.id) {
                        if (objname !== undefined) {
                            objname.agentList.push(obj2);
                        } else {
                            this.agentsListData.push({ department: obj.department, agentList: [obj2] });
                        }
                    }

                }
            }
        }

        for (const obj of this.agentsListData) {
            this.count.PDOnline += (obj.agentList.filter(t => t.status === 'PDOnline')).length;
            this.count.PDOnCall += (obj.agentList.filter(t => t.status === 'PDOnCall')).length;
            this.count.PDPostCall += (obj.agentList.filter(t => t.status === 'PDPostCall')).length;
            this.count.PDPause += (obj.agentList.filter(t => t.status === 'PDPause')).length;
            this.count.PDFurtherAction += (obj.agentList.filter(t => t.status === 'PDFurtherAction')).length;
            this.count.online += (obj.agentList.filter(t => t.status === 'online')).length;
            this.count.onCall += (obj.agentList.filter(t => t.status === 'onCall')).length;
            this.count.doNotDisturb += (obj.agentList.filter(t => t.status === 'doNotDisturb')).length;
            this.count.offline += (obj.agentList.filter(t => t.status === 'offline')).length;
        }
    }

    // get dialerlist
    public getDialerList(): void {
        this.predictiveDialerManageService.getDialerList().then((response) => {
            this.marketingListData = response;
            this.cdr.detectChanges();
        }, (error) => {
            console.log(error);
        });
    }

    /**
     * @param  {string} type
     * Emit PDSessionAction with type
     * Type is startSession,stopSession,resumeSession,PauseSession
     */
    public PDSessionAction(type: string, sessionId: any) {
        event.preventDefault();
        event.stopPropagation();
        this.loaderService.show();
        this.socketService.emit(SOCKETNAME.emitPDSessionAction, { 'id': this.userService.getUserDetail().id, 'type': type, 'sessionId': sessionId }, () => { });
    }

    public callActionHandle(type: string, data: any) {
        if (type !== undefined) {
            if (type === 'running') {
                this.isplay.isPause = true;
                this.isplay.isStart = false;
                this.isplay.isResume = false;
                this.isplay.isStop = true;
            } else if (type === 'pause') {
                this.isplay.isPause = false;
                this.isplay.isStart = false;
                this.isplay.isResume = true;
                this.isplay.isStop = true;
            } else if (type === 'stop') {
                this.isplay.isPause = false;
                this.isplay.isStart = true;
                this.isplay.isResume = false;
                this.isplay.isStop = false;
            } else if (this.marketingData.status === 'created' || this.marketingData.status === 'completed') {
                this.isplay.isPause = false;
                this.isplay.isStart = true;
                this.isplay.isResume = false;
                this.isplay.isStop = false;
            }
            this.loaderService.hide();
        }
    }

    public calPercentageForPDSession() {
        for (const obj of this.statisticsOfPdSession) {

            for (const session of this.sessionList) {
                if (session.id === obj.id) {
                    const callsSoFar = obj.statistics.initiatedCalls;
                    const totalAnsweredCalls = obj.statistics.custAnsweredButAgentNotFree +
                        obj.statistics.custAnsweredAndConnectedToAgent + obj.statistics.rejectedCalls;
                    const totalValidCalls = obj.statistics.custDidNotAnswer +
                        obj.statistics.custAnsweredButAgentNotFree
                        + obj.statistics.custAnsweredAndConnectedToAgent;

                    const totalConnectedCalls = obj.statistics.custAnsweredAndConnectedToAgent;

                    obj.statistics.totalAnsweredCalls = totalAnsweredCalls;
                    obj.statistics.callsSoFar = obj.statistics.initiatedCalls;
                    obj.statistics.totalValidCalls = totalValidCalls;

                    if (obj.statistics.callsSoFar !== 0) {
                        obj.statistics.connectedPercentage = ((100 * obj.statistics.custAnsweredAndConnectedToAgent) / callsSoFar).toFixed(1);
                        obj.statistics.custDidNotAnswerPercentage = ((100 * obj.statistics.custDidNotAnswer) / callsSoFar).toFixed(1);
                        obj.statistics.agentNotFreePercentage = ((100 * obj.statistics.custAnsweredButAgentNotFree) / callsSoFar).toFixed(1);
                        if (obj.statistics.invalidNumbers) {
                            obj.statistics.invalidNumbersPercentage = ((100 * obj.statistics.invalidNumbers) / callsSoFar).toFixed(1);
                        }
                        if (obj.statistics.deletedCalls) {
                            obj.statistics.deletedCallsPercentage = ((100 * obj.statistics.deletedCalls) / callsSoFar).toFixed(1);
                        }
                        if (obj.statistics.deletedCallErrors) {
                            obj.statistics.deletedCallErrorsPercentage = ((100 * obj.statistics.deletedCallErrors) / callsSoFar).toFixed(1);
                        }
                        if (obj.statistics.deletedRingingCalls) {
                            obj.statistics.deletedRingingCallsPercentage = ((100 * obj.statistics.deletedRingingCalls) / callsSoFar).toFixed(1);
                        }
                        if (obj.statistics.initiatedCalls) {
                            obj.statistics.initiatedCallsPercentage = ((100 * obj.statistics.initiatedCalls) / callsSoFar).toFixed(1);
                        }
                        if (obj.statistics.rejectedCalls) {
                            obj.statistics.rejectedCallsPercentage = ((100 * obj.statistics.rejectedCalls) / callsSoFar).toFixed(1);
                        }

                        obj.outcomeStatistics.total = obj.outcomeStatistics.wrongNumber +
                            obj.outcomeStatistics.AMLeftMessage +
                            obj.outcomeStatistics.AMDidNotLeftMessage +
                            obj.outcomeStatistics.alreadyRenewed +
                            obj.outcomeStatistics.dontCallAgain +
                            obj.outcomeStatistics.callThisYearAgain +
                            obj.outcomeStatistics.callNextYearAgain +
                            obj.outcomeStatistics.furtherAction +
                            obj.outcomeStatistics.secretaryLeftMessage +
                            obj.outcomeStatistics.secretaryDoNotLeftMessage;

                        if (obj.outcomeStatistics.wrongNumber) {
                            obj.outcomeStatistics.wrongNumberPercentage =
                                ((100 * obj.outcomeStatistics.wrongNumber) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.AMLeftMessage) {
                            obj.outcomeStatistics.AMLeftMessagePercentage =
                                ((100 * obj.outcomeStatistics.AMLeftMessage) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.AMDidNotLeftMessage) {
                            obj.outcomeStatistics.AMDidNotLeftMessagePercentage =
                                ((100 * obj.outcomeStatistics.AMDidNotLeftMessage) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.alreadyRenewed) {
                            obj.outcomeStatistics.alreadyRenewedPercentage =
                                ((100 * obj.outcomeStatistics.alreadyRenewed) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.dontCallAgain) {
                            obj.outcomeStatistics.dontCallAgainPercentage =
                                ((100 * obj.outcomeStatistics.dontCallAgain) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.callThisYearAgain) {
                            obj.outcomeStatistics.callThisYearAgainPercentage =
                                ((100 * obj.outcomeStatistics.callThisYearAgain) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.callNextYearAgain) {
                            obj.outcomeStatistics.callNextYearAgainPercentage =
                                ((100 * obj.outcomeStatistics.callNextYearAgain) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.furtherAction) {
                            obj.outcomeStatistics.furtherActionPercentage =
                                ((100 * obj.outcomeStatistics.furtherAction) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.secretaryLeftMessage) {
                            obj.outcomeStatistics.secretaryLeftMessagePercentage =
                                ((100 * obj.outcomeStatistics.secretaryLeftMessage) / totalConnectedCalls).toFixed(1);
                        }
                        if (obj.outcomeStatistics.secretaryDoNotLeftMessage) {
                            obj.outcomeStatistics.secretaryDoNotLeftMessagePercentage =
                                ((100 * obj.outcomeStatistics.secretaryDoNotLeftMessage) / totalConnectedCalls).toFixed(1);
                        }
                    } else {
                        obj.statistics.connectedPercentage = 0;
                        obj.statistics.custDidNotAnswerPercentage = 0;
                        obj.statistics.agentNotFreePercentage = 0;
                        obj.statistics.invalidNumbersPercentage = 0;
                        obj.statistics.deletedCallsPercentage = 0;
                        obj.statistics.deletedRingingCallsPercentage = 0;
                        obj.statistics.initiatedCallsPercentage = 0;
                        obj.statistics.rejectedCallsPercentage = 0;
                        obj.statistics.deletedCallErrorsPercentage = 0;
                    }

                    if (obj.statistics.totalAnsweredCalls !== 0) {
                        obj.statistics.answeredAgentNotFreePercentage = ((100 * obj.statistics.custAnsweredButAgentNotFree) / totalAnsweredCalls).toFixed(1);
                        obj.statistics.answeredConnectedPercentage = ((100 * obj.statistics.custAnsweredAndConnectedToAgent) / totalAnsweredCalls).toFixed(1);
                        obj.statistics.answeredRejectedCallPercentage = ((100 * obj.statistics.rejectedCalls) / totalAnsweredCalls).toFixed(1);
                    } else {
                        obj.statistics.answeredAgentNotFreePercentage = 0;
                        obj.statistics.answeredConnectedPercentage = 0;
                    }

                    if (obj.statistics.totalValidCalls !== 0) {
                        obj.statistics.validCustNotAnsweredPercentage = ((100 * obj.statistics.custDidNotAnswer) / totalValidCalls).toFixed(1);
                        obj.statistics.validAgentNotFreePercentage = ((100 * obj.statistics.custAnsweredButAgentNotFree) / totalValidCalls).toFixed(1);
                        obj.statistics.validConnectedPercentage = ((100 * obj.statistics.custAnsweredAndConnectedToAgent) / totalValidCalls).toFixed(1);
                        obj.statistics.validRejectedCallPercentage = ((100 * obj.statistics.rejectedCalls) / totalValidCalls).toFixed(1);
                    } else {
                        obj.statistics.validCustNotAnsweredPercentage = 0;
                        obj.statistics.validAgentNotFreePercentage = 0;
                        obj.statistics.validConnectedPercentage = 0;
                        obj.statistics.validRejectedCallPercentage = 0;
                    }
                    session.statisticsOfPdSession = obj;
                }
            }
        }
    }

    // open session
    public openPDSession(response: any): void {
        for (const obj of response) {
            if (obj.id) {
                if (this.sessionList && this.sessionList.length > 0) {
                    const sessionObj = this.sessionList.find(t => t.id === obj.id);
                    if (sessionObj && sessionObj['statisticsOfPdSession']) {
                        obj['statisticsOfPdSession'] = sessionObj['statisticsOfPdSession'];
                    } else {
                        obj['statisticsOfPdSession'] = { statistics: {}, outcomeStatistics: {} };
                    }
                } else {
                    obj['statisticsOfPdSession'] = { statistics: {}, outcomeStatistics: {} };
                }
            } else {
                obj['statisticsOfPdSession'] = { statistics: {}, outcomeStatistics: {} };
            }

            for (const openedId of this.openIndex) {
                if (obj.id === openedId) {
                    obj['opened'] = 'true';
                }
            }
        }
        this.sessionList = JSON.parse(JSON.stringify(response));
        if (this.openIndex.length > 0) {
            this.getPDSessionStatistics();
        }
    }

    public showDialerList(dialerKey: any, dialerName: any) {
        this.dialogService.custom(PredictiveDialerListComponent, { 'data': { 'dialerKey': dialerKey, 'dialerName': dialerName } },{ keyboard: false, backdrop: 'static', size: 'lg' } ).result.then((response) => { }, error => { })
    }

    callManagerView() {
        this.socketService.emit(SOCKETNAME.emitPDManagerView, { 'agentId': this.userService.getUserDetail().id, 'date': moment().format('YYYYMMDD') }, (): void => { });
    }

    public callPDManagerViewEvent() {
        this.callManagerView();
        this.interval = setInterval((): void => {
            this.callManagerView();
        }, 3000);
    }

    /**
     * to call api for Statistics get of PD session
     */
    public getPDSessionStatistics() {
        this.isDataLoadingNew = true;
        this.predictiveDialerManageService.getPDSessionStatistics(this.openIndex).then((response) => {
            this.isDataLoadingNew = false;
            this.statisticsOfPdSession = response;
            this.calPercentageForPDSession();
            this.cdr.detectChanges();
        }, (error) => {
            this.isDataLoadingNew = false;
            console.error(error);
        });
    }

    registerSocket() {
        this.socketService.on(SOCKETNAME.onPDManagerView, (socketResponse: any) => {
            if (socketResponse && socketResponse.code === 2000) {
                const response = socketResponse.data;
                this.getOnlineAgents(response.agents);
                this.openPDSession(response.statusOfPdSession);
            }
        });
        this.socketService.on(SOCKETNAME.onPDSessionSave, (socketResponse: any) => {
            if (socketResponse && socketResponse.code === 2000) {
            }
        });
        this.socketService.on(SOCKETNAME.onPDSessionAction, (socketResponse: any) => {
            if (socketResponse && socketResponse.code === 2000) {
                this.callActionHandle(socketResponse.data.type, socketResponse.data.id);
            }
        });
    }
    createRetentionDialer() {
        this.dialogService.notify({ title: 'Attention', text: 'The Current Running Retention Dialer (if any) will be stopped on creation of new session.', type: 'notify' }, { keyboard: false, backdrop: 'static', size: 'md' }).result.then((response) => {
            if(response){
            this.createUpdateSession({ noOfCallsPerAgent: 1.6, machineDetectionTime: 2, isMachineDetectionOn: false, retentionDialer: true });
        }
        }, (error) => {
            console.log(error);
        });
    }

    createUpdateSession(obj: any) {
        event.preventDefault();
        event.stopPropagation();
        this.dialogService.custom(NewDialerSessionComponent, { 'data': obj }, { keyboard: false, backdrop: 'static', size: 'lg' })
            .result.then((response) => {
                if (response === 'Retention') {
                    this.showInfoForRetentionDialer();
                }
            }, error => {
                console.log(error);
            })
    }
    showInfoForRetentionDialer() {
        this.dialogService.notify({ title: 'Retention Dialer Session', text: 'Within 10 minutes Retention Dialer will be created and running. In case it doesn’t start please contact the development team. ' }, {}).result.then((response) => {
      
        }, (error) => {
            console.log(error);
        });
    }
    sessionPanel(index, sessionId, panelOption: any) {
        if (this.openIndex.includes(sessionId.id)) {
            panelOption = 'close';
        }
        sessionId = sessionId.id;
        if (panelOption === 'open') {
            this.sessionList[index]['opened'] = 'true';
            if (this.openIndex.indexOf(sessionId) === -1) {
                if (sessionId && sessionId !== undefined) {
                    this.openIndex.push(sessionId);
                }
            }
            this.getPDSessionStatistics();
        } else if (panelOption === 'close') {
            this.sessionList[index]['opened'] = 'close';
            const i = this.openIndex.indexOf(sessionId);
            this.openIndex.splice(i, 1);
        }
    }

    getDialerLookup() {
        this.predictiveDialerService.getDialerLookup().then((response) => {
            this.dialerLookup = response;
            this.cdr.detectChanges();
        }, (error) => {
            console.log(error);
        });
    }

    getPDUserData() {
        this.predictiveDialerManageService.getPDUserData().then((response) => {
            this.dialerUserData = response;
            this.cdr.detectChanges();
        }, (error) => {
            console.log(error);
        });
    }

    // start Component From Init
    ngOnInit(): void {
        this.userDetails = this.userService.getUserDetail();
        this.registerSocket();
        this.getPDUserData();
        this.callPDManagerViewEvent();
        this.getDialerLookup();
    }

    ngOnDestroy(): void {
        this.socketService.unregister(SOCKETNAME.onPDManagerView, () => { });
        this.socketService.unregister(SOCKETNAME.onPDSessionSave, () => { });
        this.socketService.unregister(SOCKETNAME.onPDSessionAction, () => { });
        clearInterval(this.interval);
        if (this.cdr) {
            this.cdr.detach();
        }
    }
}
