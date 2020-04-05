import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CustomerHistoryService } from '@app/customer/dialogs/customer-history/customer-history.service';
import { CDRService } from '@app/shared/services';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-customer-history',
  templateUrl: './customer-history.component.html',
  styleUrls: ['./customer-history.component.scss']
})
export class CustomerHistoryComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal,
    private customerHistoryService: CustomerHistoryService,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef) { }

  public data: any;
  public rowData: any;
  public historyData: any = []; // hold the history data
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Name',
        headerTooltip: 'Name',
        field: 'name',
        tooltipField: 'name',
        filter: true,
        width: 350,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Old Value',
        headerTooltip: 'Old Value',
        field: 'oldValue',
        tooltipField: 'oldValue',
        filter: true,
        width: 370,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'New Value',
        headerTooltip: 'New Value',
        field: 'newValue',
        tooltipField: 'newValue',
        filter: true,
        width: 370,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Updated By',
        headerTooltip: 'Updated By',
        field: 'updatedBy',
        tooltipField: 'updatedBy',
        filter: true,
        width: 250,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Updated Date',
        headerTooltip: 'Updated Date',
        field: 'updatedDateNew',
        tooltipField: 'updatedDateNew',
        filter: true,
        width: 170,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      }
    ],
    enableBrowserTooltips: true,
  };

  /**
   * @author shreya kanani
   * @description get customer history
   */
  getCustomerHistory() {
    const self = this;
    this.customerHistoryService.getCustomerHistoryData({ 'customerID': this.data.data.objHistory.customerId }).then((response: any) => {
      response.forEach(function (objData: any): any {
        objData.field.forEach(function (objField: any): any {
          if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate') {
            if (objField.name !== 'registrationDate') {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': (typeof objField.oldValue !== 'string') ? JSON.stringify(objField.oldValue) : objField.oldValue,
                'newValue': (typeof objField.newValue !== 'string') ? JSON.stringify(objField.newValue) : objField.newValue,
                'updatedDateNew': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY hh:mm A'),
                'updatedDate': objData.updatedDate,
                'updatedBy': objData.updatedByName
              });
            } else {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a'),
                'newValue': moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a'),
                'updatedDateNew': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY hh:mm A'),
                'updatedDate': objData.updatedDate,
                'updatedBy': objData.updatedByName
              });
            }
          }
        });
      });
      this.rowData = this.historyData;
      setTimeout(() => {
        this.cdrService.callDetectChanges(this.cdr);
      }, 0);

    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * @author shreya kanani
   * @description close dialog
   */
  public closeCustomerHistoryDialog() {
    this.activeModal.close(false);
  }

  ngOnInit() {
    this.getCustomerHistory();
  }

}
