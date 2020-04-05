// External Import
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

// Internal Import
import { environment } from '@environments/environment';
import { APINAME } from '@app/return-summary/return-summary-constants';
import { CommonApiService } from '@app/shared/services';
import { resolve } from 'path';
import { reject } from 'q';
import { promise } from 'protractor';

declare var document: any;
declare var localStorage: any;

@Injectable({
  providedIn: 'root'
})
export class ReturnSummaryService {

  quickSummary: any;
  // Is true when the return is found from the data obtained from API else it will be false and error message is show of provided ssn not found
  // service used to display message to user
  // letiable used to store the message according to the status of return found or not
  message: string = 'Enter valid SSN to get quick return summary on it.';
  // state list array
  StateArray: any = ['ca', 'az', 'ga', 'oh', 'co', 'al', 'mi', 'nc', 'md', 'ar', 'dc', 'ct', 'hi', 'ia', 'id', 'il', 'in', 'ks', 'la', 'me', 'mo', 'nd', 'ne', 'de'];
  retunId: any;
  returnDetails: any;
  isReturnFound: boolean = false;
  matchedIds = [];

  constructor(private commonApiService: CommonApiService) { }

  // api call to open efile base on efile id
  public openEFile(eFileId: string): any {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_EFIE_OPEN, parameterObject: { 'eFileId': eFileId } }).then((response) => {
        const body = response;
        if (body !== undefined ) {
          const pom = document.createElement('a');
          pom.setAttribute('href', 'data:Application/xml;charset=utf-8,' + encodeURIComponent(body));
          pom.setAttribute('download', eFileId + '.xml');
          //  Append anchor to body.
          document.body.appendChild(pom);
          pom.click();
          //  Remove anchor from body
          document.body.removeChild(pom);
          // window.open('data:application/xml;charset=utf-8,' + encodeURIComponent(response.data.data));
        }
        resolve(body);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getReturnList(limit?: any) {
    let returnList: any = [];
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_RETURN_LIST, parameterObject: {}, methodType: 'post' }).then((response) => {
        const body = response;
        //  API return data in Different format, we need to format data in defined structure.
        response.forEach((returnData: any)=> {
          //  Package name list.We use this because we only need first package name after removing 'common' name.
          if (returnData && Object.keys(returnData).length > 0) {
            // Get pacakge name other then 'common'
            const _packageName = _.without(returnData.packageNames, 'common')[0];

            //  Flag is used to check whether return is opened by current user or not.
            const isCheckedOut = returnData.isCheckedOut;

            //  For More return type we need to write conditions here
            let taxPayerName = '';
            let ssnOrEinFull = undefined;
            let ssnOrEin = undefined;
            //  We have to check undefined condition separately other wise last name overrides everything.
            if (_packageName === '1040') {
              const taxpayerFirstName = returnData.client.firstName === undefined ? '' : returnData.client.firstName;
              const taxpayerLastName = returnData.client.lastName === undefined ? '' : returnData.client.lastName;
              taxPayerName = taxpayerFirstName + ' ' + taxpayerLastName;
              ssnOrEinFull = returnData.client.ssn;
              if (ssnOrEinFull !== undefined) {
                ssnOrEin = ssnOrEinFull.substring(7);
              }
            } else if (_packageName === '1065' || _packageName === '1120' || _packageName === '1120s') {
              taxPayerName = returnData.client.companyName;
              ssnOrEinFull = returnData.client.ein;
              if (ssnOrEinFull !== undefined) {
                ssnOrEin = ssnOrEinFull.substring(6);
              }
            }

            //  Return list structure.
            const returnDetail = {
              checkedOutBy: returnData.checkedOutBy,
              email: returnData.email,
              id: returnData.id,
              isLocked: returnData.isLocked === undefined ? false : returnData.isLocked,
              isCheckedOut: isCheckedOut === undefined ? false : isCheckedOut,
              isConvertedReturn: returnData.isConvertedReturn === undefined ? false : returnData.isConvertedReturn,
              ssnOrEinFull: ssnOrEinFull,
              ssnOrEin: ssnOrEin,
              status: returnData.status,
              taxPayerName: taxPayerName,
              type: _packageName,
              year: returnData.year,
              updatedDate: returnData.updatedDate === undefined ? '2014-01-01T00:00:00+00:00' : returnData.updatedDate,
              eFileStatus: returnData.eFileStatus,
              homeTelephone: returnData.client.homeTelephone
            };

            returnList.push(returnDetail);
          }
        });

        //   Sort return list from updatedDate
        //  here function sort by only sorting in ascending order so we reverse entire list after sorting
        returnList = _.sortBy(returnList, 'updatedDate').reverse();

        // If limit is passed, we have to send only that number of records
        if (limit !== undefined && returnList.length > limit) {
          const limitedReturnList = [];
          for (let i = 0; i <= limit; i++) {
            limitedReturnList.push(returnList[i]);
          }
        }
        resolve(response);
      }, (error) => {
        reject(error);

      });
    });
  }

  public getQuickReturnSummary(returnId: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_RETURN_SUMMARY, parameterObject: { 'returnId': returnId } }).then((response) => {
        const body = response;
        this.returnDetails = body;
        resolve(body);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getQuickReturnSearchSummary(ssnorein: string, taxYear: string, SummaryMapping: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.SUPPORT_SEARCH, parameterObject:
        {
          'ssnorein': ssnorein,
          'taxYear': taxYear
        }
      }).then((response) => {
        const body = response;
        if (Object.keys(body).length > 0) {
          this.processFormatData(response, SummaryMapping);
        }
        resolve(body);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getEfileHistory(returnId: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_RETURN_HISTORY, parameterObject: { 'returnId': returnId } }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getRejection(returnId: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_EFILE_REJECTION, parameterObject: { 'returnId': returnId } }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  //  Download Return
  public downloadReturnDetails(): any {
    const pom = document.createElement('a');
    pom.setAttribute('href', 'data:Application/json;charset=utf-8,' + JSON.stringify(this.returnDetails));
    let ssnOrEIN = '';

    if (this.returnDetails.header.client.ssn) {
      ssnOrEIN = this.returnDetails.header.client.ssn;
    } else if (this.returnDetails.header.client.ein) {
      ssnOrEIN = this.returnDetails.header.client.ein;
    }

    pom.setAttribute('download', ssnOrEIN + '.json');
    //  Append anchor to body.
    document.body.appendChild(pom);
    pom.click();
    //  Remove anchor from body
    document.body.removeChild(pom);
  }

  // get Return summary
  public getQuickReturnSummarys(ssnorein: string, type: string) {
    return new Promise((resolve, reject) => {
      this.matchedIds = [];
      let matchedReturns = [];
      ssnorein = ssnorein;
      this.isReturnFound = false;
      // Get return list data, if not available in cache then get data from API
      const self = this;
      const stream = this.getReturnList().then((response: any) => {
        response.forEach(function (returnDetail: any): any {
          //  Check whether given ssn exists or not
          if ((returnDetail.client.ssn === ssnorein || returnDetail.client.ein === ssnorein || (returnDetail && returnDetail.eFileStatus && returnDetail.eFileStatus.federal && returnDetail.eFileStatus.federal.submissionId === ssnorein))) {
            self.isReturnFound = true;
            //  IF ssn exists then get appropriate returnid and get summary of that return
            self.retunId = returnDetail.id;
            matchedReturns.push(returnDetail);
            self.matchedIds.push(returnDetail.id);
          }
        });
        if (!this.isReturnFound) {
          const quickSummary: any = {};
          self.message = 'We did not find any information about ' + type + ' you provided.';
        }

        resolve(response);
      }, (error) => {
        reject(error);
      });
      return stream;
    });
  }

  public getLocation(customerNumber?: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOCATION, parameterObject: { customerNumber } }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getBankRejection(returnId?: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BANK_REJECTION, parameterObject: { returnId } }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public resendMail(apiParam: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.RESEND_EMAIL_TO_CLIENT, parameterObject: { apiParam } }).then((response) => {
        const body = response;
        this.returnDetails = body;
        resolve(body);
      }, (error) => {
        reject(error);
      });
    });
  }


  processFormatData(response: any, SummaryMapping?: any) {
    const returnInfo: any = {};
    const taxPayer: any = {};
    const spouse: any = {};
    const preparer: any = {};
    const bank: any = {};
    const income: any = {};
    const credit: any = {};
    const tax: any = {};
    const payment: any = {};
    let eFile: any;
    const partnership: any = {};
    const eFileStateDetails: any = [];
    const stateDetails: any = [];
    let packageName: string = '';
    let infoOfCustomer: any = {};
    const self = this;
    let formName, elementName, usrObject, setKeyObject: any, setKeyElement, reqForm, reqElement, mainForm, activeForm;
    let clientMainForm;
    let data = response;

    if (data !== undefined && data !== '') {
      // assign efile info
      if (data.eFile !== undefined) {
        const EfileKeys = Object.keys(data.eFile);
        EfileKeys.forEach(function (EfileState: any): void {
          if (EfileState === 'federal') {
            eFile = data.eFile[EfileState];
          } else {
            eFileStateDetails.push(data.eFile[EfileState]);
          }
        });

      }
      // to get customer information data from response
      if (data.customerInfo !== undefined) {
        infoOfCustomer = JSON.stringify(data.customerInfo);
      }
      // letiable for the doc index of independent form and dependent form from the complete return
      let mainDocIndex, reqDocIndex;

      // use pluck here
      for (let countForm = 0; countForm < data['forms'].length; countForm++) {
        if (data['forms'][countForm]['docName'] === 'dMainInfo') {
          mainDocIndex = data['forms'][countForm]['docIndex'];
          break;
        } else if (data['forms'][countForm]['docName'] === 'd1065CIS') {
          mainDocIndex = data['forms'][countForm]['docIndex'];
          break;
        }
      }

      //  obtains the clients main form from the response of API
      if (data['docs']['dMainInfo']) {
        if (data['docs']['dMainInfo'][mainDocIndex]['strform']) {
          if (data['docs']['dMainInfo'][mainDocIndex]['strform']['value']) {
            switch (data['docs']['dMainInfo'][mainDocIndex]['strform']['value']) {
              case '1':
                clientMainForm = '1040';
                break;
              case '2':
                clientMainForm = '1040A';
                break;
              case '3':
                clientMainForm = '1040EZ';
                break;
              case '4':
                clientMainForm = '1040NR';
                break;
              case '5':
                clientMainForm = '1040SS(PR)';
                break;
              default:
                clientMainForm = '';
                break;
            }
          }
        }
      }
      if (data['docs']['d1065CIS']) {
        if (data['docs']['d1065CIS'][mainDocIndex]['bln1065'] && data['docs']['d1065CIS'][mainDocIndex]['bln1065']['value']) {
          clientMainForm = '1065';
        } else if (data['docs']['d1065CIS'][mainDocIndex]['bln1065B'] && data['docs']['d1065CIS'][mainDocIndex]['bln1065B']['value']) {
          clientMainForm = '1065B';
        } else if (data['docs']['d1065CIS'][mainDocIndex]['bln7004'] && data['docs']['d1065CIS'][mainDocIndex]['bln7004']['value']) {
          clientMainForm = '7004';
        }
      }
      for (let countData = 0; countData < SummaryMapping.length; countData++) {
        if (SummaryMapping[countData]['get']) {
          formName = SummaryMapping[countData]['get']['form'];
          elementName = SummaryMapping[countData]['get']['getElement'];
        }
        // check whether the required object exists for current mapping
        if (SummaryMapping[countData]['required']) {
          reqForm = SummaryMapping[countData]['required']['form'];
          reqElement = SummaryMapping[countData]['required']['getElement'];
        }
        // is assign if the header section has the object inside it
        usrObject = SummaryMapping[countData]['get']['usrDetail'];
        mainForm = SummaryMapping[countData]['mainForm'];
        setKeyObject = SummaryMapping[countData]['set']['objectName'];
        setKeyElement = SummaryMapping[countData]['set']['property'];
        activeForm = SummaryMapping[countData]['activeForm'];
        if (formName && formName === 'header') {
          if (data[formName] && data[formName][usrObject] && data[formName][usrObject][elementName]) {
            // check which key it belongs to
            if (setKeyObject === 'return') {
              returnInfo[setKeyElement] = data[formName][usrObject][elementName];
            } else if (setKeyObject === 'taxPayer') {
              taxPayer[setKeyElement] = data[formName][usrObject][elementName];
            } else if (setKeyObject === 'partnership') {
              partnership[setKeyElement] = data[formName][usrObject][elementName];
            }

          } else if (data[formName] && data[formName][elementName]) {
            if (setKeyObject === 'return') {
              if (elementName === 'packageNames') {
                // use Lodash without here (same as used in return service)
                for (let countPackage = 0; countPackage < data[formName][elementName].length; countPackage++) {
                  if (data[formName][elementName][countPackage] !== 'common') {
                    returnInfo[setKeyElement] = packageName = data[formName][elementName][countPackage];
                    break;
                  }
                }
              } else {
                returnInfo[setKeyElement] = data[formName][elementName];
              }
            } else if (setKeyObject === 'taxPayer') {
              taxPayer[setKeyElement] = data[formName][elementName];
            }
          } else {
            if (setKeyObject === 'return') {
              returnInfo[setKeyElement] = '';
            } else if (setKeyObject === 'taxPayer') {
              taxPayer[setKeyElement] = '';
            }
          }
        }
        if (formName && (formName === 'dMainInfo' || formName === 'dReturnInfo' || formName === 'd1065CIS' || formName === 'd1065RIS') && !mainForm) {
          for (let countForm = 0; countForm < data['forms'].length; countForm++) {
            if (data['forms'][countForm]['docName'] === formName) {
              mainDocIndex = data['forms'][countForm]['docIndex'];
              break;
            }
          }
          if (data['docs'][formName] && data['docs'][formName][mainDocIndex][elementName] && data['docs'][formName][mainDocIndex][elementName]['value']) {
            switch (data['docs'][formName][mainDocIndex][elementName]['value']) {
              case '1':
                returnInfo[setKeyElement] = 'Single';
                break;
              case '2':
                returnInfo[setKeyElement] = 'Married filing jointly';
                break;
              case '3':
                returnInfo[setKeyElement] = 'Married filing separately';
                break;
              case '4':
                returnInfo[setKeyElement] = 'Head of Household';
                break;
              case '5':
                returnInfo[setKeyElement] = 'Qualifying widow(er) with dependent child';
                break;
              default:
                if (setKeyObject === 'return') {
                  returnInfo[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'taxPayer') {
                  taxPayer[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'spouse') {
                  spouse[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'preparer') {
                  preparer[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'bank') {
                  bank[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'partnership') {
                  partnership[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                }
                break;
            }
          }
        } else if (formName && activeForm) { // prepares state details
          for (let countForm = 0; countForm < data['forms'].length; countForm++) {
            if (data['forms'][countForm]['docName'] === formName) {
              mainDocIndex = data['forms'][countForm]['docIndex'];
              break;
            }
          }
          if (data['docs'][formName] && data['docs'][formName][mainDocIndex] && data['docs'][formName][mainDocIndex]['isActive'] && data['docs'][formName][mainDocIndex]['isActive']['value'] === true) {
            if (data['docs'][formName][mainDocIndex][elementName] && data['docs'][formName][mainDocIndex][elementName]['value']) {
              if (this.StateArray.includes(setKeyObject)) {
                let currentIndex = undefined;
                stateDetails.forEach(function (state: any, index: string): void {
                  if (state.stateName.toUpperCase() === setKeyObject.toUpperCase()) {
                    currentIndex = index;
                  }
                });
                if (currentIndex !== null && currentIndex !== undefined) {
                  stateDetails[currentIndex][setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else {
                  const currentObject: any = {};
                  currentObject[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                  currentObject.stateName = setKeyObject.toUpperCase();
                  stateDetails.push(currentObject);
                }
              }
            }
          }
        }
        // statistical mapping
        // checks whether mainform is same as the clientMainForm obtained from API
        if (mainForm && clientMainForm === mainForm) {
          mainDocIndex = '';
          reqDocIndex = '';
          // obtained the index of mainform and required form
          for (let countForm = 0; countForm < data['forms'].length; countForm++) {
            if (mainDocIndex && reqDocIndex && SummaryMapping[countData]['required']) {
              break;
            } else if (mainDocIndex && !SummaryMapping[countData]['required']) {
              break;
            }
            if (data['forms'][countForm]['docName'] === formName) {
              mainDocIndex = data['forms'][countForm]['docIndex'];
            } else if (reqForm && data['forms'][countForm]['docName'] === reqForm) {
              reqDocIndex = data['forms'][countForm]['docIndex'];
            }
          }
          // condition to check whether current mapping has required object
          if (SummaryMapping[countData]['required']) {
            if (data['docs'][reqForm] && data['docs'][reqForm][reqDocIndex][reqElement] && data['docs'][reqForm][reqDocIndex][reqElement]['value']) {
              if (data['docs'][formName] && data['docs'][formName][mainDocIndex][elementName] && data['docs'][formName][mainDocIndex][elementName]['value']) {
                if (setKeyObject === 'income') {
                  income[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'credit') {
                  credit[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'tax') {
                  tax[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'] === '' ? 0 : data['docs'][formName][mainDocIndex][elementName]['value'];
                } else if (setKeyObject === 'payment') {
                  payment[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
                }

              } else {
                if (setKeyObject === 'income') {
                  income[setKeyElement] = 0;
                } else if (setKeyObject === 'credit') {
                  credit[setKeyElement] = 0;
                } else if (setKeyObject === 'tax') {
                  tax[setKeyElement] = 0;
                } else if (setKeyObject === 'payment') {
                  payment[setKeyElement] = 0;
                }
              }
            } else {
              if (setKeyObject === 'income') {
                income[setKeyElement] = 0;
              } else if (setKeyObject === 'credit') {
                credit[setKeyElement] = 0;
              } else if (setKeyObject === 'tax') {
                tax[setKeyElement] = 0;
              } else if (setKeyObject === 'payment') {
                payment[setKeyElement] = 0;
              }
            }
          } else {
            if (data['docs'][formName] && data['docs'][formName][mainDocIndex][elementName] && data['docs'][formName][mainDocIndex][elementName]['value']) {
              if (setKeyObject === 'income') {
                income[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
              } else if (setKeyObject === 'credit') {
                credit[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
              } else if (setKeyObject === 'tax') {
                tax[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
              } else if (setKeyObject === 'payment') {
                payment[setKeyElement] = data['docs'][formName][mainDocIndex][elementName]['value'];
              }

            } else {
              if (setKeyObject === 'income') {
                income[setKeyElement] = 0;
              } else if (setKeyObject === 'credit') {
                credit[setKeyElement] = 0;
              } else if (setKeyObject === 'tax') {
                tax[setKeyElement] = 0;
              } else if (setKeyObject === 'payment') {
                payment[setKeyElement] = 0;
              }
            }
          }
        }
      }
    }
    self.message = '';
    // Entire object is built by inserting the different objects according to the block
    self.quickSummary = {
      id: data.header.id,
      packageName: packageName,
      returnInfoDetail: returnInfo,
      taxPayerDetail: taxPayer,
      spouseDetail: spouse,
      preparerDetail: preparer,
      bankDetail: bank,
      incomeDetail: income,
      creditDetail: credit,
      taxDetail: tax,
      paymentDetail: payment,
      eFileDetail: eFile,
      stateDetails: stateDetails,
      eFileStateDetails: eFileStateDetails,
      partnership: partnership,
      customerInfo: infoOfCustomer,
      efileHistory: data.efileHistory

    };
  }

  public getRetunData(ssnorein: string, SummaryMapping: any, type: string, pageNo?: any) {
    return new Promise((resolve, reject) => {
      // object declared according to the block in quick return summary to store their respective data       
      if (pageNo) {
        this.retunId = this.matchedIds[pageNo - 1];
      }
      this.getQuickReturnSummary(this.retunId)
        .then((response: any) => {
          if (response) {
            this.processFormatData(response, SummaryMapping)
          }
          resolve(response);
        }, (error) => {
          reject(error);
        });
    });
  }

  getPager(totalItems: number, currentPage: number = 1, pageSize: number = 1) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    let startPage: number, endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 1 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = _.range(startPage, endPage + 1);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }
}
//  Other Service For Manage Location and TaxYear
@Injectable()
export class LocationService {

  private locationId: any;
  private taxYear: any;

  public setLocationId(locationID: string): void {
    this.locationId = locationID;
    localStorage.setItem('locationId', JSON.stringify(this.locationId));
  }

  public getLocationId(): string {
    return this.locationId;
  }

  public setTaxYear(TaxYear: string): void {
    this.taxYear = TaxYear;
    localStorage.setItem('taxYear', JSON.stringify(this.taxYear));
  }

  public getTaxYear(): string {
    return this.taxYear;
  }

  public removeTaxYear(TaxYear: string): string {
    return this.taxYear = '';
  }
}

