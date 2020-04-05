export class APINAME {

    public static get GET_LOOKUP_FOR_BREAK_EXPLANATION(): string { return '/user/getLookupForBreakExplanation'; }

    public static get GET_BREAK_REASON_DATA(): string { return '/internalMeeting/getUserDetailsForMeetingReasons'; };

    // calendar 

    public static get GETLOOKUP(): string { return '/orderScreen/getLookupDetails'; }

    public static get GET_APPOINTMENTS(): string { return '/activity/getAllAppointmentData'; }

    // activity-summary
    public static get GET_LOOKUP_FOR_DAILY_USAGE_GRAPH(): string { return '/activity/getUserList'; }
    public static get GET_ACTIVITY_SUMMARY(): string { return '/activity/getActivitySummary'; }
    public static get ORDERSCREEN_GETLOOKUP(): string { return '/orderScreen/getLookupDetails'; }
    // prder overview graph
    public static get ORDER_OVERVIEW_GRAPH(): string { return '/orderScreen/orderOverviewGraph'; }
    public static get GET_CLASSIFICATION_LOOKUP(): string { return '/orderScreen/getClassificationLookup'; }
}
