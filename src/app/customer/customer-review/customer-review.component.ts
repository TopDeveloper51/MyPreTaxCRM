import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewContainerRef, Input } from '@angular/core';
import { CustomerReviewService } from "@app/customer/customer-review/customer-review.service";
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment-timezone';
import { DialogService } from '@app/shared/services';
import { CustomerReviewDetailComponent } from '@app/customer/dialogs/customer-review-detail/customer-review-detail.component';

@Component({
  selector: 'app-customer-review',
  templateUrl: './customer-review.component.html',
  styleUrls: ['./customer-review.component.scss'],
  providers: [CustomerReviewService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerReviewComponent implements OnInit {

  @Input() customerID: any;

  //grid related variables
  public defaultColDef: any;
  public apiParam;
  public gridApi;
  public gridData: any;
  public gridColumnApi;
  public rowData: any;
  public columnDefs: any;
  public getRowHeight;
  public domLayout;
  public ratingsArray = [1, 2, 3, 4, 5];
  constructor(private customerReviewService: CustomerReviewService,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService,
    private viewContainerRef: ViewContainerRef) {

    this.columnDefs = [
      { headerName: 'Date', headerTooltip: 'Date', field: 'etDate', width: 150, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
      {
        headerName: 'Ratings',
        headerTooltip: 'Ratings',
        filter: true,
        width: 150,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          switch (params.data.rating) {
            case 1:
              return `<i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i>`;
            case 2:
              return `<i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i>`;
            case 3:
              return `<i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i>`;
            case 4:
              return `<i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i>`;
            case 5:
              return `<i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i><i class="fa fa-star cursor-pointer font-15" aria-hidden="true"></i>`;
            default:
              break;
          }
        },
        tooltip: () => {
          return '';
        }
      },
      { headerName: 'Review', headerTooltip: 'Review', field: 'feedback', tooltipField: 'feedback', filter: true, width: 300, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
      { headerName: 'Platform', headerTooltip: 'Platform', field: 'platform', filter: true, width: 180, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" } },
    ],
      this.defaultColDef = {
        enableBrowserTooltips: true,
        tooltip: (p: any) => {
          return p.value;
        },
      };
    this.domLayout = "autoHeight";
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getCustomerReviewData() {
    const object: any = { 'custId': this.customerID };
    this.customerReviewService.getCustomerReview(object).then((response: any) => {
      this.rowData = response;
      if (this.rowData && this.rowData.length > 0) {
        for (let obj of this.rowData) {
          if (obj.date) {
            obj.etDate = moment(obj.date).tz('America/New_York').format('MM/DD/YY hh:mm A');
          }
        }
      }
      this.cdr.detectChanges();
    });

  }

  public editReview(selectedRow) {
    selectedRow.data.customerId = this.customerID;
    selectedRow.data.custId = this.customerID;
    this.dialogService.custom(CustomerReviewDetailComponent, { 'data': selectedRow.data }, { keyboard: true, backdrop: 'static', size: 'md' }).result
      .then((result) => {
        if (result) {
          this.getCustomerReviewData();
        }
      }, (error) => {
        console.log(error);
      });
  }

  public addData() {
    // open dialog
    let obj: any = {};
    obj.customerId = this.customerID;
    this.dialogService.custom(CustomerReviewDetailComponent, { 'data': JSON.parse(JSON.stringify(obj)) }, { keyboard: true, backdrop: 'static', size: 'md' }).result.then((result) => {
      if (result) {
        this.getCustomerReviewData();
      }
    }, (error) => {
      console.log(error);
    });
  }


  ngOnInit() {
    this.getCustomerReviewData();
  }
  ngOnChanges() {
    if (this.customerID) {
      this.getCustomerReviewData();
    }
  }
}
