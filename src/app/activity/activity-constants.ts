export class APINAME {
  // ACTIVITY SEARCH
  public static get RESPONSIBLE_PERSON_LIST(): string { return '/customer/getResponsiblePesronList'; }
  public static get ACTIVITY_SEARCH(): string { return '/search/new_activitySearch'; };
  public static get ACTIVITY_LOOKUP(): string { return '/activity/getLookupForactivitySearch'; };
  public static get GET_ACTIVITY_FILTER(): string { return '/activityFilter/getAll'; };
  public static get GET_ACTIVITY_FILTER_BY_ID(): string { return '/activityFilter/get'; };
  public static get SAVE_ACTIVITY_FILTER(): string { return '/activityFilter/save'; };
  public static get CHANGE_ACTIVITY_STATUS(): string { return '/activity/changeActivityStatus'; };
  public static get DELETE_SAVED_FILTER(): string { return '/activityFilter/deleteFilter'; };
  public static get GENERATE_EXCEL_TICKET_BY_ACTIVITY(): string { return '/generate/ticketReportExcel'; };

  // SETPAGESIZE USERSETTING
  public static get SET_USER_SETTING(): string { return '/auth/setUserSettings'; };

  // TICKET SCREEN AND DIALOG
  public static get GET_ALL_TYPE_DEFINITION(): string { return '/ticket/getAllTypeWithDefination'; };
  public static get GET_TICKET_BY_ID(): string { return '/ticket/getTicketDetailsById'; };
  public static get UPDATE_TICKET(): string { return '/ticket/updateTicketDetails'; };
  public static get DELETE_TICKET(): string { return '/ticket/delete'; };


  // Activity Order --> Commission
  public static get ORDERSCREEN_GETLOOKUP(): string { return '/orderScreen/getLookupDetails'; };
  public static get ORDERSCREEN_SEARCH(): string { return '/orderScreen/new_search'; };

  // Activity Comment
  public static get GET_FEEDBACK_COMMENT(): string { return '/activity/getFeedbackComments'; };
  public static get ADD_FEEDBACK_COMMENT(): string { return '/activity/addComment'; };
  public static get CHANGE_FEEDBACK_COMMENT(): string { return '/activity/changeFeedbackStatus'; };

  // ACTIVITY HISTORY
  public static get GET_ACTIVITY_HISTORY(): string { return '/activity/getActivityHistory'; };

  // ACTIVITY TICKET
  public static get GET_ACTIVITY_TICKET(): string { return '/ticket/searchTicketForActivity'; };

  // INTERNAL MEETING
  public static get CREATE_ACTIVITY_INTERNALMEETING(): string { return '/internalMeeting/createActivity'; };
  public static get GET_BREAK_REASON_DATA(): string { return '/internalMeeting/getUserDetailsForMeetingReasons'; };

  // ACTIVITY DIALOG
  public static get GET_CUSTOMER_DETAIL(): string { return '/customer/GetCustomerdetailforactivity'; };
  public static get GET_ACTIVITY_DETAIL(): string { return '/activity/open'; };
  public static get DELETE_TAG(): string { return '/activity/deleteTag'; };
  public static get CREATE_OUTCALL_RESULT_FROM_ACTIVITY_SCREEN(): string { return '/activiy/createOutCallResultFromActivityScreen'; };
  public static get SAVE_ACTIVITY_DETAIL(): string { return '/activity/save'; };
  public static get DELETE_ACTIVITY_DETAIL(): string { return '/activity/remove'; };
  public static get CREATE_AND_SEND_MAIL(): string { return '/activity/createAndSendMail'; };
  public static get SEND_EMAIL(): string { return '/activity/sendEmail'; };
  public static get DELETE_DOCUMENT(): string { return '/activity/removeDocument'; };
  public static get CHANGE_CUSTOMER(): string { return '/activity/changeCustomer'; };
  public static get GENERATE_NEW_TICKET_NUMBER(): string { return '/ticket/generateNewTicketNo'; };
  public static get SEARCH_TICKET_FOR_ACTIVITY(): string { return '/ticket/searchTicketForActivity'; };
  public static get GET_TICKET_DETAILS_BY_ID(): string { return '/ticket/getTicketDetailsById'; };
  public static get REMOVE_TICKET_DETAILS(): string { return '/ticket/removeTicket'; };
  public static get SAVE_TICKET_DETAILS(): string { return '/ticket/updateTicketDetails'; };
  public static get SETUP_TICKET_FOR_FIRST_YEAR(): string { return '/activity/createSetupTicketAndActivity'; };
  public static get UPDATE_ACTIVITY_FOR_TRAINING_SETUP(): string { return '/trainingPlanner/updateActivityForTrainingSetup'; };

  // CHANGE CUSTOMER DIALOG
  public static get GET_CUSTOMER_LIST(): string { return '/customer/GetCustomerList'; };
  public static get GET_COUNTRY_CODE_LIST(): string { return '/customer/getCountryCodeList'; };
  public static get GET_STATE_CODE_LIST(): string { return '/customer/getStateCodeList'; };
  public static get GET_CUSTOMER_DETAIL_ACCORDING_TO_CONTACT_DETAIL(): string { return '/customer/getCustomerListFromContact'; };

  public static get GET_DIALER_USER_LIST(): string { return '/predictiveDialer/getUsersConfig'; }
}


export class SOCKETNAME {
  // EMIT
  public static get emitOutgoingCall(): string { return 'OutgoingCall'; }
  public static get CallOutDocCreate(): string { return 'CallOutDocCreate'; }
  public static get emitHangup(): string { return 'Hangup'; }
  public static get onCallHold(): string { return 'onCallHold'; }
  public static get onCallResume(): string { return 'onCallResume'; }
  public static get onCallResumeByOtherAgent(): string { return 'onCallResumeByOtherAgent'; }
  public static get onCallHungupByCustWhenOnHold(): string { return 'onCallHungupByCustWhenOnHold'; }

  // PUBLISH
  public static get onCallOutDocCreate(): string { return 'onCallOutDocCreate'; }
  public static get onOutgoingCall(): string { return 'onOutgoingCall'; }
  public static get onHangup(): string { return 'onHangup'; }
  public static get onCallEnded(): string { return 'onCallEnded'; }
  public static get emitCallHold(): string { return 'CallHold'; }
  public static get emitCallResume(): string { return 'CallResume'; }
}

export class Configuration {
  public static get allowCallingForUserStatus(): string[] { return ['online', 'PDPause', 'doNotDisturb']; }
}