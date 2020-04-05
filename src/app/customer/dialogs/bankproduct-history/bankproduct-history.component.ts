// External imports
import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Internal imports
import { CommonApiService, MessageService, CDRService } from '@app/shared/services';
import { APINAME } from '@app/customer/customer-constants';
import * as moment from 'moment-timezone';

@Component({
  selector: 'customer-bankproduct-history',
  templateUrl: './bankproduct-history.component.html',
  styleUrls: ['./bankproduct-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class BankproductHistoryComponent implements OnInit {

  @Input() data: any;
  public bpHistoryForm: FormGroup;
  public maxDate: Date;
  public lookup: any = {
    sources: [],
    bankData: [],
    year: [{ id: '2015', name: '2015' }, { id: '2016', name: '2016' }, { id: '2017', name: '2017' },{ id: '2018', name: '2018' }, { id: '2019', name: '2019' }]
  }

  constructor(
    private commonApiService: CommonApiService,
    private messageService: MessageService,
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
  ) { }


  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
   * @param {*} multipleSelectfor
   * @memberof BankproductHistoryComponent
   */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "bank":
        selected = [];
        selected = this.lookup.bankData.map(
          item => item.id
        );
        this.bpHistoryForm.get("bank").patchValue(selected);
        break;
    }
  }

  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
   * @param {*} clearSelectfor
   * @memberof BankproductHistoryComponent
   */
  public onClearAll(clearSelectfor) {
    this.bpHistoryForm.get(clearSelectfor).patchValue([]);
  }


  //
  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
	 * @description msg display on isHeader selection
   * @memberof BankproductHistoryComponent
   */
  public displayMessage(): void {
    if (this.bpHistoryForm.controls['isHeader'].value == true) {
      this.messageService.showMessage('The record you are adding will be set as the new Bank Product Header', 'info')
    }
  }

  // blank value of Volume
  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
	 * @description enable / disable volume based on isUnknownVolume value
   * @memberof BankproductHistoryComponent
   */
  public blankVolume(): any {
    if (this.bpHistoryForm.value !== undefined && this.bpHistoryForm.value.isUnknownVolume !== undefined) {
      if (this.bpHistoryForm.value.isUnknownVolume) {
        this.bpHistoryForm.controls['volume'].setValue(undefined);
        this.bpHistoryForm.controls['volume'].disable();
      } else {
        this.bpHistoryForm.controls['volume'].enable();
      }
      this.CDRService.callDetectChanges(this.cdr);
    }
  }

  public onDateChange() {
    setTimeout(() => {
      this.CDRService.callDetectChanges(this.cdr);
    }, 100);
  }

  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
	 * @description save bank details
   * @memberof BankproductHistoryComponent
   */
  public saveNewBPHistoryDetails() {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_BP_HISTORY, parameterObject: this.bpHistoryForm.value }).then(response => {
      this.modal.close('YES');
      this.messageService.showMessage('Bank Product history saved successfully', 'success');
    });
  };
  public close() {
    this.modal.close();
    }
  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
   * @memberof BankproductHistoryComponent
   */
  initBPHistoryForm() {
    this.bpHistoryForm = this.fb.group({
      year: [null, Validators.required],
      bank: [null],
      volume: [null, Validators.required],
      isUnknownVolume: false,
      date: ['', Validators.required],
      source: [null, Validators.required],
      isHeader: false,
      customerId: this.data.customerId,
    })
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
	 * @description get bank lookup details
   * @memberof BankproductHistoryComponent
   */
  public getLookupForbankList() {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_BANK_LIST,isCachable:true }).then(response => {
      this.lookup.bankData = response;
      for (const obj of this.lookup.bankData) {
        obj.name = obj.value;
      }
    });
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
	 * @author Dhruvi Shah
	 * @date 23-12-2019
   * @memberof BankproductHistoryComponent
   */
  ngOnInit() {
    //
    this.initBPHistoryForm();
    //
    this.maxDate = new Date();
    //
    this.getLookupForbankList();
    //
    this.lookup.sources = this.data.lookupForBPIdentificationSource.filter(t => t.isAllowedForManualEntry === true);

    this.CDRService.callDetectChanges(this.cdr);
  }




}
