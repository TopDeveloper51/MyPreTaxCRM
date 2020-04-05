import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { AssessmentRoutingModule } from '@app/assessment/assessment-routing.module';
import { EditExpertiseComponent } from '@app/assessment/dialogs/edit-expertise/edit-expertise.component';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [EditExpertiseComponent],
  imports: [
    CommonModule,
    AssessmentRoutingModule,
    SharedModule,
    NgbModule,
    TreeViewModule
  ],
  entryComponents: [
    EditExpertiseComponent
  ]
})
export class AssessmentModule { }
