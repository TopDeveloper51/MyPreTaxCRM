// // External imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { ChangePasswordComponent } from '@app/user/change-password/change-password.component';
import {UserSearchComponent} from '@app/user/user-search/user-search.component';
// Define Routes
const UserRoutes: Routes = [

    {
        path: 'changePassword',
        component: ChangePasswordComponent,
        canActivate: [AuthenticationGuard],
        data: {
            access: {
                requiredAuthentication: true,
                onlyForAllowedResellers: ['myTAXPrepOffice']
            }
        }
    },
    {
        path: 'search', component: UserSearchComponent, canActivate: [AuthenticationGuard],
        data: { 'access': { requiredAuthentication: true, onlyForManagementUser: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
    }
];
@NgModule({
    imports: [
        RouterModule.forChild(UserRoutes)
    ],
    providers: [],
    exports: [
        RouterModule
    ]
})
export class UserRoutingModule {
}