// External Imports
import { Component, OnInit, forwardRef, Provider, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment-timezone';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
// Internal Imports
import { FormBuilder, FormGroup } from '@angular/forms';
import { PredictiveDialerService } from '@app/predictive-dialer/predictive-dialer.service';
import { MessageService } from '@app/shared/services';

@Component({
    templateUrl: './predictive-dialer-statistics.component.html',
    styleUrls: ['./predictive-dialer-statistics.component.scss'],
})
export class PredictiveDialerStatisticsComponent implements OnInit {
    public predictiveDialerForm: FormGroup;
    public date = moment(new Date()).format();
    public predictiveData: any = [];
    public dialerNameArray: any;
    public processData: any = {};
    public len: number;
    public format: any = 'MM/dd/y';
    public type = 'date';
    public isValid = false;
    constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private predictiveDialerService: PredictiveDialerService,
        private messageService: MessageService) { }


    /**
     * @author Mansi Makwana
     * @createdDate 15-11-2019
     * @discription to create predictive dialer form
     * @memberOf PredictiveDialerManageComponent
     */
    public initPredictiveDialerForm() {
        this.predictiveDialerForm = this.fb.group({
            startdate: this.date,
            enddate: this.date,
        });
        this.cdr.detectChanges();
    }

    /**
     * @author Mansi Makwana
     * @createdDate 15-11-2019
     * @discription to check start date and end date difference(difference must be 2 week)
     * @memberOf PredictiveDialerManageComponent
     */
    public dateChange(event) {
        let startdate = moment(this.predictiveDialerForm.value.startdate).format();
        // let startDate = moment(startdate).format('YYYY-MM-DD');
        let enddate = moment(this.predictiveDialerForm.value.enddate).format();
        // let endDate = moment(enddate).format('YYYY-MM-DD');
        this.predictiveDialerForm.controls.startdate.setValue(startdate);
        this.predictiveDialerForm.controls.enddate.setValue(enddate);
        this.search();
    }

    /**
     * @author Mansi Makwana
     * @createdDate 20-11-2019
     * @discription check date validation 
     * @memberOf PredictiveDialerManageComponent
     */
    checkValidDate() {
        let startdate = new Date(moment(this.predictiveDialerForm.value.startdate).format());
        let startDate = moment(startdate).format('YYYY-MM-DD');
        let enddate = new Date(moment(this.predictiveDialerForm.value.enddate).format());
        let endDate = moment(enddate).format('YYYY-MM-DD');

        const days = moment(endDate).diff(moment(startDate), 'days');
        if (days > 31) {
            this.messageService.showMessage('The date range must not exceed more than 31 days.', 'error');
            this.isValid = false;
        } else if (startDate && endDate && (moment(startDate).format('YYYY-MM-DD') > moment(endDate).format('YYYY-MM-DD'))) {
            this.messageService.showMessage("'Actual Date To' should be greater than 'Actual Date From'", 'error');
            this.isValid = false;
        } else {
            this.isValid = true;
        }
    }

    /**
     * @author Mansi Makwana
     * @createdDate 15-11-2019
     * @discription to search according startdate and enddate
     * @memberOf PredictiveDialerManageComponent
     */
    public search() {
        this.checkValidDate();
        this.processData = {};
        this.len = 0;
        if (this.isValid) {
            let startDate = moment(this.predictiveDialerForm.controls.startdate.value).format('YYYY-MM-DD');
            let endDate = moment(this.predictiveDialerForm.controls.enddate.value).format('YYYY-MM-DD');
            this.predictiveDialerService.getDialerListLookup({ dateFrom: startDate, dateTo: endDate }).then((response: any) => {
                if (response && response.length > 0) {
                    response.sort((a, b) => 0 - (a.dialerName > b.dialerName ? -1 : 1));
                    let resArr: any = []
                    response.forEach((item) => {
                        const i = resArr.findIndex(x => x.dialerName === item.dialerName);
                        if (i <= -1) {
                            resArr.push({ dialerName: item.dialerName });
                        }
                    });
                    response.sort((a, b) => 0 - (a.creadtedDate > b.creadtedDate ? -1 : 1));
                    for (let res of response) {
                        if (res.creadtedDate) {
                            res.creadtedDate = moment(res.creadtedDate).format('MM/DD');
                            if (this.processData[res.creadtedDate]) {
                                this.processData[res.creadtedDate].push(res);
                            }
                        }
                        if (res && res.dialerName) {
                            if (this.processData[res.dialerName]) {
                                this.processData[res.dialerName].push(res);
                            } else {
                                this.processData[res.dialerName] = [res];
                            }
                        }

                    }

                    const keys = Object.keys(this.processData);
                    this.len = keys.length;
                    this.predictiveData.push(this.processData);
                    this.cdr.detectChanges();
                }
            }, (error) => {
                this.len = 0;
                console.error();
                this.cdr.detectChanges();
            });
        }
    }

    /**
     * @author Mansi Makwana
     * @createdDate 15-11-2019
     * @discription to reset predictive dialer form
     * @memberOf PredictiveDialerManageComponent
     */
    public resetFilter() {
        this.len = 0;
        this.processData = {};
        this.initPredictiveDialerForm();
        this.search();
        this.cdr.detectChanges();
    }

    ngOnInit() {
        this.initPredictiveDialerForm();
        this.search();

    }

}