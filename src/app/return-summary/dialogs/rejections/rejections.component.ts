// External imports 
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

// Internal imports
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CDRService } from '@app/shared/services';


@Component({
  selector: 'app-rejections',
  templateUrl: './rejections.component.html',
  styleUrls: ['./rejections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RejectionsComponent implements OnInit, OnDestroy {

  public data: any;
  public rejectionErrorList: any;

  constructor(public model: NgbActiveModal, private cdr: ChangeDetectorRef, private cdrService: CDRService) { }

  /**
   * @author Mansi Makwana
   * @createdDate 05-12-2019
   * @discription to close dialog
   * @memberOf RejectionsComponent
   */
  public close(): void {
    this.model.close(false);
  }

  ngOnInit() {
    this.rejectionErrorList = this.data.data;
    this.cdrService.callDetectChanges(this.cdr);
  }

  ngOnDestroy() {
    this.cdr.detach();
  }
}
