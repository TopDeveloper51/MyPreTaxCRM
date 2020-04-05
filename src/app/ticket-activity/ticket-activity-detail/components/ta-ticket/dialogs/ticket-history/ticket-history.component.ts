import { Component, OnInit, Input, ChangeDetectionStrategy,ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

//
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/ticket-activity/ticket-activity.constants';
import { CDRService } from '@app/shared/services/cdr.service';

@Component({
  selector: 'mtpo-ticket-history',
  templateUrl: './ticket-history.component.html',
  styleUrls: ['./ticket-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketHistoryComponent implements OnInit {

  @Input() data: any;
  public rowData: any = [];
  public defaultColDef: any;
  public gridApi;
  public gridColumnApi;
  public columnDefs: any;
  public historyData: any = [];


  constructor(
    public modal: NgbActiveModal,
    private commonApiService: CommonApiService,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
  ) {
    this.columnDefs = [
      { headerName: 'Name', field: 'name', tooltipField: 'name', width: 300, cellStyle: { cursor: "pointer" } },
      { headerName: 'Old Value', field: 'oldValue', tooltipField: 'oldValue', width: 350, cellStyle: { cursor: "pointer" } },
      { headerName: 'New Value', field: 'newValue', tooltipField: 'newValue', cellStyle: { cursor: "pointer" } },
      { headerName: 'Updated By', field: 'updatedBy', tooltipField: 'updatedBy', width: 300, cellStyle: { cursor: "pointer" } },
      { headerName: 'Updated Date', field: 'updatedDate', tooltipField: 'updatedDate', width: 230, cellStyle: { cursor: "pointer" } },
    ],
      this.defaultColDef = {
        enableValue: true,
        sortable: true,
        resizable: false,
        suppressMenu: false,
        tooltip: (p: any) => {
          return p.value;
        },
        enableBrowserTooltips: true
      };
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (window.innerWidth < 1366) {
      params.api.autoSizeColumns();
    }
    else {
      params.api.sizeColumnsToFit();
    }
  }

  private getTicketHistoryData(): void {
    const self = this;
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_HISTORY, parameterObject: { ID: self.data.ticketId } }).then(response => {
      response.forEach(function (objData: any): any {
        objData.field.forEach(function (objField: any): any {
          if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate'
            && objField.name !== 'documentList' && objField.name !== 'contactPerson') {
            if (objField.name !== 'datetime' && objField.name !== 'plannedDateTime') {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': objField.oldValue,
                'newValue': objField.newValue,
                'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm:ss a'),
                'updatedBy': objData.updatedByName
              });
            } else {
              if (moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a') !== moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a')) {
                self.historyData.push({
                  'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                  'oldValue': moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a'),
                  'newValue': moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a'),
                  'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm:ss a'),
                  'updatedBy': objData.updatedByName
                });
              }
            }
          }
        });
      });
      this.rowData = this.historyData;
      this.CDRService.callDetectChanges(this.cdr);
    }, error => {
      console.error(error);
    });
  }


  ngOnInit() {
    this.getTicketHistoryData();
  }

}
