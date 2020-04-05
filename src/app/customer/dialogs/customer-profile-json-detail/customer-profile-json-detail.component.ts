// External imports
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
// Internal imports
import { CopyToClipboardService } from "@app/shared/services/copy-clipboard.service";
import { MessageService } from "@app/shared/services/message.service";
import { CustomerProfileJsonDetailService } from "@app/customer/dialogs/customer-profile-json-detail/customer-profile-json-detail.service";
@Component({
  selector: 'app-customer-profile-json-detail',
  templateUrl: './customer-profile-json-detail.component.html',
  styleUrls: ['./customer-profile-json-detail.component.scss']
})
export class CustomerProfileJsonDetailComponent implements OnInit {
  @Input() data;
  public docId: any;     //this variable is used to store customer id 
  public orderOverviewJson: any; //this variable is used to response store 
  
  constructor(private model: NgbActiveModal, private copyToClipboardService: CopyToClipboardService, private messageService: MessageService,
    private customerProfileJsonDetailService: CustomerProfileJsonDetailService) { }

       /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used get user view details by json format 
* @memberof CustomerProfileJsonDetailComponent
*/
  public getUserViewDetailsJSON(docId) {
    let docIdReqParam = { 'docId': docId };
    this.customerProfileJsonDetailService.getCustomerDocumentByIdJSON(docIdReqParam).then((response: any) => {
      this.orderOverviewJson = response;
    });
  }

    /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used copy clipboard
* @memberof CustomerProfileJsonDetailComponent
*/
  public copyToClipboard() {
    this.copyToClipboardService.copy(JSON.stringify(this.orderOverviewJson, null, 3));
    this.messageService.showMessage('JSON Copied Successfully', 'success');
  }

    /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used close dialog
* @memberof CustomerProfileJsonDetailComponent
*/
  public closeCustomerJsonProfileDialog() {
    this.model.close(false);
  }

  ngOnInit() {
    this.getUserViewDetailsJSON(this.data.data.docId);
  }

}
