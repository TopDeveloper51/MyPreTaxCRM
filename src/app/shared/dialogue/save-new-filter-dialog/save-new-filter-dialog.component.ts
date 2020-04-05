import { Component, OnInit , OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef , Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// Internal Imports
import { CDRService, CommonApiService} from '@app/shared/services';
import { MessageService } from '@app/shared/services/message.service';
import { APINAME } from "@app/activity/activity-constants";

@Component({
  selector: 'app-save-new-filter-dialog',
  templateUrl: './save-new-filter-dialog.component.html',
  styleUrls: ['./save-new-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveNewFilterDialogComponent implements OnInit, OnDestroy {

  //private data: any;
  @Input() data: any;
  public filterObj: any = { nameOfFilter: '' };
  public isApiCall: any;
  private currentTimeout: any;

  constructor(
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private commonApiService : CommonApiService,
    private messageService: MessageService,
    public modal: NgbActiveModal,
  ) { }


  close(): void {
    this.modal.close();
}

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof SaveNewFilterDialogComponent
   */
  // save filter with search criteria and type
  save(): void {
    if (this.data !== undefined && this.data.screen !== undefined && this.data.screen !== null && this.data.screen !== '') {
        const self = this;
        const type = this.data.screen;
        this.data.screen = undefined;
        // api call with type activity and search criteria from data
        const objectActivitySearchCriteria = { type: type, 'filterCriteria': this.data, 'filterName': this.filterObj.nameOfFilter, };
        this.isApiCall = true;
        this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_ACTIVITY_FILTER, parameterObject: objectActivitySearchCriteria }).then(response => {
            self.currentTimeout = setTimeout(() => {
                self.isApiCall = false;
                self.modal.close(true);
                self.messageService.showMessage('Filter added successfully', 'success');
            }, 300);
            this.cdrService.callDetectChanges(this.cdr);
        }, (error) => {
            this.isApiCall = false;
            this.cdrService.callDetectChanges(this.cdr);
        });
    }
};


  ngOnInit() {
    this.isApiCall = false;
    this.cdrService.callDetectChanges(this.cdr);
  }

  ngOnDestroy(): void {
    this.isApiCall = false;
    if (this.currentTimeout !== undefined) {
        this.currentTimeout = undefined;
    }
    this.cdr.detach();
}

}
