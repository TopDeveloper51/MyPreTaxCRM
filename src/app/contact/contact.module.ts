// External Imports
import { NgModule } from '@angular/core';

// Internal Imports
import { ContactSearchComponent } from '@app/contact/contact-search/contact-search.component';
import { ContactRoutingModule } from '@app/contact/contact.routing';
import { SharedModule } from '@app/shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
@NgModule({
    imports: [
        ContactRoutingModule,
        SharedModule,
        AgGridModule.withComponents([]),
        MatDatepickerModule,
        Md2Module, NoConflictStyleCompatibilityMode,
    ],
    declarations: [
        ContactSearchComponent
    ],
    providers: [
    ],
    entryComponents: []
})

export class ContactModule {
}
