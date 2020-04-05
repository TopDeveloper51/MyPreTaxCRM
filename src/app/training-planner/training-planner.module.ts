import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { AgGridModule } from 'ag-grid-angular';
import { TimepickerModule } from 'ngx-bootstrap';

import { TrainingPlannerRoutingModule } from '@app/training-planner/training-planner-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { DailyViewComponent, KeysPipe } from '@app/training-planner/daily-view/daily-view.component';
import { AssignTrainerComponent } from '@app/training-planner/dialogs/assign-trainer/assign-trainer.component';
import { CreateSlotComponent } from '@app/training-planner/dialogs/create-slot/create-slot.component';
import { WeeklyPlanComponent } from '@app/training-planner/dialogs/weekly-plan/weekly-plan.component';
import { TrainingPlannerTemplateComponent } from '@app/training-planner/dialogs/training-planner-template/training-planner-template.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [DailyViewComponent, KeysPipe, AssignTrainerComponent, CreateSlotComponent, WeeklyPlanComponent, TrainingPlannerTemplateComponent],
  imports: [
    CommonModule,
    SharedModule,
    TrainingPlannerRoutingModule,
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
  entryComponents: [TrainingPlannerTemplateComponent, CreateSlotComponent, AssignTrainerComponent, WeeklyPlanComponent]
})
export class TrainingPlannerModule { }
