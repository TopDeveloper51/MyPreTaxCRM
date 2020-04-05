import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-verify-customer',
  templateUrl: './verify-customer.component.html',
  styleUrls: ['./verify-customer.component.scss']
})
export class VerifyCustomerComponent implements OnInit {

  data: any;
  public defaultColDef: any;
  public apiParam;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public rowData: any;
  public columnDefs: any;
  public getRowHeight;

  constructor(
    public modal: NgbActiveModal
  ) {
    this.columnDefs = [
      {

        headerName: '',
        width: 20,
        lockPosition: true,
        suppressMenu: true,
        sortable: false,
        cellStyle: { cursor: "pointer" },
        cellRenderer: (params) => {
          return '<a  target="_blank "> <img style="cursor: pointer; margin-right:60px" height="16" width="16" alt="Open Customer" title="Open Customer" src="assets/images/Angebot.png" data-action-type="goToCustomerCart"></a>';
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Customer Number',
        headerTooltip: 'Customer Number',
        field: 'customerNumber',
        tooltipField: 'customerNumber',
        width: 150,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellStyle: { cursor: "pointer" }
      },
      { headerName: 'Customer Name', headerTooltip: 'Customer Name', field: 'customerName', tooltipField: 'customerName', width: 150, lockPosition: true, suppressMenu: true, sort: "asc", cellStyle: { cursor: "pointer" } },
      { headerName: 'Sales Process Status', headerTooltip: 'Sales Process Status', field: 'salesProcessStatus', tooltipField: 'salesProcessStatus', width: 150, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
    ],
      this.defaultColDef = {
        enableBrowserTooltips: true,
        tooltip: (p: any) => {
          return p.value;
        },
        sortable: true,
      };
    this.domLayout = "autoHeight";
  }

  /**
* @author Satyam Jasoliya
* @createdDate 03/01/2020
* @description this method is use to redirect customer tab
* @memberof VerifyCustomerComponent
*/
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "goToCustomerCart":
          window.open('/#/customer/edit/' + e.data.customerId, '_blank');
          break;
        default:
          break;
      }
    }
  }

  /**
* @author Satyam Jasoliya
* @createdDate 03/01/2020
* @description this method is use to grid ready
* @memberof VerifyCustomerComponent
*/
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
* @author Satyam Jasoliya
* @createdDate 03/01/2020
* @description this method is use to bind customer data
* @memberof VerifyCustomerComponent
*/
  public duplicateCustomerList() {
    if (this.data) {
      this.rowData = this.data.data;
    }
  }
  public close(): void {
    this.modal.close();
  }
  ngOnInit() {
    this.duplicateCustomerList();
  }
}
