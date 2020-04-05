import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticationGuard } from '@app/shared/services';
import { ActivitySearchComponent } from '@app/activity/activity-search/activity-search.component';
import { ActivityOrderComponent } from '@app/activity/activity-order/activity-order.component';
import { InternalMeetingComponent } from '@app/activity/internal-meeting/internal-meeting.component';

const ActivityRoutes: Routes = [
  {
    path: '', component: ActivitySearchComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice', 'TaxVisionCloud'] } }
  },
  {
    path: 'commission', component: ActivityOrderComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
  },
  {
    path: 'internalMeeting', component: InternalMeetingComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForManagementUser: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
  }

];

@NgModule({
  imports: [RouterModule.forChild(ActivityRoutes)],
  exports: [RouterModule]
})
export class ActivityRoutingModule { }
