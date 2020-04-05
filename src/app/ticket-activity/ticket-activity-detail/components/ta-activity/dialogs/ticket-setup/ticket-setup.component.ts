// External imports
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// Internal imports
import { environment } from '@environments/environment.prod';

@Component({
  selector: 'mtpo-ticket-setup',
  templateUrl: './ticket-setup.component.html',
  styleUrls: ['./ticket-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketSetupComponent implements OnInit {

  @Input() data: any;// default data store in data variable
  content: any; // actual data store in this var
  ticketExists: boolean;
  deptYear: any;
  message: String = 'Are you sure, you want to create Ticket and Activity (Dept. - Setup, Year - 2019, Type - Setup, Sub Type - Setup)?';
  isNotify: Boolean = false;
  buttonTextYes: String = 'Yes';
  buttonTextNo: String = 'No';

  constructor(public modal: NgbActiveModal) { }

  /**
   * @author Mansi Makwana
   * @createdDate 11-11-2019
   * @description  call to close the dialog
   * @memberOf TicketSetupComponent
   */
  close(action) {
    this.modal.close(action);
  }

  /**
   * @author Mansi Makwana
   * @createdDate 11-11-2019
   * @description  to redirect particular url when user click on ticketId
   * @memberOf TicketSetupComponent
   */
  redirectToUrl(ticket) {
    if (this.isNotify === true) {
      window.open(`${environment.host}/#/detail-view/activity/details/` + ticket.id, '_blank');
    } else {
      window.open(`${environment.host}/#/detail-view/ticket/details/` + ticket.id, '_blank');
    }
  }

  ngOnInit() {
    this.data = this.data.data;
    this.content = this.data.availableSetupTickets;
    this.ticketExists = this.data.ticketExists;
    this.deptYear = this.data.deptYear;
    if (this.data.notifycreatedTicket === true) {
      this.message = 'Please click below link to see created activity and ticket';
      this.isNotify = true;
      this.buttonTextYes = 'OK';
    } else if (this.content !== undefined && this.content.length > 0) {
      this.message = "Ticket(s) already exists for the customer with the same department '" + this.deptYear.department + "' and year '" + this.deptYear.year + "'.";
    }
    if (this.ticketExists) {
      this.buttonTextNo = 'Cancel';
    }
  }
}

