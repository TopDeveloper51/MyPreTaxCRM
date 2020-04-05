// External imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { SettingDetailComponent } from '@app/setting/setting-detail/setting-detail.component';

// Define Routes
const SettingRoutes: Routes = [
    {
        path: '', component: SettingDetailComponent, canActivate: [AuthenticationGuard],
        data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
    },

];

@NgModule({
    imports: [
        RouterModule.forChild(SettingRoutes)
    ],
    providers: [
        AuthenticationGuard
    ],
    exports: [
        RouterModule
    ]
})
export class SettingRoutingModule {
}