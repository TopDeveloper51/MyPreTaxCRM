import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Internal imports
import { DialogService, MessageService, CommonApiService } from '@app/shared/services';
import { EfinHistoryComponent } from '@app/customer/dialogs/efin-history/efin-history.component';
import { APINAME } from '@app/customer/customer-constants';
declare var window: any;
declare var URL: any;

@Component({
  selector: 'app-efin-verification',
  templateUrl: './efin-verification.component.html',
  styleUrls: ['./efin-verification.component.scss']
})
export class EfinVerificationComponent implements OnInit {
  public EFINverificationForm: FormGroup;
  data: any;
  // hold whole office detail
  office: any = { foreignAddress: {}, usAddress: {} };
  responsiblePersonName: string;
  disUpdatedDate: string;
  disCreatedDate: string;

  isDocExist: boolean = false;
  isPDFtype: boolean = false;
  base64String: any;
  content: any;
  pdfMimeType: string = 'application/pdf,application/x-pdf,application/acrobat,applications/vnd.pdf,text/pdf,text/x-pdf';
  // hold lookupData
  lookupData: any = {
    statusList: [{ name: 'Active', id: 'active' }, { 'name': 'Inactive', id: 'inactive' }, { 'name': 'Other', id: 'other' }],
    verificationList: [{ name: 'Approve', id: 'approve' }, { 'name': 'Reject', id: 'reject' }]
  };

  constructor(private messageService: MessageService, private sanitizer: DomSanitizer, private dialogService: DialogService, private _commonAPIService: CommonApiService,
    public modal: NgbActiveModal, private fb: FormBuilder, ) { }
  /**
     *
     */
  private _arrayBufferToBase64(buffer: any): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };
  /**
     * This Function is used to call accept/reject function based on selected status
     */
  public verification(office: any): void {
    if (this.EFINverificationForm.controls.verification.value === 'approve') {
      this._aceeptEfin(office);

    } else if (this.EFINverificationForm.controls.verification.value === 'reject') {
      this._rejectEfin(office);
    }
  };
  /**
     * This Function is used to call accept efin api
     */
  private _aceeptEfin(office: any): void {
    const approveObject = {
      'efin': office.efin, 'locationId': office.locationId, 'efinRequest': this.EFINverificationForm.value,
      'masterLocationId': this.data.masterLocationId, 'efinId': this.data.efinId
    };
    this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_EFIN_APPROVE, parameterObject: approveObject }).then(response => {
      if (response.code === 2000) {
        this.messageService.showMessage('Status updated successfully', 'success');
      } else {
        this.messageService.showMessage('Error in updating Status', 'error');
      }
      this.modal.close(true);
    }, error => {
      this.messageService.showMessage('Error in updating Status', 'error');
      this.modal.close(true);
    });
  };

  /**
   * This Function is used to call reject efin api
   */
  private _rejectEfin(office: any): void {
    const rejectObject = {
      'efin': office.efin, 'locationId': office.locationId, 'efinRequest': this.EFINverificationForm.value,
      'masterLocationId': this.data.masterLocationId, 'efinId': this.data.efinId
    };
    this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_EFIN_REJECT, parameterObject: rejectObject }).then(response => {
      if (response.code === 2000) {
        this.messageService.showMessage('Status updated successfully', 'success');

      } else {
        this.messageService.showMessage('Error in updating Status', 'error');
      }
      this.modal.close(true);
    }, error => {
      this.messageService.showMessage('Error in updating Status', 'error');
      this.modal.close(true);
    });
  };

  /**
    * This Function is used to open Efin History Dialog
    */
  public openHistory(): void {
        this.dialogService.custom(EfinHistoryComponent, { 'data': { 'efinHistory': this.office.history } }, { keyboard: true, backdrop: 'static', size: 'lg' })
      .result.then((btn: any) => {
      });
  };

  /**
   * This function is used to get Efin data from api
   */
  private getEfinData(): void {
    // if location and masterLocationId is not undefined
    if (this.data.locationID !== undefined && this.data.masterLocationId !== undefined) {
      this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_EFIN_DATA, parameterObject: { 'masterLocationId': this.data.locationID, 'efinId': this.data.efinId, 'efin': this.data.efin } }).then(response => {
        this.office = response;

        console.log("this.office.history" + this.office.history);

        if (this.office.foreignAddress === undefined) {
          this.office.foreignAddress = {};
        }
        if (this.office.usAddress === undefined) {
          this.office.usAddress = {};
        }

        if (response.responsiblePersonName !== undefined) {
          this.responsiblePersonName = response.responsiblePersonName;
        }

        if (response.updatedDate !== undefined && response.updatedDate != null) {
          this.disUpdatedDate = moment(response.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
        }

        this.isDocExist = false;
        if (this.office !== undefined && this.office.doc !== undefined && this.office.doc.data !== undefined) {
          // check the type of document is pdf or image
          let array: any = this.pdfMimeType.split(',');
          if (array.includes(this.office.contentType)) {
            this.isDocExist = true;
            this.isPDFtype = true;
            // if data as pdf
            const byteArray = new Uint8Array(this.office.doc.data);
            const file = new Blob([byteArray], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            this.content = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL); // $sce.trustAsResourceUrl(fileURL);
          } else {
            this.isDocExist = true;
            this.isPDFtype = false;
            this.base64String = this._arrayBufferToBase64(this.office.doc.data);
          }
        }
      });
    } else {
      this.modal.close(true);
    }
  }

  // This function is used to enable/disable validators for conditional field.
  public enableDisableValidator() {
    this.EFINverificationForm.controls.efinLetterStatusOther.setValidators(null);
    this.EFINverificationForm.controls.efinLetterStatusOther.disable();
    this.EFINverificationForm.controls.statusAsOfDate.setValidators(null);
    this.EFINverificationForm.controls.rejectReason.setValidators(null);
    this.EFINverificationForm.controls.verification.valueChanges.subscribe((data) => {

      this.EFINverificationForm.controls.statusAsOfDate.setValidators(null);
      this.EFINverificationForm.controls.rejectReason.setValidators(null);

      if (this.EFINverificationForm.controls.verification.value === "approve") {
        this.EFINverificationForm.controls.statusAsOfDate.setValidators([Validators.required]);
        this.EFINverificationForm.controls.statusAsOfDate.updateValueAndValidity();
      }
      if (this.EFINverificationForm.controls.verification.value === "reject") {
        this.EFINverificationForm.controls.rejectReason.setValidators([Validators.required]);
        this.EFINverificationForm.controls.rejectReason.updateValueAndValidity();
      }
      this.EFINverificationForm.controls.rejectReason.updateValueAndValidity();
      this.EFINverificationForm.controls.statusAsOfDate.updateValueAndValidity();
    });

    this.EFINverificationForm.controls.efinLetterStatus.valueChanges.subscribe((data) => {

      this.EFINverificationForm.controls.efinLetterStatusOther.setValidators(null);
      this.EFINverificationForm.controls.efinLetterStatusOther.disable();
      if (this.EFINverificationForm.controls.efinLetterStatus.value === "other") {

        this.EFINverificationForm.controls.efinLetterStatusOther.setValidators([Validators.required]);
        this.EFINverificationForm.controls.efinLetterStatusOther.enable();
      }
    });

  }


  /**
   * createEFInUploadForm
   */
  public createEFInUploadForm() {
    this.EFINverificationForm = this.fb.group({
      verification: ["", Validators.required],
      efinLetterStatus: ["", Validators.required],
      efinLetterStatusOther: [""],
      statusAsOfDate: [""],
      generatedDate: [""],
      rejectReason: [""],
      approvalNote: [""]
    });
    this.enableDisableValidator();
  }

  /**
     * for initialization
     */
  ngOnInit(): void {
    this.createEFInUploadForm();
    this.getEfinData();
  };


}

