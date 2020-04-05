// External imports
import { Component, OnInit , Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  @Input() data;
  public dialogData: any = {  title: 'Confirmation' , text: 'Are you sure ?'};
  constructor(public modal: NgbActiveModal) {
    this.dialogData = this.data;
  }

  ngOnInit() {
      if (this.data) {
        this.dialogData = this.data;
      }
  }
}
