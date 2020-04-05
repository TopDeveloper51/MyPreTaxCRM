// External imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

// Internal imports
import { CDRService, CopyToClipboardService } from '@app/shared/services';

@Component({
    selector: 'mtpo-phone-details',
    templateUrl: './phone-details.component.html',
    styleUrls: ['./phone-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PhoneDetailsComponent implements OnInit {

    public phoneDataIncoming: any[] = [];
    public phoneDataOutgoing: any[] = [];
    phoneData: any[] = [];
    data: any;

    constructor(public modal: NgbActiveModal, private clipboard: CopyToClipboardService, private cdrService: CDRService, private cdr: ChangeDetectorRef) { }

    /**
     * @author Mansi Makwana
     * @createdDate 11-11-2019
     * @description  call to copy to clipboard
     * @memberOf PhoneDetailsComponent
     */
    copyToClipboard(copyObj) {
        this.clipboard.copy(copyObj);
    }

    /**
     * @author Mansi Makwana
     * @createdDate 11-11-2019
     * @description  call to close the dialog
     * @memberOf PhoneDetailsComponent
     */

    close(): void {
        this.modal.close();
        this.cdr.detach();
    }

    ngOnInit() {
        this.phoneData = this.data.data.phoneData;
        this.phoneData = this.phoneData.sort(function (a, b) {
            a = new Date(a.callStartTime);
            b = new Date(b.callStartTime);
            return b - a;
        });
        for (let i = 0; i < this.phoneData.length; i++) {
            if (this.phoneData[i].callDirection == 'In') {
                this.phoneDataIncoming.push(this.phoneData[i]);
                if (this.phoneData[i].in_callLog.notifiedTo !== undefined && this.phoneData[i].in_callLog.notifiedTo.length > 0) {
                    this.phoneData[i].notifiedDateTime = moment(this.phoneData[i].in_callLog.notifiedTo[0].datetime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                    if (this.phoneData[i].in_callLog.notifiedTo[0].userId !== undefined && this.phoneData[i].in_callLog.notifiedTo[0].userId.length > 0 && this.phoneData[i].in_callLog.notifiedTo[0].userId[0] !== null) {
                        this.phoneData[i].notifiedUsers = this.phoneData[i].in_callLog.notifiedTo[0].userId.join(", ");
                    }
                }
                if (this.phoneData[i].in_callLog.refusedBy !== undefined && this.phoneData[i].in_callLog.refusedBy.length > 0) {
                    this.phoneData[i].refusedDatetime = moment(this.phoneData[i].in_callLog.refusedBy[0].datetime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                    if (this.phoneData[i].in_callLog.refusedBy[0].userId !== undefined && this.phoneData[i].in_callLog.refusedBy[0].userId.length > 0 && this.phoneData[i].in_callLog.refusedBy[0].userId[0] !== null) {
                        this.phoneData[i].refusedUsers = this.phoneData[i].in_callLog.refusedBy[0].userId.join(", ");
                    }
                }
                if (this.phoneData[i].in_callLog.abandonedBy !== undefined && this.phoneData[i].in_callLog.abandonedBy.length > 0) {
                    this.phoneData[i].abandonedDatetime = moment(this.phoneData[i].in_callLog.abandonedBy[0].datetime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                    if (this.phoneData[i].in_callLog.abandonedBy[0].userId !== undefined && this.phoneData[i].in_callLog.abandonedBy[0].userId.length > 0 && this.phoneData[i].in_callLog.abandonedBy[0].userId[0] !== null) {
                        this.phoneData[i].abandonedUsers = this.phoneData[i].in_callLog.abandonedBy[0].userId.join(", ");
                    }
                }
                if (this.phoneData[i].in_callLog.answeredBy !== undefined && this.phoneData[i].in_callLog.answeredBy.length > 0) {
                    this.phoneData[i].answeredBy = this.phoneData[i].in_callLog.answeredBy;

                    for (let j = 0; j < this.phoneData[i].answeredBy.length; j++) {
                        if (this.phoneData[i].answeredBy[j].type == undefined) {
                            this.phoneData[i].answeredBy[j].type = "answerd";
                        }
                        if (this.phoneData[i].answeredBy[j].startTime !== undefined) {
                            this.phoneData[i].answeredBy[j].startTime = moment(this.phoneData[i].answeredBy[j].startTime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                        } else {
                            this.phoneData[i].answeredBy[j].startTime = moment(this.phoneData[i].answeredBy[j].datetime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                        }
                        if (this.phoneData[i].answeredBy[j].endTime !== undefined) {
                            this.phoneData[i].answeredBy[j].endTime = moment(this.phoneData[i].answeredBy[j].endTime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                        }
                        if (this.phoneData[i].answeredBy[j].userId !== undefined) {
                            this.phoneData[i].answeredBy[j].userId = this.phoneData[i].answeredBy[j].userId.toString();
                        }
                    }
                }
                if (this.phoneData[i].answerTime !== undefined && this.phoneData[i].answerTime !== '' && this.phoneData[i].answerTime !== null) {
                    this.phoneData[i].convAnswerTime = moment(this.phoneData[i].answerTime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                }
                if (this.phoneData[i].callDuration !== undefined && this.phoneData[i].callDuration !== '' && this.phoneData[i].callDuration !== null) {
                    this.phoneData[i].convCallDuration = moment().startOf('day').seconds(this.phoneData[i].callDuration).format("HH:mm:ss");
                }
                if (this.phoneData[i].in_queue !== undefined && this.phoneData[i].in_queue !== '') {
                    if (this.phoneData[i].in_queue === '1') {
                        this.phoneData[i].queue = 'Sales';
                    }
                    if (this.phoneData[i].in_queue === '2') {
                        this.phoneData[i].queue = 'Support';
                    }
                }

            } else {
                this.phoneDataOutgoing.push(this.phoneData[i]);
                if (this.phoneData[i].answerTime !== undefined && this.phoneData[i].answerTime !== '' && this.phoneData[i].answerTime !== null) {
                    if (this.phoneData[i].selectedHangupOption !== undefined && this.phoneData[i].selectedHangupOption !== '' && this.phoneData[i].selectedHangupOption !== null) {
                        this.phoneData[i].convAnswerTime = moment(this.phoneData[i].answerTime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                    } else {
                        this.phoneData[i].convAnswerTime = moment(this.phoneData[i].answerTime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
                    }
                }

                if (this.phoneData[i].callDuration !== undefined && this.phoneData[i].callDuration !== '' && this.phoneData[i].callDuration !== null) {
                    this.phoneData[i].convCallDuration = moment().startOf('day').seconds(this.phoneData[i].callDuration).format("HH:mm:ss");
                }
            }

            if (this.phoneData[i].callStartTime !== undefined && this.phoneData[i].callStartTime !== '' && this.phoneData[i].callStartTime !== null) {
                this.phoneData[i].convCallStartTime = moment(this.phoneData[i].callStartTime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
            }
            if (this.phoneData[i].callEndTime !== undefined && this.phoneData[i].callEndTime !== '' && this.phoneData[i].callEndTime !== null) {
                this.phoneData[i].convCallEndTime = moment(this.phoneData[i].callEndTime).tz('America/New_York').format('MM/DD/YY hh:mm:ss A');
            }
            if (this.phoneData[i].in_waitingDuration !== undefined && this.phoneData[i].in_waitingDuration !== '' && this.phoneData[i].in_waitingDuration !== null) {
                this.phoneData[i].convWaitingDuration = moment().startOf('day').seconds(this.phoneData[i].in_waitingDuration).format("HH:mm:ss");
            }
        }
        this.cdrService.callDetectChanges(this.cdr);
    }

}
