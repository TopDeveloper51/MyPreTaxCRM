// external
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TimepickerModule } from 'ngx-bootstrap';


// Internal
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from '@app/shared/components/notify-dialog/notify-dialog.component';
import { SelectMultiLabelComponent } from '@app/shared/components/select-multi-label/select-multi-label.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '@app/shared/services';
import { TextMaskModule } from '@app/shared/directives/text-mask.directive';
import { PhonePipe,HourMinuteSecondPipe } from '@app/shared/pipe/common.pipe';
import { PouchDbService } from '@app/shared/services/pouch-db.service';
import { ContactDetailComponent } from '@app/contact/dialogs/contact-detail/contact-detail.component';
import { ContactHistoryComponent } from '@app/contact/dialogs/contact-history/contact-history.component';
import { EmailChangeComponent } from '@app/contact/dialogs/email-change/email-change.component';
import { VerifyNumberComponent } from '@app/contact/dialogs/verify-number/verify-number.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { MyCurrentTimeModule } from '@app/shared/directives/my-current-time.directive';
import { SaveNewFilterDialogComponent } from '@app/shared/dialogue/save-new-filter-dialog/save-new-filter-dialog.component';
import { ChangeCustomerComponent } from '@app/shared/dialogue/change-customer/change-customer.component';
import { ChangeActivityStatusComponent } from '@app/shared/dialogue/change-activity-status/change-activity-status.component';
import { ChatModule } from "@app/chat/chat.module";
import { MyAutoFocusModule } from '@app/shared/directives/autofocus.directive';
import { ConfirmLargedataDialogComponent } from '@app/shared/dialogue/confirm-largedata-dialog/confirm-largedata-dialog.component';
import { NewVersionReleaseComponent } from '@app/shared/components/new-version-release/new-version-release.component';
import { CheckinoutManualComponent } from '@app/shared/dialogue/checkinout-manual/checkinout-manual.component';
import { CheckinoutHistoryComponent } from '@app/shared/dialogue/checkinout-history/checkinout-history.component';

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    NotifyDialogComponent,
    SelectMultiLabelComponent,
    PhonePipe,
    HourMinuteSecondPipe,
    ContactDetailComponent,
    ContactHistoryComponent,
    EmailChangeComponent,
    VerifyNumberComponent,
    SaveNewFilterDialogComponent,
    ChangeCustomerComponent,
    ChangeActivityStatusComponent,
    ConfirmLargedataDialogComponent,
    NewVersionReleaseComponent,
    CheckinoutManualComponent,
    CheckinoutHistoryComponent
  ],
  imports: [
    TextMaskModule,
    NgSelectModule,
    FormsModule,
    MyCurrentTimeModule,
    MyAutoFocusModule,
    ReactiveFormsModule,
    CommonModule,
    NgbModule,
    DragDropModule,
    MatDatepickerModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule,
    Md2Module, NoConflictStyleCompatibilityMode,
    AgGridModule.withComponents([]),
    TimepickerModule.forRoot(),
    ChatModule
  ],
  exports: [
    TextMaskModule,
    MyCurrentTimeModule,
    MyAutoFocusModule,
    ConfirmDialogComponent,
    NotifyDialogComponent,
    SelectMultiLabelComponent,
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    PhonePipe,
    HourMinuteSecondPipe,
    ContactDetailComponent,
    ContactHistoryComponent,
    EmailChangeComponent,
    VerifyNumberComponent,
    SaveNewFilterDialogComponent,
    ChangeCustomerComponent,
    ChangeActivityStatusComponent,
    ConfirmLargedataDialogComponent,
    ChatModule,
    NewVersionReleaseComponent,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    NgbModule
  ],
  entryComponents: [
    ConfirmDialogComponent,
    NotifyDialogComponent,
    ContactDetailComponent,
    ContactHistoryComponent,
    EmailChangeComponent,
    VerifyNumberComponent,
    SaveNewFilterDialogComponent,
    ChangeCustomerComponent,
    ChangeActivityStatusComponent,
    ConfirmLargedataDialogComponent,
    NewVersionReleaseComponent,
    CheckinoutManualComponent,
    CheckinoutHistoryComponent
  ],
  providers: [
    DialogService,
    PouchDbService
  ]
})
export class SharedModule { }
