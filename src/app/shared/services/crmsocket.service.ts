import { Injectable } from '@angular/core';
import { SocketService } from '@app/shared/services/socket.service';
import { UserService } from '@app/shared/services/user.service';
@Injectable({
  providedIn: 'root'
})
export class CRMSocketService {
  // Events 
  constructor(private socketService: SocketService, private userService: UserService) { }
  register(userDetails: any) {
    const self = this;
    self.socketService.connect();
    self.socketService.emit('Join', userDetails.id, function (): void { });
    self.socketService.on('connect', function (): void {
      console.log("Socket Service Connected");
     // self.socketService.emit('Join', userDetails.id, function (): void { });
    });

    self.socketService.on('HealthCheck', function (id: any): void {
      self.socketService.emit('HealthCheck', id, function (): void { });
    });

    let obj = { agentId: userDetails.id, status: userDetails.userStatus === 'offline' ? 'online' : userDetails.userStatus };
    self.socketService.emit('UserStatusUpdate', obj, () => { });
    self.socketService.on('onAgentPDDetails', function (socketResponse): void {
      self.userService.USER_STATUS = status;
      let userData = self.userService.getUserDetail();
      userData.userStatus = status;
      self.userService.updateUserDetails(userData);
      self.userService.setUserStatusChange(socketResponse.agentStatus);
    });
  }

  public close(): void {
    if (this.socketService !== undefined) {
      console.log("Socket Closed Successfully");
      this.socketService.close();
      this.socketService = undefined;
    }
  };
}
