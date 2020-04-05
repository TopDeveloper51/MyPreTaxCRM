// External imports
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Internal imports
import { CommonApiService, MessageService } from '@app/shared/services';
import { APINAME } from '@app/customer/customer-constants';
import * as moment from 'moment-timezone';



@Component({
	selector: 'app-software-used',
	templateUrl: 'software-used.component.html',
	styleUrls: ['./software-used.component.scss'],
})

export class SoftwareUsedComponent implements OnInit {

	@Input() data: any;
	public softwareUsedForm: FormGroup;
	public sourceList: any = [];
	public softwareList: any = [];
	public yearList = [{ id: '2013', name: '2013' }, { id: '2014', name: '2014' }, { id: '2015', name: '2015' }, { id: '2016', name: '2016' }, { id: '2017', name: '2017' }, { id: '2018', name: '2018' }];



	constructor(
		private commonApiService: CommonApiService,
		private messageService: MessageService,
		private fb: FormBuilder,
		public modal: NgbActiveModal,
	) { }

	initSoftwareUsedForm() {
		this.softwareUsedForm = this.fb.group({
			year: [null],
			software: [null, Validators.required],
			source: [null, Validators.required],
			date: '',
			isHeader: false,
			customerId: this.data.data,

		})
	}

	public displayMessage(event): void {
		if (this.softwareUsedForm.controls.isHeader.value == true) {
			this.messageService.showMessage('The record you are adding will be set as the new Software Used Header', 'info');
		}
	}

	public save() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_SOFTWARE_USED_DETAIL, parameterObject: this.softwareUsedForm.value }).then(response => {
			this.modal.close(true);
			this.messageService.showMessage('Software Used detail saved successfully', 'success');
		},
			error => {
				this.modal.close(false);
				this.messageService.showMessage('Software Used detail saved Unsuccessfully', 'error');
			});
	}


	getLookupData() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_SOFTWARE_USED_LIST,isCachable:true }).then(response => {
			this.sourceList = response.sourceList;
			this.softwareList = response.softwareList;
		});
	}

	ngOnInit() {
		this.initSoftwareUsedForm();
		this.getLookupData();
	}
}