import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-activity-new',
  templateUrl: './activity-new.component.html',
  styleUrls: ['./activity-new.component.scss']
})
export class ActivityNewComponent implements OnInit {

  constructor(
    public modal: NgbActiveModal,
  ) { }


  public createNewActivity(activityTypeSelectedKey: string, activityTypeSelectedOption: string, activityTypeSelectedMainType: string): void {
    // this.localStorageUtilityService.addToLocalStorage('customerID', this.data.customerId);
     let obj = { activityTypeSelectedKey: activityTypeSelectedKey, activityTypeSelectedOption: activityTypeSelectedOption, activityTypeSelectedMainType: activityTypeSelectedMainType }
     this.modal.close(obj);
   };

  ngOnInit() {
  }

}
