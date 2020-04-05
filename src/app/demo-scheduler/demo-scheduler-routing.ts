// Internal imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Internal imports
import { DemoSchedulerComponent } from '@app/demo-scheduler/demo-scheduler/demo-scheduler.component';
import { AuthenticationGuard } from '@app/shared/services';


const routes: Routes = [

  {
    path: '', component: DemoSchedulerComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice', 'TaxVisionCloud'] } }
}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoSchedulerRoutingModule { }
