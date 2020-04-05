// External imports 
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

// Internal imports
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CDRService, MessageService } from '@app/shared/services';
import { ReturnSummaryService } from '@app/return-summary/return-summary.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-resend-email',
  templateUrl: './resend-email.component.html',
  styleUrls: ['./resend-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResendEmailComponent implements OnInit, OnDestroy {

  public resendEmailDialog: FormGroup;
  public data: any;
  public oldEmail;
  public resendEmailData: any;
  public allClients: any;

  constructor( private fb: FormBuilder,public model: NgbActiveModal, private cdr: ChangeDetectorRef, private cdrService: CDRService, private messageService: MessageService,
    private returnSummaryService: ReturnSummaryService) { }

    /**
   * @author Mansi Makwana
   * @createdDate 05-12-2019
   * @discription to create quick return summary form
   * @memberOf QuickReturnSummaryComponent
   */
  public initResendMailForm() {
    this.resendEmailDialog = this.fb.group({
      newEmail: '',
    });
    this.cdr.detectChanges();
  }
 
  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription to close dialog
   * @memberOf ResendEmailComponent
   */
  public close(): void {
    this.model.close(false);
  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-12-2019
   * @discription to resend mail
   * @memberOf ResendEmailComponent
   */

  resendEmail(): void {
    let apiParam = this.resendEmailData;
    apiParam.locationId = this.data.locationId;
    apiParam.taxYear = this.data.taxYear;
    apiParam.oldEmail = this.oldEmail;
    var existingClient = _.filter(this.allClients, function (obj) {
      return obj.email === apiParam.newEmail && obj.clientId !== apiParam.clientId;
    })
    if (!(existingClient && existingClient.length > 0)) {
      this.returnSummaryService.resendMail(apiParam)
        .then(response => {
          if (response === 'Invitation resent successfully.') {
            this.model.close(true);
            this.messageService.showMessage('email resend successfully to: ' + apiParam.newEmail, 'success');
            this.cdrService.callDetectChanges(this.cdr);
          } else {
            this.messageService.showMessage('Error occured while processing request.', 'error');
          }
        }, error => {
          this.messageService.showMessage('Error occured while processing request.', 'error');
          console.log(error);
        });
    } else {
      this.messageService.showMessage('This email already exist in another client.', 'error');
    }
  }

  ngOnInit() {
    this.allClients = this.data.data.allClients;
    this.oldEmail = this.data.email;
    this.resendEmailData = {
      oldEmail: this.data.email,
      clientId: this.data.clientId,
      newEmail: this.data.email
    };
    this.initResendMailForm();
    this.cdrService.callDetectChanges(this.cdr);

  }

  ngOnDestroy() {
    this.cdr.detach();
  }

}
