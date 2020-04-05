export const environment = {
  production: true,
  plivoNumber: "307-414-1211",
  platform: 'live',
  betaOnly: false,
  sentry_project_url: 'https://a613d6961fb54b3eb1c1dffec4cf6509@qa.dynamic1001.com/29',
  sentry_project_token: 'v1.0.0.0',
  origin: 'https://crmapi.mytaxprepoffice.com',
  host: 'https://betacrm.mytaxprepoffice.com',
  websocket_url: "https://pbx.mytaxprepoffice.com", //for beta
  originForConversion: "https://conmonitoring.mytaxprepoffice.com",//for live
  originForConversionMisMatch: "https://consync.mytaxprepoffice.com",
  whiteListAPIs: ['https://pbx.mytaxprepoffice.com',"https://conmonitoring.mytaxprepoffice.com", "https://consync.mytaxprepoffice.com",'https://betachatwss.mytaxprepoffice.com'],
  taxapp_url: "https://app.mytaxprepoffice.com/", //for live
  taxapi_url: "https://api.mytaxprepoffice.com",
  websocket_for_chat_url: "https://betachatwss.mytaxprepoffice.com", //for beta
  releaseVersion: 'v1.1.0'
};
export const configuration = {
  isInternetCheck: false,
  isInternetCheckInterval: 6000,
  checkforUpdate: 60000, // in milliseconds
  checkforTimeAccountingReminder: 60000, // in milliseconds
  allowedUserForDialerUpdation: ["5deeecdd-74f8-4da4-a642-82e4ab2f74ae", "3b673904-5d19-4a4d-b38c-786a06c824d7", "033209fe-eda4-469a-897e-35e124732321", "e2729f21-3e80-442a-a4af-49ac50d98cf4", "9254e294-6221-44d7-bcce-9a5b1fec9101"],
};
