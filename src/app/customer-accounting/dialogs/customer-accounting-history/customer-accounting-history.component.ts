// External import
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
// Internal import
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-customer-accounting-history',
  templateUrl: './customer-accounting-history.component.html',
  styleUrls: ['./customer-accounting-history.component.scss']
})
export class CustomerAccountingHistoryComponent implements OnInit {
  public data: any;
  public apiParam;
  public gridApi;
  public domLayout;
  public defaultColDef: any;
  public gridData: any;
  public gridColumnApi;
  public contactId: any;
  public getRowHeight;
  public rowData = [this.domLayout = 'autoHeight'];
  private paymentHistory: any = []; // hold the history data
  public columnDefs: any;
  constructor(private model: NgbActiveModal) { 
    this.columnDefs = [
      { headerName: 'Name', headerTooltip: 'Name', field: 'name', width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Old Value', headerTooltip: 'Old Value', field: 'oldValue', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'New Value', headerTooltip: 'New Value', field: 'newValue', tooltipField: 'status', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Updated By Name', headerTooltip: 'Updated By Name', field: 'updatedByName', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Updated Date', headerTooltip: 'Updated Date', field: 'updatedDate', filter: true, width: 250, lockPosition: true, suppressMenu: true,  sort: 'desc',sortable: true  },
    ],
      this.defaultColDef = {
        enableBrowserTooltips: true,
        tooltip: (p: any) => {
          return p.value;
        }
      };
    this.domLayout = "autoHeight";
  }

    /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description grid setting 
* @memberof CustomerAccountingHistoryComponent
*/
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description get payment history  
* @memberof CustomerAccountingHistoryComponent
*/
  public getPaymentHistroy()
  {
    const self = this;
    this.data.paymentHistory.forEach(function (objData: any): any {
      objData.field.forEach(function (objField: any): any {
        if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate' && objField.name !== 'updatedByName' && objField.name !== 'createdByName'
            && objField.name !== 'documentList' && objField.name !== 'contactPerson') {
            if (objField.name !== 'datetime' && objField.name !== 'plannedDateTime') {
                self.paymentHistory.push({
                    'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                    'oldValue': objField.oldValue,
                    'newValue': objField.newValue,
                    'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm A'),
                    'updatedBy': objData.updatedByName
                });
            } else {
                if (moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a') !== moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a')) {
                    self.paymentHistory.push({
                        'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                        'oldValue': moment(objField.oldValue).format('MM/DD/YYYY hh:mm A'),
                        'newValue': moment(objField.newValue).format('MM/DD/YYYY hh:mm A'),
                        'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm A'),
                        'updatedBy': objData.updatedByName
                    });
                }
            }
        }
    });
    });
    this.rowData = self.paymentHistory;
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description dialog close method 
* @memberof CustomerAccountingHistoryComponent
*/
  public close() {
    this.model.close();
  }

  ngOnInit(): void {
   this.getPaymentHistroy();
  }

}
