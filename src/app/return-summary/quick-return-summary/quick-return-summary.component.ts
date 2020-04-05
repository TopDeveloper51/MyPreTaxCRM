//  External import
import { OnInit, Component, ViewContainerRef, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Internal Import
import { BankRejectionsComponent } from '@app/return-summary/dialogs/bank-rejections/bank-rejections.component';
import { RejectionsComponent } from '@app/return-summary/dialogs/rejections/rejections.component';
import { ResendEmailComponent } from '@app/return-summary/dialogs/resend-email/resend-email.component';
import { ViewRequestComponent } from '@app/return-summary/dialogs/view-request/view-request.component';
import { DialogService, CDRService, MessageService, UserService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { ReturnSummaryService, LocationService } from '@app/return-summary/return-summary.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';


@Component({
  selector: 'app-quick-return-summary',
  templateUrl: './quick-return-summary.component.html',
  styleUrls: ['./quick-return-summary.component.scss']
})
export class QuickReturnSummaryComponent implements OnInit, OnDestroy {

  public quickReturnSummaryForm: FormGroup; // form variable
  public returnSearchForm: FormGroup;
  public quickSummary: any = {};
  public quickSummaryWithSearch: any = {}; // response for return search screen from service
  public masktype: any = 'SSN';
  public maskTypeSearch: any = 'SSN';
  public mask: string = '999-99-9999';
  public taxYear: any;
  public tabIndex: any; // selected tab index
  public ssnorein: any;
  public ssnoreinSearch: any; // ng model of return search screen 
  public taxYearSearch: any; // ng model of return search screen 
  public message: string;
  public messageSearch: string;  //message for return search screen 
  public isDataLoading: boolean = false;
  //  check whether location found from customernuber
  public isLoctionError: boolean = false;
  public environment = environment;
  public locationIds: any;

  public userId: any;
  public showLoading = false;
  public LocationIdForCP: any;
  public customerNumberForCP: any;
  public isLoctionErrorForCP: boolean = false;
  public locationIdsForCP: any;
  public allInvitedClientList = [];
  // Configurations for sorting and pagging
  public pageSizes: Array<number> = [50, 100, 150, 200, 1000];
  public pageSize: number = 50;
  public previousNext: boolean = true;
  public skip: number = 0;
  public total: number = 0;
  public allowUnsort = true;
  public taxyearList = [{ id: '2019', name: '2019' }, { id: '2018', name: '2018' }, { id: '2017', name: '2017' }, { id: '2016', name: '2016' }, { id: '2015', name: '2015' }, { id: '2014', name: '2014' }];
  public maskTypeList = [{ id: 'SSN', name: 'SSN' }, { id: 'EIN', name: 'EIN' }, { id: 'submissionId', name: 'Submission Id' }];
  public matchedIdLength: any;
  public selectedTabName = 'Quick Return Summary';

  completeSummmaryMapping: any = [

    //  return block in more quick return summary start
    { 'set': { 'objectName': 'return', 'property': 'fillStatus' }, 'get': { 'form': 'dMainInfo', 'getElement': 'filstts' } },
    { 'set': { 'objectName': 'return', 'property': 'status' }, 'get': { 'form': 'header', 'getElement': 'status' } },
    { 'set': { 'objectName': 'return', 'property': 'createdBy' }, 'get': { 'form': 'header', 'getElement': 'createdByName' } },
    { 'set': { 'objectName': 'return', 'property': 'createdDateTime' }, 'get': { 'form': 'header', 'getElement': 'createdDate' } },
    { 'set': { 'objectName': 'return', 'property': 'updatedBy' }, 'get': { 'form': 'header', 'getElement': 'updatedByName' } },
    { 'set': { 'objectName': 'return', 'property': 'lastEdited' }, 'get': { 'form': 'header', 'getElement': 'lastSavedTime' } },
    { 'set': { 'objectName': 'return', 'property': 'returnType' }, 'get': { 'form': 'header', 'getElement': 'packageNames' } },
    { 'set': { 'objectName': 'return', 'property': 'isCheckedOut' }, 'get': { 'form': 'header', 'getElement': 'isCheckedOut' } },
    { 'set': { 'objectName': 'return', 'property': 'checkedOutBy' }, 'get': { 'form': 'header', 'getElement': 'checkedOutBy' } },
    { 'set': { 'objectName': 'return', 'property': 'id' }, 'get': { 'form': 'header', 'getElement': 'id' } },
    { 'set': { 'objectName': 'return', 'property': 'email' }, 'get': { 'form': 'header', 'getElement': 'email' } },
    //  return block end
    //  taxpayer block in more quick return summary start
    { 'set': { 'objectName': 'taxPayer', 'property': 'ssn' }, 'get': { 'form': 'header', 'usrDetail': 'client', 'getElement': 'ssn' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'firstName' }, 'get': { 'form': 'header', 'usrDetail': 'client', 'getElement': 'firstName' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'lastName' }, 'get': { 'form': 'header', 'usrDetail': 'client', 'getElement': 'lastName' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'usAptNo' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strusaptno' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'usStreet' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strusstrt' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'usCity' }, 'get': { 'form': 'dMainInfo', 'getElement': 'struscty' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'usState' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strusst' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'usZipCode' }, 'get': { 'form': 'dMainInfo', 'getElement': 'struszip' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'fgStreet' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strfgstrt' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'fgCity' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strfgcty' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'fgState' }, 'get': { 'form': 'dMainInfo', 'getElement': 'ProvinceOrState' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'fgPostalCode' }, 'get': { 'form': 'dMainInfo', 'getElement': 'PostalCode' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'fgCountry' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strfgcntry' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'phoneNo' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strfgtptel' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'email' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strtpeml' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'dateOfBirth' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strtpdob' } },
    { 'set': { 'objectName': 'taxPayer', 'property': 'dateOfDeath' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strtpdod' } },
    //  taxpayer block in more quick return summary end
    //  spouse block in more quick return summary start
    { 'set': { 'objectName': 'spouse', 'property': 'firstName' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strspfnmi' } },
    { 'set': { 'objectName': 'spouse', 'property': 'lastName' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strsplnm' } },
    { 'set': { 'objectName': 'spouse', 'property': 'ssn' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strspssn' } },
    { 'set': { 'objectName': 'spouse', 'property': 'phoneNo' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strfgsptel' } },
    { 'set': { 'objectName': 'spouse', 'property': 'email' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strspeml' } },
    { 'set': { 'objectName': 'spouse', 'property': 'dateOfBirth' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strspdob' } },
    { 'set': { 'objectName': 'spouse', 'property': 'dateOfDeath' }, 'get': { 'form': 'dMainInfo', 'getElement': 'strspdod' } },
    //  spouse block in more quick return summary end
    //  preparer block in more quick return summary start
    { 'set': { 'objectName': 'preparer', 'property': 'preparerId' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strprid' } },
    { 'set': { 'objectName': 'preparer', 'property': 'name' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strprnm' } },
    { 'set': { 'objectName': 'preparer', 'property': 'ssn' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strprssn' } },
    { 'set': { 'objectName': 'preparer', 'property': 'ptin' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strprptin' } },
    { 'set': { 'objectName': 'preparer', 'property': 'ein' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strprein' } },
    { 'set': { 'objectName': 'preparer', 'property': 'telephoneNo' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strprtele' } },
    { 'set': { 'objectName': 'preparer', 'property': 'email' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strpreml' } },
    //  preparer block in more quick return summary end
    //  Bank block in more quick return summary start
    { 'set': { 'objectName': 'bank', 'property': 'name' }, 'get': { 'form': 'dReturnInfo', 'getElement': '' } },
    { 'set': { 'objectName': 'bank', 'property': 'accountNo' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strdan' } },
    { 'set': { 'objectName': 'bank', 'property': 'accountType' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'blnsavingacc' } },
    { 'set': { 'objectName': 'bank', 'property': 'rtn' }, 'get': { 'form': 'dReturnInfo', 'getElement': 'strrtn' } },
    //  Bank block in more quick return summary end
    //  Mapping for 1040 start
    //  Income block start
    { 'set': { 'objectName': 'income', 'property': 'wagesAndSalary' }, 'get': { 'form': 'd1040', 'getElement': 'WagesSalariesAndTipsAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'interestAndDividend' }, 'get': { 'form': 'd1040', 'getElement': 'QuickreturnIntDiv' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'businessIncome' }, 'get': { 'form': 'd1040', 'getElement': 'BusinessIncomeLossAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'capitalGain' }, 'get': { 'form': 'd1040', 'getElement': 'CapitalGainLossAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'farmIncome' }, 'get': { 'form': 'd1040', 'getElement': 'NetFarmProfitOrLossAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'otherIncome' }, 'get': { 'form': 'd1040', 'getElement': 'TotalOtherIncomeAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'totalIncome' }, 'get': { 'form': 'd1040', 'getElement': 'TotalIncomeAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'totalAdjustment' }, 'get': { 'form': 'd1040', 'getElement': 'TotalAdjustmentsAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'adjustedGrossIncome' }, 'get': { 'form': 'd1040', 'getElement': 'AdjustedGrossIncomeAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'itemizedOrStandardDed' }, 'get': { 'form': 'd1040', 'getElement': 'TotalItemizedOrStandardDedAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'income', 'property': 'taxableIncome' }, 'get': { 'form': 'd1040', 'getElement': 'TaxableIncomeAmt' }, 'mainForm': '1040' },
    //  Income block end
    //   Credit block for 1040 start
    { 'set': { 'objectName': 'credit', 'property': 'foreignTaxCredit' }, 'get': { 'form': 'd1040', 'getElement': 'ForeignTaxCreditAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'credit', 'property': 'childAndDepCare' }, 'get': { 'form': 'd1040', 'getElement': 'CrForChildAndDEPDCareAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'credit', 'property': 'elderlyAndDisableCr' }, 'get': { 'form': 'dSchR', 'getElement': 'QuickreturnSchRCr' }, 'mainForm': '1040', 'required': { 'form': 'd1040', 'getElement': 'SpecificOtherCreditsInd' } },
    { 'set': { 'objectName': 'credit', 'property': 'educationCredit' }, 'get': { 'form': 'd1040', 'getElement': 'EducationCreditAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'credit', 'property': 'rtrSavingsCredit' }, 'get': { 'form': 'd1040', 'getElement': 'RtrSavingsContributionsCrAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'credit', 'property': 'eic' }, 'get': { 'form': 'd1040', 'getElement': 'EarnedIncomeCreditAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'credit', 'property': 'ctc' }, 'get': { 'form': 'd1040', 'getElement': 'ChildTaxCreditAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'credit', 'property': 'additionCTC' }, 'get': { 'form': 'd1040', 'getElement': 'AdditionalChildTaxCreditAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'credit', 'property': 'otherCredit' }, 'get': { 'form': 'dSchR', 'getElement': 'CreditForElderlyOrDisabledAmt' }, 'mainForm': '1040', 'required': { 'form': 'd1040', 'getElement': 'SpecificOtherCreditsInd' } },
    { 'set': { 'objectName': 'credit', 'property': 'totalCredit' }, 'get': { 'form': 'd1040', 'getElement': 'TotalCreditsAmt' }, 'mainForm': '1040' },
    //  Credit block end
    //  Tax block start
    { 'set': { 'objectName': 'tax', 'property': 'taxOnIncome' }, 'get': { 'form': 'd1040', 'getElement': 'TaxAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'tax', 'property': 'amt' }, 'get': { 'form': 'd1040', 'getElement': 'AlternativeMinimumTaxAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'tax', 'property': 'otherTaxes' }, 'get': { 'form': 'd1040', 'getElement': 'fielddz' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'tax', 'property': 'totalTax' }, 'get': { 'form': 'd1040', 'getElement': 'TotalTaxAmt' }, 'mainForm': '1040' },
    //  Tax block end
    //  Payment block start
    { 'set': { 'objectName': 'payment', 'property': 'incomeTaxWithheld' }, 'get': { 'form': 'd1040', 'getElement': 'WithholdingTaxAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPayAmt' }, 'get': { 'form': 'd1040', 'getElement': 'EstimatedTaxPaymentsAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'payment', 'property': 'otherPayments' }, 'get': { 'form': 'd1040', 'getElement': 'QuickreturnOtherPymt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPenalyt' }, 'get': { 'form': 'd1040', 'getElement': 'EsPenaltyAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'payment', 'property': 'balanceDue' }, 'get': { 'form': 'd1040', 'getElement': 'AmountOwedAmt' }, 'mainForm': '1040' },
    { 'set': { 'objectName': 'payment', 'property': 'refund' }, 'get': { 'form': 'd1040', 'getElement': 'RefundAmt' }, 'mainForm': '1040' },
    //  Payment block end
    //  Mapping for 1040 end
    //  Mapping for 1040A start
    //  Income block start
    { 'set': { 'objectName': 'income', 'property': 'wagesAndSalary' }, 'get': { 'form': 'd1040A', 'getElement': 'WagesSalariesAndTipsAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'interestAndDividend' }, 'get': { 'form': 'd1040A', 'getElement': 'QuickreturnIntDiv' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'businessIncome' }, 'get': { 'form': 'd1040A', 'getElement': '' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'capitalGain' }, 'get': { 'form': 'd1040A', 'getElement': 'CapitalGainLossAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'farmIncome' }, 'get': { 'form': 'd1040A', 'getElement': '' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'otherIncome' }, 'get': { 'form': 'd1040A', 'getElement': '' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'totalIncome' }, 'get': { 'form': 'd1040A', 'getElement': 'TotalIncomeAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'totalAdjustment' }, 'get': { 'form': 'd1040A', 'getElement': 'TotalAdjustmentsAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'adjustedGrossIncome' }, 'get': { 'form': 'd1040A', 'getElement': 'AdjustedGrossIncomeAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'itemizedOrStandardDed' }, 'get': { 'form': 'd1040A', 'getElement': 'TotalItemizedOrStandardDedAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'income', 'property': 'taxableIncome' }, 'get': { 'form': 'd1040A', 'getElement': 'TaxableIncomeAmt' }, 'mainForm': '1040A' },
    //  Income block end
    //  Credit block for 1040 start
    { 'set': { 'objectName': 'credit', 'property': 'foreignTaxCredit' }, 'get': { 'form': 'd1040A', 'getElement': '' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'childAndDepCare' }, 'get': { 'form': 'd1040A', 'getElement': 'CrForChildAndDEPDCareAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'elderlyAndDisableCr' }, 'get': { 'form': 'd1040A', 'getElement': 'CreditForElderlyOrDisabledAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'educationCredit' }, 'get': { 'form': 'd1040A', 'getElement': 'EducationCreditAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'rtrSavingsCredit' }, 'get': { 'form': 'd1040A', 'getElement': 'RtrSavingsContributionsCrAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'eic' }, 'get': { 'form': 'd1040A', 'getElement': 'EarnedIncomeCreditAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'ctc' }, 'get': { 'form': 'd1040A', 'getElement': 'ChildTaxCreditAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'additionCTC' }, 'get': { 'form': 'd1040A', 'getElement': 'AdditionalChildTaxCreditAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'otherCredit' }, 'get': { 'form': 'd1040A', 'getElement': '' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'credit', 'property': 'totalCredit' }, 'get': { 'form': 'd1040A', 'getElement': 'TotalCreditsAmt' }, 'mainForm': '1040A' },
    //  Credit block end
    //  Tax block start
    { 'set': { 'objectName': 'tax', 'property': 'taxOnIncome' }, 'get': { 'form': 'd1040A', 'getElement': 'TaxAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'tax', 'property': 'amt' }, 'get': { 'form': 'd6251', 'getElement': 'AlternativeMinimumTaxAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'tax', 'property': 'otherTaxes' }, 'get': { 'form': 'd1040A', 'getElement': 'HealthCareRspnsPenaltyAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'tax', 'property': 'totalTax' }, 'get': { 'form': 'd1040A', 'getElement': 'TotalTax' }, 'mainForm': '1040A' },
    //  Tax block end
    //  Payment block start
    { 'set': { 'objectName': 'payment', 'property': 'incomeTaxWithheld' }, 'get': { 'form': 'd1040A', 'getElement': 'WithholdingTaxAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPayAmt' }, 'get': { 'form': 'd1040A', 'getElement': 'EstimatedTaxPaymentsAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'payment', 'property': 'otherPayments' }, 'get': { 'form': 'd1040A', 'getElement': 'QuickreturnOtherPymt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPenalyt' }, 'get': { 'form': 'd1040A', 'getElement': 'EsPenaltyAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'payment', 'property': 'balanceDue' }, 'get': { 'form': 'd1040A', 'getElement': 'AmountOwedAmt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'payment', 'property': 'refund' }, 'get': { 'form': 'd1040A', 'getElement': 'RefundAmt' }, 'mainForm': '1040A' },
    //  Payment block end
    //  Mapping for 1040A end
    //  Mapping for 1040EZ start
    //  Income block start
    { 'set': { 'objectName': 'income', 'property': 'wagesAndSalary' }, 'get': { 'form': 'd1040EZ', 'getElement': 'WagesSalariesAndTipsAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'interestAndDividend' }, 'get': { 'form': 'd1040EZ', 'getElement': 'TaxableInterestAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'businessIncome' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'capitalGain' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'farmIncome' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'otherIncome' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'totalIncome' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'totalAdjustment' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'adjustedGrossIncome' }, 'get': { 'form': 'd1040EZ', 'getElement': 'AdjustedGrossIncomeAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'itemizedOrStandardDed' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'income', 'property': 'taxableIncome' }, 'get': { 'form': 'd1040EZ', 'getElement': 'TaxableIncomeAmt' }, 'mainForm': '1040EZ' },
    // Income block end
    // Credit block start
    { 'set': { 'objectName': 'credit', 'property': 'foreignTaxCredit' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'childAndDepCare' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'elderlyAndDisableCr' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'educationCredit' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'rtrSavingsCredit' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'eic' }, 'get': { 'form': 'd1040EZ', 'getElement': 'EarnedIncomeCreditAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': '.ctc' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'additionCTC' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'otherCredit' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'credit', 'property': 'totalCredit' }, 'get': { 'form': 'd1040EZ', 'getElement': 'EarnedIncomeCreditAmt' }, 'mainForm': '1040EZ' },
    // Credit block end
    // Tax block start
    { 'set': { 'objectName': 'tax', 'property': 'taxOnIncome' }, 'get': { 'form': 'd1040EZ', 'getElement': 'TaxAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'tax', 'property': 'amt' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'tax', 'property': 'otherTaxes' }, 'get': { 'form': 'd1040EZ', 'getElement': 'HealthCareRspnsPenaltyAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'tax', 'property': 'totalTax' }, 'get': { 'form': 'd1040EZ', 'getElement': 'TotalTax' }, 'mainForm': '1040EZ' },
    // Tax block end
    // Payment block start
    { 'set': { 'objectName': 'payment', 'property': 'incomeTaxWithheld' }, 'get': { 'form': 'd1040EZ', 'getElement': 'WithholdingTaxAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPayAmt' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPenalyt' }, 'get': { 'form': 'd1040EZ', 'getElement': '' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'payment', 'property': 'balanceDue' }, 'get': { 'form': 'd1040EZ', 'getElement': 'AmountOwedAmt' }, 'mainForm': '1040EZ' },
    { 'set': { 'objectName': 'payment', 'property': 'refund' }, 'get': { 'form': 'd1040EZ', 'getElement': 'RefundAmt' }, 'mainForm': '1040EZ' },
    // Payment block end
    // Mapping for 1040EZ end
    // Mapping for 1040SS start
    // Income block start
    { 'set': { 'objectName': 'income', 'property': 'wagesAndSalary' }, 'get': { 'form': 'd1040SS', 'getElement': 'PuertoRicoIncomeAmt' }, 'mainForm': '1040EZSS' },
    { 'set': { 'objectName': 'income', 'property': 'interestAndDividend' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'businessIncome' }, 'get': { 'form': 'd1040SS', 'getElement': 'NetProfitOrLossAmt' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'capitalGain' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'farmIncome' }, 'get': { 'form': 'd1040SS', 'getElement': 'GrossIncome50' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'otherIncome' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'totalIncome' }, 'get': { 'form': 'd1040SS', 'getElement': 'QuickreturnTotalInc' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'totalAdjustment' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'adjustedGrossIncome' }, 'get': { 'form': 'd1040SS', 'getElement': 'QuickreturnTotalAGI' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'itemizedOrStandardDed' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'income', 'property': 'taxableIncome' }, 'get': { 'form': 'd1040SS', 'getElement': 'QuickreturnTaxableInc' }, 'mainForm': '1040SS' },
    // Income block end
    // Credit block start
    { 'set': { 'objectName': 'credit', 'property': 'foreignTaxCredit' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'childAndDepCare' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'elderlyAndDisableCr' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'educationCredit' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'rtrSavingsCredit' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'eic' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': '.ctc' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'additionCTC' }, 'get': { 'form': 'd1040SS', 'getElement': 'part1line8' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'otherCredit' }, 'get': { 'form': 'd1040SS', 'getElement': 'HealthCoverageTaxCreditAmt' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'credit', 'property': 'totalCredit' }, 'get': { 'form': 'd1040SS', 'getElement': 'QuickreturnTotalCr' }, 'mainForm': '1040SS' },
    // Credit block end
    // Tax block start
    { 'set': { 'objectName': 'tax', 'property': 'taxOnIncome' }, 'get': { 'form': 'd1040SS', 'getElement': 'SelfEmploymentTaxAmt' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'tax', 'property': 'amt' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'tax', 'property': 'otherTaxes' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'tax', 'property': 'totalTax' }, 'get': { 'form': 'd1040SS', 'getElement': 'TotalTaxAmt' }, 'mainForm': '1040SS' },
    // Tax block end
    // Payment block start
    { 'set': { 'objectName': 'payment', 'property': 'incomeTaxWithheld' }, 'get': { 'form': 'd1040SS', 'getElement': 'TotalSocSecAndMedcrWithheldAmt' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPayAmt' }, 'get': { 'form': 'd1040SS', 'getElement': 'EstimatedTaxPaymentsAmt' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'payment', 'property': 'otherPayments' }, 'get': { 'form': 'd1040A', 'getElement': 'QuickreturnOtherPymt' }, 'mainForm': '1040A' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPenalyt' }, 'get': { 'form': 'd1040SS', 'getElement': '' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'payment', 'property': 'balanceDue' }, 'get': { 'form': 'd1040SS', 'getElement': 'AmountOwedAmt' }, 'mainForm': '1040SS' },
    { 'set': { 'objectName': 'payment', 'property': 'refund' }, 'get': { 'form': 'd1040SS', 'getElement': 'RefundAmt' }, 'mainForm': '1040SS' },
    // Payment block end
    // Mapping for 1040SS end
    // Mapping for CA 540 start
    { 'set': { 'objectName': 'ca', 'property': 'taxableIncome' }, 'get': { 'form': 'dCA540', 'getElement': 'CATaxableIncome' }, 'activeForm': 'dCA540' },
    { 'set': { 'objectName': 'ca', 'property': 'tax' }, 'get': { 'form': 'dCA540', 'getElement': 'StateIncomeTax' }, 'activeForm': 'dCA540' },
    { 'set': { 'objectName': 'ca', 'property': 'credits' }, 'get': { 'form': 'dCA540', 'getElement': 'CAAGI' }, 'activeForm': 'dCA540' },
    { 'set': { 'objectName': 'ca', 'property': 'payments' }, 'get': { 'form': 'dCA540', 'getElement': 'TotalPayments' }, 'activeForm': 'dCA540' },
    { 'set': { 'objectName': 'ca', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dCA540', 'getElement': 'InterestAndPenaltiesOwed' }, 'activeForm': 'dCA540' },
    { 'set': { 'objectName': 'ca', 'property': 'balanceDue' }, 'get': { 'form': 'dCA540', 'getElement': 'TotalAmtDue' }, 'activeForm': 'dCA540' },
    { 'set': { 'objectName': 'ca', 'property': 'refund' }, 'get': { 'form': 'dCA540', 'getElement': 'Refund' }, 'activeForm': 'dCA540' },
    // Mapping for CA 540 end
    // Mapping for CA 540NR start
    { 'set': { 'objectName': 'ca', 'property': 'taxableIncome' }, 'get': { 'form': 'dCA540NR', 'getElement': 'TotalTaxableIncome' }, 'activeForm': 'dCA540NR' },
    { 'set': { 'objectName': 'ca', 'property': 'tax' }, 'get': { 'form': 'dCA540NR', 'getElement': 'TotalTax2' }, 'activeForm': 'dCA540NR' },
    { 'set': { 'objectName': 'ca', 'property': 'credits' }, 'get': { 'form': 'dCA540NR', 'getElement': 'TotalCredits' }, 'activeForm': 'dCA540NR' },
    { 'set': { 'objectName': 'ca', 'property': 'payments' }, 'get': { 'form': 'dCA540NR', 'getElement': 'TotalPayments' }, 'activeForm': 'dCA540NR' },
    { 'set': { 'objectName': 'ca', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dCA540NR', 'getElement': 'InterestAndPenaltiesOwed' }, 'activeForm': 'dCA540NR' },
    { 'set': { 'objectName': 'ca', 'property': 'balanceDue' }, 'get': { 'form': 'dCA540NR', 'getElement': 'AmountOwed' }, 'activeForm': 'dCA540NR' },
    { 'set': { 'objectName': 'ca', 'property': 'refund' }, 'get': { 'form': 'dCA540NR', 'getElement': 'DDRAmount' }, 'activeForm': 'dCA540NR' },
    // Mapping for CA 540NR end
    // Mapping for CA 540NRS start
    { 'set': { 'objectName': 'ca', 'property': 'taxableIncome' }, 'get': { 'form': 'dCA540NRS', 'getElement': 'CATaxableIncome' }, 'activeForm': 'dCA540NRS' },
    { 'set': { 'objectName': 'ca', 'property': 'tax' }, 'get': { 'form': 'dCA540NRS', 'getElement': 'TotalTax' }, 'activeForm': 'dCA540NRS' },
    { 'set': { 'objectName': 'ca', 'property': 'credits' }, 'get': { 'form': 'dCA540NRS', 'getElement': 'TotalCredits' }, 'activeForm': 'dCA540NRS' },
    { 'set': { 'objectName': 'ca', 'property': 'payments' }, 'get': { 'form': 'dCA540NRS', 'getElement': 'CAWithholding' }, 'activeForm': 'dCA540NRS' },
    { 'set': { 'objectName': 'ca', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dCA540NRS', 'getElement': '' }, 'activeForm': 'dCA540NRS' },
    { 'set': { 'objectName': 'ca', 'property': 'balanceDue' }, 'get': { 'form': 'dCA540NRS', 'getElement': 'AmountOwed' }, 'activeForm': 'dCA540NRS' },
    { 'set': { 'objectName': 'ca', 'property': 'refund' }, 'get': { 'form': 'dCA540NRS', 'getElement': 'Refund' }, 'activeForm': 'dCA540NRS' },
    // Mapping for CA 540NRS end
    // Mapping for CA 5402EZ start
    { 'set': { 'objectName': 'ca', 'property': 'taxableIncome' }, 'get': { 'form': 'dCA5402EZ', 'getElement': 'CAAGI' }, 'activeForm': 'dCA5402EZ' },
    { 'set': { 'objectName': 'ca', 'property': 'tax' }, 'get': { 'form': 'dCA5402EZ', 'getElement': 'TotalTax' }, 'activeForm': 'dCA5402EZ' },
    { 'set': { 'objectName': 'ca', 'property': 'credits' }, 'get': { 'form': 'dCA5402EZ', 'getElement': 'TotalCredits' }, 'activeForm': 'dCA5402EZ' },
    { 'set': { 'objectName': 'ca', 'property': 'payments' }, 'get': { 'form': 'dCA5402EZ', 'getElement': 'CAWithholding' }, 'activeForm': 'dCA5402EZ' },
    { 'set': { 'objectName': 'ca', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dCA5402EZ', 'getElement': '' }, 'activeForm': 'dCA5402EZ' },
    { 'set': { 'objectName': 'ca', 'property': 'balanceDue' }, 'get': { 'form': 'dCA5402EZ', 'getElement': 'AmountOwed' }, 'activeForm': 'dCA5402EZ' },
    { 'set': { 'objectName': 'ca', 'property': 'refund' }, 'get': { 'form': 'dCA5402EZ', 'getElement': 'Refund' }, 'activeForm': 'dCA5402EZ' },
    // Mapping for CA 5402EZ end

    // Mapping for AZ 140 start
    { 'set': { 'objectName': 'az', 'property': 'taxableIncome' }, 'get': { 'form': 'dAZ140', 'getElement': 'AZTaxableInc' }, 'activeForm': 'dAZ140' },
    { 'set': { 'objectName': 'az', 'property': 'tax' }, 'get': { 'form': 'dAZ140', 'getElement': 'ComputedTax' }, 'activeForm': 'dAZ140' },
    { 'set': { 'objectName': 'az', 'property': 'credits' }, 'get': { 'form': 'dAZ140', 'getElement': 'CreditsFromAZ301' }, 'activeForm': 'dAZ140' },
    { 'set': { 'objectName': 'az', 'property': 'payments' }, 'get': { 'form': 'dAZ140', 'getElement': 'TotalPayments' }, 'activeForm': 'dAZ140' },
    { 'set': { 'objectName': 'az', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAZ140', 'getElement': 'EstPaymentPenalityMSA' }, 'activeForm': 'dAZ140' },
    { 'set': { 'objectName': 'az', 'property': 'balanceDue' }, 'get': { 'form': 'dAZ140', 'getElement': 'AmtOwed' }, 'activeForm': 'dAZ140' },
    { 'set': { 'objectName': 'az', 'property': 'refund' }, 'get': { 'form': 'dAZ140', 'getElement': 'RefundAmt' }, 'activeForm': 'dAZ140' },
    // Mapping for AZ 140 end
    // Mapping for AZ 140PY start
    { 'set': { 'objectName': 'az', 'property': 'taxableIncome' }, 'get': { 'form': 'dAZ140PY', 'getElement': 'AZTaxableInc' }, 'activeForm': 'dAZ140PY' },
    { 'set': { 'objectName': 'az', 'property': 'tax' }, 'get': { 'form': 'dAZ140PY', 'getElement': 'ComputedTax' }, 'activeForm': 'dAZ140PY' },
    { 'set': { 'objectName': 'az', 'property': 'credits' }, 'get': { 'form': 'dAZ140PY', 'getElement': 'CreditsFromAZ301' }, 'activeForm': 'dAZ140PY' },
    { 'set': { 'objectName': 'az', 'property': 'payments' }, 'get': { 'form': 'dAZ140PY', 'getElement': 'TotalPayments' }, 'activeForm': 'dAZ140PY' },
    { 'set': { 'objectName': 'az', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAZ140PY', 'getElement': 'EstPaymentPenalityMSA' }, 'activeForm': 'dAZ140PY' },
    { 'set': { 'objectName': 'az', 'property': 'balanceDue' }, 'get': { 'form': 'dAZ140PY', 'getElement': 'AmtOwed' }, 'activeForm': 'dAZ140PY' },
    { 'set': { 'objectName': 'az', 'property': 'refund' }, 'get': { 'form': 'dAZ140PY', 'getElement': 'RefundAmt' }, 'activeForm': 'dAZ140PY' },
    // Mapping for AZ 140PY end
    // Mapping for AZ 140NR start
    { 'set': { 'objectName': 'az', 'property': 'taxableIncome' }, 'get': { 'form': 'dAZ140NR', 'getElement': 'AZTaxableInc' }, 'activeForm': 'dAZ140NR' },
    { 'set': { 'objectName': 'az', 'property': 'tax' }, 'get': { 'form': 'dAZ140NR', 'getElement': 'ComputedTax' }, 'activeForm': 'dAZ140NR' },
    { 'set': { 'objectName': 'az', 'property': 'credits' }, 'get': { 'form': 'dAZ140NR', 'getElement': 'CreditsFromAZ301' }, 'activeForm': 'dAZ140NR' },
    { 'set': { 'objectName': 'az', 'property': 'payments' }, 'get': { 'form': 'dAZ140NR', 'getElement': 'TotalPayment' }, 'activeForm': 'dAZ140NR' },
    { 'set': { 'objectName': 'az', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAZ140NR', 'getElement': 'EstPaymentPenalityMSA' }, 'activeForm': 'dAZ140NR' },
    { 'set': { 'objectName': 'az', 'property': 'balanceDue' }, 'get': { 'form': 'dAZ140NR', 'getElement': 'AmtOwed' }, 'activeForm': 'dAZ140NR' },
    { 'set': { 'objectName': 'az', 'property': 'refund' }, 'get': { 'form': 'dAZ140NR', 'getElement': 'RefundAmt' }, 'activeForm': 'dAZ140NR' },
    // Mapping for AZ 140NR end
    // Mapping for AZ 140EZ start
    { 'set': { 'objectName': 'az', 'property': 'taxableIncome' }, 'get': { 'form': 'dAZ140EZ', 'getElement': 'AzTaxableInc' }, 'activeForm': 'dAZ140EZ' },
    { 'set': { 'objectName': 'az', 'property': 'tax' }, 'get': { 'form': 'dAZ140EZ', 'getElement': 'TotalTaxLiab' }, 'activeForm': 'dAZ140EZ' },
    { 'set': { 'objectName': 'az', 'property': 'credits' }, 'get': { 'form': 'dAZ140EZ', 'getElement': '' }, 'activeForm': 'dAZ140EZ' },
    { 'set': { 'objectName': 'az', 'property': 'payments' }, 'get': { 'form': 'dAZ140EZ', 'getElement': 'TotalPayment' }, 'activeForm': 'dAZ140EZ' },
    { 'set': { 'objectName': 'az', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAZ140EZ', 'getElement': '' }, 'activeForm': 'dAZ140EZ' },
    { 'set': { 'objectName': 'az', 'property': 'balanceDue' }, 'get': { 'form': 'dAZ140EZ', 'getElement': 'TaxDue' }, 'activeForm': 'dAZ140EZ' },
    { 'set': { 'objectName': 'az', 'property': 'refund' }, 'get': { 'form': 'dAZ140EZ', 'getElement': 'RefundAmt' }, 'activeForm': 'dAZ140EZ' },
    // Mapping for AZ 140EZ end

    // Mapping for GA 500
    { 'set': { 'objectName': 'ga', 'property': 'taxableIncome' }, 'get': { 'form': 'dGA500', 'getElement': 'StateTaxableIncome' }, 'activeForm': 'dGA500' },
    { 'set': { 'objectName': 'ga', 'property': 'tax' }, 'get': { 'form': 'dGA500', 'getElement': 'StateIncomeTax' }, 'activeForm': 'dGA500' },
    { 'set': { 'objectName': 'ga', 'property': 'credits' }, 'get': { 'form': 'dGA500', 'getElement': 'TotalPrePaymentCredits' }, 'activeForm': 'dGA500' },
    { 'set': { 'objectName': 'ga', 'property': 'payments' }, 'get': { 'form': 'dGA500', 'getElement': 'TotalPayment' }, 'activeForm': 'dGA500' },
    { 'set': { 'objectName': 'ga', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dGA500', 'getElement': 'EstimatedTaxPenalty' }, 'activeForm': 'dGA500' },
    { 'set': { 'objectName': 'ga', 'property': 'balanceDue' }, 'get': { 'form': 'dGA500', 'getElement': 'BalanceDueWithReturn' }, 'activeForm': 'dGA500' },
    { 'set': { 'objectName': 'ga', 'property': 'refund' }, 'get': { 'form': 'dGA500', 'getElement': 'NetRefund' }, 'activeForm': 'dGA500' },
    // Mapping for GA 500 End
    // Mapping for GA 500EZ
    { 'set': { 'objectName': 'ga', 'property': 'taxableIncome' }, 'get': { 'form': 'dGA500EZ', 'getElement': 'StateTaxableIncome' }, 'activeForm': 'dGA500EZ' },
    { 'set': { 'objectName': 'ga', 'property': 'tax' }, 'get': { 'form': 'dGA500EZ', 'getElement': 'StateIncomeTax' }, 'activeForm': 'dGA500EZ' },
    { 'set': { 'objectName': 'ga', 'property': 'credits' }, 'get': { 'form': 'dGA500EZ', 'getElement': 'TaxAfterCredits' }, 'activeForm': 'dGA500EZ' },
    { 'set': { 'objectName': 'ga', 'property': 'payments' }, 'get': { 'form': 'dGA500EZ', 'getElement': 'TaxOverpayment' }, 'activeForm': 'dGA500EZ' },
    { 'set': { 'objectName': 'ga', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dGA500EZ', 'getElement': '' }, 'activeForm': 'dGA500EZ' },
    { 'set': { 'objectName': 'ga', 'property': 'balanceDue' }, 'get': { 'form': 'dGA500EZ', 'getElement': 'BalanceDueWithReturn' }, 'activeForm': 'dGA500EZ' },
    { 'set': { 'objectName': 'ga', 'property': 'refund' }, 'get': { 'form': 'dGA500EZ', 'getElement': 'NetRefund' }, 'activeForm': 'dGA500EZ' },
    // Mapping for GA 500EZ End
    // Mapping for GA 500X
    { 'set': { 'objectName': 'ga', 'property': 'taxableIncome' }, 'get': { 'form': 'dGA500X', 'getElement': 'StateTaxableIncome' }, 'activeForm': 'dGA500X' },
    { 'set': { 'objectName': 'ga', 'property': 'tax' }, 'get': { 'form': 'dGA500X', 'getElement': 'StateIncomeTax' }, 'activeForm': 'dGA500X' },
    { 'set': { 'objectName': 'ga', 'property': 'credits' }, 'get': { 'form': 'dGA500X', 'getElement': 'TaxAfterCredits' }, 'activeForm': 'dGA500X' },
    { 'set': { 'objectName': 'ga', 'property': 'payments' }, 'get': { 'form': 'dGA500X', 'getElement': 'TotalPrePaymentCredits' }, 'activeForm': 'dGA500X' },
    { 'set': { 'objectName': 'ga', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dGA500X', 'getElement': 'LatePaymentPenalty' }, 'activeForm': 'dGA500X' },
    { 'set': { 'objectName': 'ga', 'property': 'interest' }, 'get': { 'form': 'dGA500X', 'getElement': 'Interest' }, 'activeForm': 'dGA500X' },
    { 'set': { 'objectName': 'ga', 'property': 'balanceDue' }, 'get': { 'form': 'dGA500X', 'getElement': 'AmountOwed' }, 'activeForm': 'dGA500X' },
    { 'set': { 'objectName': 'ga', 'property': 'refund' }, 'get': { 'form': 'dGA500X', 'getElement': 'RefundToBeReceived' }, 'activeForm': 'dGA500X' },
    // Mapping for GA 500X End

    // Mapping for OH SD100
    { 'set': { 'objectName': 'oh', 'property': 'taxableIncome' }, 'get': { 'form': 'dOHSD100', 'getElement': 'TaxableIncome' }, 'activeForm': 'dOHSD100' },
    { 'set': { 'objectName': 'oh', 'property': 'tax' }, 'get': { 'form': 'dOHSD100', 'getElement': 'TotalTax' }, 'activeForm': 'dOHSD100' },
    { 'set': { 'objectName': 'oh', 'property': 'credits' }, 'get': { 'form': 'dOHSD100', 'getElement': 'TaxLessCredit' }, 'activeForm': 'dOHSD100' },
    { 'set': { 'objectName': 'oh', 'property': 'payments' }, 'get': { 'form': 'dOHSD100', 'getElement': 'TotalPayments' }, 'activeForm': 'dOHSD100' },
    { 'set': { 'objectName': 'oh', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dOHSD100', 'getElement': 'LateFiledInterestAndPenalty' }, 'activeForm': 'dOHSD100' },
    { 'set': { 'objectName': 'oh', 'property': 'balanceDue' }, 'get': { 'form': 'dOHSD100', 'getElement': 'BalanceDue' }, 'activeForm': 'dOHSD100' },
    { 'set': { 'objectName': 'oh', 'property': 'refund' }, 'get': { 'form': 'dOHSD100', 'getElement': 'Refund' }, 'activeForm': 'dOHSD100' },
    // Mapping for OH SD100 End
    // Mapping for OH IT 1040
    { 'set': { 'objectName': 'oh', 'property': 'taxableIncome' }, 'get': { 'form': 'dOHIT1040', 'getElement': 'TaxableIncome' }, 'activeForm': 'dOHIT1040' },
    { 'set': { 'objectName': 'oh', 'property': 'tax' }, 'get': { 'form': 'dOHIT1040', 'getElement': 'TotalTaxLiability' }, 'activeForm': 'dOHIT1040' },
    { 'set': { 'objectName': 'oh', 'property': 'credits' }, 'get': { 'form': 'dOHIT1040', 'getElement': 'CreditAmount' }, 'activeForm': 'dOHIT1040' },
    { 'set': { 'objectName': 'oh', 'property': 'payments' }, 'get': { 'form': 'dOHIT1040', 'getElement': 'TotalPayment' }, 'activeForm': 'dOHIT1040' },
    { 'set': { 'objectName': 'oh', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dOHIT1040', 'getElement': 'AMOUNTDUE' }, 'activeForm': 'dOHIT1040' },
    { 'set': { 'objectName': 'oh', 'property': 'balanceDue' }, 'get': { 'form': 'dOHIT1040', 'getElement': 'AMOUNTDUEPLUSINTERESTANDPENALTY' }, 'activeForm': 'dOHIT1040' },
    { 'set': { 'objectName': 'oh', 'property': 'refund' }, 'get': { 'form': 'dOHIT1040', 'getElement': 'YOURREFUND' }, 'activeForm': 'dOHIT1040' },
    // Mapping for OH IT 1040 End

    // Mapping for CO 104
    { 'set': { 'objectName': 'co', 'property': 'taxableIncome' }, 'get': { 'form': 'dCO104', 'getElement': 'StateTaxableIncome' }, 'activeForm': 'dCO104' },
    { 'set': { 'objectName': 'co', 'property': 'tax' }, 'get': { 'form': 'dCO104', 'getElement': 'StateIncomeTax' }, 'activeForm': 'dCO104' },
    { 'set': { 'objectName': 'co', 'property': 'credits' }, 'get': { 'form': 'dCO104', 'getElement': 'TotalRefundableCredits' }, 'activeForm': 'dCO104' },
    { 'set': { 'objectName': 'co', 'property': 'payments' }, 'get': { 'form': 'dCO104', 'getElement': 'TotalPymtsCredits' }, 'activeForm': 'dCO104' },
    { 'set': { 'objectName': 'co', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dCO104', 'getElement': 'UnderpaymentPenaltyInterest' }, 'activeForm': 'dCO104' },
    { 'set': { 'objectName': 'co', 'property': 'balanceDue' }, 'get': { 'form': 'dCO104', 'getElement': 'BalanceDueWithReturn' }, 'activeForm': 'dCO104' },
    { 'set': { 'objectName': 'co', 'property': 'refund' }, 'get': { 'form': 'dCO104', 'getElement': 'NetRefund' }, 'activeForm': 'dCO104' },
    // Mapping for CO 104 End

    // Mapping for AL 40
    { 'set': { 'objectName': 'al', 'property': 'taxableIncome' }, 'get': { 'form': 'dAL40', 'getElement': 'TaxableIncome' }, 'activeForm': 'dAL40' },
    { 'set': { 'objectName': 'al', 'property': 'tax' }, 'get': { 'form': 'dAL40', 'getElement': 'TaxDue' }, 'activeForm': 'dAL40' },
    { 'set': { 'objectName': 'al', 'property': 'credits' }, 'get': { 'form': 'dAL40', 'getElement': 'TotalRefundableCredits' }, 'activeForm': 'dAL40' },
    { 'set': { 'objectName': 'al', 'property': 'payments' }, 'get': { 'form': 'dAL40', 'getElement': 'TotalPayments' }, 'activeForm': 'dAL40' },
    { 'set': { 'objectName': 'al', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAL40', 'getElement': 'EstimatedTaxPenalty' }, 'activeForm': 'dAL40' },
    { 'set': { 'objectName': 'al', 'property': 'balanceDue' }, 'get': { 'form': 'dAL40', 'getElement': 'AmountOwed' }, 'activeForm': 'dAL40' },
    { 'set': { 'objectName': 'al', 'property': 'refund' }, 'get': { 'form': 'dAL40', 'getElement': 'RefundAmount' }, 'activeForm': 'dAL40' },
    // Mapping for AL 40 End

    // Mapping for AL 40 NR
    { 'set': { 'objectName': 'al', 'property': 'taxableIncome' }, 'get': { 'form': 'dAL40NR', 'getElement': 'TaxableIncome' }, 'activeForm': 'dAL40NR' },
    { 'set': { 'objectName': 'al', 'property': 'tax' }, 'get': { 'form': 'dAL40NR', 'getElement': 'Taxdue' }, 'activeForm': 'dAL40NR' },
    { 'set': { 'objectName': 'al', 'property': 'credits' }, 'get': { 'form': 'dAL40NR', 'getElement': 'Credits' }, 'activeForm': 'dAL40NR' },
    { 'set': { 'objectName': 'al', 'property': 'payments' }, 'get': { 'form': 'dAL40NR', 'getElement': 'TotalPayments' }, 'activeForm': 'dAL40NR' },
    { 'set': { 'objectName': 'al', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAL40NR', 'getElement': 'EstimatedTaxPenalty' }, 'activeForm': 'dAL40NR' },
    { 'set': { 'objectName': 'al', 'property': 'balanceDue' }, 'get': { 'form': 'dAL40NR', 'getElement': 'AmountOwed' }, 'activeForm': 'dAL40NR' },
    { 'set': { 'objectName': 'al', 'property': 'refund' }, 'get': { 'form': 'dAL40NR', 'getElement': 'REFUNDEDTOYOU' }, 'activeForm': 'dAL40NR' },
    // Mapping for AL 40NR End

    // Mapping for MI 1040
    { 'set': { 'objectName': 'mi', 'property': 'taxableIncome' }, 'get': { 'form': 'dMI1040', 'getElement': 'TaxableIncome' }, 'activeForm': 'dMI1040' },
    { 'set': { 'objectName': 'mi', 'property': 'tax' }, 'get': { 'form': 'dMI1040', 'getElement': 'StateIncomeTax' }, 'activeForm': 'dMI1040' },
    { 'set': { 'objectName': 'mi', 'property': 'credits' }, 'get': { 'form': 'dMI1040', 'getElement': 'TotalCreditsAndPayments' }, 'activeForm': 'dMI1040' },
    { 'set': { 'objectName': 'mi', 'property': 'payments' }, 'get': { 'form': 'dMI1040', 'getElement': 'EstimatedPaymentTotal' }, 'activeForm': 'dMI1040' },
    { 'set': { 'objectName': 'mi', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dMI1040', 'getElement': 'InterestAmount' }, 'activeForm': 'dMI1040' },
    { 'set': { 'objectName': 'mi', 'property': 'interstAndPenalties1' }, 'get': { 'form': 'dMI1040', 'getElement': 'PenaltyAmount' }, 'activeForm': 'dMI1040' },
    { 'set': { 'objectName': 'mi', 'property': 'balanceDue' }, 'get': { 'form': 'dMI1040', 'getElement': 'BalanceDueWithReturn' }, 'activeForm': 'dMI1040' },
    { 'set': { 'objectName': 'mi', 'property': 'refund' }, 'get': { 'form': 'dMI1040', 'getElement': 'Refund' }, 'activeForm': 'dMI1040' },
    // Mapping for MI 1040 End

    // Mapping for NC D400
    { 'set': { 'objectName': 'nc', 'property': 'taxableIncome' }, 'get': { 'form': 'dNCD400', 'getElement': 'NCTaxableInc' }, 'activeForm': 'dNCD400' },
    { 'set': { 'objectName': 'nc', 'property': 'tax' }, 'get': { 'form': 'dNCD400', 'getElement': 'NCIncTax' }, 'activeForm': 'dNCD400' },
    { 'set': { 'objectName': 'nc', 'property': 'credits' }, 'get': { 'form': 'dNCD400', 'getElement': 'TaxCredits' }, 'activeForm': 'dNCD400' },
    { 'set': { 'objectName': 'nc', 'property': 'payments' }, 'get': { 'form': 'dNCD400', 'getElement': '' }, 'activeForm': 'dNCD400' },
    { 'set': { 'objectName': 'nc', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dNCD400', 'getElement': 'Penalties' }, 'activeForm': 'dNCD400' },
    { 'set': { 'objectName': 'nc', 'property': 'interstAndPenalties1' }, 'get': { 'form': 'dNCD400', 'getElement': 'Interest' }, 'activeForm': 'dNCD400' },
    { 'set': { 'objectName': 'nc', 'property': 'balanceDue' }, 'get': { 'form': 'dNCD400', 'getElement': 'TotalAmountDue' }, 'activeForm': 'dNCD400' },
    { 'set': { 'objectName': 'nc', 'property': 'refund' }, 'get': { 'form': 'dNCD400', 'getElement': 'RefundAmt' }, 'activeForm': 'dNCD400' },
    // Mapping for NC D400 End

    // Mapping for MD 502
    { 'set': { 'objectName': 'md', 'property': 'taxableIncome' }, 'get': { 'form': 'dMD502', 'getElement': 'TaxableNetIncome' }, 'activeForm': 'dMD502' },
    { 'set': { 'objectName': 'md', 'property': 'tax' }, 'get': { 'form': 'dMD502', 'getElement': 'Marylandtax' }, 'activeForm': 'dMD502' },
    { 'set': { 'objectName': 'md', 'property': 'credits' }, 'get': { 'form': 'dMD502', 'getElement': 'EarnedIncomeCreditlineTentativeTaxCredit' }, 'activeForm': 'dMD502' },
    { 'set': { 'objectName': 'md', 'property': 'payments' }, 'get': { 'form': 'dMD502', 'getElement': 'TotalPaymentsAndCredits' }, 'activeForm': 'dMD502' },
    { 'set': { 'objectName': 'md', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dMD502', 'getElement': '' }, 'activeForm': 'dMD502' },
    { 'set': { 'objectName': 'md', 'property': 'balanceDue' }, 'get': { 'form': 'dMD502', 'getElement': 'BalanceDue' }, 'activeForm': 'dMD502' },
    { 'set': { 'objectName': 'md', 'property': 'refund' }, 'get': { 'form': 'dMD502', 'getElement': 'ToBeRefunded' }, 'activeForm': 'dMD502' },
    // Mapping for MD 502 End

    // Mapping for MD 505
    { 'set': { 'objectName': 'md', 'property': 'taxableIncome' }, 'get': { 'form': 'dMD505', 'getElement': 'TaxableNetIncome' }, 'activeForm': 'dMD505' },
    { 'set': { 'objectName': 'md', 'property': 'tax' }, 'get': { 'form': 'dMD505', 'getElement': 'StateIncomeTax' }, 'activeForm': 'dMD505' },
    { 'set': { 'objectName': 'md', 'property': 'credits' }, 'get': { 'form': 'dMD505', 'getElement': 'TotalCredits' }, 'activeForm': 'dMD505' },
    { 'set': { 'objectName': 'md', 'property': 'payments' }, 'get': { 'form': 'dMD505', 'getElement': 'TotalPaymentsAndCredits' }, 'activeForm': 'dMD505' },
    { 'set': { 'objectName': 'md', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dMD505', 'getElement': '' }, 'activeForm': 'dMD505' },
    { 'set': { 'objectName': 'md', 'property': 'balanceDue' }, 'get': { 'form': 'dMD505', 'getElement': 'BalanceDue' }, 'activeForm': 'dMD505' },
    { 'set': { 'objectName': 'md', 'property': 'refund' }, 'get': { 'form': 'dMD505', 'getElement': 'ToBeRefunded' }, 'activeForm': 'dMD505' },
    // Mapping for MD 505 End

    // Mapping for AR 1000F
    { 'set': { 'objectName': 'ar', 'property': 'taxableIncome' }, 'get': { 'form': 'dAR1000F', 'getElement': 'YourNetTaxableIncome' }, 'activeForm': 'dAR1000F' },
    { 'set': { 'objectName': 'ar', 'property': 'taxableIncome1' }, 'get': { 'form': 'dAR1000F', 'getElement': 'SpouseNetTaxableIncome' }, 'activeForm': 'dAR1000F' },
    { 'set': { 'objectName': 'ar', 'property': 'tax' }, 'get': { 'form': 'dAR1000F', 'getElement': 'CombinedTax' }, 'activeForm': 'dAR1000F' },
    { 'set': { 'objectName': 'ar', 'property': 'credits' }, 'get': { 'form': 'dAR1000F', 'getElement': 'TotalCredits' }, 'activeForm': 'dAR1000F' },
    { 'set': { 'objectName': 'ar', 'property': 'payments' }, 'get': { 'form': 'dAR1000F', 'getElement': 'TotalPayments' }, 'activeForm': 'dAR1000F' },
    { 'set': { 'objectName': 'ar', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAR1000F', 'getElement': 'PenaltyAmount' }, 'activeForm': 'dAR1000F' },
    { 'set': { 'objectName': 'ar', 'property': 'balanceDue' }, 'get': { 'form': 'dAR1000F', 'getElement': 'BalanceDueWithReturn' }, 'activeForm': 'dAR1000F' },
    { 'set': { 'objectName': 'ar', 'property': 'refund' }, 'get': { 'form': 'dAR1000F', 'getElement': 'AmtToBeRefunded' }, 'activeForm': 'dAR1000F' },
    // Mapping for AR 1000F End

    // Mapping for AR 1000NR
    { 'set': { 'objectName': 'ar', 'property': 'taxableIncome' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'NetTaxableIncome' }, 'activeForm': 'dAR1000NR' },
    { 'set': { 'objectName': 'ar', 'property': 'taxableIncome1' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'NetTaxableIncomespouse' }, 'activeForm': 'dAR1000NR' },
    { 'set': { 'objectName': 'ar', 'property': 'tax' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'CombinedTax' }, 'activeForm': 'dAR1000NR' },
    { 'set': { 'objectName': 'ar', 'property': 'credits' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'TotalCredits' }, 'activeForm': 'dAR1000NR' },
    { 'set': { 'objectName': 'ar', 'property': 'payments' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'TotalPayments' }, 'activeForm': 'dAR1000NR' },
    { 'set': { 'objectName': 'ar', 'property': 'interstAndPenalties' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'PenaltyAmount' }, 'activeForm': 'dAR1000NR' },
    { 'set': { 'objectName': 'ar', 'property': 'balanceDue' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'BalanceDueWithReturn' }, 'activeForm': 'dAR1000NR' },
    { 'set': { 'objectName': 'ar', 'property': 'refund' }, 'get': { 'form': 'dAR1000NR', 'getElement': 'AmtToBeRefunded' }, 'activeForm': 'dAR1000NR' },
    // Mapping for AR 1000NR End

    // Mapping for 1065 start
    // Mapping of partnership block start
    { 'set': { 'objectName': 'partnership', 'property': 'ein' }, 'get': { 'form': 'header', 'usrDetail': 'client', 'getElement': 'ein' } },
    { 'set': { 'objectName': 'partnership', 'property': 'companyName' }, 'get': { 'form': 'header', 'usrDetail': 'client', 'getElement': 'companyName' } },
    { 'set': { 'objectName': 'partnership', 'property': 'usStreet' }, 'get': { 'form': 'd1065CIS', 'getElement': 'USStreet' } },
    { 'set': { 'objectName': 'partnership', 'property': 'usCity' }, 'get': { 'form': 'd1065CIS', 'getElement': 'USCity' } },
    { 'set': { 'objectName': 'partnership', 'property': 'usState' }, 'get': { 'form': 'd1065CIS', 'getElement': 'USState' } },
    { 'set': { 'objectName': 'partnership', 'property': 'usZipCode' }, 'get': { 'form': 'd1065CIS', 'getElement': 'USZip' } },
    { 'set': { 'objectName': 'partnership', 'property': 'fgStreet' }, 'get': { 'form': 'd1065CIS', 'getElement': 'FGStreet' } },
    { 'set': { 'objectName': 'partnership', 'property': 'fgCity' }, 'get': { 'form': 'd1065CIS', 'getElement': 'FGCityStateZip' } },
    { 'set': { 'objectName': 'partnership', 'property': 'fgState' }, 'get': { 'form': 'd1065CIS', 'getElement': 'FGProvinceOrState' } },
    { 'set': { 'objectName': 'partnership', 'property': 'fgPostalCode' }, 'get': { 'form': 'd1065CIS', 'getElement': 'FGPostalCode' } },
    { 'set': { 'objectName': 'partnership', 'property': 'fgCountry' }, 'get': { 'form': 'd1065CIS', 'getElement': 'FGCountry' } },
    { 'set': { 'objectName': 'partnership', 'property': 'phoneNo' }, 'get': { 'form': 'd1065CIS', 'getElement': 'Phone' } },

    // preparer block in more quick return summary start
    { 'set': { 'objectName': 'preparer', 'property': 'preparerId' }, 'get': { 'form': 'd1065RIS', 'getElement': 'PrepareID' } },
    { 'set': { 'objectName': 'preparer', 'property': 'name' }, 'get': { 'form': 'd1065RIS', 'getElement': 'PrepareName' } },
    { 'set': { 'objectName': 'preparer', 'property': 'ssn' }, 'get': { 'form': 'd1065RIS', 'getElement': 'PrepareSSN' } },
    { 'set': { 'objectName': 'preparer', 'property': 'ptin' }, 'get': { 'form': 'd1065RIS', 'getElement': 'PreparePTIN' } },
    { 'set': { 'objectName': 'preparer', 'property': 'ein' }, 'get': { 'form': 'd1065RIS', 'getElement': 'PrepareEIN' } },
    { 'set': { 'objectName': 'preparer', 'property': 'telephoneNo' }, 'get': { 'form': 'd1065RIS', 'getElement': 'PreparePhone' } },
    { 'set': { 'objectName': 'preparer', 'property': 'email' }, 'get': { 'form': 'd1065RIS', 'getElement': 'PrepareEmail' } },
    // preparer block in more quick return summary end

    // Bank block in more quick return summary start
    { 'set': { 'objectName': 'bank', 'property': 'name' }, 'get': { 'form': 'd1065RIS', 'getElement': '' } },
    { 'set': { 'objectName': 'bank', 'property': 'accountNo' }, 'get': { 'form': 'd1065RIS', 'getElement': 'strdan' } },
    { 'set': { 'objectName': 'bank', 'property': 'accountType' }, 'get': { 'form': 'd1065RIS', 'getElement': 'blnsavingacc' } },
    { 'set': { 'objectName': 'bank', 'property': 'accountType' }, 'get': { 'form': 'd1065RIS', 'getElement': 'blncurracc' } },
    { 'set': { 'objectName': 'bank', 'property': 'rtn' }, 'get': { 'form': 'd1065RIS', 'getElement': 'strrtn' } },
    // Bank block in more quick return summary end

    // Income block start
    { 'set': { 'objectName': 'income', 'property': 'grossRecieptsOrNetSales' }, 'get': { 'form': 'd1065', 'getElement': 'SubtractLine1dFromLine1c' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'interestAndDividend' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'businessIncome' }, 'get': { 'form': 'd1065', 'getElement': 'OrdinaryIncomeLoss' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'capitalGain' }, 'get': { 'form': 'd1065', 'getElement': 'NetGainLoss' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'farmIncome' }, 'get': { 'form': 'd1065', 'getElement': 'NetFarmProfitLoss' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'otherIncome' }, 'get': { 'form': 'd1065', 'getElement': 'OtherIncomeLoss' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'totalIncome' }, 'get': { 'form': 'd1065', 'getElement': 'TotalIncomeLoss' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'totalAdjustment' }, 'get': { 'form': 'd1065', 'getElement': 'TotalDeductions' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'adjustedGrossIncome' }, 'get': { 'form': 'd1065', 'getElement': 'OrdinaryBusinessIncomeLoss' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'itemizedOrStandardDed' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'income', 'property': 'taxableIncome' }, 'get': { 'form': 'd1065', 'getElement': 'OrdinaryBusinessIncomeLoss' }, 'mainForm': '1065' },
    // Income block end

    // Credit block for 1065 start
    { 'set': { 'objectName': 'credit', 'property': 'foreignTaxCredit' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'childAndDepCare' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'elderlyAndDisableCr' }, 'get': { 'form': 'dSchR', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'educationCredit' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'rtrSavingsCredit' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'eic' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'ctc' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'additionCTC' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'otherCredit' }, 'get': { 'form': 'dSchR', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'totalCredit' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    // Credit block end
    // Tax block start
    { 'set': { 'objectName': 'tax', 'property': 'taxOnIncome' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'tax', 'property': 'amt' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'tax', 'property': 'otherTaxes' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'tax', 'property': 'totalTax' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    // Tax block end
    // Payment block start
    { 'set': { 'objectName': 'payment', 'property': 'incomeTaxWithheld' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPayAmt' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'payment', 'property': 'otherPayments' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPenalyt' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'payment', 'property': 'balanceDue' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'payment', 'property': 'refund' }, 'get': { 'form': 'd1065', 'getElement': '' }, 'mainForm': '1065' },
    // Payment block end
    // Mapping for 1065 end

    // Mapping for 1065B Start
    // Income block start
    { 'set': { 'objectName': 'income', 'property': 'grossRecieptsOrNetSales' }, 'get': { 'form': 'd1065B', 'getElement': 'GrossReceiptsOrSalesBalance' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'interestAndDividend' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'businessIncome' }, 'get': { 'form': 'd1065B', 'getElement': 'OrdinaryIncomeLoss' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'capitalGain' }, 'get': { 'form': 'd1065B', 'getElement': 'NetGainLoss' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'farmIncome' }, 'get': { 'form': 'd1065B', 'getElement': 'NetFarmProfitLoss' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'otherIncome' }, 'get': { 'form': 'd1065B', 'getElement': 'OtherIncomeOrLoss' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'totalIncome' }, 'get': { 'form': 'd1065B', 'getElement': 'QuickSummaryTotalIncome' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'totalAdjustment' }, 'get': { 'form': 'd1065B', 'getElement': 'QuickSummaryTotalDed' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'adjustedGrossIncome' }, 'get': { 'form': 'd1065B', 'getElement': 'QuickSummaryAGI' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'itemizedOrStandardDed' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'income', 'property': 'taxableIncome' }, 'get': { 'form': 'd1065B', 'getElement': 'QuickSummaryTaxableInc' }, 'mainForm': '1065B' },
    // Income block end

    // Credit block for 1065 start
    { 'set': { 'objectName': 'credit', 'property': 'foreignTaxCredit' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'childAndDepCare' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'elderlyAndDisableCr' }, 'get': { 'form': 'dSchR', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'educationCredit' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'rtrSavingsCredit' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'eic' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'ctc' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065' },
    { 'set': { 'objectName': 'credit', 'property': 'additionCTC' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'otherCredit' }, 'get': { 'form': 'dSchR', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'credit', 'property': 'totalCredit' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    // Credit block end
    // Tax block start
    { 'set': { 'objectName': 'tax', 'property': 'taxOnIncome' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'tax', 'property': 'amt' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'tax', 'property': 'otherTaxes' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'tax', 'property': 'totalTax' }, 'get': { 'form': 'd1065B', 'getElement': 'Taxes' }, 'mainForm': '1065B' },
    // Tax block end
    // Payment block start
    { 'set': { 'objectName': 'payment', 'property': 'incomeTaxWithheld' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPayAmt' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'payment', 'property': 'otherPayments' }, 'get': { 'form': 'd1065B', 'getElement': 'OtherPayments' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'payment', 'property': 'estimateTaxPenalyt' }, 'get': { 'form': 'd1065B', 'getElement': '' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'payment', 'property': 'balanceDue' }, 'get': { 'form': 'd1065B', 'getElement': 'AmountOwed' }, 'mainForm': '1065B' },
    { 'set': { 'objectName': 'payment', 'property': 'refund' }, 'get': { 'form': 'd1065B', 'getElement': 'Overpayment' }, 'mainForm': '1065B' },
    // Payment block start
    // Mapping for 1065 end
  ];

  // pager object
  pager: any = {};

  constructor(private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private userService: UserService,
    private dialogService: DialogService,
    private cdrService: CDRService,
    private messageService: MessageService,
    private returnSummaryService: ReturnSummaryService,
    private locationService: LocationService,
    private localStorageUtilityService: LocalStorageUtilityService, ) { }

  /**
   * @author Mansi Makwana
   * @createdDate 05-12-2019
   * @discription to create quick return summary form
   * @memberOf QuickReturnSummaryComponent
   */
  public initQuickReturnSummaryForm() {
    this.quickReturnSummaryForm = this.fb.group({
      customerNumber: ['', Validators.required],
      LocationId: [undefined, Validators.required],
      taxYear: [undefined, Validators.required],
      maskType: this.masktype,
      ssnorein: ['', Validators.required],
    });
    this.showLoading = false;
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 05-12-2019
   * @discription call quick Return summay service and set Return List data
   * @memberOf QuickReturnSummaryComponent
   */

  private getSummary() {
    this.isDataLoading = true;
    return new Promise((resolve, reject) => {
      this.returnSummaryService.getQuickReturnSummarys(this.quickReturnSummaryForm.controls.ssnorein.value, this.quickReturnSummaryForm.controls.maskType.value)
        .then((response: any) => {
          if (this.returnSummaryService.isReturnFound) {
            this.getRetunData();
          } else {
            this.isDataLoading = false;
            this.quickSummary = {};
            this.message = this.returnSummaryService.message;
            this.cdrService.callDetectChanges(this.cdr);
          }
          resolve(response);
        });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 05-12-2019
   * @discription calling the function to get the quick return of the ssn entered
   * @memberOf QuickReturnSummaryComponent
   */

  public getReturnStummary(): void {
    if (this.quickReturnSummaryForm.controls.LocationId.value !== undefined) {

      this.locationService.setLocationId(this.locationIds[0].id);
      this.locationService.setTaxYear(this.quickReturnSummaryForm.controls.taxYear.value);
      if (this.quickReturnSummaryForm.controls.ssnorein.value && this.quickReturnSummaryForm.controls.ssnorein.value !== '') {
        this.getSummary().then((res: any) => {
          // initialize to page 1

          this.setPage(undefined);
        });

      } else {
        this.quickSummary = {};
        //  condition done if tab press by user and ssn is blank then show the default msg and not error
        if (this.ssnorein === '') {
          this.message = 'Enter valid ' + this.quickReturnSummaryForm.controls.maskType.value + ' to get quick return summary on it.';
          this.returnSummaryService.quickSummary = undefined;
        } else {
          this.message = 'You have entered invalid ' + this.quickReturnSummaryForm.controls.maskType.value + '.';
        }
      }

    }
  }

  /*
   *  Key press event
   *  If enter is press then we will call getReturnStummary function
   */
  public keydown(event: any, type: any): void {
    //  13 is key code for 'enter' key
    if (event.keyCode === 13) {
      if (type === 'getSummary') {

        this.getReturnStummary();

      } else if (type === 'getSearchSummary') {
        this.Search();
      }
      event.preventDefault();
    }
  }

  //  On change value of SSN/EIN dropdown
  public changeValue(masktype): void {
    if (masktype === 'SSN') {
      this.mask = '999-99-9999';
      this.masktype = 'SSN';
    } else if (masktype === 'EIN') {
      this.mask = '99-9999999';
      this.masktype = 'EIN';
    }else if(masktype == 'submissionId'){
      this.masktype = 'submissionId';
    }
    this.quickReturnSummaryForm.get('ssnorein').setValue('');
    this.ssnorein = this.returnSummaryService.quickSummary = undefined;
    this.quickSummary = {};
    this.ssnoreinSearch = this.returnSummaryService.quickSummary = undefined;
    this.quickSummaryWithSearch = {};
    this.message = 'Enter valid ' + this.masktype + ' to get quick return summary on it.';
  }

  //  call quick Return Summary service for get Rejection
  public getRejection(): void {
    const self = this;
    this.returnSummaryService.getRejection(this.quickSummary.id)
      .then((response: any) => {
        // initally just blank error list
        const rejectionError: any = [];
        if (response && response.length !== 0) {
          response.forEach(function (rejection: any): void {
            rejection.errorList.forEach(function (error: any): void {
              const object: any = {};
              object.errorCategory = error.errorCategory;
              object.ruleNumber = error.ruleNumber;
              object.severity = error.severity;
              object.errorMessage = error.errorMessage;
              object.dataValue = error.dataValue;
              object.stateName = rejection.stateName.toUpperCase();
              rejectionError.push(object);
            });
          });
          self.dialogService.custom(RejectionsComponent, { 'data': rejectionError }, { keyboard: true, backdrop: true, size: 'lg' })
            .result.then(function (btn: any): void {
            }, function (btn: any): void {
            });

        } else {
          const dialogData = { title: 'Attention', text: 'No error found' };
          this.dialogService.notify(dialogData, {}).result.then(function (btn: any): void {
          }, function (btn: any): void {
          });
        }
      });
  }

  //  downloadReturn User Return
  public downloadReturn(): void {
    this.returnSummaryService.downloadReturnDetails();
  };

  //  call quick Return Summary service for get Bank Rejection
  public getBankRejection(): void {
    const self = this;
    this.returnSummaryService.getBankRejection(this.quickSummary.id)
      .then(function (response: any): void {
        if (response && response.length !== 0) {
          self.dialogService.custom(BankRejectionsComponent, { 'data': response }, { keyboard: true, backdrop: true, size: 'lg' })
            .result.then(function (res: any): void {
            }, function (err: any): void {
            });
        } else {
          const dialogData = { title: 'Attention', text: 'No error found' };
          self.dialogService.notify(dialogData, {}).result.then(function (btn: any): void {
          }, function (btn: any): void {
          });
        }
      });
  }


  public getLocation() {
    this.returnSummaryService.getLocation(this.quickReturnSummaryForm.controls.customerNumber.value).then((response: any) => {
      if (response == undefined || response == null || (response !== undefined && response.length == 0)) {
        this.isLoctionError = true;
        this.locationIds = [];
      } else {
        // this.locationIds = response;
        this.locationIds = [];
        for (const obj of response) {
          this.locationIds.push({ id: obj.locationId, name: obj.name + ' ' + '(' + obj.locationId + ')', isMasterLocation: obj.isMasterLocation });
        }
        let index = this.locationIds.findIndex(obj => obj.isMasterLocation === true);
        this.quickReturnSummaryForm.controls.LocationId.setValue(this.locationIds[index].id);
        this.isLoctionError = false;
        this.cdrService.callDetectChanges(this.cdr);
      }

    })
  }

  public getLocationForClientPortal() {
    let Json = {
      'customerNumber': this.customerNumberForCP
    }
    this.returnSummaryService.getLocation(Json).then((response: any) => {
      if (response == undefined || response == null || (response !== undefined && response.length == 0)) {
        this.isLoctionErrorForCP = true;
        this.locationIdsForCP = [];
      } else {
        this.locationIdsForCP = [];
        for (const obj of response) {
          this.locationIdsForCP.push({ id: obj.locationId, name: obj.name + ' ' + '(' + obj.locationId + ')', isMasterLocation: obj.isMasterLocation });
        }
        let index = this.locationIdsForCP.findIndex(obj => obj.isMasterLocation === true);
        this.LocationIdForCP = this.locationIdsForCP[index].id;
        this.isLoctionErrorForCP = false;
        this.cdrService.callDetectChanges(this.cdr);
      }
    })
  }

  // call on click of any page buttons
  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    // set pages
    this.pager = this.returnSummaryService.getPager(this.returnSummaryService.matchedIds.length, page);
    this.matchedIdLength = this.returnSummaryService.matchedIds.length;

    this.isDataLoading = true;
    if (this.returnSummaryService.matchedIds.length > 0 && page !== undefined) {
      this.getRetunData(page);
    } else {
      this.isDataLoading = false;
      this.quickSummary = {};
      this.message = this.returnSummaryService.message;
      this.cdrService.callDetectChanges(this.cdr);
    }
  }

  public getRetunData(page?: any) {
    this.returnSummaryService.getRetunData(this.quickReturnSummaryForm.controls.ssnorein.value, this.completeSummmaryMapping, this.quickReturnSummaryForm.controls.maskType.value, page)
      .then((res: any) => {
        this.quickSummary = this.returnSummaryService.quickSummary;
        this.quickSummary.id = this.returnSummaryService.retunId;
        this.message = this.returnSummaryService.message;
        this.isDataLoading = false;
        this.cdrService.callDetectChanges(this.cdr);
        // As when the return is found isReturnFound letiable is toggle to true do as service doesn't get refresh every time so
        // it is neccessary to toggle it back to false if not done than certain functionality will stop working
        if (this.returnSummaryService.isReturnFound === true) {
          this.returnSummaryService.isReturnFound = false;
        }
      });
  }

  // call service for api call and get reponse in formated data
  Search(): void {
    this.returnSummaryService.quickSummary = undefined;
    this.isDataLoading = true;
    this.returnSummaryService.getQuickReturnSearchSummary(this.quickReturnSummaryForm.controls.ssnorein.value, this.quickReturnSummaryForm.controls.taxYear.value, this.completeSummmaryMapping)
      .then((res: any) => {
        this.quickSummaryWithSearch = this.returnSummaryService.quickSummary;
        this.isDataLoading = false;
        this.cdrService.callDetectChanges(this.cdr);
        if (this.selectedTabName === 'Return Search') {
          if (this.quickSummaryWithSearch) {
            this.messageSearch = '';
          }
          else if (this.quickSummaryWithSearch === undefined) {
            this.messageSearch = 'We did not find any information about ' + this.quickReturnSummaryForm.controls.maskType.value + ' you provided.';
          }
        }
      });
  }


  // function for tab change 
  public tabChanged(changedTab: any): void {
    if (changedTab !== undefined) {
      this.selectedTabName = changedTab;
      if (this.selectedTabName === 'Return Search') {
        if (this.quickSummaryWithSearch === undefined) {
          this.messageSearch = 'We did not find any information about ' + this.quickReturnSummaryForm.controls.maskType.value + ' you provided.';
        }
        else if (Object.keys(this.quickSummaryWithSearch).length > 0) {
          this.messageSearch = '';
        } else {
          this.messageSearch = 'Enter valid ' + this.quickReturnSummaryForm.controls.maskType.value + ' to get quick return summary on it.';
        }
      }
    }
  }
      /*
     *  Key press event
     *  If enter is press then we will call getReturnStummary function
     */
    public keyPress(event: any, type: any): void {
      //  13 is key code for 'enter' key
      if (event.keyCode === 13) {
          if (type === 'getSummary') {

              this.getReturnStummary();

          } else if (type === 'getSearchSummary') {
              this.Search();
          }
          event.preventDefault();
      }
  };

  ngOnInit() {
    let userDetails = this.userService.getUserDetail();
    this.userId = userDetails.id;
    this.message = 'Enter valid ' + this.masktype + ' to get quick return summary on it.';
    this.showLoading = true;
    this.initQuickReturnSummaryForm();
  }
  ngOnDestroy() {
    this.localStorageUtilityService.removeFromLocalStorage('taxYear');
    this.localStorageUtilityService.removeFromLocalStorage('locationId');

  }

}
