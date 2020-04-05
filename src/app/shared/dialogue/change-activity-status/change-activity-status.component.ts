import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';

// Internal Imports
import { CDRService, CommonApiService, UserService } from '@app/shared/services';
import { MessageService } from '@app/shared/services/message.service';
import { APINAME } from "@app/activity/activity-constants";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: 'app-change-activity-status',
  templateUrl: './change-activity-status.component.html',
  styleUrls: ['./change-activity-status.component.scss'],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeActivityStatusComponent implements OnInit {

  @Input() data: any;
  public userDetails: any = {};
  public changeCustomerForm: FormGroup; // contains change customer form
  public changeActivityLookup: any = {
    responsiblePesronList: [], activitystatuslist: [],
    year: [],
    departmentlistDetail: []
  };
  public isOtherTeamMember: boolean;
  public requestObject: any = {};

  constructor(
    private fb: FormBuilder,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private commonApiService: CommonApiService,
    private messageService: MessageService,
    public userService: UserService,
    public modal: NgbActiveModal,
  ) { }

  /**
   * @author Manali Joshi
   * @createdDate 24-10-2019
   * @description close deop-down
   * @param {NgSelectComponent} select
   * @memberof ChangeActivityStatusComponent
   */
  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  /**
   * @author Manali Joshi
   * @createdDate 24-12-2019
   * @description get lookup val
   * @memberof ChangeActivityStatusComponent
   */
  public getLookupForActivity() {

    let filterArrayForRS = this.data.lookup.responsiblePesronList.filter(x => x.group !== 'Archived');
    filterArrayForRS = filterArrayForRS.filter(x => x.id !== 'blank');
    this.changeActivityLookup.responsiblePesronList = filterArrayForRS;
    const filterArrayForASL = this.data.lookup.activityStatusList.filter(x => x.id !== 'blank');
    this.changeActivityLookup.activitystatuslist = filterArrayForASL;
    const filterArrayForYear = this.data.lookup.activityYear.filter(x => x.id !== 'blank');
    this.changeActivityLookup.year = filterArrayForYear;
    const filterArrayForDL = this.data.lookup.activityDepartmentList.filter(x => x.id !== 'blank');
    this.changeActivityLookup.departmentlistDetail = filterArrayForDL;

    this.cdrService.callDetectChanges(this.cdr);

  }

  close() {
    this.modal.close();
    this.cdr.detach();
  }

  changeStatus() {
    if (this.changeCustomerForm.controls.responsiblePerson.value == null && this.changeCustomerForm.controls.activitystatus.value == null
      && this.changeCustomerForm.controls.year.value == null && this.changeCustomerForm.controls.department.value == null
      && this.changeCustomerForm.controls.ticketStatus.value == null) {
      this.messageService.showMessage('Please choose from any one of the filters for making the change', 'error');
    }
    else {

      if (this.changeCustomerForm.controls.responsiblePerson.value) {
        const rsObj = this.data.lookup.responsiblePesronList.find(rp => rp.id === this.changeCustomerForm.controls.responsiblePerson.value);
        this.requestObject.responsiblePerson_value = this.changeCustomerForm.controls.responsiblePerson.value;
        this.requestObject.responsiblePerson = rsObj.name;
      }
      if (this.changeCustomerForm.controls.activitystatus.value) {
        const asObj = this.data.lookup.activityStatusList.find(rp => rp.id === this.changeCustomerForm.controls.activitystatus.value);
        this.requestObject.status_value = this.changeCustomerForm.controls.activitystatus.value;
        this.requestObject.status = asObj.name;
      }
      if (this.changeCustomerForm.controls.year.value) {
        const yearObj = this.data.lookup.activityYear.find(rp => rp.id === this.changeCustomerForm.controls.year.value);
        this.requestObject.taxSeason = yearObj.name;
      }
      if (this.changeCustomerForm.controls.department.value) {
        const depObj = this.data.lookup.activityDepartmentList.find(rp => rp.id === this.changeCustomerForm.controls.department.value);
        this.requestObject.department = depObj.name;
      }
      if (this.changeCustomerForm.controls.ticketStatus.value) {
        const tsObj = this.data.lookup.ticketStatusList.find(rp => rp.id === this.changeCustomerForm.controls.ticketStatus.value);
        this.requestObject.ticketStatus = this.changeCustomerForm.controls.ticketStatus.value;
        this.requestObject.ticketStatusText = tsObj.name;
      }

      this.commonApiService.getPromiseResponse({ apiName: APINAME.CHANGE_ACTIVITY_STATUS, parameterObject: this.requestObject })
        .then((response) => {
          if (response) {
            this.messageService.showMessage(this.requestObject.activityIds.length + ' Activity(s) Changed Successfully', 'success');
            this.modal.close(true);
          } else {
            this.messageService.showMessage('Error while updating activities', 'error');
          }
        });
    }
  }

  getPDUserData() {
    this.isOtherTeamMember = false;
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_DIALER_USER_LIST, parameterObject: {} })
      .then(response => {
        for (let obj of response) {
          obj.agents = obj.agents.map(x => x.name);
          if (obj.department === 'Others') {
            for (let agents of obj.agents) {
              if (agents.id === this.userDetails.id) {
                this.isOtherTeamMember = true;
                break;
              }
            }
          }
        }
      }, error => {
        console.log(error);
      });
  }


  initChangeActivityStatusForm() {
    this.changeCustomerForm = this.fb.group({
      responsiblePerson: [undefined],
      activitystatus: [undefined],
      year: [undefined],
      department: [undefined],
      ticketStatus: [undefined],
    });
    this.cdrService.callDetectChanges(this.cdr);
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.getPDUserData();
    this.initChangeActivityStatusForm();
    this.getLookupForActivity();
    this.requestObject.activityIds = this.data.activityIds;
  }

}
