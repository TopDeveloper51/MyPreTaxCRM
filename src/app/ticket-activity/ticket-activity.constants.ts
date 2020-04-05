export class APINAME {
  // ACTIVITY TICKET
  public static get GET_ACTIVITY_TICKET(): string { return '/ticket/searchTicketForActivity'; };

  // GET CUSTOMER_CARD_ACTIVITY_SEARCH
  public static get CUSTOMER_CARD_ACTIVITY_SEARCH(): string { return '/search/activitySearch'; };

  // TICKET DETAILS
  public static get GET_TICKET_BY_ID(): string { return '/ticket/getTicketDetailsById'; };

  // get Activity details
  public static get GET_ACTIVITY_DETAILS_BY_ACTIVITYID(): string { return '/activity/open'; };

  // save ticket activity details
  public static get SAVE_TICKET_ACTIVITY_DETAIL(): string { return '/activity/save'; };

  // delete uploaded documents from ta-activity
  public static get DELETE_DOCUMENT(): string { return '/activity/removeDocument'; };

  // request transcript
  public static get REQUEST_TRANSCRIPT(): string { return '/activity/requestTranscript'; };

  // ACTIVITY HISTORY
  public static get GET_ACTIVITY_HISTORY(): string { return '/activity/getActivityHistory'; };

  // Get look up for activity 
  public static get GET_LOOKUP(): string { return '/activity/getLookupForActivity' };

  // Get customer details by id
  public static get GET_CUSTOMER_DETAILS_BY_CUSTOMERID(): string { return '/customer/GetCustomerDetailForActivity'; }

  // TICKET DETAILS
  public static get SETUP_TICKET(): string { return '/activity/createSetupTicketAndActivity'; };

  // Get customer list
  public static get GET_CUSTOMER_LIST(): string { return '/customer/GetCustomerList'; };

  // Get customer list according contact details
  public static get GET_CUSTOMER_DETAIL_ACCORDING_TO_CONTACT_DETAIL(): string { return '/customer/getCustomerListFromContact'; };

  // Get country code list
  public static get GET_COUNTRY_CODE_LIST(): string { return '/customer/getCountryCodeList'; };

  // Get state code list
  public static get GET_STATE_CODE_LIST(): string { return '/customer/getStateCodeList'; };

  //CHAT_DOCUMENT
  public static get CHAT_DOCUMENT(): string { return '/activity/getTranscriptChat'; };

  // to send email for an existing activity
  public static get SEND_EMAIL(): string { return '/activity/sendEmail'; };

  // to send email for a new activity
  public static get CREATE_AND_SEND_MAIL(): string { return '/activity/new_createAndSendMail'; };

  // to save ticket details
  public static get SAVE_TICKET_DETAILS(): string { return '/ticket/updateTicketDetails'; };
  public static get GET_DIALER_USER_LIST(): string { return '/predictiveDialer/getUsersConfig'; }
  public static get UPDATE_SEASON_READINESS_FLAG_ON_REFRESH(): string { return '/customer/updateSeasonReadinessFlagsOnRefresh_v2'; }
  public static get DELETE_TICKET(): string { return '/ticket/delete'; };
  public static get REMOVE_TICKET_DETAILS(): string { return '/ticket/removeTicket'; };


  public static get DELETE_TAG(): string { return '/activity/deleteTag'; };
  public static get GENERATE_NEW_TICKET_NUMBER(): string { return '/ticket/generateNewTicketNo'; };
  public static get SEARCH_TICKET_FOR_ACTIVITY(): string { return '/ticket/searchTicketForActivity'; };
  public static get UPDATE_ACTIVITY_FOR_TRAINING_SETUP(): string { return '/trainingPlanner/new_updateActivityForTrainingSetup'; };
  /**************************************************************** */
  // new ticket structure

  // TICKET DETAILS BY ID 
  public static get GET_TICKET_BY_ID_NEW(): string { return '/ticket/new_getTicketDetailsById'; };
  // get Activity details
  public static get GET_ACTIVITY_DETAILS_BY_ACTIVITYID_NEW(): string { return '/activity/new_open'; };
  // Get look up for activity
  public static get GET_NEW_LOOKUP(): string { return '/activity/new_getLookupForActivity' };
  // new ticket save
  public static get SAVE_NEW_ACTIVITY_TICKET(): string { return '/activity/new_save' };
  // Get look up for ticket feild list
  public static get GET_TICKETTYPE_FEILDLIST(): string { return '/ticketTypeField/list' };
  // Get look up for ticket
  public static get GET_NEW_LOOKUP_FOR_TICKET_SEARCH(): string { return 'ticket/new_getLookupForTicketSearch ' };

  /**************************************************************** */

}

export class Configuration {
  public static get allowCallingForUserStatus(): string[] { return ['online', 'PDPause', 'doNotDisturb']; }
}

export class SOCKETNAME {
  // EMIT
  public static get emitOutgoingCall(): string { return 'OutgoingCall'; }
  public static get CallOutDocCreate(): string { return 'CallOutDocCreate'; }
  public static get emitHangup(): string { return 'Hangup'; }

  // PUBLISH
  public static get onCallOutDocCreate(): string { return 'onCallOutDocCreate'; }
  public static get onOutgoingCall(): string { return 'onOutgoingCall'; }
  public static get onHangup(): string { return 'onHangup'; }
  public static get onCallEnded(): string { return 'onCallEnded'; }
  public static get onOutCallId(): string { return 'onOutCallId'; }
}