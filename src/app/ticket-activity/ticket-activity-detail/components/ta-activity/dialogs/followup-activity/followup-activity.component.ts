import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'mtpo-followup-activity',
  templateUrl: './followup-activity.component.html',
  styleUrls: ['./followup-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FollowupActivityComponent implements OnInit {

  constructor(private modal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private router: Router) { }

  public createNewFollowUpActivity(action: string) {
    this.modal.close(action);
    // if (action === 'Email') {
    //   this.router.navigateByUrl('/activity');
    //   this.modal.close();
    // } else if (action === 'Phone Call') {
    //   this.router.navigateByUrl('/contact');
    //   this.modal.close();
    // } else if (action === 'Visit') {
    //   this.router.navigateByUrl('/contact');
    //   this.modal.close();
    // }
  }
  
  /**
      * @author Satyam Jasoliya
      * @createdDate 12/11/2019
      * @description close dialog
      * @memberof ActivityHistoryComponent
      */
  close(): void {
    this.modal.close();
    this.cdr.detach();
  }
  ngOnInit() {
  }

}
