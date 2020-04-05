// External Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';

// Internal imports
import { SharedModule } from '@app/shared/shared.module';
import { TicketAdministrationRoutingModule } from '@app/ticket-administration/ticket-administration-routing.module';
import { TicketTypeListComponent } from '@app/ticket-administration/ticket-type-list/ticket-type-list.component';
import { ManageTicketTypeComponent } from '@app/ticket-administration/manage-ticket-type/manage-ticket-type.component';
import { ManageTicketSubTypeGridComponent } from '@app/ticket-administration/component/manage-ticket-sub-type-grid/manage-ticket-sub-type-grid.component';
import { KnowledgeBaseDetailComponent } from '@app/ticket-administration/dialogs/knowledge-base-detail/knowledge-base-detail.component';
import { ManageTicketSubTypeComponent } from '@app/ticket-administration/manage-ticket-sub-type/manage-ticket-sub-type.component';
import { TicketSubTypeListComponent } from '@app/ticket-administration/ticket-sub-type-list/ticket-sub-type-list.component';
import { TicketTypeFieldDetailsComponent, KeysPipe } from '@app/ticket-administration/component/ticket-type-field-details/ticket-type-field-details.component';
import { TicketTypeFieldListComponent } from '@app/ticket-administration/component/ticket-type-field-list/ticket-type-field-list.component';
import { ManageFieldListComponent } from '@app/ticket-administration/manage-field-list/manage-field-list.component';
import { ManageFieldListFormComponent } from '@app/ticket-administration/dialogs/manage-field-list-form/manage-field-list-form.component';

import { CheckBoxEditor } from '@app/ticket-administration/component/checkbox-editor.component';
import { TicketMappingListComponent } from '@app/ticket-administration/ticket-mapping-list/ticket-mapping-list.component';
import { TicketAnalysisComponent } from '@app/ticket-administration/ticket-analysis/ticket-analysis.component';

@NgModule({
  declarations: [
    TicketTypeListComponent,
    ManageTicketTypeComponent,
    ManageTicketSubTypeGridComponent,
    KnowledgeBaseDetailComponent,
    ManageTicketSubTypeComponent,
    TicketSubTypeListComponent,
    TicketTypeFieldDetailsComponent,
    KeysPipe,
    TicketTypeFieldListComponent,
    ManageFieldListComponent,
    ManageFieldListFormComponent,
    CheckBoxEditor,
    TicketMappingListComponent,
    TicketAnalysisComponent
  ],
  imports: [
    TicketAdministrationRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    MatDatepickerModule,
    Md2Module,
    NoConflictStyleCompatibilityMode,
    AgGridModule.withComponents([CheckBoxEditor]),
    CKEditorModule
  ],
  entryComponents: [
    KnowledgeBaseDetailComponent,
    ManageFieldListFormComponent
  ]
})
export class TicketAdministrationModule { }
