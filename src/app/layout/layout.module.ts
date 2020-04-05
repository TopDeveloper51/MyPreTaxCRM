// External imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogsModule } from '@progress/kendo-angular-dialog';

// External imports
import { DialogService } from '@app/shared/services/dialog.service';
import { HeaderComponent } from '@app/layout/components/header/header.component';
import { FooterComponent } from '@app/layout/components/footer/footer.component';
import { LayoutComponent } from '@app/layout/layout/layout.component';
import { ToastContainerComponent } from '@app/layout/components/toast-container/toast-container.component';
import { LayoutAuthenticationComponent } from '@app/layout/layout-authentication/layout-authentication.component';
import { TicketActivityModule } from '@app/ticket-activity/ticket-activity.module';
import { DialerModule } from '@app/dialer/dialer.module';
import { ReminderScreenComponent } from '@app/reminder/reminder-screen/reminder-screen.component';
import { TimeAccountingModule } from '@app/time-accounting/time-accounting.module';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    ToastContainerComponent,
    LayoutAuthenticationComponent,
  ],
  exports: [ToastContainerComponent, NgbModule, NgSelectModule, HeaderComponent],
  imports: [NgbModule, CommonModule, RouterModule, NgSelectModule, DialerModule, FormsModule, ReactiveFormsModule, DialogsModule,
    TicketActivityModule, TimeAccountingModule, AgGridModule.withComponents([])],
  providers: [DialogService],
  entryComponents: [ReminderScreenComponent]
})
export class LayoutModule { }
