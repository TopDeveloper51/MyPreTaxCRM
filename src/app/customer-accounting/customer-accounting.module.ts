// External imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';

// Internal imports
import { CustomerAccountingRoutingModule } from '@app/customer-accounting/customer-accounting.routing';
import { CustomerAccountingDetailComponent } from '@app/customer-accounting/customer-accounting-detail/customer-accounting-detail.component';
import { CustomerAccountingSearchComponent } from '@app/customer-accounting/customer-accounting-search/customer-accounting-search.component';
import { CustomerAccountingHistoryComponent } from '@app/customer-accounting/dialogs/customer-accounting-history/customer-accounting-history.component';
import { SharedModule } from '@app/shared/shared.module';
import { ChangeCustomerComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/change-customer/change-customer.component';
@NgModule({
  declarations: [CustomerAccountingDetailComponent, CustomerAccountingSearchComponent, CustomerAccountingHistoryComponent],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CustomerAccountingRoutingModule,
    Md2Module, NoConflictStyleCompatibilityMode,
    MatDatepickerModule,
    AgGridModule.withComponents([]),
  ],
  entryComponents:[ChangeCustomerComponent]
})
export class CustomerAccountingModule { }
