import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

// Internal imports
import { CheckBoxEditor } from '@app/ticket-administration/component/checkbox-editor.component';

@Component({
  selector: 'app-manage-ticket-sub-type-grid',
  templateUrl: './manage-ticket-sub-type-grid.component.html',
  styleUrls: ['./manage-ticket-sub-type-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ManageTicketSubTypeGridComponent implements OnInit {
  @Output() ticketSubTypeGridData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public manageTicketSubTypeData: any = [];
  public rowSelection;
  private gridColumnApi;
  public gridData: any;
  public params: any;
  domLayout: any;
  startEditing: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  gridOptions = {
    columnDefs: [
      { headerName: 'Field Name', field: 'label', sortable: true, filter: true, width: 100, lockPosition: true, suppressMenu: true, },
      { headerName: 'Input Type', field: 'inputType', sortable: true, width: 70, filter: true, lockPosition: true, suppressMenu: true, },
      {
        headerName: 'Mandatory?',
        field: 'isRequired',
        headerClass: 'padding_left_27',
        cellStyle: { textAlign: 'center' },
        cellRenderer: params => {
          return `<img ${params.value ? "src='assets/images/Approved.png'" : ''} />`;
        },
        cellEditor: 'checkBoxEditor',
        width: 40,
        sortable: true,
        editable: (params) => { return this.startEditing },
        lockPosition: true,
        suppressMenu: true
      },
      {
        headerName: 'Action', width: 30, lockPosition: true, suppressMenu: true,
        template:
          `<a class="cursor-pointer" data-action-type="editManageTicketSubType" style="color: #337ab7;">
            Edit
          </a> `
      }
    ],
    rowData: this.manageTicketSubTypeData,
    frameworkComponents: {
      checkBoxEditor: CheckBoxEditor,
    }
  }

  onCellEditingStopped() {
    this.startEditing = false;
  }

  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const data = e.data;
      const actionType = e.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'editManageTicketSubType':
          this.editRow(e);
      }
    }
  }

  editRow(event) {
    this.startEditing = true;
    this.gridData.setFocusedCell(event.rowIndex, 'isRequired');
    this.gridData.startEditingCell({
      rowIndex: event.rowIndex,
      colKey: 'isRequired',
    });
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  ngOnChanges(changes) {
    if (changes.manageTicketSubTypeData.currentValue) {
      this.gridOptions.rowData = this.manageTicketSubTypeData;
    } else {
      this.gridOptions.rowData = [this.domLayout = 'autoHeight'];
    }
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.ticketSubTypeGridData.emit(this.gridOptions);
  }
}
