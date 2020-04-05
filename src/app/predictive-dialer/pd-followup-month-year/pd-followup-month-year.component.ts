import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-pd-followup-month-year',
  templateUrl: './pd-followup-month-year.component.html',
  styleUrls: ['./pd-followup-month-year.component.scss']
})
export class PdFollowupMonthYearComponent implements OnInit {

  @Input('showMonthYear') showMonthYear: any; // get this from pd-view component
  @Input('followupMonth') followupMonth: any;  // get this from pd-view component
  @Input('timePeriod') timePeriod: any;  // get this from pd-view component
  @Output() selectMonthYear = new EventEmitter();


  constructor() { }

  /**
   * call on click of any month
   * @param time 
   */
  public selectTime(time: any) {
    this.selectMonthYear.emit(time);
  }

  ngOnInit() {
  }

}
