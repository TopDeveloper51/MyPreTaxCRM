import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';


import { CommonApiService, CDRService } from '@app/shared/services';
import { APINAME } from "@app/customer/customer-constants";

@Component({
	selector: 'app-price-guarantee-year-history',
	templateUrl: 'price-guarantee-year-history.component.html',
	styleUrls: ['price-guarantee-year-history.component.scss'],

})

export class PriceGuaranteeYearHistoryComponent implements OnInit {

	@Input() data: any;

	public PGperYearHistoryListRowData: any;
	public historyData: any = []; // hold the history data
	public gridApi;
	public columnDefs;
	public defaultColDef;
	public domLayout;
	
	constructor(
		public modal: NgbActiveModal,
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef,
		private commonApiService: CommonApiService,
	) {
		this.columnDefs = [
			{ headerName: 'Name', field: 'name', width: 100, tooltipField: 'name' },
			{ headerName: 'Old Value', field: 'oldValue', width: 50, tooltipField: 'oldValue' },
			{ headerName: 'New Value', field: 'newValue', width: 50, tooltipField: 'newValue' },
			{ headerName: 'Updated By', field: 'updatedByName', width: 50, tooltipField: 'updatedByName' },
			{ headerName: 'Updated Date', field: 'updatedDate', width: 80, tooltipField: 'updatedDate', sort: 'desc', },
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

	// for getting the proce guarantee per year history Data
	public getPGPerYearHistoryData() {
		const self = this;
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_PG_PER_YEAR_HISTORY, parameterObject: { 'customerID': this.data.objHistory.customerId, 'year': this.data.objHistory.year } }).then(response => {
			response.forEach(function (objData: any): any {
				objData.field.forEach(function (objField: any): any {
					if (objField.name !== 'updatedBy' && objField.name !== 'updatedDate' && objField.name !== 'createdBy' && objField.name !== 'createdDate') {
						if (objField.name == 'date' || objField.name == 'firstThreatDate' || objField.name == 'PGLostDate') {
							self.historyData.push({
								'name': objField.name[0].toUpperCase() + objField.name.slice(1),
								'oldValue': moment(objField.oldValue).tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A'),
								'newValue': moment(objField.newValue).tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A'),
								'updatedDate': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A'),
								'updatedBy': objData.updatedByName,
								'updatedByName': objData.updatedByName
							});
						} else {
							self.historyData.push({
								'name': objField.name[0].toUpperCase() + objField.name.slice(1),
								'oldValue': objField.oldValue,
								'newValue': objField.newValue,
								'updatedDate': moment(objData.updatedDate).tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A'),
								'updatedBy': objData.updatedByName,
								'updatedByName': objData.updatedByName
							});
						}
					}
				});
			});
			this.PGperYearHistoryListRowData = this.historyData;
		});
		this.CDRService.markForCheck(this.cdr);
	}


	ngOnInit() {
		this.getPGPerYearHistoryData();
	}
}