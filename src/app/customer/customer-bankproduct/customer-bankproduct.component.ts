// External imports
import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	ChangeDetectorRef,
	ViewEncapsulation, Input
} from "@angular/core";
import * as moment from 'moment-timezone'

//Internal imports
import { CustomerBankProductService } from '@app/customer/customer-bankproduct/customer-bankproduct.service';
import { MessageService, CommonApiService, CDRService } from "@app/shared/services";
import { APINAME } from "@app/customer/customer-constants";


@Component({
	selector: 'app-customer-bankproduct',
	templateUrl: 'customer-bankproduct.component.html',
	styleUrls: ['./customer-bankproduct.component.scss'],
	providers: [CustomerBankProductService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class CustomerBankproductComponent implements OnInit {

	@Input() unidentifiedCustomer: any
	@Input() customerID: any

	public bpHeader: any;
	public bankSpecialPricing: any = {};

	constructor(
		private commonApiService: CommonApiService,
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef
	) {

	}


	public getBankProductHeader() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BANK_PRODUCT_HEADER, parameterObject: { customerId: this.customerID } }).then(response => {
			this.bpHeader = response;
			this.bankSpecialPricing = response.bankSpecialPricing ? response.bankSpecialPricing : {};

			if (this.bpHeader.updatedDate != undefined && this.bpHeader.updatedDate != '') {
				this.bpHeader.updatedDate = moment(this.bpHeader.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
			}
			if (this.bpHeader.createdDate != undefined && this.bpHeader.createdDate != '') {
				this.bpHeader.createdDate = moment(this.bpHeader.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
			}
			this.CDRService.callDetectChanges(this.cdr);
		}, error => {
		});
	};



	ngOnInit() {
		this.getBankProductHeader();
	}
}