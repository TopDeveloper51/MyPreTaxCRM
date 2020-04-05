/** External import */
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ColDef, _ } from 'ag-grid-community';
import * as moment from 'moment-timezone';
/** Internal import */
import { CommonApiService, DialogService, UserService } from '@app/shared/services';
import { APINAME, CHAT_TYPE } from '@app/chat/chat-constants';
import { ChatService } from '@app/chat/chat.service';
import { MessageHistoryComponent } from '@app/chat/dialog/message-history/message-history.component';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { ChatSocketService } from '@app/chat/socket/chat-socket.service';

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit {
  columnDefs: any;
  rowData: any;
  defaultColDef: ColDef;
  chatHistoryResponse: any;
  userDetails: any;
  isLoading: boolean;
  public getRowHeight = function (params) {
    return params.data.rowHeight = 38;
  };

  constructor(
    private activeModal: NgbActiveModal,
    private _commonAPIService: CommonApiService,
    private _chatService: ChatService,
    private _dialogService: DialogService,
    private _ticketActivityOverlayService: TicketActivityOverlayService,
    private _userService: UserService,
    private _chatSocketService: ChatSocketService
  ) { }

  /** close dialog */
  close() { this.activeModal.close(); }

  /** Grid ready event */
  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  /** Row clicked */
  onRowClicked(e) {
    if (e.event.target) {
      const actionType = e.event.target.getAttribute('data-action-type');
      const activityId = e.event.target.getAttribute('data-activityId');
      const chatId = e.event.target.getAttribute('data-chatId');
      switch (actionType) {
        case "message":
          this.showMessageHistory(activityId);
          break;
        case "accept":
        case "open":
          this.openActivityDialog(activityId, actionType, chatId);
          break;
        default:
          break;
      }
    }
    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
  }

  /** Show message history */
  showMessageHistory(activityId) {
    let messages = this.chatHistoryResponse.chatHistoryData.filter(x => x.activityId == activityId);
    let data;
    if (messages.length > 0) { data = messages[0] }
    let dialog = this._dialogService.custom(MessageHistoryComponent, data, { keyboard: false, backdrop: 'static', size: 'lg' });
  }

  /** Open activity dialog */
  openActivityDialog(activityId, type, chatId = undefined) {
    let dialogData: any = {};
    dialogData.id = activityId;
    dialogData.screen = 'activity';
    dialogData.searchActivityData = { data: [] };
    if (type == 'open') { }
    else if (type == 'accept') {
      let data: any = {}
      data.chatId = chatId;
      data.agentId = this.userDetails.id;
      data.agentName = '';
      if (this.userDetails.chatAgentName) {
        data.agentName = this.userDetails.chatAgentName;
      } else {
        data.agentName = this.userDetails.firstName + " " + this.userDetails.lastName;
      }
      data.type = CHAT_TYPE.ASSIGNCHAT.toString();
      this._chatSocketService.emit('assigned', data, () => { });
    }

    this._ticketActivityOverlayService.openWindow(dialogData);
    this.close();
  }

  /** refreshData */
  refreshData() { this.getHistoryData(); }

  ngOnInit() {
    this.userDetails = this._userService.getUserDetail();
    this.defaultColDef = this._chatService.getDefaultColDef();
    this.columnDefs = this._chatService.getChatHitoryColumnDefs();
    this.chatHistoryResponse = {};
    this.chatHistoryResponse.chatHistoryData = [];
    this.getHistoryData();
  }

  /** Get chat history data */
  private getHistoryData() {
    let self = this;
    this.isLoading = true;
    this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_CHAT_HISTORY_DATA }).then(
      (response: any) => {
        if (response !== undefined && response !== null && Object.keys(response).length > 0) {
          self.chatHistoryResponse = response;
          self.chatHistoryResponse.chatHistoryData = [];
          self.chatHistoryResponse.chatHistoryData = self.chatHistoryResponse.chatHistoryData.concat(response.active);
          self.chatHistoryResponse.chatHistoryData = self.chatHistoryResponse.chatHistoryData.concat(response.wait);

          self.chatHistoryResponse.chatHistoryData.forEach(obj => {
            if (obj.waitDuration) {
              if (obj.custInfo == "4555555555555,hellotttttttt@yopmail.com,000020150000000") {
                let a = 10;
              }
              obj.waitDuration = moment(obj.waitDuration).utc().format("HH:mm:ss");
            } else {
              obj.waitDuration = moment((moment().utc() - moment(obj.startDateTime).utc())).utc().format("HH:mm:ss");
            }
            if (obj.activeDuration) {
              obj.activeDuration = moment(obj.activeDuration).utc().format("HH:mm:ss");
            }

            if (obj.destination == 'en' || obj.destination == 'EN') {
              obj.destination = 'English'
            }
            else {
              obj.destination = 'Spanish'
            }
          });
        }
        this.isLoading = false;
      }, (error) => { this.isLoading = false; });
  }
}
