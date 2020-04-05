//  External import
import { OnInit, Component, Input, ChangeDetectorRef, Output,EventEmitter,ChangeDetectionStrategy } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';

// Internal Import
import { ReturnSummaryService } from '@app/return-summary/return-summary.service';
import { CDRService, MessageService } from '@app/shared/services';

@Component({
  selector: 'app-return-search-with-ssn',
  templateUrl: './return-search-with-ssn.component.html',
  styleUrls: ['./return-search-with-ssn.component.scss']
})
export class ReturnSearchWithSsnComponent implements OnInit {
  @Output() search: EventEmitter<any> = new EventEmitter<any>();
  public keys: any;      // to get keys of an Object
  public direction: string = 'aesc';         // direction for Sorting
  public tableHeader: string;        // header of Table(title)
  public efileHistoryData: any = {};
  customerInfo: any = {};
  public isDesc: boolean = true;
  public statusList: any = [

    { id: 0, text: 'Waiting For Federal' },
    { id: 1, text: 'Mef Ready' },
    { id: 2, text: 'Schema Reject' },
    { id: 3, text: 'Packaging Ready' },
    { id: 4, text: 'Packaging Error ' },
    { id: 5, text: 'Transmission Ready ' },
    { id: 6, text: 'Transmission Error ' },
    { id: 7, text: 'Transmitted ' },
    { id: 8, text: 'Rejected ' },
    { id: 9, text: 'Accepted ' },
    { id: 10, text: 'Bank App Waiting For Ack ' },
    { id: 11, text: 'Bank App Mef Ready ' },
    { id: 12, text: 'Bank App Schema Reject ' },
    { id: 13, text: 'Bank App Send Ready ' },
    { id: 14, text: 'Bank App Rejected ' },
    { id: 15, text: 'Bank App Accepted ' },
    { id: 16, text: 'Bank App Accepted ' },
    { id: 17, text: 'Bank App Accepted ' },
    { id: 18, text: 'SentBank App Transmittedenc4 ' },
    { id: 21, text: 'Canceled ' },

  ]


  public rowData: any = [];
  public data: any = {};
  public defaultColDef: any;
  public getRowStyle: any;
  public sideBar: any;
  public gridApi;
  public gridColumnApi;
  public columnDefs: any;
  public userDetails: any = {};
  public domLayout;
  public keyForDisplayHeader = [];

  @Input('quickSummaryWithSearch') quickSummaryWithSearch: any;
  constructor(private cdr: ChangeDetectorRef,
    private cdrService: CDRService,
    private returnSummaryService: ReturnSummaryService,
    private messageService: MessageService) {
    this.columnDefs = [
      {
        headerName: 'Status',
        field: 'status',
        width: 130,
        headerTooltip: 'Status',
        cellStyle: { "cursor": 'pointer' },
        cellRenderer: (params) => {
          if (params && params.data && params.data.status !== undefined && params.data.status !== null) {
            for (const iterator of this.statusList) {
              if (iterator.id === params.data.status) {
                return iterator.text;
              }
            }
          }
        },
        tooltip: () => {
          return '';
        }
      },

      {
        headerName: 'Submission Id ',
        field: 'submissionId',
        width: 170,
        headerTooltip: 'Submission Id',
        tooltipField: 'submissionId',
        cellStyle: { "cursor": 'pointer' },
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Date eFiled ',
        field: 'createdDate',
        width: 165,
        headerTooltip: 'Created Date',
        valueFormatter: this.formatDate,
        filter: 'agTextColumnFilter',
        sort: 'asc'
      },
      {
        headerName: 'Transmitted Date ',
        field: 'transmittedDate',
        width: 165,
        headerTooltip: 'Transmitted Date',
        valueFormatter: this.formatDate,
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Ack. Date ',
        field: 'acknowledgementDate',
        width: 165,
        headerTooltip: 'Acknowledgement Date',
        valueFormatter: this.formatDate,
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 150,
        headerTooltip: 'Name',
        tooltipField: 'name',
        cellStyle: { "cursor": 'pointer' },
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 170,
        headerTooltip: 'Email',
        tooltipField: 'email',
        cellStyle: { "cursor": 'pointer' },
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Rejection Message',
        field: 'rejection',
        width: 640,
        autoHeight: true,
        headerTooltip: 'Rejection Message',
        tooltipField: 'rejection',
        cellStyle: { "cursor": 'pointer' },
        cellClass: "text-wrap",
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellRenderer: params => {
          if (params && params.value) {
            if (this.findTypeOfForRejection(params.value) == true) {
              let element = '<div>';
              if (params.value) {
                for (let index in params.value) {
                  element += `<span>
                    <div class="row">
                      <div class="col-1">(${parseInt(index) + 1})</div> 
                      <div class="col">${params.value[index]}</div>
                    </div>
                  </span>`;
                }
              }
              element += "</div>";
              return element;
            }
          }
        },
        tooltip: () => {
          return '';
        }
        // cellRenderer: (params) => {
        //   if (params && params.data && params.data.rejection) {
        //     if (this.findTypeOfForRejection(params.data.rejection) == true) {
        //       if (params.data.rejection.length > 0) {
        //         for (var i = 0; i < params.data.rejection.length; i++) {
        //           return `<span>(${i + 1})
        //             ${params.data.rejection[i]}</span>`
        //         }
        //         // for (let seq of params.data.rejection) {
        //         //   let i = 0;
        //         //   return `<span>(${i + 1})${seq}</span>`
        //         // }
        //       }
        //     }
        //   }
        // }
      },
    ];
    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      tooltip: (p: any) => {
        return p.value;
      },
      resizable: true,
      suppressMaxRenderedRowRestriction: true,
      suppressColumnVirtualisation: true
    };
    this.domLayout = "autoHeight";
  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription method for open eFile
   * @memberOf ReturnSearchWithSsnComponent
   */

  public openEFile(eFileId: string): void {
    this.returnSummaryService.openEFile(eFileId)
      .then((resonse: any) => {
      });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription This function is for sorting in efilehistorydata
   * @memberOf ReturnSearchWithSsnComponent
   */

  sortHistoryList(property, keys, innerKey) {
    this.tableHeader = property;
    this.direction = this.isDesc ? 'aesc' : 'desc';
    this.efileHistoryData[keys][innerKey] = _.orderBy(this.efileHistoryData[keys][innerKey], [property], [this.direction]);
    this.isDesc = !this.isDesc;
  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription This function is to get data from api via service
   * @memberOf ReturnSearchWithSsnComponent
   */

  public getEfileHistory() {
    let returnId = this.quickSummaryWithSearch.id.substring(2, 38);
    // this.quickReturnSummaryservice.getEfileHistory(returnId)
    //     .subscribe((response: any) => {
    if (this.quickSummaryWithSearch && this.quickSummaryWithSearch.efileHistory) {
      this.efileHistoryData = this.quickSummaryWithSearch.efileHistory;
      // console.log(this.efileHistoryData);
      this.tableHeader = 'createdDate';
      this.direction = 'desc';

      this.keys = Object.keys(this.efileHistoryData);
      for (let i = 0; i < this.keys.length; i++) {
        const keys = this.keys[i];
        for (let innerKey in this.efileHistoryData[keys]) {
          this.efileHistoryData[keys][innerKey] = _.orderBy(this.efileHistoryData[keys][innerKey], [this.tableHeader], [this.direction]);
          this.data[keys + ' ' + innerKey] = this.efileHistoryData[keys][innerKey];
        }
      }
      this.keyForDisplayHeader = Object.keys(this.data);
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 07-12-2019
   * @discription call when aggrid load
   * @memberOf ReturnWithSsnComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * @author Mansi Makwana
   * @createdDate 09-12-2019
   * @discription to format Date
   * @memberOf ReturnWithSsnComponent
   */
  public formatDate(params) {
    if (params.value) {
      return moment(params.value).format('MM/DD/YYYY hh:mm A');
    } else {
      return '';
    }

  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription  to find type of for rejection
   * @memberOf ReturnSearchWithSsnComponent
   */

  findTypeOfForRejection(rejection) {
    var isArray = false;
    if (typeof (rejection) === 'object') {
      isArray = true;
    } else {
      isArray = false;
    }
    return isArray;
  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription This function is used to open customerDetail screen in a new window
   * @memberOf ReturnSearchWithSsnComponent
   */

  goToCustomerCart(): void {
    if (this.customerInfo.customerId) {
      window.open('/#/customer/edit/' + this.customerInfo.customerId, '_blank');
    } else {
      this.messageService.showMessage('Customer Id is mssing', 'error');
    }
  }

  Search()
  {
    this.search.emit();
  }

  ngOnChanges(): void {
    this.getEfileHistory();
    if (this.quickSummaryWithSearch !== undefined && this.quickSummaryWithSearch !== '') {
      if (Object.keys(this.quickSummaryWithSearch.customerInfo).length > 0) {
        this.customerInfo = JSON.parse(this.quickSummaryWithSearch.customerInfo);
      }
    }
  }

  ngOnInit(): void {
    this.getEfileHistory();
    if (this.quickSummaryWithSearch !== undefined && this.quickSummaryWithSearch !== '') {
      if (Object.keys(this.quickSummaryWithSearch.customerInfo).length > 0) {
        this.customerInfo = JSON.parse(this.quickSummaryWithSearch.customerInfo);
      }
    }
  }
}

