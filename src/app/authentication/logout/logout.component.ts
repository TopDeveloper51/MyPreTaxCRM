// External Imports
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Internal Imports
import { DataStoreService } from '@app/shared/services/data-store.service';
import { AuthenticationService } from '@app/authentication/authentication.service';
import { LogoutService } from '@app/authentication/logout/logout.service';
import { PouchDbService } from '@app/shared/services/pouch-db.service';
import { ChatSocketService } from '@app/chat/socket/chat-socket.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';

@Component({
  selector: 'contentmgmt-logout',
  templateUrl: './logout.component.html',
  providers: [LogoutService],
  styleUrls: ['./logout.component.scss']
})

export class LogoutComponent implements OnInit {

  constructor(private authService: AuthenticationService, public dataStoreService: DataStoreService, private router: Router,
    private logoutService: LogoutService, private pouchDbService: PouchDbService, private chatSocketService: ChatSocketService,
    private overlayService: TicketActivityOverlayService) { }

  /**
   * @author Om kanada
   * @modifiedby manali joshi
   * @createdDate 23 sept 2019
   * @description call logoutService to logout user
   * @memberOf LogoutComponent
   */
  ngOnInit() {
    this.overlayService.closeAllWindows();
    this.logoutService.doLogout().then((response) => {
      // clear IndexedDB
      this.pouchDbService.deleteDB();
      this.chatSocketService.socket = undefined;
      this.router.navigateByUrl('/login');

    }, (error) => {
      // clear IndexedDB
      this.pouchDbService.deleteDB();
      this.router.navigateByUrl('/login');
    });
  }
}
