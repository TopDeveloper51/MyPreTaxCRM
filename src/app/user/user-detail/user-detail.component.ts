import { Component, OnInit } from '@angular/core';
import { LocalStorageUtilityService, DialogService, UserService, MessageService } from '@app/shared/services';
import { UserDetailService } from '@app/user/user-detail/user-detail.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { EditExpertiseComponent } from '@app/assessment/dialogs/edit-expertise/edit-expertise.component';
import { UserHistoryComponent } from '@app/user/user-history/user-history.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  public mode: any;
  public user: any = {};
  public data;
  public isUserNameDisable: any;
  public disableAssessmentElement = true;
  public disablePhoneElement = true;
  public disableChatElement = true;
  public lookupData: any = {};
  public UserDetailForm: FormGroup;
  public languageList: any = [{ id: 'none', name: 'None' }, { id: 'en', name: 'EN' }, { id: 'sp', name: 'SP' }, { id: 'both', name: 'Both' }];
  public assessmentRoleList: any = [{ id: 'user', name: 'User' }, { id: 'admin', name: 'Admin' }];
  public responsiblePerson: any = {};
  public loggedUserDetail: any;
  public availableuser: any;
  public edituser: any;
  public disCreatedDate: any;
  public disUpdatedDate: any;
  public currentuserIndex: any;
  public idNextPrev: any = [];
  public newCustomerId;
  public preserveResponsiblePersonList: any = [];

  constructor(private userDetailService: UserDetailService, private fb: FormBuilder, private modal: NgbActiveModal, private userService: UserService,
    private messageService: MessageService, private dialogService: DialogService) { }

  public inituserDetailForm() {
    this.UserDetailForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]],
      salutation: [undefined],
      role: [undefined],
      isActive: [],
      firstName: ['', Validators.required],
      aliasFirstName: [''],
      designation: [''],
      lastName: ['', Validators.required],
      aliasLastName: [''],
      resellerId: [undefined, Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      joiningDate: [''],
      timesheetApproverId: [undefined],
      leftDate: [''],
      language: [undefined],
      timeAccounting: [''],
      breakExplanation: [''],
      PDManagerView: [''],
      allowPhone: [''],
      plivoUserName: [''],
      extension: [''],
      queue: [undefined],
      plivoPwd: [''],
      allowIncomingCall: [''],
      allowChat: [''],
      chatQueue: [undefined],
      enableAssessment: [''],
      assessmentRole: [undefined]
    })
  }
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "timesheetApproverId":
        selected = [];
        selected = this.responsiblePerson.responsiblePesronList.map(
          item => item.id
        );
        this.UserDetailForm.get("timesheetApproverId").patchValue(selected);
        break;
      case "queue":
        selected = [];
        selected = this.lookupData.pbxQueueList.map(
          item => item.id
        );
        this.UserDetailForm.get("queue").patchValue(selected);
        break;
      case "chatQueue":
        selected = [];
        selected = this.lookupData.chatQueueList.map(
          item => item.id
        );
        this.UserDetailForm.get("chatQueue").patchValue(selected);
        break;
    }
  }

  public onClearAll(clearSelectfor?: string) {
    this.getLookupForUserDetail();
    if (this.UserDetailForm && clearSelectfor) {
      this.UserDetailForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author shreya kanani
   * @description get lookup data for dropdown
   * @createdDate 30/01/2020
   */
  public getLookupForUserDetail() {
    this.userDetailService.getLookupForUserSearch(this.user).then((response: any) => {
      this.lookupData.salutionList = response.salutionList;
      this.lookupData.roleList = response.roleList;
      this.lookupData.resellerList = response.resellerList;
      this.lookupData.pbxQueueList = response.pbxQueueList;
      this.lookupData.chatQueueList = response.chatQueueList;
      this.lookupData.responsiblePesronList = response.responsiblePesronList;
      this.preserveResponsiblePersonList = response.responsiblePesronList;
      this.responsiblePerson.responsiblePesronList = [];
      for (const obj of this.lookupData.responsiblePesronList) {
        if (obj.group !== undefined && obj.group !== null && obj.group !== '') {
          this.responsiblePerson.responsiblePesronList.push({ group: obj.group, id: obj.id, name: obj.name });
        }
      }
      this.preserveResponsiblePersonList = this.responsiblePerson.responsiblePesronList;
    });
  }

  /**
   * @author shreya kanani
   * @description this method disable assessment fields based on condition
   * @createdDate 30/01/2020
   */
  public disableAssessmentControls() {
    if (this.UserDetailForm.get('enableAssessment').value == true) {
      this.disableAssessmentElement = false;
      this.UserDetailForm.get('assessmentRole').setValidators([Validators.required]);
      this.UserDetailForm.controls.assessmentRole.enable();

    } else {
      this.disableAssessmentElement = true;
      this.UserDetailForm.controls.assessmentRole.disable();
    }
    if (this.mode == false && this.UserDetailForm.get('enableAssessment').value == false) {
      this.UserDetailForm.controls.assessmentRole.reset();

    }
  }

  /**
   * @author shreya kanani
   * @description this method disable chat control 
   * @createdDate 30/01/2020
   */
  disableChatControls() {
    if (this.UserDetailForm.get('allowChat').value == true) {
      this.disableChatElement = false;
      this.UserDetailForm.get('language').setValidators([Validators.required]);
      this.UserDetailForm.get('chatQueue').setValidators([Validators.required]);
      this.UserDetailForm.controls.chatQueue.enable();
      this.UserDetailForm.controls.language.enable();

    } else {
      this.disableChatElement = true;
      this.UserDetailForm.controls.chatQueue.disable();
      this.UserDetailForm.controls.language.disable();

    }
  }

  /**
   * @author shreya kanani
   * @description this method disable phone control
   * @createdDate 30/01/2020
   */
  public disableControls() {
    if (this.UserDetailForm.get('allowPhone').value == true) {
      this.disablePhoneElement = false;
      this.UserDetailForm.get('language').setValidators([Validators.required]);
      this.UserDetailForm.get('plivoUserName').setValidators([Validators.required]);
      this.UserDetailForm.get('extension').setValidators([Validators.required]);
      this.UserDetailForm.get('plivoPwd').setValidators([Validators.required]);
      this.UserDetailForm.controls.plivoUserName.enable();
      this.UserDetailForm.controls.extension.enable();
      this.UserDetailForm.controls.plivoPwd.enable();
      this.UserDetailForm.controls.allowIncomingCall.enable();
      this.UserDetailForm.controls.queue.enable();
      this.UserDetailForm.controls.language.enable();


    } else {
      this.disablePhoneElement = true;
      this.UserDetailForm.controls.plivoUserName.disable();
      this.UserDetailForm.controls.extension.disable();
      this.UserDetailForm.controls.plivoPwd.disable();
      this.UserDetailForm.controls.allowIncomingCall.disable();
      this.UserDetailForm.controls.queue.disable();
      this.UserDetailForm.controls.language.disable();
    }
    // if (this.mode == false && this.UserDetailForm.get('allowPhone').value == false) {
    //   this.UserDetailForm.controls.plivoUserName.disable();
    //   this.UserDetailForm.controls.extension.disable();
    //   this.UserDetailForm.controls.plivoPwd.disable();
    //   this.UserDetailForm.controls.allowIncomingCall.disable();
    //   this.UserDetailForm.controls.queue.disable();
    //   this.UserDetailForm.controls.language.disable();

    // }
  }

  /**
   * @author shreya kanani
   * @description this method save user data
   * @createdDate 30/01/2020
   */
  public save() {
    const user = JSON.parse(JSON.stringify(this.UserDetailForm.value));
    if (this.UserDetailForm.valid && this.UserDetailForm.get('userName').value !== undefined) {
      if (this.mode) {
        user.mode = 'add';
      } else {
        user.mode = 'edit';
        user.userNameHash = this.user.userNameHash;
        user.salt = this.user.salt;
        user.userName = this.user.userName;
        user.password = this.user.password;
        user.isDeleted = this.user.isDeleted;
        user.createdBy = this.user.createdBy;
        user.createdDate = this.user.createdDate;
        user.updatedBy = this.user.updatedBy;
        user.updatedDate = this.user.updatedDate;
        user.leftDate = this.user.leftDate;
        user.id = this.user.id;
        user.resellerName = this.user.resellerName;
        user.createdByName = this.user.createdByName;
        user.updatedByName = this.user.updatedByName;
      }
      if (this.UserDetailForm.get('timeAccounting').value == false) {
        this.UserDetailForm.controls.breakExplanation.setValue(false);
      }
      this.userDetailService.saveUser(user).then((response: any) => {
        if (this.mode) {
          // store response
          this.messageService.showMessage('User Added successfully', 'success');
          this.modal.close(true);
        } else {
          // show message in a toaster for SuccessFully updation
          this.messageService.showMessage('User Updated successfully', 'success');
          this.modal.close(true);
        }
      }, error => {
        if (error !== undefined && error.statusCode === 4014) {
          this.messageService.showMessage('Username already exists', 'error');
        } else {
          console.error(error);
        }
      });
    }
  }

  /**
   * @author shreya kanani
   * @description this method open confirmation dialog 
   * @createdDate 30/01/2020
   */
  checkChanges(performedAction, data?: any) {
    if (this.mode) {
      this.modal.close(false);
    } else {
      if (this.checkUserScope()) {
        const dialogData = { title: 'Confirmation', text: `Are you sure, you want to save changes?` };
        this.dialogService.confirm(dialogData, { 'isDontSave': true }).result.then((response) => {
          if (response === "YES") {
            this.save();
          } else if (response === "No") {
            if (performedAction == "") {
              this.modal.close();
            }
          }
        }, error => {
          console.error(error);
        });
      } else {
        if (performedAction == "") {
          this.modal.close(true);
        }
      }
    }
  }

  /**
   * @author shreya kanani
   * @description this method check changes in formcontrols
   * @createdDate 30/01/2020
   */
  public checkUserScope() {
    if (this.UserDetailForm.dirty) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @author shreya kanani
   * @description this method set username value
   * @createdDate 30/01/2020
   */
  checkInput() {
    if (this.mode) {
      if (this.UserDetailForm.get('firstName').value !== undefined && this.UserDetailForm.get('lastName').value !== undefined) {
        if (this.UserDetailForm.get('firstName').value.length > 0 && this.UserDetailForm.get('lastName').value.length > 0) {
          this.UserDetailForm.controls.userName.setValue(this.UserDetailForm.get('firstName').value.toLowerCase() + '.' + this.UserDetailForm.get('lastName').value.toLowerCase());
        }
      }
    }
  }

  /**
   * @author shreya kanani
   * @description this method disable/enable breakexplanation based on condition
   * @createdDate 30/01/2020
   */
  changeBreakExplanationValue() {
    if (this.mode) {
      if (this.UserDetailForm.get('timeAccounting').value == true) {
        this.UserDetailForm.controls.breakExplanation.enable();
      } else {
        this.UserDetailForm.controls.breakExplanation.disable();
        this.UserDetailForm.controls.breakExplanation.setValue(false);
      }
    }
  }

  /**
   * @author Manali Joshi
   * @createdDate 10/1/2020
   * @param {*}  inputvalue
   * @memberof UserDetailComponent
   */
  filterData(eventTarget) {
    this.responsiblePerson.responsiblePesronList = this.preserveResponsiblePersonList;
    this.responsiblePerson.responsiblePesronList = this.responsiblePerson.responsiblePesronList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
  }
  /**
   * @author shreya kanani
   * @description this method get user data from api
   * @createdDate 31/01/2020
   */
  public getuserDoc(userNameHash: any) {
    this.userDetailService.getuserDoc(userNameHash).then((response: any) => {
      this.user = response;
      this.updateUserFillData(this.user);
      if (this.user.chatDepartment) {
        this.UserDetailForm.controls.chatQueue.patchValue(this.user.chatDepartment);
      }
      if (this.user.allowChat) {
        this.UserDetailForm.controls.chatQueue.enable();
        this.UserDetailForm.controls.language.enable();
      }
      if (this.user !== undefined && this.user.allowPhone !== undefined && this.user.allowPhone !== null && this.user.allowPhone === true) {
        this.disablePhoneElement = false;
      } else {
        this.disablePhoneElement = true;
      }
      if (this.user !== undefined && this.user.allowChat !== undefined && this.user.allowChat !== null && this.user.allowChat === true) {
        this.disableChatElement = false;
      } else {
        this.disableChatElement = true;
      }
      if (this.user.createdDate !== undefined && this.user.createdDate !== '') {
        // Todo
        this.disCreatedDate = moment(this.user.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      }  // .tz('America/New_York')
      if (this.user.updatedDate !== undefined && this.user.updatedDate !== '') {
        // Todo
        this.disUpdatedDate = moment(this.user.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      }// .tz('America/New_York')
      if (this.user.queue === undefined || this.user.queue == null || (this.user.queue !== undefined && this.user.queue.length === 0)) {
        this.user.queue = [];
        if (userNameHash.removedPlivoDetails !== undefined && userNameHash.removedPlivoDetails !== '' && userNameHash.removedPlivoDetails === true) {
          // Show message when plivo details cleared successfully
          this.messageService.showMessage('Plivo settings cleared successfully', 'success');
        }
      }
    });
  }

  /**
   * @author shreya kanani
   * @description this method open expertise dialog
   * @createdDate 31/01/2020
   */
  openExpertiseDialog() {
    this.dialogService.custom(EditExpertiseComponent, { userId: this.user.userNameHash, userName: this.user.firstName + " " + this.user.lastName, expertiseDetail: this.user.expertiseDetail, id: this.user.id }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
      (response) => {
        if (response) {
          this.user.expertiseDetail = response;
        }
      }, (error) => {
        console.error(error);
      }
    );
  }

  /**
   * @author shreya kanani
   * @description this method open userhistroy dialog
   * @createdDate 31/01/2020
   */
  openHistoryDialog() {
    this.dialogService.custom(UserHistoryComponent, { userNameHash: this.user.userNameHash }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
      (response) => {
        if (response) {
        }
      }, (error) => {
        console.error(error);
      }
    );
  }

  /**
   * @author shreya kanani
   * @description this method is for next/previous in dialog
   * @createdDate 31/01/2020
   */
  public prevNext(action: string) {
    if (action === 'Next') {
      this.currentuserIndex += 1;
      this.newCustomerId = this.idNextPrev[this.currentuserIndex];
    } else if (action === 'Prev') {
      this.currentuserIndex -= 1;
      this.newCustomerId = this.idNextPrev[this.currentuserIndex];
    }
    this.getuserDoc({ 'userNameHash': this.newCustomerId.userNameHash });

  }

  /**
   * @author shreya kanani
   * @description this method is for next/previous in dialog
   * @createdDate 31/01/2020
   */
  private nextPrevBaseOnContactId() {
    if (this.data.nextPrev) {
      this.idNextPrev = [];
      this.data.nextPrev.forEach(element => {
        this.idNextPrev.push(element);
      }
      );
    }
  }

  /**
  * @author shreya kanani
  * @description this method update user data based on next/prevoius
  * @createdDate 31/01/2020
  */
  updateUserFillData(user: any) {
    this.UserDetailForm.patchValue(user);
    if(this.edituser && this.edituser.aliasFirstName === undefined){
      this.UserDetailForm.controls.aliasFirstName.setValue(user.firstName);
    }
    if(this.edituser && this.edituser.aliasLastName === undefined){
      this.UserDetailForm.controls.aliasLastName.setValue(user.lastName);
    }
    if (this.edituser.assessmentDetail !== undefined) {
     // this.UserDetailForm.patchValue(this.edituser.assessmentDetail)
      this.UserDetailForm.controls.assessmentRole.setValue(this.edituser.assessmentDetail.role);
      this.UserDetailForm.controls.assessmentRole.enable();
    }
  }

  /**
  * @author shreya kanani
  * @description this method close the dialog
  * @createdDate 31/01/2020
  */
  close() {
    this.modal.close();
  }
  ngOnInit() {
    this.loggedUserDetail = this.userService.getUserDetail();
    this.mode = this.data.mode;
    this.edituser = this.data.availableUser;
    this.isUserNameDisable = true;
    this.getLookupForUserDetail();
    this.inituserDetailForm();
    if (this.disablePhoneElement) {
      this.UserDetailForm.controls.plivoUserName.disable();
      this.UserDetailForm.controls.extension.disable();
      this.UserDetailForm.controls.plivoPwd.disable();
      this.UserDetailForm.controls.allowIncomingCall.disable();
      this.UserDetailForm.controls.queue.disable();
      this.UserDetailForm.controls.language.disable();

    }
    if (this.disableChatElement) {
      this.UserDetailForm.controls.chatQueue.disable();
      this.UserDetailForm.controls.language.disable();

    }
    if (this.disableAssessmentElement) {
      this.UserDetailForm.controls.assessmentRole.disable();
    }
    this.UserDetailForm.controls.role.setValue('Administrator');
    this.UserDetailForm.controls.isActive.setValue(true);
    this.UserDetailForm.controls.breakExplanation.disable();
    if (this.mode == false) {
      this.UserDetailForm.patchValue(this.edituser);
      if(this.edituser && this.edituser.aliasFirstName === undefined){
        this.UserDetailForm.controls.aliasFirstName.setValue(this.edituser.firstName);
      }
      if(this.edituser && this.edituser.aliasLastName === undefined){
        this.UserDetailForm.controls.aliasLastName.setValue(this.edituser.lastName);
      }
      if (this.edituser.assessmentDetail !== undefined) {
        this.UserDetailForm.patchValue(this.edituser.assessmentDetail)
        this.UserDetailForm.controls.assessmentRole.setValue(this.edituser.assessmentDetail.role);
        this.UserDetailForm.controls.assessmentRole.enable();
      }
      this.getuserDoc({ 'userNameHash': this.data.availableUser.userNameHash });
      this.UserDetailForm.controls.breakExplanation.enable();
      if (this.UserDetailForm.get('allowPhone').value == true) {
        this.UserDetailForm.controls.plivoUserName.enable();
        this.UserDetailForm.controls.extension.enable();
        this.UserDetailForm.controls.plivoPwd.enable();
        this.UserDetailForm.controls.allowIncomingCall.enable();
        this.UserDetailForm.controls.queue.enable();
        this.UserDetailForm.controls.language.enable();
      }

      this.UserDetailForm.controls.userName.disable();
      this.UserDetailForm.controls.password.disable();
    }
    if (this.UserDetailForm.get('isActive').value == true) {
      this.UserDetailForm.controls.leftDate.disable();
    }
    this.UserDetailForm.controls.userName.disable();
    this.nextPrevBaseOnContactId();
    this.currentuserIndex = this.idNextPrev.findIndex(obj => obj.userNameHash === this.edituser.userNameHash);
    // this.UserDetailForm.controls.language.disable();
  }
}
