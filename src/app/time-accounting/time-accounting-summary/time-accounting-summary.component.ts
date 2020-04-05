//External Imports
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgSelectComponent } from "@ng-select/ng-select";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from 'moment-timezone'
import * as _ from 'lodash';

//Internal Imports
import { TimeAccountingService } from '@app/time-accounting/time-accounting.service';
import { CDRService } from '@app/shared/services'

@Component({
  selector: 'app-time-accounting-summary',
  templateUrl: './time-accounting-summary.component.html',
  styleUrls: ['./time-accounting-summary.component.scss'],
  providers: [TimeAccountingService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeAccountingSummaryComponent implements OnInit {

  public responsiblePersonList: any = []; // store responsible person list from lookup
  public disableSearch: boolean = false; // to disable search button
  public checkInOutSummaryLookup: any = {};
  public checkInOutSummaryForm: FormGroup;
  public historySearch: any = { 'userId': [] }; // to pass in api
  public maxDate: Date; // used in date picker
  public availableHistory: any = []; // store response of getCheckInStatus
  public departments: any = []; // to store department data
  public disableNext: Boolean = false; // flag for diable next 2 week button
  public domLayout;
  public checkInData: any = [this.domLayout = 'autoHeight'];
  public rowDragManaged: any;
  public columnDefs: any;
  public sideBar: any;
  public multiSortKey: string;
  public animateRows: string;
  public floatingFilter: string;
  public enableCharts: string;
  public enableRangeSelection: string;
  public rowModelType;
  public rowSelection: string;
  public originalData: any;
  public gridApi;
  public gridColumnApi;
  public defaultColDef: any;
  public getRowStyle; // get row style
  public rowClassRules: any;
  public getRowHeight: any
  public rpLookupDataForFilter = [];  // handle group wise filtering this field holds all data for responsible person in which we are perform filtering

  constructor(private timeaccountingService: TimeAccountingService, private cdrService: CDRService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
    this.maxDate = new Date();
    this.columnDefs = [
      {
        headerName: 'Date',
        field: 'date',
        width: 400,
        headerTooltip: 'Date',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Duration',
        field: 'totalWorkingHours',
        width: 150,
        headerTooltip: 'Duration',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 200,
        headerTooltip: 'Status',
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.data.status === 'approved') {
            return {color:'black'}
          }
          if (params.data.status === 'notSentForApproval') {
            return {color:'red'}
          }
          if (params.data.status === 'sentForApproval') {
            return {color:'blue'}
          }
          if (params.data.status === 'reopened') {
            return {color:'black' , 'font-weight':'bold'}
          }
        },
      },
      {
        headerName: 'Sent for Approval Date',
        field: 'sentForApprovalDateNew',
        width: 400,
        headerTooltip: 'Sent for Approval Date',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Verified By',
        field: 'verifiedByName',
        width: 300,
        headerTooltip: 'Verified By',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Verified Date',
        field: 'verifiedDateNew',
        width: 300,
        headerTooltip: 'Verified Date',
        filter: 'agTextColumnFilter',
      },
    ],
      this.sideBar = {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
          },
          {
            id: "filters",
            labelDefault: "Filters",
            labelKey: "filters",
            iconKey: "filter",
            toolPanel: "agFiltersToolPanel"
          },
        ]
      };
      this.defaultColDef = {
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        tooltipValueGetter: (p: any) => {
          return p.value;
        },
        resizable: true,
        suppressMaxRenderedRowRestriction: true,
        suppressColumnVirtualisation: true
      };
      this.domLayout = "autoHeight";
      this.multiSortKey = 'ctrl';
      this.rowDragManaged = 'true';
      this.animateRows = 'true';
      this.floatingFilter = 'true';
    }
  /**
   * @author Mansi Makwana
   * @createdDate 13/03/2020
   * @discriptioncall called when page is load to bind data in gird
   * @memberOf TimeAccountingSummaryComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * @author shreya kanani
   * @description this method define form controls
   * @createdDate 13/03/2020
   */
  public initcheckInOutSummaryForm() {
    this.checkInOutSummaryForm = this.fb.group({
      responsiblePerson: [undefined, Validators.required],
      startDate: '',
      endDate: ''
    });
    this.cdrService.callDetectChanges(this.cdr);
  }

   /**
   * @author shreya kanani
   * @description this method call api for lookup data
   * @createdDate 13/03/2020
   */
  private getLookupForSummarySearch() {
    this.timeaccountingService.getLookupForOrder().then((response: any) => {
      this.checkInOutSummaryLookup.responsiblePersonList = response.responsiblePesronList;
      this.rpLookupDataForFilter = response.responsiblePesronList; // for group filter
      this.setDefault();
      this.cdrService.callDetectChanges(this.cdr);
    }, (error) => {
      this.disableSearch = false;
      this.cdrService.callDetectChanges(this.cdr);
      console.error(error);
    });
  }

   /**
   * @author shreya kanani
   * @description this method call on date change
   * @createdDate 13/03/2020
   */
  public dateChange(event: any, action?: any) {
    if (action === undefined || action === '' || action === null) {
      if (moment(event.value).startOf('week').format('YYYY-MM-DD') == moment(this.maxDate).startOf('week').format('YYYY-MM-DD')) {
        let objStartDate = new Date(moment(event.value).startOf('week').format());
        this.historySearch.startDate = new Date(moment(objStartDate).subtract(14, 'days').format());
        this.historySearch.endDate = new Date(moment(this.historySearch.startDate).add(14, 'days').format());
      } else {
        let objStartDate = new Date(moment(event.value).startOf('week').format());
        this.historySearch.startDate = new Date(moment(objStartDate).subtract(7, 'days').format());
        let objeEndDate = new Date(moment(event.value).endOf('week').format());
        this.historySearch.endDate = new Date(moment(objeEndDate).format());
      }
    } else if (action === 'Previous') {
      let objStartDate = new Date(moment(this.historySearch.startDate).startOf('week').format());
      this.historySearch.startDate = new Date(moment(objStartDate).subtract(14, 'days').format());
      this.historySearch.endDate = new Date(moment(this.historySearch.endDate).subtract(14, 'days').format());
    } else if (action === 'Next') {
      this.historySearch.startDate = new Date(moment(this.historySearch.startDate).add(14, 'days').format());
      this.historySearch.endDate = new Date(moment(this.historySearch.endDate).add(14, 'days').format());
    }
    let startdate = moment(this.historySearch.startDate).format('YYYY-MM-DD');
    let enddate = moment(this.historySearch.endDate).format('YYYY-MM-DD');
    this.checkInOutSummaryForm.controls.startDate.setValue(startdate);
    this.checkInOutSummaryForm.controls.endDate.setValue(enddate);
    this.getTimeAcctountingReports();
    this.cdrService.callDetectChanges(this.cdr);
    this.getTimeAcctountingReports();
  }

   /**
   * @author shreya kanani
   * @description this method to reset the search screen and setting the values to it's defaults
   * @createdDate 13/03/2020
   */
  public setDefault(): void {
    this.historySearch = { 'responsiblePerson': [] };
    this.availableHistory = [];
    this.setDefaultDate();
    for (const obj of this.checkInOutSummaryLookup.responsiblePersonList) {
      if (obj.group == 'Sales - Atlanta' || obj.group == 'Sales - Rome' || obj.group == 'Sales - Commission Only' || obj.group == 'Support - US' ||
        obj.group == 'Marketing - US' || obj.group == 'Customer Relation') {
        if (obj.timeAccounting === true) {
          this.historySearch.responsiblePerson.push(obj.id);
        }
      }
    }
    this.checkInOutSummaryForm.controls.responsiblePerson.setValue(this.historySearch.responsiblePerson);
    this.cdrService.callDetectChanges(this.cdr);
    // get details on screen load
    this.getTimeAcctountingReports();
  }

   /**
   * @author shreya kanani
   * @description this method set the default date
   * @createdDate 13/03/2020
   */
  private setDefaultDate() {
    this.historySearch.startDate = new Date(moment().startOf('week').subtract(7, 'days').format());
    this.historySearch.endDate = new Date(moment().endOf('week').format());
    let startdate = moment(this.historySearch.startDate).format('YYYY-MM-DD');
    let enddate = moment(this.historySearch.endDate).format('YYYY-MM-DD');
    this.checkInOutSummaryForm.controls.startDate.setValue(startdate);
    this.checkInOutSummaryForm.controls.endDate.setValue(enddate);
    this.cdrService.callDetectChanges(this.cdr);
  }

   /**
   * @author shreya kanani
   * @description select all dropdown values
   * @createdDate 13/03/2020
   */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "responsiblePerson":
        selected = [];
        selected = this.checkInOutSummaryLookup.responsiblePersonList.map(
          item => item.id
        );
        this.checkInOutSummaryForm.get("responsiblePerson").patchValue(selected);
        break;
    }
  }

   /**
   * @author shreya kanani
   * @description clear all dropdown values
   * @createdDate 13/03/2020
   */
  public onClearAll(clearSelectfor?: string) {
    this.checkInOutSummaryLookup.responsiblePersonList = this.rpLookupDataForFilter;
    if (this.checkInOutSummaryForm && clearSelectfor) {
      this.checkInOutSummaryForm.get(clearSelectfor).patchValue([]);
    }
  }

   /**
   * @author shreya kanani
   * @description close on select
   * @createdDate 13/03/2020
   */
  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  /**
   * @author shreya kanani
   * @description this method filter dropdown data
   * @createdDate 13/03/2020
   */
  public filterData(eventTarget) {
    this.checkInOutSummaryLookup.responsiblePersonList = this.rpLookupDataForFilter;
    this.checkInOutSummaryLookup.responsiblePersonList = this.checkInOutSummaryLookup.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.cdr.detectChanges();
  }

  /**
   * @author shreya kanani
   * @description this method get timeaccounting reports
   * @createdDate 13/03/2020
   */
  private getTimeAcctountingReports(): void {
    let paramObj = JSON.parse(JSON.stringify(this.checkInOutSummaryForm.value));
    paramObj.startDate = moment(this.checkInOutSummaryForm.controls.startDate.value).format('YYYY-MM-DD');
    paramObj.endDate = moment(this.checkInOutSummaryForm.controls.endDate.value).format('YYYY-MM-DD');
    if (moment(this.historySearch.endDate).format('YYYY-MM-DD') == moment(this.maxDate).startOf('week').format('YYYY-MM-DD') ||
      moment(this.historySearch.endDate).format('YYYY-MM-DD') > moment(this.maxDate).startOf('week').format('YYYY-MM-DD')) {
      this.disableNext = true;
    } else {
      this.disableNext = false;
    }
    this.timeaccountingService.getTimeAcctountingReports(paramObj).then((response) => {
      if (response !== undefined) {
        this.availableHistory = [];
        this.departments = [];
        if (Object.keys(response).length > 0) {
          this.departments = Object.keys(response);
          for (const obj of this.departments) {
            this.availableHistory.push({ 'department': obj, 'departmentData': response[obj] });
          }
          // if (this.availableHistory.departmentData && this.availableHistory.departmentData.length > 0) {
          //   for (let index in this.availableHistory.departmentData) {
          //     if (this.availableHistory.departmentData[index] && this.availableHistory.departmentData[index].sentForApprovalDate) {
          //       // converted to ET time and 24 hours formate (used for sorting)
          //       this.availableHistory.departmentData[index].sentForApprovalDateNew = moment(this.availableHistory.departmentData[index].sentForApprovalDate).tz('America/New_York').format('DD/MM/YYYY HH:mm:ss');
          //       // converted to ET time and 12 hours formate (used to bind in greed)
          //       this.availableHistory.departmentData[index].sentForApprovalDate = moment(this.availableHistory.departmentData[index].sentForApprovalDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          //     }
          //     if (this.availableHistory.departmentData[index] && this.availableHistory.departmentData[index].verifiedDate) {
          //       this.availableHistory.departmentData[index].verifiedDateNew = moment(this.availableHistory.departmentData[index].verifiedDate).tz('America/New_York').format('DD/MM/YYYY HH:mm:ss');
          //       this.availableHistory.departmentData[index].verifiedDate = moment(this.availableHistory.departmentData[index].verifiedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          //     }
          //   }
          // }

          this.cdrService.callDetectChanges(this.cdr);
          for (let aindex in this.availableHistory) {
            for (let dIndex in this.availableHistory[aindex].departmentData) {
              for (let obj of this.availableHistory[aindex].departmentData) {
                if (obj.accountingDetails === undefined) {
                  obj.accountingDetails = [];
                }
              }
            }
          }
          this.availableHistory = _.sortBy(this.availableHistory, 'department');
          for (let objAvailableHistory of this.availableHistory) {
            objAvailableHistory.departmentData = _.sortBy(objAvailableHistory.departmentData, 'userName');
            if (objAvailableHistory.departmentData && objAvailableHistory.departmentData !== null) {
              for (let dIndex in objAvailableHistory.departmentData) {
                if (objAvailableHistory.departmentData[dIndex].accountingDetails !== undefined && objAvailableHistory.departmentData[dIndex].accountingDetails.length > 0) {
                  let daysInWeekOne = 0
                  let daysInWeekTwo = 0
                  let weekOfStartDate = moment(this.historySearch.startDate).week();
                  let weekOfEndDate = moment(this.historySearch.endDate).week();
                  if (objAvailableHistory.departmentData[dIndex].accountingDetails.findIndex(t => t.date >= '2019-04-01') > -1 && (objAvailableHistory.department == 'Sales - Atlanta' || objAvailableHistory.department == 'Sales - Rome' || objAvailableHistory.department == 'Sales - Commission Only') && objAvailableHistory.departmentData[dIndex].userId !== '3d644a72-42fc-4cc5-a0cf-ed77db15b09e' && objAvailableHistory.departmentData[dIndex].userId !== '1c4ada05-fec3-4886-b370-d12412a58d09') {
                    objAvailableHistory.departmentData[dIndex].eligibleFor5MinProvision = true
                  }
                  if (objAvailableHistory.departmentData[dIndex].accountingDetails.length > 0) {
                    for (let accIndex in objAvailableHistory.departmentData[dIndex].accountingDetails) {

                      if (objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].status && objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].status === 'pending'){
                        objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].status = 'notSentForApproval';
                      }

                      // process data to bind in ag-grid start
                      if (objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].sentForApprovalDate) {
                        // converted to ET time and 24 hours formate (used for sorting)
                        objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].sentForApprovalDateNew = moment(objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].sentForApprovalDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
                        // converted to ET time and 12 hours formate (used to bind in greed)
                        objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].sentForApprovalDate = moment(objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].sentForApprovalDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
                      }
                      if (objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex] && objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].verifiedDate) {
                        objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].verifiedDateNew = moment(objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].verifiedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
                        objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].verifiedDate = moment(objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].verifiedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
                      }
                      // process data to bind in ag-grid end

                      if (objAvailableHistory.departmentData[dIndex].eligibleFor5MinProvision) {
                        if (objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].date >= '2019-04-01' && moment(objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].date).week() == weekOfStartDate) {
                          daysInWeekOne += 1
                        } else if (objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].date >= '2019-04-01' && moment(objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].date).week() == weekOfEndDate) {
                          daysInWeekTwo += 1
                        }
                      }
                      objAvailableHistory.departmentData[dIndex].accountingDetails[accIndex].userId = objAvailableHistory.departmentData[dIndex].userId;
                    }
                    if (objAvailableHistory.departmentData[dIndex].eligibleFor5MinProvision) {
                      objAvailableHistory.departmentData[dIndex].weekOneTotalSecondsWith5MinProvision = daysInWeekOne * 300
                      objAvailableHistory.departmentData[dIndex].weekOneTotalWorkingHoursWith5MinProvision = objAvailableHistory.departmentData[dIndex].weekOneTotalWorkingHours + objAvailableHistory.departmentData[dIndex].weekOneTotalSecondsWith5MinProvision
                      objAvailableHistory.departmentData[dIndex].weekTwoTotalSecondsWith5MinProvision = daysInWeekTwo * 300
                      objAvailableHistory.departmentData[dIndex].weekTwoTotalWorkingHoursWith5MinProvision = objAvailableHistory.departmentData[dIndex].weekTwoTotalWorkingHours + objAvailableHistory.departmentData[dIndex].weekTwoTotalSecondsWith5MinProvision
                      objAvailableHistory.departmentData[dIndex].totalSecondsWith5MinProvision = objAvailableHistory.departmentData[dIndex].weekOneTotalSecondsWith5MinProvision + objAvailableHistory.departmentData[dIndex].weekTwoTotalSecondsWith5MinProvision
                      objAvailableHistory.departmentData[dIndex].totalHoursWith5MinProvision = objAvailableHistory.departmentData[dIndex].totalHours + objAvailableHistory.departmentData[dIndex].totalSecondsWith5MinProvision
                    }
                  } else {
                    objAvailableHistory.departmentData[dIndex].accountingDetails = [];
                  }
                }
              }
            }
          }
        }
        this.cdrService.callDetectChanges(this.cdr);
      }
    })
  }

  /**
   * @author shreya kanani
   * @description call on search
   * @createdDate 13/03/2020
   */
  public search() {
    this.getTimeAcctountingReports();
  }

  ngOnInit(): void {
    this.getLookupForSummarySearch();
    this.initcheckInOutSummaryForm();
  }

}
