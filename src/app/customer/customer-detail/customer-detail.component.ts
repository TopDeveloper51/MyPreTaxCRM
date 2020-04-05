// External imports
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef, OnDestroy
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

// Internal imports
import { CustomerDetailService } from "@app/customer/customer-detail/customer-detail.service";
import { UserService, MessageService, CDRService, CopyToClipboardService, LocalStorageUtilityService, DialogService, CommonApiService } from '@app/shared/services';
import { CustomerHistoryComponent } from '@app/customer/dialogs/customer-history/customer-history.component';
import { CustomerAddressComponent } from '@app/customer/dialogs/customer-address/customer-address.component';
import { CustomerProfileComponent } from '@app/customer/dialogs/customer-profile/customer-profile.component';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { APINAME } from "@app/customer/customer-constants";
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
  providers: [CustomerDetailService],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class CustomerDetailComponent implements OnInit, OnDestroy {

  public mode: string; // store user mode edit or new
  public selectedTabName: string = 'Customer'; // Selected Tab Name
  public resellerId: string = this.userService.getResellerId();
  public isDefaultReseller: boolean = this.userService.isDefaultReseller(); // get default reseller
  public userDetails: any = this.userService.getUserDetail();
  public isTaxVisionReseller: boolean = false;
  public customerID: any;// hold customer id passed in edit mode
  public unidentifiedCustomer: boolean; // to disable the elements on the bases of unidentified customer
  public customerDetail: any = {};
  public customerProfileDetail: any = {};
  public LicenseTitle = 'License (None)'
  public officesTitle: string = 'Offices';
  public lookup: any = {}
  public isAllPartyConsent: boolean = false;
  public showRedWarning: boolean = false; // used to show hide red warning icon and reseller name
  public showBlackListedIcon: Boolean = false;
  public CustomerResellerName: string;
  public customerReadOnlyRefersh: Subscription;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private messageService: MessageService,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private clipboard: CopyToClipboardService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private customerDetailService: CustomerDetailService,
    private dialogService: DialogService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private _CommonApiService: CommonApiService
  ) { }

  public getSubscriptionPackageName(customerId) {
    const self = this;
    self.customerDetailService.getSubscriptionPackageName(customerId)
      .then(
        (response: any) => {
          console.log(response);
          this.LicenseTitle = response;
          this.CDRService.callDetectChanges(this.cdr)
        },
        error => {
          console.error(error);
        }
      );
  }

  public getCustomerDetails(customerId) {
    // get customer detail
    const self = this;
    self.customerDetailService.getCustomerDetails(customerId)
      .then(
        (response: any) => {
          if (response && Object.keys(response).length > 0) {
            this.customerDetail = response;
            // check user's reseller id and customer id is same or not
            if (response.resellerId) {
              let object = this.lookup.resellerList.find(o => response.resellerId === o.id);
              if (object) {
                this.customerDetail.resellerName = object.name;
              }
              if (response.resellerId !== this.resellerId) {
                this.showRedWarning = true;
                if (object) {
                  this.CustomerResellerName = object.name;
                } else {
                  this.CustomerResellerName = '';
                }
              } else {
                this.showRedWarning = false;
              }



            }

            if (this.customerDetail.salesProcessStatus !== undefined && this.customerDetail.salesProcessStatus == "BlackListed") {
              this.showBlackListedIcon = true;
            } else {
              this.showBlackListedIcon = false;
            }

            if (response.state !== undefined && response.state.length > 0) {
              this.customerDetail.state = response.state;
              let index = this.lookup.stateList.findIndex(t => t.name == this.customerDetail.state);
              if (index !== -1) {
                if (this.lookup.stateList[index].recordingPhoneConsent == 'All-Party Consent') {
                  this.isAllPartyConsent = true;
                } else {
                  this.isAllPartyConsent = false;
                }
              }
            } else {
              this.customerDetail.state = [];
              this.isAllPartyConsent = false;
            }
            // check user's reseller id and customer id is same or not
            // if (res.resellerId !== undefined && res.resellerId !== '' && res.resellerId !== this.resellerId) {
            //   this.showRedWarning = true;
            //   let object = this.lookupData.resellerList.find(o => res.resellerId === o.id);
            //   if (object !== undefined && object !== null) {
            //     this.CustomerResellerName = object.name;
            //   } else {
            //     this.CustomerResellerName = '';
            //   }
            // } else {
            //   this.showRedWarning = false;
            // }
            // if (res.state !== undefined && res.state.length > 0) {
            //   this.customerDetail.state = res.state;
            //   let index = this.stateList.findIndex(t => t.name == this.customerDetail.state);
            //   if (index !== -1) {
            //     if (this.stateList[index].recordingPhoneConsent == 'All-Party Consent') {
            //       this.isAllPartyConsent = true;
            //     } else {
            //       this.isAllPartyConsent = false;
            //     }
            //   }
            // } else {
            //   this.customerDetail.state = [];
            //   this.isAllPartyConsent = false;
            // }
            // if (this.customerDetail.customerNumberDetails !== undefined &&
            //   this.customerDetail.customerNumberDetails.length > 0) {
            //   this.mergeId = this.customerDetail.customerNumberDetails.map(t => t.customerNumber);
            // }
            // if (this.customerDetail.salesProcessStatus !== undefined && this.customerDetail.salesProcessStatus == "BlackListed") {
            //   this.showBlackListedIcon = true;
            // } else {
            //   this.showBlackListedIcon = false;
            // }

            if (!this.customerDetail.ElectronicReturnOriginator) {
              if (this.localStorageUtilityService.getFromLocalStorage('customerSearchObject') && this.localStorageUtilityService.getFromLocalStorage('customerSearchObject').ElectronicReturnOriginator) {
                this.customerDetail['ElectronicReturnOriginator'] = (this.localStorageUtilityService.getFromLocalStorage('customerSearchObject').ElectronicReturnOriginator);
              }
            }
            this.CDRService.callDetectChanges(this.cdr)
          } else {
            this.router.navigate(['customer']);
          }
        },
        error => {
          console.log(error);
          if (error && error.code == 4004) {
            this.messageService.showMessage('Customer Unavailable', 'error');
            this.router.navigate(['customer']);
          }
        }
      );
  }


  toClipboard() {
    this.clipboard.copy(this.customerID);
    this.messageService.showMessage('CustomerId Copied Successfully', 'success');
  }

  public getCustomerProfileDetails(customerID)
  {
    this.customerDetailService.getCustomerProfileDetails(customerID).then((response)=>{
      this.customerProfileDetail = response;
    });
  }
  /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to open customer profile dialog on particular customer is
* @memberof CustomerDetailComponent
*/
  public openCustomerProfile() {
    // Check Profile Exists or not
    if (this.customerProfileDetail.isCustomerProfile) {
      this.dialogService.custom(CustomerProfileComponent, { 'data': { 'docId': this.customerProfileDetail.customerId, isCustomerCard: true } }, { keyboard: true, backdrop: 'static', size: 'xl' })
        .result.then((btn: any) => {

        });
    } else {
      this.messageService.showMessage('Customer Profile Unavailable', 'error');
    }
  }
  /**
     *This function is used open history dialog when user want to see history
     */
  public openHistory(): void {
    // prepare obj for dialog
    const objHistory = { 'customerId': this.customerDetail.customerId, 'isFromCustomer': true };
    //open dialog
    this.dialogService.custom(CustomerHistoryComponent, { 'data': { 'objHistory': objHistory } }, { keyboard: true, backdrop: 'static', size: 'xl' })
      .result.then((btn: any) => {
      });
  };

  public openPlanner() {
    this.localStorageUtilityService.addToLocalStorage('activeCallDetails', { customerID: this.customerID });
    window.open('/#/training-planning', '_blank');
  }

  public openScheduler() {
    this.localStorageUtilityService.addToLocalStorage('activeCallDetails', { customerID: this.customerID });
    window.open('/#/demo-scheduler', '_blank');
  }

  /**
  *This function is used open Address information dialog when user want to see Address
  */
  public openAddInformation(): void {
    // prepare obj for dialog
    const objAddInformation = { 'customerId': this.customerDetail.customerId, 'isFromCustomer': true };
    // open dialog
    this.dialogService.custom(CustomerAddressComponent, { 'data': { 'objAddInformation': objAddInformation } }, { keyboard: true, backdrop: 'static', size: 'lg' })
      .result.then((btn: any) => {
      });

  };

  public getCustomerCardLookUp() {
    // this._commonAPIService.emitDataLoadingChangeEvent(true);
    const blankEntryReq = ['state', 'country', 'reseller', 'responsible', 'suggestedPaymentStatus', 'customerType', 'salesProcessStatus', 'trainingStatus', 'refundRequestFeeling'];

    this.customerDetailService.getCustomerCardLookup(blankEntryReq)
      .then(
        (response: any) => {
          this.lookup = response;
          if (this.mode === 'edit' && this.customerID) {
            this.getCustomerDetails(this.customerID);
          } else {// if mode is new then we execute this part
            // this._commonAPIService.emitDataLoadingChangeEvent(false);
            // get data from local storage of login users
            this.customerDetail = {};
            // get userDetails from UserService
            // get login user name to display

            // this.customerDetail.createdByName = this.userDetails.userName;
            // this.customerDetail.createdDate = moment(new Date()).tz('America/New_York').format('MM/DD/YY hh:mm A');
            // this.customerDetail.resellerId = this.userService.getResellerId();
          }
        },
        error => { console.log(error); }
      );
  }

  /**
* @author Dhruvi Shah
* @createdDate 14/10/2019
* @description get lookup values
* @memberof CustomerSearchComponent
*/
  public getLookupForCustomer(): void {
    const self = this;
    self.customerDetailService.getLookupForCustomer().then(
      (response: any) => {
        self.lookup.preferredLanguageList = response.preferredLanguageList;
        self.lookup.bankList = response.bankList;
        self.lookup.countryList = response.countryList;
        self.lookup.customerTypeList = response.customerTypeList;
        self.lookup.licenseOfferType = response.licenseOfferType;
        self.lookup.paymentStatusList = response.paymentStatusList;
        self.lookup.resellerList = response.resellerList;
        self.lookup.responsiblePesronList = response.responsiblePesronList;
        self.lookup.salesProcessStatusList = response.salesProcessStatusList;
        self.lookup.seasonReadinessFlagList =response.seasonReadinessFlagList;
        self.lookup.softwareList = response.softwareList;
        self.lookup.stateList = response.stateList;
        self.lookup.trainingStatusList = response.trainingStatusList;
        self.lookup.refundRequestFeelingList =response.refundRequestFeeling;
        self.lookup.SRFlagLookupForBPEnrollment = response.SRFlagLookupForBPEnrollment;
        self.lookup.seasonReadinessFlagLookup = response.seasonReadinessFlagLookup;
        self.lookup.lookupForTrainFinStatus = response.lookupForTrainFinStatus;
        self.lookup.lookupForEfinVerStatus = response.lookupForEfinVerStatus;
        self.lookup.lookupForOfficeStatus = response.lookupForOfficeStatus;
        self.lookup.lookupForConversionStatus = response.lookupForConversionStatus;
        self.lookup.lookupForConversionProformaStatus = response.lookupForConversionProformaStatus;

        if (this.mode === 'edit' && this.customerID) {
          this.getCustomerDetails(this.customerID);
        } else {// if mode is new then we execute this part
          // this._commonAPIService.emitDataLoadingChangeEvent(false);
          // get data from local storage of login users
          this.customerDetail = {};
          // get userDetails from UserService
          // get login user name to display

          // this.customerDetail.createdByName = this.userDetails.userName;
          // this.customerDetail.createdDate = moment(new Date()).tz('America/New_York').format('MM/DD/YY hh:mm A');
          // this.customerDetail.resellerId = this.userService.getResellerId();
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  /**
     *This function is used save customer information
    */
  public saveDetails() {

    this.customerDetailService.saveCustomerDetails(this.customerDetail)
      .then((response: any) => {
        if (this.mode === 'new') {
          this.customerID = response;
          this.router.navigate(['customer', 'edit', this.customerID]);
          this.messageService.showMessage('Record Added SuccessFully', 'success');
        }
        else {
          this.getCustomerDetails(this.customerID);
          this.messageService.showMessage('Record Updated SuccessFully', 'success');
        }
      },
        error => { console.log(error); }
      );
  }

  tabChanged(tabName) {
    if (tabName !== undefined) {
      this.selectedTabName = tabName;
    }
  }


  ngOnInit() {

    if (this.resellerId === 'a4b3f97d-0270-405d-a876-88b697352db8') {
      this.isTaxVisionReseller = true;
    } else {
      this.isTaxVisionReseller = false;
    }

    if (this.userDetails.crmAppConfig.unIdentifiedCustomer.ids.includes(this.customerID) == true) {
      this.unidentifiedCustomer = true;
    } else {
      this.unidentifiedCustomer = false;
    }

    if (this.isDefaultReseller || this.isTaxVisionReseller) {
      this.selectedTabName = 'Activity';
    } else if (!this.isDefaultReseller && !this.isTaxVisionReseller) {
      this.selectedTabName = 'Contact';
    }

    this.customerReadOnlyRefersh = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'activityCustomer' || msgObj.topic === 'ticketCustomer') {
        this.getCustomerDetails(this.customerID);
      }
    });

    this.route.params.subscribe(params => {
      // decide mode
      this.mode = this.route.snapshot.params['mode'];
      if (this.mode === 'edit' || this.mode === 'new') {
        if (this.mode === 'edit') {
          this.customerID = this.route.snapshot.params['id'];
          if (this.customerID === undefined || this.customerID === null || this.customerID === '') {
            this.router.navigate(['customer']);
          }
        }
      } else {
        // redirect to customer search
        this.router.navigate(['customer']);
      }
      this.getSubscriptionPackageName(this.customerID);
      this.getLocationsCount();
      this.getLookupForCustomer();
      this.getCustomerCardLookUp();
      this.getCustomerProfileDetails(this.customerID);
    });
  }

  // get location count
  public getLocationsCount() {
    // this._commonAPIService.emitDataLoadingChangeEvent(true);
    this.officesTitle = 'Offices';
    if (this.customerID !== undefined && this.customerID !== '' && this.customerID !== null) {

      this._CommonApiService.getPromiseResponse({ apiName: APINAME.GET_LOCATION_COUNT, parameterObject: { 'customerId': this.customerID }, showLoading: false }).then(response => {
        if (response !== undefined) {
          this.officesTitle = 'Offices (' + response.masterCount + '/' + response.childCount + ')';
          this.ChangeTitleName();
        }
      }, error => {
      });
    }
  };

  // chanege Tile Name If Start With Office or License
  public ChangeTitleName(): void {
    if (this.selectedTabName !== undefined && this.selectedTabName.startsWith('License')) {
      if (this.selectedTabName !== this.LicenseTitle) {
        this.selectedTabName = this.LicenseTitle;
      }
    } else if (this.selectedTabName !== undefined && this.selectedTabName.startsWith('Offices')) {
      if (this.selectedTabName !== this.officesTitle) {
        this.selectedTabName = this.officesTitle;
      }
    }


  }

  ngOnDestroy() {
    if (this.customerReadOnlyRefersh) {
      this.customerReadOnlyRefersh.unsubscribe();
    }
  }
}
