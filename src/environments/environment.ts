// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  // production: false,
  // plivoNumber: "706-204-1331",
  // platform: 'local',
  // sentry_project_url: 'https://1e63e69ceffe4e3c9f7742995252dbf7@qa.dynamic1001.com/33',
  // sentry_project_token: 'v0',
  // //origin: 'https://crmapi.secureservice.cloud',//live
  // origin: 'https://crmapi.advanced-taxsolutions.com',//beta
  // host: 'https://crm.advanced-taxsolutions.com',
  // websocket_url: 'https://pbx.advanced-taxsolutions.com', //for beta
  // whiteListAPIs: ['https://pbx.advanced-taxsolutions.com'],
  // originTaxapi_beta: "http://192.168.0.181:3011", //for beta tax api
  // taxapp_url: "https://app.advanced-taxsolutions.com/", //for beta
  // taxapi_url: "https://api.advanced-taxsolutions.com"//http://192.168.0.181:3011
  production: true,
  plivoNumber: "307-414-1211",
  betaOnly: false,
  platform: 'live',
  sentry_project_url: 'https://1e63e69ceffe4e3c9f7742995252dbf7@qa.dynamic1001.com/33',
  sentry_project_token: 'v0',
  origin: 'https://crmapi.mytaxprepoffice.com',
  host: 'https://betacrm.mytaxprepoffice.com',
  websocket_url: "https://pbx.mytaxprepoffice.com", //for beta
  whiteListAPIs: ['https://pbx.mytaxprepoffice.com', "https://conmonitoring.mytaxprepoffice.com", "https://consync.mytaxprepoffice.com",'https://betachatwss.mytaxprepoffice.com'],
  taxapp_url: "https://app.mytaxprepoffice.com/", //for liveoriginforconversion
  originForConversion: "https://conmonitoring.mytaxprepoffice.com",//for beta
  originForConversionMisMatch: "https://consync.mytaxprepoffice.com",
  taxapi_url: "https://api.mytaxprepoffice.com",
  websocket_for_chat_url: "https://betachatwss.mytaxprepoffice.com", //for beta
  releaseVersion: 'v1.1.0'

};
export const configuration = {
  isInternetCheck: false,
  isInternetCheckInterval: 6000,
  checkforUpdate: 60000, // in milliseconds
  checkforTimeAccountingReminder: 60000, // in milliseconds
  allowedUserForDialerUpdation: ["5deeecdd-74f8-4da4-a642-82e4ab2f74ae", "3b673904-5d19-4a4d-b38c-786a06c824d7", "033209fe-eda4-469a-897e-35e124732321", "e2729f21-3e80-442a-a4af-49ac50d98cf4", "9254e294-6221-44d7-bcce-9a5b1fec9101", "4400a3c1-c1a8-48d4-805d-858dfce61075", "abb70e33-30b8-4572-8905-e1876ce09c52","40f83e38-1cd4-4061-bc1d-560744fba805"]
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
