// External Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Internal Imports
import { SharedModule } from '@app/shared/shared.module';
import { BankRejectionsComponent } from '@app/return-summary/dialogs/bank-rejections/bank-rejections.component';
import { RejectionsComponent } from '@app/return-summary/dialogs/rejections/rejections.component';
import { ResendEmailComponent } from '@app/return-summary/dialogs/resend-email/resend-email.component';
import { ViewRequestComponent } from '@app/return-summary/dialogs/view-request/view-request.component';
import { QuickReturnSummaryComponent } from '@app/return-summary/quick-return-summary/quick-return-summary.component';
import { ReturnSearchWithEinComponent } from '@app/return-summary/return-search-with-ein/return-search-with-ein.component';
import { ReturnSearchWithSsnComponent } from '@app/return-summary/return-search-with-ssn/return-search-with-ssn.component';
import { ReturnWithSsnComponent } from '@app/return-summary/return-with-ssn/return-with-ssn.component';
import { ReturnWithEinComponent, KeysPipe } from '@app/return-summary/return-with-ein/return-with-ein.component';
import { SupportRoutingModule } from '@app/return-summary/return-summary.routing';
import { ReturnSummaryService, LocationService } from '@app/return-summary/return-summary.service';
import { StatusFromNumberPipe } from '@app/return-summary/return-summary.pipe';
import { ReturnSearchWithSsnGridComponent } from '@app/return-summary/return-search-with-ssn-grid/return-search-with-ssn-grid.component';



@NgModule({
  declarations: [StatusFromNumberPipe, BankRejectionsComponent, KeysPipe, RejectionsComponent, ResendEmailComponent, ViewRequestComponent, QuickReturnSummaryComponent, ReturnSearchWithEinComponent, ReturnSearchWithSsnComponent, ReturnWithSsnComponent, ReturnWithEinComponent, ReturnSearchWithSsnGridComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridModule,
    SharedModule,
    NgbModule,
    SupportRoutingModule
  ],
  providers: [
    ReturnSummaryService,
    LocationService
  ],
  entryComponents: [
    RejectionsComponent,
    BankRejectionsComponent,
    ViewRequestComponent,
    ResendEmailComponent
  ],
})
export class ReturnSummaryModule { }
