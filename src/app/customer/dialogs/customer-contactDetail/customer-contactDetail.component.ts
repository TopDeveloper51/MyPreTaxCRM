import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';


import { CommonApiService, CDRService } from '@app/shared/services';
import { APINAME } from "@app/customer/customer-constants";

@Component({
	selector: 'customer-contactDetail',
	templateUrl: 'customer-contactDetail.component.html',
	styleUrls: ['customer-contactDetail.component.scss'],

})

export class CustomerContactDetailComponent implements OnInit {
	@Input() data: any;
	customerID: any;
	isTestCustomer: any;

	constructor(
		private commonApiService: CommonApiService,
		public modal: NgbActiveModal,
	) { }

	ngOnInit() {
		this.customerID = this.data.obj.customerId;
		this.isTestCustomer = this.data.obj.isTestCustomer;
	
		console.log(this.customerID)
		console.log(this.isTestCustomer)
	
	}
}