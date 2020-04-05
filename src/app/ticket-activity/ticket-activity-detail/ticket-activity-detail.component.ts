//External imports
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { WindowRef } from '@progress/kendo-angular-dialog';
import { Subscription } from 'rxjs/Rx';
import * as moment from 'moment-timezone';

// Internal imports
import { CDRService, UserService, MessageService, DialogService } from "@app/shared/services";
import { TicketActivityDetailService } from "@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service";
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { PostalChannelService } from '@app/shared/services';
import { environment } from '@environments/environment';

@Component({
  selector: 'mtpo-ticket-activity-detail',
  templateUrl: './ticket-activity-detail.component.html',
  styleUrls: ['./ticket-activity-detail.component.scss'],
  providers: [TicketActivityDetailService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketActivityDetailComponent implements OnInit, OnDestroy {

  @ViewChildren('windowTitleBar') windowTitleBar: QueryList<any>;
  public integrityServiceSubscription: Subscription;
  public activityData: any = {}; // Activity Component Data
  public ticketList: any = []; // Ticket Component Data
  public customerInfo: any = {}; // Customer Component Data
  public customerShortInfo: any;
  public modelData: any = {};
  private screenNameAllowed = ['activity', 'ticket'];
  public lookup: any = {};
  public activityId;
  public userDetails: any = {};
  public dialerData: any = {};
  public formattedCreatedDate: string = '';
  public dialStatus = '';
  public userIdsToDisableUsernameDisplay = ['e92f4584-d8d7-4e89-be65-b9848fd85fb8']; //e92f4584-d8d7-4e89-be65-b9848fd85fb8
  public userNameWithCap = this.userIdsToDisableUsernameDisplay.includes(this.userService.getUserDetail().id) ? '' : (this.capitalizeFirstLetter(this.userService.getUserDetail().firstName.toLowerCase()) + " " + this.capitalizeFirstLetter(this.userService.getUserDetail().lastName.toLowerCase()));
  public emailWithCap = this.capitalizeFirstLetter(this.userService.getUserDetail().userEmail.toLowerCase());
  public designation = this.userService.getUserDetail().designation ? "<br>" + this.userService.getUserDetail().designation : "Team";
  public plivoExtension = this.userService.getUserDetail().plivoExtension ? " Ext " + this.userService.getUserDetail().plivoExtension : "";
  public signatureHTML: any = "</br></br>" +
    "<div style='float:left;border-right:1px solid #888;padding-right:10px;'><a href='https://www.mytaxprepoffice.com/'><img src='" + environment.host + "/assets/images/crm_tax_logo.png'></a></div>" +
    "<div style='float:left;padding-left:10px;font-family: Calibri;'>" + this.userNameWithCap + "</br>MyTAXPrepOffice " + this.designation + "</br>" + environment.plivoNumber + this.plivoExtension + "</br>" + this.emailWithCap + "</br></div>" +
    "<div style='clear:both;padding-top:5px;font-size:11px;font-family: Calibri;'>This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error please notify the system manager. This message contains confidential information and is intended only for the individual named. If you are not the named addressee you should not disseminate, distribute or copy this e-mail. Please notify the sender immediately by e-mail if you have received this e-mail by mistake and delete this e-mail from your system. If you are not the intended recipient you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.</div></br>";

  public isViewMode: boolean; // for handling view or edit mode when activity open in new tab 
  public openedAtNumber: number;
  public openedAtPlaces: number;
  refreshView = true;
  public activityMode: string = 'New';
  public userResellerId = '';
  public isDoNotCall: boolean = false;
  public showBlacklistIcon: boolean = false;
  callingSystemWatcher: Subscription;
  displayKendoCloseButton: boolean;
  windowId: string;
  currentActivityIndex: number;
  totalArrayLength: number;
  public disabledNextButton = false;
  public disabledPrevButton = false;
  public activityAvailable: boolean = true;
  public isDialogOpen: boolean = false;
  public ticketID: string;
  public dynamicHeight: number = 0; // to set dynamic height according to ticket section height
  public chatDynamicHeightActivities: number = 785;
  public changesSaved: boolean = false;
  public activityEditorSection: number;
  public kendoChatHeight: number;
  public counter: number = 0;


  constructor(private route: ActivatedRoute,
    private router: Router,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private messageService: MessageService,
    public windowRef: WindowRef,
    private ticketActivityService: TicketActivityDetailService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private postalChannelService: PostalChannelService,
    private dialogService: DialogService) { }




  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  public goToCustomerCart(customerId) {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }

  dialStatusChange(event) {
    this.dialStatus = event;
    this.CDRService.callDetectChanges(this.cdr)
  }
  /**
   * This function is used to get the activity data using the activity ID
   * @param id : activityId
   */
  getActivityDetails(id, from) {
    this.ticketActivityService.getActivityDetailsNew(id, this.modelData).then(
      (response: any) => {
        if (response.activityData) {
          this.activityData = response.activityData;
          // if (this.cdr && !(this.cdr as ViewRef).destroyed) {
          this.CDRService.callDetectChanges(this.cdr)
          // }
        }

        if (!this.windowRef.window.instance.titleBarTemplate) {
          let titleRef;
          this.windowTitleBar.forEach((titlebar) => {
            if (titlebar.elementRef.nativeElement.parentElement.id.indexOf(this.activityData.id) > -1) {
              titleRef = titlebar;
            }
          });
          this.windowRef.window.instance.titleBarTemplate = titleRef;
        }

        if (this.modelData.callNotification) {
          this.postalChannelService.PublishPostalEvent({
            channel: 'SEND_CUSTOMERDATA_TO_DIALER',
            data: response,
            topic: '',
            envelope: ''
          });
        }

        this.ticketList = response.ticketList;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityId', data: this.activityData.id, id: this.modelData.id });
        if (from == 'init') {
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'customerID', data: this.activityData.customerId, id: this.modelData.id })
        } else {
          this.customerInfo.activityCustomerFinalInformation = this.customerShortInfo;
          this.ticketActivityOverlayService.checkIndexForInternalNextPrevSelection(this.windowId, this.activityData.id);
        }

      },
      error => {
        console.log(error);
      }
    )
  }

  /**
   * This function is used to get the ticket data using the ticket ID
   * @param id ticketId
   */

  getTicketDetails(id, from) {
    this.ticketActivityService.getTicketDetails(id, this.modelData).then(
      (response: any) => {
        this.activityData = response.activityData;
        this.ticketList = response.ticketList;
        let customerId;
        if (this.activityData && this.activityData.id) {
          customerId = this.activityData.customerId;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityId', data: this.activityData.id, id: this.modelData.id });
        } else {
          customerId = response.customerId;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'noActivityAvailable', data: false, id: this.modelData.id });
          this.activityAvailable = false;
        }

        if (!this.windowRef.window.instance.titleBarTemplate) {
          let titleRef;
          this.windowTitleBar.forEach((titlebar) => {
            if (titlebar.elementRef.nativeElement.parentElement.id.indexOf(id) > -1) {
              titleRef = titlebar;
            }
          });
          this.windowRef.window.instance.titleBarTemplate = titleRef;
        }

        if (from == 'init') {
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'customerID', data: customerId, id: this.modelData.id })
        } else {
          this.customerInfo.activityCustomerFinalInformation = this.customerShortInfo;
          this.ticketActivityOverlayService.checkIndexForInternalNextPrevSelection(this.windowId, id);
        }

      },
      error => {
        console.log(error);
      }
    )
  }
  /**
    * This function is used when user select activity type
    */
  setActivityType(screen: any, key: any, option: any, from?: boolean): void {
    this.activityData.screen = screen;
    this.activityData.type = key;
    this.activityData.direction = option;
    // this condition will remove all validation  fire that are used  for email type
    if (key !== 'e-mail') {
      this.activityData.to = null;
      this.activityData.cc = null;
      this.activityData.bcc = null;
    }
    if (key == 'meeting') {
      this.activityData.isShowSpecialTask = true;
    } else {
      this.activityData.isShowSpecialTask = false;
    }
    if (!from) {
      this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityData', data: this.activityData, id: this.modelData.id });
      if (this.activityData && this.activityData.customerId) {
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'customerID', data: this.activityData.customerId, id: this.modelData.id });
      } else {
        this.activityData.customerId = this.modelData.customerId;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'customerID', data: this.modelData.customerId, id: this.modelData.id });
      }
    }
  };

  /**
   * This function is used to get all lookup data for ticket activity detail screen from API
   */
  private getAllLookup() {
    this.ticketActivityService.getAllLookupNew().then(
      response => {
        this.lookup = response;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'lookup', data: this.lookup, id: this.modelData.id })
        setTimeout(() => {
          // if (this.cdr && !(this.cdr as ViewRef).destroyed) {
          this.CDRService.callDetectChanges(this.cdr)
          // }
        });

      }, error => { }
    )
  }

  /**
   * This function is used to get the entire ticket data of an individual customer based on specific filters
   */
  getCustomerTicketData() {
    if (this.activityData && this.activityData.customerId) {
      let existingTicketDetails = { "customerId": this.activityData.customerId, "year": [this.activityData.taxSeason], "department": [this.activityData.department] }
      this.ticketActivityService.getCustomerTicketData(existingTicketDetails).then((response: any) => {
        if (response && response.length > 0) {
          this.ticketActivityService.getTicketDetails(response[0].id, this.modelData).then((res: any) => {
            if (res) {
              this.ticketList = [res];
            }
          })
        }
        this.CDRService.callDetectChanges(this.cdr);
      })
    }
  }

  /**
   * This function is used to initialize ticket activity detail screen in new mode 
   */
  initNewScreen(data: any) {
    // when ticket activity in new mode is initialized when user clicks on either of the following: CallToEmail, EmailToCall, Reply, Forward, Followup
    if (data['IsChangedEditModeValue'] !== undefined && data['IsChangedEditModeValue'] !== null) {
      const pastData = data['pastActivityData'];
      if (data['IsChangedEditModeValue'] === 'CallToEmail') {

        setTimeout(() => {
          this.setActivityType('email', 'e-mail', 'out');
        }, 500);
        this.activityData.information = this.signatureHTML;
        this.activityData.customerId = pastData.customerId;
        this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
        if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
          this.activityData.from = 'customersupport@mytaxprepoffice.com';
        } else if (this.userDetails.role == 'Support - US') {
          this.activityData.from = 'support@mytaxprepoffice.com';
        }
        this.activityData.subject = pastData.subject;
        this.activityData.salesProcessStatus = pastData.salesProcessStatus;

      } else if (data['IsChangedEditModeValue'] === 'EmailToCall') {

        setTimeout(() => {
          this.setActivityType('standard', 'phonecall', 'out');
        }, 500);
        this.activityData.customerId = pastData.customerId;
        this.activityData.salesProcessStatus = pastData.salesProcessStatus;
      } else if (data['IsChangedEditModeValue'] === 'Reply') {

        setTimeout(() => {
          this.setActivityType('email', 'e-mail', 'out');
        }, 1000);
        this.activityData.customerId = pastData.customerId;
        //  get previous selected acitvity type
        const key = data['activityTypeSelectedKey'];
        const direction = data['activityTypeSelectedOption'];
        if (key === 'e-mail' && direction === 'out') {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
            this.activityData.to = pastData.to.toLowerCase();
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
            this.activityData.to = pastData.to.toLowerCase();
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
            this.activityData.to = pastData.to.toLowerCase();
          }
        } else {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
            this.activityData.to = pastData.from.toLowerCase();
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
            this.activityData.to = pastData.from.toLowerCase();
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
            this.activityData.to = pastData.from.toLowerCase();
          }
        }
        this.activityData.subject = pastData.subject;
        this.activityData.information = this.signatureHTML + pastData.information;
        this.activityData.salesProcessStatus = pastData.salesProcessStatus;
      } else if (data['IsChangedEditModeValue'] === 'Forward') {

        setTimeout(() => {
          this.setActivityType('email', 'e-mail', 'out')
        }, 1000)

        this.activityData.customerId = pastData.customerId;
        this.activityData.priority = pastData.priority;
        this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
        //  get previous selected acitvity type
        const key = data['activityTypeSelectedKey'];
        const direction = data['activityTypeSelectedOption'];
        if (key === 'e-mail' && direction === 'out') {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
            this.activityData.to = pastData.to.toLowerCase();
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
            this.activityData.to = pastData.to.toLowerCase();
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
            //tmpData.to.toLowerCase();
            this.activityData.to = pastData.to.toLowerCase();
          }
        } else {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
            this.activityData.to = pastData.from.toLowerCase();
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
            this.activityData.to = pastData.from.toLowerCase();
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
            //tmpData.to.toLowerCase();
            this.activityData.to = pastData.from.toLowerCase();
          }
        }
        this.activityData.subject = pastData.subject;
        this.activityData.information = this.signatureHTML + pastData.information;
      } else if (data['IsChangedEditModeValue'] === 'Followup') {
        const activityType = data['FollowUpActivityType'];
        setTimeout(() => {
          this.setActivityType(activityType.mainType, activityType.selectedKey, activityType.option);
        }, 500);
        this.activityData.customerId = pastData.customerId;
        this.activityData.taxSeason = pastData.taxSeason;
        this.activityData.department = pastData.department;
        this.activityData.from = pastData.from.toLowerCase();
        //  get previous selected acitvity type
        const key = activityType.selectedKey;
        const direction = activityType.option;
        if (key === 'e-mail' && direction === 'out') {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
            this.activityData.to = pastData.to.toLowerCase();
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
            this.activityData.to = pastData.to.toLowerCase();
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
            //tmpData.to.toLowerCase();
            this.activityData.to = pastData.to.toLowerCase();
          }
        } else if (key === 'e-mail' && direction === 'in') {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
            this.activityData.to = pastData.from.toLowerCase();
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
            this.activityData.to = pastData.from.toLowerCase();
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
            //tmpData.to.toLowerCase();
            this.activityData.to = pastData.from.toLowerCase();
          }
        } else {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
            this.activityData.to = '';
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
            this.activityData.to = '';
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
            this.activityData.to = '';
          }
        }
        this.activityData.cc = pastData.cc;
        this.activityData.bcc = pastData.bcc;
        this.activityData.subject = pastData.subject;
        if (activityType.mainType === 'email' && activityType.selectedKey === 'e-mail' && activityType.option === 'out') {
          this.activityData.information = this.signatureHTML + pastData.information;
        }
        else {
          this.activityData.information = pastData.information;
        }
      }
      this.activityData.customerId = pastData.customerId;
      this.activityData.salesProcessStatus = pastData.salesProcessStatus;
      this.activityData.responsiblePerson_value = this.userService.getUserDetail().id;
      if (data['IsChangedEditModeValue'] !== 'EmailToCall') {
        this.activityData.subject = pastData.subject;
      }

      if (data['IsChangedEditModeValue'] === 'Reply' || data['IsChangedEditModeValue'] === 'Forward' || data['IsChangedEditModeValue'] === 'Followup') {
        const key = data['activityTypeSelectedKey'];
        const direction = data['activityTypeSelectedOption'];
        if (key === 'e-mail' && direction === 'out') {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
          }
          this.activityData.to = pastData.to ? pastData.to : this.activityData.to;
        } else {
          if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
            this.activityData.from = 'customersupport@mytaxprepoffice.com';
          } else if (this.userDetails.role == 'Support - US') {
            this.activityData.from = 'support@mytaxprepoffice.com';
          } else {
            this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
          }
          if ((data['IsChangedEditModeValue'] !== 'Followup') || (data['IsChangedEditModeValue'] === 'Followup' && direction === 'in')) {
            this.activityData.to = pastData.from ? pastData.from : this.activityData.from;
          } else {
            this.activityData.to = '';
          }
        }

        if (data['IsChangedEditModeValue'] !== 'Followup') {
          this.activityData.information = this.signatureHTML + pastData.information;
        }

        // Ticket Reply Start
        if (pastData.ticketDetails !== undefined && pastData.ticketDetails !== null && pastData.ticketDetails.length > 0) {
          if (data.screen === 'activity') {
            // setTimeout(() => {
            //   this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: pastData.ticketDetails, id: this.modelData.id });
            // }, 1000);
            this.getAllLookup(); // in case of reply and forward lookup data are not bind , this method is called to bind lookup data
            setTimeout(() => {
              this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: pastData.ticketDetails, id: this.modelData.id });
              //   this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityData', data: this.activityData, id: this.modelData.id });
            }, 1000);

          }


        }
      } else {
        setTimeout(() => {
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: [], id: this.modelData.id });
        }, 1000);
      }

    } else {
      const direction = data['activityTypeSelectedOption'];
      const type = data['activityTypeSelectedKey'];
      const self = this;
      setTimeout(() => {
        self.setActivityType(data['activityTypeSelectedMainType'], data['activityTypeSelectedKey'],
          data['activityTypeSelectedOption']);
      }, 500);
      // this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'customerID', data: data.customerId });

      if (type === 'e-mail' && direction === 'out') {
        this.activityData.information = this.signatureHTML;
      }
      /*Assgin data for ActivityTo when  activity in mode email and New  end*/

      if (this.userDetails.role == 'Development Team' || this.userDetails.role == 'Support - India' || this.userDetails.role == 'Administrator') {
        this.activityData.from = 'customersupport@mytaxprepoffice.com';
      } else if (this.userDetails.role == 'Support - US') {
        this.activityData.from = 'support@mytaxprepoffice.com';
      } else {
        if ((this.userService.getUserDetail().userEmail)) {
          this.activityData.from = this.userService.getUserDetail().userEmail.toLowerCase();
        }
      }
    }

    if (!this.activityData.taxSeason) {
      if (this.userDetails.role == 'Sales - Atlanta' || this.userDetails.role == 'Sales - Rome' || this.userDetails.role == 'Customer Relation') {
        this.activityData.taxSeason = '2019';
        this.activityData.department = 'Sales';
        if (this.ticketList == undefined || this.ticketList.length == 0) {
          this.getCustomerTicketData();
        }
      } else {
        this.activityData.taxSeason = '2019';
        this.activityData.department = 'Support';
      }
    }
    if (this.modelData && this.modelData.customerId) {
      this.activityData.customerId = this.modelData.customerId;
    }
    this.activityData.status_value = '0'; // setting status value as 'New'
    this.activityData.responsiblePerson_value = this.userService.getUserDetail().id;
    this.formattedCreatedDate = moment(new Date()).tz('America/New_York').format('MM/DD/YY hh:mm A');


    // let titleRef;
    // this.windowTitleBar.forEach((titlebar) => {
    //   if (titlebar.elementRef.nativeElement.parentElement.id.indexOf(this.modelData.id) > -1) {
    //     titleRef = titlebar;
    //   }
    // });
    // this.windowRef.window.instance.titleBarTemplate = titleRef;

    this.CDRService.callDetectChanges(this.cdr);

  }


  /**
   * This function is used to initialize ticket activity detail screen in edit mode 
   * and to get and set data on the basis of type of screen and id
   */
  initScreen(screen, id) {
    switch (screen) {
      case 'activity':
        this.getActivityDetails(id, 'init');
        break;
      case 'ticket':
        this.getTicketDetails(id, 'init');
        break;
      default:
        break;
    }
  }

  reloadActivityWithDiffId() {
    if (this.screenNameAllowed.includes(this.modelData.screen)) {
      this.activityId = this.modelData.id;
      this.initScreen(this.modelData.screen, this.modelData.id);
      // this.getAllLookup();
      // this.refreshView = false;
      setTimeout(() => {
        // this.refreshView = true;
      })
    }
  }



  validateRouter() {
    if (this.screenNameAllowed.includes(this.modelData.screen)) {
      this.initScreen(this.modelData.screen, this.modelData.id);
      this.activityId = this.modelData.id;
    } else {
      this.messageService.showMessage('Unauthorized Access to the Screen', 'error');
    }
  }

  validateModelData() {
    if (this.screenNameAllowed.includes(this.modelData.screen)) {
      if (this.modelData && this.modelData.id) {
        this.activityMode = 'Edit';
        this.initScreen(this.modelData.screen, this.modelData.id)
      } else {
        this.activityMode = 'New';
        this.modelData.id = this.modelData.tempId;
        this.initNewScreen(this.modelData);
      }
    } else {
      this.messageService.showMessage('Unauthorized Access to the Screen', 'error');
    }
  }

  checkChanges(type) {
    if (this.displayKendoCloseButton) {
      const dialogData = { title: 'Attention', text: 'Call is Running' };
      this.dialogService.confirm(dialogData, { backdrop: true });
    } else {
      if (this.activityData.id || this.activityMode == 'New') {
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'save', data: { type: type }, id: this.modelData.id });
      } else {
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'saveTicket', data: { type: type }, id: this.modelData.id });
      }
    }
    if (this.displayKendoCloseButton) {
      setTimeout(() => {
        const height = document.getElementById('taTicketHeight').offsetHeight;
        const activityHeight = document.getElementById('activtiyHeight').offsetHeight;
        this.dynamicHeight = 846 - height;
        this.activityEditorSection = 846 - activityHeight;
        this.kendoChatHeight = this.activityEditorSection - 166;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'set-dynamic-height1', topic: 'set-dynamic-height', data: this.dynamicHeight, id: this.modelData.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data: this.activityEditorSection, id: this.modelData.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: this.kendoChatHeight, id: this.modelData.id });
      }, 500);
    }
    // this.ticketActivityIntegrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 786, id: this.modelData.id });
    // this.ticketActivityIntegrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data:785, id: this.modelData.id });
    // this.ticketActivityIntegrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: 630, id: this.modelData.id });
  }

  closeWindow() {
    if (this.displayKendoCloseButton) {
      const dialogData = { title: 'Attention', text: 'Call is Running' };
      this.dialogService.confirm(dialogData, { backdrop: true });
    } else {
      this.windowRef.close();
      this.ticketActivityOverlayService.closeWindow(this.modelData.windowId, this.modelData.id, true);
    }
  }

  minimize(windowTitleBar) {
    const refrenceId = windowTitleBar.elementRef.nativeElement.parentElement.id.replace('titlebar_', '');
    this.ticketActivityOverlayService.windowRefs[refrenceId].window.instance.state = 'minimized'
    this.CDRService.callDetectChanges(this.cdr)
  }

  maximize(windowTitleBar) {
    const refrenceId = windowTitleBar.elementRef.nativeElement.parentElement.id.replace('titlebar_', '');
    this.ticketActivityOverlayService.windowRefs[refrenceId].window.instance.state = 'maximized'
    this.CDRService.callDetectChanges(this.cdr)
  }


  /**
   * Lifecycle hook called for initializing the whole ticket activity screen
   */
  ngOnInit() {
    this.isDialogOpen = true;
    this.activityId = this.modelData.id;
    this.windowId = this.modelData.windowId;
    this.userResellerId = this.userService.getResellerId();
    this.userDetails = this.userService.getUserDetail();
    this.userService.getResellerId(); // to set resellerId of the user in the local storage so as to set it in request header for API
    window.addEventListener("unload", (event) => {
      if (this.isDialogOpen) { // only when the dialog is stil open
        this.ticketActivityIntegrityService.removeOpenAtPlaces(this.modelData.id, this.openedAtNumber);
      }
    });

    /*********************************** */

    this.integrityServiceSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.id === this.modelData.id) {
        if (msgObj.topic === 'TICKET_ACTIVITY_MODE') {
          this.isViewMode = msgObj.data.isViewMode;
          this.openedAtNumber = msgObj.data.openedAtNumber;
          this.openedAtPlaces = msgObj.data.openAtPlaces;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'isViewMode', topic: 'isViewMode', data: this.isViewMode, id: this.modelData.id });
        } else if (msgObj.topic === 'activity') {
          this.ticketActivityIntegrityService.removeOpenActivity(this.modelData.id, this.isViewMode, this.openedAtNumber);
          if (msgObj.channel !== 'ticket-activity-overlay') {
            this.ticketActivityIntegrityService.setOpenActivity({ 'timeStamp': moment().utc().format(), 'id': msgObj.data, 'activityId': msgObj.data, 'screen': 'activity', 'minimizeTitle': this.customerShortInfo, dialerCode: this.modelData.dialCode });
            this.ticketActivityOverlayService.internalSelection(this.modelData.id, msgObj.data)
            this.getActivityDetails(msgObj.data, 'internal');
            setTimeout(() => {
              this.modelData.id = msgObj.data;
              this.modelData.screen = 'activity';
            }, 1000);
          }

        } else if (msgObj.topic === 'ticket') {
          this.ticketID = msgObj.data;
          this.ticketActivityIntegrityService.removeOpenActivity(this.modelData.id, this.isViewMode, this.openedAtNumber);
          if (msgObj.channel !== 'ticket-activity-overlay') {
            this.ticketActivityIntegrityService.setOpenActivity({ 'timeStamp': moment().utc().format(), 'id': msgObj.data, 'ticketId': msgObj.data, 'screen': 'ticket', 'minimizeTitle': this.customerShortInfo, dialcode: this.modelData.dialCode });
            this.ticketActivityOverlayService.internalSelection(this.modelData.id, msgObj.data)
            this.getTicketDetails(msgObj.data, 'internal');
            setTimeout(() => {
              this.modelData.id = msgObj.data;
              this.modelData.screen = 'ticket';
            }, 1000);
          }
        } else if (msgObj.topic === 'set-dynamic-height') {
          this.dynamicHeight = msgObj.data;
        }
        else if (msgObj.topic === 'set-chat-dynamic-height') {
          this.chatDynamicHeightActivities = msgObj.data;
        }
        if (msgObj.topic === 'customerInfo') {
          this.customerInfo = msgObj.data.info;
          this.customerInfo.customerId = msgObj.data.info.customerId;
          if (msgObj.data.info && msgObj.data.info.contactPerson.length > 0) {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-header', topic: 'emailToFollowUp', data: msgObj.data.info.contactPerson[0].email });
          }
          // this.ticketActivityIntegrityService.sendMessage({ channel: 'chat-email', topic:'chatEmail', data:msgObj.data.info.contactPerson });    
          this.customerShortInfo = msgObj.data.shortInfo;
          if (this.activityData.type === 'phonecall' && this.activityData.direction === 'out' && msgObj.data.info && msgObj.data.info.doNotCall) {
            this.isDoNotCall = true;
          } else {
            this.isDoNotCall = false;
          }
          if (this.customerInfo.salesProcessStatus !== undefined && this.customerInfo.salesProcessStatus == 'BlackListed') {
            this.showBlacklistIcon = true;
          } else {
            this.showBlacklistIcon = false;
          }
          this.customerInfo.activityCustomerFinalInformation = this.customerShortInfo
          if (!this.modelData.tempId) {
            this.ticketActivityIntegrityService.setOpenActivity({ 'timeStamp': moment().utc().format(), 'id': this.modelData.id, 'activityId': this.activityData.id, 'ticketId': this.ticketID, 'screen': this.modelData.screen, 'minimizeTitle': this.customerShortInfo, dialcode: this.modelData.dialCode });
          }

          if (!this.windowRef.window.instance.titleBarTemplate) {
            let titleRef;
            this.windowTitleBar.forEach((titlebar) => {
              if (titlebar.elementRef.nativeElement.parentElement.id.indexOf(this.modelData.id) > -1) {
                titleRef = titlebar;
              }
            });
            this.windowRef.window.instance.titleBarTemplate = titleRef;
          }
        }
        if (msgObj.topic === 'changeActivityType') {
          this.customerShortInfo = msgObj.data.info;
          this.setActivityType(msgObj.data.screen, msgObj.data.type, msgObj.data.direction, true);
        }
        if (msgObj.topic === 'ticketID') {
          this.ticketID = msgObj.data;
          setTimeout(() => {
            if (this.modelData.screen == 'activity') {
              this.ticketActivityIntegrityService.setOpenActivity({ 'timeStamp': moment().utc().format(), 'id': this.modelData.id, 'activityId': this.modelData.id, 'ticketId': this.ticketID, 'screen': 'activity', 'minimizeTitle': this.customerShortInfo, dialcode: this.modelData.dialCode });
            }
          }, 1000);

        }
        if (msgObj.topic === 'activityData') {
          this.activityId = msgObj.data.id;

          setTimeout(() => {
            if (this.modelData.screen == 'ticket') {
              this.ticketActivityIntegrityService.setOpenActivity({ 'timeStamp': moment().utc().format(), 'id': this.modelData.id, 'activityId': this.activityId, 'ticketId': this.modelData.id, 'screen': 'ticket', 'minimizeTitle': this.customerShortInfo, dialcode: this.modelData.dialCode });
            }
          }, 1000);
        }
        if (msgObj.topic === 'changesSaved') {
          this.changesSaved = msgObj.data;
        }
      }
      this.CDRService.callDetectChanges(this.cdr)
    });

    if (this.modelData) {
      this.validateModelData();
    } else {
      this.validateRouter();
    }

    /*/************************************* */

    // this.getAllLookup();
    setTimeout(() => {
      this.getAllLookup();
    }, 100);

    this.callingSystemWatcher = this.postalChannelService.postalMessage$.subscribe((postalMsg: any) => {
      if (postalMsg.channel === 'HANGUP_CALL_FROM_TICKET') {
        if (postalMsg.data && postalMsg.data.iscallRunning && postalMsg.data.id === this.activityId) {
          this.displayKendoCloseButton = true;
        } else {
          this.displayKendoCloseButton = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.isDialogOpen = false;
    this.ticketActivityIntegrityService.removeOpenActivity(this.modelData.id, this.isViewMode, this.openedAtNumber);
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }
    if (this.callingSystemWatcher) {
      this.callingSystemWatcher.unsubscribe();
    }
  }

  // ngDoCheck() {
  //   this.counter++
  //   console.log('Check', this.counter)
  // }

}

