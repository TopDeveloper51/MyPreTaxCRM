// External imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { QuickReturnSummaryComponent } from '@app/return-summary/quick-return-summary/quick-return-summary.component';

const routes: Routes = [
    {
        path: '',
        component: QuickReturnSummaryComponent,
        canActivate: [AuthenticationGuard],
        data: { access: { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SupportRoutingModule { }
