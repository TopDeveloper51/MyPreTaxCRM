// external import
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
// internal import
import { MessageService, DataStoreService, CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-ticket-type-list',
  templateUrl: './ticket-type-list.component.html',
  styleUrls: ['./ticket-type-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketTypeListComponent implements OnInit {

  ticketTypeListForm: FormGroup;
  public gridColumnApi;
  public domLayout;
  public gridData: any;
  public selectedRows;
  public rowSelection;
  public gridApi;

  constructor(private fb: FormBuilder, private router: Router, private cdr: ChangeDetectorRef,
    private dataStoreService: DataStoreService, private messageService: MessageService,
    private _commonAPI: CommonApiService, private zone: NgZone) { }

  statusList = [{ id: 0, name: 'Active' }, { id: 1, name: 'Inactive' }];
  department = [
    {
      'id': 'Development',
      'name': 'Development'
    },
    {
      'id': 'Sales',
      'name': 'Sales'
    },
    {
      'id': 'Setup',
      'name': 'Setup'
    },
    {
      'id': 'Support',
      'name': 'Support'
    },
    {
      'id': 'Renew',
      'name': 'Renew'
    }
  ];

  gridOptions: GridOptions = {
    columnDefs: [
      {
        rowDrag: true, colId: 'drag', width: 10, lockPosition: true, suppressMenu: true, valueGetter: (params) => {
          return params.data.department;
        }
      },
      { headerName: 'Department', field: 'dep', width: 70, lockPosition: true, suppressMenu: true },
      { headerName: 'Name', field: 'name', filter: true, width: 250, lockPosition: true, suppressMenu: true },
      {
        headerName: 'Active', field: 'status', width: 50, lockPosition: true, suppressMenu: true, headerClass: 'padding_left_36',
        // cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => {
          if (params.data.status === 0) {
            return '<img src = "assets/images/Approved.png">';
          }
        }
      },
      {
        width: 80,
        lockPosition: true, suppressMenu: true,
        cellStyle: { textAlign: 'center' },
        template:
          `<a class="cursor-pointer" data-action-type="editManageTicketType" style="color: #337ab7;">
            Manage Type And Field
          </a>`
      },
      {
        width: 80,
        lockPosition: true, suppressMenu: true,
        cellStyle: { textAlign: 'center' },
        template:
          `<a class="cursor-pointer" data-action-type="editManageSubType" style="color: #337ab7;">
            Manage Sub Type List
          </a>`
      }
    ],
    rowData: [this.domLayout = 'autoHeight']
  };

  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description   Interacts with the grid through the grid's interface.
  * @memberOf TicketTypeListComponent
  */

  onGridReady(params) {
    this.gridApi = params.api;

    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }


  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description  createTicketTypeListForm
  * @memberOf TicketTypeListComponent
  */

  createTicketTypeListForm() {
    this.ticketTypeListForm = this.fb.group({
      department: new FormArray([]),
      ticketType: this.fb.control(''),
      status: this.fb.control(0)
    });
    this.addCheckboxes();
    this.cdr.detectChanges();
  }

  private addCheckboxes() {
    this.department.map((o, i) => {
      const control = new FormControl(i === 2); // if first item set to true, else false
      (this.ticketTypeListForm.controls.department as FormArray).push(control);
    });
  }

  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description  createDepartments (checkbox group)
  * @memberOf TicketTypeListComponent
  */

  onChange(isChecked: boolean, dep: string) {
    const formArray = <FormArray>this.ticketTypeListForm.get('departments');

    if (isChecked) {
      formArray.push(new FormControl(dep));
    } else {
      const index = formArray.controls.findIndex(x => x.value === dep);
      formArray.removeAt(index);
    }
  }

  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description Search
  * @memberOf TicketTypeListComponent
  */
  search() {
    this.dataStoreService.setData('ticketTypeList', this.ticketTypeListForm.value);
    const selectedDept = [];
    for (const index in this.ticketTypeListForm.value.department) {
      if (this.ticketTypeListForm.value.department[index]) {
        selectedDept.push(this.department[index].name);
      }
    }
    const ticketListObject = {
      'departmentList': selectedDept,
      'statusList': [this.ticketTypeListForm.value.status], // status: { active: 0, inActive: 1, archive: 2, deleted: 3 }
      'nameList': [this.ticketTypeListForm.value.ticketType]
    };
    this.gridOptions.rowData = [];
    let isOnlyOneDepartment = true;
    let isStatusInActive = false;
    this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_TICKET_LIST, parameterObject: ticketListObject }).then(response => {
      response.sort(function (a, b) { return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0); });
      if (response && response.length > 0) {
        const firstDepartment = response[0].department;
        if (response[0].status == 1) {
          isStatusInActive = true
        } else {
          isStatusInActive = false;
        }

        response.forEach(element => {
          element.dep = element.department[0].toUpperCase() + element.department.substr(1).toLowerCase();
          if (element.department !== firstDepartment) {
            isOnlyOneDepartment = false;
          }
        });
      }
      this.gridOptions.rowData = response;
      this.cdr.detectChanges();
      setTimeout(() => {
        if (this.gridData) {
          if (isOnlyOneDepartment && !isStatusInActive) {
            this.gridApi.setSuppressRowDrag(false);
            this.gridColumnApi.setColumnVisible('drag', true);
          } else {
            this.gridApi.setSuppressRowDrag(true);
            this.gridColumnApi.setColumnVisible('drag', false);
            this.gridApi.sizeColumnsToFit();
          }
        }
      }, 0);

    }, error => {
      console.error(error);
    });
  }

  public setOrRemoveDragIcon() {
    if (this.gridData) {
      this.gridApi.setSuppressRowDrag(true);
    }
  }

  /**
   * @author Dhruvi shah
   * @createdDate 19/12/2019
   * @description function to open sub type and ticket type in new tab
   * @param {*} e
   * @memberof TicketTypeListComponent
   */
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const data = e.data;
      const actionType = e.event.target.getAttribute('data-action-type');

      switch (actionType) {
        case 'editManageSubType':
          window.open('/#/ticket-admin/subtype-list/' + data.department + '/' + data.id, '_blank');
          break;
        case 'editManageTicketType':
          window.open('/#/ticket-admin/' + data.department + '/' + data.id, '_blank');
          break;
      }
    }
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

    const reorderingObject = { reqType: 'types', department: this.gridOptions.rowData[0].department, data: newOrderedId };
    this._commonAPI.getPromiseResponse({ apiName: APINAME.TICKET_REORDER, parameterObject: reorderingObject }).then(response => {
      this.zone.run(() => {
        this.messageService.showMessage('Ticket Type List Reordered Successfully', 'success');
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

    const reorderingObject = { reqType: 'types', department: this.gridOptions.rowData[0].department, data: newOrderedId };
    this._commonAPI.getPromiseResponse({ apiName: APINAME.TICKET_REORDER, parameterObject: reorderingObject }).then(response => {
      this.zone.run(() => {
        this.messageService.showMessage('Ticket Type List Reordered Successfully', 'success');
      });
    }, error => {
      console.error(error);
    });
  }

  /**
    * @author Pearly Shah
    * @createdDate 08/08/2019
    * @description  convenience getter for easy access to form fields
    * @memberOf TicketTypeListComponent
    */
  get ticketTypeListFormValue() { return this.ticketTypeListForm.controls; }

  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description navigates to Manage Ticket type Component on row click
  * @memberOf TicketTypeListComponent
  */

  public manageTicketType(): void {
    this.router.navigate(['ticket-admin', 'new']);
  }

  ngOnInit() {
    this.createTicketTypeListForm();
    const ticketTypeListData = this.dataStoreService.getStoredData('ticketTypeList');
    if (ticketTypeListData !== undefined) {
      this.ticketTypeListForm.setValue({
        department: ticketTypeListData.department,
        ticketType: ticketTypeListData.ticketType,
        status: ticketTypeListData.status
      });
    }
    this.search();
  }

}
