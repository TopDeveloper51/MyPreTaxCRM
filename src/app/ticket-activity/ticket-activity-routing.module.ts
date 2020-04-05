import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TicketActivityDetailComponent } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.component';
import { TicketActivityTabComponent } from '@app/ticket-activity/ticket-activity-tab/ticket-activity-tab.component';
import { ActivityViewTranscriptionComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-view-transcription/activity-view-transcription.component';
import { AuthenticationGuard } from '@app/shared/services';


const routes: Routes = [
  {
    path: ':screen/add', component: TicketActivityDetailComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice', 'TaxVisionCloud'] } }
  },
  {
    path: ':screen/details/:id', component: TicketActivityTabComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice', 'TaxVisionCloud'] } }
  },
  {
    path: ':screen/viewtranscription/:id/:fileId', component: ActivityViewTranscriptionComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice', 'TaxVisionCloud'] } }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CentricScreenRoutingModule { }
