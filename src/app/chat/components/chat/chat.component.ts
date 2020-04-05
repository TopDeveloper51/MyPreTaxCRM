/** External import */
import { Component, OnInit, Input, ViewChildren, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import * as moment from "moment";
/** Internal import */
import { UserService, CommonApiService, LocalStorageUtilityService } from '@app/shared/services';
import { ChatSocketService } from '@app/chat/socket/chat-socket.service';
import { CHAT_TYPE, APINAME } from '@app/chat/chat-constants';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { Subscription } from 'rxjs';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { DialogService } from '@app/shared/services/dialog.service';
import { CustomerChatDetailComponent } from '@app/chat/dialog/customer-chat-detail/customer-chat-detail.component';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() activityData: any;
  @ViewChildren("chat_messages") chat_messages;
  @ViewChild("content", { static: false }) content: ElementRef;

  chatMessageForm: FormGroup;
  userDetail: any;
  chatUserEmail:any;
  messages: any = [];
  chatData: any = {};
  notiLbl: string;
  activeAgents: any;
  onlineUsers: any = [];
  ticketActivityOverlaySubscription: any;
  closeWindows: any;
  defaultMessageList: any = [];
  isItalics: boolean = false;
  isBold: boolean = false;
  urlRegex = new RegExp(/(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+/);
  currentMessage: any;
  onlineAgents: any;
  defaultMessagesSubscription: Subscription;

  private chatDetailsSubscription: Subscription;
  public count: number = 607; // to set dynamic height of editor
  public innerCount: number = 512;


  /** constructor */
  constructor(
    private _userService: UserService,
    private _chatSocketService: ChatSocketService,
    private _commonAPIService: CommonApiService,
    private _localStorageUtilityService: LocalStorageUtilityService,
    private _ticketActivityOverlayService: TicketActivityOverlayService,
    private integrityService: TicketActivityIntegrityService,
    private dialogService:DialogService
  ) {
    this.chatMessageForm = new FormGroup({
      sender: new FormControl(''),
      defaultMessage: new FormControl(''),
      selectedAgent: new FormControl(null)
    });
  }

  /** Join Chat */
  joinChat() {
    let _self = this;
    this._chatSocketService.emit('assigned', {
      "agentId": this.userDetail.id,
      "type": CHAT_TYPE.JOINCHAT.toString(),
      "activityId": this.activityData.id,
      "chatId": this.chatData.chatId,
      "agentName": this.chatData.agentName
    }, () => { });
    _self.chatData.selfChatActive = true;
    this.chatMessageForm.controls.sender.enable();
    //_self.addChat({ "chatId": _self.chatData.chatId, "msg": this.chatData.agentName + "has join this conversation", flag: "notification", type: "notification" });
  }

  /** Leave chat */
  leaveChat() {
    let _self = this;
    this._chatSocketService.emit('leaveChat', {
      "agentId": this.userDetail.id,
      "type": CHAT_TYPE.LEAVECHAT.toString(),
      "activityId": this.activityData.id,
      "chatId": this.chatData.chatId
    }, () => { });
    _self.chatData.selfChatActive = false;
    _self.chatData.isAllowedToLeave = false;
    this.chatMessageForm.controls.sender.disable();
    //_self.addChat({ "chatId": _self.chatData.chatId, "msg": this.activityData.agentName + " has left from this conversation", flag: "notification", type: "notification" });
  }

  /** close chat */
  closeChat() {
    let _self = this;
    this._chatSocketService.emit('closeChat', {
      "agentId": this.userDetail.id,
      "type": CHAT_TYPE.CLOSECHAT.toString(),
      "activityId": this.activityData.id,
      "chatId": this.chatData.chatId
    }, () => { });
    _self.chatData.selfChatActive = false;
    _self.chatData.isActiveChat = false;
    _self.chatData.isAllowedToLeave = false;
    _self.chatData.isAllowedToClose = false;
    this.chatMessageForm.controls.sender.disable();
  }

  /** Transfer chat */
  transferChat() {
    if (!this.chatMessageForm.controls.selectedAgent.value) { return; }
    this.chatData.isAllowedToClose = false;
    this.chatData.isAllowedToLeave = true;
    let data = {
      'chatId': this.chatData.chatId,
      'agentId': this.userDetail.id,
      'transferAgentId': this.chatMessageForm.controls.selectedAgent.value,
      'activityId': this.activityData.id
    };
    this._chatSocketService.emit("transferChat", data, () => { });
  }

  public customerChatDetail()
  {
    this.dialogService.custom(CustomerChatDetailComponent, { customerChatDetail:this.activityData.chatDetails.email}, { keyboard: true, backdrop: true, size: 'md' }).result.then((result) => {
    }); 
  }
  /** Send message */
  sendMsg(event) {
    let msg = this.chatMessageForm.controls.sender.value.trim();

    if (!msg) { return; }

    if (this.isBold && this.isItalics) { msg = '<b><i>' + msg + '</i></b>'; }
    else if (this.isBold) { msg = '<b>' + msg + '</b>'; }
    else if (this.isItalics) { msg = '<i>' + msg + '</i>'; }

    /** If text has has url then add anchor tag */
    if (this.urlRegex.test(msg)) {
      msg = this.createTextLinks_(msg);
    }

    if ((event.type === 'submit' || event.keyCode == 13) && msg.length > 0) {
      let lastMessage = this.messages.findIndex(x => this.currentMessage && x.id == this.currentMessage.id);
      if (lastMessage != -1) {
        this.messages[lastMessage].msg = "<i class='fas fa-pencil-alt'></i> " + msg;
        this.messages[lastMessage].isUpdated = true;
      }
      else {
        this.addChat({ "chatId": this.chatData.chatId, "msg": msg, flag: "send", createdByName: this.chatData.agentName, createdBy: { id: this.userDetail.id } });
      }
      let msgData = {
        msg: msg,
        chatId: this.chatData.chatId,
        agentId: this.userDetail.id,
        agentName: this.chatData.agentName,
        activityId: this.activityData.id,
        type: CHAT_TYPE.MSG.toString(),
        Source: 'CRM'
      };
      this._chatSocketService.emit("msg", msgData, () => { });
      this.chatMessageForm.controls.sender.setValue("");
      this.currentMessage = undefined;
    }
  }

  /** Edit message */
  editMessage() {
    let lastMessage = this.messages.filter(x => x.createdBy.id == this.userDetail.id && x.flag == "send");
    if (lastMessage.length > 0) {
      if (!lastMessage[lastMessage.length - 1].id) {
        lastMessage[lastMessage.length - 1].id = new Date().getTime();
      }
      this.chatMessageForm.controls.sender.setValue(lastMessage[lastMessage.length - 1].msg
        .replace(/(<([^>]+)>)/ig, '')
      );
      this.currentMessage = JSON.parse(JSON.stringify(lastMessage[lastMessage.length - 1]));
    }
  }

  /** Handel typing event */
  keyup(event) {
    var msgObj = {
      agentId: this.chatData.agentIds,
      message: this.chatData.agentName + " is typing.. " + this.chatMessageForm.controls.sender.value.trim(),
      agentName: this.chatData.agentName,
      activityId: this.activityData.id,
      timestamp: moment().utc().format(),
      senderAgentId: this.userDetail.id
    }
    this._chatSocketService.emit('typing', msgObj, () => { });
  }

  /** Send default msg */
  sendDefaultMessage(message) {
    this.chatMessageForm.controls.sender.setValue(message);
  }

  /**Make italics */
  makeItalic() { this.isItalics = !this.isItalics; }
  /** Make bold */
  makeBold() { this.isBold = !this.isBold; }

  ngOnInit() {
    this.chatDetailsSubscription = this.integrityService.getMessage().subscribe(msgObj => {
      // if (msgObj.topic === 'ta-ticket-activity-length') {
      //   // to set dynamic height of editor when ta-ticket-activity has less than 5 records 
      //   this.count = msgObj.data;
      //   if (this.count < 5) {
      //     if (this.count === 1) {
      //       this.count = 506 + 18 * 4;
      //       this.innerCount = 462 + 18 * 4;
      //     } else {
      //       this.count = 5 - this.count;
      //       this.count = 506 + 20 * this.count;
      //       this.innerCount = 5 - this.innerCount;
      //       this.innerCount = 462 + 20 * this.innerCount;
      //     }

      //   } else {
      //     this.innerCount = 422;
      //     this.count = 510;
      //   }
      // }
      // if (msgObj.topic === 'set-dynamic-chat-height') {
      //   this.count = 633;
      // }
      if (msgObj.topic === 'kendo-chat-dynamic-height') {
        this.count=msgObj.data;
      }
    });
   
    if (!this.activityData.chatDetails || Object.keys(this.activityData.chatDetails).length == 0) { return; }

    this.messages = JSON.parse(JSON.stringify(this.activityData.chatDetails.messageList));
   
    this.integrityService.sendMessage({ channel: 'chat-email', topic:'chatEmail', data:this.activityData.chatDetails });    
    this.messages.forEach(element => {
      //element.msg = this.createTextLinks_(element.msg);
      element.initial = (element.createdByName[0] +
        (element.createdByName.indexOf(" ") != -1 ? element.createdByName.substring(element.createdByName.indexOf(" ") + 1)[0] : '')
      ).toUpperCase()
    });
    //this.chatData.chatId = this.activityData.chatDetails.chatId.indexOf("w") == -1 ? "w_" + this.activityData.chatDetails.chatId : this.activityData.chatDetails.chatId;
    this.chatData.chatId = this.activityData.chatDetails.chatId;
    this.userDetail = this._userService.getUserDetail();

    if (this.userDetail.chatAgentName) {
      this.chatData.agentName = this.userDetail.chatAgentName;
    }
    else {
      this.chatData.agentName = this.userDetail.firstName + ' ' + this.userDetail.lastName;
    }

    /** Check minimized window */
    this._localStorageUtilityService.getFromLocalStorage('openedActivityIDs')
    this.initChat();
    this.getOnlineAgents();
    //this.getDefaultMessage();

    /** Get list of minimized activity windows */
    this.ticketActivityOverlaySubscription = this._ticketActivityOverlayService.arrayList.subscribe((result) => {
      this.closeWindows = result;
    });

    /** Get Default Message */
    this.defaultMessagesSubscription = this._chatSocketService.defaultMessage.subscribe(x => {
      this.sendDefaultMessage(x);
    });
  }

  /** */
  ngAfterViewInit() {
    /** Check message box changes */
    this.chat_messages.changes.subscribe(this.scrollToBottom);
    this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
  }

  /** Handle scroll */
  scrollToBottom = () => {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) { }
  }

  /** Init chat */
  private initChat() {

    //Connect
    this._chatSocketService.connect_chat();
    this._chatSocketService.on("connect", (data) => { console.log("Socket connected successfully."); });
    this.listenSocketEvents();
    this.chatData.agentIds = this.activityData.chatDetails.agentHistory.filter(x => !x.endTime).map(x => x.agentId);
    if (this.activityData.chatDetails.agentHistory && this.activityData.chatDetails.agentHistory.length > 0) {
      let agentIndex = this.chatData.agentIds.findIndex(x => x == this.userDetail.id);
      if (agentIndex != -1) { this.chatData.selfChatActive = true; }
      else { this.chatData.selfChatActive = false; }
    }
    this.chatData.isActiveChat = this.activityData.isActiveChat;
    if (this.activityData.responsiblePerson_value == this.userDetail.id) {
      this.chatData.isAllowedToClose = true;
      this.chatData.isAllowedToLeave = false;
    }
    else {
      this.chatData.isAllowedToClose = false;
      this.chatData.isAllowedToLeave = true;
    }

    if (this.chatData.isActiveChat && this.chatData.selfChatActive) {
      this.chatMessageForm.controls.sender.enable();
    }
    else {
      this.chatMessageForm.controls.sender.disable();
    }

    /** Send chat data to activity action for enable or disabled button */
    this._chatSocketService.chatData.next(this.chatData);
  }

  /** Listen socket events */
  listenSocketEvents() {
    //Customer Typing
    let _self = this;
    this._chatSocketService.on("typing", (data) => {
      if (_self.userDetail.id != data.senderAgentId && _self.activityData.id == data.activityId) {
        _self.notiLbl = data.message;
        /** Clear msg if not get */
        setTimeout(function () {
          _self.notiLbl = "";
          if (_self.onlineUsers && _self.onlineUsers.length > 0) {
            _self.onlineUsers.splice(0, 1);
          }
        }, 2000);
      }
    });

    /** Customer leave chat */
    this._chatSocketService.on("leaveChat", (data) => {
      if (data.data.activityId == _self.activityData.id) {
        let msg = data.data.agentName + " has left from this conversation";
        let agentIndex = _self.chatData.agentIds.findIndex(x => x == data.data.agentId);
        if (agentIndex != -1) {
          _self.chatData.agentIds.splice(agentIndex, 1);
        }

        let agentDisplayIndex = this.activeAgents.findIndex(x => x.userId == data.data.agentId);
        if (agentDisplayIndex != -1) {
          _self.activeAgents.splice(agentDisplayIndex, 1);
          this.activeAgents = JSON.parse(JSON.stringify(this.activeAgents));
        }
        _self.addChat({ "chatId": _self.chatData.chatId, "msg": msg, flag: "notification", type: "notification" });
      }
    });
    /** Customer close chat */
    this._chatSocketService.on("closeChat", (data) => {
      if (data.data.activityId == _self.activityData.id) {
        let msg = data.data.agentName + " has closed this conversation";
        _self.addChat({ "chatId": _self.chatData.chatId, "msg": msg, flag: "notification", type: "notification" });
        _self.chatData.isAllowedToLeave = false;
        _self.chatData.isAllowedToClose = false;
        _self.chatData.isActiveChat = false;
      }
    });

    /** Customer close chat */
    this._chatSocketService.on("closeWindow", (data) => {
      if (data.activityId == _self.activityData.id) {
        let msg = data.message;
        _self.addChat({ "chatId": _self.chatData.chatId, "msg": msg, flag: "notification", type: "notification" });
      }
    });

    /** Listen customer message */
    this._chatSocketService.on('msg', function (data) {
      if (data.agentId !== _self.userDetail.id && data.activityId == _self.activityData.id) {
        _self.notiLbl = '';
        data.flag = 'receive';
        if (_self.activityData.id == data.activityId) {
          // /** Check msg has url then add anchor tag */
          _self.addChat(data);
          if (_self.closeWindows && _self.closeWindows.list && _self.closeWindows.list.length > 0) {
            let index = _self.closeWindows.list.findIndex(x => x.id == data.activityId);
            if (index != -1) {
              _self._chatSocketService.messageNotification.next(data);
            }
          }
        }
      }
    });

    /** rejoin chat */
    this._chatSocketService.on("rejoin", (data) => { });

    /** Assigned or join chat */
    this._chatSocketService.on('assigned', function (data) {
      if (data.data.agentIds && data.data.activityId == _self.activityData.id) {
        _self.addChat({ "chatId": _self.chatData.chatId, "msg": data.data.agentName + " has join this conversation", flag: "notification", type: "notification" });
        if (_self.chatData.agentIds.findIndex(x => x == data.data.agentId) == -1) {
          _self.chatData.agentIds.push(data.data.agentId);
          _self.getAgentNameFromAgentId(data.data.agentId);
        }
        if (_self.activityData.responsiblePerson_value != _self.userDetail.id) {
          _self.chatData.isAllowedToClose = false;
          _self.chatData.isAllowedToLeave = true;
        }
        _self._chatSocketService.chatData.next(_self.chatData);
      }
    });

    /** Transfer chat */
    this._chatSocketService.on('transferChat', function (data) {
      if (data.data.activityId == _self.activityData.id) {
        _self.addChat({ "chatId": _self.chatData.chatId, "msg": data.data.msg, type: "notification", flag: "notification", agentId: _self.userDetail.id });
      }
      if (data.data.activityId == _self.activityData.id && data.data.transferAgentId == _self.userDetail.id) {
        _self.chatData.isAllowedToClose = true;
        _self.chatData.isAllowedToLeave = false;
      }
      _self.chatData.ownerId = data.data.transferAgentId;
      _self._chatSocketService.chatData.next(_self.chatData);
    });

    this._chatSocketService.on('agentstatus', function (data) { });
  }

  /** Add chat in message list */
  private addChat(msg: any) {
    if (msg) {
      if (this.urlRegex.test(msg)) {
        msg = this.createTextLinks_(msg);
      }
      this.messages.push({
        "msg": msg.msg,
        "flag": msg.flag,
        "createdByName": msg.createdByName,
        "createdBy": { id: msg.agentId },
        "initial": msg.createdByName ? ((msg.createdByName[0] +
          (msg.createdByName.indexOf(" ") != -1 ? msg.createdByName.substring(msg.createdByName.indexOf(" ") + 1)[0] : '')
        ).toUpperCase()) : '',
        "isNew": true,
        "time": new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      });
    }
  }

  /** Get Online Agents list */
  private getOnlineAgents() {
    this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_ONLINE_AGENTS }).then(
      (response: any) => {
        this.onlineAgents = response;
        this.activeAgents = [];
        this.activityData.chatDetails.agentHistory.forEach(element => {
          if (!element.endTime) {
            this.getAgentNameFromAgentId(element.agentId);
          }
        });
      }
    )
  }

  /** Get agent name from id */
  getAgentNameFromAgentId(agentId) {
    let index = this.onlineAgents.findIndex(x => x.userId == agentId && x.userId != this.userDetail.id);
    if (index != -1) {
      this.activeAgents.push(this.onlineAgents[index]);
      this.activeAgents = JSON.parse(JSON.stringify(this.activeAgents));
    }
  }

  /** Get can chat list */
  private getDefaultMessage() {
    let department: any
    if (this.userDetail.chatDepartment && this.userDetail.chatDepartment.length > 0) {
      if (this.userDetail.chatDepartment.length > 1) {
        department = 'Both'
      } else {
        department = this.userDetail.chatDepartment[0];
      }
    }
    this._commonAPIService.getPromiseResponse({ apiName: APINAME.GET_CANNEDMSGS, parameterObject: { 'userId': this.userDetail.id, 'department': department } }).then(response => { this.defaultMessageList = response; });
  }

  /** Convert link in text */
  private createTextLinks_(text) {
    return (text || "").replace(
      /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
      function (match, space, url) {
        var hyperlink = url;
        if (!hyperlink.match('^https?:\/\/')) {
          hyperlink = 'http://' + hyperlink;
        }
        return space + '<a class="user-link" href="' + hyperlink + '">' + url + '</a>';
      });
  };

  /** Destroy */
  ngOnDestroy() {
    if (this.ticketActivityOverlaySubscription) {
      this.ticketActivityOverlaySubscription.unsubscribe();
    }
    if (this.defaultMessagesSubscription) { this.defaultMessagesSubscription.unsubscribe(); }
    if (this.chatDetailsSubscription) { this.chatDetailsSubscription.unsubscribe(); }
    this._chatSocketService.unregister("assigned", (data) => { });
    this._chatSocketService.unregister("leaveChat", (data) => { });
    this._chatSocketService.unregister("transferChat", (data) => { });
    this._chatSocketService.unregister("msg", (data) => { });
    this._chatSocketService.unregister("typing", (data) => { });
    this._chatSocketService.unregister("closeChat", (data) => { });
    this._chatSocketService.unregister("rejoin", (data) => { });
    this._chatSocketService.unregister("closeWindow", (data) => { });
  }
}
