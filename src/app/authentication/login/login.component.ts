// External imports
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

// Internal imports
import { CDRService } from '@app/shared/services/cdr.service';
import { AuthenticationService } from '@app/authentication/authentication.service';
import { LoginService } from '@app/authentication/login/login.service';
import { UserService } from '@app/shared/services';
import { PouchDbService } from '@app/shared/services/pouch-db.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public isSubmit = false;
  public subscription: Subscription;
  public errorHandler = {
    IsValidUser: true,
    IsUserLocked: false
  }; // store var for error in login

  constructor(
    private fb: FormBuilder,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthenticationService,
    private loginService: LoginService,
    private pouchDbService: PouchDbService,
    private userService: UserService
  ) { }

  /**
   * @author Dhruvi Shah
   * @modifiedby : 23sep2019 Manali Joshi : for approriate data handleing
   * @createdDate 18/09/2019
   * @description call login api with user entered username and password
   * @memberof LoginComponent
   */
  public doLogin() {
    this.errorHandler.IsValidUser = true;
    this.errorHandler.IsUserLocked = false;

    this.isSubmit = true;
    if (this.loginForm.valid) {
      this.pouchDbService.clearDB();
      this.loginService.doLogin(this.loginForm.value).then(responseData => {
        if (
          Object.keys(responseData).length > 0 &&
          (responseData.id !== undefined)
        ) {
          this.router.navigateByUrl('/activity');
        } else if (this.userService.isCallOverviewUser()) {
          this.router.navigate(['dialer', 'calls-details']);
        } else {
          if (responseData.code === 4001) {
            this.errorHandler.IsValidUser = false;
          } else if (responseData.code === 4039) {
            this.errorHandler.IsUserLocked = true;
          }
        }
        this.CDRService.callDetectChanges(this.cdr);
      }, (error) => {
        if (error.code === 4001) {
          this.errorHandler.IsValidUser = false;
        } else if (error.code === 4039) {
          this.errorHandler.IsUserLocked = true;
        }
        this.CDRService.callDetectChanges(this.cdr);
      });
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 18/09/2019
   * @description create form
   * @memberof LoginComponent
   */
  initLoginForm() {
    this.loginForm = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    });
    this.reactiveValueChange();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 18/09/2019
   * @description subscribe form to show/hide validation message for invalid user
   * @private
   * @memberof LoginComponent
   */
  private reactiveValueChange() {
    this.subscription = this.loginForm.valueChanges.subscribe(data => {
      this.errorHandler.IsValidUser = true;
    });
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 18/09/2019
   * @memberof LoginComponent
   */
  ngOnInit() {
    this.initLoginForm();
  }
}
