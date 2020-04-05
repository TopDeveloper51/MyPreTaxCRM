
// External imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { TicketSearchComponent } from '@app/ticket/ticket-search/ticket-search.component';

// Define Routes
const TicketRoutes: Routes = [
    {
        path: '', component: TicketSearchComponent, canActivate: [AuthenticationGuard],
        data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
    }
];

@NgModule({
    imports: [RouterModule.forChild(TicketRoutes)],
    exports: [RouterModule]
})
export class TicketRoutingModule { }
