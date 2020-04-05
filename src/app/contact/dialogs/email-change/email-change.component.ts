// External imports
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// Internal imports
import { DialogService, MessageService } from '@app/shared/services';
import { EmailChangeService } from '@app/contact/dialogs/email-change/email-change.service';
@Component({
  templateUrl: './email-change.component.html',
  styleUrls: ['./email-change.component.scss'],
  providers: [EmailChangeService],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailChangeComponent implements OnInit {
  public emailChangeForm: FormGroup;
  @Input() data: any;
  public emailData: any = {};
  constructor(private emailChangeService: EmailChangeService, private formBuilder: FormBuilder, private messageService: MessageService, 
    private dialogService: DialogService, public modal: NgbActiveModal) { }

  /**
   * @author om kanada
   * Change Email Api call
   * @memberof EmailChangeComponent
   */
  public changeEmail(): void {
    const self = this;
    // Open dialog for conformation before Change Email Address
    const dialogData = { title: 'Confirmation', text: 'Are you sure you want to Change Email Address?' };
    this.dialogService.confirm(dialogData, {}).result.then(
      (result) => {
        if (result === 'YES') {
          self.emailData.newEmail = this.emailChangeForm.get('newEmail').value;
          self.emailChangeService.changeEmail(self.emailData).then(Response => {
            if (Response) {
              self.messageService.showMessage('Change email successfully', 'success');
              self.modal.close(this.data.customerId);
            }

          }, (error) => {
            if (error && error.code === 4000) {
              self.messageService.showMessage('This email already exists.', 'error');
            } else if (error && error.code === 4020) {
              self.messageService.showMessage('User does not exist.', 'error');
            } else if (error && error.code === 4021) {
              self.messageService.showMessage('Location document does not exist.', 'error');
            } else {
              self.messageService.showMessage('Error occurred while processing.', 'error');
            }
          });
        }
      },
      (error) => {
        self.messageService.showMessage('Error occurred while processing.', 'error');
      }
    );
  }

  /**
   * @author om kanada
   * initial load email change form.
   * @memberof EmailChangeComponent
   */
  private initemailChangeForm(): void {
    this.emailChangeForm = this.formBuilder.group({
      oldEmail: [{value: undefined, disabled: true}, [Validators.required, Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]],
      newEmail: ['', [Validators.required, Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]]
    });
    this.OldEmailFillValue();
  }

  public OldEmailFillValue()
  {
    this.emailChangeForm.get('oldEmail').setValue(this.emailData.oldEmail);
  }

  public close(): void {
    this.modal.close();
  }

  ngOnInit() {
    if (this.data) {
      this.emailData.oldEmail = this.data.email;
      this.emailData.contactId = this.data.contactId;
      this.emailData.customerId = this.data.customerId;
    }
    this.initemailChangeForm();
  }
}
