import { Component, OnInit } from '@angular/core';
import {UserSearchService} from '@app/user/user-search/user-search.service';
import * as moment from 'moment-timezone';
import { GridOptions } from 'ag-grid-community';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-user-history',
  templateUrl: './user-history.component.html',
  styleUrls: ['./user-history.component.scss']
})
export class UserHistoryComponent implements OnInit {

  public data:any;
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

  constructor(private usersearchService: UserSearchService,private modal: NgbActiveModal) { 
      this.columnDefs = [
        {
          headerName: 'Name',
          headerTooltip: 'Name',
          field: 'name',
          tooltipField: 'name',
          filter: true,
          width: 220,
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
          width: 510,
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
          width: 500,
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
          width: 140,
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
      this.defaultColDef = {
        enableBrowserTooltips : true,
        enableValue: true,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true
      };
      this.domLayout = "autoHeight"
  }

  public getHistoryData() {
    const self = this;
    this.usersearchService.userHistory(this.history).then((response: any) => {
      response.forEach(function (objData: any): any {
        objData.field.forEach(function (objField: any): any {
          if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate'
            && objField.name !== 'documentList' && objField.name !== 'contactPerson') {
            if (objField.name !== 'datetime' && objField.name !== 'plannedDateTime') {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': objField.oldValue,
                'newValue': objField.newValue,
                'updatedDateNew': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY HH:mm:ss'),
                'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm A'),
                'updatedBy': objData.updatedByName
              });
            } else {
              if (moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a') !== moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a')) {
                self.historyData.push({
                  'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                  'oldValue': moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a'),
                  'newValue': moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a'),
                  'updatedDateNew': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY HH:mm:ss'),
                  'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm A'),
                  'updatedBy': objData.updatedByName
                });
              }
            }
          }
        });
      });
      this.rowData = this.historyData;
    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }
  public close(){
    this.modal.close();
  }
  ngOnInit() {
    this.history = this.data.userNameHash;
    this.getHistoryData();
  }

}
