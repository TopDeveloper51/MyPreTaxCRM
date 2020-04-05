// External imports
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// Internal imports 
import { APINAME } from '@app/customer/customer-constants';
import { CommonApiService } from '@app/shared/services/common-api.service';
import { MessageService } from '@app/shared/services/message.service';
import { LoaderService } from '@app/shared/loader/loader.service';
@Component({
  selector: 'app-add-on-fee-summary',
  templateUrl: './add-on-fee-summary.component.html',
  styleUrls: ['./add-on-fee-summary.component.scss']
})
export class AddOnFeeSummaryComponent implements OnInit {
  @Input() data;
  public addOnFeeInfo: any;
  public title: any = '';

  constructor(private model: NgbActiveModal,
    private commonApiService: CommonApiService,
    private messageService: MessageService,
    private loaderService:LoaderService) { }

 /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to close dialog
* @memberof AddOnFeeSummaryComponent
*/ 
  public close() {
    this.model.close();
  }

  /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used download PDF file 
* @memberof AddOnFeeSummaryComponent
*/
  public viewPDF(path) {
    this.commonApiService.getPromiseResponse({ methodType: 'get', apiName: APINAME.GET_PDF_DATA + '?fileName=' + path, parameterObject: { fileName: path } }).then((result: any) => {
      var byteArray = new Uint8Array(result.data);
      var file = new Blob([byteArray], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    }, error => {
      this.messageService.showMessage('Invalid File', 'error');
      this.loaderService.hide();
    });
  }

  ngOnInit() {
    this.title = this.data.data.title;
    if (this.data.data.addOnFeeSummary) {
      this.addOnFeeInfo = this.data.data.addOnFeeSummary[0];
    } else {
      this.addOnFeeInfo = {};
    }
  }

}
