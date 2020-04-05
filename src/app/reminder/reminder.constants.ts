export class APINAME {

    public static get GET_DATA_FOR_PENDING_REQUESTS(): string { return '/user/getCheckInStatusForReminder'; }
    public static get GET_DATA_FOR_PENDING_APPROVALS(): string { return '/user/getCheckInStatusForSentForApprovalReminder'; }
  
    public static get TIME_ACCOUNTING_REMINDER_JOB(): string { return '/user/timeAccountingJobReminder'; }
  
    public static get SET_REMINDER_ATTEMPT(): string { return '/user/updateReminderAttempts'; }
  
  }