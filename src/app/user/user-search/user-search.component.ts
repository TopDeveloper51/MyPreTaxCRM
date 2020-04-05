import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgSelectComponent } from "@ng-select/ng-select";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UserSearchService } from '@app/user/user-search/user-search.service';
import { CDRService, LocalStorageUtilityService, DialogService } from '@app/shared/services';
import { ColDef } from 'ag-grid-community';
import * as moment from 'moment-timezone';
import { UserDetailComponent } from '@app/user/user-detail/user-detail.component';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSearchComponent implements OnInit {

  public UserSearchForm: FormGroup;
  public lookupData: any = {};
  public user: any = {};
  public isActive: boolean = true;
  public languageList: any = [{ id: 'none', name: 'None' }, { id: 'en', name: 'EN' }, { id: 'sp', name: 'SP' }, { id: 'both', name: 'Both' }];
  public rowData: any = [];
  public gridApi: any; // holds grid Api data
  public gridColumnApi: any; // holds grid column  Api data
  public columnDefs: ColDef[]; // holds column defination data
  public defaultColDef: any; // holds default column data
  public userData: any = {};
  constructor(private fb: FormBuilder, private usersearchService: UserSearchService, private CDRService: CDRService, private cdr: ChangeDetectorRef,
    private localStorageUtilityService: LocalStorageUtilityService, private dialogService: DialogService) {
    this.columnDefs = [
      {
        headerName: 'User Name',
        field: 'userName',
        headerTooltip: 'User Name',
        tooltipField: "userName",
        filter: 'agTextColumnFilter',
        width: 130,
      },
      {
        headerName: "First Name",
        field: "firstName",
        headerTooltip: "First Name",
        tooltipField: "firstName",
        filter: "agTextColumnFilter",
        width: 100,
      },
      {
        headerName: "Last Name",
        field: "lastName",
        tooltipField: "lastName",
        headerTooltip: "Last Name",
        filter: "agTextColumnFilter",
        width: 100,
      },
      {
        headerName: "Email",
        field: "email",
        headerTooltip: "Email",
        tooltipField: "email",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "Role",
        field: "role",
        headerTooltip: "Role",
        tooltipField: "role",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 150
      },
      {
        headerName: "TAcc. App.",
        field: "timesheetApproverName",
        headerTooltip: "TAcc. App.",
        tooltipField: "timesheetApproverName",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 120,
      },
      {
        headerName: "Designation",
        field: "designation",
        headerTooltip: "Designation",
        tooltipField: "designation",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 120,
      },
      {
        headerName: "Ext",
        field: "extension",
        headerTooltip: "Ext",
        tooltipField: "extension",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 60,
      },
      {
        headerName: "Lang",
        field: "language",
        headerTooltip: "Language",
        tooltipField: "language",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 70,
      },
      {
        headerName: "Queue",
        field: "queue",
        headerTooltip: "Queue",
        tooltipField: "queue",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 90,
      },
      {
        headerName: "Reseller Name",
        field: "resellerName",
        headerTooltip: "Reseller Name",
        tooltipField: "resellerName",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 100,
      },
      {
        headerName: "J. Date",
        field: "joiningDate",
        headerTooltip: "Joining Date",
        valueFormatter: this.formatDate,
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 100,

      },
      {
        headerName: "L. Date",
        field: "leftDate",
        headerTooltip: "Late Date",
        valueFormatter: this.formatDate,
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 100,
      },
      {
        headerName: "Phone",
        field: "allowPhone",
        headerTooltip: "Phone",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 80,
        cellRenderer: params => {
          if (params.data.allowPhone) {
            return ` <img style="width: 16px; float: left;padding-top:4px"  src="assets/images/Approved.png">`
          }
        }
      },
      {
        headerName: "In. Calls",
        field: "allowIncomingCall",
        headerTooltip: "Allow Incoming Calls",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 80,
        cellRenderer: params => {
          if (params.data.allowIncomingCall) {
            return ` <img style="width: 16px; float: left;padding-top:4px"  src="assets/images/Approved.png">`
          }
        }
      },
      {
        headerName: "T.Acc",
        field: "timeAccounting",
        headerTooltip: "Time Accounting",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 80,
        cellRenderer: params => {
          if (params.data.timeAccounting) {
            return ` <img style="width: 16px; float: left;padding-top:4px"  src="assets/images/Approved.png">`
          }
        }
      },
      {
        headerName: "Break Explanation",
        field: "breakExplanation",
        headerTooltip: "Break Explanation",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 80,
        cellRenderer: params => {
          if (params.data.breakExplanation) {
            return ` <img style="width: 16px; float: left;padding-top:4px"  src="assets/images/Approved.png">`
          }
        }
      },
      {
        headerName: "PD Manager View",
        field: "PDManagerView",
        headerTooltip: "PD Manager View",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 80,
        cellRenderer: params => {
          if (params.data.PDManagerView) {
            return ` <img style="width: 16px; float: left;padding-top:4px"  src="assets/images/Approved.png">`
          }
        }
      },
      {
        headerName: "Active",
        field: "isActive",
        headerTooltip: "Active",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 60,
        cellRenderer: params => {
          if (params.data.isActive) {
            return ` <img style="width: 16px; float: left;padding-top:4px"  src="assets/images/Approved.png">`
          }
        }
      }
    ];
    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      resizable: true,
      // suppressMenu: true,
      suppressMaxRenderedRowRestriction: true,
      suppressColumnVirtualisation: true
    };
  }

  public inituserSearchForm() {
    this.UserSearchForm = this.fb.group({
      name: '',
      email: '',
      designation: '',
      role: undefined,
      language: undefined,
      queue: undefined,
      resellerIdResult: [undefined],
      allowIncomingCall: '',
      isActive: [this.isActive],
      timeAccounting: '',
      breakExplanation: '',
      PDManagerView: ''
    })
  }
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "role":
        selected = [];
        selected = this.lookupData.roleList.map(
          item => item.id
        );
        this.UserSearchForm.get("role").patchValue(selected);
        break;
      case "language":
        selected = [];
        selected = this.languageList.map(
          item => item.id
        );
        this.UserSearchForm.get("language").patchValue(selected);
        break;
      case "queue":
        selected = [];
        selected = this.lookupData.pbxQueueList.map(
          item => item.id
        );
        this.UserSearchForm.get("queue").patchValue(selected);
        break;
      case "reseller":
        selected = [];
        selected = this.lookupData.resellerList.map(
          item => item.id
        );
        this.UserSearchForm.get("resellerIdResult").patchValue(selected);
        break;
    }
  }

  public onClearAll(clearSelectfor) {
    this.UserSearchForm.get(clearSelectfor).patchValue([]);
  }

  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  /**
   * @author shreya kanani
   * @description get lookup data for dropdown
   * @createdDate 29/01/2020
   */
  public getLookupForUserSearch() {
    this.usersearchService.getLookupForUserSearch(this.user).then((response: any) => {
      this.lookupData.roleList = response.roleList;
      this.lookupData.pbxQueueList = response.pbxQueueList;
      this.lookupData.resellerList = response.resellerList;
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author shreya kanani
   * @description bind grid data
   * @createdDate 29/01/2020
   */
  onGridReady(params): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * @author shreya kanani
   * @description this method call when row clicked
   * @createdDate 29/01/2020
   */
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "":
        default:
          this.getUserDoc(e.data)
      }
    }
  }
  /**
   * @author shreya kanani
   * @description get user data for grid
   * @createdDate 29/01/2020
   */
  public initAvailableUser() {
    const user = JSON.parse(JSON.stringify(this.UserSearchForm.value));
    user.resellerId = [];
    if (user.resellerIdResult) {
      for (const obj of user.resellerIdResult) {
        user.resellerId.push({ 'id': obj });
      }
    }
    user.pageNo = '1';
    user.pageSize = '5000';
    user.sortDirection = "asc";
    user.sortExpression = "allowPhone";
    this.usersearchService.userSearch(user).then((response: any) => {
      this.rowData = response;
      this.localStorageUtilityService.addToLocalStorage('userSerchObject', user);
      this.CDRService.callDetectChanges(this.cdr);
    });
  }
  /**
   * @author shreya kanani
   * @description this method reset the formcontrols
   * @createdDate 29/01/2020
   */
  public reset() {
    this.UserSearchForm.reset();
    this.UserSearchForm.controls.name.setValue('');
    this.UserSearchForm.controls.email.setValue('');
    this.UserSearchForm.controls.designation.setValue('');
    this.UserSearchForm.controls.isActive.setValue(true);
    this.rowData = undefined;
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author shreya kanani
   * @description this method fromate date 
   * @createdDate 29/01/2020
   */
  public formatDate(params) {
    if (params.value) {
      return moment(params.value).tz('America/New_York').format('MM/DD/YY');
    } else {
      return '';
    }
  }
  /**
   * @author shreya kanani
   * @description this method open user dialog 
   * @createdDate 29/01/2020
   */
  public openUserPopup() {
    this.user.isAddMode = true;
    // Open dialog;
    this.dialogService.custom(UserDetailComponent, { mode: this.user.isAddMode }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
      (response) => {
        if (response) {
          this.initAvailableUser();
        }
      }, (error) => {
        console.error(error);
      }
    );
  }

  /**
   * @author shreya kanani
   * @description this method open user dialog in edit mode
   * @createdDate 29/01/2020
   */
  public getUserDoc(e) {
    this.user.isAddMode = false;
    // Open dialog;
    this.dialogService.custom(UserDetailComponent, { mode: this.user.isAddMode, availableUser: e, nextPrev: this.rowData }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
      (response) => {
        if (response) {
          this.initAvailableUser();
        }
      }, (error) => {
        console.error(error);
      }
    );
  }

  ngOnInit() {
    this.inituserSearchForm();
    this.getLookupForUserSearch();
    if (this.localStorageUtilityService.checkLocalStorageKey('userSerchObject')) {
      this.userData = this.localStorageUtilityService.getFromLocalStorage('userSerchObject');
      this.UserSearchForm.patchValue(this.userData);
      this.initAvailableUser();
      this.CDRService.callDetectChanges(this.cdr);
    }
  }

}
