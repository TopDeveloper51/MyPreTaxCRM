import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from 'moment-timezone'
import * as _ from 'lodash';

import { environment } from '@environments/environment';
import { MessageService } from '@app/shared/services/message.service'

@Component({
  selector: 'app-break-detail',
  templateUrl: './break-detail.component.html',
  styleUrls: ['./break-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class BreakDetailComponent implements OnInit {

  data: any;
  modeList: any = [{ id: 'compact', name: 'Compact' }, { id: 'Full', name: 'Full' }];
  modeType: string;
  rowData: any = [];
  lookup: any = {};
  rpLookupDataForFilter = [];  // handle group wise filtering this field holds all data for responsible person in which we are perform filtering
  date: any;
  userName: string;
  showHistory: boolean = false;
  showIndividualEntry: boolean = false;
  reasonBreakExists: boolean = false;
  onlyReasonBreakExists: boolean = false;
  breakDetailsForm: FormGroup;
  // breakData: any = [];
  status: string = '';
  minBreakPeriod: any;
  environment = environment;

  constructor(private modal: NgbActiveModal, private fb: FormBuilder, public cdr: ChangeDetectorRef,
    private messageService: MessageService) { }

  close() {
    this.modal.close();
  }

  filterData(eventTarget) {
    this.lookup.responsiblePersonList = this.rpLookupDataForFilter;
    this.lookup.responsiblePersonList = this.lookup.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.cdr.detectChanges();
  }

  public initBreakDetailsForm() {
    this.breakDetailsForm = this.fb.group({
      breakData: this.fb.array([]),
      reopenedReason: ''
    });
    this.cdr.detectChanges();
  }

  addBreakDataEntry(): FormGroup {
    return this.fb.group({
      startTime: '',
      endTime: '',
      duration: '',
      reason: ['', Validators.required],
      conductorId: '',
      colleagueId: '',
      isBreak: '',
      askForColleague: '',
      isFreeTextAllowed: '',
      askForActivityLink: '',
      askForConductor: '',
      explanation: ['', Validators.required],
      activityLink: this.fb.array([]),
    });
  }

  addActivityLinkControl(): FormGroup {
    return this.fb.group({
      link: ['', [Validators.required, Validators.pattern(/^(https:\/\/crm\.mytaxprepoffice\.com\/#\/centric\/.*[a-z]\/edit\/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)$/)]],
    });
  }

  addLink(index) {
    let linkData = this.breakDetailsForm.get('breakData')['controls'][index].get('activityLink') as FormArray;
    linkData.push(this.addActivityLinkControl());
    this.cdr.detectChanges();
  }

  removeLink(index, indexForActivityLink) {
    let linkData = this.breakDetailsForm.get('breakData')['controls'][index].get('activityLink') as FormArray;
    linkData.removeAt(indexForActivityLink);
    this.cdr.detectChanges();
  }

  setBreakDataArray(breakDataArray): void {
    let breakData = this.breakDetailsForm.get('breakData') as FormArray;
    breakData.clear();
    for (let obj in breakDataArray) {
      breakData.push(this.addBreakDataEntry());
      let linkData = this.breakDetailsForm.get('breakData')['controls'][obj].get('activityLink') as FormArray;
      linkData.clear();
      if (breakDataArray[obj].activityLink && breakDataArray[obj].activityLink.length > 0) {
        for (let link of breakDataArray[obj].activityLink) {
          linkData.push(this.addActivityLinkControl());
        }
      }
    }
    breakData.patchValue(breakDataArray);
    this.cdr.detectChanges();
  }

  // to find type of for rejection
  findTypeOfActivityLink(data) {
    var isString = false;
    if (data !== undefined && data !== null && typeof (data) == 'string') {
      isString = true;
    } else {
      isString = false;
    }
    return isString;
  }

  setMode(id) {
    this.modeType = id;
  }

  // function to set flags for specific break reasons based on which we need to show specific fields on the break detail screen 
  setIndependentFlags(breakData, event, index, from) {
    let indexOfReason = this.lookup.breakExplanationList.findIndex(t => t.id === event);
    if (indexOfReason !== -1) {
      if (this.lookup.breakExplanationList[indexOfReason].AskForExplanation && this.lookup.breakExplanationList[indexOfReason].AskForExplanation.length > 0) {
        breakData[index].askForColleague = this.lookup.breakExplanationList[indexOfReason].AskForExplanation.includes('AskForColleague');
        breakData[index].isFreeTextAllowed = this.lookup.breakExplanationList[indexOfReason].AskForExplanation.includes('AskForFreeText');
        breakData[index].askForActivityLink = this.lookup.breakExplanationList[indexOfReason].AskForExplanation.includes('AskForActivityLink');
        breakData[index].askForConductor = this.lookup.breakExplanationList[indexOfReason].AskForExplanation.includes('AskForConductor');
      } else {
        breakData[index].isFreeTextAllowed = false;
        breakData[index].askForActivityLink = false;
        breakData[index].askForConductor = false;
        breakData[index].askForColleague = false;
      }
      if (this.lookup.breakExplanationList[indexOfReason].AutoMatedFlow && this.lookup.breakExplanationList[indexOfReason].AutoMatedFlow.length > 0 && from == 'init') {
        breakData[index].isBreak = this.lookup.breakExplanationList[indexOfReason].AutoMatedFlow.includes('Break');
      } else {
        breakData[index].isBreak = false;
      }
      if (breakData[index].askForActivityLink) {
        if (!breakData[index].activityLink || breakData[index].activityLink.length == 0) {
          breakData[index].activityLink = [{ 'link': '' }];
        } else {
          if (from == 'init') {
            for (const obj in breakData[index].activityLink) {
              breakData[index].activityLink[obj] = { 'link': breakData[index].activityLink[obj] };
            }
          }
        }
      } else {
        breakData[index].activityLink = [];
      }
      if (!breakData[index].askForConductor) {
        breakData[index].conductorId = undefined;
        this.breakDetailsForm.get('breakData')['controls'][index].controls.conductorId.clearValidators();
      } else {
        this.breakDetailsForm.get('breakData')['controls'][index].controls.conductorId.setValidators([Validators.required]);
        this.breakDetailsForm.get('breakData')['controls'][index].controls.conductorId.updateValueAndValidity();
      }
      if (!breakData[index].askForColleague) {
        breakData[index].colleagueId = undefined;
        this.breakDetailsForm.get('breakData')['controls'][index].controls.colleagueId.clearValidators();
      } else {
        this.breakDetailsForm.get('breakData')['controls'][index].controls.colleagueId.setValidators([Validators.required]);
        this.breakDetailsForm.get('breakData')['controls'][index].controls.colleagueId.updateValueAndValidity();
      }
      if (!breakData[index].isFreeTextAllowed) {
        breakData[index].explanation = undefined;
      }

      let isNotOnlyBreakDataIndex = breakData.findIndex(t => t.isBreak == false);
      let isblankReasonData = breakData.findIndex(t => !t.reason);
      if (isNotOnlyBreakDataIndex > -1 || isblankReasonData > -1) {
        this.onlyReasonBreakExists = false;
      } else {
        this.onlyReasonBreakExists = true;
      }

      let isBreakDataIndex = breakData.findIndex(t => t.isBreak == true);
      if (isBreakDataIndex > -1) {
        this.reasonBreakExists = true
      }

      if (from !== 'init') {
        this.setBreakDataArray(breakData);
      }

    }
  }

  save() {
    if (this.breakDetailsForm.invalid) {
      this.messageService.showMessage('Please fill up appropriate data before proceeding', 'error');
    } else {
      let breakData = this.breakDetailsForm.get('breakData').value;
      breakData.forEach((element, index) => {
        delete element.isBreak;
        delete element.isFreeTextAllowed;
        delete element.askForActivityLink;
        delete element.askForConductor;
        delete element.askForColleague;
        delete element.existingBreak;
        element.startTime = moment(element.startTime).format('MM/DD/YYYY hh:mm:ss A');
        element.endTime = moment(element.endTime).format('MM/DD/YYYY hh:mm:ss A');
        if (element.activityLink && element.activityLink.length > 0) {
          element.activityLink = _.map(element.activityLink, 'link');
        }
      });
      let dataObj = { breakDetails: breakData, reopenedReason: this.breakDetailsForm.get('reopenedReason').value };
      this.modal.close(dataObj);
    }

  }

  ngOnInit(): void {
    this.initBreakDetailsForm();
    this.lookup = this.data.lookup;
    this.rpLookupDataForFilter = this.lookup.responsiblePersonList
    this.showHistory = this.data.noSaveCancel;
    this.showIndividualEntry = this.data.onlyDisplay;
    this.status = this.data.status;
    this.modeType = this.showIndividualEntry ? '' : 'compact';
    this.minBreakPeriod = this.data.minBreakPeriod;
    this.date = this.data.date;
    this.userName = this.data.userName;
    let breakData = JSON.parse(JSON.stringify(this.data.breakDetails));
    breakData = breakData.filter(o => o.longerBreak == true && !o.isDeleted);
    this.setBreakDataArray(breakData);
    breakData.forEach((element, index) => {
      element.startTime = moment(element.startTime).format();
      element.endTime = moment(element.endTime).format();
      if (element.explanation && !element.reason) {
        element.reason = 'Other';
      }
      this.setIndependentFlags(breakData, element.reason, index, 'init');
    });

    breakData = _.orderBy(breakData, ['startTime'], ['endTime']);
    this.setBreakDataArray(breakData);

  }

}
