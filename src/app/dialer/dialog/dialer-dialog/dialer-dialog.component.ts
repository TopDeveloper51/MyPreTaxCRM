import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SystemConfigurationService, DialerService, UserService, PostalChannelService } from '@app/shared/services';
import { DialersService } from '@app/dialer/dialers.service';
import * as _ from 'lodash';


@Component({
  selector: 'app-dialer-dialog',
  templateUrl: './dialer-dialog.component.html',
  styleUrls: ['./dialer-dialog.component.scss']
})
export class DialerDialogComponent implements OnInit {
  public dialerDetailsForm: FormGroup;
  public countryDetails: any = [];
  public domLayout;
  public rowData: any = [this.domLayout = 'autoHeight'];
  public userDetails: any;
  public startRefresh: boolean;
  public gridApi;
  public gridData: any;
  public gridColumnApi;
  public autoGroupColumnDef: any;
  public detailcolumnDef: any;
  public dialerData: any = { makeCall: true, phoneNo: '', countryCode: 'us', dialCode: '(+1)' };
  public columnDefs = [
    { headerName: 'Name', field: 'name', sortable: true, headerTooltip: 'name', lockPosition: true, width: 200, suppressMenu: true, filter: "agTextColumnFilter", sort: "asc" },
    { headerName: 'Language', field: 'lang', sortable: true, headerTooltip: 'Language', lockPosition: true, width: 200, filter: "agTextColumnFilter", suppressMenu: true },
    { headerName: 'Queue', field: 'queue', sortable: true, headerTooltip: 'Queue', lockPosition: true, width: 200, filter: "agTextColumnFilter", suppressMenu: true },
    {
      headerName: '', headerTooltip: 'Call', cellStyle: { textAlign: 'center' }, width: 100, lockPosition: true, suppressMenu: true, sortable: true,
      cellRenderer: (params) => {
        {
          return '<i class="fas fa-phone-alt fa-1x" data-action-type="dialInternalCall"></i>';
        }
      }
    },
  ];

  constructor(public modal: NgbActiveModal, private fb: FormBuilder, private systemConfig: SystemConfigurationService, private dialerService: DialerService,
    private dialersService: DialersService, private cdr: ChangeDetectorRef, private userservice: UserService, private postalChannelService: PostalChannelService) { }

  public close(): void {
    this.modal.close();
  }

  // this function is used to check digit
  public clickDigit(value: string): void {
    if (this.dialerData.makeCall === false) {
      console.log('send dtmf=' + value);
      this.dialerService.plivoWebSdk.client.sendDtmf(value);
      this.dialerService.writeLogsToPBX('sendDtmf', { 'valueSelected': value });
    } else if (this.dialerData.makeCall === true) {
      if (this.dialerData.phoneNo.length <= 30) {
        this.dialerData.phoneNo = this.dialerData.phoneNo + value;
        this.dialerDetailsForm.controls.phoneNo.setValue(this.dialerData.phoneNo);
      }
    }
    this.cdr.detectChanges();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }
  // dialer details form
  public dialerDetails() {
    this.dialerDetailsForm = this.fb.group({
      phoneNo: this.fb.control('', Validators.required),
      countryCodeListDialer: this.fb.control(this.countryDetails[0].value)
    });
  }

  phoneNoClear() {
    this.dialerDetailsForm.controls.phoneNo.setValue('');
    this.cdr.detectChanges();
  }

  // Call API for getting all Online User
  public getAllPilvoUserOnline() {
    const self = this;
    this.dialersService.getAllPlivoUserOnline().then((response) => {
      if (response) {
        this.rowData = response;
        _.remove(response, { "id": this.userDetails.id });
        this.cdr.detectChanges();

      } else {
      }
      self.startRefresh = false;
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      self.startRefresh = false;
      this.cdr.detectChanges();
    });
  }

  onRowClicked(e) {
    if (e.event.target) {
      const actionType = e.event.target.getAttribute('data-action-type');
      const dataValue = e.event.target.getAttribute('data-value');
      if (actionType) {
        this.onActionClicked({ actionType: actionType, dataItem: e.data, node: e.node, value: dataValue });
      }
    }
    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
  }

  public onActionClicked({ actionType, dataItem, node, value }) {
    console.log(dataItem);
    switch (actionType) {
      case 'dial':
        this.dial();
        break;
      case 'dialInternalCall':
        console.log(dataItem.plivoUN);
        this.dialInternalCall(dataItem.plivoUN);
        break;
      default:
        break;
    }
  }

  // Call Internally Between the Agents
  public dialInternalCall(endPointNumber): void {
    const phoneNumberToDial = (this.dialerDetailsForm.value.countryCodeListDialer + this.dialerDetailsForm.value.phoneNo)
      .replace('(', '').replace(')', '').replace('-', '').replace(' ', '');
    this.postalChannelService.PublishPostalEvent({
      topic: '',
      channel: 'CALL_DIAL_INTERNAL_METHOD',
      data: {
        phoneNo: this.dialerDetailsForm.controls.phoneNo.value, phoneNoToDial: phoneNumberToDial
        , dialCode: this.dialerDetailsForm.controls.countryCodeListDialer.value,
        endPointNumber: endPointNumber
      },
      envelope: ''
    });
    this.close();
  };


  dial() {
    const phoneNumberToDial = (this.dialerDetailsForm.value.countryCodeListDialer + this.dialerDetailsForm.value.phoneNo)
      .replace('(', '').replace(')', '').replace('-', '').replace(' ', '');
    this.postalChannelService.PublishPostalEvent({
      topic: '',
      channel: 'CALL_DIALMETHOD',
      data: {
        phoneNo: this.dialerDetailsForm.controls.phoneNo.value, phoneNoToDial: phoneNumberToDial
        , dialCode: this.dialerDetailsForm.controls.countryCodeListDialer.value
      },
      envelope: ''
    });
    this.close();
  }

  public isValidInput(event: any): boolean {
    if ((event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode === 8 || event.keyCode === 127 || event.keyCode === 13) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.dialerData.makeCall = (this.dialerService.makeCall) ? this.dialerService.makeCall : undefined;
    this.dialerData.isMute = (this.dialerService.isMute) ? this.dialerService.isMute : undefined;
    this.dialerData.isHoldShow = (this.dialerService.isHoldShow) ? this.dialerService.isHoldShow : undefined;
    this.dialerData.isResumeShow = (this.dialerService.isResumeShow) ? this.dialerService.isResumeShow : undefined;
    this.userDetails = this.userservice.getUserDetail();
    const countryDetailsData = this.systemConfig.getCountryDetail();
    this.countryDetails = [];
    for (const obj of countryDetailsData) {
      this.countryDetails.push({
        value: obj.dialCode.replace(/[^\w]/gi, '').trim(),
        dialCode: obj.dialCode, label: obj.countryName + ' ' + obj.dialCode, countryCode: obj.countryCode
      });
    }
    this.dialerDetails();
    this.getAllPilvoUserOnline();
  }

}
