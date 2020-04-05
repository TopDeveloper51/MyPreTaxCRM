import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-return-search-with-ssn-grid',
  templateUrl: './return-search-with-ssn-grid.component.html',
  styleUrls: ['./return-search-with-ssn-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnSearchWithSsnGridComponent implements OnInit {
  @Input() columnDefs: any;
  @Input() defaultColDef: any;
  @Input() rowData: any;
  @Input() animateRows: any;
  @Input() enableCellTextSelection: any;
  @Input() domLayout: any;
  @Input() getRowStyle: any;
  public gridApi;
  public gridColumnApi;
  public data: any;

  constructor(private cdr: ChangeDetectorRef) { }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  //  setTimeout(() => {
      this.data = this.rowData;
      this.cdr.detectChanges();
   // }, 2500);
  }

  ngOnInit() { }

}
