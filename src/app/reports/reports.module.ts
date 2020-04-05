import { NgModule , NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { AgGridModule } from 'ag-grid-angular';
import { DialogsModule } from '@progress/kendo-angular-dialog';

import { ReportsRoutingModule } from '@app/reports/reports-routing.module';
import { BreakReasonSearchComponent } from '@app/reports/break-reason-search/break-reason-search.component';
import { SharedModule } from '@app/shared/shared.module';
import { CalendarComponent } from '@app/reports/calendar/calendar.component';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { ActivitySummaryComponent } from '@app/reports/activity-summary/activity-summary.component';
import { OrderOverviewComponent } from './order-overview/order-overview.component';
import { BarGraphComponent } from './components/bar-graph/bar-graph.component';

@NgModule({
  declarations: [BreakReasonSearchComponent, CalendarComponent, ActivitySummaryComponent, OrderOverviewComponent, BarGraphComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SchedulerModule,
    ReportsRoutingModule,
    MatDatepickerModule,
    Md2Module,
    DialogsModule,
    NoConflictStyleCompatibilityMode,
    AgGridModule.withComponents([]),

  ],
  exports: [
    BreakReasonSearchComponent
  ],
  schemas:[NO_ERRORS_SCHEMA]
})
export class ReportsModule { }
