// External imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


// internal imports
import { AuthenticationRoutingModule } from '@app/authentication/authentication-routing.module';
import { LogoutComponent } from '@app/authentication/logout/logout.component';
import { LoginComponent } from '@app/authentication/login/login.component';
import { SharedModule } from '@app/shared/shared.module';
import { AuthenticationComponent } from '@app/authentication/authentication/authentication.component';



@NgModule({
  declarations: [
    AuthenticationComponent,
    LogoutComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    AuthenticationRoutingModule,
  ],
})
export class AuthenticationModule { }
