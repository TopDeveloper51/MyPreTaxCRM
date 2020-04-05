import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GridOptions } from 'ag-grid-community';
import { ContactHistoryService } from '@app/contact/dialogs/contact-history/contact-history.service';
import * as moment from 'moment-timezone';
@Component({
  templateUrl: './contact-history.component.html',
  styleUrls: ['./contact-history.component.scss'],
  providers: [ContactHistoryService]
})
export class ContactHistoryComponent implements OnInit {

  data: any;
  public apiParam;
  public gridApi;
  public domLayout;
  public defaultColDef: any;
  public gridData: any;
  public gridColumnApi;
  public contactId: any;
  public getRowHeight;
  public rowData = [this.domLayout = 'autoHeight'];
  historyData: any = []; // hold the history data
  public columnDefs: any;

  constructor(public modal: NgbActiveModal,
    private contactHistoryService: ContactHistoryService
  ) {
    this.columnDefs = [
      { headerName: 'Name', headerTooltip: 'Name', field: 'name', width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Old Value', headerTooltip: 'Old Value', field: 'oldValue', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'New Value', headerTooltip: 'New Value', field: 'newValue', tooltipField: 'status', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Updated By Name', headerTooltip: 'Updated By Name', field: 'updatedByName', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Updated Date', headerTooltip: 'Updated Date', field: 'updatedDate', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
    ],
      this.defaultColDef = {
        enableBrowserTooltips: true,
        tooltip: (p: any) => {
          return p.value;
        }
      };
    this.domLayout = "autoHeight";
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  public getContactHistroyData() {
    const self = this;
    let contactHistory: any = {
      customerID: this.data.contactDetail.customerId,
      contactID: this.data.contactDetail.contactId
    }
    this.contactHistoryService.getContactHistory(contactHistory).then((response: any) => {
      response.forEach(function (objData: any): any {
        objData.field.forEach(function (objField: any): any {
          if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate') {
            if (objField.name !== 'registrationDate') {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': (typeof objField.oldValue !== 'string') ? JSON.stringify(objField.oldValue) : objField.oldValue,
                'newValue': (typeof objField.newValue !== 'string') ? JSON.stringify(objField.newValue) : objField.newValue,
                'updatedDateNew': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY HH:mm'),
                'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm:ss a'),
                'updatedBy': objData.updatedByName
              });
            } else {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a'),
                'newValue': moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a'),
                'updatedDateNew': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY HH:mm'),
                'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm:ss a'),
                'updatedBy': objData.updatedByName
              });
            }
          }
        });
      });
      this.rowData = self.historyData;
    });
  }

  public close(): void {
    this.modal.close();
  }


  ngOnInit() {
    this.getContactHistroyData();
  }

}
