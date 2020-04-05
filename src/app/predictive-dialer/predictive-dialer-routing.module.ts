// // External imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { PredictiveDialerViewComponent } from '@app/predictive-dialer/predictive-dialer-view/predictive-dialer-view.component';
import { PredictiveDialerSessionComponent } from '@app/predictive-dialer/predictive-dialer-session/predictive-dialer-session.component';
import { PredictiveDialerManageComponent } from '@app/predictive-dialer/predictive-dialer-manage/predictive-dialer-manage.component';
import { PredictiveDialerStatisticsComponent } from '@app/predictive-dialer/predictive-dialer-statistics/predictive-dialer-statistics.component';
// Define Routes
const UserRoutes: Routes = [
    { path: 'predictiveDialerView', component: PredictiveDialerViewComponent, canActivate: [AuthenticationGuard], data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } } },
    { path: 'predictiveDialerView/:id', component: PredictiveDialerViewComponent, canActivate: [AuthenticationGuard], data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } } },
    { path: 'predictiveDialerView/demo', component: PredictiveDialerViewComponent, canActivate: [AuthenticationGuard], data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } } },
    { path: 'predictiveDialerSession', component: PredictiveDialerSessionComponent, canActivate: [AuthenticationGuard], data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } } },
    { path: 'predictiveDialerManage', component: PredictiveDialerManageComponent, canActivate: [AuthenticationGuard], data: { 'access': { requiredAuthentication: true, onlyForManagementUser: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } } },
    {
        path: 'statistics',
        component: PredictiveDialerStatisticsComponent,
        canActivate: [AuthenticationGuard],
        data: {
            access: {
                requiredAuthentication: true,
                onlyForManagementUser: true,
                onlyForAllowedResellers: ['myTAXPrepOffice']
            }
        }
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(UserRoutes)
    ],
    providers: [
        AuthenticationGuard
    ],
    exports: [
        RouterModule
    ]
})
export class PredictiveDialerRoutingModule {
}
