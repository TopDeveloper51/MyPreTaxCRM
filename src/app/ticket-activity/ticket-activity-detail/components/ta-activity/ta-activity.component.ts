// External Imports
import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Internal Imports
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { ActivityMailDetailComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-mail-detail/activity-mail-detail.component';
import { CDRService } from '@app/shared/services';

@Component({
  selector: 'mtpo-ta-activity',
  templateUrl: './ta-activity.component.html',
  styleUrls: ['./ta-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class TAActivityComponent implements OnInit, OnDestroy {

  @ViewChild(ActivityMailDetailComponent, { static: true })
  public ActivityMailDetailComponent: ActivityMailDetailComponent;

  @Input() windowId: string;
  @Input() modelData: any;
  @Input() activityData: any;
  @Output() customerTicketChange: EventEmitter<any> = new EventEmitter<any>();
  public lookup: any;
  public isViewMode: boolean;  // for handling view or edit mode when activity open in new tab 
  private subscription: Subscription;
  public showLoading: boolean;
  public activityTypeSelectedOption: string = 'in';
  public activityTypeSelectedKey: string = 'chat';
  public activityTypeSelectedMainType: string = 'email';
  public isDoNotCall: boolean = false;
  public activityAvailable: boolean = true;
  public count;

  constructor(private cdr: ChangeDetectorRef,
    private CDRService: CDRService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService
  ) { }

  setActivityType(event) {
    this.selectActivityType(event.screen, event.type, event.direction)
  }

  /**
   * This function is used when user select activity type
   */
  selectActivityType(screen: any, key: any, option: any): void {
    this.activityData.screen = screen;
    this.activityData.type = key;
    this.activityData.direction = option;

    // this condition will remove all validation  fire that are used  for email type
    if (key !== 'e-mail') {
      this.activityData.to = null;
      this.activityData.cc = null;
      this.activityData.bcc = null;
      this.ActivityMailDetailComponent.checkEmail('to');
      this.ActivityMailDetailComponent.checkEmail('cc');
      this.ActivityMailDetailComponent.checkEmail('bcc');
      this.ActivityMailDetailComponent.checkEmail('from');
    }

    if (this.activityTypeSelectedKey === 'phonecall' && this.activityTypeSelectedOption === 'out' && this.activityData != undefined && this.activityData.doNotCall === true) {
      this.isDoNotCall = true;
    } else {
      this.isDoNotCall = false;
    }

    if (key === 'meeting') {
      this.activityData.isShowSpecialTask = true;
    } else {
      this.activityData.isShowSpecialTask = false;
    }

    this.CDRService.callDetectChanges(this.cdr);
  }

  // call on customerTicketChange event
  emitCustomerTicketChange(data) {
    this.customerTicketChange.emit();
  }

  ngOnInit() {
    this.showLoading = true;

    this.subscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data
        if (this.activityData) {
          this.showLoading = false;
        }
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic === 'isViewMode') {
          this.isViewMode = msgObj.data;
        } else if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.showLoading = false;
        } else if (msgObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
        }
      } else if (!this.activityData) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          if (this.lookup) {
            this.showLoading = false;
          }
        }
      } else if (msgObj.topic === 'set-chat-dynamic-height') {
        this.count = msgObj.data;
      }

      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ngDoCheck() {
  //   console.log('TActCheck')
  // }


}
