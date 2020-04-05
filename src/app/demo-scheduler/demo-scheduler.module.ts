// External Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { AgGridModule } from 'ag-grid-angular';
import { TimepickerModule } from 'ngx-bootstrap';

//  Internal Imports
import { DemoSchedulerRoutingModule } from '@app/demo-scheduler/demo-scheduler-routing';
import { SharedModule } from '@app/shared/shared.module';
import { DemoSchedulerComponent,KeysPipe } from '@app/demo-scheduler/demo-scheduler/demo-scheduler.component';
import { DemoSchAssignTrainnerComponent } from '@app/demo-scheduler/dialogs/demo-sch-assign-trainner/demo-sch-assign-trainner.component';
import { DemoSchCreateSlotComponent } from '@app/demo-scheduler/dialogs/demo-sch-create-slot/demo-sch-create-slot.component';
import { DemoSchWeeklyPlanComponent } from '@app/demo-scheduler/dialogs/demo-sch-weekly-plan/demo-sch-weekly-plan.component';
import { DemoSchTrainingPlannerTemplateComponent } from '@app/demo-scheduler/dialogs/demo-sch-training-planner-template/demo-sch-training-planner-template.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DemoSchedulerHistoryComponent } from './dialogs/demo-scheduler-history/demo-scheduler-history.component';

@NgModule({
  declarations: [DemoSchedulerComponent,
    KeysPipe,
    DemoSchAssignTrainnerComponent,
    DemoSchCreateSlotComponent,
    DemoSchWeeklyPlanComponent,
    DemoSchedulerHistoryComponent,
    DemoSchTrainingPlannerTemplateComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DemoSchedulerRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    Md2Module,
    NoConflictStyleCompatibilityMode,
    AgGridModule,
    TimepickerModule.forRoot(),
    NgbModule
  ],
  exports: [TimepickerModule],
  entryComponents: [
    DemoSchAssignTrainnerComponent,
    DemoSchCreateSlotComponent,
    DemoSchWeeklyPlanComponent,
    DemoSchedulerHistoryComponent,
    DemoSchTrainingPlannerTemplateComponent]
})
export class DemoSchedulerModule { }
