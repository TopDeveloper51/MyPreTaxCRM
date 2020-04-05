import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-checkinout-history',
  templateUrl: './checkinout-history.component.html',
  styleUrls: ['./checkinout-history.component.scss']
})
export class CheckinoutHistoryComponent implements OnInit {

  public data: any;
  public history: any;
  public historyData: any = [];
  public rowData: any;
  public gridApi;
  public domLayout;
  public defaultColDef;
  public columnDefs;
  public gridData: any;
  public gridColumnApi;
  public gridOptions;

  constructor(private modal: NgbActiveModal) {
    this.columnDefs = [
      {
        headerName: 'Name',
        headerTooltip: 'Name',
        field: 'name',
        tooltipField: 'name',
        filter: true,
        width: 200,
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
        width: 220,
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
        width: 220,
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
        width: 220,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Updated Date',
        headerTooltip: 'Updated Date',
        field: 'updatedDate',
        tooltipField: 'updatedDate',
        filter: true,
        width: 200,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      }
    ],
      this.defaultColDef = {
        enableBrowserTooltips: true,
        enableValue: true,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true
      };
    this.domLayout = "autoHeight"
  }

  /**
   * @author shreya kanani
   * @description this method is used to get history data
   */

  public getHistoryData() {
    const self = this;
    this.history.forEach(function (objData: any): any {
      objData.field.forEach(function (objField: any): any {
        if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate'
          && objField.name !== 'source' && objField.name !== 'checkIn') {
          if (objField.name !== 'checkOut') {
            self.historyData.push({
              'name': objField.name[0].toUpperCase() + objField.name.slice(1),
              'oldValue': objField.oldValue,
              'newValue': objField.newValue,
              'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm A'),
              'updatedBy': objData.updatedBy
            });
          } else {
            if (moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a') !== moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a')) {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': (objField.oldValue && objField.oldValue !== '') ? moment(objField.oldValue).tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A') : '',
                'newValue': (objField.newValue && objField.newValue !== '') ? moment(objField.newValue).tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A') : '',
                'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm A'),
                'updatedBy': objData.updatedBy
              });
            }
          }
        }
      });
      self.rowData = self.historyData;
    });
  }

  /**
   * @author shreya kanani
   * @param params 
   * @description this method is used to bing data in grid
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * @author shreya kanani
   * @description this method is used to close the dialog
   */
  public close() {
    this.modal.close();
  }

  ngOnInit(): void {
    this.history = this.data.data.history;
    this.getHistoryData();
  }

}
