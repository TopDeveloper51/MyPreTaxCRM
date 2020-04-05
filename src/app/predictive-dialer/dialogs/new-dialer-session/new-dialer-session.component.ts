// External Imports
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Internal Imports
import { MessageService } from '@app/shared/services/message.service';
import { UserService } from '@app/shared/services/user.service';
import { SocketService } from '@app/shared/services/socket.service';
import { SOCKETNAME } from '@app/predictive-dialer/predictive-dialer-constants';
import { PredictiveDialerService } from '@app/predictive-dialer/predictive-dialer.service';

@Component({
  selector: 'app-new-dialer-session',
  templateUrl: './new-dialer-session.component.html',
  styleUrls: ['./new-dialer-session.component.scss']
})
export class NewDialerSessionComponent implements OnInit, OnDestroy {

  public sessionDetail: any = { 'userId': '', 'marketingListDocKey': '', 'name': '', 'noOfCallsPerAgent': 1.6, 'status': '', 'totalNoInLists': null, 'isMachineDetectionOn': true, 'machineDetectionTime': 2 };
  public dialerLookup = [];
  public mode = '';
  public dialerTypeLookup = [{ 'id': 'morning', 'name': 'Morning' }, { 'id': 'afternoon', 'name': 'Afternoon' }];
  public disableSave = false;
  public newDialerSessionForm: FormGroup;
  @Input() data: any = {};

  constructor(public modal: NgbActiveModal, private userService: UserService, private socketService: SocketService,
    private messageService: MessageService, private predictiveDialerService: PredictiveDialerService, private fb: FormBuilder) { }


  public close() {
    this.modal.close();
  }

  checkValidation() {
    if (!(this.sessionDetail.machineDetectionTime >= 2 && this.sessionDetail.machineDetectionTime <= 10)) {
      this.disableSave = true;
    } else {
      this.disableSave = false;
    }
  }

  public saveManageDialer(isEventEmit: boolean, response?: any): void {
    if (isEventEmit === true) {
      this.sessionDetail.marketingListDocKey = this.newDialerSessionForm.controls.marketingListDocKey.value;
      this.sessionDetail.dialerType = this.newDialerSessionForm.controls.dialerType.value;
      this.sessionDetail.name = this.newDialerSessionForm.controls.name.value;
      this.sessionDetail.noOfCallsPerAgent = this.newDialerSessionForm.controls.noOfCallsPerAgent.value;
      this.sessionDetail.isMachineDetectionOn = this.newDialerSessionForm.controls.isMachineDetectionOn.value;
      this.sessionDetail.machineDetectionTime = this.newDialerSessionForm.controls.machineDetectionTime.value;
      if (!this.sessionDetail.isMachineDetectionOn) {
        this.sessionDetail.machineDetectionTime = 2;
      }
      this.sessionDetail.userId = this.userService.getUserDetail().id;
      this.socketService.emit(SOCKETNAME.emitPDSessionSave, this.sessionDetail, () => { });
    } else if (response !== undefined) {
      if (!this.sessionDetail.id) {
        this.messageService.showMessage('Session created successfully', 'success');
      } else {
        this.messageService.showMessage('Session updated successfully', 'success');
      }
      this.modal.close(true);
    }
  }


  // function for Only positive Number allowed
  public isPositiveNumber(event: any): any {
    if (event.keyCode === 45 || event.keyCode === 101 || event.keyCode === 43 || event.keyCode === 69) {
      return false;
    }
  }

  registerSocket() {
    this.socketService.on(SOCKETNAME.onPDSessionSave, (socketResponse: any) => {
      if (socketResponse && socketResponse.code === 2000) {
        this.saveManageDialer(false, socketResponse.data);
      }
    });
  }

  getDialerLookup() {
    this.predictiveDialerService.getDialerLookup()
      .then(response => {
        this.dialerLookup = response;
        const data = this.data.data;
        this.newDialerSessionForm.patchValue(data);
        this.sessionDetail = data;
      }, error => {
        console.log(error);
      })
  }

  initNewDialerSession() {
    this.newDialerSessionForm = this.fb.group({
      marketingListDocKey: [undefined, Validators.required],
      dialerType: [undefined, Validators.required],
      name: [undefined, Validators.required],
      noOfCallsPerAgent: [1.6, Validators.required],
      isMachineDetectionOn: true,
      machineDetectionTime: 2,
    })
  }

  onDialerTypeChange(event) {
    if (event === 'morning') {
      this.newDialerSessionForm.controls.name.setValue('Retention Morning');
    } else {
      this.newDialerSessionForm.controls.name.setValue('Retention Afternoon');
    }
  }

  ngOnInit() {
    this.initNewDialerSession();
    this.registerSocket();
    if (this.data.data.id) {
      const data = this.data.data;
      this.newDialerSessionForm.patchValue(data);
      this.sessionDetail = data
    } else {
      this.getDialerLookup();
    }
  }

  ngOnDestroy() {
    this.socketService.unregister(SOCKETNAME.onPDSessionSave, () => { });
  }

}
