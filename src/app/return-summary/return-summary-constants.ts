export class APINAME {

    // quick return summary
    public static get GET_LOCATION(): string { return '/customer/location/getAll' }
    public static get GET_BANK_REJECTION(): string { return '/support/GetBankRejection' }
    public static get CUSTOMER_INFO(): string { return '/support/search' }
    // get return summary
    public static get GET_RETURN_SUMMARY(): string { return '/support/GetReturnSummary' }
    public static get GET_EFIE_OPEN(): string { return '/support/GetEfileOpen' }
    public static get GET_RETURN_LIST(): string { return '/support/GetReturnlist' }
    public static get SUPPORT_SEARCH(): string { return '/support/search' }
    public static get GET_RETURN_HISTORY(): string { return '/support/GetReturnHistory' }
    public static get GET_EFILE_REJECTION(): string { return '/support/GetEfileRejection' }
    



    // client portal
    public static get GET_CLIENT_LIST(): string { return '/support/clientPortal/invitedClient' }
    public static get RESEND_EMAIL_TO_CLIENT(): string { return '/support/clientPortal/resendMail' }
    public static get DELETE_INVITED_CLIENT(): string { return '/support/clientPortal/deleteInvitedClient' }
    public static get ACTIVE_DEACTIVE_CLIENT(): string { return '/support/clientPortal/activeDeactiveClient' }
    

    // CLIENT PORTAL DIALOG QUESTION SET
    public static get GET_QUESTIONSET(): string { return '/support/clientPortal/getQuestionSet' }
    public static get DOWNLOAD_DOCUMENT(): string { return '/support/clientPortal/downloadDocument' }
    public static get DOWNLOAD_RETURN_DOCUMENT(): string { return '/support/clientPortal/returnPdfDownload' }

   


    
  }
  


