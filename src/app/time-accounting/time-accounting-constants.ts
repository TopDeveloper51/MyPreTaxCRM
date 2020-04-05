
export class APINAME {
    // checkinout-user scrren (time accounting user)
    public static get GET_CHECKIN_STATUS(): string { return '/user/getCheckInStatus' }
    public static get DAILY_TIME_USAGE_OVERVIEW_PER_USER(): string { return '/activity/dailyTimeUsageOverviewPerUser'; }
    public static get VERIFY_CHECK_IN_OUT_RECORDS(): string { return '/user/verifyAccountingDetail'; }
    public static get GET_LOOKUP_FOR_ORDER_SEARCH(): string { return '/orderScreen/getLookupDetails'; }
    public static get DELETE_CHECK_IN_OUT_DETAIL(): string { return '/user/deleteCheckInCheckOutDetail'; }

    public static get GET_LOOKUP_FOR_TIMEACCOUNTING(): string { return '/user/getLookupForTimeAccounting'; }

    // daily routine- overview
    public static get GET_DAILY_ROUTINE_OVERVIEW(): string { return '/user/getDailyRoutineOverview'; }

    public static get GET_TIME_ACCOUNTING_REPORTS(): string { return '/user/getCheckInStatusForResponsiblePerson'; }
    public static get SAVE_CHECK_IN_STATUS(): string { return '/user/saveCheckInStatus'; }

    // prder overview graph
    public static get ORDER_OVERVIEW_GRAPH(): string { return '/orderScreen/orderOverviewGraph'; }
    public static get GET_CLASSIFICATION_LOOKUP(): string { return '/orderScreen/getClassificationLookup'; }

    //tax-vision dialog
    public static get GET_TAXVISION_LIST(): string { return '/reporting/generateCustomerReportingList'; }

    //activity-summary
    public static get GET_TICKET_SUMMARY_FOR_RESPONSIBLE_PERSON(): string { return '/ticket/getTicketSummaryForResponsiblePerson'; }
    public static get ORDERSCREEN_GETLOOKUP(): string { return '/orderScreen/getLookupDetails'; };

    //call reports
    public static get GET_CALL_REPORTS(): string { return '/callReport/generateCallReport'; }
}
