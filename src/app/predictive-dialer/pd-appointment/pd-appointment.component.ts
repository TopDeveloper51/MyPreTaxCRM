// External imorts
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';

// Internal imports
import { UserService } from '@app/shared/services/user.service';
import { PredictiveDialerService } from '@app/predictive-dialer/predictive-dialer.service';
@Component({
  selector: 'app-pd-appointment',
  templateUrl: './pd-appointment.component.html',
  styleUrls: ['./pd-appointment.component.scss']
})
export class PdAppointmentComponent implements OnInit {

  appointmentDetails: any = [];
  userDetails: any = {};

  constructor(private userService: UserService,private predictiveDialerService:PredictiveDialerService) { }

  getAppointment(agentId: string) {
    const parameterObject:any = {agentId: agentId};
    this.predictiveDialerService.getAppointmentByAgentId(parameterObject).then(response => {
      if (response) {
        this.appointmentDetails = response;
        this.appointmentDetails.forEach(element => {
          if (element.datetime) {
            element.datetimeET = moment(element.datetime).tz('America/New_york').format('hh:mm A');
          } else {
            element.datetimeET = undefined;
          }
          // this.cdrService.callDetectChanges(this.cdr);
        });
      } else {
        this.appointmentDetails = [];
        // this.cdrService.callDetectChanges(this.cdr);
      }
    });
  }

  openCalendar() {
    window.open('/#/reports/calendar', '_blank');
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.getAppointment(this.userDetails.id);
  }

}
