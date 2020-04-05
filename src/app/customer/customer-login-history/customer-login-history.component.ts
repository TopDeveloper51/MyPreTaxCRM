// External imports
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from "@angular/core";
import * as moment from 'moment-timezone';

// Internal imports
import { CustomerLoginHistoryService } from "@app/customer/customer-login-history/customer-login-history.service";


@Component({
  selector: 'app-customer-login-history',
  templateUrl: './customer-login-history.component.html',
  styleUrls: ['./customer-login-history.component.scss'],
  providers: [CustomerLoginHistoryService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerLoginHistoryComponent implements OnInit {

  @Input() customerID: string;

  public domLayout;
  public rowData: any;
  public gridApi;
  public gridData: any;
  public gridColumnApi;
  public autoGroupColumnDef: any
  public detailcolumnDef: any;
  public getRowHeight;

  constructor(private cdr: ChangeDetectorRef,
    private customerLoginHistoryService: CustomerLoginHistoryService) {
    this.domLayout = "autoHeight";
    this.getRowHeight = function (params) {
      if (params.node && params.node.detail) {
        var offset = 60;
        var allDetailRowHeight = params.data.history.length * 26;
        return allDetailRowHeight + offset;
      } else {
        return 26;
      }
    };
  }

  getCustomerLoginHistory(id: string) {
    if (id) {
      const object: any = { 'customerId': id };
      this.customerLoginHistoryService.getCustomerLoginHistory(object).then((response: any) => {
        if (response && response.length > 0) {
          response.forEach(element => {
            if (element.email) {
              element.emailWithCount = element.email + ' ' + '(' + element.history.length + ')';
            }
          });
        }
        this.rowData = response;
        this.cdr.detectChanges();
      });
    }
  }

  public columnDefs = [
    {
      headerName: '', field: 'emailWithCount', sortable: true, headerTooltip: 'email',
      lockPosition: true,
      cellRenderer: "agGroupCellRenderer",
      suppressMenu: true,
    }

  ]
  public detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { headerName: 'Ip', sortable: true, field: "ip", hide: false, headerTooltip: 'ip', lockPosition: true, suppressMenu: true, width: 270, cellClass: "text-wrap", autoHeight: true },
        {
          headerName: 'Login Time (ET)', sortable: true, field: "loginTime", hide: false, headerTooltip: 'loginTime', lockPosition: true, suppressMenu: true, width: 300,
          cellRenderer: params => {
            return moment(params.value).format('MM/DD/YY hh:mm:ss A')
          }
        },
        {
          headerName: 'Logout Time (ET)', sortable: true, field: "logoutTime", hide: false, headerTooltip: 'logoutTime', lockPosition: true, suppressMenu: true, width: 300,
          cellRenderer: params => {
            return moment(params.value).format('MM/DD/YY hh:mm:ss A')
          }
        },
      ],
    },

    getDetailRowData: (params) => {
      params.successCallback(params.data.history);
    },

    //   getRowHeight:  (params)=> {
    //     if (params.data && params.data.history) {
    //         var offset = 80;
    //         var allDetailRowHeight = params.data.history.length * 28;
    //         return allDetailRowHeight + offset;
    //     } else {
    //         // otherwise return fixed master row height
    //         return 60;
    //     }
    // }
  }


  /**
   * @description only open first row when first tym data render
   * @param {*} params
   * @memberof CustomerLoginHistoryComponent
   */
  onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
    setTimeout(function () {
      params.api.getDisplayedRowAtIndex(0).setExpanded(true);
    }, 0);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridColumnApi = params.columnApi;
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.customerID) {
      this.getCustomerLoginHistory(this.customerID);
    }
  }
}
