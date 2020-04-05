// External Import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';

// Internal Import
import { ChangePasswordComponent } from '@app/user/change-password/change-password.component';
import { UserRoutingModule} from '@app/user/user.routing';
import { UserSearchComponent } from '@app/user/user-search/user-search.component';
import { SharedModule } from '@app/shared/shared.module';
import { UserDetailComponent } from '@app/user/user-detail/user-detail.component';
import { AssessmentModule } from '@app/assessment/assessment.module';
import { UserHistoryComponent } from '@app/user/user-history/user-history.component';
import { useAnimation } from '@angular/animations';



@NgModule({
  declarations: [ChangePasswordComponent, UserSearchComponent, UserDetailComponent, UserHistoryComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    NgbModule,
    SharedModule,
    Md2Module,
    NoConflictStyleCompatibilityMode,
    ReactiveFormsModule,
    AssessmentModule,
    AgGridModule.withComponents([]),
    FormsModule
  ],
  entryComponents: [UserDetailComponent,UserHistoryComponent]
})
export class UserModule { }
