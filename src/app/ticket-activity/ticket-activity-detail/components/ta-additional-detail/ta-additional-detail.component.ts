// External imports
import { Component, OnInit, Output, ViewChild, OnDestroy, EventEmitter, ChangeDetectorRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Internal imports
import { ActivityBpVolumeComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-bp-volume/activity-bp-volume.component';
import { ActivityOrderRefundComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-order-refund/activity-order-refund.component';
import { ActivitySpecialTaskComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-special-task/activity-special-task.component';
import { ActivityDocumentUploadComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-document-upload/activity-document-upload.component';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service'
import { CDRService } from '@app/shared/services/cdr.service';
import { MessageService } from "@app/shared/services";

@Component({
  selector: 'mtpo-ta-additional-detail',
  templateUrl: './ta-additional-detail.component.html',
  styleUrls: ['./ta-additional-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TAAdditionalDetailComponent implements OnInit, OnDestroy {

  @Input() modelData: any;
  public lookup: any;
  public activityData: any = { tagList: '' };
  private subscription: Subscription;
  public source: Array<string> = ['Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan'];
  public data: Array<string>;
  public value: any = ['Baseball']
  public isBPVolumeAddedNew: boolean = false;
  public customerInfo: any;
  public isViewMode: boolean; // for handling view or edit mode when activity open in new tab
  public showLoading: boolean;
  public activityAvailable: boolean = true;
  public ticketTypeFeildsCount: number = 0; // to store count of ticket type feilds and set height according to this count
  public dynamicHeight: number = 0;
  public activityEditorSection: number = 0;
  public kendoChatHeight: number = 0;
  @Output() activityDataChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeTag: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(ActivitySpecialTaskComponent, { static: false }) activitySpecialTaskForm: ActivitySpecialTaskComponent;
  @ViewChild(ActivityBpVolumeComponent, { static: false }) activityBPForm: ActivityBpVolumeComponent;
  @ViewChild(ActivityOrderRefundComponent, { static: false }) activityOrderRefundForm: ActivityOrderRefundComponent;
  @ViewChild(ActivityDocumentUploadComponent, { static: false }) activityDocumentUpload: ActivityDocumentUploadComponent;

  public isShowOrderDetails: boolean = false;
  public isShowBankDetails: boolean = false;
  public isShowSpacialTask: boolean = false;
 

  constructor(
    private ticketActivityDetailService: TicketActivityDetailService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService) { }


  // call on tag change event
  changeTagValue(value, from?: any) {

    let deletedTagData = [];
    this.activityData.tempTagList = JSON.parse(JSON.stringify(this.activityData.tagList));

    if (this.activityData.tempTagList != undefined && this.activityData.tempTagList.length > 0) {
      for (let i = 0; i < this.activityData.tempTagList.length; i++) {
        const currentTagDataIndex = value.findIndex(t => t.id === this.activityData.tempTagList[i].id);
        if (currentTagDataIndex !== -1) {
        }
        else {
          deletedTagData.push(this.activityData.tempTagList[i]);
        }
      }

    }
    if (deletedTagData.length > 0) {
      this.ticketActivityDetailService.deleteTag({ parameterObject: { "tagList": deletedTagData } }).then((response: any) => {
        if (response !== undefined && response.length > 0) {
          let stringMsg = [];
          let newTagArray = JSON.parse(JSON.stringify(value));
          for (let i = 0; i < response.length; i++) {
            stringMsg.push(response[i].name);
            newTagArray.push(response[i]);
          }
          // let messageString = "You don't have rights to delete " + stringMsg.join() + " tag(s)";
          this.messageService.showMessage("'You don't have rights to delete'" + stringMsg.join() + "tag(s)", 'error');
          this.activityData.tagList = JSON.parse(JSON.stringify(newTagArray));
          value = JSON.parse(JSON.stringify(newTagArray));
          this.setIsOrderDetailsShowOrNot(value, from);
        } else {
          this.setIsOrderDetailsShowOrNot(value, from);
        }
      }, error => {
        this.setIsOrderDetailsShowOrNot(value, from);
        console.error(error);
      });
    } else {
      this.setIsOrderDetailsShowOrNot(value, from);
    }

  }

  // set content to show based on id of selected tag
  setIsOrderDetailsShowOrNot(value, from?) {

    if (this.activityData.orderDetails === undefined || Object.keys(this.activityData.orderDetails).length === 0) {
      this.activityData.orderDetails = {};
      this.activityData.isShowOrderDetails = false;
    } else {
      this.activityData.orderDetails = this.activityData.orderDetails;
      this.activityData.isShowOrderDetails = true;
    }
    if (this.activityData.BPVolumeDetails === undefined || Object.keys(this.activityData.BPVolumeDetails).length === 0) {
      this.activityData.BPVolumeDetails = {};
      this.activityData.isShowBankDetails = false;
      this.activityData.bpvolume = true; // used to check whether bpvolume is added or not
      // if (this.customerInfo.NoBP) {
      //   this.activityData.BPVolumeDetails.NoBP = true;
      // }
    } else {
      this.activityData.BPVolumeDetails = this.activityData.BPVolumeDetails;
      this.activityData.isShowBankDetails = true;
    }
    if (this.activityData.timePeriod === undefined || Object.keys(this.activityData.timePeriod).length === 0) {
      this.activityData.timePeriod = {};
      this.activityData.isShowSpecialTask = false;
    } else {
      this.activityData.timePeriod = this.activityData.timePeriod;
      this.activityData.isShowSpecialTask = true;
    }

    if (from === undefined) {
      if (value !== undefined && value.length > 0) {
        const tagListIndexForOrder = value.findIndex(t => t.id === '1');
        const tagListIndexForRefundRequest = value.findIndex(t => t.id === 5);
        const tagListIndexForBank = value.findIndex(t => t.id === 6);
        const systemIssue = value.findIndex(t => t.group === 'SystemIssue');
        if (systemIssue !== -1) {
          this.activityData.isShowSpecialTask = true;
        } else {
          this.activityData.isShowSpecialTask = false;
          this.activityData.timePeriod = {};
        }
        if (tagListIndexForBank !== -1) {
          this.activityData.isShowBankDetails = true;
        } else {
          this.activityData.BPVolumeDetails = {};
          this.activityData.isShowBankDetails = false;
          this.activityData.bpvolume = true; // used to check whether bpvolume is added or not
          // if (this.customerInfo.NoBP) {
          //   this.activityData.BPVolumeDetails.NoBP = true;
          // }
        }

        if (tagListIndexForOrder !== -1 || tagListIndexForRefundRequest !== -1) {
          this.activityData.isShowOrderDetails = true;
          if (tagListIndexForOrder > -1 && tagListIndexForRefundRequest > -1) {
            this.activityData.orderDetails.orderPrice = undefined;
          } else if (tagListIndexForOrder > -1) {
            this.activityData.orderDetails.orderPrice = Math.abs(this.activityData.orderDetails.orderPrice);
          } else if (tagListIndexForRefundRequest > -1) {
            this.activityData.orderDetails.orderPrice = -Math.abs(this.activityData.orderDetails.orderPrice);
          }
        }
        else {
          this.activityData.orderDetails = {};
          this.activityData.isShowOrderDetails = false;
        }
      }

      else {
        this.activityData.isShowSpecialTask = false;
        this.activityData.timePeriod = {};
        this.activityData.BPVolumeDetails = {};
        // if (this.customerInfo.NoBP) {
        //   this.activityData.BPVolumeDetails.NoBP = true;
        // }
        this.activityData.isShowBankDetails = false;
        this.activityData.orderDetails = {};
        this.activityData.isShowOrderDetails = false;
        this.activityData.bpvolume = undefined;
      }
    }

  }


  public removeTag(event) {

    let values = JSON.parse(JSON.stringify(event));
    if (values.dataItem.name === 'Order' || values.dataItem.name === 'RefundRequest') {
      this.isShowOrderDetails = false;
      this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowOrderDetails', topic: 'isShowOrderDetails', data: this.isShowOrderDetails, id: this.modelData.id });
    }
    else if (values.dataItem.name === 'BPVolume') {
      this.isShowBankDetails = false;
      this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowBankDetails', topic: 'isShowBankDetails', data: this.isShowBankDetails, id: this.modelData.id });
    }
    else if (values.dataItem.name === 'SIHeadset' || values.dataItem.name === 'SICRM' ||
      values.dataItem.name === 'SIDialer' || values.dataItem.name === 'SIInternet' || values.dataItem.name === 'SIComputer') {
      this.isShowSpacialTask = false;
      this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowSpacialTask', topic: 'isShowSpacialTask', data: this.isShowSpacialTask, id: this.modelData.id });
    }

    let isOrderTag;
    let isBPVolumeTag;
    let isBPVolumeTagIndex;
    if (event.dataItem.id == 1) {
      isOrderTag = true;
    } else {
      isOrderTag = false;
    }

    if (event.dataItem.id == 6) {
      isBPVolumeTag = true;
      isBPVolumeTagIndex = this.activityData.tagList.findIndex(t => t.id == 6)
      if (this.activityData.tagList[isBPVolumeTagIndex].isNewlyAdded) {
        this.isBPVolumeAddedNew = true;
      } else {
        this.isBPVolumeAddedNew = false;
      }
    } else {
      isBPVolumeTag = false;
    }

    const index = this.activityData.tagList.findIndex(t => t.id == event.dataItem.id);
    if (index > -1 && (!isBPVolumeTag || (isBPVolumeTag && !this.isBPVolumeAddedNew && (this.activityData.tagList.findIndex(t => t.id == 1 && t.isNewlyAdded) > -1 ? this.activityData.orderDetails.saleType !== 1 && this.activityData.orderDetails.saleType !== 4 : true)))) {
      this.activityData.tagList.splice(index, 1);
      if (isOrderTag) {
        isBPVolumeTagIndex = this.activityData.tagList.findIndex(t => t.id == 6 && t.isNewlyAdded == true)
        if (isBPVolumeTagIndex > -1) {
          this.activityData.tagList.splice(isBPVolumeTagIndex, 1);
        }
      }
      this.changeTag.emit(this.activityData.tagList);
    } else {
      event.preventDefault();
    }
  }

  /**
    * This function is called on TagList value change
    */
  public valueChangeofTag(event: any): void {
    // Event Emit
    let values = JSON.parse(JSON.stringify(event));

    if (values && values.length > 0) {
      const isOrderTagIndex = values.forEach((t) => {
        if (t.name === 'Order' || t.name === 'RefundRequest') {
          this.isShowOrderDetails = true;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowOrderDetails', topic: 'isShowOrderDetails', data: this.isShowOrderDetails, id: this.modelData.id });
        } else if (t.name === 'BPVolume') {
          this.isShowBankDetails = true;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowBankDetails', topic: 'isShowBankDetails', data: this.isShowBankDetails, id: this.modelData.id });
        } else if (t.name === 'SIHeadset' || t.name === 'SICRM' ||
          t.name === 'SIDialer' || t.name === 'SIInternet' || t.name === 'SIComputer') {
          this.isShowSpacialTask = true;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowSpacialTask', topic: 'isShowSpacialTask', data: this.isShowSpacialTask, id: this.modelData.id });
        }
      });


      //   if (isOrderTagIndex > -1) {
      //     Object.assign(values[isOrderTagIndex], { isNewlyAdded: true });
      //   }
      // }
      // this.activityData.tagList = JSON.parse(JSON.stringify(values));
      // this.changeTag.emit(values);
    }
  }

  GetActivityDetail(): void {
    if (this.activityData.tagList !== undefined) {
      this.activityData.tempTagList = JSON.parse(JSON.stringify(this.activityData.tagList));
    }
    else {
      this.activityData.tempTagList = undefined;
      this.activityData.tagList = [];
      this.isShowOrderDetails = false;
      this.isShowOrderDetails = false;
    }
    if (this.activityData.tagList !== undefined && this.activityData.tagList.length > 0) {
      let tagListIndexForOrder;
      let tagListIndexForRefundRequest;
      let tagListIndexForBank;
      let systemIssue;
      this.activityData.tagList.forEach((item) => {
        tagListIndexForOrder = this.activityData.tagList.findIndex(x => x.id === 1);
        tagListIndexForRefundRequest = this.activityData.tagList.findIndex(x => x.id === 5);
        tagListIndexForBank = this.activityData.tagList.findIndex(x => x.id === 6);
        systemIssue = this.activityData.tagList.findIndex(x => x.group === 'SystemIssue');
      });

      if (systemIssue !== -1) {
        this.isShowSpacialTask = true;
      } else {
        this.isShowSpacialTask = false;
      }
      if (tagListIndexForBank !== -1) {
        this.isShowBankDetails = true;
      } else {
        this.isShowBankDetails = false;
      }
      if (tagListIndexForOrder !== -1 || tagListIndexForRefundRequest !== -1) {
        this.isShowOrderDetails = true;
      } else {
        this.isShowOrderDetails = false;
      }
    } else {
      this.isShowSpacialTask = false;
      this.isShowBankDetails = false;
      this.isShowOrderDetails = false;
    }

    if (this.activityData.orderDetails != undefined) {
      this.activityData.orderDetails = this.activityData.orderDetails;
    }
    else {
      this.activityData.orderDetails = {};
    }
    if (this.activityData.BPVolumeDetails !== undefined) {
      this.activityData.BPVolumeDetails = this.activityData.BPVolumeDetails;
      if (this.activityData.BPVolumeDetails.volume !== undefined && this.activityData.BPVolumeDetails.volume === 'unknown') {
        this.activityData.BPVolumeDetails.unknown = true;
      }
    } else {
      this.activityData.BPVolumeDetails = {};
      this.activityData.BPVolumeDetails.year = '2018';
    }
    if (this.activityData.timePeriod !== undefined) {
      this.activityData.timePeriod = this.activityData.timePeriod;
    } else {
      this.activityData.timePeriod = {};
    }
    this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowOrderDetails', topic: 'isShowOrderDetails', data: this.isShowOrderDetails, id: this.modelData.id });
    this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowBankDetails', topic: 'isShowBankDetails', data: this.isShowBankDetails, id: this.modelData.id });
    this.ticketActivityIntegrityService.sendMessage({ channel: 'isShowSpacialTask', topic: 'isShowSpacialTask', data: this.isShowSpacialTask, id: this.modelData.id });

  }

  // ngAfterViewInit()
  // {
  //   this.subscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
  //     if (msgObj.topic === 'ticket-type-feilds-count') {
  //       this.ticketTypeFeildsCount = msgObj.data;
  //       if (this.ticketTypeFeildsCount >= 26) {  // this 26 is number of typefeilds 
  //         this.dynamicHeight = 65;
  //       } else {
  //         setTimeout(()=>{
  //           const height = document.getElementById('taTicketHeight').offsetHeight;
  //           const activityHeight = document.getElementById('activtiyHeight').offsetHeight;
  //           this.dynamicHeight = 846 - height;
  //           this.activityEditorSection = 846 - activityHeight;
  //           this.kendoChatHeight = this.activityEditorSection - 166;
  //         },1000);
  //       }
  //       this.ticketActivityIntegrityService.sendMessage({ channel: 'set-dynamic-height1', topic: 'set-dynamic-height', data: this.dynamicHeight, id: this.modelData.id });
  //       this.ticketActivityIntegrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data: this.activityEditorSection, id: this.modelData.id });
  //       this.ticketActivityIntegrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: this.kendoChatHeight, id: this.modelData.id });
  //     } 
  //   });
  // }

  ngOnInit() {
    this.showLoading = true;
    this.subscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
        this.showLoading = false;
        this.lookup.activityTagList = msgObj.data.activityTagList;
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.GetActivityDetail();
        } else if (msgObj.topic === 'isViewMode') {
          this.isViewMode = msgObj.data;
        } else if (msgObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
        }
        else if (msgObj.topic === 'ticket-type-feilds-count') {
          this.ticketTypeFeildsCount = msgObj.data;
          if (this.ticketTypeFeildsCount >= 26) {  // this 26 is number of typefeilds 
            this.dynamicHeight = 65;
          } else {
              const height = document.getElementById('taTicketHeight').offsetHeight;
              this.dynamicHeight = 846 - height;
              // const activityHeight = document.getElementById('activtiyHeight').offsetHeight;
              // this.activityEditorSection = 846 - activityHeight;
              // this.kendoChatHeight = this.activityEditorSection - 166;
          }
          this.ticketActivityIntegrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: this.dynamicHeight, id: this.modelData.id });
          // this.ticketActivityIntegrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data: this.activityEditorSection, id: this.modelData.id });
          // this.ticketActivityIntegrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: this.kendoChatHeight, id: this.modelData.id });
        } 
        else {
          // this.showLoading = false;  
        }
      } else if (!this.activityData) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.GetActivityDetail();
        }
      }
      
      this.cdr.detectChanges();
    });

  }

  
  ngOnChanges() {
    if (this.activityData && this.activityData.tagList !== undefined) {
      this.activityData.tagList = this.activityData.tagList;
      this.changeTagValue(this.activityData.tagList, "centricActivity");
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
