// External Imports
import { Component, OnInit, OnDestroy, Input, ViewChild, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { EditorComponent } from '@progress/kendo-angular-editor';
// Internal Imports
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { DialogService, UserService, CDRService } from '@app/shared/services';
import { ChatSocketService } from '@app/chat/socket/chat-socket.service';
import { ImageDialogComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/image-dialog/image-dialog.component';

@Component({
  selector: 'mtpo-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivityDetailsComponent implements OnInit, OnDestroy {
  @Input() modelData: any = {};
  @ViewChild('upload') public dialog: ImageDialogComponent;
  @Output() @ViewChild('editor') public editor: EditorComponent;
  public lookup: any;
  public activityData: any;
  private activityDetailsSubscription: Subscription;
  public activityDetailEditorForm: FormGroup;
  public data: any;
  public isShowEditer = false;
  public defaultFormValue: any = {};
  public oldResponsiblePersonValue: any;
  public activityDetailsOldValue: any;
  userDetails: any;
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering
  public isEmailIn: boolean = false;
  /** Flag for HTML EDITOR */
  public isMaximize: boolean = false;
  public activityDataObj: any;
  public activityAvailable: boolean = true;
  public count: number = 619; // to set dynamic height of editor

  constructor(
    private fb: FormBuilder, private cdr: ChangeDetectorRef,
    private dialogService: DialogService, private userService: UserService, private CDRService: CDRService,
    private integrityService: TicketActivityIntegrityService,
    private chatSocketService: ChatSocketService
  ) { }


  /**
   * @author Manali Joshi
   * @createdDate 10/1/2020
   * @param {*}  inputvalue
   * @memberof ActivitySearchComponent
   */
  filterData(eventTarget) {
    this.lookup.responsiblePersonList = this.rpLookupDataForFilter;
    this.lookup.responsiblePersonList = this.lookup.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.CDRService.callDetectChanges(this.cdr)
  }

  public open() {
    this.dialog.open();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 13-11-2019
   * @description create Form
   * @memberOf ActivityDetailsComponent
   */
  public initActivityDetailEditorForm() {
    this.activityDetailEditorForm = this.fb.group({
      information: '',
      subject: [undefined, Validators.required],
      responsiblePerson_value: [undefined, Validators.required],
    });
    if (this.modelData && this.modelData.data && this.modelData.data.isEmailIn) {
      this.activityDetailEditorForm.controls.subject.disable();
    }
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Mansi Makwana
   * @createdDate 13-11-2019
   * @description  change dropdown value check group
   * @memberOf ActivityDetailsComponent
   */

  changeDropDownValue(event) {
    let isArchived = false;
    const groupData = this.lookup.responsiblePersonList.filter(item => {
      if (event.group === 'Archived') {
        return isArchived = true;
      }
    });
    if (isArchived) {
      const dialogData = { title: 'Attention', text: 'You are not allowed to change the Responsible Person to an Archived Person. Please retry changing it to some other user.' };
      this.dialogService.notify(dialogData, {}).result.then((response) => {
        this.activityData['responsiblePerson_value'] = this.oldResponsiblePersonValue;
      }, (error) => {
        this.activityData['responsiblePerson_value'] = this.oldResponsiblePersonValue;
      });
    }

  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    if (this.modelData && this.modelData.data && this.modelData.data.isEmailIn) {
      this.isEmailIn = true;
    } else {
      this.isEmailIn = false;
    }
    this.activityDetailsSubscription = this.integrityService.getMessage().subscribe(msgObj => {

      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
        this.rpLookupDataForFilter = this.lookup.responsiblePersonList;
      } else if (msgObj.topic == 'activityData') {

        if (this.modelData && msgObj.id == this.modelData.id) {
          this.activityData = msgObj.data;
        } else if (!this.activityData) {
          this.activityData = msgObj.data;
        }
        if (this.activityData) {
          this.isMaximize = true;
          if (this.activityData.responsiblePerson_value) {
            this.activityDetailEditorForm.controls.responsiblePerson_value.setValue(this.activityData.responsiblePerson_value);
          }
          if (this.activityData.information) {
            this.activityData.information = this.activityData.information.replace(/href=/g, '')

            this.activityDetailEditorForm.controls.information.setValue(this.activityData.information);
          } else {
            this.activityDetailEditorForm.controls.information.setValue('');
          }

          if (this.activityData.subject) {
            this.activityDetailEditorForm.controls.subject.setValue(this.activityData.subject);
          } else {
            this.activityData.subject = ''
            this.activityDetailEditorForm.controls.subject.setValue('');
          }

          this.activityDataObj = {
            information: this.activityDetailEditorForm.controls.information.value,
            subject: this.activityDetailEditorForm.controls.subject.value,
            responsiblePerson_value: this.activityDetailEditorForm.controls.responsiblePerson_value.value

          }
          this.activityDetailsOldValue = Object.assign({}, this.activityDetailsOldValue, JSON.parse(JSON.stringify(this.activityDataObj)));
        }

        if (this.activityData) {
          this.processChatData();
        }
      } else if (msgObj.topic == 'save') {
        if (this.modelData && msgObj.id == this.modelData.id) {

          let hasChanges = !_.isEqual(this.activityDetailEditorForm.value, this.activityDetailsOldValue);
          this.integrityService.sendMessage({ channel: 'activity-detail', topic: 'saveData', data: { 'isValid': this.activityDetailEditorForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'activityDetails': this.activityDetailEditorForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
        }
      } else if (msgObj.topic === 'noActivityAvailable') {
        if (this.modelData && msgObj.id == this.modelData.id) {
          this.activityAvailable = false;
        }
      }
      // else if (msgObj.topic === 'ta-ticket-activity-length') {
      //   // to set dynamic height of editor when ta-ticket-activity has less than 5 records 
      //   this.count = msgObj.data;
      //   if (this.count < 5) {
      //     if(this.count === 1){
      //       this.count = 518 + 18 * 4;  
      //     } else{
      //       this.count = 5 - this.count;
      //       this.count = 518 + 20 * this.count;
      //     }

      //   } else {
      //     this.count = 518;
      //   }
      // }
      if (msgObj.topic === 'kendo-chat-dynamic-height') {
        this.count = msgObj.data;
      }
      this.CDRService.callDetectChanges(this.cdr);
    });
    this.initActivityDetailEditorForm();
  }

  ngOnChange() {
    if (this.activityData && this.activityData['responsiblePerson_value']) {
      this.oldResponsiblePersonValue = JSON.parse(JSON.stringify(this.activityData['responsiblePerson_value']));
    }

  }

  private processChatData() {
    if (this.activityData.chatDetails && this.activityData.chatDetails.messageList && this.activityData.chatDetails.messageList.length > 0) {
      for (let obj of this.activityData.chatDetails.messageList) {
        obj.time = new Date(obj.createdDate).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) // temp set current time 
        if (obj.type !== undefined && obj.type !== 'notification') {
          if (obj.createdBy.id == this.userDetails.id) {
            obj.flag = "send"
          } else {
            obj.flag = "receive"
          }
        } else {
          obj.flag = "notification";
        }
        if (obj.createdBy && obj.createdBy.name) {
          obj.createdByName = obj.createdBy.name;
        }
      }

      let _self = this;
      this.chatSocketService.on('transferChat', function (data) {
        if (data.data.activityId == _self.activityData.id && data.data.transferAgentId == _self.userDetails.id) {
          setTimeout(() => {
            _self.activityDetailEditorForm.controls.responsiblePerson_value.setValue(data.data.transferAgentId);
          });
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.activityDetailsSubscription) {
      this.activityDetailsSubscription.unsubscribe();
    }
  }

  // ngDoCheck() {
  //   console.log('TActCheck2')
  // }

}
