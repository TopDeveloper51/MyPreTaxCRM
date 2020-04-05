import { Injectable } from '@angular/core';
import { UserService } from '@app/shared/services/user.service';
import { SocketService } from '@app/shared/services/socket.service';
@Injectable({
  providedIn: 'root'
})
export class DialerService {
  makeCall: Boolean = true;
  isMute: Boolean = false;
  isHoldShow: Boolean = false;
  isResumeShow: Boolean = false;
  predictiveMakeCall: Boolean = true;
  isPlivoUser: Boolean = false;
  isEventRegister: Boolean = false;
  hasMediaPermission: Boolean = false;
  callUUID: string;
  holdData: any;
  userDetails: any = this.userService.getUserDetail();
  plivoWebSdk;

  constructor(private userService: UserService,private socketService:SocketService) { }

  public writeLogsToPBX(eventName, eventdata?) {
    let data: any = {};
    data.agentId = this.userDetails.id;
    data.eventName = eventName;
    if (eventdata !== undefined) {
      data.eventdata = eventdata
    } else {
      data.eventdata = {}
    }
    this.socketService.emit('LogPlivoEvent', data, function (): void { });
    console.log(JSON.stringify(data))
  }

}
