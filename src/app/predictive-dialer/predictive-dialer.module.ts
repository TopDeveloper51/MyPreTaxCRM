// External Imports
import { NgModule } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
// Internal Imports
import { SharedModule } from '@app/shared/shared.module';
import { DemoSchedulerModule } from '@app/demo-scheduler/demo-scheduler.module';
import { PredictiveDialerViewComponent, KeysPipe } from '@app/predictive-dialer/predictive-dialer-view/predictive-dialer-view.component';
import { PredictiveDialerSessionComponent } from '@app/predictive-dialer/predictive-dialer-session/predictive-dialer-session.component';
import { PredictiveDialerManageComponent } from '@app/predictive-dialer/predictive-dialer-manage/predictive-dialer-manage.component';
import { FurtherInfoComponent } from '@app/predictive-dialer/dialogs/further-info/further-info.component';
import { PredictiveDialerListComponent } from '@app/predictive-dialer/dialogs/predictive-dialer-list/predictive-dialer-list.component';
import { NewDialerSessionComponent } from '@app/predictive-dialer/dialogs/new-dialer-session/new-dialer-session.component';
import { PredictiveDialerRoutingModule } from '@app/predictive-dialer/predictive-dialer-routing.module';
import { PredictiveDialerInformationComponent } from '@app/predictive-dialer/predictive-dialer-information/predictive-dialer-information.component';
import { PredictiveDialerCallInputComponent } from '@app/predictive-dialer/predictive-dialer-call-input/predictive-dialer-call-input.component';
import { PdAppointmentComponent } from '@app/predictive-dialer/pd-appointment/pd-appointment.component';
import { PdFollowupMonthYearComponent } from '@app/predictive-dialer/pd-followup-month-year/pd-followup-month-year.component';
import { PlivoActionComponent } from '@app/predictive-dialer/plivo-action/plivo-action.component';
import { ActionNotReachedComponent } from '@app/predictive-dialer/action-not-reached/action-not-reached.component';
import { ActionReachedComponent } from '@app/predictive-dialer/action-reached/action-reached.component';
import { FurtherActionComponent } from '@app/predictive-dialer/further-action/further-action.component';
import { PredictiveDialerStatisticsComponent } from '@app/predictive-dialer/predictive-dialer-statistics/predictive-dialer-statistics.component'; 
import { LayoutModule } from '@app/layout/layout.module';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
@NgModule({
    imports: [
        PredictiveDialerRoutingModule,
        SharedModule,
        Md2Module,
        CommonModule,
        DemoSchedulerModule,
        PredictiveDialerRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        MatDatepickerModule,
        LayoutModule,
        Md2Module,
        NoConflictStyleCompatibilityMode,
        AgGridModule.withComponents([]),
    ],
    declarations: [
        PredictiveDialerViewComponent,
        PredictiveDialerSessionComponent,
        PredictiveDialerManageComponent,
        FurtherInfoComponent,
        PredictiveDialerListComponent,
        KeysPipe,
        PredictiveDialerInformationComponent,
        PredictiveDialerCallInputComponent,
        PdAppointmentComponent,
        PdFollowupMonthYearComponent,
        PlivoActionComponent,
        ActionNotReachedComponent,
        ActionReachedComponent,
        FurtherActionComponent,
        NewDialerSessionComponent,
        PredictiveDialerStatisticsComponent
    ],
    providers: [
        TicketActivityOverlayService
    ],
    entryComponents: [
        PredictiveDialerManageComponent,
        FurtherInfoComponent,
        PredictiveDialerListComponent,
        NewDialerSessionComponent
    ]
})


export class PredictiveDialerModule {
}