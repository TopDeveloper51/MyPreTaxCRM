// External imports
import { Component, OnInit , Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-notify-dialog',
  templateUrl: './notify-dialog.component.html',
  styleUrls: ['./notify-dialog.component.scss']
})
export class NotifyDialogComponent implements OnInit {

  @Input() data;
  public dialogData:any = {  title: 'Notification' , text: ''};
  constructor(public modal: NgbActiveModal) {
    this.dialogData = this.data;
  }

  ngOnInit() {
      if (this.data) {
        this.dialogData = this.data;
      }
  }

}
