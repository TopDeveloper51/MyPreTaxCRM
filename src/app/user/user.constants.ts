export class APINAME {

    // API for change password
    public static get CHANGE_PASSWORD(): string { return '/auth/changePassword' }

    // API for user detail screen
    public static get GET_USER_LOOKUP(): string { return '/auth/getUserLookup'; }
    public static get GET_ALL_USER(): string { return '/auth/getAllUser'; }
    public static get GET_USER_DOC(): string { return '/auth/getUserDoc'; }
    public static get SAVE_USER_DETAIL(): string { return '/auth/saveUser'; }
    public static get GET_USER_HISTORY(): string { return '/user/getUserHistory'; }
}

