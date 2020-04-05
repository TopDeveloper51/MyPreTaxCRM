import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ReminderScreenComponent} from '@app/reminder/reminder-screen/reminder-screen.component';
import { AuthenticationGuard } from '@app/shared/services';

const routes: Routes = [
  { path: 'reminder', component: ReminderScreenComponent, canActivate: [AuthenticationGuard], data: { 'access': { requiredAuthentication: true } } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReminderRoutingModule { }
