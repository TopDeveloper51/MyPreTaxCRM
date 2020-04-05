/** External import */
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
/** Internal import */

@Component({
  selector: 'app-message-history',
  templateUrl: './message-history.component.html',
  styleUrls: ['./message-history.component.scss']
})
export class MessageHistoryComponent implements OnInit {
  data: any;
  constructor(
    private activeModal: NgbActiveModal
  ) { }

  /** Close dialog */
  close() { this.activeModal.close(); }

  ngOnInit() {
    console.log(this.data);
  }

}
