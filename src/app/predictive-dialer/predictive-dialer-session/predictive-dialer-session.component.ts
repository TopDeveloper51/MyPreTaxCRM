import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { PredictiveDialerManageComponent } from '@app/predictive-dialer/predictive-dialer-manage/predictive-dialer-manage.component';
import { PredictiveDialerService } from '@app/predictive-dialer/predictive-dialer.service';
import { DialogService } from '@app/shared/services/dialog.service';
// import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
// import { process, State } from '@progress/kendo-data-query';
// import { kendoSettings } from '../../common/kendoSetting';

@Component({
    templateUrl: 'predictive-dialer-session.component.html',
    styleUrls: ['predictive-dialer-session.component.scss']
})

export class PredictiveDialerSessionComponent implements OnInit {

    isDataLoading: boolean;
    sessionList: any = [];
    loadSessionList: any = [];

    // public pageSizes: Array<number> = [50, 100, 250];
   // public pageSizes = kendoSettings.pageSize;

    // public state: State = {
    //     skip: 0,
    //     take: 50,
    //     sort: [{ dir: 'asc', field: 'createdDate' }]
    // };

    // public dataStateChange(state: DataStateChangeEvent): void {
    //     this.state = state;
    //     this.sessionList = process(this.loadSessionList, this.state);
    // }


    constructor(private dialogService: DialogService, private viewContainerRef: ViewContainerRef,private predictiveDialerService:PredictiveDialerService) { }

    public openDialerSessionDialog(): void {
        this.dialogService.custom(PredictiveDialerManageComponent, {
            'title': 'Coupon', 'customHtml': '../predictive-dialer-manage/predictive-dialer-manage.component.html',
        }, this.viewContainerRef).result.then((result) => {
            if (result === true) {
                this.searchSession();
            }
        },
            (error) => {
                console.log(error);
            });
    }

    public editDocument(dialer: any): void {
        this.dialogService.custom(PredictiveDialerManageComponent, { 'title': 'Coupon', 'customHtml': '../predictive-dialer-manage/predictive-dialer-manage.component.html', 'data': { 'id': dialer.id } }, this.viewContainerRef)
            .result.then((result) => {
                if (result === true) {
                    this.searchSession();
                }
            },
            (error) => {
                console.log(error);
            });
    }

    public searchSession(): void {
        const self = this;
        this.isDataLoading = true;

        this.predictiveDialerService.searchSession().then((response) => {
            self.loadSessionList = response;
            if (self.loadSessionList != undefined) {
               // self.sessionList = process(self.loadSessionList, this.state);
            }
            else {
                self.sessionList = [];
            }
            self.isDataLoading = false;

        }, error => {
            console.log(error);
            self.isDataLoading = false;
        });
    }

    ngOnInit(): void {
        this.searchSession();
    }
}

