// Internal imports
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-training-planner-template',
  templateUrl: './training-planner-template.component.html',
  styleUrls: ['./training-planner-template.component.scss']
})
export class TrainingPlannerTemplateComponent implements OnInit {

  constructor(public modal: NgbActiveModal) { }

  public data: any = {}

  /**
   * @author Mansi Makwana
   * @createdDate 28-11-2019
   * @discription to close dialog
   * @memberOf TrainingPlannerTemplateComponent
   */
  close(): void {
    this.modal.close();
  }

  ngOnInit() {
    this.data = this.data.data;
  }

}
