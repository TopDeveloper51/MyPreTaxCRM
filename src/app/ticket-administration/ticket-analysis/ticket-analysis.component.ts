import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgSelectComponent } from "@ng-select/ng-select";
import { CommonApiService, MessageService } from '@app/shared/services';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
	selector: 'app-ticket-analysis',
	templateUrl: 'ticket-analysis.component.html',
	styleUrls: ['./ticket-analysis.component.scss'],
})

export class TicketAnalysisComponent implements OnInit {


	public ticketSearchForm: FormGroup;
	public maxDate: any = '';
	public isNoDataFound: any = false;
	public timeAxesLookup = [
		{ id: 'day', name: 'Day' },
		{ id: 'week', name: 'Week' },
		{ id: 'month', name: 'Month' },
		{ id: 'quarter', name: 'Quarter' }
	]
	public typeList = [{ id: '0', name: ' First Year' }, { id: '1', name: ' Second Year' }, { id: '2', name: 'Longer' }];

	constructor(private _commonAPI: CommonApiService, private messageService: MessageService, private fb: FormBuilder,
	) {
		this.maxDate = moment().format('YYYY-MM-DD');
	}

	public onSelectAll(multipleSelectfor) {
		let selected;
		switch (multipleSelectfor) {
			case "customerWithUs":
				selected = [];
				selected = this.typeList.map(
					item => item.id
				);
				this.ticketSearchForm.get("customerWithUs").patchValue(selected);
				break;

		}
	}

	public onClearAll(clearSelectfor?: string) {
		this.typeList = this.typeList;
		if (clearSelectfor && this.ticketSearchForm) {
			this.ticketSearchForm.get(clearSelectfor).patchValue([]);
		}
	}

	reset() {
		this.ticketSearchForm.reset();
		this.ticketSearchForm.controls.dateFrom.setValue(moment().format('YYYY-MM-DD'));
		this.ticketSearchForm.controls.dateTo.setValue(moment().format('YYYY-MM-DD'));
		this.ticketSearchForm.controls.timeAxes.setValue('day');
	}

	clear() {
		this.ticketSearchForm.reset();
	}

	timeAxesChanges() {
	}

	onKeyDown(event, from) {
		if (from == 'dateFrom') {
			if (moment(event).format('YYYY-MM-DD') > moment(this.ticketSearchForm.controls.dateTo.value).format('YYYY-MM-DD')) {
				this.messageService.showMessage('\'DateFrom\' should be greater than \'DateTo\'', 'error');
			}

		} else if (from == 'dateTo') {
			if (moment(this.ticketSearchForm.controls.dateFrom.value).format('YYYY-MM-DD') > moment(event).format('YYYY-MM-DD')) {
				this.messageService.showMessage('\'DateFrom\' should be greater than \'DateTo\'', 'error');
			}

		}
	}

	// call when date is changed
	dateChange(event: any, from?: any) {
		if (moment(this.ticketSearchForm.controls.dateFrom.value).format('YYYY-MM-DD') > moment(this.ticketSearchForm.controls.dateTo.value).format('YYYY-MM-DD')) {
			this.messageService.showMessage('\'DateFrom\' should be greater than \'DateTo\'', 'error');
		}
	}

	// check the given date is in day light saving on EST zone or not
	isDST(tmpDate: any): any {
		const tz = 'America/New_York'; // or whatever your time zone is
		const dt = moment(tmpDate).format('YYYY-MM-DD');
		return moment.tz(dt, tz).isDST();
	}

	public downloadExcel() {
		if (moment(this.ticketSearchForm.controls.dateFrom.value).format('YYYY-MM-DD') > moment(this.ticketSearchForm.controls.dateTo.value).format('YYYY-MM-DD')) {
			this.messageService.showMessage('\'DateFrom\' should be greater than \'DateTo\'', 'error');
		} else {
			let requestData: any = {};
			requestData.timeAxes = this.ticketSearchForm.controls.timeAxes.value;
			requestData.dateFrom = moment(this.ticketSearchForm.controls.dateFrom.value).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(this.ticketSearchForm.controls.dateFrom.value) ? '-04:00' : '-05:00');
			requestData.dateTo = moment(this.ticketSearchForm.controls.dateTo.value).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(this.ticketSearchForm.controls.dateTo.value) ? '-04:00' : '-05:00');
			requestData.customerWithUs = this.ticketSearchForm.controls.customerWithUs.value;
			const self = this;

			this._commonAPI.getObservableResponse({ apiName: APINAME.GET_TICKET_ANALYSIS_REPORTS, parameterObject: requestData, showLoading: true }).subscribe(result => {
				if (result && result.status) {
					if (result && result.file.data) {
						this.isNoDataFound = false;
						var byteArray = new Uint8Array(result.file.data);
						var contentType = 'application/vnd.ms-excel';
						var blob = new Blob([byteArray], { type: contentType });
						var a = window.document.createElement('a');
						a.href = window.URL.createObjectURL(blob);
						a.download = "TicketUsageAnalysisReport_" + moment().format('DDMMYYYY_HHmmss') + ".xlsx";
						// Append anchor to body.
						document.body.appendChild(a)
						a.click();
					} else {
						this.messageService.showMessage('No Data Available', 'error');
						this.isNoDataFound = true;
					}
				} else {
					this.messageService.showMessage('No Data Available', 'error');
					this.isNoDataFound = true;
				}
			}, error => {
				console.error(error);
			});
		}
	}


	/**
	 * @author Dhruvi Shah
	 * @createdDate 22-10-2019
	 * @memberof TicketSearchComponent
	 */
	public initTicketAnalysisForm() {
		this.ticketSearchForm = this.fb.group({
			dateFrom: [moment().format('YYYY-MM-DD'), [Validators.required]],
			dateTo: [moment().format('YYYY-MM-DD'), [Validators.required]],
			timeAxes: ['day', [Validators.required]],
			customerWithUs: []
		})
	}


	ngOnInit() {
		this.initTicketAnalysisForm();
	}
}