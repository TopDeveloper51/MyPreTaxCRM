import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConversionReportComponent } from '@app/conversion/conversion-report/conversion-report.component';

const routes: Routes = [{
  path: 'conversion-report',
  component: ConversionReportComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConversionRoutingModule { }
