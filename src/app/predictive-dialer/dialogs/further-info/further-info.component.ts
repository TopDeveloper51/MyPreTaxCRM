// External imports
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '@app/shared/services/message.service';
import { CDRService } from '@app/shared/services/cdr.service';

@Component({
    templateUrl: 'further-info.component.html',
    styleUrls: ['further-info.component.scss'],
})

export class FurtherInfoComponent implements OnInit {
    public predictiveDialer: any;
    public mandatoryBPDetails: boolean = false;
    public showMonthYear: boolean = false;
    public timePeriod: any = [];
    public rule: any;
    public type: any;

    quickLinks: any = [
        { 'id': 'IDidNotAsk', 'name': 'I didn\'t Ask' },
        { 'id': 'CustNotWillingToAnswer', 'name': 'Cust. not willing' }
    ];

    // constructor for basic initialization
    constructor(private dialogRef: MatDialogRef<any>, private cdr: ChangeDetectorRef, private messageService: MessageService, private cdrService: CDRService) { }

    // public selectCurrentSoftware(id: any, hasCustomerSoftware?: boolean) {
    //     if (hasCustomerSoftware) {
    //         this.predictiveDialer.currentSoftware = id;
    //         this.predictiveDialer.currentSoftwareQuestionReply = 'SelectSoftware';
    //     } else {
    //         this.predictiveDialer.currentSoftwareQuestionReply = id;
    //         this.predictiveDialer.currentSoftware = undefined;
    //     }
    // }

    // public selectBankProduct(id: any) {
    //     this.predictiveDialer.bankProductQuestionReply = id;
    //     this.predictiveDialer.noOfBankProducts = undefined;
    //     this.predictiveDialer.bankName = [];
    //     this.predictiveDialer.isUnknownVolume = undefined;
    //     this.mandatoryBPDetails = false;
    // }

    // public selectBPDetails(id?: any) {
    //     if (id !== undefined) {
    //         if (this.predictiveDialer.bankName.includes(id)) {
    //             const index = this.predictiveDialer.bankName.indexOf(id)
    //             this.predictiveDialer.bankName.splice(index, 1);
    //         } else {
    //             this.predictiveDialer.bankName.push(id);
    //         }
    //     }
    //     if ((this.predictiveDialer.noOfBankProducts !== undefined && this.predictiveDialer.noOfBankProducts !== null) || (this.predictiveDialer.isUnknownVolume !== undefined && this.predictiveDialer.isUnknownVolume == true) || (this.predictiveDialer.bankName !== undefined && this.predictiveDialer.bankName.length > 0)) {
    //         this.predictiveDialer.bankProductQuestionReply = 'BPCustomer';
    //         if (this.predictiveDialer.isUnknownVolume) {
    //             this.predictiveDialer.noOfBankProducts = undefined;
    //         }
    //         this.mandatoryBPDetails = true;
    //     } else {
    //         this.mandatoryBPDetails = false;
    //         this.predictiveDialer.bankProductQuestionReply = undefined;
    //     }
    //     this.cdrService.callDetectChanges(this.cdr);
    // }

    public selectTime(time: any) {
        this.predictiveDialer.followupMonth = time.month;
        this.predictiveDialer.followupYear = time.year;
        this.saveAndResume();
    }

    public saveAndResume() {
        if ((this.predictiveDialer.currentSoftwareQuestionReply !== undefined || this.predictiveDialer.currentSoftware !== undefined) && this.predictiveDialer.bankProductQuestionReply !== undefined) {
            if ((this.predictiveDialer.bankProductQuestionReply === 'BPCustomer' && ((this.predictiveDialer.noOfBankProducts == undefined && (this.predictiveDialer.isUnknownVolume == undefined || this.predictiveDialer.isUnknownVolume == false)) || (this.predictiveDialer.bankName == undefined || this.predictiveDialer.bankName.length == 0)))) {
                this.messageService.showMessage('Please fill in mandatory fields or select a bank product','error');
                this.mandatoryBPDetails = true;
                // this.predictiveDialer.followupMonth = undefined;
                // this.predictiveDialer.followupYear = undefined;
            } else if (this.rule == 'call this year again' && (this.predictiveDialer.followupMonth == undefined || this.predictiveDialer.followupYear == undefined)) {
                this.getMonthYearToCall();
            } else {
                this.dialogRef.close(this.predictiveDialer);
            }
        } else {
            this.messageService.showMessage("Please select from 'Current Software' and 'Financial Partners'",'error');
            // this.predictiveDialer.followupMonth = undefined;
            // this.predictiveDialer.followupYear = undefined;
        }
    }

    selectCommonButton(id: any) {
        this.predictiveDialer.currentSoftwareQuestionReply = id;
        this.predictiveDialer.currentSoftware = undefined;
        this.predictiveDialer.bankProductQuestionReply = id;
        this.predictiveDialer.noOfBankProducts = undefined;
        this.predictiveDialer.bankName = [];
        this.predictiveDialer.isUnknownVolume = undefined;
        this.mandatoryBPDetails = false;
        this.saveAndResume();
    }


    public getMonthYearToCall() {
        if (this.showMonthYear == true) {
            this.messageService.showMessage("Please select 'Month-Year'",'error');
        }
    }

    // notesFormat() {
    //     const self = this;
    //     let notesArray = [];
    //     if (self.predictiveDialer.notes !== undefined && self.predictiveDialer.notes !== null && self.predictiveDialer.notes !== '') {
    //         notesArray = self.predictiveDialer.notes.split('\n');
    //     }

    //     let newNotesArray = [];
    //     for (let item of notesArray) {
    //         if (item.includes('->') === false) {
    //             item = "-> " + item;
    //         }
    //         newNotesArray.push(item);
    //     }

    //     if (newNotesArray !== undefined && newNotesArray !== null && newNotesArray.length > 0) {
    //         self.predictiveDialer.notes = newNotesArray.join('\n');
    //     }
    // }

    setMessage() {
        if (this.type == 'type3') {
            this.messageService.showMessage("Please select 'Month-Year'", 'error');
        } else if (this.type == 'type2') {
            this.messageService.showMessage("Please select from 'Current Software' and 'Financial Partners'",'error' );
        } else if (this.type == 'type1') {
            this.messageService.showMessage('Please fill in mandatory fields or select a bank product', 'error');
        }
    }

    // initilization
    ngOnInit(): void {
        this.predictiveDialer = this.dialogRef.componentInstance.data.predictiveDialer;
        this.showMonthYear = this.dialogRef.componentInstance.data.showMonthYear;
        this.timePeriod = this.dialogRef.componentInstance.data.timePeriod;
        this.rule = this.dialogRef.componentInstance.data.rule;
        this.mandatoryBPDetails = this.dialogRef.componentInstance.data.mandatoryBPDetails;
        this.type = this.dialogRef.componentInstance.data.type;
        setTimeout(() => {
            this.setMessage();
        }, 0);
        this.cdrService.callDetectChanges(this.cdr);


    }

    ngOnDestroy() {
        this.cdr.detach();
    }

    // close dialog
    close(): void {
        this.dialogRef.close();
    }
}
