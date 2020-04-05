import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CustomerWebsiteVisitService } from '@app/customer/customer-website-visit/customer-website-visit.service';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-customer-website-visit',
  templateUrl: './customer-website-visit.component.html',
  styleUrls: ['./customer-website-visit.component.scss']
})
export class CustomerWebsiteVisitComponent implements OnInit {

  @Input() customerID: any;
  //grid related variables
  public apiParam;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public getRowHeight;
  public rowData: any = [this.domLayout = 'autoHeight'];
  public columnDefs:any;
  public enableBrowserTooltips;
  public year = [{ 'id': '2014', 'name': '2014' }, { 'id': '2015', 'name': '2015' }, { 'id': '2016', 'name': '2016' }, { 'id': '2017', 'name': '2017' }, { 'id': '2018', 'name': '2018' }, { 'id': '2019', 'name': '2019' }]
  public websiteVisitList: any = {}; // store response of api
  public yearTopass: any = "2019"; // set default year

  constructor(private customerWebsiteVisitService: CustomerWebsiteVisitService,
    private cdr: ChangeDetectorRef
  ) { 
    this.columnDefs = [
      { headerName: 'Date', headerTooltip: 'Date', field: 'Date', width: 200, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Page', headerTooltip: 'Page', field: 'page', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Source', headerTooltip: 'Source', field: 'source', tooltipField: 'status', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Referrer Name', headerTooltip: 'Referrer Name', field: 'referrerName', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Referrer URL', headerTooltip: 'Referrer URL', field: 'referrerUrl', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Saving calculator detail?', headerTooltip: 'Saving calculator detail?', field: '', filter: true, width: 230, lockPosition: true, suppressMenu: true, sortable: true },
    ],
    this.enableBrowserTooltips = true;
    this.domLayout = "autoHeight";
  }


  // public gridOptions: GridOptions = {
  //   columnDefs: [
  //     { headerName: 'Date', headerTooltip: 'Date', field: 'Date', width: 180, lockPosition: true, suppressMenu: true, sortable: true, },
  //     { headerName: 'Page', headerTooltip: 'Page', field: 'page', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
  //     { headerName: 'Source', headerTooltip: 'Source', field: 'source', tooltipField: 'status', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
  //     { headerName: 'Referrer Name', headerTooltip: 'Referrer Name', field: 'referrerName', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
  //     { headerName: 'Referrer URL', headerTooltip: 'Referrer URL', field: 'referrerUrl', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
  //     { headerName: 'Saving calculator detail?', headerTooltip: 'Saving calculator detail?', field: '', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
  //   ],
  // //  enableBrowserTooltips: true,
    
  // };

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }
  getWebsiteListData(data) {
    if (data) {
      const object: any = { 'customerId': this.customerID, year: data };  //"b99864d0-c376-47cc-9d6f-e6db9209f7cd"
      this.customerWebsiteVisitService.getWebsiteList(object).then((response: any) => {
        this.rowData = response.websiteVisitData ? response.websiteVisitData : [];
        if (this.rowData) {
          for (let obj of this.rowData) {
            if (obj['date']) {
              obj['Date'] = moment(obj['date']).tz('America/New_York').format('MM/DD/YY hh:mm A');
            }
          }
        }
        this.cdr.detectChanges();
      });
    }
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.getWebsiteListData(this.yearTopass);
  }

}
