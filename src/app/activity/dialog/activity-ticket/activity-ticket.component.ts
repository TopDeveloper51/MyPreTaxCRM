// External imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from "@angular/forms";
import { NgSelectComponent } from "@ng-select/ng-select";
import * as _ from 'lodash';
import * as $ from 'jquery';

//Internal imports
import { UserService, CDRService, } from '@app/shared/services';
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
import { LoaderService } from '@app/shared/loader/loader.service';

@Component({
  selector: 'app-activity-ticket',
  templateUrl: './activity-ticket.component.html',
  styleUrls: ['./activity-ticket.component.scss'],
  providers: [TicketActivityDetailService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivityTicketComponent implements OnInit {


  private data;
  public ticketDetailForm: FormGroup;
  public existingTicketDetails: any = {};
  public availableActivityTicketData: any = []; // to store ticket data 
  public filterTicketTypeListDept: any = []; // filter ticketType lookup on dept and isActive flag
  // Lookup
  public lookup = {
    taxYearList: [], statusList: [], departmentList: [], originalTicketTypeLookUp: [], ticketType: []
  }
  public userDetails: any;
  public isRetentionTeamMember: boolean = false;
  public selectTickets: boolean = true; // flag set on create ticket
  public showTicket: boolean = false;
  //
  public rowData: any = [];
  public defaultColDef: any;
  public gridApi;
  public gridColumnApi;
  public columnDefs: any;
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private CDRService: CDRService,
    public ticketActivityDetailService: TicketActivityDetailService,
    private loader: LoaderService

  ) {
    this.columnDefs = [
      { headerName: 'Status', field: 'ticketStatusText', tooltipField: 'ticketStatusText', width: 150, cellStyle: { cursor: "pointer" } },
      { headerName: 'Ticket Type', field: 'typeText', tooltipField: 'typeText', width: 250, cellStyle: { cursor: "pointer" } },
      { headerName: 'Sub-Type', field: 'errorTypeText', tooltipField: 'errorTypeText', width: 250, cellStyle: { cursor: "pointer" } },
      { headerName: 'Description', field: 'description', tooltipField: 'description', width: 350, cellStyle: { cursor: "pointer" } },
      { headerName: 'Control Information', field: 'controlInfo', tooltipField: 'controlInfo', width: 350, cellStyle: { cursor: "pointer" } },
      { headerName: 'T.Number', field: 'ticketNumber', tooltipField: 'ticketNumber', width: 150, cellStyle: { cursor: "pointer" }, type: 'numericColumn', }
    ],
      this.defaultColDef = {
        enableValue: true,
        sortable: true,
        resizable: false,
        tooltip: (p: any) => {
          return p.value;
        },
        suppressMenu: false,
        enableBrowserTooltips: true
      };
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  public onRowClicked(e) {

    if (e.event.target !== undefined) {
      this.modal.close({ ticketId: e.data.id, ticket: 'old', year: e.data.year });
    }

  }

  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "year":
        selected = [];
        selected = this.lookup.taxYearList.map(
          item => item.id
        );
        this.ticketDetailForm.get("year").patchValue(selected);
        break;
      case "department":
        selected = [];
        selected = this.lookup.departmentList.map(
          item => item.id
        );
        this.ticketDetailForm.get("department").patchValue(selected);
        break;
      case "ticketStatus":
        selected = [];
        selected = this.lookup.statusList.map(
          item => item.id
        );
        this.ticketDetailForm.get("ticketStatus").patchValue(selected);
        break;
    }
  }

  public onClearAll(clearSelectfor?: string) {
    if (clearSelectfor && this.ticketDetailForm) {
      this.ticketDetailForm.get(clearSelectfor).patchValue([]);
    }
  }

  public closeSelect(select: NgSelectComponent) {
    select.close();
  }


  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @description apply style based on search type
   * @memberof ActivityTicketComponent
   */
  searchTicketType() {

    let ticketType = this.ticketDetailForm.controls.ticketType.value
    // Resetting
    if (this.lookup.originalTicketTypeLookUp !== undefined) {
      for (const key in this.lookup.originalTicketTypeLookUp) {
        if (this.lookup.originalTicketTypeLookUp.hasOwnProperty(key)) {
          const type = this.lookup.originalTicketTypeLookUp[key];
          type.style = undefined;

          type.forEach(element => {
            if (element.subTypeList && element.subTypeList.length > 0) {
              element.subTypeList = element.subTypeList.sort();
              for (let error of element.subTypeList) {
                error.style = undefined;
              }
            }
          });
        }
      }
    }
    if (ticketType !== '' && ticketType !== undefined && ticketType !== null && ticketType.length >= 2) {
      for (const key in this.lookup.originalTicketTypeLookUp) {
        if (this.lookup.originalTicketTypeLookUp.hasOwnProperty(key)) {
          const type = this.lookup.originalTicketTypeLookUp[key];
          type.style = undefined;
          type.forEach(element => {
            element.style = undefined;
            if (element.name.toLowerCase().indexOf(ticketType.toLowerCase()) !== -1) {
              element.style = '#ffa07a';
            }
            if (element.subTypeList && element.subTypeList.length > 0) {
              for (let error of element.subTypeList) {
                if (error.name.toLowerCase().indexOf(ticketType.toLowerCase()) !== -1) {
                  error.style = "skyblue";
                  element.style = 'skyblue';
                }
              }
            }
          });
        }
      }
    }

    let self = this;
    if (self.lookup.originalTicketTypeLookUp) {
      this.filterTicketTypeListDept = [];
      for (let department of self.ticketDetailForm.get("department").value) {
        if (self.lookup.originalTicketTypeLookUp.hasOwnProperty(department.toLowerCase())) {
          self.lookup.originalTicketTypeLookUp[department.toLowerCase()].forEach(obj => {
            if (obj.status == 0) {
              obj.department = department;
              this.filterTicketTypeListDept.push(obj)
            }
          });
        }
      }

    }
    this.setDropDownOfTicketType();
    this.CDRService.callDetectChanges(this.cdr);
  }



  //  Clear Ticket Menu Filter
  clearTicketType(event) {
    event.stopPropagation();
    this.ticketDetailForm.controls.ticketType.setValue('');
    this.searchTicketType();
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @description apply css to open subgrid on mouse hover
   * @memberof ActivityTicketComponent
   */
  ticketTypeMenuChange() {
    const self = this;
    $(document).ready(function () {
      $(".main-menu > li > a").mouseover(function (e) {
        e.stopPropagation();
        $('ul').removeClass('active-menu');
        $(this).toggleClass('menu-open');
        $(this).parent().children(".sub-menu").toggleClass("active-menu");
        $(this).parent("li").siblings().children("a").removeClass('menu-open');
        $(this).parent("li").siblings().children(".sub-menu").removeClass('active-menu');
        let totalHeight = $("#modal-ticket").height();
        let elementTopEdge = $(this).offset().top - $("#modal-ticket").offset().top;
        let submenuHeight = $(".main-menu > li > .active-menu").height();
        if ((submenuHeight + elementTopEdge) > totalHeight) {
          let a = totalHeight - (submenuHeight + elementTopEdge);
          $('.active-menu').css({ position: 'absolute', top: a + 'px', left: '340px', 'max-height': totalHeight, 'overflow-y': 'auto' });
        } else {
          $('.active-menu').css({ position: 'absolute', top: '0px', left: '340px' });
        }
      });

      $(".main-menu > li > a").click(function (e) {
        e.stopPropagation();
        $(this).toggleClass('menu-open');
        $(this).parent().children(".sub-menu").toggleClass("active-menu");
        $(this).parent("li").siblings().children("a").removeClass('menu-open');
        $(this).parent("li").siblings().children(".sub-menu").removeClass('active-menu');
      });

      $(".main-menu > li").mouseout(function (e) {
        e.stopPropagation();
        $(this).toggleClass('menu-open');
        $(this).parent().children(".sub-menu").toggleClass("active-menu");
        $(this).siblings().children("a").removeClass('menu-open');
        $(this).siblings().children(".sub-menu").removeClass('active-menu');
      });

      $('#tableMenu').click(function (e) {
        $('ul').removeClass('active-menu');
        $('li').removeClass('menu-open');
      });


      $('html, body, .main_innerpage-listing').click(function (e) {
        $('ul').removeClass('active-menu');
        $('li').removeClass('menu-open');
        self.showTicket = !self.showTicket;
      });
    });
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @description Create Chunk Or Group
   * @memberof ActivityTicketComponent
   */
  setDropDownOfTicketType() {
    this.lookup.ticketType = _.chunk(this.filterTicketTypeListDept, 18);
    let self = this;
    setTimeout(function () {
      self.ticketTypeMenuChange();
    }, 1000);
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @description fun call on type selection
   * @param {*} [event]
   * @param {*} [ticketType]
   * @param {*} [errorType]
   * @memberof ActivityTicketComponent
   */
  newTicket(event?: any, ticketType?: any, errorType?: any) {
    let maxValue = null;
    for (let i = 0; i < this.ticketDetailForm.get('year').value.length; i++) {
      if (maxValue === null || maxValue < this.ticketDetailForm.get('year').value[i]) {
        maxValue = this.ticketDetailForm.get('year').value[i];
      }
    }
    this.modal.close({ ticketType: ticketType, errorType: errorType, ticket: 'new', year: maxValue });
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @memberof ActivityTicketComponent
   */
  getLookups() {
    this.lookup.originalTicketTypeLookUp = this.data.lookup.typeDefinationDetails;
    this.lookup.taxYearList = this.data.lookup.yearsList;
    this.lookup.statusList = this.data.lookup.statusList;
    this.lookup.departmentList = this.data.lookup.activityDepartmentList;
    this.searchTicketType();
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @description this fun call on search to get data and bind in grid
   * @memberof ActivityTicketComponent
   */
  getActivityTicketData() {
    this.loader.show();
    let ticketDetails = JSON.parse(JSON.stringify(this.ticketDetailForm.value));

    if (ticketDetails.ticketNr && ticketDetails.ticketNr !== '') {
      delete ticketDetails.department;
      delete ticketDetails.year;
      delete ticketDetails.ticketStatus;
    } else {
      delete ticketDetails.ticketNr
    }
    ticketDetails.isTypeFieldRequire = true;
    this.ticketActivityDetailService.getCustomerTicketData(ticketDetails).then((response: any) => {
      this.availableActivityTicketData = response;

      for (let arr of this.availableActivityTicketData) {
        arr.controlInfo = '';
        if (arr.typeFieldDetailsWithDisplayText && arr.typeFieldDetailsWithDisplayText.length > 0) {
          for (let obj of arr.typeFieldDetailsWithDisplayText) {
            for (let prop in obj) {
              if (prop !== 'displayText') {
                if (obj[prop] !== undefined && obj[prop] !== null && obj[prop] !== '') {
                  arr.controlInfo += obj['displayText'] + ': ' + obj[prop] + ' # ';
                }
              }
            }
          }
        } else {
          arr.controlInfo = '';
        }
      }
      this.rowData = this.availableActivityTicketData ? this.availableActivityTicketData : [];
      if (this.rowData && this.rowData.length > 0) {
        this.loader.hide();
      } else {
        this.loader.hide();
      }
      this.getLookups();
      this.CDRService.callDetectChanges(this.cdr);

    });
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @memberof ActivityTicketComponent
   */
  getPDUserData() {
    this.loader.show();
    this.ticketActivityDetailService.getPDUserData().then((response: any) => {
      if (response) {
        this.loader.hide();
        for (let obj of response) {
          obj.agents = obj.agents.sort();
          if (obj.department == 'Customer Relation') {
            for (let agents of obj.agents) {
              if (agents.id == this.userDetails.id) {
                this.isRetentionTeamMember = true;

                break;
              }
            }
          }
        }
      }

      if (this.isRetentionTeamMember) {
        this.existingTicketDetails.department = ['Sales', 'Support', 'Renew', 'Setup']
      }
      this.getActivityTicketData();
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @memberof ActivityTicketComponent
   */
  reactiveFormValueChange() {
    this.ticketDetailForm.controls.ticketType.valueChanges.subscribe((data) => {
      this.searchTicketType();
    })
  }

  /** 
   *  @author Dhruvi shah
   * @createdDate 27-12-29
   * @memberof ActivityTicketComponent
   */
  initTicketDetailForm() {
    this.ticketDetailForm = this.fb.group({
      year: [this.existingTicketDetails.year],
      department: [this.existingTicketDetails.department],
      ticketStatus: [this.existingTicketDetails.ticketStatus],
      ticketNr: '',
      customerId: this.existingTicketDetails.customerId,
      ticketType: ''
    });
    this.reactiveFormValueChange();
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi shah
   * @createdDate 27-12-29
   * @memberof ActivityTicketComponent
   */
  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.existingTicketDetails = this.data;
    this.existingTicketDetails.ticketStatus = "open";
    this.getPDUserData();
    this.initTicketDetailForm();
  }

}
