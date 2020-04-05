import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-customer-header-detail',
  templateUrl: './customer-header-detail.component.html',
  styleUrls: ['./customer-header-detail.component.scss']
})
export class CustomerHeaderDetailComponent implements OnInit {

  @Input() lookup: any = {};
  @Input() customerDetails: any = {};
  @Input() mode:any = {};
  @Output() customerSearchFormValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() getCustomerDetails: EventEmitter<any> = new EventEmitter<any>();
  public isSaveCalled: boolean = false;

  constructor(private router: Router) { }

  emitFormValue(event) {
    this.customerSearchFormValue.emit(event);
  }

  getCustomerDetail(event)
  {
    this.getCustomerDetails.emit(event);
  }
  /**
     *This function is used save customer information
    */
  public saveDetails() {
    this.isSaveCalled = true;
  }

  /** Back to customer search screen */
  public backCustomerSearch()
  {
    this.router.navigateByUrl('/customer');
  }

  ngOnInit() {
  }

}
