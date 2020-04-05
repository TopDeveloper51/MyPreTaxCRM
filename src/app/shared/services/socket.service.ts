import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '@environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  constructor() { }
  // Connect
  public connect(): void {
    if (this.socket === undefined) {
      console.log('Socket Connect');
      this.socket = io.connect(`${environment.websocket_url}`, {
        'reconnection': true,
        'reconnectionDelay': 20000,
        'reconnectionDelayMax': 30000,
        'reconnectionAttempts': 10
      });
    }
  };

  // Disconnect connection
  public close(): void {
    if (this.socket !== undefined) {
      console.log('Socket Close');
      this.socket.close();
      this.socket = undefined;
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
          callback.apply(this.socket, args);
        }
      });
    }
  };

  // Listen event emit and publish the message
  public emit(eventName: any, data: any, callback: any): void {
    if (this.socket !== undefined) {
      console.log('Emit Socket : %s -> %s', eventName, JSON.stringify(data));
      this.socket.emit(eventName, data, function (): void {
        const args = arguments;
        if (callback) {
          callback.apply(this.socket, args);
        }
      });
    }
  };

  public unregister(eventName: any, callback: any): void {
    if (this.socket !== undefined) {
      console.log('Unregistered Socket : %s', eventName);
      this.socket.off(eventName);
    }
  }
}
