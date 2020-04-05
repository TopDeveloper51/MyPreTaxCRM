import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { CommonApiService, UserService } from '@app/shared/services';

@Component({
  selector: 'app-predictive-dialer-call-input',
  templateUrl: './predictive-dialer-call-input.component.html',
  styleUrls: ['./predictive-dialer-call-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PredictiveDialerCallInputComponent implements OnInit {
  selectedCurrentSoftware;
  selectedBankProduct;
  @Input('predictiveDialer') predictiveDialer: any = { 'bankName': [] };
  @Input('mandatoryBPDetails') mandatoryBPDetails: boolean;

  @Input('bankLookup') bankLookup: any = [];
  @Input('renewalType') renewalType: any = [];
  @Input('currentSoftware') currentSoftware: any = [];
  @Input('bankProduct') bankProduct: any = [];
  @Input('preferredLanguage') preferredLanguage: any = [];
  @Input('postCallTime') postCallTime: number = 0;
  @Input('showFurtherAction') showFurtherAction: boolean = true;

  userDetails: any;
  allowedWaitingTimeAfterPDCall: number; // minimum time (seconds) after which the timer shall be shown to the agent after a call is hung
  couponList: any = [{ 'id': 'Portal1', 'name': 'Portal1' }, { 'id': 'Portal2', 'name': 'Portal2' }, { 'id': 'None', 'name': 'None' }]

  // bankLookup: any = [];
  // renewalType: any = [];
  // currentSoftware: any = [
  //   { 'id': 'NewToMarket', 'name': 'New To Market' },
  //   { 'id': 'IDidNotAsk', 'name': 'I didn\'t Ask' },
  //   { 'id': 'CustNotWillingToAnswer', 'name': 'Cust. not willing' }
  // ];

  // bankProduct: any = [
  //   { 'id': 'NotBPCustomer', 'name': 'Not a Bank Product Cust.' },
  //   { 'id': 'IDidNotAsk', 'name': 'I didn\'t Ask' },
  //   { 'id': 'CustNotWillingToAnswer', 'name': 'Cust. not willing' }
  // ];

  constructor(private _commonAPI: CommonApiService, private userService: UserService) { }

  public selectCurrentSoftware(id: any, hasCustomerSoftware?: boolean) {
    if (hasCustomerSoftware) {
      this.predictiveDialer.currentSoftware = id;
      this.predictiveDialer.currentSoftwareQuestionReply = 'SelectSoftware';
    } else {
      this.predictiveDialer.currentSoftwareQuestionReply = id;
      this.predictiveDialer.currentSoftware = undefined;
    }
  }

  public selectBankProduct(id: any) {
    this.predictiveDialer.bankProductQuestionReply = id;
    this.predictiveDialer.noOfBankProducts = undefined;
    this.predictiveDialer.bankName = [];
    this.predictiveDialer.isUnknownVolume = undefined;
    this.mandatoryBPDetails = false;
  }

  public selectPrefferedLanguage(id: any) {
    if (this.predictiveDialer.preferredLanguage) {
      this.predictiveDialer.preferredLanguage = undefined;
    } else {
      this.predictiveDialer.preferredLanguage = id;
    }

  }

  public selectCoupon(id: any) {
    if (this.predictiveDialer.PostCardCampaignCoupon && this.predictiveDialer.PostCardCampaignCoupon == id) {
      this.predictiveDialer.PostCardCampaignCoupon = undefined;
    } else {
      this.predictiveDialer.PostCardCampaignCoupon = id;
    }
  }

  public selectBPDetails(id?: any) {
    if (id !== undefined) {
      if (this.predictiveDialer.bankName.includes(id)) {
        const index = this.predictiveDialer.bankName.indexOf(id)
        this.predictiveDialer.bankName.splice(index, 1);
      } else {
        this.predictiveDialer.bankName.push(id);
      }
    }
    if ((this.predictiveDialer.noOfBankProducts !== undefined && this.predictiveDialer.noOfBankProducts !== null) || (this.predictiveDialer.isUnknownVolume !== undefined && this.predictiveDialer.isUnknownVolume == true) || (this.predictiveDialer.bankName !== undefined && this.predictiveDialer.bankName.length > 0)) {
      this.predictiveDialer.bankProductQuestionReply = 'BPCustomer';
      if (this.predictiveDialer.isUnknownVolume) {
        this.predictiveDialer.noOfBankProducts = undefined;
      }
      this.mandatoryBPDetails = true;
    } else {
      this.mandatoryBPDetails = false;
      this.predictiveDialer.bankProductQuestionReply = undefined;
    }
  }

  notesFormat() {
    const self = this;
    let notesArray = [];
    if (self.predictiveDialer.notes !== undefined && self.predictiveDialer.notes !== null && self.predictiveDialer.notes !== '') {
      notesArray = self.predictiveDialer.notes.split('\n');
    }

    let newNotesArray = [];
    for (let item of notesArray) {
      if (item.includes('->') === false) {
        item = "-> " + item;
      }
      newNotesArray.push(item);
    }

    if (newNotesArray !== undefined && newNotesArray !== null && newNotesArray.length > 0) {
      self.predictiveDialer.notes = newNotesArray.join('\n');
    }
  }

  // called on initialization to get lookup values for bank list
  // getLookupForbankList(): void {
  //   if (this.bankLookup.length == 0) {
  //     this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_BANKLIST, showLoading: false }).then(response => {
  //       this.bankLookup = _.orderBy(response, ['value'], ['asc']);
  //       this.bankLookup = this.bankLookup.filter(obj => obj.value !== 'Other');
  //       if (this.bankLookup !== undefined && this.bankLookup.length > 0) {
  //         this.bankLookup.push({ 'id': 'Other', 'value': 'Other' });
  //       }
  //       for (const obj of this.bankLookup) {
  //         obj.name = obj.value;
  //       }
  //     });
  //   }
  // }

  // // called on initialization to get lookup values for tax software list 
  // getLookupForTaxSoftwareList(): void {
  //   if (this.renewalType.length == 0) {
  //     this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_TAXSOFTWARE_LIST, showLoading: false }).then(response => {
  //       this.renewalType = _.orderBy(response, ['name'], ['asc']);
  //       if (this.renewalType !== undefined && this.renewalType.length > 0) {
  //         this.renewalType.push({ 'id': 'Other', 'name': 'Other' });
  //       }
  //     });
  //   }
  // }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    if (this.userDetails.crmAppConfig && this.userDetails.crmAppConfig.crmConfig && this.userDetails.crmAppConfig.crmConfig.allowedWaitingTimeAfterPDCall) {
      this.allowedWaitingTimeAfterPDCall = this.userDetails.crmAppConfig.crmConfig.allowedWaitingTimeAfterPDCall;
    }

    // this.getLookupForbankList();
    // this.getLookupForTaxSoftwareList();
  }

}
