// External Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Internal Imports
import { AuthenticationGuard } from '@app/shared/services';
import { TimeAccountingManagementComponent } from '@app/time-accounting/time-accounting-management/time-accounting-management.component';
import { TimeAccountingSummaryComponent } from '@app/time-accounting/time-accounting-summary/time-accounting-summary.component';
import { DTUManagementComponent } from '@app/time-accounting/dtu-management/dtu-management.component';

const routes: Routes = [
    {
        path: 'summary', component: TimeAccountingSummaryComponent, canActivate: [AuthenticationGuard],
        data: { 'access': { requiredAuthentication: true, onlyForManagementUser: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } },
    },
    {
        path: 'management', component: TimeAccountingManagementComponent, canActivate: [AuthenticationGuard],
        data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } },
    },
    {
        path: 'dailyTimeUsage', component: DTUManagementComponent, canActivate: [AuthenticationGuard],
        data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } },
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TimeAccountingRoutingModule { }
