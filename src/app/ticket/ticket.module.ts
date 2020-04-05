// External Imports
import { NgModule } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';


// Internal Imports
import { SharedModule } from '@app/shared/shared.module';
import { TicketRoutingModule } from '@app/ticket/ticket-routing.module';
import { TicketSearchComponent } from '@app/ticket/ticket-search/ticket-search.component';

@NgModule({
  imports: [
    TicketRoutingModule,
    SharedModule,
    FormsModule,
    NgbModule,
    Md2Module,
    NoConflictStyleCompatibilityMode,
    ReactiveFormsModule,
    AgGridModule.withComponents([]),
  ],
  declarations: [
    TicketSearchComponent
  ],
  providers: [],
  entryComponents: []
})

export class TicketModule {
}
