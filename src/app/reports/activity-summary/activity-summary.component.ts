//External imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivitySummaryService } from '@app/reports/activity-summary/activity-summary.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { LocalStorageUtilityService } from '@app/shared/services';


//Internal imports
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-activity-summary',
  templateUrl: './activity-summary.component.html',
  styleUrls: ['./activity-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitySummaryComponent implements OnInit {
  // public variable
  public userRoleList;
  public activitySummaryFormData: FormGroup; // form variable
  public userDetails: any;
  public isTestCustomer: boolean = false;
  public statusList = [{ 'id': 'appointment', 'displayText': 'Appointment/Followup', 'title': '' },
  { 'id': 'other', 'displayText': 'Other ', 'title': '' },
  { 'id': null, 'displayText': 'All ', 'title': '' }
  ];
  public ticketSummary: any = [];
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering

  //grid related variables
  public domLayout;
  public rowData: any = [this.domLayout = 'autoHeight'];
  public gridApi;
  public gridData: any;
  public gridColumnApi;
  public autoGroupColumnDef: any
  public detailcolumnDef: any;
  public columnDefs;
  public detailCellRendererParams;
  public defaultColDef: any;
  public getRowHeight;
  public masterGridClicked: boolean;
  public searchCriteria = {
    "activityType": [], "department": [], "salesProcessStatus": [], "activitystatus": [], "responsiblePerson": [], "feedback": [],
    "priority": [], "tagList": [], "resellerId": [], "isTestCustomer": false, "pageSize": "1000", "sortDirection": "desc", "sortExpression": "datetime",
    "activityTypeResult": [], "salesProcessStatusResult": [], "resellerIdResult": [], "priorityResult": [],
    "responsiblePersonResult": [], "activitystatusResult": [], "tagListResult": [], 'plannedDateFrom': '', 'plannedDateTo': '', 'dateTo': '', 'dateFrom': ''
  }
  // private variable
  private activitySummary: any;
  private summaryList: any = [];
  private departments: any = [];

  constructor(private activitySummaryService: ActivitySummaryService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private userService: UserService, private router: Router,
    private localStorageUtilityService: LocalStorageUtilityService) {

    this.columnDefs = [
      {
        headerName: 'Department', field: 'department', sortable: true, headerTooltip: 'Department', tooltipField: 'department',
        cellStyle: { "cursor": 'pointer' }, lockPosition: true, width: 200, cellRenderer: "agGroupCellRenderer", suppressMenu: true, sort: "asc"
      },
      {
        headerName: 'Name', field: "name", sortable: true, hide: false, headerTooltip: 'Name', tooltipField: 'name',
        cellStyle: { "cursor": 'pointer' }, lockPosition: true, suppressMenu: true, width: 200, cellClass: "text-wrap", autoHeight: true
      },
      { headerName: 'Older Than A Week', field: "olderThanWeek", sortable: true, hide: false, headerTooltip: 'Older Than A Week', lockPosition: true, suppressMenu: true, width: 200, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Last Week', field: "lastweek", sortable: true, hide: false, headerTooltip: 'Last Week', lockPosition: true, suppressMenu: true, width: 150, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Current Week', field: "currentWeek", sortable: true, hide: false, headerTooltip: 'Current Week', lockPosition: true, suppressMenu: true, width: 150, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Today', field: "today", sortable: true, hide: false, headerTooltip: 'Today', lockPosition: true, suppressMenu: true, width: 100, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Next Week', field: "nextWeek", sortable: true, hide: false, headerTooltip: 'Next Week', lockPosition: true, suppressMenu: true, width: 140, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'More Than A Week', field: "nextToNextWeek", sortable: true, hide: false, headerTooltip: 'More Than A Week', lockPosition: true, suppressMenu: true, width: 180, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Further Into Future Upto 31st Dec.', field: "uptoCurrentYear", sortable: true, hide: false, headerTooltip: 'Further Into Future Upto 31st Dec.', lockPosition: true, suppressMenu: true, width: 200, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Next Year', field: "nextYear", sortable: true, hide: false, headerTooltip: 'Next Year', lockPosition: true, suppressMenu: true, width: 150, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Total Activity', field: "total", sortable: true, hide: false, headerTooltip: 'Total Activity', lockPosition: true, suppressMenu: true, width: 150, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Without Tickets', field: "withoutTickets", sortable: true, hide: false, headerTooltip: 'Without Tickets', lockPosition: true, suppressMenu: true, width: 200, cellClass: "text-wrap", autoHeight: true },
      { headerName: 'Under UnIdentified Customer', sortable: true, field: "underUnIdentifiedCustomer", hide: false, headerTooltip: 'Under UnIdentified Customer', lockPosition: true, suppressMenu: true, width: 200, cellClass: "text-wrap", autoHeight: true }
    ];
    const self = this;
    this.detailCellRendererParams = {
      detailGridOptions: {
        columnDefs: [
          {
            headerName: 'Status',
            sortable: true,
            field: "status",
            hide: false,
            headerTooltip: 'Status',
            lockPosition: true,
            suppressMenu: true,
            width: 305,
            cellClass: "text-wrap",
            autoHeight: true
          },
          {
            headerName: 'Older Than A Week',
            field: "olderThanWeek",
            sortable: true,
            hide: false,
            headerTooltip: 'Older Than A Week',
            lockPosition: true,
            suppressMenu: true,
            width: 165,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.olderThanWeek) {
                let element = `<div data-action-type="olderThanWeek">${params.data.olderThanWeek}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'Last Week',
            field: "lastweek",
            sortable: true,
            hide: false,
            headerTooltip: 'Last Week',
            lockPosition: true,
            suppressMenu: true,
            width: 125,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.lastweek) {
                let element = `<div data-action-type="lastweek">${params.data.lastweek}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'Current Week',
            field: "currentWeek",
            sortable: true,
            hide: false,
            headerTooltip: 'Current Week',
            lockPosition: true,
            suppressMenu: true,
            width: 130,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.currentWeek) {
                let element = `<div data-action-type="currentWeek">${params.data.currentWeek}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'Today',
            field: "today",
            sortable: true,
            hide: false,
            headerTooltip: 'Today',
            lockPosition: true,
            suppressMenu: true,
            width: 80,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.today) {
                let element = `<div data-action-type="today">${params.data.today}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'Next Week',
            field: "nextWeek",
            sortable: true,
            hide: false,
            headerTooltip: 'Next Week',
            lockPosition: true,
            suppressMenu: true,
            width: 118,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.nextWeek) {
                let element = `<div data-action-type="nextWeek">${params.data.nextWeek}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'More Than A Week',
            field: "nextToNextWeek",
            sortable: true,
            hide: false,
            headerTooltip: 'More Than A Week',
            lockPosition: true,
            suppressMenu: true,
            width: 145,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.nextToNextWeek) {
                let element = `<div data-action-type="nextToNextWeek">${params.data.nextToNextWeek}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'Further Into Future Upto 31st Dec.',
            field: "uptoCurrentYear",
            sortable: true,
            hide: false,
            headerTooltip: 'Further Into Future Upto 31st Dec.',
            lockPosition: true,
            suppressMenu: true,
            width: 170,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.uptoCurrentYear) {
                let element = `<div data-action-type="uptoCurrentYear">${params.data.uptoCurrentYear}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'Next Year',
            field: "nextYear",
            sortable: true,
            hide: false,
            headerTooltip: 'Next Year',
            lockPosition: true,
            suppressMenu: true,
            width: 125,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.nextYear) {
                let element = `<div data-action-type="nextYear">${params.data.nextYear}</div>`
                return element;
              }
            }
          },
          {
            headerName: 'Total Activity',
            field: "total",
            sortable: true,
            hide: false,
            headerTooltip: 'Total Activity',
            lockPosition: true,
            suppressMenu: true,
            width: 420,
            cellClass: "text-wrap",
            autoHeight: true,
            cellRenderer: params => {
              if (params.data.total) {
                let element = `<div data-action-type="total">${params.data.total}</div>`
                return element;
              }
            }
          }
        ],
        enableBrowserTooltips: true,
        onRowClicked(e) {
          if (e.event.target !== undefined) {
            const data = e.data;
            const actionType = e.event.target.getAttribute("data-action-type");
            // if (actionType == "olderThanWeek") {
            //   self.redirectActivitySearch(data, 'older');
            // }
            switch (actionType) {
              case 'olderThanWeek':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'older');
                break;
              case 'lastweek':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'last');
                break;
              case 'currentWeek':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'current');
                break;
              case 'today':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'today');
                break;
              case 'nextWeek':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'next');
                break;
              case 'nextToNextWeek':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'more');
                break;
              case 'uptoCurrentYear':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'currentYear');
                break;
              case 'nextYear':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'nextYear');
                break;
              case 'total':
                self.masterGridClicked = false;
                self.redirectActivitySearch(data, 'total');
                break;
              default:
                self.masterGridClicked = false;
               // self.redirectActivitySearch(data, 'older');
            }

          }
        }
      },

      getDetailRowData: (params) => {
        params.successCallback(params.data.summaryData);
        // if (!this.masterGridClicked) {
        //   self.detailActivityDetailsArr = [];
        //   self.detailActivityDetailsArr.push(params.data.activityDetails);
        // }
      },
    };
    this.domLayout = "autoHeight";
    this.defaultColDef = {
      // suppressMenu: true,
      enableBrowserTooltips: true,
      tooltip: (p: any) => {
        return p.value;
      },
    };

    this.getRowHeight = function (params) {
      if (params.node && params.node.detail) {
        var offset = 50;

        var allDetailRowHeight = params.data.summaryData.length * 26;
        return allDetailRowHeight + offset;
      } else {
        return 26;
      }
    };
  }

  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute('data-action-type');
      switch (actionType) {
        //   case 'download':
        //     return self.download(e);
        default:
          this.masterGridClicked = true;
      }

    }
  }
  /**
   * @author Satyam Jasoliya
   * @createdDate 26/11/2019
   * @discription on grid ready
   * @memberof ActivitySummaryComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  public redirectActivitySearch(data, type): void {
    this.searchCriteria.responsiblePerson = [this.activitySummaryFormData.get('UserRoleListData').value];
    this.searchCriteria.isTestCustomer = this.activitySummaryFormData.get('isTestCustomer').value;
    var thisYear = (new Date()).getFullYear();
    let dates = { 'to': '', 'from': '' };
    if (type === 'older') {
      dates.to = moment(data.startDateOfLastWeek).subtract(1, 'days').utc().format();
    } else if (type === 'last') {
      dates.from = moment(data.startDateOfLastWeek).utc().format();
      dates.to = moment(data.endDateOfLastWeek).utc().format();
    } else if (type === 'current') {
      dates.from = moment().startOf('week').utc().format();
      dates.to = moment().endOf('week').utc().format();
    } else if (type === 'next') {
      dates.from = moment(data.startDateOfNextWeek).utc().format();
      dates.to = moment(data.endDateOfNextWeek).utc().format();
    } else if (type === 'more') {
      dates.from = moment(data.startDateOfNextToNextWeek).utc().format();
      dates.to = moment(data.endDateOfNextToNextWeek).utc().format();
    } else if (type === 'currentYear') {
      dates.from = moment(data.endDateOfNextToNextWeek).add(1, 'days').utc().format();
      dates.to = moment('12-31-' + thisYear).utc().format();
    } else if (type === 'nextYear') {
      dates.from = moment('1-1-' + (thisYear + 1)).utc().format();
    } else if (type === 'total') {
      dates.from = '';
      dates.to = '';
    }

    if (data.status === 'Appointment' || data.status === 'Followup') {
      this.searchCriteria.plannedDateFrom = dates.from;
      this.searchCriteria.plannedDateTo = dates.to;
      this.searchCriteria.dateFrom = '';
      this.searchCriteria.dateTo = ''
    } else {
      this.searchCriteria.dateFrom = dates.from;
      this.searchCriteria.dateTo = dates.to;
      this.searchCriteria.plannedDateFrom = '';
      this.searchCriteria.plannedDateTo = '';
    }

    this.searchCriteria.activitystatus = [{ id: data.status_value }]
    this.localStorageUtilityService.addToLocalStorage('ASearchCriteria', this.searchCriteria);
    window.open('/#/activity', '_blank');
  }

  /**
  * @author Manali Joshi
  * @createdDate 10/1/2020
  * @param {*}  inputvalue
  * @memberof ActivitySummaryComponent
  */
  filterData(eventTarget) {
    this.userRoleList = this.rpLookupDataForFilter;
    this.userRoleList = this.userRoleList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.cdr.detectChanges();
  }


  /**
 * @author Satyam Jasoliya
 * @createdDate 26/11/2019
 * @discription get user role list data
 * @memberof ActivitySummaryComponent
 */
  private getUserRoleList() {
    let paramObj: any = { "role": "" }
    this.activitySummaryService.getResposiblePersonList(paramObj).then((response: any) => {
      this.userRoleList = response;
      this.rpLookupDataForFilter = response; // for group filter
      this.cdr.detectChanges();
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 26/11/2019
 * @discription activity summary form
 * @memberof ActivitySummaryComponent
 */
  private activitySummaryData() {
    this.activitySummaryFormData = this.fb.group({
      UserRoleListData: this.fb.control(this.userDetails.id, Validators.required),
      isTestCustomer: this.fb.control(this.isTestCustomer),
      status: this.fb.control(null)
    });
    this.cdr.detectChanges();
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 26/11/2019
 * @discription reset form
 * @memberof ActivitySummaryComponent
 */
  public reset() {
    this.activitySummaryFormData.get('isTestCustomer').setValue(false);
    this.activitySummaryFormData.get('status').setValue(null);
    if (this.userDetails.id) {
      this.activitySummaryFormData.controls.UserRoleListData.setValue(this.userDetails.id);
      this.search();
    }
    this.cdr.detectChanges();
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 26/11/2019
 * @discription search data
 * @memberof ActivitySummaryComponent
 */
  public search(event?: any) {
    let paramObj: any = {};
    paramObj = {
      responsiblePerson: [this.activitySummaryFormData.get('UserRoleListData').value],
      isTestCustomer: this.activitySummaryFormData.get('isTestCustomer').value,
      status: this.activitySummaryFormData.get('status').value ? this.activitySummaryFormData.get('status').value : undefined
    }
    this.activitySummaryService.getActivitySummary(paramObj).then((response: any) => {
      this.departments = Object.keys(response);
      this.departments = _.sortBy(this.departments, function (dept) { return dept.toLowerCase() });

      let summaryData = [];
      if (this.departments && this.departments.length > 0) {
        for (const obj of this.departments) {
          summaryData.push({ 'department': obj, 'departmentData': response[obj] });
        }
      }

      this.summaryList = [];
      for (let department of summaryData) {
        for (let departmentData of department.departmentData) {
          let obj: any = {};
          obj.olderThanWeek = _.sumBy(departmentData.summaryData, 'olderThanWeek')
          obj.lastweek = _.sumBy(departmentData.summaryData, 'lastweek')
          obj.currentWeek = _.sumBy(departmentData.summaryData, 'currentWeek')
          obj.today = _.sumBy(departmentData.summaryData, 'today')
          obj.nextWeek = _.sumBy(departmentData.summaryData, 'nextWeek')
          obj.nextToNextWeek = _.sumBy(departmentData.summaryData, 'nextToNextWeek')
          obj.uptoCurrentYear = _.sumBy(departmentData.summaryData, 'uptoCurrentYear')
          obj.nextYear = _.sumBy(departmentData.summaryData, 'nextYear')
          obj.total = _.sumBy(departmentData.summaryData, 'total')
          obj.withoutTickets = departmentData.activityResult ? departmentData.activityResult.actsWithoutTicket : undefined
          obj.underUnIdentifiedCustomer = departmentData.activityResult ? departmentData.activityResult.underUnIdentifiedCustomer : undefined
          obj.department = department.department;
          obj.summaryData = departmentData.summaryData;
          obj.name = departmentData.name;
          obj.id = departmentData.id;

          if (obj.olderThanWeek == 0) {
            obj.olderThanWeek = '';
          } if (obj.lastweek == 0) {
            obj.lastweek = '';
          } if (obj.currentWeek == 0) {
            obj.currentWeek = '';
          } if (obj.today == 0) {
            obj.today = '';
          } if (obj.nextWeek == 0) {
            obj.nextWeek = '';
          } if (obj.nextToNextWeek == 0) {
            obj.nextToNextWeek = '';
          } if (obj.uptoCurrentYear == 0) {
            obj.uptoCurrentYear = '';
          } if (obj.nextYear == 0) {
            obj.nextYear = '';
          } if (obj.total == 0) {
            obj.total = '';
          }
          this.summaryList.push(obj);
          if (response.ticketResult && response.ticketResult.length > 0) {
            this.ticketSummary = _.sortBy(response.ticketResult, function (obj) { return obj.errorType.toLowerCase(); });
          } else {
            this.ticketSummary = [];
          }

          if (response.activityResult) {
            this.activitySummary = response.activityResult;
            if (this.activitySummary.actsWithoutTicket == undefined || this.activitySummary.actsWithoutTicket == 0) {
              this.activitySummary.actsWithoutTicket = 0;
            }
            if (this.activitySummary.underUnIdentifiedCustomer == undefined || this.activitySummary.underUnIdentifiedCustomer == 0) {
              this.activitySummary.underUnIdentifiedCustomer = 0;
            }
          } else {
            this.activitySummary = undefined;
          }

        }
      }
      this.rowData = this.summaryList;
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.activitySummaryData();
    this.getUserRoleList();
    this.search();
  }
}
