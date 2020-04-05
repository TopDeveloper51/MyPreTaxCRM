import { Component, OnInit, ViewChildren, ElementRef, ViewChild, TemplateRef, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'

import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service'

@Component({
  selector: 'app-ticket-activity-tab',
  templateUrl: './ticket-activity-tab.component.html',
  styleUrls: ['./ticket-activity-tab.component.scss']
})
export class TicketActivityTabComponent implements OnInit {

  urlParameters: any = {}
  @ViewChildren('windowTitleBar') windowTitleBar: QueryList<any>;


  constructor(private route: ActivatedRoute, private ticketActivityOverlayService: TicketActivityOverlayService) { }


  ngAfterViewInit(): void {
    let titleRef;
    this.windowTitleBar.forEach((titlebar) => {
      titleRef = titlebar;
    });
    let dialogData = { id: this.route.snapshot.params['id'], screen: this.route.snapshot.params['screen'] };
    this.ticketActivityOverlayService.openWindow(dialogData, 'newTab', titleRef)
    // this.ticketActivityOverlayService.openWindow(this.route.snapshot.params['id'], this.route.snapshot.params['screen'], 'newTab', titleRef)
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (this.route.snapshot.params['screen']) {
        this.urlParameters.screeName = this.route.snapshot.params['screen'];
        if (this.route.snapshot.params['id']) {
          this.urlParameters.id = this.route.snapshot.params['id'];
          // this.ticketActivityOverlayService.openWindow(this.route.snapshot.params['id'], this.route.snapshot.params['screen'], 'newTab', this.windowTitleBar)
        }
      }
    });
  }
}
