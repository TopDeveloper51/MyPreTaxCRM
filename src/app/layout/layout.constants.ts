export class APINAME {
    //API for incoming-calls(call overview)
    public static get GET_CALL_NOTIFICATIONS(): string { return '/getCallNotifications'; }
    public static get GET_CALL_OVERVIEW_REFRESH_INTERBAL(): string { return '/user/getCallOverviewRefreshInterval'; }
    public static get SAVE_CALL_OVERVIEW_REFRESH_INTERBAL(): string { return '/user/saveCallOverviewRefreshInterval'; }
    public static get GET_ALL_PLIVO_USER_ONLINE(): string { return '/getAllPlivoUserOnline'; }


    public static get GET_ACTIVITY_ID(): string { return '/activity/createActivityIncomingCall'; }
    // Header
    public static get CHECK_IN_OUT_STATUS(): string { return '/user/saveCheckInStatus'; }
    public static get UPDATE_TTL_DOC(): string { return '/user/updateTTLDocForTimeAccounting'; }
    public static get TIME_ACCOUNTING_REMINDER_JOB(): string { return '/user/timeAccountingJobReminder'; }
}

export class SOCKETNAME {
    // Registering Socket Event
    public static get onIncomingCall(): string { return 'onIncomingCall'; }
    public static get onIncomingCallConnectDenied(): string { return 'onIncomingCallConnectDenied'; }
    public static get onIncomingCallAcceptedByOtherAgent(): string { return 'onIncomingCallAcceptedByOtherAgent'; }
    public static get onCallHungupByCustWhenOnHold(): string { return 'onCallHungupByCustWhenOnHold'; }
    public static get onCallResume(): string { return 'onCallResume'; }
    public static get onCallHold(): string { return 'onCallHold'; }
    public static get onHangup(): string { return 'onHangup'; }
    public static get onUserStatusUpdate(): string { return 'onUserStatusUpdate'; }
    public static get onOutgoingCall(): string { return 'onOutgoingCall'; }
    public static get onCallResumeByOtherAgent(): string { return 'onCallResumeByOtherAgent'; }
    public static get onCallEnded(): string { return 'onCallEnded'; }
    public static get onOutCallId(): string { return 'onOutCallId'; }

    // Emit Socket Event
    public static get emitCallResume(): string { return 'CallResume'; }
    public static get emitUserStatusUpdate(): string { return 'UserStatusUpdate'; }
    public static get emitOutgoingCall(): string { return 'OutgoingCall'; }
    public static get emitCallHold(): string { return 'CallHold'; }

    public static get emitIncomingCallConnect(): string { return 'IncomingCallConnect'; }
    public static get emitUpdateActId(): string { return 'UpdateActId'; }
    public static get emitHangup(): string { return 'Hangup'; }

    public static get onAnsweringMachineStatus(): string { return 'onAnsweringMachineStatus'; }
    public static get emitAnsweringMachineStatus(): string { return 'AnsweringMachineStatus'; }
    public static get emitChangeAnsweringMachineStatus(): string { return 'ChangeAnsweringMachineStatus'; }

}

export class TimeAccountingReminderSettings {
    // Low 
    public static get settings1x(): any {
      return {
        size: '2em',
        color: '#ffa500',
        intensity: 0.25
      };
    }
  
    // Medium
    public static get settings2x(): any {
      return {
        size: '2em',
        color: '#ffa500',
        intensity: 0.50
      };
    }
  
    // High
    public static get settings3x(): any {
      return {
        size: '2em',
        color: '#ffa500',
        intensity: 0.75
      };
    }
  
    // Alert
    public static get settings4x(): any {
      return {
        size: '2em',
        color: '#ffa500',
        intensity: 1
      };
    }
  }
  

export class Configuration {
    public static get allowCallingForUserStatus(): string[] { return ['online', 'PDPause', 'doNotDisturb']; }
    public static get doNotCheckReminderOnUserStatus(): string[] { return ['onCall', 'PDOnCall']; }
}