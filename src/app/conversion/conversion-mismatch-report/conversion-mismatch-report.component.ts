//External Imports
import { Component, OnInit,ChangeDetectionStrategy,ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment-timezone';
import { ColDef } from 'ag-grid-community';

//Internal Imports
import { CDRService } from '@app/shared/services';
import {ConversionService} from '@app/conversion/conversion.service';

@Component({
  selector: 'app-conversion-mismatch-report',
  templateUrl: './conversion-mismatch-report.component.html',
  styleUrls: ['./conversion-mismatch-report.component.scss'],
 // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionMismatchReportComponent implements OnInit {

  public domLayout;
  public gridData: any;
  public rowData = [this.domLayout = 'autoHeight'];
  public columnDefs: ColDef[]; // holds column defination data
  public dateToSearchOn:any;

  constructor(private cdrService: CDRService,private cdr: ChangeDetectorRef,private conversionService: ConversionService) {
    this.columnDefs = [
      {
        field: 'conversionJobID', headerTooltip: 'Conversion Job ID', width: 300, sortable: true,
        suppressMovable: true, suppressMenu: true,
      },
      {
        headerName: 'BackupFile', headerTooltip: 'BackupFile', field: 'backUpFileName', sortable: true,
        suppressMovable: true, suppressMenu: true, width: 300
      },
      {
        headerName: 'Status', headerTooltip: 'Status', field: 'sqlStatus', sortable: true,
        suppressMovable: true, suppressMenu: true, width: 200
      },
      {
        headerName: 'CB Status', headerTooltip: 'CB Status', field: 'cbStatus', sortable: true,
        suppressMovable: true, suppressMenu: true, width: 200
      },
      {
        headerName: 'Print Status', headerTooltip: 'Print Status', sortable: true, field: 'sqlPrintStatus',
        suppressMovable: true, suppressMenu: true, width: 200
      },
      {
        headerName: 'CB Print Status', headerTooltip: 'CB Print Status', sortable: true, field: 'cbPrintStatus',
        suppressMovable: true, suppressMenu: true, width: 200
      },
      {
        headerName: 'Conversion Status', headerTooltip: 'Conversion Status', sortable: true, field: 'sqlConversionStatus',
        suppressMovable: true, suppressMenu: true, width: 200
      },
      {
        headerName: 'CB Conversion Status', headerTooltip: 'CB Conversion Status', sortable: true, field: 'cbConversionStatus',
        suppressMovable: true, suppressMenu: true, width: 200
      }
    ]
  }

   /**
    * @author shreya kanani
    * @description call on date change
    * @memberOf ConversionMismatchReportComponent
    */
  onDateChange() {
    setTimeout(() => {
      this.cdrService.callDetectChanges(this.cdr);
    }, 100);
  }

   /**
    * @author shreya kanani
    * @description this method bind data in grid
    * @memberOf ConversionMismatchReportComponent
    */
  onGridReady(params) {
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
  }

   /**
    * @author shreya kanani
    * @description this method call search api for data 
    * @memberOf ConversionMismatchReportComponent
    */
  public search(): void {
    const conversionReportObject = {
      'date': this.dateToSearchOn ? moment(this.dateToSearchOn).format('YYYY-MM-DD') : '',
    };
    this.conversionService.getConversionMismatchReport(conversionReportObject).then((response:any) => {
      if (response) {
        this.rowData = response;
      }
    }, error => {
      console.log(error);
      this.rowData = [];
    })
    this.cdrService.callDetectChanges(this.cdr);
  }


  ngOnInit(): void {
    this.dateToSearchOn = moment(new Date()).format("YYYY-MM-DD");
    this.search();
  }

}
