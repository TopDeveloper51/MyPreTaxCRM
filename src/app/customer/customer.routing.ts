// External imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services';
import { CustomerSearchComponent } from '@app/customer/customer-search/customer-search.component';
import { CustomerDetailComponent } from '@app/customer/customer-detail/customer-detail.component';
import { CustomerProfileSearchComponent } from '@app/customer/customer-profile-search/customer-profile-search.component';

// Define Routes
const CustomerRoutes: Routes = [
  {
    path: 'customerProfile',
    component: CustomerProfileSearchComponent,
    canActivate: [AuthenticationGuard],
    data: {
      access: {
        requiredAuthentication: true
      }
    }
  },
  {
    path: '',
    component: CustomerSearchComponent,
    canActivate: [AuthenticationGuard],
    data: {
      access: {
        requiredAuthentication: true,
      }
    }
  },
  {
    path: ':mode/:id',
    component: CustomerDetailComponent,
    canActivate: [AuthenticationGuard],
    data: {
      access: {
        requiredAuthentication: true,
      }
    }
  },
  {
    path: ':mode',
    component: CustomerDetailComponent,
    canActivate: [AuthenticationGuard],
    data: {
      access: {
        requiredAuthentication: true,
      }
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(CustomerRoutes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
