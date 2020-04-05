// External imports
import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	ChangeDetectorRef,
	ViewEncapsulation,
	Input
} from "@angular/core";
import * as moment from 'moment-timezone'

//Internal imports
import { DialogService, MessageService, CommonApiService, CDRService } from "@app/shared/services";
import { SoftwareUsedComponent } from '@app/customer/dialogs/software-used/software-used.component';
import { APINAME } from "@app/customer/customer-constants";

@Component({
	selector: 'app-customer-softwareUsed',
	templateUrl: 'customer-softwareUsed.component.html',
	styleUrls: ['./customer-softwareUsed.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class CustomerSoftwareUsedComponent implements OnInit {

	@Input() customerID: any;

	// grid data
	public defaultColDef: any;
	public softwareUsedDetailsRowData: any;
	public softwareUsedDetailsGridApi: any;
	public softwareUsedDetailsColumnDefs: any;
	public softwareUsedDetailsColumnApi: any;
	public getRowNodeId;// set id for row
	public getRowHeight;
	public domLayout;
	//
	public sources: any = [];

	constructor(
		private commonApiService: CommonApiService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef,
		private CDRService: CDRService,
	) {
		let self = this;
		this.softwareUsedDetailsColumnDefs = [
			{
				headerName: '',
				field: 'isSelected',
				width: 100,
				//	checkboxSelection: true,
				cellRenderer: function (params) {
					var input = document.createElement('input');
					input.type = "checkbox";
					input.checked = params.value;
					input.addEventListener('click', function (event) {
						params.value = !params.value;
						params.node.data.fieldName = params.value;
						self.setSoftwareHeader(params.data);
					});
					return input;
				},
				tooltip: () => {
					return '';
				}
			},
			{
				headerName: 'Year',
				field: 'year',
				width: 100,
				headerTooltip: 'Year',
			},
			{
				headerName: 'Software',
				field: 'software',
				width: 200,
				headerTooltip: 'Software'
			},
			{
				headerName: 'Source',
				field: 'source',
				width: 200,
				headerTooltip: 'Source',
			},
			{
				headerName: 'Date',
				field: 'date',
				width: 150,
				headerTooltip: 'Date',
				cellRenderer: params => {
					if (params.value) {
						return moment(params.value).tz('America/New_York').format('MM/DD/YY');
					}
				},
			},
			{
				headerName: 'Created By',
				field: 'createdByName',
				width: 250,
				headerTooltip: 'Created By',
			},
			{
				headerName: 'C. Date',
				field: 'createdDate',
				width: 150,
				headerTooltip: 'Created Date',
				cellRenderer: params => {
					if (params.value) {
						return moment(params.value).tz('America/New_York').format('MM/DD/YY');
					}
				},
				sort: 'desc',
			},
			{
				headerName: 'Updated By',
				field: 'updatedByName',
				width: 250,
				headerTooltip: 'Updated By',
			},
			{
				headerName: 'U. Date',
				field: 'updatedDate',
				width: 150,
				headerTooltip: 'Updated Date',
				cellRenderer: params => {
					if (params.value) {
						return moment(params.value).tz('America/New_York').format('MM/DD/YY');
					}
				},
			},
			{
				headerName: 'Header?',
				field: 'isHeader',
				width: 110,
				headerTooltip: 'IsHeader',
				cellStyle: "{'text-align': 'center'}",
				cellRenderer: params => {
					if (params.value) {
						return '<img src = "assets/images/Approved.png">';
					}
				},
				tooltip: () => {
					return '';
				}
			},
		];

		this.defaultColDef = {
			enableValue: true,
			enableRowGroup: true,
			sortable: false,
			resizable: true,
			lockPosition: true,
			tooltip: (p: any) => {
				return p.value;
			},
			enableBrowserTooltips: true
		};

		this.getRowNodeId = function (data) {
			return data.jobId;
		};
		this.domLayout = "autoHeight";
	}


	onGridReady(params) {
		this.softwareUsedDetailsGridApi = params.api;
		this.softwareUsedDetailsColumnApi = params.columnApi;
		// let idSequence = 0;
		// this.softwareUsedDetailsGridApi.forEachNode(function (rowNode, index) {
		// 	rowNode.id = idSequence++;
		// });
		params.api.sizeColumnsToFit();
	}

	public onCellClicked(e) {
		// if (e.column.colId === 'isSelected') {
		// 	this.setSoftwareHeader(e.data);
		// }
	}


	/**
	 * @author Dhruvi Shah
	 * @createdDate 29/11/19
	 * @description Open dialog to add software used data
	 * @memberof CustomerSoftwareUsedComponent
	 */
	public addSoftwareUsedDetails(): void {
		this.dialogService.custom(SoftwareUsedComponent, { 'data': this.customerID }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
			(response) => {
				if (response) {
					this.getSoftwareUsedDetails();
				}
			}, (error) => {
				console.error(error);
			});
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 29/11/19
	 * @description get software lookup data
	 * @memberof CustomerSoftwareUsedComponent
	 */
	public getLookupForSource() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_BP_IDENTIFICATION_SOURCE,isCachable:true }).then(response => {
			this.sources = response;
		});

	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 29/11/19
	 * @description save checkbox value
	 * @param {*} saveObject
	 * @memberof CustomerSoftwareUsedComponent
	 */
	public saveNewSoftwareHistory(saveObject) {
		if (saveObject.isHeader == undefined) {
			saveObject.isHeader = false;
		}
		saveObject.customerId = this.customerID;
		for (const obj of this.sources) {
			if (saveObject.source == obj.name) {
				saveObject.source = obj.id;
				break;
			}
		}
		this.commonApiService.getPromiseResponse({ apiName: APINAME.SET_HEADER_SOFTWARE_USED_DETAIL, parameterObject: saveObject }).then(response => {
			this.messageService.showMessage('Software Used Header updated successfully', 'success');
			this.getSoftwareUsedDetails();
		}, error => {
			this.messageService.showMessage('Software Used Header updated Unsuccessfully', 'error');
		});
	}



	/**
	 * @author Dhruvi Shah
	 * @createdDate 29/11/19
	 * @description Open d\confirmation dialog on checkbox click
	 * @param {*} data
	 * @memberof CustomerSoftwareUsedComponent
	 */
	public setSoftwareHeader(data) {
		const self = this;
		let saveObject = JSON.parse(JSON.stringify(data));
		// Open dialog for conformation before Change
		const dialogData = { title: 'Confirmation', text: 'Are you sure you want to change Software Used Header?' };
		this.dialogService.confirm(dialogData, {}).result.then(
			(result) => {
				if (result === 'YES') {
					saveObject.isHeader = !saveObject.isHeader;
					this.saveNewSoftwareHistory(saveObject);
				} else {
					this.getSoftwareUsedDetails();
				}
			}, (error) => {
				self.messageService.showMessage('Error occurred while processing.', 'error');
			});
	}


	/**
	 * @author Dhruvi Shah
	 * @createdDate 29/11/19
	 * @description get software details to bind in grid
	 * @memberof CustomerSoftwareUsedComponent
	 */
	public getSoftwareUsedDetails() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_SOFTWARE_USED_DETAILS, parameterObject: { customerId: this.customerID }, showLoading: true }).then(response => {
			const sortedArray = response.sort((a, b) => moment(b.createdDate) - moment(a.createdDate));
			for (const obj of sortedArray) {
				// set checkbox value
				obj.isSelected = (obj.isHeader == true) ? true : false;
				this.softwareUsedDetailsRowData = response;
			}
			this.CDRService.callDetectChanges(this.cdr);
		}, error => {
		});
	};


	ngOnInit() {
		// this.customerId = '3c59914e-c816-413b-bac4-79ba391298e9';
		this.getSoftwareUsedDetails();
		this.getLookupForSource();
	}
}
