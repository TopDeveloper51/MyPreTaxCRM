// Internal imports
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-activity-call-hangup',
  templateUrl: './activity-call-hangup.component.html',
  styleUrls: ['./activity-call-hangup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivityCallHangupComponent implements OnInit {

  constructor(private modal: NgbActiveModal,
    private cdr: ChangeDetectorRef) { }

  /**
* @author Satyam Jasoliya
* @createdDate 25/11/2019
* @discription confirm 
* @memberof ActivityCallHangup
*/
  public confirm(selectedOption: any): void {
    if (selectedOption !== undefined) {
      this.modal.close(selectedOption);
    }
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 25/11/2019
  * @discription close dialog 
  * @memberof ActivityCallHangup
  */
  close(): void {
    this.modal.close();
    this.cdr.detach();
  }
  ngOnInit() {
  }

}
