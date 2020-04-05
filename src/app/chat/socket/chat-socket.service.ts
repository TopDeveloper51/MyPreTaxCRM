/** External import */
import { Injectable } from '@angular/core';
import * as io from "socket.io-client";
import { Subject } from 'rxjs';
/** Internal import */
import { environment } from '@environments/environment';
import { HelperService } from '@app/shared/services/helper.service';
import { CHAT_TYPE } from '@app/chat/chat-constants';


@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  socket: any;
  messageNotification: Subject<any>;
  defaultMessage: Subject<any>;
  chatData: Subject<any>;

  constructor(
    private helperService: HelperService
  ) {
    this.messageNotification = new Subject<any>();
    this.defaultMessage = new Subject<any>();
    this.chatData = new Subject<any>();
  }

  /** Connect */
  connect_chat(): void {
    if (!this.socket) {
      console.log('Socket Connect');
      this.socket = io.connect(`${environment.websocket_for_chat_url}`, {
        'reconnection': true,
        'reconnectionDelay': 20000,
        'reconnectionDelayMax': 30000,
        'reconnectionAttempts': 10
      });
    }
  }

  // emit and publish the message
  public emit(eventName: any, data: any, callback: any): void {
    const self = this;
    if (this.socket !== undefined) {
      console.log('Emit Socket : %s -> %s', eventName, JSON.stringify(data));
      this.socket.emit(eventName, data, function (): void {
        const args = arguments;
        if (callback) {
          callback.apply(self.socket, args);
        }
      });
    }
  };

  // Listen event on and publish the message
  public on(eventName: any, callback: any): void {
    if (this.socket !== undefined) {
      const self = this;
      console.log('Register Socket : %s', eventName);
      this.socket.on(eventName, function (): void {
        const args = arguments;
        console.log('Listen Socket : %s -> %s', eventName, JSON.stringify(arguments['0']));
        if (callback) {
          callback.apply(self.socket, args);
        }
      });
    }
  };

  /** Register Chat */
  public register_chat(userDetails: any) {
    if (!userDetails || Object.keys(userDetails).length == 0) { return; }
    let self = this;
    this.connect_chat();
    this.on('connect', function (): void {
      console.log("Chat Socket Service Connected");
      self.emit('onJoin', {
        "userId": userDetails.id,
        "type": CHAT_TYPE.JOINROOM.toString(),
        "page_title": "Tax Chat Api",
        "timezone": self.helperService.getTimeZone().timezone
      }, () => { });
    });
  }

  /** Unregister event */
  public unregister(eventName: any, callback: any): void {
    if (this.socket !== undefined) {
      console.log('Unregistered Socket : %s', eventName);
      this.socket.off(eventName);
    }
  }
}
