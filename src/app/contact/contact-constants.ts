export class APINAME {
  // contact serach
  public static get GET_EMAIL_STATUS_LOOKUP(): string {
    return '/customer/getEmailStatusLookup';
  }
  public static get POST_CONTACT_SEARCH(): string {
    return '/contact/new_search';
  }

  // CONTACT HISTORY DIALOG
  public static get GET_CONTACT_HISTORY(): string { return '/customer/getContactPersonHistory'; }
  
  // contact-dialog
  public static get GET_CONTACT_TYPE_LOOKUP(): string {
    return '/contact/getContactTypeLookup';
  }
  public static get GET_CONTACT_DETAIL(): string {
    return '/contact/getContactById';
  }
  public static get SAVE_CONTACT_DETAIL(): string {
    return '/contact/save';
  }
  public static get DELETE_CONTACT_DETAIL(): string {
    return '/contact/delete';
  }
  public static get GET_ROLE_LOOKUP(): string {
    return '/contact/getRoleLookup';
  }

  // email-change dialog
  public static get CHANGE_PASSWORD_DETAIL(): string {
    return '/contact/appEmailAddressChange';
  }

  // SETPAGESIZE USERSETTING
  public static get SET_USER_SETTING(): string {
    return '/auth/setUserSettings';
  }

  // VERIFICATION
  public static get SEND_SMS_TO_USER(): string {
    return '/contact/sendTextMessage';
  }
  public static get VERIFY_NUMBER(): string {
    return '/contact/verifyPhoneNumber';
  }
  public static get SEND_CODE_TO_USER_EMAIL(): string {
    return '/contact/sendVerificationMail';
  }

  // get app user phone no
  public static get GET_APP_USER_PHONE_NO(): string {
    return '/contact/getAppUserPhoneNumber';
  }
  public static get SAVE_APP_USER_PHONE_NO(): string {
    return '/contact/updateAppUserPhoneNumber';
  }
}
