import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BreakReasonSearchComponent } from '@app/reports/break-reason-search/break-reason-search.component';
import { CalendarComponent } from '@app/reports/calendar/calendar.component';
import { AuthenticationGuard } from '@app/shared/services';
import { ActivitySummaryComponent } from '@app/reports/activity-summary/activity-summary.component';
import { OrderOverviewComponent } from './order-overview/order-overview.component';

const routes: Routes = [
  {
    path: 'reasonSearch', component: BreakReasonSearchComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForManagementUser: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
  },
  {
    path: 'calendar', component: CalendarComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
  },
  {
    path: 'activitySummary', component: ActivitySummaryComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
  },
  {
    path: 'orderOverview', component: OrderOverviewComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForManagementUser: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
