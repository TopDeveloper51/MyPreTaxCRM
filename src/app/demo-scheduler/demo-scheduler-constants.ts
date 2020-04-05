export class APINAME {
    public static get DELETE_TRAINING_SLOT(): string { return '/trainingPlanner/deleteSlot'; }
    public static get LOOKUP_CUSTOMER_SEARCH(): string { return '/customer/getLookupForCustomerSearch'; }
    public static get SAVE_SLOT_DETAIL(): string { return '/trainingPlanner/bookAppointment'; }
    public static get ASSIGN_TRAINER(): string { return '/trainingPlanner/assignTrainer'; }
    public static get CREATE_SLOT_TIME(): string { return '/trainingPlanner/createSlot'; }
    public static get CHANGE_SLOT_TIME(): string { return '/trainingPlanner/changeSlot'; }
    public static get CREATE_WEEK_PLAN(): string { return '/trainingPlanner/createWeekPlan'; }
    public static get NEED_TO_CREATE_WEEK_PLAN(): string { return '/trainingPlanner/needToCreatePlan'; }
    public static get GET_TRAINING_PLAN(): string { return '/trainingPlanner/getTrainingPlan'; }
    public static get GET_CUSTOMER_DETAILS_BY_CUSTOMERID(): string { return '/customer/getCustomerDetailForActivity'; }
    public static get GET_TRAINING_TEMPLATE(): string { return '/trainingPlanner/getTrainingTemplate'; }
    public static get UPDATE_TRAINING_TEMPLATE(): string { return '/trainingPlanner/updateTrainingTemplate'; }   
}