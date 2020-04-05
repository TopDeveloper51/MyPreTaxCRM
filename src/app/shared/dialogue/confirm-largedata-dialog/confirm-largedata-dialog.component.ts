import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivitySearchService } from '@app/activity/activity-search/activity-search.service';

@Component({
  selector: 'app-confirm-largedata-dialog',
  templateUrl: './confirm-largedata-dialog.component.html',
  styleUrls: ['./confirm-largedata-dialog.component.scss']
})
export class ConfirmLargedataDialogComponent implements OnInit {

  public data: any;
  public activitySearch: any;
  public returnFullResult: boolean;
  public counter: any;
  public resultLength: any;
  public screen: any;
  public isEFINSearch: any;
  public TopEFIN: any;

  constructor(private modal: NgbActiveModal) { }

  /**
   * @author shreya kanani
   * @description this method close the dialog
   * @createdDate 11/02/2020
   */

  close() {
    this.modal.close();
  }

  /**
   * @author shreya kanani
   * @description this method fetch all data from api
   * @createdDate 11/02/2020
   */

  public fetchAllRecord() {
    this.returnFullResult = true;
    let data = this.activitySearch;
    data.returnFullResult = this.returnFullResult;
    if (this.screen == "customersearch") {
      data.isEFINSearch = this.isEFINSearch;
      data.TopEFIN = this.TopEFIN;
    }
    this.modal.close(data);
  }

  /**
   * @author shreya kanani
   * @description this method fetch first few data from api
   * @createdDate 11/02/2020
   */

  public fetchFirstRecord() {
    this.returnFullResult = false;
    let data = this.activitySearch;
    data.returnFullResult = this.returnFullResult;
    if (this.screen == "customersearch") {
      data.isEFINSearch = this.isEFINSearch;
      data.TopEFIN = this.TopEFIN;
    }
    this.modal.close(data);
  }

  ngOnInit() {
    this.activitySearch = this.data.searchdata;
    this.counter = this.data.counter;
    this.resultLength = this.data.resultLength;
    this.screen = this.data.screen;
    this.isEFINSearch = this.data.isEFINSearch;
    this.TopEFIN = this.data.TopEFIN;
  }

}
