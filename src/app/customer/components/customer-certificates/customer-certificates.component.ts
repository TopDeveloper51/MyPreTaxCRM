// External imports
import { Component, OnInit, ChangeDetectorRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
// Internal imports
import { CDRService } from '@app/shared/services';


@Component({
	selector: 'app-customer-certificates',
	templateUrl: './customer-certificates.component.html',
	styleUrls: ['./customer-certificates.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [CurrencyPipe, DatePipe]
})

export class CustomerCertificatesComponent implements OnInit {

	@Input('certificateDetails') certificateDetails: any;

	public rowData: any;
	public gridApi;
	public columnDefs;
	public defaultColDef;
	public domLayout;
	constructor(
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef,
		private currencyPipe: CurrencyPipe,
		private datePipe: DatePipe
	) {
		const self = this;
		this.columnDefs = [
			{
				headerName: 'Date', field: 'date', width: 100, tooltipField: 'date', sort: 'desc',
				cellRenderer: params => {
					return self.datePipe.transform(params.value, 'shortDate');
				}
			},
			{ headerName: 'Version', field: 'version', width: 130, tooltipField: 'version', type: 'numericColumn' },
			{ headerName: 'Send Via', field: 'sendVia', width: 150, tooltipField: 'sendVia' },
			{
				headerName: 'Amount', field: 'amount', width: 150, tooltipField: 'amount',
				type: 'numericColumn',
				cellRenderer: params => {
					return self.currencyPipe.transform(params.value, 'USD', 'symbol', '1.2-2');
				}
			},
			{ headerName: 'Package', field: 'package', width: 150, tooltipField: 'package' },
			{
				headerName: 'Due Date', field: 'dueDate', width: 130, tooltipField: 'dueDate',
				cellRenderer: params => {
					return self.datePipe.transform(params.value, 'shortDate');
				}
			},
		];
		this.defaultColDef = {
			enableValue: true,
			suppressMovable: true,
			tooltip: (p: any) => {
				return p.value;
			},
			suppressMenu: true,
			sortable: true
		};
		this.domLayout = "autoHeight"
	}


	onGridReady(params) {
		this.gridApi = params.api;
		params.api.sizeColumnsToFit();
	}

	ngOnChanges(): void {
		this.rowData = this.certificateDetails && this.certificateDetails.length > 0 ? this.certificateDetails : [];
		this.CDRService.callDetectChanges(this.cdr);
	}

	ngOnInit() {
		this.rowData = this.certificateDetails && this.certificateDetails.length > 0 ? this.certificateDetails : [];
		this.CDRService.callDetectChanges(this.cdr);
	}

}
