import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone'
import { MessageService } from '@app/shared/services';
import { TimeAccountingService } from '@app/time-accounting/time-accounting.service';

@Component({
  selector: 'app-checkinout-manual',
  templateUrl: './checkinout-manual.component.html',
  providers: [TimeAccountingService],
  styleUrls: ['./checkinout-manual.component.scss']
})
export class CheckinoutManualComponent implements OnInit {

  public data: any; // to hold the data when open dialog
  public mode: any; // flag for open dialog e.g edit or new
  public manualEntry: any = {}; // to hold the checkInTime and checkout time
  public selectedDate: any; // hold the date
  public checkInTimeInEt: any; // to show checkIn time in ET
  public checkOutTimeInEt: any; // to show checkOut time in ET
  public dialogData: any;

  constructor(private modal: NgbActiveModal, private messageService: MessageService, private timeaccountingService: TimeAccountingService) { }

  /**
 * @author shreya kanani
 * @description this method close the dialog
 */
  public close() {
    this.modal.close();
  }

  /**
   * @author shreya kanani
   * @param date 
   * @description this method is used to formate date
   */
  public isDSTFormat(date) {
    return moment.tz(date, 'YYYY-MM-DD hh:mm A', 'America/New_York').isDST()
  }

  /**
   * @author shreya kanani
   * @description call when checkin time change
   */
  public onCheckInTimeChange() {
    if (this.manualEntry.checkInTime !== undefined && this.manualEntry.checkInTime !== null && this.manualEntry.checkInTime !== '') {
      let date = this.selectedDate + ' ' + moment(this.manualEntry.checkInTime).format('HH:mm:ss');
      let checkInTime;
      if (this.manualEntry.timeZone === 'ET') {
        checkInTime = moment.tz(date, 'America/New_York').utc().format();

      } else if (this.manualEntry.timeZone === 'MT') {
        checkInTime = moment.tz(date, 'America/Denver').utc().format();

      }
      this.checkInTimeInEt = moment(checkInTime).tz('America/New_York').format('MM/DD/YY hh:mm A');
    } else {
      this.checkInTimeInEt = '';
    }
  }

  /**
   * @author shreya kanani
   * @description call when check out time is changed
   */
  public onCheckOutTimeChange() {
    if (this.manualEntry.checkOutTime !== undefined && this.manualEntry.checkOutTime !== null && this.manualEntry.checkOutTime !== '') {
      let date = this.selectedDate + ' ' + moment(this.manualEntry.checkOutTime).format('HH:mm:ss');
      let checkOutTime;
      if (this.manualEntry.timeZone === 'ET') {
        checkOutTime = moment.tz(date, 'America/New_York').utc().format();

      } else if (this.manualEntry.timeZone === 'MT') {
        checkOutTime = moment.tz(date, 'America/Denver').utc().format();

      }
      this.checkOutTimeInEt = moment(checkOutTime).tz('America/New_York').format('MM/DD/YY hh:mm A');
    } else {
      this.checkOutTimeInEt = '';
    }
  }

  /**
   * @author shreya kanani
   * @description this method is used to change timezone
   */
  public changeTimeZone() {
    this.onCheckInTimeChange();
    this.onCheckOutTimeChange();
  }

  /**
   * @author shreya kanani
   * @description this method save the dialog data
   */
  public save(): void {
    let currentTime;
    let data = JSON.parse(JSON.stringify(this.manualEntry));
    data.userName = this.manualEntry.userName;

    /** Check In Time */
    let isCheckInValid = true;
    let isFutureCheckInTime = false;
    if (this.manualEntry.checkInTime !== undefined && this.manualEntry.checkInTime !== null && this.manualEntry.checkInTime !== '') {
      let checkInTime = this.selectedDate + ' ' + moment(this.manualEntry.checkInTime).format('HH:mm:ss');
      if (this.manualEntry.timeZone === 'ET') {
        data.checkInTime = moment.tz(checkInTime, 'America/New_York').utc().format();
      }
      else if (this.manualEntry.timeZone === 'MT') {
        data.checkInTime = moment.tz(checkInTime, 'America/Denver').utc().format();
      }
      currentTime = moment().format();
      if (data.checkInTime > moment.tz(currentTime, 'America/New_York').utc().format()) {
        isFutureCheckInTime = true;
      }
    } else {
      isCheckInValid = false;
    }


    /** Check Out Time */
    let isCheckOutValid = true;
    let isFutureCheckOutTime = false;
    if (this.manualEntry.checkOutTime !== undefined && this.manualEntry.checkOutTime !== null && this.manualEntry.checkOutTime !== '') {
      let checkOutTime = this.selectedDate + ' ' + moment(this.manualEntry.checkOutTime).format('HH:mm:ss');
      if (this.manualEntry.timeZone === 'ET') {
        data.checkOutTime = moment.tz(checkOutTime, 'America/New_York').utc().format();
      } else if (this.manualEntry.timeZone === 'MT') {
        data.checkOutTime = moment.tz(checkOutTime, 'America/Denver').utc().format();
      }
      currentTime = moment().format();
      if (data.checkOutTime > moment.tz(currentTime, 'America/New_York').utc().format()) {
        isFutureCheckOutTime = true;
      }
    } else {
      isCheckOutValid = false;
    }

    if (data.comment !== undefined && data.comment !== null) {
      data.comment = data.comment.trim();
      if (data.comment === '') {
        data.comment = undefined;
      }
    } else {
      data.comment = undefined;
    }

    data.date = moment(this.selectedDate).format('YYYY-MM-DD');
    data.role = 'Admin';
    data.source = 'Manual';
    if (isCheckInValid && isCheckOutValid) {
      let diff = moment(data.checkOutTime).diff(moment(data.checkInTime));
      if (this.manualEntry.checkInTime == undefined) {
        this.messageService.showMessage("'Check in time' Invalid", 'error');
      } else if (this.manualEntry.checkOutTime == undefined) {
        this.messageService.showMessage("'Check out time' Invalid", 'error');
      } else if (diff <= 0) {
        this.messageService.showMessage("'Check out time' should be greater than 'Check In Time'", 'error');
      } else if (isFutureCheckInTime || isFutureCheckOutTime) {
        this.messageService.showMessage("'Check-In' or 'Check-Out' time cannot be mentioned for future", 'error');
      } else {
        this.timeaccountingService.saveCheckInStatus(data).then((response: any) => {
          this.modal.close(true);
        })
      }
    } else {
      if (!isCheckInValid) {
        this.messageService.showMessage("'Check in time' Invalid", 'error');
      }
      if (!isCheckOutValid) {
        this.messageService.showMessage("'Check out time' Invalid", 'error');
      }
    }
  }

  /**
   * @author shreya kanani
   * @description call when mode is edit 
   */
  public editMode(){
    if (this.mode == 'edit') {
      if (this.dialogData.manualEntry.checkIn !== undefined && this.dialogData.manualEntry.checkIn !== null && this.dialogData.manualEntry.checkIn !== '') {
        let checkInDate = moment(this.dialogData.date).format("YYYY-MM-DD") + 'T' + this.dialogData.manualEntry.checkIn.split('T')[1];
        if (this.isDSTFormat(checkInDate)) {
          this.manualEntry.checkInTime = moment(moment(checkInDate).format()).subtract({ 'hours': 4, minutes: (moment(checkInDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        } else {
          this.manualEntry.checkInTime = moment(moment(checkInDate).format()).subtract({ 'hours': 5, minutes: (moment(checkInDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        }
      }

      if (this.dialogData.manualEntry.checkOut !== undefined && this.dialogData.manualEntry.checkOut !== null && this.dialogData.manualEntry.checkOut !== '') {
        let checkOutDate = moment(this.dialogData.date).format("YYYY-MM-DD") + 'T' + this.dialogData.manualEntry.checkOut.split('T')[1];
        if (this.isDSTFormat(checkOutDate)) {
          this.manualEntry.checkOutTime = moment(moment(checkOutDate).format()).subtract({ 'hours': 4, minutes: (moment(checkOutDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        } else {
          this.manualEntry.checkOutTime = moment(moment(checkOutDate).format()).subtract({ 'hours': 5, minutes: (moment(checkOutDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        }
      }

      this.manualEntry.comment = this.dialogData.manualEntry.comment;
      this.manualEntry.docId = this.dialogData.manualEntry.docId;
      this.manualEntry.checkInId = this.dialogData.manualEntry.checkInId;
      this.manualEntry.userName = this.dialogData.manualEntry.userName;
      this.selectedDate = moment(this.dialogData.date).format("YYYY-MM-DD");
      this.manualEntry.name = this.dialogData.manualEntry.name;
      this.manualEntry.timeZone = 'ET';
      this.changeTimeZone();
    } else {
      this.manualEntry.name = this.dialogData.name;
      this.manualEntry.userName = this.dialogData.userName;
      this.selectedDate = this.dialogData.date;
      this.manualEntry.checkInTime = void 0;
      this.manualEntry.checkOutTime = void 0;
      this.manualEntry.timeZone = 'ET';
    }

  }

  ngOnInit(): void {
    this.dialogData = this.data.data;
    this.mode = this.dialogData.mode;
    this.editMode();
  }

}
