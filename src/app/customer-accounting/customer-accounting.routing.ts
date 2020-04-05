// External imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Internal imports
import { AuthenticationGuard } from '@app/shared/services/authentication.guard';
import { CustomerAccountingDetailComponent } from '@app/customer-accounting/customer-accounting-detail/customer-accounting-detail.component';
import { CustomerAccountingSearchComponent } from '@app/customer-accounting/customer-accounting-search/customer-accounting-search.component';
const routes: Routes = [
  {
    path: 'accountingTransactions',
    component: CustomerAccountingSearchComponent,
    canActivate: [AuthenticationGuard],
    data: {
      access: {
        requiredAuthentication: true
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerAccountingRoutingModule { }
