// External imports
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter, PipeTransform, Pipe, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

// Internal imports
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { DialogService, CopyToClipboardService, UserService,MessageService } from '@app/shared/services';
import { CDRService } from '@app/shared/services/cdr.service';
import { TicketSetupComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/ticket-setup/ticket-setup.component';
import { PhoneDetailsComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/phone-details/phone-details.component';
import { ActivityHistoryComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/activity-history/activity-history.component';
import { ChangeCustomerComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/change-customer/change-customer.component';
import { FollowupActivityComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/followup-activity/followup-activity.component';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { environment } from '@environments/environment';
import { ActivitySearchService } from '@app/activity/activity-search/activity-search.service';

@Component({
  selector: 'mtpo-activity-header',
  templateUrl: './activity-header.component.html',
  styleUrls: ['./activity-header.component.scss'],
  providers:[ActivitySearchService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivityHeaderComponent implements OnInit, OnDestroy {
  @Input() modelData: any = {};
  public lookup: any;
  public activityData: any;
  public createdUpdatedDate: any = {};

  private activityHeaderSubscription: Subscription;
  public isViewMode: boolean; // // for handling view or edit mode when activity open in new tab
  public defaultFormValue: any = {};
  public activityMode: string = 'Edit';
  public isEmailIn: boolean = false;
  public activityAvailable: boolean = true;
  @Output() customerTicketChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() activityTypeChange: EventEmitter<any> = new EventEmitter<any>();
  // for create ticket
  public availableSetupTickets: any;
  public customerTickets: any;
  public activityHeaderForm: FormGroup;
  public ETActualDate: any = '';
  public ETPlannedDate: any = '';
  public activityHeaderOldData: any;
  public createdDate: string = '';


  constructor(private fb: FormBuilder,private ticketActivityDetailService: TicketActivityDetailService, private integrityService: TicketActivityIntegrityService,
    private dialogService: DialogService, private cdrService: CDRService, private userService: UserService,private messageService:MessageService,
    private cdr: ChangeDetectorRef, private clipboard: CopyToClipboardService,private activitySearchService: ActivitySearchService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService, private ticketActivityOverlayService: TicketActivityOverlayService
  ) { }

  /**
   * @author Mansi Makwana
   * @createdDate 12-11-2019
   * @description to create form
   * @memberof ActivityHeaderComponent
   */

  initActivityHeaderForm() {
    this.activityHeaderForm = this.fb.group({
      // activityType: '',
      taxSeason: [undefined, Validators.required],
      department: [undefined, Validators.required],
      plannedDateTime: '',
      datetime: '',
      priority: [undefined, Validators.required],
      status_value: [undefined, Validators.required]
    });
    this.formValueChange();
  }
  public formValueChange() {
    this.activityHeaderForm.controls.status_value.valueChanges.subscribe((data) => {
      if (data === "7") {
        this.activityHeaderForm.controls.plannedDateTime.setValidators([Validators.required]);
        this.activityHeaderForm.controls.plannedDateTime.updateValueAndValidity();
      }
      else {
        this.activityHeaderForm.controls.plannedDateTime.clearValidators();
        this.activityHeaderForm.controls.plannedDateTime.updateValueAndValidity();
      }
      this.cdrService.callDetectChanges(this.cdr);
    });
  }
  /**
   * @author Mansi makwana
   * @createdDate 11-11-2019
   * @description  change value of datepicker
   * @memberOf ActivityHeaderComponent
   */

  onDateChange(type?) {
    if (type === 'planned') {
      if (this.activityHeaderForm.controls.plannedDateTime.value) {
        this.ETPlannedDate = moment(this.activityHeaderForm.controls.plannedDateTime.value).tz('America/New_York').format('MM/DD/YY hh:mm A');
      } else {
        this.ETPlannedDate = '';
      }
    } else if (type === 'actual') {
      if (this.activityHeaderForm.controls.datetime.value) {
        this.ETActualDate = moment(this.activityHeaderForm.controls.datetime.value).tz('America/New_York').format('MM/DD/YY hh:mm A');
      } else {
        this.ETActualDate = '';
      }
    }
    setTimeout(() => {
      this.cdrService.callDetectChanges(this.cdr);
    }, 100);
  }

  selectActivityType(screen: string, type: string, direction: string) {
    // this.activityTypeChange.emit({ screen, type, direction })
    let selectActivityData = { 'screen': screen, 'type': type, 'direction': direction }
    this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-header', topic: 'changeActivityType', data: selectActivityData, id: this.modelData.id });
  }

  /**
   * @author Mansi makwana
   * @createdDate 11-11-2019
   * @description  Open phoneDetails Dialog
   * @memberOf ActivityHeaderComponent
   */
  public openPhoneDetails(): void {
    this.dialogService.custom(PhoneDetailsComponent, { 'data': { 'phoneData': this.activityData.PBXCallDetails } }, { 'keyboard': true, 'backdrop': 'static', 'size': 'xl' })
      .result.then((result) => {
      });
  }


  /**
   * @author Satyam Jasoliya
   * @createdDate 11-11-2019
   * @description  Open activity history Dialog
   * @memberOf ActivityHeaderComponent
   */
  public getActivityHistory(): void {
    if (this.activityData.ID) {
      this.dialogService.custom(ActivityHistoryComponent, { 'data': this.activityData.ID }, { 'keyboard': true, 'backdrop': 'static', 'size': 'xl' })
        .result.then((result) => {
        });
    }
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 11-11-2019
   * @description  Change customer Dialog
   * @memberOf ActivityHeaderComponent
   */
  public changeCustomerDetails() {
    this.dialogService.custom(ChangeCustomerComponent, { 'data': '' }, { 'keyboard': true, 'backdrop': 'static', 'size': 'xl' })
      .result.then((result) => {
        if(result)
        {
          let jsonToPass = {
            'customerId': result[0].customerID ? result[0].customerID : '',
            'actIds': [this.activityData.id],
            'isTest': result[0].isTestCustomer ? result[0].isTestCustomer : false,
            'updatedBy': this.userService.getUserDetail().id
          }
          this.activitySearchService.changeCustomer(jsonToPass).then(response => {
            if (response === true) {    
              this.messageService.showMessage('Customer is successfully changed', 'success');
               this.cdr.detectChanges();         
            }
          });
        }
      });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 11-11-2019
  * @description  follow up 
  * @memberOf ActivityHeaderComponent
  */
  public followUp() {

    this.dialogService.custom(FollowupActivityComponent, { 'data': '' }, { 'keyboard': true, 'backdrop': 'static', 'size': 'lg' })
      .result.then((result) => {
        let followUpActivityType: any;
        if (result == 'Email') {
          followUpActivityType = { mainType: 'email', selectedKey: 'e-mail', option: 'out' };
        } else if (result == 'Phone Call') {
          followUpActivityType = { mainType: 'standard', selectedKey: 'phonecall', option: 'out' };
        } else if (result == 'Visit') {
          followUpActivityType = { mainType: 'standard', selectedKey: 'visit', option: 'out' };
        }
        this.createdDate = moment(new Date()).tz('America/New_York').format('MM/DD/YY hh:mm A');
        if (this.activityData.type === 'e-mail') {
          this.activityData.information = '<br><br>---------------------------------------' +
            '<br>From:' + this.activityData.from + '<br>To: ' + this.activityData.to + ' ' +
            ((this.activityData.cc !== undefined && this.activityData.cc !== '') ? '<br>CC: ' + this.activityData.cc : '') + ' ' +
            ((this.activityData.bcc !== undefined && this.activityData.bcc !== '') ? '<br>Bcc: ' + this.activityData.bcc : '') + '<br>Sent: ' + this.createdDate + '<br>Subject: ' + this.activityData.subject +
            ((this.activityData.information !== undefined && this.activityData.information !== '') ? '<br><br>' + this.activityData.information : '');
        } else {
          this.activityData.information = '<br><br>---------------------------------------' +
            '' +
            ((this.activityData.information !== undefined && this.activityData.information !== '') ? '<br><br>' + this.activityData.information : '');
        }

        if ((this.activityData.type === 'e-mail' && this.activityData.direction === 'in') || (this.activityData.type === 'e-mail' && this.activityData.direction === 'out')) {

        } else {
          if (this.userService.getUserDetail().userEmail) {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
          }
        }

        this.activityData.subject = 'Fw : ' + this.activityData.subject;
        this.activityData.status_value = '0';

        let windowId: any;
        for (let obj in this.ticketActivityOverlayService.clientIdsObject) {
          if (this.ticketActivityOverlayService.clientIdsObject[obj].currentId == this.activityData.id) {
            windowId = obj;
            break;
          }
        }
        this.ticketActivityOverlayService.closeWindow(windowId, this.activityData.id);
        this.ticketActivityDetailService.setPastTicketActivityDataStore({ IsChangedEditModeValue: 'Followup', FollowUpActivityType: JSON.parse(JSON.stringify(followUpActivityType)), pastActivityData: JSON.parse(JSON.stringify(this.activityData)) });
        let dialogDataForFollowUp = {
          IsChangedEditModeValue: 'Followup',
          screen: 'activity',
          tempId: Math.random().toString(36).substr(2, 16),
          FollowUpActivityType: followUpActivityType,
          pastActivityData: this.activityData,
        };

        this.ticketActivityOverlayService.openWindow(dialogDataForFollowUp);
      });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 11-11-2019
   * @description  call on click of ticket icon to open dialog
   * @memberOf ActivityHeaderComponent
   */

  public setupTicketForFirstYear() {
    this.availableSetupTickets = [];
    let data = {
      "customerId": this.activityData.customerId
    }
    this.ticketActivityDetailService.searchTicketForActivity(data).then((response: any) => {
      if (response) {
        this.createTicket();
      }
    }, (error) => { console.error(error); });
  }

  public createTicket() {
    this.ticketActivityDetailService.createTicket().then((response: any) => {
      if (response) {
        setTimeout(() => {
          this.dialogService.custom(TicketSetupComponent, { 'data': { 'availableSetupTickets': response, 'notifycreatedTicket': true } }
            , { 'keyboard': true, 'backdrop': 'static', 'size': 'lg' }).result.then((result) => {
              if (result) {
                this.customerTicketChange.emit();
              }
            }, (error) => { console.error(error); });

        }, 1);
      }
    }, (error) => { console.error(error); });
  }


  checkChanges(type, id?) {
    this.integrityService.sendMessage({ channel: 'activity-header', topic: 'save', data: { type: type, id: id }, id: this.modelData.id });
  }



  /**
   * @author Mansi Makwana
   * @createdDate 11-11-2019
   * @description  set default value 
   * @memberOf ActivityHeaderComponent
   */
  public setValue() {

    if (this.activityData && this.activityData.taxSeason) {
      this.activityHeaderForm.controls.taxSeason.setValue(this.activityData.taxSeason);
    }
    if (this.activityData && this.activityData.department) {
      this.activityHeaderForm.controls.department.setValue(this.activityData.department);
    }
    if (this.activityData && this.activityData.priority) {
      this.activityHeaderForm.controls.priority.setValue(this.activityData.priority);
    }
    if (this.activityData && this.activityData.status_value) {
      this.activityHeaderForm.controls.status_value.setValue(this.activityData.status_value);
    }
    if (this.activityData && this.activityData.datetime) {
      this.activityHeaderForm.controls.datetime.setValue(this.activityData.datetime);
      this.ETActualDate = moment(this.activityData.datetime).tz('America/New_York').format('MM/DD/YY hh:mm A');
      setTimeout(() => {
        this.cdrService.callDetectChanges(this.cdr);
      }, 100);
    } else {
      this.ETActualDate = '';
    }
    if (this.activityData && this.activityData.plannedDateTime) {
      this.activityHeaderForm.controls.plannedDateTime.setValue(this.activityData.plannedDateTime);
      this.ETPlannedDate = moment(this.activityData.plannedDateTime).tz('America/New_York').format('MM/DD/YY hh:mm A');
      setTimeout(() => {
        this.cdrService.callDetectChanges(this.cdr);
      }, 100);
    } else {
      this.ETPlannedDate = '';
    }

    this.activityMode = (this.activityData.id !== undefined) ? 'Edit' : 'New';
    if (this.activityMode === 'New') {
      this.activityHeaderForm.controls.priority.setValue('Normal'); // select bydefault Normal Priority
      this.activityData.datetime = new Date(); // set current date
      this.activityHeaderForm.controls.datetime.setValue(moment(this.activityData.datetime).format('MM/DD/YY hh:mm A'));
      this.ETActualDate =  moment(this.activityData.datetime).tz('America/New_York').format('MM/DD/YY hh:mm A');
    }


    this.defaultFormValue = {
      taxSeason: this.activityData.taxSeason,
      department: this.activityData.department,
      priority: this.activityData.priority,
      status_value: this.activityData.status_value,
      plannedDateTime: this.activityData.plannedDateTime,
      datetime: this.activityData.datetime
    }

    this.activityHeaderOldData = Object.assign({}, this.activityHeaderOldData, this.activityHeaderForm.value);
    this.cdrService.callDetectChanges(this.cdr);

  }

  /**
  * @author Dhruvi Shah
  * @createdDate 23-12-2019
  * @description open activity in new tab
  * @memberOf ActivityHeaderComponent
  */
  public goToActivity() {
    this.checkChanges('OpenActivityInNewTab', this.activityData.id)
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-12-2019
   * @description copy activity path of edit
   * @memberOf ActivityHeaderComponent
  */
  public copyToClipboard(copyObj) {
    this.clipboard.copy(`${environment.host}/#/detail-view/activity/details/` + copyObj);
  }

  ngOnInit() {
    if (this.modelData && this.modelData.data && this.modelData.data.isEmailIn) {
      this.isEmailIn = true;
    }
    this.activityHeaderSubscription = this.integrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
        this.cdrService.callDetectChanges(this.cdr);
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic == 'activityData') {
          this.activityData = msgObj.data;
          this.createdUpdatedDate.createdDate = moment(this.activityData.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          if (this.activityData.updatedDate !== undefined && this.activityData.updatedDate !== '') {
            this.createdUpdatedDate.updatedDate = moment(this.activityData.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          }
          this.setValue();
          this.cdrService.callDetectChanges(this.cdr);
        } else if (msgObj.topic === 'isViewMode') {
          this.isViewMode = msgObj.data;
        } else if (msgObj.topic == 'save') {
          let hasChanges = !_.isEqual(JSON.stringify(this.activityHeaderForm.value), JSON.stringify(this.activityHeaderOldData));
          let paramsActivityHeaderValue:any={};
          paramsActivityHeaderValue = this.activityHeaderForm.value;
          paramsActivityHeaderValue.datetime = moment(this.activityHeaderForm.get('datetime').value).utc().format(); 
          this.integrityService.sendMessage({ channel: 'activity-header', topic: 'saveData', data: { 'isValid': this.activityHeaderForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'activityHeader': paramsActivityHeaderValue, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
        } else if (msgObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
          this.cdrService.callDetectChanges(this.cdr);
        } else if (msgObj.topic === 'FollowUp') {
          this.followUp();
        }
      } else if (!this.activityData) {
        if (msgObj.topic == 'activityData') {
          this.activityData = msgObj.data;
          this.createdUpdatedDate.createdDate = moment(this.activityData.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          if (this.activityData.updatedDate !== undefined && this.activityData.updatedDate !== '') {
            this.createdUpdatedDate.updatedDate = moment(this.activityData.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          }
          this.setValue();
          this.cdrService.callDetectChanges(this.cdr);
        }
      }
    });
    this.initActivityHeaderForm();
    // this.createdUpdatedDate.createdDate = moment(this.activityData.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
    // if (this.activityData.updatedDate !== undefined && this.activityData.updatedDate !== '') {
    //   this.createdUpdatedDate.updatedDate = moment(this.activityData.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
    // }
    this.cdrService.callDetectChanges(this.cdr);

  }


  ngOnDestroy() {
    if (this.activityHeaderSubscription) {
      this.activityHeaderSubscription.unsubscribe();
    }
  }

  // ngDoCheck() {
  //   console.log('TActCheck3')
  // }
}

// Pipes filtered keys of activity types
@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
  transform(value: any) {
    const keys = [];
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }
}

