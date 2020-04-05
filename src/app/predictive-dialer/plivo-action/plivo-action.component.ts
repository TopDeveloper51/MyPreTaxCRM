import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-plivo-action',
  templateUrl: './plivo-action.component.html',
  styleUrls: ['./plivo-action.component.scss']
})
export class PlivoActionComponent {

  @Input() predictiveMakeCall: boolean = false;
  @Input() showDialPad: boolean = false;
  @Input() isMute: boolean = false;
  @Input() callActive: any;

  @Output() muteEvent = new EventEmitter<any>();
  @Output() dtmfEvent = new EventEmitter<any>();
  @Output() callHangupEvent = new EventEmitter<any>();
  @Output() postCallTime = new EventEmitter<any>();

  currentTime: any = 0;

  constructor() { }

  public clickDigit(value: string) {
    this.dtmfEvent.emit(value);
  }

  public muteTheMic(isMute) {
    this.isMute = !this.isMute;
    this.muteEvent.emit(this.isMute);
  };

  public endCall() {
    this.callHangupEvent.emit();
  };

  emitPostCallTime(event) {
    this.postCallTime.emit(event)
  }
}
