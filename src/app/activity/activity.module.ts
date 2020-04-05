// External imports
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { TimepickerModule } from 'ngx-bootstrap';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { DialogsModule } from '@progress/kendo-angular-dialog';


// Internal imports
import { SharedModule } from '@app/shared/shared.module';
import { ActivityRoutingModule } from '@app/activity/activity-routing.module';
import { ActivitySearchComponent } from '@app/activity/activity-search/activity-search.component';
import { ActivityOrderComponent, CommaSeparatedNumber } from '@app/activity/activity-order/activity-order.component';
import { InternalMeetingComponent } from '@app/activity/internal-meeting/internal-meeting.component';
import { ReportsModule } from '@app/reports/reports.module';
import { TicketActivityModule } from '@app/ticket-activity/ticket-activity.module';
import { ActivityTicketComponent } from '@app/activity/dialog/activity-ticket/activity-ticket.component';


@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ActivityRoutingModule,
    SharedModule,
    ReportsModule,
    AgGridModule.withComponents([]),
    TimepickerModule.forRoot(),
    MatDatepickerModule,
    Md2Module,
    NoConflictStyleCompatibilityMode,
    DialogsModule,
    TicketActivityModule
  ],
  entryComponents: [
  ],
  declarations: [ActivitySearchComponent, ActivityOrderComponent, CommaSeparatedNumber, InternalMeetingComponent, ActivityTicketComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ActivityModule { }
