export class APINAME {
  public static get LOOKUP_CUSTOMER_SEARCH(): string { return '/customer/getLookupForCustomerSearch'; }
  public static get GET_CUSTOMER_SEARCH_LOOKUP(): string { return '/customer/getLookupForCustomerSearch'; }
  public static get CUSTOMER_SEARCH(): string { return '/customer/newCustomerSearch'; }
  public static get CUSTOMER_SEARCH_EFIN(): string { return '/customer/searchEfin'; };
  public static get GET_SUBSCRIPTION_PACKAGENAME(): string { return '/subscription/getSubscriptionPackageName'; }
  public static get GET_CUSTOMER_DETAILS(): string { return '/customer/getCustomerDetails'; }
  public static get GET_CUSTOMER_DETAIL(): string { return '/customer/getCustomerDetail'; }

  public static get LOOKUP_CUSTOMER_DETAIL(): string { return '/customer/getLookupForCustomerCard'; }
  public static get CUSTOMER_SAVE(): string { return '/customer/save'; }

  // Customer Activity tab
  public static get CUSTOMER_CARD_ACTIVITY_LOOKUP(): string { return '/activity/getLookupForactivitySearch'; }

  // Customer contact tab
  public static get GET_CONTACT_PERSON_LIST(): string { return '/customer/getContactPersonList'; }
  public static get CONTACT_DELETE(): string { return '/contact/delete'; }

  // Customer Activity tab
  public static get GET_CUSTOMER_ACTIVITY_SEARCH(): string { return '/search/activitySearch'; }
  public static get CUSTOMER_CONTACTLIST(): string { return '/customer/getContactPersonList'; }

  // Customer Review tab
  public static get GET_DATA_OF_CUSTOMER_REVIEW(): string { return '/customer/feedback/get'; }

  // Customer Login History
  public static get GET_LOGIN_HISTORY(): string { return '/customer/getLoginHistory'; }

  // Customer Website visit
  public static get GET_WEBSITE_VISIT_LIST_OF_CUSTOMER(): string { return '/customer/getWebsiteVisitListForCustomer'; }
  public static get GET_LOOKUP_FOR_PLATFORMS(): string { return '/customer/feedback/getLookup'; }
  //
  public static get SAVE_DATA_OF_CUSTOMER_REVIEW(): string { return '/customer/feedback/save'; }

  // Customer  Marketing Data
  public static get GET_MARKETING_DATA(): string { return '/customer/getMarketingData'; }
  public static get GET_OFFICE_SETUP_MISSING_DATA(): string { return '/customer/getOfficeSetupMissingData'; }
  public static get QMS_BANK_CODE(): string { return '/customer/get/QMSBankCode'; }
  public static get UPDATE_QMS_BANK_CODE(): string { return '/customer/update/QMSBankCode'; }
  public static get UPDATE_CAMPAIGN_COUPON(): string { return '/customer/modifyPostCardCampaignCoupon'; }

  // Software used Details
  public static get GET_LOOKUP_FOR_SOFTWARE_USED_LIST(): string { return '/customer/getLookupForSoftwareIdentification'; }
  public static get SAVE_SOFTWARE_USED_DETAIL(): string { return '/customer/saveSoftwareDetails'; }
  public static get SET_HEADER_SOFTWARE_USED_DETAIL(): string { return '/customer/setHeaderForSoftwareDetails'; }
  public static get GET_SOFTWARE_USED_DETAILS(): string { return '/customer/getSoftwareDetailsHistory'; }
  public static get GET_SOFTWARE_USED_HEADER(): string { return '/customer/getSoftwareHeaderDetails'; }

  // Bank Product Details
  public static get GET_LOOKUP_FOR_BP_IDENTIFICATION_SOURCE(): string { return '/customer/getLookupForBPIdentificationSource'; }
  public static get GET_BP_ENROLLMENT_DETAILS(): string { return '/customer/getBPEnrollmentStatusDetails'; }
  public static get GET_BP_HISTORY_DETAILS(): string { return '/customer/getBPDetailsHistory'; }
  public static get GET_SEASON_READINESS_FLAGS(): string { return '/customer/getSeasonReadinessFlags'; }
  public static get GET_BANK_PRODUCT_HEADER(): string { return '/customer/getBankProductHeader'; }
  public static get SAVE_BP_HISTORY(): string { return '/customer/addHeaderToBPDetailsHistory'; }
  public static get SET_NOOFBP_CUSTOMER(): string { return '/customer/setNoBankProductCustomer'; }
  public static get UPDATE_SEASON_READINESS_FLAG(): string { return '/customer/updateSeasonReadinessFlags'; }
  public static get GET_TAX_SUMMARY_BY_CUSTOMERID(): string { return '/customer/getTaxSummaryByCustomerId'; }
  public static get UPDATE_SEASON_READINESS_FLAG_ON_REFRESH(): string { return '/customer/updateSeasonReadinessFlagsOnRefresh'; }
  public static get GET_LOOKUP_FOR_BANK_LIST(): string { return '/customer/getLookupForbankList'; }
  public static get DELETE_CONTACT_DETAIL(): string { return '/contact/delete' }
  // set special pricing
  public static get UPDATE_SPECIAL_PRICING(): string { return '/customer/saveTransmitterFee'; }

  // Customer Ticket Tab
  public static get LOOKUP_TICKET_SEARCH(): string { return '/ticket/getLookupForTicketSearch'; }
  public static get GET_ACTIVITY_DEPARTMENT_LOOKUP(): string { return '/activity/getDepartmentLookup'; }
  public static get TICKET_SEARCH_CUSTOMER(): string { return '/ticket/search'; }
  public static get DELETE_MULTIPLE_TICKET(): string { return '/ticket/multipleDelete'; };

  // License Details
  public static get GET_SUBSCRIPTIONLIST_BY_LOCID(): string { return '/subscription/getSubscriptionListByLocId'; }
  public static get SAVE_NO_OF_OFFICES(): string { return '/customer/saveNoOfOffices'; }
  public static get GET_SUBSCRIPTIONLIST_LOOKUP(): string { return '/subscription/getLookup'; }
  public static get GET_PLANLIST(): string { return '/plan/list'; }
  public static get CUSTOMER_MANAGE_LICENSE(): string { return '/customer/manageLicense' };

  // Ledger
  public static get SAVE_PRICE_GUARANTEE_CUSTOMER(): string { return '/customer/savePriceGuranteeDetailsByCustomerId'; }
  public static get GET_PGANDCERTIFICATEDETAILS_CUSTOMER(): string { return '/customer/getPGandCertificationDetailsByCustomerId'; }
  public static get GET_LEDGER_DETAILS_CUSTOMER(): string { return '/accounting/getledgerDetailsByCustomerId'; }
  public static get UPDATE_LEDGER_TAX_SEASON(): string { return '/accounting/saveTransactionDoc'; }
  public static get SAVE_PG_PER_YEAR(): string { return '/customer/savePriceGuranteeDetailsPerYear'; }
  public static get GET_PG_PER_YEAR_HISTORY(): string { return '/customer/getPGPerYearHistory'; }
  public static get SAVE_PAY_PER_RETURN(): string { return '/customer/savePayPerReturn'; }
  public static get GET_BPCOMMITMENTDETAILS_CUSTOMER(): string { return '/customer/getBpCommitmentDetails'; }
  public static get SAVE_BPCOMMITMENTDETAILS_CUSTOMER(): string { return '/customer/saveBpCommitmentDetails'; }
  public static get CREATE_OFFER_SUBSCRIPTION(): string { return '/subscription/createOrderTokenDoc'; }
  public static get SAVE_PAYMENT_COLLECTION_INFO(): string { return '/customer/savePaymentInfo'; }
  public static get DELETE_ACCOUNT_TRANSACTION(): string { return '/accounting/deleteAccountTransaction'; };

  // Customer History
  public static get CUSTOMER_HISTORY(): string { return '/customer/getCustomerHistory'; }

  // Customer Address Information
  public static get CUSTOMER_ADDRESS_INFO(): string { return '/customer/getAllAddresses'; }

  // CHECK DUPLICATE
  public static get CHECK_DUPLICATE(): string { return '/customer/findDuplicateCustomers'; }
  public static get ENABLE_CONVERSION(): string { return '/customer/license/enableConversion'; }
  public static get ALLOW_ACESSS_TO_TAXVISION(): string { return '/customer/license/taxVision/allowAccess'; }

  // COUPON
  public static get GET_ALL_COUPON(): string { return '/coupon/getAllCouponforCustomer'; }
  public static get GENERATE_COUPON(): string { return '/coupon/generateCoupon'; }
  public static get SAVE_COUPON(): string { return '/coupon/saveCouponInformation'; }

  // Offices tab
  public static get GET_EFIN_LIST(): string { return '/location/efin/list'; }
  // Offices tab all EFIN Data
  public static get GET_ALL_EFIN_LIST(): string { return '/location/efin/getAllEfinDetails'; }

  // Efin Verification
  public static get GET_EFIN_DATA(): string { return '/location/efin/get'; }
  public static get GET_EFIN_APPROVE(): string { return '/location/efin/approve'; }
  public static get GET_EFIN_REJECT(): string { return '/location/efin/reject'; }
  public static get GET_LOCATION_COUNT(): string { return '/location/getCount'; }

  // login redirection to tax application
  public static get FIRMSETUP_LOGIN(): string { return '/firmSetup/login'; }
  public static get GET_XSRF_FROM_TAX(): string { return '/crm/supportUser/login'; }
  public static get TAX_LOGOUT(): string { return '/crm/supportUser/logout'; }
  public static get ENABLE_FEECOLLECTPROGRAM(): string { return '/customer/enableFeeCollect'; }

  //order-overview dialog
  public static get GET_ORDER_OVERVIEW_DOC(): string { return '/orderOverview/get'; }
  public static get UPDATE_ORDER_OVERVIEW(): string { return '/orderOverview/update'; }
  public static get GET_ALL_ORDER_DOCS(): string { return '/orderOverview/new_search'; }
  public static get GET_RENEWAL_EXCEL_DATA(): string { return '/orderOverview/getRenewalExcelData'; }
  public static get GET_FULL_RENEWAL_EXCEL_DATA(): string { return '/orderOverview/getFullRenewalExcelData'; }
  public static get GET_SETUP_REPORT(): string { return '/orderOverview/getSetupReportData'; }

  //API for order-overview json
  public static get GET_ORDER_OVERVIEW_JSON(): string { return '/orderoverview/getJSON'; }

  //Responsible person dropdown
  public static get CUSTOMER_PROFILE_LOOKUP(): string { return '/orderOverview/getLookup'; };

  //profile-comment dialog
  public static get GET_FEEDBACK_COMMENTS(): string { return '/orderOverview/getComment'; }
  public static get ADD_COMMENT(): string { return '/orderOverview/addComment'; }

  //  ADDON FEE SUMMARY
  public static get GET_PDF_DATA(): string { return '/orderOverview/getAddOnAccountingPdf'; };
  public static get SAVE_TRANSACTION_DETAIL(): string { return '/accounting/saveTransactionDoc'; }
}

