import { Component, OnInit } from '@angular/core';
import {CustomerAddressService} from '@app/customer/dialogs/customer-address/customer-address.service';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-customer-address',
  templateUrl: './customer-address.component.html',
  styleUrls: ['./customer-address.component.scss']
})
export class CustomerAddressComponent implements OnInit {

  constructor(private customerAddressService: CustomerAddressService,
    private activeModal: NgbActiveModal) { }

  public data:any;
  public availableCustomer: any = [];
  public availableCustomerCol: any = [];

  /**
   * @author shreya kanani
   * @description get customer address information
   */
  _initAvailableContactPerson() {
    if (this.data.data.objAddInformation.isFromCustomer) {
    this.customerAddressService.getCustomerAddressInfo({'customerId':this.data.data.objAddInformation.customerId}).then((response: any) => {
      this.availableCustomer = response;
                this.availableCustomerCol = [];
                let Appcnt = 3;
                for (let obj in this.availableCustomer[1]) {
                    let cnt = 0;
                    if (obj === 'fieldName') {
                        cnt = 1;
                    } else if (obj === 'fieldCRM') {
                        cnt = 2;
                    } else if (obj === 'fieldFOIA Main') {
                        cnt = 99;
                    } else if (obj === 'fieldFOIA Business') {
                        cnt = 100;
                    } else {
                        cnt = Appcnt;
                    }
                    this.availableCustomerCol.push(
                        { 'field': obj, 'seq': cnt });

                    Appcnt++;
                };

                this.availableCustomerCol.sort(function (a: any, b: any): number {
                    if (a.seq > b.seq) {
                        return 1;
                    }
                    if (a.seq < b.seq) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
                });
                if (this.availableCustomerCol.length <= 1) {
                    this.availableCustomer = undefined;
                }
    });
    }
  }

  /**
   * @author shreya kanani
   * @param crmcellvalue 
   * @param cellvalue 
   * @param $index 
   * @param custfiled 
   * @description get class to display data
   */
  getClass(crmcellvalue: string, cellvalue: string, $index: number, custfiled: any): any {
    if ($index > 0) {
        if (cellvalue === '' || crmcellvalue === '' || custfiled.field === 'fieldCRM' || cellvalue === 'Address 1' || cellvalue === 'Address 2'
            || cellvalue === 'Country' || cellvalue === 'State' || cellvalue === 'City' || cellvalue === 'ZIP') {
            return;
        }

        if (crmcellvalue.toLowerCase() !== cellvalue.toLowerCase()) {
            return { cellColorDifferent: true };
        }
    }
}

/**
 * @author shreya kanani
 * @description close dialog
 */
public close() {
  this.activeModal.close(false);
}

  ngOnInit() {
    this._initAvailableContactPerson();
  }

}
