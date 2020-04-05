import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { UserService, CommonApiService, CDRService } from '@app/shared/services';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgSelectComponent } from "@ng-select/ng-select";
import * as moment from 'moment-timezone'
import { BreakReasonSearchService } from '@app/reports/break-reason-search/break-reason-search.service';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-training-search',
  templateUrl: './break-reason-search.component.html',
  styleUrls: ['./break-reason-search.component.scss']

})
export class BreakReasonSearchComponent implements OnInit {

  @Input('isInternalMeeting') isInternalMeeting: boolean = false;

  public userDetails: any;
  public reasonList: any; // store lookup data
  public trainingSearchData: any = { userId: [], reason: [] }; // store search feild data
  public trainingSearchForm: FormGroup;
  public trainingSearchLookup: any = {};
  public reasonData: any = {}; // store condition for which drop-down show
  public maxDate: Date;
  public disableNext: boolean = false;
  public rowData: any;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public data: any
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible
  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Date',
        headerTooltip: 'Date',
        field: 'date',
        filter: true,
        width: 170,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Conductor Name',
        headerTooltip: 'Conductor Name',
        field: 'conductorName',
        filter: true,
        width: 180,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Participants Name',
        headerTooltip: 'Participants Name',
        field: 'participantsName',
        filter: true,
        width: 200,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Start Time',
        headerTooltip: 'Start Time',
        field: 'startTime',
        filter: true,
        width: 200,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'End Time',
        headerTooltip: 'End Time',
        field: 'endTime',
        filter: true,
        width: 200,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Duration (min.)',
        headerTooltip: 'Duration (min.)',
        field: 'duration',
        filter: true,
        width: 180,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Explanation',
        headerTooltip: 'Explanation',
        field: 'explanation',
        filter: true,
        width: 400,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
    ],
    enableBrowserTooltips: true,
  };


  constructor(private userService: UserService,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private breakSearchReasonService: BreakReasonSearchService) { this.maxDate = new Date(); }

  /**
   * @author shreya kanani
   * @description this method define form controls
   */
  public inittrainingSearchForm() {
    this.trainingSearchForm = this.fb.group({
      reason: ['', [Validators.required]],
      responsibleperson: ['', Validators.required],
      startdate: [''],
      enddate: ['']
    })
  }

  /**
   * @author shreya kanani
   * @description this method bind data in grid
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
  * @author Manali Joshi
  * @createdDate 10/1/2020
  * @param {*}  inputvalue
  * @memberof ActivitySearchComponent
  */
  filterData(eventTarget) {
    this.trainingSearchLookup.responsiblePersonList = this.rpLookupDataForFilter;
    this.trainingSearchLookup.responsiblePersonList = this.trainingSearchLookup.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.cdrService.callDetectChanges(this.cdr);
  }

  /**
   * @author shreya kanani
   * @description this method call api for lookup data
   */
  getLookupForBreakExplanation() {
    this.breakSearchReasonService.getLookupForBreak().then((response: any) => {
      this.trainingSearchLookup.reasonList = response.breakExplanationList;
      this.trainingSearchLookup.responsiblePersonList = response.responsiblePersonList;
      this.rpLookupDataForFilter = response.responsiblePersonList; // for group filter
      if (this.isInternalMeeting) {
        this.trainingSearchData.reason = 'Meeting/Training';
      }
      setTimeout(() => {
        this.cdrService.callDetectChanges(this.cdr);
      }, 0);

    });
  }

  /**
   * @author shreya kanani
   * @description select all values
   */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "responsibleperson":
        selected = [];
        selected = this.trainingSearchLookup.responsiblePersonList.map(
          item => item.id
        );
        this.trainingSearchForm.get("responsibleperson").patchValue(selected);
        break;

    }
  }

  /**
   * @author shreya kanani
   * @description clear all values
   */
  public onClearAll(clearSelectfor?: string) {
    this.trainingSearchLookup.responsiblePersonList = this.rpLookupDataForFilter;
    if (this.trainingSearchForm && clearSelectfor) {
      this.trainingSearchForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author shreya kanani
   * @description close on select
   */
  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  /**
   * @author shreya kanani
   * @description this method set flag
   */
  setIndependentFlags(event) {
    let indexOfReason = this.trainingSearchLookup.reasonList.findIndex(t => t.id === event);
    if (indexOfReason !== -1) {
      if (this.trainingSearchLookup.reasonList[indexOfReason].AskForExplanation && this.trainingSearchLookup.reasonList[indexOfReason].AskForExplanation.length > 0) {
        this.reasonData.askForConductor = this.trainingSearchLookup.reasonList[indexOfReason].AskForExplanation.includes('AskForConductor');
        this.reasonData.askForColleague = this.trainingSearchLookup.reasonList[indexOfReason].AskForExplanation.includes('AskForColleague');
      } else {
        this.reasonData.askForConductor = false;
        this.reasonData.askForColleague = false;
      }
      this.trainingSearchData.userId = [];
      this.cdrService.callDetectChanges(this.cdr);
    }
  }

  /**
   * @author shreya kanani
   * @description this method call when date change
   */
  dateChange(event, action?) {
    if (action === undefined || action === '' || action === null) {
    } else if (action === 'Previous') {
      let startdate = new Date(moment(this.trainingSearchForm.value.startdate).subtract(2, 'weeks').format());
      let enddate = new Date(moment(startdate).add(13, 'days').format());
      this.trainingSearchForm.get('startdate').setValue(startdate);
      this.trainingSearchForm.get('enddate').setValue(enddate);
    } else if (action === 'Next') {
      let enddate = new Date(moment(this.trainingSearchForm.value.enddate).add(2, 'weeks').format());
      let startdate = new Date(moment(enddate).subtract(13, 'days').format());
      this.trainingSearchForm.get('startdate').setValue(startdate);
      this.trainingSearchForm.get('enddate').setValue(enddate);
    }
    if (moment(this.maxDate).format('YYYY-MM-DD') >= moment(this.trainingSearchForm.value.startdate).format('YYYY-MM-DD') &&
      moment(this.maxDate).format('YYYY-MM-DD') <= moment(this.trainingSearchForm.value.enddate).format('YYYY-MM-DD')) {
      this.disableNext = true;
    } else {
      this.disableNext = false;
    }

    this.cdrService.callDetectChanges(this.cdr);
    this.search();
  }

  /**
   * @author shreya kanani
   * @description this method search data
   */
  search() {
    const self = this;
    const item = [];
    let paramObj: any = {};
    for (let i = 0; i < (this.trainingSearchForm.get('responsibleperson').value !== undefined && this.trainingSearchForm.get('responsibleperson').value !== null ? this.trainingSearchForm.get('responsibleperson').value.length : 0); i++) {
      if (this.trainingSearchForm.get('responsibleperson').value[i] !== undefined) {
        item.push({ id: this.trainingSearchForm.get('responsibleperson').value[i] });
      }
    }

    paramObj.userId = this.trainingSearchForm.value.responsibleperson;
    paramObj.reason = [this.trainingSearchData.reason];
    paramObj.startDate = moment(this.trainingSearchForm.value.startdate).format('YYYY-MM-DD');
    paramObj.endDate = moment(this.trainingSearchForm.value.enddate).format('YYYY-MM-DD');
    this.data = paramObj;
    this.breakSearchReasonService.getBreakReasonData(paramObj).then(response => {
      this.rowData = response;
    });
    this.cdrService.callDetectChanges(this.cdr);
  }

  /**
   * @author shreya kanani
   * @description this method set deafult values
   */
  setDefault(): void {
    this.disableNext = true;
    this.reasonData.askForConductor = false;
    this.reasonData.askForColleague = false;
    this.trainingSearchForm.get('responsibleperson').patchValue([]);
    if (this.isInternalMeeting) {
      this.trainingSearchForm.get('reason').setValue('Meeting/Training');
      this.trainingSearchForm.get('reason').disable();
    } else {
      this.trainingSearchForm.get('reason').setValue('');
    }
    setTimeout(() => {
      this.cdrService.callDetectChanges(this.cdr);
    }, 0);
    this.setDefaultDate();
  }

  /**
   * @author shreya kanani
   * @description this method set deafult date
   */
  setDefaultDate(): void {
    let startDate = new Date(moment().startOf('week').subtract(7, 'days').format());
    let startdate = moment(startDate).format('YYYY-MM-DD');
    this.trainingSearchForm.get('startdate').setValue(startDate);
    let endDate = new Date(moment().endOf('week').format());
    let enddate = moment(endDate).format('YYYY-MM-DD');
    this.trainingSearchForm.get('enddate').setValue(endDate);
    setTimeout(() => {
      this.cdrService.callDetectChanges(this.cdr);
    }, 0);
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.inittrainingSearchForm();
    this.getLookupForBreakExplanation();
    this.setDefault();
    if (!this.isInternalMeeting) {
      this.trainingSearchForm.get('responsibleperson').clearValidators();
      this.gridOptions.columnApi.setColumnsVisible(["conductorName", "participantsName"], false);
    }
  }
}

