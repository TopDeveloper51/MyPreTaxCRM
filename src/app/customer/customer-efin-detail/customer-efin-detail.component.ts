// External imports
import { Component, OnInit, OnDestroy, Input, PipeTransform, Pipe, ViewContainerRef, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
// Internal imports
import { DialogService, CDRService } from '@app/shared/services';
import { EfinVerificationComponent } from '@app/customer/dialogs/efin-verification/efin-verification.component';
import { EfinLetterUploadComponent } from '@app/customer/dialogs/efin-letter-upload/efin-letter-upload.component';
import { APINAME } from '@app/customer/customer-constants';
import { CommonApiService } from '@app/shared/services/common-api.service';
import 'ag-grid-enterprise';
@Component({
    selector: 'app-customer-efin-detail',
    templateUrl: './customer-efin-detail.component.html',
    styleUrls: ['./customer-efin-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerEfinDetailComponent implements OnInit {

    public gridColumnApi;
    public domLayout;
    public gridData: any;
    public detailCellRendererParams;
    public columnDefs;
    public rowData = [];
    public res = [];
    public data;
    public getRowHeight;
    public gridColumnApiForEfin;
    public domLayoutForEfin;
    public gridDataForEfin: any;
    public detailCellRendererParamsForEfin;
    public columnDefsForEfin;
    public rowDataForEfin = [this.domLayoutForEfin = 'autoHeight'];
    public resForEfin = [];
    public dataForEfin;
    @Input('customerID') customerId: string;
    @Input('masterLocationId') masterLocationId: string;
    public buttonCount: number = 5;
    public info: boolean = true;
    public type: 'numeric' | 'input' = 'numeric';
    public previousNext: boolean = true;
    public status: any = {
        isFirstOpen: true,
        isOpen: false
    };
    constructor(private dialogService: DialogService, private viewContainerRef: ViewContainerRef,
        private cdr: ChangeDetectorRef, private _commonAPIService: CommonApiService, private _cDRService: CDRService) {
        const self = this;
        this.columnDefs = [
            {
                field: 'type', headerTooltip: 'Type', width: 100, tooltipField: "type",
                suppressMovable: true, suppressMenu: true, cellRenderer: 'agGroupCellRenderer', sortable: true
            },
            // {
            //     headerName: 'Subscription Type', headerTooltip: 'Subscription Type', field: 'subscriptionType',
            //     suppressMovable: true, suppressMenu: true, width: 100, sortable: true, tooltipField: "subscriptionType"
            // },
            {
                headerName: 'Office Name', headerTooltip: 'Office Name', field: 'name', sortable: true,
                suppressMovable: true, suppressMenu: true, width: 100, tooltipField: "name"
            }
        ],
            this.detailCellRendererParams = {
                enableBrowserTooltips: true,
                detailGridOptions: {
                    columnDefs: [
                        { headerName: 'Office Name', field: 'name', tooltipField: "name", sortable: true, suppressMovable: true, suppressMenu: true, width: 1000, },
                        { headerName: 'EFIN', field: 'efin', tooltipField: "efin", sortable: true, suppressMovable: true, suppressMenu: true, width: 250, type: 'numericColumn' }
                    ],
                    onFirstDataRendered(params) {

                        params.api.sizeColumnsToFit();
                    },
                    onRowClicked(e) {
                        // if (e.event.target !== undefined) {
                        //     const data = e.data;
                        //     const actionType = e.event.target.getAttribute('data-action-type');
                        //     // switch (actionType) {
                        //     //     case 'download':
                        //     //         return self.download(e);
                        //     // }
                        // }
                    },
                },
                getDetailRowData(params) {
                    let sessionData = [];
                    params.data.efinData.forEach((element, index) => {
                        let sessionObj: any = {};
                        sessionObj.name = element.name;
                        sessionObj.efin = element.efin;

                        sessionData.push(sessionObj);
                    });
                    params.successCallback(params.data.efinData);
                }
            };
        this.columnDefsForEfin = [
            {
                field: 'type', headerTooltip: 'Type', width: 100, tooltipField: "type",
                suppressMovable: true, suppressMenu: true, cellRenderer: 'agGroupCellRenderer', sortable: true
            },
            // {
            //     headerName: 'Subscription Type', headerTooltip: 'Subscription Type', field: 'subscriptionType',
            //     suppressMovable: true, suppressMenu: true, width: 1000, sortable: true, tooltipField: "subscriptionType"
            // },
            {
                headerName: 'Office Name', headerTooltip: 'Office Name', field: 'name', sortable: true,
                suppressMovable: true, suppressMenu: true, width: 100, tooltipField: "name"
            }
        ],
            this.detailCellRendererParamsForEfin = {
                enableBrowserTooltips: true,
                detailGridOptions: {
                    columnDefs: [
                        { headerName: 'EFIN', headerTooltip: "EFIN", tooltipField: 'efin', field: 'efin', sortable: true, suppressMovable: true, suppressMenu: true, width: 90, type: 'numericColumn' },
                        { headerName: 'Office Name', headerTooltip: "Office Name", tooltipField: 'locationNameList', field: 'locationNameList', sortable: true, suppressMovable: true, suppressMenu: true, width: 350 },
                        {
                            headerName: 'Status', field: 'efin', sortable: true, suppressMovable: true, suppressMenu: true, width: 90,
                            cellRenderer: (params) => {
                                let efinStatus = params.data.efinStatus;
                                if (efinStatus !== undefined) {
                                    if (efinStatus === 0) {
                                        return '<span title="Pending"> Pending</span> ';
                                    } else if (efinStatus === 1) {
                                        return '<span title="In Process"> In Process</span> ';
                                    } else if (efinStatus === 2) {
                                        return '<span title="Verified">Verified</span> ';
                                    } else if (efinStatus === 4) {
                                        return '<span title="Rejected">Rejected</span> ';
                                    } else if (efinStatus === 5) {
                                        return '<span title="Not Applicable">Not Applicable</span> ';
                                    }
                                }
                            }
                        },
                        {
                            headerName: 'Upload', field: 'efin', tooltipField: "Upload EFIN Letter", sortable: true, suppressMovable: true, suppressMenu: true, width: 100,
                            cellRenderer: (params) => {
                                if (params.data.efin != undefined && params.data.efin != '' && params.data.efinStatus != 1 && params.data.efinStatus != 2 && params.data.efinStatus != 5) {
                                    return '<i data-action-type="uploadEFINDoc" title="Upload EFIN Letter" class="fas fa-cloud-upload-alt font-15 cursor-pointer" title="Upload EFIN Letter"></i>';
                                } else {
                                    return '';
                                }
                            }
                        },
                        {
                            headerName: 'Verify', field: 'efin', tooltipField: "Verify EFIN", sortable: true, suppressMovable: true, suppressMenu: true, width: 85,
                            cellRenderer: (params) => {
                                if (params.data.efin != undefined && params.data.efin != '') {
                                    return ' <i data-action-type="EFINVerify" title="Verify EFIN"  class="fas fa-pencil-alt font-15 cursor-pointer"></i>';
                                } else {
                                    return '';
                                }
                            }
                        }
                    ],
                    onFirstDataRendered(params) {
                        params.api.sizeColumnsToFit();
                    },
                    onRowClicked(e) {
                        if (e.event.target !== undefined) {
                            const data = e.data;
                            const actionType = e.event.target.getAttribute('data-action-type');
                            switch (actionType) {
                                case 'uploadEFINDoc':
                                    return self.uploadEFINDoc(data.masterLocationId, data.name, data.efin, data.efinId);
                                case 'EFINVerify':
                                    return self.EFINVerify(data.masterLocationId, data.efin, data.efinId);
                            }
                        }
                    },
                },
                getDetailRowData(params) {
                    params.data.efinData.forEach((element, index) => {
                        element.masterLocationId = params.data.masterLocationId;
                        element.name = params.data.name;
                    });
                    params.successCallback(params.data.efinData);

                }
            };
        this.domLayout = "autoHeight";
        this.getRowHeight = function (params) {
            if (params.node && params.node.detail) {
                var offset = 50;
                if (params.data.efinData.length > 0) {
                    var allDetailRowHeight = params.data.efinData.length * 26;
                    return allDetailRowHeight + offset;
                } else {
                    return 100;
                }
            } else {
                return 26;
            }
        };
    }
    // change on router
    ngOnChanges(changes: any): any {
        // changes.prop contains the old and the new value...
        if (changes.customerId !== undefined && changes.customerId.previousValue !== undefined) {
            this.rebindGrid();
            this.rebindGridForEFIN();
        }
    }

    ngOnInit(): void {
        this.rebindGrid();
        this.rebindGridForEFIN();
    };

    ngOnDestroy(): void {
        this.cdr.detach();
    };

    public rebindGrid() {
        if (this.customerId !== undefined) {
            this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_EFIN_LIST, parameterObject: { customerId: this.customerId } }).then(response => {
                this.rowData = response;
                this._cDRService.callDetectChanges(this.cdr);
            });
        }
    }

    public rebindGridForEFIN() {
        if (this.customerId !== undefined) {
            this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_ALL_EFIN_LIST, parameterObject: { customerId: this.customerId } }).then(response => {
                this.rowDataForEfin = response
                this._cDRService.callDetectChanges(this.cdr);
            });
        }
    }

    public EFINVerify(masterLocationID, efin, efinId): void {

        this.dialogService.custom(EfinVerificationComponent, { locationID: masterLocationID, masterLocationId: masterLocationID, efin: efin, efinId: efinId }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then((response) => {
            this.rebindGrid(); this.rebindGridForEFIN();
        }, (error) => {
            console.error(error);
        });
    }

    // open dialoge when user click on efin verify in grid
    private uploadEFINDoc(masterLocationID, name, efin, efinId): void {
        this.dialogService.custom(EfinLetterUploadComponent, { locationID: masterLocationID, masterLocationId: masterLocationID, officeName: name, efin: efin,efinId: efinId  }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then((response) => {
            this.rebindGrid(); this.rebindGridForEFIN();
        }, (error) => {
            console.error(error);
        });
    };

    /**
     * @author Bijal Mistry
     * @createdDate 07.01.2020
     * @description   Interacts with the grid through the grid's interface.
     * @memberOf CustomerEfinDetailComponent
     */

    onGridReady(params) {
        this.data = params;
        params.api.sizeColumnsToFit();
        this.gridData = params.api;
        this.gridColumnApi = params.columnApi;
        this.rebindGrid();

    }
    /**
        * @author Bijal Mistry
        * @createdDate 07.01.2020
        * @description   Interacts with the grid through the grid's interface.
        * @memberOf CustomerEfinDetailComponent
        */

    onGridReadyForEfin(params) {
        this.dataForEfin = params;
        params.api.sizeColumnsToFit();
        this.gridDataForEfin = params.api;
        this.gridColumnApiForEfin = params.columnApi;
        this.rebindGridForEFIN();

    }

}

