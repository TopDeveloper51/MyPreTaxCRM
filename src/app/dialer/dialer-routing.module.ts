import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncomingCallsComponent } from '@app/dialer/components/incoming-calls/incoming-calls.component';
import { AuthenticationGuard } from '@app/shared/services';


const routes: Routes = [
  {
    path: 'calls-details', component: IncomingCallsComponent,
    canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForManagementUser: true, onlyForAllowedResellers: ['myTAXPrepOffice'] } }
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DialerRoutingModule { }
