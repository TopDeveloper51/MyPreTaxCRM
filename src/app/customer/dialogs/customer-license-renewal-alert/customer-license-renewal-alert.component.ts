import { Component, OnInit, Input } from '@angular/core';
import { CopyToClipboardService } from "@app/shared/services";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'customer-license-renewal-alert',
	templateUrl: 'customer-license-renewal-alert.component.html',
	styleUrls: ['customer-license-renewal-alert.component.scss']
})

export class CustomerLicenseRenewalAlertComponent implements OnInit {
	@Input() data: any;
	public customerID: string;

	constructor(
		private clipboard: CopyToClipboardService,
		public modal: NgbActiveModal,

	) { }

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @memberof CustomerLicenseRenewalAlertComponent
	 */
	goToCustomerCard() {
		window.open('/#/customer/edit/' + this.customerID, '_blank');
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @memberof CustomerLicenseRenewalAlertComponent
	 */
	copyToClipboard() {
		this.clipboard.copy(this.customerID);
	}


	ngOnInit() {
		this.customerID = this.data.data.customerId;
	}
}