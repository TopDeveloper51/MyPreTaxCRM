//External Imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import * as moment from 'moment-timezone';

//Internal Imports
import { CommonApiService, CDRService } from '@app/shared/services';
import { APINAME } from '@app/conversion/conversion-constant';
import { environment } from '@environments/environment';
import { ConversionService } from '@app/conversion/conversion.service';

@Component({
  selector: 'app-conversion-report',
  templateUrl: './conversion-report.component.html',
  styleUrls: ['./conversion-report.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionReportComponent implements OnInit {

  public formConversionReport: FormGroup;
  public gridColumnApi;
  public domLayout;
  public gridData: any;
  public detailCellRendererParams;
  public columnDefs: ColDef[]; // holds column defination data
  public rowData = [this.domLayout = 'autoHeight'];
  public res = [];
  public id;
  public isExpandFromFail: boolean = false;
  public data;
  public getRowHeight;
  public selectedTabName: string = 'report'; // Selected Tab Name
  public yearList = [
    { id: '2018', name: '2018' },
    { id: '2019', name: '2019' }
  ];
  public softwareList = [
    { id: '', name: '' },
    { id: 'ATX', name: 'ATX' },
    { id: 'ProSeries', name: 'ProSeries' },
    { id: 'CrossLink', name: 'CrossLink' },
    { id: 'Drake', name: 'Drake' },
    { id: 'Lacerte', name: 'Lacerte' },
    { id: 'OLTPRO', name: 'OLTPRO' },
    { id: 'TaxAct', name: 'TaxAct' },
    { id: 'TaxWise', name: 'TaxWise' },
    { id: 'TurboTax', name: 'TurboTax' },
    { id: 'UltraTax', name: 'UltraTax' },
    { id: 'TaxSlayer', name: 'TaxSlayer' },
    { id: 'ProSystemfx', name: 'ProSystemfx' }
  ];
  constructor(private fb: FormBuilder,
    private _commonAPI: CommonApiService,
    private conversionService: ConversionService,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef) {
    const self = this;
    this.columnDefs = [
      {
        field: 'conversionJobId', headerTooltip: 'Conversion Job ID', width: 300,
        suppressMovable: true, suppressMenu: true, cellRenderer: 'agGroupCellRenderer', sortable: true
      },
      {
        headerName: 'Email', headerTooltip: 'Email', field: 'email',
        suppressMovable: true, suppressMenu: true, width: 170, sortable: true,
      },
      {
        headerName: 'Created Date', headerTooltip: 'Created Date', field: 'createdDate', sortable: true,
        suppressMovable: true, suppressMenu: true, width: 150
      },
      {
        headerName: 'Running Since', headerTooltip: 'Running Since', field: 'runningSince',
        suppressMovable: true, suppressMenu: true, width: 100, sortable: true
      },
      {
        headerName: 'Software', headerTooltip: 'Software', sortable: true, field: 'softwareName',
        suppressMovable: true, suppressMenu: true, width: 100
      },
      {
        headerName: 'TaxYear', headerTooltip: 'TaxYear', sortable: true, field: 'taxYear',
        suppressMovable: true, suppressMenu: true, width: 80
      },
      {
        headerName: 'Total', headerTooltip: 'Total', sortable: true, field: 'total',
        suppressMovable: true, suppressMenu: true, width: 80, enableValue: true
      },
      {
        headerName: 'Valid', headerTooltip: 'Valid', sortable: true, field: 'valid',
        suppressMovable: true, suppressMenu: true, width: 80
      },
      {
        headerName: 'Uploaded', headerTooltip: 'Uploaded', sortable: true, field: 'Uploaded',
        suppressMovable: true, suppressMenu: true, width: 100
      },
      {
        headerName: 'Open', headerTooltip: 'Open', sortable: true, field: 'Open',
        suppressMovable: true, suppressMenu: true, width: 80
      },
      {
        headerName: 'Print InProcess', headerTooltip: 'Print InProcess', sortable: true, field: 'PrintInProcess',
        suppressMovable: true, suppressMenu: true, width: 100
      },
      {
        headerName: 'Print Failed', headerTooltip: 'Print Failed', sortable: true, field: 'PrintFailed',
        suppressMovable: true, suppressMenu: true, width: 100, cellStyle: this.cellStyling
      },
      {
        headerName: 'C.Ready', headerTooltip: 'Conversion Ready', sortable: true, field: 'ConversionReady',
        suppressMovable: true, suppressMenu: true, width: 80
      },
      {
        headerName: 'C.InProcess', headerTooltip: 'Conversion InProcess', sortable: true,
        field: 'ConversionInProcess', suppressMovable: true, suppressMenu: true, width: 100
      },
      {
        headerName: 'C.Failed', headerTooltip: 'Conversion Failed', sortable: true, field: 'ConversionFailed',
        suppressMovable: true, suppressMenu: true, width: 80, cellStyle: this.cellStyling,
      },
      {
        headerName: 'C.Success', headerTooltip: 'Conversion Success', sortable: true, field: 'Success',
        suppressMovable: true, suppressMenu: true, width: 80
      },
    ],
      this.detailCellRendererParams = {
        detailGridOptions: {
          columnDefs: [
            { headerName: 'JobId', field: 'JobId', sortable: true, suppressMovable: true, suppressMenu: true, width: 150, cellStyle: { 'padding-top': '5px' } },
            { headerName: 'Backup FileName', field: 'backUpFileName', sortable: true, suppressMovable: true, suppressMenu: true, width: 250, cellStyle: { 'padding-top': '5px' } },
            {
              headerName: 'Created Date', sortable: true, field: 'createdDate', suppressMovable: true,
              suppressMenu: true, width: 200, cellStyle: { 'padding-top': '5px' }
            },
            {
              headerName: 'Updated Date', field: 'updatedDate', suppressMovable: true, sortable: true,
              suppressMenu: true, width: 200, cellStyle: { 'padding-top': '5px' }
            },
            { headerName: 'Server', field: 'server', sortable: true, suppressMovable: true, suppressMenu: true, width: 150, cellStyle: { 'padding-top': '5px' } },
            { headerName: 'SSN/EIN', field: 'ssn', sortable: true, suppressMovable: true, width: 130, cellStyle: { 'padding-top': '5px' } },
            {
              headerName: 'Calculation Difference', sortable: true, field: 'calculationDiffrence',
              suppressMovable: true, suppressMenu: true, width: 150, cellStyle: { 'padding-top': '5px' }
            },
            { headerName: 'Status', field: 'status', sortable: true, suppressMovable: true, suppressMenu: true, width: 150, cellStyle: { 'padding-top': '5px' } },
            { headerName: 'Failure Reason', field: 'failureReason', sortable: true, suppressMovable: true, suppressMenu: true, width: 150, cellStyle: { 'padding-top': '5px' } },
            { headerName: 'Pdf Name', field: 'pdfName', suppressMovable: true, sortable: true, suppressMenu: true, width: 200, cellStyle: { 'padding-top': '5px' } },
            {
              headerName: 'PDF Download', width: 120, suppressMovable: true, cellStyle: { textAlign: 'center' },
              field: 'pdfName', suppressMenu: true,
              cellRenderer: (params) => {
                if (params.data.pdfName) {
                  return ' <i data-action-type="download" class="fa fa-download cursor_pointer" style="font-size:20px;padding-top:8px"></i>';
                } else {
                  return '';
                }
              }
            },
          ],
          onFirstDataRendered(params) {
            params.api.sizeColumnsToFit();
          },
          getRowHeight() {
            const isDetailRow = self.res;
            if (isDetailRow) {
              const detailPanelHeight = 40 //self.res.length * 50;
              // dynamically calculate detail row height
              return detailPanelHeight;
            } else {
              // for all non-detail rows, return 25, the default row height
              return 25;
            }
          },
          onRowClicked(e) {
            if (e.event.target !== undefined) {
              const data = e.data;
              const actionType = e.event.target.getAttribute('data-action-type');
              switch (actionType) {
                case 'download':
                  return self.download(e);
              }
            }
          },
        },
        getDetailRowData(params) {
          self.id = params.data.conversionJobId;
          self.isExpandFromFail = params.data.isExpandFromFail;


          var jobDetailsObject = { 'conversionJobId': params.data.conversionJobId };
          if (self.isExpandFromFail) {
            jobDetailsObject['status'] = 5;
          }
          else if (params.data.isExpandForPrintFailed) {
            jobDetailsObject['status'] = 2;
          }

          if (params.data.isExpandFromFail) {
            params.data.isExpandFromFail = false;
          }
          else if (params.data.isExpandForPrintFailed) {
            params.data.isExpandForPrintFailed = false;
          }

          self.conversionService.getConversionJobDetail(jobDetailsObject).then((response: any) => {
            if (response) {
              self.res = response.conversionList;
              if (response.conversionSummary && response.conversionSummary.length > 0) {
                let summary = '<div style="padding: 15px; box-sizing: border-box;font-size: 14px; background:none;">';
                summary += `<div style='margin:5px 0px;'><strong>Conversion Fail: ${response.conversionSummary.reduce((total, currentValue) => total + currentValue.count, 0)} </strong></div>`;
                response.conversionSummary.forEach(element => {
                  summary += `<span class="span-count-ui">${element.failureReason}: <strong>${element.count}</strong></span>`;
                });
                summary += '<div ref="eDetailGrid" style="height: 90%;"></div>';
                summary += "</div>";
                params.node.detailGridInfo.api.headerRootComp.eGui.insertAdjacentHTML('beforebegin', summary)
              }

            } else {
              // self.res = [self.domLayout = 'autoHeight'];
              self.res = [];
            }
            params.successCallback(self.res);
          });
        },
      };
  }

  cellStyling(params: any) {
    if (params.value) {
      return { 'color': 'blue', 'cursor': 'pointer', 'text-decoration': 'underline' };
    } else {
      return {};
    }
  }

  /**
  * @author shreya kanani
  * @description  create Conversion Form
  * @memberOf ConversionReportComponent
  */

  public createConversionForm() {
    this.formConversionReport = this.fb.group({
      startDate: [''],
      endDate: [''],
      taxYear: [undefined],
      softwareName: [undefined],
      email: ['']
    });
    this.cdrService.callDetectChanges(this.cdr);
  }


  /**
  * @author shreya kanani
  * @description expand or collapse detail grid on Conversion fail click
   * @memberof ConversionReportComponent
   */
  public onCellClicked(e) {
    if (e.colDef.field == 'ConversionFailed') {
      if (e.data.ConversionFailed) {
        this.gridData.forEachNode((node) => {
          if (e.node.id == node.id) {
            if (e.node.data.isExpandForPrintFailed) {
              node.expanded = false;
              e.node.data.isExpandForPrintFailed = false;
            }
            if (!node.expanded) {
              e.node.data.isExpandFromFail = true;
              node.setExpanded(true);
            }
            else {
              if (e.node.data['expandFrom']) {
                e.node.data.isExpandFromFail = false;
              }
              node.setExpanded(false);
            }
          }
        });
      }
    }
    else if (e.colDef.field == 'PrintFailed') {
      if (e.data.PrintFailed) {
        this.gridData.forEachNode((node) => {
          if (e.node.id == node.id) {
            if (e.node.data.isExpandFromFail) {
              node.expanded = false;
              e.node.data.isExpandFromFail = false;
            }
            if (!node.expanded && !e.node.data.isExpandForPrintFailed) {
              e.node.data.isExpandForPrintFailed = true;
              node.setExpanded(true);
            }
            else {
              if (e.node.data['expandFrom']) {
                e.node.data.isExpandForPrintFailed = false;
              }
              node.setExpanded(false);
            }
          }
        });
      }
    }
  }


  /**
  * @author shreya kanani
  * @description Search
  * @memberOf ConversionReportComponent
  */

  search() {
    let conversionReportObject = this.formConversionReport.value;
    this.conversionService.getConversionReport(conversionReportObject).then((response: any) => {
      if (response) {
        response.forEach(element => {
          if ((element.Uploaded !== (element.PrintInProcess + element.PrintFailed + element.ConversionInProcess + element.ConversionFailed + element.Success)) && element.PrintStartDate) {
            const printDate = moment(element.PrintStartDate).tz('America/Tijuana');
            const now = moment().tz('America/Tijuana');
            element.runningSince = moment.utc(moment(now, 'HH:mm').diff(moment(printDate, 'HH:mm')))
              .tz('America/Tijuana').format('HH:mm');
          }
        });
      }
      this.rowData = response;
    },
      (error) => {
        //this.rowData = [];
      }
    )
    this.cdrService.callDetectChanges(this.cdr);
  }

  /**
   * @author shreya kanani
   * @description call on date change 
   */
  onDateChange() {
    setTimeout(() => {
      this.cdrService.callDetectChanges(this.cdr);
    }, 100);
  }

  /**
    * @author shreya kanani
    * @description Downloads pdf
    * @memberOf ConversionReportComponent
    */
  download(params) {
    const url = `${environment.originForConversion}${APINAME.DOWNLOAD_PDF}?conversionJobId=${this.id}&pdfName=${params.data.pdfName}`;
    window.location.href = url;
  }

  /**
    * @author shreya kanani
    * @description Interacts with the grid through the grid's interface.
    * @memberOf ConversionReportComponent
    */
  onGridReady(params) {
    this.data = params;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * @author shreya kanani
   * @description clear form data
   */
  clear() {
    this.formConversionReport.reset();
    this.search();
  }

  /**
   * @author shreya kanani
   * @description this method change tab
   */
  tabChanged(tabName) {
    if (tabName !== undefined) {
      this.selectedTabName = tabName;
    }
  }

  ngOnInit(): void {
    this.createConversionForm();
    this.search();
  }

}
