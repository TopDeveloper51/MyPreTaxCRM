// External imports
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder } from '@angular/forms';
import moment from 'moment-timezone';
import * as _ from 'lodash';

// Internal imports
import { CustomerProfileService } from "@app/customer/dialogs/customer-profile/customer-profile.service";
import { CopyToClipboardService } from "@app/shared/services/copy-clipboard.service";
import { DialogService } from "@app/shared/services/dialog.service";
import { CustomerProfileJsonDetailComponent } from '@app/customer/dialogs/customer-profile-json-detail/customer-profile-json-detail.component';
import { ProfileInfoComponent } from '@app/customer/dialogs/profile-info/profile-info.component';
import { ProfileCommentComponent } from '@app/customer/dialogs/profile-comment/profile-comment.component';
import { AddOnFeeSummaryComponent } from '@app/customer/dialogs/add-on-fee-summary/add-on-fee-summary.component';
import { MessageService } from '@app/shared/services/message.service';
@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss']
})
export class CustomerProfileComponent implements OnInit {
  //public variable
  @Input() data;
  public docId: any;
  public orderOverviewData: any = {}; // store order overview data 
  public docStatus: any = { responsible: undefined, status: undefined, clearCase: false, feedbackComments: undefined };
  public showDetails: boolean = false; // show details boolean value
  public preserveDocument: any; // store preserve document
  public customerHeaderInformation: string = ''; // store customer header information
  public commissionInfo: any = []; // store commission information
  public customerInyears: any = []; // store customer in year array value 
  public returnsPerYear: any = []; // store per year array value
  public isDocumentLoaded: boolean = false; // document loaded boolean value
  public ledgerValueData: any = {}; // ledger value data 
  public dropDownObject: any; // store dropdown object
  public customerProfileForm: FormGroup; // form group variable
  public customerID; // store customer id
  public customerDisplayFlagOnLedger:boolean = true;
  // Bar Graph Configurations START
  public svgMaxHeight = 125;
  // Bar Graph Configurations END

  constructor(private model: NgbActiveModal,
    private customerProfileService: CustomerProfileService,
    private copyToClipboardService: CopyToClipboardService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private messageService:MessageService) { }

  /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to customer profile form data
* @memberof CustomerProfileComponent
*/
  private customerProfileFormData() {
    this.customerProfileForm = this.fb.group({
      clearCase: this.fb.control(false),
      responsiblePerson: this.fb.control(undefined),
      status: this.fb.control(undefined)
    });
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to close dialog
* @memberof CustomerProfileComponent
*/
  public closeCustomerProfileDialog() {
    this.model.close(false);
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to show information
* @memberof CustomerProfileComponent
*/
  public showInfo() {
    this.dialogService.custom(ProfileInfoComponent, { 'disableRemove': true }, { keyboard: true, backdrop: 'static', size: 'lg' })
      .result.then((response: any) => {
      });
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to show json data
* @memberof CustomerProfileComponent
*/
  public showJson() {
    this.dialogService.custom(CustomerProfileJsonDetailComponent, { 'data': { 'docId': this.data.data.docId, 'disableRemove': true } }, { keyboard: true, backdrop: 'static', size: 'lg' })
      .result.then((response: any) => {
      });
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to copy customer id
* @memberof CustomerProfileComponent
*/
  public toClipboard() {
    this.copyToClipboardService.copy(this.orderOverviewData.CustomerInfo.customerId);
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to open activity comment  
* @memberof CustomerProfileComponent
*/
  public openActivityComment(): void {
    this.dialogService.custom(ProfileCommentComponent, { 'data': { docId: this.data.data.docId } }, { keyboard: true, backdrop: 'static', size: 'lg' })
      .result.then((response: any) => {

      });
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to add on fees summary
* @memberof CustomerProfileComponent
*/
  public addOnFeeSummary(data?, year?, phase?) {
    let title = 'Add On Fee Summary - ' + year + ' - ' + phase;
    this.dialogService.custom(AddOnFeeSummaryComponent, { 'data': { 'addOnFeeSummary': data, title: title } }, { keyboard: true, backdrop: 'static', size: 'md' })
      .result.then((response: any) => {
        console.log(response);
      });
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to redirect customer id
* @memberof CustomerProfileComponent
*/
  public goToCustomerCart(): void {
    window.open('/#/customer/edit/' + this.orderOverviewData.CustomerInfo.customerId, '_blank');
  };

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to bind dropdown value
* @memberof CustomerProfileComponent
*/
  public getResponsiblePersonList() {
    this.customerProfileService.getLookupForResponsiblePersonList().then((response: any) => {
      this.dropDownObject = response;
    });
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to save data
* @memberof CustomerProfileComponent
*/
  public save(type: any, documents?: any) {
    this.docStatus.id = this.data.data.docId;
    this.docStatus.clearCase = this.customerProfileForm.get('clearCase').value;
    this.docStatus.responsible=this.customerProfileForm.get('responsiblePerson').value;
    this.docStatus.status=this.customerProfileForm.get('status').value;
    let isToUpdate = false;
    if (this.docStatus.clearCase === true) {
      if (this.ledgerValueData.date && this.ledgerValueData.package && this.ledgerValueData.amount && this.ledgerValueData.saved) {
        isToUpdate = true;
      } else {
        isToUpdate = false;
      }
    } else {
      isToUpdate = true;
    }
    if (isToUpdate) {
      this.customerProfileService.saveCustomerProfile(this.docStatus).then((response: any) => {
        this.preserveDocument = JSON.parse(JSON.stringify(this.docStatus));
      });
    }
    else
    {
      this.messageService.showMessage('Price Guarantee is Required for Clear Case', 'error');
      this.docStatus.clearCase = undefined;
    }
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to redirect open activity 
* @memberof CustomerProfileComponent
*/
  public openActivity(activityId): void {
    window.open('/#/activity/details/' + activityId, '_blank')
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to config graph data
* @memberof CustomerProfileComponent
*/
  public configGraph(): void {
    if (this.returnsPerYear !== undefined && this.returnsPerYear.length > 0) {
      for (let barGraphData of this.returnsPerYear) {
        // get Max X Label
        if (barGraphData.graphConfig && barGraphData.graphConfig.barData && barGraphData.graphConfig.barData.length > 0) {
          for (let obj of barGraphData.graphConfig.barData) {
            obj['total'] = obj.efiled + obj.created;
          }
          let maxObj = _.maxBy(barGraphData.graphConfig.barData, function (o) { return o.total; });
          barGraphData.graphConfig.maxX = maxObj.total;

          // Configuring Data
          let x = 1;
          for (let obj of barGraphData.graphConfig.barData) {
            // Top Layer Calculation
            obj['xEfiled'] = x;
            obj['total'] = obj.efiled + obj.created;
            if (obj.created == 0) {
              obj['heightEfiled'] = (obj['efiled'] * barGraphData.graphConfig.svgMaxHeight) / barGraphData.graphConfig.maxX;
              obj['yEfiled'] = 125 - obj['heightEfiled'];

            } else {
              obj['yEfiled'] = 0;
              if (obj.efiled == 0) {
                obj['heightEfiled'] = 0;
              } else if (obj.efiled != 0) {
                obj['heightEfiled'] = (obj['efiled'] * barGraphData.graphConfig.svgMaxHeight) / barGraphData.graphConfig.maxX;
              }
            }


            // Lower Layer Calculation
            obj['xCreated'] = x;
            if (obj.created == 0) {
              obj['yCreated'] = 0;
              obj['heightCreated'] = 0;
            } else if (obj.efiled == 0) {
              obj['heightCreated'] = (obj['created'] * barGraphData.graphConfig.svgMaxHeight) / barGraphData.graphConfig.maxX;
              obj['yCreated'] = barGraphData.graphConfig.svgMaxHeight - obj['heightCreated'];
            } else if (obj.efiled != 0) {
              obj['heightCreated'] = (obj['created'] * barGraphData.graphConfig.svgMaxHeight) / barGraphData.graphConfig.maxX;
              obj['yCreated'] = barGraphData.graphConfig.svgMaxHeight - obj['heightCreated'];

            }

            // Total < Max
            if (obj['total'] < barGraphData.graphConfig.maxX && obj.created != 0 && obj.efiled != 0) {
              obj['yEfiled'] = (barGraphData.graphConfig.svgMaxHeight - obj['heightEfiled']) - obj['heightCreated'];
            }

            // Calculation
            x += 3;
          }
        } else {
          barGraphData.graphConfig.barData = [];
        }
      }
    }
    // this._cdrService.callDetectChanges(this.cdr);
  }

 /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used to get document by id
* @memberof CustomerProfileComponent
*/
  public getDocument(docId) {
    this.isDocumentLoaded = false;
    let docIdReqParam = { 'docId': docId };
    this.customerProfileService.getDocumentById(docIdReqParam).then((response: any) => {
      this.isDocumentLoaded = true;
      this.orderOverviewData = response;
      if (this.orderOverviewData.customerProfile) {
        this.docStatus.responsible = this.orderOverviewData.customerProfile.responsible;
        this.customerProfileForm.get('responsiblePerson').setValue(this.docStatus.responsible);
        this.docStatus.status = this.orderOverviewData.customerProfile.status;
        this.customerProfileForm.get('status').setValue(this.docStatus.status);
        this.docStatus.clearCase = this.orderOverviewData.customerProfile.clearCase;
        this.customerProfileForm.get('clearCase').setValue(this.docStatus.clearCase);
        this.docStatus.feedbackComments = this.orderOverviewData.customerProfile.commentData;
        if (this.orderOverviewData.customerProfile.updatedDate != undefined && this.orderOverviewData.customerProfile.updatedDate != null) {
          this.orderOverviewData.customerProfile.updatedDate = moment(this.orderOverviewData.customerProfile.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
        }

        if (this.orderOverviewData.customerProfile.clearCaseCreatedDate != undefined && this.orderOverviewData.customerProfile.clearCaseCreatedDate != null) {
          this.orderOverviewData.customerProfile.clearCaseCreatedDate = moment(this.orderOverviewData.customerProfile.clearCaseCreatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
        }

        if (this.orderOverviewData.customerProfile.clearCaseDeletedDate != undefined && this.orderOverviewData.customerProfile.clearCaseDeletedDate != null) {
          this.orderOverviewData.customerProfile.clearCaseDeletedDate = moment(this.orderOverviewData.customerProfile.clearCaseDeletedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
        }

      } else {
        this.orderOverviewData.customerProfile = {};
        this.docStatus = { responsible: undefined, status: undefined, clearCase: false, feedbackComments: undefined };
      }

      if (this.orderOverviewData.AddOnFeeAccounting) {
        if (this.orderOverviewData.AddOnFeeAccounting[2017] !== undefined && this.orderOverviewData.AddOnFeeAccounting[2017] !== null) {
          if (this.orderOverviewData.AddOnFeeAccounting[2017].phase1 !== undefined && this.orderOverviewData.AddOnFeeAccounting[2017].phase1 !== null) {
            this.showDetails = true;
            if (this.orderOverviewData.AddOnFeeAccounting[2017].phase1.category != undefined && this.orderOverviewData.AddOnFeeAccounting[2017].phase1.category != null) {
              this.docStatus.addOnAcctCategory = this.orderOverviewData.AddOnFeeAccounting[2017].phase1.category;
            } else {
              this.docStatus.addOnAcctCategory = undefined;
            }

            if (this.orderOverviewData.AddOnFeeAccounting[2017].phase1.status != undefined && this.orderOverviewData.AddOnFeeAccounting[2017].phase1.status != null) {
              this.docStatus.addOnAcctStatus = this.orderOverviewData.AddOnFeeAccounting[2017].phase1.status;
            } else {
              this.docStatus.addOnAcctStatus = undefined;
            }

            if (this.orderOverviewData.AddOnFeeAccounting[2017].phase1.checkSentAmount != undefined && this.orderOverviewData.AddOnFeeAccounting[2017].phase1.checkSentAmount != null) {
              this.docStatus.checkSentAmount = this.orderOverviewData.AddOnFeeAccounting[2017].phase1.checkSentAmount;
            } else {
              this.docStatus.checkSentAmount = undefined;
            }
          } else {
            this.showDetails = false;
          }
        } else {
          this.showDetails = false;
        }
      } else {
        this.showDetails = false;
      }

      this.preserveDocument = JSON.parse(JSON.stringify(this.docStatus));

      if (this.orderOverviewData.CustomerInfo) {
        if (this.orderOverviewData.CustomerInfo.customerName) {
          this.customerHeaderInformation += this.orderOverviewData.CustomerInfo.customerName;
        }

        if (this.orderOverviewData.CustomerInfo.state) {
          this.customerHeaderInformation += ', ' + this.orderOverviewData.CustomerInfo.state;
        }

        if (this.orderOverviewData.CustomerInfo.customerNumber) {
          this.customerHeaderInformation += ', ' + this.orderOverviewData.CustomerInfo.customerNumber;
        }


        if (this.orderOverviewData.CustomerInfo.resellerName) {
          this.customerHeaderInformation += ' ( ' + this.orderOverviewData.CustomerInfo.resellerName + ' )';
        }


        if (this.orderOverviewData) {
          this.orderOverviewData.LedgerInfo = {};
        }


        this.orderOverviewData.LedgerInfo.customerId = this.orderOverviewData.CustomerInfo.customerId;
        this.orderOverviewData.LedgerInfo.customerNumber = this.orderOverviewData.CustomerInfo.customerNumber;
        this.orderOverviewData.LedgerInfo.paymentAgreedDetails = { 'agreedPaymentCollectionDate': this.orderOverviewData.CustomerInfo.agreedPaymentCollectionDate, 'paymentDue': this.orderOverviewData.CustomerInfo.paymentDue, 'totalPayment': this.orderOverviewData.CustomerInfo.totalPayment }
        this.orderOverviewData.LedgerInfo.masterLocationId = this.orderOverviewData.CustomerInfo.masterLocationId;
        this.orderOverviewData.LedgerInfo.onlyDisplay=true;
        if (this.orderOverviewData.CertificateInfo !== undefined && this.orderOverviewData.CertificateInfo.priceGuarantee !== undefined) {
          this.orderOverviewData.LedgerInfo.priceGuarantee = this.orderOverviewData.CertificateInfo.priceGuarantee;
        } else {
          this.orderOverviewData.LedgerInfo.priceGuarantee = {};
        }
        // this.originalLedgerDetails.priceGuarantee = JSON.parse(JSON.stringify(this.orderOverviewData.LedgerInfo.priceGuarantee));

        if (this.orderOverviewData.CertificateInfo !== undefined && this.orderOverviewData.CertificateInfo.certificateDetails !== undefined) {
          this.orderOverviewData.LedgerInfo.certificateDetails = this.orderOverviewData.CertificateInfo.certificateDetails;
        } else {
          this.orderOverviewData.LedgerInfo.certificateDetails = undefined;
        }

        if (this.orderOverviewData.CertificateInfo !== undefined && this.orderOverviewData.CertificateInfo.priceGuaranteePerYear !== undefined) {
          this.orderOverviewData.LedgerInfo.priceGuaranteePerYear = this.orderOverviewData.CertificateInfo.priceGuaranteePerYear;
        } else {
          this.orderOverviewData.LedgerInfo.priceGuaranteePerYear = {};
        }

        this.orderOverviewData.LedgerInfo.priceGuaranteeDetailsPerYear = []
        let noPGPerYearData = false;
        if (this.orderOverviewData.LedgerInfo.priceGuaranteePerYear != undefined) {
          if (Object.keys(this.orderOverviewData.LedgerInfo.priceGuaranteePerYear).length > 0) {
            for (const obj of Object.keys(this.orderOverviewData.LedgerInfo.priceGuaranteePerYear)) {
              if (this.orderOverviewData.LedgerInfo.priceGuaranteePerYear[obj].addOnFeeAccounting && (Object.keys(this.orderOverviewData.LedgerInfo.priceGuaranteePerYear[obj].addOnFeeAccounting).length > 1 || Object.keys(this.orderOverviewData.LedgerInfo.priceGuaranteePerYear[obj].addOnFeeAccounting["checkToSendAddress"]).length > 0)) {
                this.orderOverviewData.LedgerInfo.priceGuaranteePerYear[obj].isAddOnfeeAccounting = true;
              } else {
                this.orderOverviewData.LedgerInfo.priceGuaranteePerYear[obj].isAddOnfeeAccounting = false;
              }
              this.orderOverviewData.LedgerInfo.priceGuaranteePerYear[obj].isAlreadyExisting = true;
              this.orderOverviewData.LedgerInfo.priceGuaranteeDetailsPerYear.push({ 'year': obj, 'yearlyData': this.orderOverviewData.LedgerInfo.priceGuaranteePerYear[obj] });
            }
          } else {
            noPGPerYearData = true;
          }
        } else {
          noPGPerYearData = true;
        }
        if (noPGPerYearData) {
          let currentYear = moment().format('YYYY');
          this.orderOverviewData.LedgerInfo.priceGuaranteeDetailsPerYear.push({ 'year': currentYear, 'yearlyData': { isEnabled: false, addOnFeeAccounting: { checkToSendAddress: {} } } });
        }

        // this.originalLedgerDetails.priceGuaranteeDetailsPerYear = JSON.parse(JSON.stringify(this.orderOverviewData.LedgerInfo.priceGuaranteeDetailsPerYear));

        if (this.orderOverviewData.CertificateInfo !== undefined && this.orderOverviewData.CertificateInfo.payPerReturn !== undefined && this.orderOverviewData.CertificateInfo.payPerReturn.length > 0) {
          this.orderOverviewData.LedgerInfo.payPerReturn = this.orderOverviewData.CertificateInfo.payPerReturn;
        } else {
          this.orderOverviewData.LedgerInfo.payPerReturn = [];
        }
        // this.originalLedgerDetails.payPerReturn = JSON.parse(JSON.stringify(this.orderOverviewData.LedgerInfo.payPerReturn));
      }

      if (this.orderOverviewData.ActivityInfo) {
        this.commissionInfo = [];
        for (const obj of this.orderOverviewData.ActivityInfo) {
          if (obj.orderDetails != undefined && obj.orderDetails != null && Object.keys(obj.orderDetails).length > 0) {
            if (obj.orderDetails.orderPrice >= 0) {
              obj.orderDetails.tagName = 'O';
            } else {
              obj.orderDetails.tagName = 'RR';
            }
            obj.orderDetails.activityDocId = obj.activityDocId;
            this.commissionInfo.push(obj.orderDetails);
          }
        }
      }

      if (this.orderOverviewData.customerInYears) {
        this.customerInyears = [];
        for (const obj of this.orderOverviewData.customerInYears) {
          obj.addOnFeePhase1 = obj.addOnFeePhase1 ? obj.addOnFeePhase1.toFixed(2) : 0;
          obj.addOnFeePhase2 = obj.addOnFeePhase2 ? obj.addOnFeePhase2.toFixed(2) : 0;
          obj.mayTitle = '';
          if (obj.addOnFeephase1Details) {
            for (const bankData of obj.addOnFeephase1Details) {
              for (const bankDetails of bankData.bankDetails) {
                if (!bankDetails.addOnTransFee85Per) {
                  bankDetails.addOnTransFee85Per = 0;
                }
                if (!bankDetails.fundedBPWithAddOnFee) {
                  bankDetails.fundedBPWithAddOnFee = 0;
                }
                obj.mayTitle += bankDetails.bank + ': ' + bankDetails.addOnTransFee85Per + '\n';
              }
            }
          }
          obj.octTitle = '';
          if (obj.addOnFeephase2Details) {
            for (const bankData of obj.addOnFeephase2Details) {
              for (const bankDetails of bankData.bankDetails) {
                let amt = bankDetails.addOnTransFee85Per.toFixed(2);
                bankDetails.addOnTransFee85Per = bankDetails.addOnTransFee85Per.toFixed(2);
                bankDetails.fundedBPWithAddOnFee = bankDetails.fundedBPWithAddOnFee.toFixed(2);
                obj.octTitle += bankDetails.bank + ': ' + amt + '\n';
              }
            }
          }
          this.customerInyears.push(obj);
        }
      }

      if (this.orderOverviewData.returnsPerUsageData) {
        this.returnsPerYear = [];
        for (const obj of this.orderOverviewData.returnsPerUsageData) {
          this.returnsPerYear.push(obj);
        }
        this.returnsPerYear = _.orderBy(this.returnsPerYear, ['year'], ['desc']);
      }

      // BAR GRAPHS START
      if (this.orderOverviewData.EfileDataForGraph) {
        for (let obj of this.returnsPerYear) {
          let isExists = false;
          for (let year in this.orderOverviewData.EfileDataForGraph) {
            if (obj.year === year) {
              obj.graphConfig = {
                minX: 0,
                maxX: 0,
                svgMaxHeight: this.svgMaxHeight,
                barData: (this.orderOverviewData.EfileDataForGraph && this.orderOverviewData.EfileDataForGraph[year]) ? this.orderOverviewData.EfileDataForGraph[year] : []
              }
              isExists = true;
            }
          }

          if (!isExists) {
            obj.graphConfig = {
              minX: 0,
              maxX: 0,
              svgMaxHeight: this.svgMaxHeight,
              barData: []
            };
          }
        }
      } else {
        for (let obj of this.returnsPerYear) {
          obj.graphConfig = {
            minX: 0,
            maxX: 0,
            svgMaxHeight: this.svgMaxHeight,
            barData: []
          };
        }
      }
      // BAR GRAPHS END
      this.configGraph();
    }, (error) => {
      console.log(error);
      this.isDocumentLoaded = true;
    });
  }

  ngOnInit() {
    this.getDocument(this.data.data.docId);
    this.customerID = this.data.data.docId;
    this.getResponsiblePersonList();
    this.customerProfileFormData();
  }

}
