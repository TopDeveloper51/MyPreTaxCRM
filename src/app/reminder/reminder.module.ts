import { NgModule,NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReminderRoutingModule } from './reminder-routing.module';
import { ReminderScreenComponent } from './reminder-screen/reminder-screen.component';
import { SharedModule } from '@app/shared/shared.module';
import { TimeAccountingModule } from '@app/time-accounting/time-accounting.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [ReminderScreenComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    TimeAccountingModule,
    ReminderRoutingModule
  ],
  entryComponents:[
    
  ]
})
export class ReminderModule { }
