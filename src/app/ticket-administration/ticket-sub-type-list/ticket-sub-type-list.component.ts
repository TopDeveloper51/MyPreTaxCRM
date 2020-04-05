// external imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewContainerRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GridOptions } from 'ag-grid-community';

//internal imports
import { MessageService, DialogService, CommonApiService } from '@app/shared/services';
import { KnowledgeBaseDetailComponent } from '@app/ticket-administration/dialogs/knowledge-base-detail/knowledge-base-detail.component';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-ticket-sub-type-list',
  templateUrl: './ticket-sub-type-list.component.html',
  styleUrls: ['./ticket-sub-type-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketSubTypeListComponent implements OnInit {
  public rowSelection;
  public gridData: any;
  public gridColumnApi;
  ticketTypeID: string;
  ticketTypeName: string;
  ticketTypeDepartment: string;
  ticketSubTypeList: any;
  public domLayout;
  private viewContainerRef: ViewContainerRef;


  constructor(private router: Router, private route: ActivatedRoute, private _dialogservice: DialogService,
    private messageService: MessageService, private cdr: ChangeDetectorRef, private _commonAPI: CommonApiService, private zone: NgZone) { }

  gridOptions: GridOptions = {
    columnDefs: [
      {
        rowDrag: true, colId: 'drag', width: 10, lockPosition: true, suppressMenu: true, valueGetter: (params) => {
          return params.data.name;
        }
      },
      { headerName: 'Sub Type', field: 'name', filter: true, width: 130, lockPosition: true, suppressMenu: true, },
      { headerName: 'When To Use', field: 'whenToUse', width: 270, filter: true, lockPosition: true, suppressMenu: true, },
      {
        width: 60,
        cellStyle: { textAlign: 'center' },
        suppressMenu: true,
        suppressSorting: true,
        template:
          `<a class="cursor-pointer" data-action-type="knowledge" style="color: #337ab7;">
            Knowledge Base
          </a>`
      },
      {
        width: 40,
        cellStyle: { textAlign: 'center' },
        suppressMenu: true,
        suppressSorting: true,
        template:
          `<a class="cursor-pointer" data-action-type="edit" style="color: #337ab7;">
            Edit
          </a>`
      },
    ],
    rowData: [this.domLayout = 'autoHeight',
    this.rowSelection = 'single']
  }

  /**
    * @author Pearly Shah
    * @createdDate 08/08/2019
    * @description ag-grid click event
    * @memberOf TicketSubTypeListComponent
    */

  public onButtonClicked(e) {
    if (e.event.target !== undefined) {
      const data = e.data;
      const actionType = e.event.target.getAttribute('data-action-type');

      switch (actionType) {
        case 'knowledge':
          return this.newComponentOpen(data);
        case 'edit':
          return this.edit(data);
      }
    }
  }


  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description Redirect to manage ticket sub type with subType id
  * @memberOf TicketSubTypeListComponent
  */

  edit(event) {
    // subtype-list/:department/:id/:subid
    this.router.navigate(['ticket-admin', 'subtype-list', this.ticketTypeDepartment, this.ticketTypeID, event.id]);
  }


  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description Redirecting to ticket type list component
  * @memberOf TicketSubTypeListComponent
  */

  backToListing(event: any) {
    this.router.navigate(['ticket-admin', 'ticketType']);
  }


  onGridReady(params) {
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description navigates to manage ticket sub type for new  
  * @memberOf TicketSubTypeListComponent
  */
  public manageTicketSubType(event?): void {
    this.router.navigate(['ticket-admin', 'subtype-list', this.ticketTypeDepartment, this.ticketTypeID, 'new']);
  }

  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description Opens Knowledge base dialog on button click of ag-grid
  * @memberOf TicketSubTypeListComponent
  */

  newComponentOpen(data) {
    console.log(data);
    data.typeId = this.ticketTypeID;
    data.department = this.ticketTypeDepartment;
    this._dialogservice.custom(KnowledgeBaseDetailComponent, { 'data': data, 'disableRemove': true },
    { keyboard: true, backdrop: true, size: 'lg' }).result.then((response) => {
        if (response) {
          this.getTypeList();
        }
        this.cdr.detectChanges();
      });
  }

  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description On page load api call for getting the ticket type list 
  * @memberOf TicketSubTypeListComponent
  */

  getTypeList() {
    const ticketTypeObject = { 'id': this.ticketTypeID, 'department': this.ticketTypeDepartment };
    this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_TICKET_SUB_TYPE_LIST, parameterObject: ticketTypeObject }).then(response => {
      if (response) {
        if (response.type) {
          this.ticketTypeName = response.type.name;
        }
        if (response.subTypeList && response.subTypeList.length > 0) {
          response.subTypeList.sort(function (a, b) { return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0); });
          this.gridOptions.rowData = response.subTypeList;
        }
        this.cdr.detectChanges();
      }
    }, error => {
      console.error(error);
    });
  }

  /**
  * @author Sheo Ouseph
  * @createdDate 11/08/2019
  * @description function to call API for reordering the sequence of the grid data
  * @memberOf TicketTypeListComponent
  */
  onRowDragEnd(event) {
    let rowData = this.gridOptions.rowData;
    let index = rowData.findIndex(t => t == event.node.data);
    if (index > -1) {
      rowData.splice(index, 1);
    }
    rowData.splice(event.overIndex, 0, event.node.data);
    let newOrderedId = [];
    rowData.forEach(element => {
      newOrderedId.push(element.id);
    });
    const reorderingObject = { reqType: 'typeSubTypes', department: this.ticketTypeDepartment, data: newOrderedId, typeId: this.ticketTypeID };

    this._commonAPI.getPromiseResponse({ apiName: APINAME.TICKET_REORDER, parameterObject: reorderingObject }).then(response => {
      this.zone.run(() => {
        this.messageService.showMessage('Ticket Sub Type List Reordered Successfully', 'success');
        this.cdr.detectChanges();
      });

    }, error => {
      console.error(error);
    });
  }

  onRowDragLeave(event) {
    let rowData = this.gridOptions.rowData;
    let index = rowData.findIndex(t => t == event.node.data);
    if (index > -1) {
      rowData.splice(index, 1);
    }
    rowData.splice(event.node.childIndex, 0, event.node.data);
    let newOrderedId = [];
    rowData.forEach(element => {
      newOrderedId.push(element.id);
    });
    const reorderingObject = { reqType: 'typeSubTypes', department: this.ticketTypeDepartment, data: newOrderedId, typeId: this.ticketTypeID };

    this._commonAPI.getPromiseResponse({ apiName: APINAME.TICKET_REORDER, parameterObject: reorderingObject }).then(response => {
      this.zone.run(() => {
        this.messageService.showMessage('Ticket Sub Type List Reordered Successfully', 'success');
        this.cdr.detectChanges();
      });
    }, error => {
      console.error(error);
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ticketTypeID = params.id;
      this.ticketTypeDepartment = params.department;
      if (this.ticketTypeID && this.ticketTypeDepartment) {
        this.getTypeList();
      }
    });
    this.cdr.detectChanges();
  }

}
