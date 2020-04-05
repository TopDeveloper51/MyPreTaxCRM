// Extrenal imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { AgGridModule } from 'ag-grid-angular';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TimepickerModule } from 'ngx-bootstrap';


// Internal imports
import { SharedModule } from '@app/shared/shared.module';
import { DTUGraphComponent } from '@app/time-accounting/components/dtu-graph/dtu-graph.component'
import { TimeAccountingManagementComponent } from '@app/time-accounting/time-accounting-management/time-accounting-management.component';
import { DailyRoutineOverviewDetailsComponent } from '@app/time-accounting/dialogs/daily-routine-overview-details/daily-routine-overview-details.component';
import { ReopenedHistoryComponent } from '@app/time-accounting/dialogs/reopened-history/reopened-history.component';
import { GraphInfoComponent } from '@app/time-accounting/components/graph-info/graph-info.component';
import { TimeAccountingRoutingModule } from '@app/time-accounting/time-accounting-routing.module';
import { TimeAccountingDetailsComponent } from '@app/time-accounting/components/time-accounting-details/time-accounting-details.component';
import { TimeAccountingSummaryComponent } from '@app/time-accounting/time-accounting-summary/time-accounting-summary.component';
import { DTUManagementComponent } from '@app/time-accounting/dtu-management/dtu-management.component';
import { BreakDetailComponent } from '@app/time-accounting/dialogs/break-detail/break-detail.component';

@NgModule({
  declarations: [
    DTUGraphComponent,
    TimeAccountingManagementComponent,
    DailyRoutineOverviewDetailsComponent,
    ReopenedHistoryComponent,
    GraphInfoComponent,
    TimeAccountingDetailsComponent,
    TimeAccountingSummaryComponent,
    DTUManagementComponent,
    BreakDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatDatepickerModule,
    Md2Module,
    DialogsModule,
    TimeAccountingRoutingModule,
    NoConflictStyleCompatibilityMode,
    TimepickerModule.forRoot(),
    AgGridModule.withComponents([]),

  ],
  entryComponents: [
    DailyRoutineOverviewDetailsComponent,
    ReopenedHistoryComponent, 
    BreakDetailComponent
  ],
  exports: [
    DailyRoutineOverviewDetailsComponent,
    ReopenedHistoryComponent,
    TimeAccountingDetailsComponent
  ]
})
export class TimeAccountingModule { }
