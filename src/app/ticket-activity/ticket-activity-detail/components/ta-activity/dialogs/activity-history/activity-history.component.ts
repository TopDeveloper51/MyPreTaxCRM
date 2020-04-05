// External imports
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

// Internal imports
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';

@Component({
  selector: 'mtpo-activity-history',
  templateUrl: './activity-history.component.html',
  styleUrls: ['./activity-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TicketActivityDetailService]
})

export class ActivityHistoryComponent implements OnInit {
  // private variable
  private historyData: any = [];
  // public variable
  public data: any;
  public apiParam;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public rowData = [];
  public columnDefs;
  public enableBrowserTooltips;
  constructor(private cdr: ChangeDetectorRef,
    private ticketActivityDetailService: TicketActivityDetailService,
    private modal: NgbActiveModal) {

    this.columnDefs = [
      { headerName: 'Name', headerTooltip: 'name', field: 'name', width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Old Value', headerTooltip: 'Old Value', field: 'oldValue', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'New Value', headerTooltip: 'New Value', field: 'newValue', tooltipField: 'status', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Updated By', headerTooltip: 'Updated By', field: 'updatedBy', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Updated Date', headerTooltip: 'Updated Date', field: 'updatedDate', tooltipField: 'status', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, sort: 'asc', },
    ],
      this.enableBrowserTooltips = true,
      this.domLayout = "autoHeight";
  }

  /**
     * @author Satyam Jasoliya
     * @createdDate 12/11/2019
     * @description get activity history data
     * @memberof ActivityHistoryComponent
     */
  getActivityHistoryData() {
    const self = this;
    const object: any = { 'ID': this.data.data }
    this.ticketActivityDetailService.getActivityHistory(object).then((response: any) => {
      response.forEach((objData: any) => {
        objData.field.forEach((objField: any) => {
          if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate'
            && objField.name !== 'documentList' && objField.name !== 'contactPerson') {
            if (objField.name !== 'datetime' && objField.name !== 'plannedDateTime') {
              self.historyData.push({
                'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                'oldValue': objField.oldValue,
                'newValue': objField.newValue,
                'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm a'),
                'updatedBy': objData.updatedByName
              });
            } else {
              if (moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a') !== moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a')) {
                // !angular.equals($filter('date')(objField.oldValue, 'MM/dd/yyyy hh:mm a'), $filter('date')(objField.newValue, 'MM/dd/yyyy hh:mm a'))) {
                self.historyData.push({
                  'name': objField.name[0].toUpperCase() + objField.name.slice(1),
                  'oldValue': moment(objField.oldValue).format('MM/DD/YYYY hh:mm:ss a'),
                  'newValue': moment(objField.newValue).format('MM/DD/YYYY hh:mm:ss a'),
                  'updatedDate': moment(objData.updatedDate).format('MM/DD/YYYY hh:mm a'),
                  'updatedBy': objData.updatedByName
                });
              }
            }
          }
        });
      });
      self.rowData = self.historyData;
      this.cdr.detectChanges();
    });
  }

  /**
     * @author Satyam Jasoliya
     * @createdDate 12/11/2019
     * @description close dialog
     * @memberof ActivityHistoryComponent
     */
  close(): void {
    this.modal.close();
    this.cdr.detach();
  }


  /**
     * @author Satyam Jasoliya
     * @createdDate 12/11/2019
     * @description ongrid ready
     * @memberof ActivityHistoryComponent
     */
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  ngOnInit() {
    this.getActivityHistoryData();
  }


}
