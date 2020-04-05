// External imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { ContactSearchComponent } from '@app/contact/contact-search/contact-search.component';

// Define Routes
const ContactRoutes: Routes = [
  {
    path: '',
    component: ContactSearchComponent,
    canActivate: [AuthenticationGuard],
    data: {
      access: {
        requiredAuthentication: true,
        onlyForAllowedResellers: ['myTAXPrepOffice']
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(ContactRoutes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
