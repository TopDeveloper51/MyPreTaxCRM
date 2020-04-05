// Expernal Import
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, Output, EventEmitter, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// Internal Import
import { CommonApiService , CDRService} from '@app/shared/services';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-ticket-type-field-list',
  templateUrl: './ticket-type-field-list.component.html',
  styleUrls: ['./ticket-type-field-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketTypeFieldListComponent implements OnInit, OnChanges {
  @Input() selectedTicketTypeFieldList: any = [];
  @Input() availableTicketTypeFieldList: any = [];
  @Input() ticketTypeId: any;
  public selectedRow;
  @Input() ticketTypeDepartment: any;
  @Output() ticketOutputEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() ticketFieldListSave: EventEmitter<any> = new EventEmitter<any>();

  isSelectedRow = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private commonApi: CommonApiService,
    private CDRService:CDRService ) { }

  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is use to specific one ticketrecord on click 
  * @memberof ManageTicketTypeComponent
  */

  viewTicketTypeFieldDetails(ticket) {
    this.ticketOutputEmit.emit(ticket);
    this.selectedRow = ticket.id;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      if (!event.container.sortingDisabled) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        const reorderingObject = {
          reqType: 'typeFields', typeId: this.ticketTypeId, department: this.ticketTypeDepartment,
          data: this.selectedTicketTypeFieldList.map(obj => obj.id)
        };
        this.commonApi.getPromiseResponse({ apiName: APINAME.TICKET_REORDER, parameterObject: reorderingObject }).then(response => {
          console.log(response);
          this.CDRService.callDetectChanges(this.cdr);
        }, error => {
          console.error(error);
        })
      }
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.ticketFieldListSave.emit(true);
    }
  }

  ngOnChanges(changes) {
    this.CDRService.callDetectChanges(this.cdr);
    if (changes.selectedTicketTypeFieldList && changes.selectedTicketTypeFieldList.currentValue && changes.selectedTicketTypeFieldList.currentValue.length > 0) {
      this.viewTicketTypeFieldDetails(changes.selectedTicketTypeFieldList.currentValue[0]);
    }
  }
  ngOnInit() {
    // this.getTicketTypeDetails();
    this.CDRService.callDetectChanges(this.cdr);
  }

}
