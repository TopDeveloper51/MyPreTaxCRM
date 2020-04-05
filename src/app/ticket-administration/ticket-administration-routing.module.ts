// External imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { TicketTypeListComponent } from '@app/ticket-administration/ticket-type-list/ticket-type-list.component';
import { TicketSubTypeListComponent } from '@app/ticket-administration/ticket-sub-type-list/ticket-sub-type-list.component';
import { TicketMappingListComponent } from '@app/ticket-administration/ticket-mapping-list/ticket-mapping-list.component';
import { ManageTicketTypeComponent } from '@app/ticket-administration/manage-ticket-type/manage-ticket-type.component';
import { ManageTicketSubTypeComponent } from '@app/ticket-administration/manage-ticket-sub-type/manage-ticket-sub-type.component';
import { ManageFieldListComponent } from '@app/ticket-administration/manage-field-list/manage-field-list.component';
import { TicketAnalysisComponent } from '@app/ticket-administration/ticket-analysis/ticket-analysis.component';

const routes: Routes = [
  {
    path: 'ticketType', component: TicketTypeListComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true, onlyForManagementUser: true } }
  },
  {
    path: 'new', component: ManageTicketTypeComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } }
  },
  {
    path: ':department/:id', component: ManageTicketTypeComponent,
    data: { access: { requiredAuthentication: true } }
  },
  {
    path: 'subtype-list/:department/:id', component: TicketSubTypeListComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } }
  },
  {
    path: 'subtype-list/:department/:id/:subid', component: ManageTicketSubTypeComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } }
  },
  {
    path: 'subtype-list/:department/:id/new', component: ManageTicketSubTypeComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } }
  },
  {
    path: 'managefield-list', component: ManageFieldListComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true, onlyForManagementUser: true } }
  },
  {
    path: 'mapping-list', component: TicketMappingListComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } }
  },
  {
    path: 'analysis-report', component: TicketAnalysisComponent, canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true, onlyForManagementUser: true } }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketAdministrationRoutingModule { }