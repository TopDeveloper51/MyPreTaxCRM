// External imports
import { AfterViewInit, Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular";
@Component({
  selector: 'app-ledger-inline-editor',
  templateUrl: './ledger-inline-editor.component.html',
  styleUrls: ['./ledger-inline-editor.component.scss']
})
export class LedgerInlineEditorComponent implements ICellEditorAngularComp, AfterViewInit, OnInit {
  // This component use for inline editing in customer-ledger grid
  @ViewChild("container", { static: true }) public container;
  constructor(private elementRef: ElementRef) { }
  public taxSeason: any = [];
  public taxyear: any = [];
  public offer:any = [];
  public offerYear:any = [];
  public params: any;
  public taxYearList: any = [
    { id: '2024', name: '2024' },
    { id: '2023', name: '2023' }, 
    { id: '2022', name: '2022' }, 
    { id: '2021', name: '2021' }, 
    { id: '2020', name: '2020' },
    { id: '2019', name: '2019' }, 
    { id: '2018', name: '2018' }, 
    { id: '2017', name: '2017' }, 
    { id: '2016', name: '2016' }, 
    { id: '2015', name: '2015' }, 
    { id: '2014', name: '2014' }];
    
  public offerListLookUp: any = [ 
   { id:1, name: '6 year (18-23)' },
   { id:2, name: '5 year (19-23)' }, 
   { id:3, name: '5 year (18-22)' }, 
   { id:4, name: '4 year (18-21)' }, 
   { id:5, name: '4 year (19-22)' }, 
   { id:6, name: '3 for 2 (19-21)' }, 
   { id:7, name: '3 for 2 (20-22)' }, 
   { id:8, name: '2 for 1 (2019)' }, 
   { id:9, name: '2 for 1 (2018)' }, 
   { id:10, name: '2 year' }];

    /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description view wise editing row added
* @memberof LedgerInlineEditorComponent
*/ 
  agInit(params: any): void {
    this.params = params;
    if(params.colDef && params.colDef.field === 'taxSeasonInShort')  // normal view 1 field season make editable
    {
      this.taxSeason = params.data.taxSeason;
    }
    else if(params.colDef && params.colDef.field === 'offerName') // full view season and offer field make editable
    {
      this.offer = params.data.offer;
    }
  }

   /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description get taxseason value
* @memberof LedgerInlineEditorComponent
*/ 
  getValue(): any {
    if(this.params.colDef && this.params.colDef.field === 'taxSeasonInShort') {
      this.taxyear = [];
      this.taxSeason.forEach(str => {
        this.taxyear.push(str.slice(2, 4));
      });
      return this.taxyear;
    }
  }

  isPopup(): boolean {
    return true;
  }

   /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description dropdown vaule select all method
* @memberof LedgerInlineEditorComponent
*/ 

  public onSelectAll(event): void {
    let selected = [];
    this.taxyear = [];
    selected = this.taxYearList.map(
      item => item.id
    );
    this.taxyear = selected;
    this.taxSeason = JSON.parse(JSON.stringify(this.taxyear));
  }

   /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description dropdown value clear method
* @memberof LedgerInlineEditorComponent
*/ 
  public onClearAll(): void {
    this.taxyear = [];
    this.taxSeason = JSON.parse(JSON.stringify(this.taxyear));
  }

  onKeyDown(event): void {
    console.log(event);
    let key = event.which || event.keyCode;
    if (key == 37 ||  // left
      key == 39 || key === 1) {  // right
      event.preventDefault();
      event.stopPropagation();
    }
    this.elementRef.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
      .addEventListener('click', (event) => {
        console.log(event);
        event.preventDefault();
        event.stopPropagation();
      });
  }
  
  ngOnInit() {
  }
  
  ngAfterViewInit() {
    window.setTimeout(() => {
      this.container.nativeElement.focus();
    })
  }
}
