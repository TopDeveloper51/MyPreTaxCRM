import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgxUploaderModule } from 'ngx-uploader';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { EditorModule } from '@progress/kendo-angular-editor';

import { CentricScreenRoutingModule } from '@app/ticket-activity/ticket-activity-routing.module';
import { TicketActivityDetailComponent } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.component';
import { TACustomerComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-customer/ta-customer.component';
import { TACustomerTicketComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-customer-ticket/ta-customer-ticket.component';
import { TACustomerActivityComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-customer-activity/ta-customer-activity.component';
import { TATicketComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket/ta-ticket.component';
import { TATicketActivityComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket-activity/ta-ticket-activity.component';
import { TAActivityComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/ta-activity.component';
import { TAAdditionalDetailComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/ta-additional-detail.component';
import { TicketHeaderComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket/components/ticket-header/ticket-header.component';
import { TicketDetailsComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket/components/ticket-details/ticket-details.component';
import { TicketHistoryComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket/dialogs/ticket-history/ticket-history.component';
import { ActivityBpVolumeComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-bp-volume/activity-bp-volume.component';
import { ActivityOrderRefundComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-order-refund/activity-order-refund.component';
import { ActivitySpecialTaskComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-special-task/activity-special-task.component';
import { ActivityMailDetailComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-mail-detail/activity-mail-detail.component';
import { ActivityDocumentUploadComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-document-upload/activity-document-upload.component';
import { ActivityViewTranscriptionComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-view-transcription/activity-view-transcription.component';
import { ActivityHeaderComponent, KeysPipe } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/components/activity-header/activity-header.component';
import { ActivityHistoryComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/activity-history/activity-history.component';
import { ChangeCustomerComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/change-customer/change-customer.component';
import { FollowupActivityComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/followup-activity/followup-activity.component';
import { KnowledgebaseComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/knowledgebase-detail/knowledgebase-detail.component';
import { PhoneDetailsComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/phone-details/phone-details.component';
import { ActivityDetailsComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/components/activity-details/activity-details.component';
import { TicketSetupComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/ticket-setup/ticket-setup.component';
import { SharedModule } from '@app/shared/shared.module';
import { ActivityActionComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/components/activity-action/activity-action.component';
import { ActivityCallHangupComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/activity-call-hangup/activity-call-hangup.component';
import { TicketActivityTabComponent } from '@app/ticket-activity/ticket-activity-tab/ticket-activity-tab.component';
import { ActivityTicketComponent } from '@app/activity/dialog/activity-ticket/activity-ticket.component';
import { ImageDialogComponent } from './ticket-activity-detail/components/ta-activity/dialogs/image-dialog/image-dialog.component';
import { ImageUploadDialogComponent } from './ticket-activity-detail/components/ta-activity/dialogs/image-upload-dialog/image-upload-dialog.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
@NgModule({
  declarations: [TicketActivityDetailComponent, TACustomerComponent, TACustomerTicketComponent, TACustomerActivityComponent,
    TATicketComponent, TATicketActivityComponent, TAActivityComponent, TAAdditionalDetailComponent, TicketHeaderComponent, TicketDetailsComponent,
    TicketHistoryComponent, ActivityBpVolumeComponent, ActivityOrderRefundComponent, ActivitySpecialTaskComponent,
    ActivityMailDetailComponent, ActivityDocumentUploadComponent, ActivityViewTranscriptionComponent, ActivityHeaderComponent, KeysPipe, ActivityHistoryComponent,
    ChangeCustomerComponent, FollowupActivityComponent, KnowledgebaseComponent, PhoneDetailsComponent, ActivityCallHangupComponent,
    ActivityDetailsComponent, TicketSetupComponent, 
    ActivityActionComponent, TicketActivityTabComponent,
     KnowledgebaseComponent, 
     ImageDialogComponent, ImageUploadDialogComponent
    ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    AgGridModule,
    NgxUploaderModule,
    CentricScreenRoutingModule,
    NgbDatepickerModule,
    DropDownsModule,
    MatDatepickerModule,
    Md2Module,
    NoConflictStyleCompatibilityMode,
    EditorModule,
    DialogsModule,
    InputsModule,
    LabelModule,
    UploadModule
  ],
  entryComponents: [FollowupActivityComponent,
    ImageDialogComponent,ImageUploadDialogComponent, 
    ActivityHistoryComponent, ChangeCustomerComponent, PhoneDetailsComponent, TicketSetupComponent, ActivityCallHangupComponent, TicketActivityDetailComponent, KnowledgebaseComponent, ActivityTicketComponent, TicketHistoryComponent],
  exports: [],
  providers:[]
  // providers: [
  //   {
  //     provide: HTTP_INTERCEPTORS,
  //     useClass: ImageDialogComponent,
  //     multi: true
  //   }
  // ]
})
export class TicketActivityModule { }
