// External imports
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
// Internal imports
import { ProfileCommentService } from '@app/customer/dialogs/profile-comment/profile-comment.service';

@Component({
  selector: 'app-profile-comment',
  templateUrl: './profile-comment.component.html',
  styleUrls: ['./profile-comment.component.scss']
})
export class ProfileCommentComponent implements OnInit {
  @Input() data;
  public commentObj: any;

  // ag-grid variable start
  public apiParam;
  public gridApi;
  public domLayout;
  public defaultColDef: any;
  public gridData: any;
  public gridColumnApi;
  // ag-grid variable start end

  public rowData = [this.domLayout = 'autoHeight']; //bind grid data
  public columnDefs: any;
  
  constructor(private model: NgbActiveModal,
    private profileCommentService: ProfileCommentService) {
    this.columnDefs = [
      { headerName: 'Comment', headerTooltip: 'Comment', field: 'comment', tooltipField: 'comment', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Created by', headerTooltip: 'Created by', field: 'createdByName', tooltipField: 'createdByName', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
      {
        headerName: 'Created date', headerTooltip: 'Created date', field: 'createdDate',tooltipField:'createdDate',
        filter: true,
        width: 150,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellRenderer: function (param) {
          return param.data.createdDate ? moment(param.data.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A'):'';
        }
      },
    ],
      this.defaultColDef = {
        enableBrowserTooltips: true
      };
    this.domLayout = "autoHeight";
  }

     /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to ready ag-grid in ngOnInIt()
* @memberof ProfileCommentComponent
*/
  public onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

     /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is close dialog
* @memberof ProfileCommentComponent
*/
  public close() {
    this.model.close();
  }

     /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is get feedback 
* @memberof ProfileCommentComponent
*/
  private getFeedbackComments(): void {
    this.commentObj = {
      docId: this.data.data.docId,
      comment: ''
    };
    this.profileCommentService.getCommentById(this.commentObj).then((response: any) => {
      this.rowData = response;
    });
  }

     /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to add comment
* @memberof ProfileCommentComponent
*/
  public addComment()
  {
    if(this.commentObj.comment)
    {
      this.profileCommentService.addCommentById(this.commentObj).then((response:any)=>{
        this.commentObj.comment = '';
        this.getFeedbackComments();
      });
    }
  }

  ngOnInit() {
    this.getFeedbackComments();
  }

}
