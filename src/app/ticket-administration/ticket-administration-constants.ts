export class APINAME {

  // Ticket Search
  public static get TICKET_SEARCH(): string { return ""; }

  // GET_TICKET_LIST
  public static get GET_TICKET_LIST(): string { return "/ticketType/list"; }

  // GET_TICKET_TYPE_DETAIL
  public static get GET_TICKET_TYPE_DETAIL(): string { return "/ticketType/get"; }

  // INSERT_TICKET_TYPE
  public static get INSERT_TICKET_TYPE(): string { return "/ticketType/insert"; }

  // UPDATE_TICKET_TYPE
  public static get UPDATE_TICKET_TYPE(): string { return "/ticketType/update"; }

  // DELETE_TICKET_TYPE
  public static get DELETE_TICKET_TYPE(): string { return "/ticketType/delete"; }

  // TICKET SUB TYPE LISTING SCREEN
  public static get GET_TICKET_SUB_TYPE_LIST(): string { return "/ticketSubtype/list"; }

  // TICKET SUB TYPE LISTING SCREEN
  public static get GET_TICKET_SUB_TYPE_DETAILS(): string { return "/ticketSubtype/get"; }

  // UPDATE TICKET SUB TYPE
  public static get UPDATE_TICKET_SUB_TYPE(): string { return "/ticketSubtype/update"; }

  // DELETE TICKET SUB TYPE
  public static get DELETE_TICKET_SUBTYPE(): string { return "/ticketSubtype/delete"; }

  // DELETE TICKET SUB TYPE
  public static get TICKET_REORDER(): string { return "/ticketTypeDefinition/updateOrder"; }

  // DELETE TICKET SUB TYPE
  public static get GET_AVAILABLE_TICKET_TYPE_FIELDS(): string { return "/ticketTypeField/list"; }

  // GET_FIELD_LIST
  public static get GET_FIELD_LIST(): string { return "/ticketTypeField/list"; }


  // GET_FIELD_LIST
  public static get GET_SELECTED_FIELD_DATA(): string { return "/ticketTypeField/get"; }

  // GET_FIELD_LIST
  public static get ADD_MANAGE_FIELD(): string { return "/ticketTypeField/insert"; }

  // 
  public static get UPDATE_MANAGE_FIELD(): string { return "/ticketTypeField/update"; }

  // DELETE_FIELD_LIST
  public static get DELETE_FIELD_LIST(): string { return "/ticketTypeField/delete"; }


  // TICKET MAPPING

  public static get GET_TICKET_MAPPING_LIST(): string { return "/ticketTypeDefinition/getMigrationMapping"; }

  public static get SAVE_TICKET_MAPPING_LIST(): string { return "/ticketTypeDefinition/saveMigrationMapping"; }

  public static get SAVE_VALIDATE_TICKET_MAPPING_LIST(): string { return "/ticketTypeDefinition/startValidation"; }

  public static get CLEAN_INDEX(): string { return "/ticketTypeDefinition/generateIndex"; }

  public static get CREATE_REPORT(): string { return "/ticketTypeDefinition/createCSV"; }

  public static get DOWNLOAD_REPORT(): string { return "/ticketTypeDefinition/downloadCSV"; }

  //
  public static get GET_TICKET_ANALYSIS_REPORTS(): string { return "/generalModule/generateTicketUsageReport" }
}


export class ENUMS {

  public static get validationStatusList() {
    return {
      0: 'Pending',
      1: 'Validation Error',
      2: 'Valdiated',
      3: 'Migration Running',
      4: 'Migrated',
      5: 'Migration Error',
    }
  }

  public static get migrationStatusList() {
    return {
      0: 'Pending',
      1: 'In-Process',
      2: 'Error',
      3: 'Migrated',
    }
  }

  public static get csvStatusList() {
    return {
      0: 'Pending',
      1: 'In-Process',
      2: 'Error',
      3: 'Created',
    }
  }

}
