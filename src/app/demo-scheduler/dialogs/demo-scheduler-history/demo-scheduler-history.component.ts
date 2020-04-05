
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DemoSchedulerService } from '@app/demo-scheduler/demo-scheduler.service';
@Component({
  selector: 'app-demo-scheduler-history',
  templateUrl: './demo-scheduler-history.component.html',
  styleUrls: ['./demo-scheduler-history.component.scss']
})
export class DemoSchedulerHistoryComponent implements OnInit {

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

  constructor(private modal: NgbActiveModal, private demoschedulerService: DemoSchedulerService) {
    this.columnDefs = [
      {
        headerName: 'Name',
        headerTooltip: 'Name',
        field: 'name',
        tooltipField: 'name',
        filter: true,
        width: 300,
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
        width: 280,
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
        width: 320,
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
        width: 180,
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
        enableBrowserTooltips: true,
        enableValue: true,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true
      };
    this.domLayout = "autoHeight"
  }

  public getHistoryData() {
    const self = this;
    let data: any = {};
    data.startDate = this.history;
    this.demoschedulerService.
      getTrainingPlan(data).then((response: any) => {
        response.forEach(function (objData: any): any {
          if (objData.history && objData.history.length > 0) {
            objData.history.forEach(function (objField1: any): any {
              objField1.field.forEach(function (objField: any): any {
                if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate'
                  && objField.name !== 'documentList' && objField.name !== 'contactPerson') {
                  if (objField.name !== 'datetime' && objField.name !== 'plannedDateTime') {
                    self.historyData.push({
                      'name': objField.name.toUpperCase() + objField.name.slice(1),
                      'oldValue': objField.oldValue,
                      'newValue': objField.newValue,
                      'updatedDateNew': moment(objField1.updatedDate).tz('America/New_York').format('MM/DD/YYYY HH:mm:ss'),
                      'updatedDate': moment(objField1.updatedDate).format('MM/DD/YYYY hh:mm A'),
                      'updatedBy': objData.updatedByName

                    });
                  } else {
                    if (moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a') !== moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a')) {
                      self.historyData.push({
                        'name': objField.name.toUpperCase() + objField.name.slice(1),
                        'oldValue': moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a'),
                        'newValue': moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a'),
                        'updatedDateNew': moment(objField1.updatedDate).tz('America/New_York').format('MM/DD/YYYY HH:mm:ss'),
                        'updatedDate': moment(objField1.updatedDate).format('MM/DD/YYYY hh:mm A'),
                        'updatedBy': objData.updatedByName

                      });
                    }
                  }
                }
              });
            });
          }
        });
        this.rowData = this.historyData;
      });
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }
  public close() {
    this.modal.close();
  }

  ngOnInit(): void {
    this.history = this.data.date;
    this.getHistoryData();
  }

}
