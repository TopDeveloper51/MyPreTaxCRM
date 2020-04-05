// External imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { LogoutComponent } from '@app/authentication/logout/logout.component';
import { AuthenticationComponent } from '@app/authentication/authentication/authentication.component';
const routes: Routes = [
  {
    path: 'login',
    component: AuthenticationComponent,
    canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: false } }
  },
  {
    path: 'logout',
    component: LogoutComponent,
    canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } }
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
