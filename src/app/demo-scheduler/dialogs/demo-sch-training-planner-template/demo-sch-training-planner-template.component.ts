// Internal imports
import { Component, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-demo-sch-training-planner-template',
  templateUrl: './demo-sch-training-planner-template.component.html',
  styleUrls: ['./demo-sch-training-planner-template.component.scss']
})
export class DemoSchTrainingPlannerTemplateComponent implements OnInit {

  constructor(public modal: NgbActiveModal) { }

  public data: any = {}

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to close dialog
   * @memberOf DemoSchTrainingPlannerTemplateComponent
   */
  close(): void {
    this.modal.close();
  }

  ngOnInit() {
    this.data = this.data.data;
  }

}

