// External Import
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Internal Import
import { UserService, MessageService } from '@app/shared/services';
import { ChangePasswordService } from '@app/user/change-password/change-password.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public changePasswordForm: FormGroup;
  // Object Store All Password
  public changePasswordObj: any = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  public userDetails: any;
  public changPasswordNoMatch: boolean = false;

  constructor(private fb: FormBuilder,
    private changePasswordService: ChangePasswordService,
    private userService: UserService,
    private messageService: MessageService) { }

  public initChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      oldPassword: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [Validators.required]),
      confirmPassword: this.fb.control('', [Validators.required])
    });

  }

  /**
   * @author Mansi Makwana
   * @createdDate 03-11-2019
   * @discription to change password
   * @memberOf ChangePasswordComponent
   */
  
  change(): void {
    this.matchPassword();
    if (this.userDetails.userName && this.changPasswordNoMatch === false) {
      let apiparams: any = {};
      apiparams.userName = this.userDetails.userName;
      apiparams.oldPassword = this.changePasswordForm.controls.oldPassword.value;
      apiparams.newPassword = this.changePasswordForm.controls.newPassword.value;

      this.changePasswordService.changePassword({ apiparams }).then((result) => {
       
          this.changePasswordObj = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          this.messageService.showMessage('Password Change Successfully', 'success');
      
      }, (error) => {
        // show error msg when invalid user
        this.messageService.showMessage('You provided an incorrect old password', 'error');
      });
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03-11-2019
   * @discription to match new password and confirm password
   * @memberOf ChangePasswordComponent
   */
  // This Function is used at on blur
  matchPassword(): void {
    if (this.changePasswordForm.controls.confirmPassword.value !== undefined && this.changePasswordForm.controls.newPassword.value !== undefined &&
      this.changePasswordForm.controls.confirmPassword.value !== '' && this.changePasswordForm.controls.newPassword.value !== '' && this.changePasswordForm.controls.confirmPassword.value !== this.changePasswordForm.controls.newPassword.value) {
      this.changPasswordNoMatch = true;
    } else {
      this.changPasswordNoMatch = false;
    }
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.initChangePasswordForm();
  }

}

