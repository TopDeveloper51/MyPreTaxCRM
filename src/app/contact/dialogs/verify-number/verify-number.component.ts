// External imports
import { Component, OnInit, Injector,Input,ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgForm } from '@angular/forms';
// Internal imports
import { VerifyNumberService } from '@app/contact/dialogs/verify-number/verify-number.service';
import { MessageService } from '@app/shared/services';


@Component({
  templateUrl: './verify-number.component.html',
  styleUrls: ['./verify-number.component.scss'],
  providers: [VerifyNumberService],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyNumberComponent implements OnInit {
  @Input() data:any;
  @ViewChild('verifyNumber', { static: true }) verifyNumber: NgForm;
  public codeObj: any ;
  public verifyNumberForm: FormGroup;
  constructor(private injector: Injector, public modal: NgbActiveModal, private verifyNumberService: VerifyNumberService, private messageService: MessageService) { }


  public isPositiveNumber(event: any): boolean {
    if (!(event.keyCode >= 48 && event.keyCode <= 57)) {
      return false;
    }
    return true;
  }


  public verify(codeObj: any): void {
    this.verifyNumberService.verifyNumber(this.codeObj).then(response => {
      if (response || (response && Object.keys(response).length > 0)) {
        this.modal.close(true);
      } else {
        if (codeObj.type === 'Number') {
          this.messageService.showMessage('Number verification unsuccessful. Code entered is invalid.', 'error');
        } else {
          this.messageService.showMessage('Email verification unsuccessful. Code entered is invalid.', 'error');
        }
      }
    }, (error) => {
      this.messageService.showMessage('Error while verify Number OR Email.', 'error');
    });

  }

  public close()
  {
    this.modal.close();
  }

  public initVerifyNumberForm(): void {
    const fb = this.injector.get(FormBuilder);
    this.verifyNumberForm = fb.group({
      OTP: ['', [Validators.minLength(6), Validators.required]]
    });

  }

  ngOnInit() {
    this.codeObj = this.data;
    this.initVerifyNumberForm();
  }

}
