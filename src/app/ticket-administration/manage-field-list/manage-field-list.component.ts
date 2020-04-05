// External Imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, OnDestroy, ViewContainerRef } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
// Internal Imports
// import { ModalServiceService } from '../../core/services/modal-service.service';
import { ManageFieldListFormComponent } from '@app/ticket-administration/dialogs/manage-field-list-form/manage-field-list-form.component';
import { MessageService, DialogService, CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-manage-field-list',
  templateUrl: './manage-field-list.component.html',
  styleUrls: ['./manage-field-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageFieldListComponent implements OnInit, OnChanges {
  public getTicketTypeDetailsResponse;
  public rowSelection;
  private gridColumnApi;
  public gridData: any;
  public params: any;
  private editClicked;
  public editType;
  public domLayout;
  private viewContainerRef: ViewContainerRef;


  public columnDefs: any;
  public sideBar: any;
  public multiSortKey: string;
  public animateRows: string;
  public floatingFilter: string;
  public defaultColDef: any;
  public rowData: any = [];
  public availableData: any = [];


  constructor(private fb: FormBuilder, private router: Router,
    private cdr: ChangeDetectorRef, private commonApiService: CommonApiService,
    private dialogservice: DialogService,
    private messageservice: MessageService) {

    this.columnDefs = [

      { headerName: 'Name', field: 'label', filter: true, width: 50, lockPosition: true, suppressMenu: true, },
      { headerName: 'Input Type', field: 'inputType', width: 30, filter: true, lockPosition: true, suppressMenu: true, },
      {
        headerName: 'Active', field: 'status', width: 15, sortable: false, lockPosition: true, suppressMenu: true, headerClass: 'padding_left_24', cellStyle: { textAlign: 'center' }, cellRenderer: function (params) {
          if (params.data.status === 0) {
            return '<img src = "assets/images/Approved.png">';
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Action', width: 30, lockPosition: true, suppressMenu: true, sortable: false,
        template:
          `<a class="cursor-pointer" data-action-type="edit" style="color: #337ab7;">
              Edit
            </a> 
            
            <a *ngIf="environment.betaOnly" class="ml-5 cursor-pointer" data-action-type="delete" style="color: #337ab7;">
            Delete
            </a>`,
        tooltip: () => {
          return '';
        }
      }
    ],
      this.sideBar = {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
          },
          {
            id: "filters",
            labelDefault: "Filters",
            labelKey: "filters",
            iconKey: "filter",
            toolPanel: "agFiltersToolPanel"
          },
        ]
      };
    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      resizable: true,
      tooltip: (p: any) => {
        return p.value;
      },
      suppressMaxRenderedRowRestriction: true,
      suppressColumnVirtualisation: true
    };
    this.multiSortKey = 'ctrl';
    this.animateRows = 'true';
    this.floatingFilter = 'true';
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getFieldList() {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_FIELD_LIST, parameterObject: {} }).then(response => {
      this.availableData = response;
      this.rowData = response;
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
    });
  }

  onRowClicked(e) {
    if (e.event.target !== undefined) {
      const data = e.data;
      const actionType = e.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit':
          return this.editField(data);
        case 'delete':
          return this.deleteField(data);
      }
    }
  };

  editField(data) {
    const selectedRows = this.gridData.getSelectedRows();
    this.dialogservice.custom(ManageFieldListFormComponent, { title: 'Edit Manage Field', type: 'edit', data: data }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then((dialogresponse) => {
      if (dialogresponse) {
        this.getFieldList();
      }
    });
  }

  deleteField(data) {
    const dialogData = { title: 'Confirmation', text: 'Are you sure you want to delete the Ticket Type?' };
    this.dialogservice.confirm(dialogData, {}).result.then((dialogresponse) => {
      if (dialogresponse == 'YES') {
        const fieldObject = { 'id': data.id };
        this.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_FIELD_LIST, parameterObject: fieldObject }).then(response => {
          this.getFieldList();
          this.messageservice.showMessage('Field List deleted successfully', 'success');
          this.cdr.detectChanges();
        }, error => {
          this.messageservice.showMessage('Field List deletion Unsuccessful', 'error');
          console.error(error);
        });
      }
    });
  }

  public addField() {
    this.dialogservice.custom(ManageFieldListFormComponent, { title: 'Add Manage Field', type: 'add' }, { keyboard: true, backdrop: 'static', size: 'lg' })
      .result.then((dialogresponse) => {
        if (dialogresponse) {
          this.getFieldList();
        }
      });
  }

  ngOnInit() {
    this.getFieldList();
  }

  ngOnChanges() { }
}
