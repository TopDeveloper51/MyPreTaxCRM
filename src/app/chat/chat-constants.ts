export class APINAME {
    public static get GET_CHAT_HISTORY_DATA(): string { return '/chat/getChatNotifications'; }
    public static get GET_CHAT_STATUS(): string { return '/chat/getChatStatus'; }
    public static get GET_ONLINE_AGENTS(): string { return '/chat/getOnlineAgents'; }
    public static get GET_CANNEDMSGS(): string { return '/chat/getCannedmsg'; };
}

/** Socket Event */
export class CHAT_SOCKETNAME {
    public static get onAnsweringMachineStatus(): string { return 'onAnsweringMachineStatus'; }
    public static get emitAnsweringMachineStatus(): string { return 'AnsweringMachineStatus'; }
    public static get emitChangeAnsweringMachineStatus(): string { return 'ChangeAnsweringMachineStatus'; }
    // to update overall status for chat
    public static get emitChangeChatStatus(): string { return 'onChangeChatStatus'; }
    // to update toggle for chat status
    public static get emitChatStatusUpdate(): string { return 'onChatStatusUpdate'; }
}

/** Chat types */
export enum CHAT_TYPE {
    JOINROOM = "joinroom",
    STARTCHAT = "startchat",
    USERINPUT = "userinput",
    MSG = "msg",
    INTERNALMSG = "internalmsg",
    JOINCHAT = "joinchat",
    LEAVECHAT = "leavechat",
    CLOSECHAT = "closechat",
    ASSIGNCHAT = "assigned"
}