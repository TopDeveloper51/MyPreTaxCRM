import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-card-readonly',
  templateUrl: './customer-card-readonly.component.html',
  styleUrls: ['./customer-card-readonly.component.scss']
})
export class CustomerCardReadonlyComponent implements OnInit {

  @Input() screen: string = '';
  @Input() customerSearchLookup: any = {};
  @Input() isSearchDone: boolean = false; // for viewing custoemr search form in either readonly or editable way
  @Input() isFilterApplied: boolean = false;
  @Input() customerSearchForm: any;
  @Input() availableCustomer: any = {};
  @Input() customerID;

  public country;
  public state;
  public preferredLanguage;
  public resellerName;
  public bank;
  public customerType;
  public software;
  public salesProcessStatus;
  public showData: boolean = false;

  constructor(private router: Router) { }

  public newCustomer(): void {
    this.router.navigate(['customer', 'new']);
  }

  ngOnInit() {
    if (this.customerSearchForm.country && this.customerSearchForm.country.length > 20) {
      this.country = this.customerSearchForm.country.toString().substring(0, 20) + "....";
    } else {
      this.country = this.customerSearchForm.country;
    }
    if (this.customerSearchForm.state && this.customerSearchForm.state.length > 20) {
      this.state = this.customerSearchForm.state.toString().substring(0, 20) + "....";
    } else {
      this.state = this.customerSearchForm.state;
    }
    if (this.customerSearchForm.preferredLanguage && this.customerSearchForm.preferredLanguage.length > 10) {
      this.preferredLanguage = this.customerSearchForm.preferredLanguage.toString().substring(0, 10) + "....";
    } else {
      this.preferredLanguage = this.customerSearchForm.preferredLanguage;
    }
    if (this.customerSearchForm.resellerName && this.customerSearchForm.resellerName.length > 15) {
      this.resellerName = this.customerSearchForm.resellerName.toString().substring(0, 15) + "....";
    } else {
      this.resellerName = this.customerSearchForm.resellerName;
    }
    if (this.customerSearchForm.bank && this.customerSearchForm.bank.length > 3) {
      this.bank = this.customerSearchForm.bank.toString().substring(0, 3) + "....";
    } else {
      this.bank = this.customerSearchForm.bank;
    }
    if (this.customerSearchForm.customerType && this.customerSearchForm.customerType.length > 4) {
      this.customerType = this.customerSearchForm.customerType.toString().substring(0, 12) + "....";
    } else {
      this.customerType = this.customerSearchForm.customerType;
    }
    if (this.customerSearchForm.software && this.customerSearchForm.software.length > 10) {
      this.software = this.customerSearchForm.software.toString().substring(0, 20) + "....";
    } else {
      this.software = this.customerSearchForm.software;
    }
    if (this.customerSearchForm.salesProcessStatus && this.customerSearchForm.salesProcessStatus.length > 30) {
      this.salesProcessStatus = this.customerSearchForm.salesProcessStatus.toString().substring(0, 30) + "....";
    } else {
      this.salesProcessStatus = this.customerSearchForm.salesProcessStatus;
    }

  }

  ngOnChanges(changes) {
    if (changes.customerSearchForm && changes.customerSearchForm.currentValue && Object.keys(changes.customerSearchForm.currentValue).length > 0) {
      this.showData = true;
    }
  }

}
