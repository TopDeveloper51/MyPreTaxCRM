// Internal imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Internal imports
import { DailyViewComponent } from '@app/training-planner/daily-view/daily-view.component';
import { AuthenticationGuard } from '@app/shared/services';


const routes: Routes = [

  {
    path: '', component: DailyViewComponent, canActivate: [AuthenticationGuard],
    data: { 'access': { requiredAuthentication: true, onlyForAllowedResellers: ['myTAXPrepOffice', 'TaxVisionCloud'] } }
}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingPlannerRoutingModule { }
