// External imports
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment-timezone';
import { APINAME } from '@app/predictive-dialer/predictive-dialer-constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonApiService } from '@app/shared/services/common-api.service';
import { CDRService } from '@app/shared/services/cdr.service';

@Component({
    templateUrl: 'predictive-dialer-list.component.html',
    styleUrls: ['predictive-dialer-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PredictiveDialerListComponent implements OnInit, OnDestroy {

    data: any;
    listName: string;
    public defaultColDef: any;
    public apiParam;
    public gridApi;
    public domLayout;
    public gridData: any;
    public gridColumnApi;
    public rowData: any;
    public columnDefs: any;
    public getRowHeight;
    public marketingListData: any = {}; // store value of marketing data
    public currentDate = moment().format('MM/DD/YYYY');

    constructor(
        public modal: NgbActiveModal,
        private cdr: ChangeDetectorRef,
        private CDRService: CDRService,
        private _commonAPI: CommonApiService) {
        this.columnDefs = [
            { headerName: 'Priority', headerTooltip: 'Priority', field: 'priority', tooltipField: 'Priority', filter: "agTextColumnFilter", width: 150, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
            { headerName: 'Priority Name', headerTooltip: 'Priority Name', field: 'priorityName', tooltipField: 'Priority Name', filter: "agTextColumnFilter", width: 150, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
            { headerName: 'TimeZone', headerTooltip: 'TimeZone', field: 'timeZone', tooltipField: 'TimeZone', width: 150, filter: "agTextColumnFilter", lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
            { headerName: 'Start Time', headerTooltip: 'Start Time', field: 'startTimeET', tooltipField: 'Start Time', width: 300, filter: "agTextColumnFilter", lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
            { headerName: 'Remaining Count', headerTooltip: 'Remaining Count', field: 'remainingCount', tooltipField: 'Remaining Count', filter: "agTextColumnFilter", width: 220, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
            { headerName: 'Count', headerTooltip: 'Count', field: 'count', tooltipField: 'Count', width: 220, lockPosition: true, filter: "agTextColumnFilter", suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
        ],
            this.defaultColDef = {
                enableBrowserTooltips: true,
                sortable: true,
                tooltip: (p: any) => {
                    return p.value;
                },
            };
        this.domLayout = "autoHeight";
    }

    onGridReady(params) {
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.gridData = params.api;
        this.gridColumnApi = params.columnApi;
    }

    // get dialerlist
    public getDialerList(): void {
        if (this.data.data.dialerKey) {
            this.listName = this.data.data.dialerName;
            let data = { 'id': this.data.data.dialerKey }
            // let data = { date: "20180420" };
            this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_DIALER_LIST, parameterObject: data, showLoading: true }).then(response => {

                if (response) {
                    response.forEach(element => {
                        element.startTimeET = element.startTime ? moment(element.startTime).tz('America/New_York').format('MM/DD/YY hh:mm A') : '';
                        element.remainingCount = element.remainingCount === 0 ? '' : element.remainingCount;
                        element.count = element.count === 0 ? '' : element.count;
                        element.priority = element.priority === 0 ? '' : element.priority;
                    });
                    this.rowData = response;
                } else {
                    this.rowData = [];
                }
                this.CDRService.callDetectChanges(this.cdr);
            });
        }
    }

    public close(): void {
        this.modal.close();
    }

    // initilization
    ngOnInit(): void {
        this.getDialerList();
    }

    ngOnDestroy() {
        // Disconnect Change Detector Ref
        this.cdr.detach();
    }

}
