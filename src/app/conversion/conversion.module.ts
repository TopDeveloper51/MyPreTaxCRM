import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';

import { ConversionRoutingModule } from './conversion-routing.module';
import { ConversionReportComponent } from './conversion-report/conversion-report.component';
import { ConversionMismatchReportComponent } from './conversion-mismatch-report/conversion-mismatch-report.component';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [ConversionReportComponent, ConversionMismatchReportComponent],
  imports: [
    CommonModule,
    Md2Module,
    SharedModule,
    NoConflictStyleCompatibilityMode,
    AgGridModule.withComponents([]),
    ConversionRoutingModule
  ]
})
export class ConversionModule { }
