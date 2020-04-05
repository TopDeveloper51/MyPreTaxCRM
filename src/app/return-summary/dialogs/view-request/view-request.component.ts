// External imports 
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Internal imports
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CDRService } from '@app/shared/services';

@Component({
  selector: 'app-view-request',
  templateUrl: './view-request.component.html',
  styleUrls: ['./view-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewRequestComponent implements OnInit, OnDestroy {

  public ratio: any;
  public dataAvailable: boolean = true;
  public objectOfQuestionSet: any = {};
  constructor(public model: NgbActiveModal, private cdr: ChangeDetectorRef, private cdrService: CDRService) { }

  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription to close dialog
   * @memberOf ViewRequestComponent
   */
  public close(): void {
    this.model.close(false);
  }

  ngOnInit() {
    this.cdrService.callDetectChanges(this.cdr);
  }

  ngOnDestroy() {
    this.cdr.detach();
  }
}
