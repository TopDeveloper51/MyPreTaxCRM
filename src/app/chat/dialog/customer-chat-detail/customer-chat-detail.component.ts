import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: 'app-customer-chat-detail',
  templateUrl: './customer-chat-detail.component.html',
  styleUrls: ['./customer-chat-detail.component.scss']
})
export class CustomerChatDetailComponent implements OnInit {
  @Input() data:any;
  constructor(private activeModal: NgbActiveModal) { }
  close() { this.activeModal.close(); }
  ngOnInit(): void {
    
  }

}
