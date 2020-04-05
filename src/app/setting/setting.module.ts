// External import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// Internal Imports
import { SharedModule } from '@app/shared/shared.module';
import { SettingDetailComponent } from '@app/setting/setting-detail/setting-detail.component';
import { SettingRoutingModule } from '@app/setting/setting.routing';




@NgModule({
  declarations: [SettingDetailComponent],
  imports: [
    CommonModule,
    SettingRoutingModule,
    SharedModule
  ],
  entryComponents: [
    SettingDetailComponent
  ]
})
export class SettingModule { }
