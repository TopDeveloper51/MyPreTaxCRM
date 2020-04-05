// External imports 
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

// Internal imports
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CDRService } from '@app/shared/services';



@Component({
  selector: 'app-bank-rejections',
  templateUrl: './bank-rejections.component.html',
  styleUrls: ['./bank-rejections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankRejectionsComponent implements OnInit, OnDestroy {

  public rejectionErrorList: any;
  public data: any;
  constructor(public model: NgbActiveModal, private cdr: ChangeDetectorRef, private cdrService: CDRService) { }

  /**
   * @author Mansi Makwana
   * @createdDate 05-12-2019
   * @discription to close dialog
   * @memberOf BankRejectionsComponent
   */
  public close(): void {
    this.model.close(false);
  }

  ngOnInit() {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.rejectionErrorList = this.data.data;
    this.cdrService.callDetectChanges(this.cdr);
  }

  ngOnDestroy() {
    this.cdr.detach();
  }

}
