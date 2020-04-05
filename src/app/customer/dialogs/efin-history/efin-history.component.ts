import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-efin-history',
  templateUrl: './efin-history.component.html',
  styleUrls: ['./efin-history.component.scss']
})
export class EfinHistoryComponent implements OnInit {

   // hold passed by another component
   data: any;

   // hold history Object
   historyJson: any;

   // constructor for basic initialization
   constructor(public activeModal: NgbActiveModal) {        
   }

   // initilization
   ngOnInit(): void {
     
       this.historyJson = this.data.data.efinHistory;
   }

   // close dialog
   close(): void {
       this.activeModal.close(true);
   }

}
