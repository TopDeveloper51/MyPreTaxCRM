export class APINAME {

  //API for manage screen
  // public static get GET_ALL_PLIVO_USERS_ONLINE(): string { return '/agentHandler/getAllPilvoUserOnline'; }
  // public static get GET_DIALER_MARKETING_LIST(): string { return '/predictiveDialer/getDialerMarketingList'; }
  public static get GET_DIALER_LIST(): string { return '/predictiveDialer/getDialerList'; }
  // public static get SAVE_PD_SESSION(): string { return '/predictiveDialer/savePDSession'; }
  // public static get DELETE_MARKETING_LIST_RECORD(): string { return '/predictiveDialer/deleteDialerList'; }
  // public static get START_SESSION(): string { return '/predictiveDialer/startSession'; }
  // public static get PAUSE_SESSION(): string { return '/predictiveDialer/pauseSession'; }
  // public static get RESUME_SESSION(): string { return '/predictiveDialer/resumeSession'; }
  // public static get STOP_SESSION(): string { return '/predictiveDialer/stopSession'; }
  // public static get OPEN_PD_SESSION(): string { return '/predictiveDialer/openPDSession'; }
  // public static get GET_STATUS_FOR_PD_SESSION(): string { return '/predictiveDialer/getStatusForPDSession'; }
  // public static get GET_DETAILS_OF_ONGOING_SESSION(): string { return '/predictiveDialer/getDetailsOfOnGoingSession'; }
  // public static get GET_DIALER_NUMBER(): string { return '/predictiveDialer/getDialerNumber'; }
  public static get GET_DIALER_LIST_LOOKUP(): string { return '/predictiveDialer/getDialerListLookup'; }
  public static get GET_PD_STATISTICS(): string { return '/predictiveDialer/getPdDialerStatistics'; }
  public static get GET_DIALER_USER_LIST(): string { return '/predictiveDialer/getUsersConfig'; }

  //API for view screen
  public static get GET_LOOKUP_FOR_TAXSOFTWARE_LIST(): string { return '/predictiveDialer/getLookupForTaxSoftwareList'; }
  public static get GET_LOOKUP_FOR_BANKLIST(): string { return '/customer/getLookupForbankList'; }
  public static get GET_APPOINTMENT(): string { return '/activity/getAppointmentActivitis'; }
  // public static get CREATE_OUTCALL_RESULT_FROM_PD(): string { return '/activiy/createOutCallResultFromPD'; }
  public static get GET_PD_DEMO_DOC(): string { return '/predictiveDialer/demo'; }
  public static get SEARCH_SESSION(): string { return '/predictiveDialer/sessionSearch'; }
  public static get ADD_UPDATE_REQUEST_LOGS(): string {return '/predictiveDialer/addUpdaterequestLogs'}

  //API to update agent status
  // public static get UPDATE_USER_STATUS(): string { return '/agentHandler/updateUserStatus'; }

  // Api for get PDSession Statistics
  public static get GET_PDSESSION_STATISTICS(): string { return '/predictiveDialer/getPDSessionStatistics'; }
}


export class SOCKETNAME {

  // Socket Registered
  // Manage
  public static get onPDManagerView(): string { return 'onPDManagerView'; }
  public static get onPDSessionSave(): string { return 'onPDSessionSave'; }
  public static get onPDSessionAction(): string { return 'onPDSessionAction'; }

  // View
  public static get onUserStatusUpdate(): string { return 'onUserStatusUpdate'; }
  public static get onPDCallInitialize(): string { return 'onPDCallInitialize'; }
  public static get onPDCallView(): string { return 'onPDCallView'; }
  public static get onPDCallDetails(): string { return 'onPDCallDetails'; }
  public static get onPDCallOutDocCreate(): string { return 'onPDCallOutDocCreate'; }
  public static get onPDHangup(): string { return 'onPDHangup'; }
  public static get onPDCallEnded(): string { return 'onPDCallEnded'; }
  public static get onUpdateAgentSession(): string { return 'onUpdateAgentSession'; }
  public static get onAgentPDDetails(): string { return 'onAgentPDDetails'; }
  public static get onPDSessionStatistics(): string { return 'onPDSessionStatistics'; }
  
  // Emit Socket Event
  // Manage
  public static get emitPDManagerView(): string { return 'PDManagerView'; }
  public static get emitPDSessionSave(): string { return 'PDSessionSave'; }
  public static get emitPDSessionAction(): string { return 'PDSessionAction'; }

  // View
  public static get emitUserStatusUpdate(): string { return 'UserStatusUpdate'; }
  public static get emitPDCallOutDocCreate(): string { return 'PDCallOutDocCreate'; }
  public static get emitPDCallDetails(): string { return 'PDCallDetails'; }
  public static get emitPDHangup(): string { return 'PDHangup'; }
  public static get emitUpdateAgentSession(): string { return 'UpdateAgentSession'; }
  public static get emitPDSessionStatistics(): string { return 'PDSessionStatistics'; }
  
}


export class Configuration {
  public static get notAllowCallingForUserStatus(): string[] { return ['onCall']; }
}