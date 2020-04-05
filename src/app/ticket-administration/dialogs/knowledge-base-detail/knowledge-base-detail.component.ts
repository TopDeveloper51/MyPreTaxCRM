import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';


import { MessageService, CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';


@Component({
  selector: 'app-knowledge-base-detail',
  templateUrl: './knowledge-base-detail.component.html',
  styleUrls: ['./knowledge-base-detail.component.scss']
})
export class KnowledgeBaseDetailComponent implements OnInit {
  data: any = {};

  knowledgeBaseData: any = {};

  knowldegeBaseEditor: FormGroup;
  public ticketSubTypeId;
  public ticketTypeDepartment;
  public ticketTypeID;
  public ticketSubTypeDetails;

  public Editor = ClassicEditor;


  constructor(
    public modal: NgbActiveModal,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute,
    private messageservice: MessageService, private _commonAPI: CommonApiService) {
  }



  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description create Manage Ticket SubType Form
  * @memberOf ManageTicketSubTypeComponent
  */
  public createKnowledgeBaseEditor() {
    this.knowldegeBaseEditor = this.fb.group({
      knowledgebase: this.fb.control(''),
    });
    this.knowldegeBaseEditor.patchValue(this.knowledgeBaseData);
  }


  /**
   * @author Pearly Shah
   * @createdDate 10/08/2019
   * @description Api call for save and edit
   * @memberOf ManageTicketSubTypeComponent
   */
  save() {
    const knowledgebaseSave = {
      'typeId': this.knowledgeBaseData.typeId, 'id': this.knowledgeBaseData.id, 'department': this.knowledgeBaseData.department, 'name': this.knowledgeBaseData.name,
      'knowledgebase': this.knowldegeBaseEditor.controls.knowledgebase.value
    };
    this._commonAPI.getPromiseResponse({ apiName: APINAME.UPDATE_TICKET_SUB_TYPE, parameterObject: knowledgebaseSave }).then((response) => {
      this.messageservice.showMessage('Knowledge-Base details updated successfully', 'success');
      this.modal.close(true);
    }, error => {
      this.messageservice.showMessage('Knowledge Base details updation unsuccessful', 'error');
      console.error(error);
    });

  }
  public close(): void {
    this.modal.close();
  }


  ngOnInit() {
    this.knowledgeBaseData = this.data.data;
    this.createKnowledgeBaseEditor();
  }
}
