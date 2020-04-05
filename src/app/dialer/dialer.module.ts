import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialerRoutingModule } from '@app/dialer/dialer-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { DialerComponent } from '@app/dialer/dialer/dialer.component';
import { IncomingCallsComponent } from '@app/dialer/components/incoming-calls/incoming-calls.component';
import { DialerDialogComponent } from '@app/dialer/dialog/dialer-dialog/dialer-dialog.component';
import { DialersService } from '@app/dialer/dialers.service';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IncomingCallNotificationComponent } from '@app/dialer/dialog/incoming-call-notification/incoming-call-notification.component';
import { DialogService } from '@app/shared/services';
import { DialogsModule } from '@progress/kendo-angular-dialog';


@NgModule({
  declarations: [DialerComponent, IncomingCallsComponent, DialerDialogComponent, IncomingCallNotificationComponent],
  imports: [
    CommonModule,
    DialerRoutingModule,
    DialogsModule,
    SharedModule,
    NgbModule,
    AgGridModule.withComponents([])
  ],
  entryComponents: [IncomingCallNotificationComponent, DialerDialogComponent],
  providers: [DialogService],
  exports: [DialerComponent]
})
export class DialerModule { }
