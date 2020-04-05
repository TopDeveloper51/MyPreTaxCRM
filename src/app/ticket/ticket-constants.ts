export class APINAME {
    // public static get LOOKUP_TICKET_SEARCH(): string { return '/ticket/getLookupForTicketSearch'; }

    public static get LOOKUP_TICKET_SEARCH(): string { return '/ticket/new_getLookupForTicketSearch'; }
    public static get LOOKUP_SEASON_READINESS(): string { return '/ticket/getLookupForSeasonReadiness'; }
    public static get TICKET_SEARCH(): string { return '/ticket/new_search'; };
    public static get GET_TICKET_FILTER(): string { return '/activityFilter/getAll'; };
    public static get GET_TICKET_FILTER_BY_ID(): string { return '/activityFilter/get'; };
    public static get SAVE_TICKET_FILTER(): string { return '/activityFilter/save'; };
    public static get GET_TICKET_EXCEL_DATA(): string { return '/ticket/getTicketExcelData'; };
    // SETPAGESIZE USERSETTING
    public static get SET_USER_SETTING(): string { return '/auth/setUserSettings'; };
    // DELETE MULTIPLE TICKETS
    public static get DELETE_MULTIPLE_TICKET(): string { return '/ticket/multipleDelete'; };
    // DELETE THE LOADED FILTERS
    public static get DELETE_SAVED_FILTER(): string { return '/activityFilter/deleteFilter'; };


}
