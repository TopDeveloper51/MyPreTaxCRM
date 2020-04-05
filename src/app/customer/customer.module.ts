// External Imports
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Md2Module, NoConflictStyleCompatibilityMode } from 'angular-md2';
import { DialogsModule } from '@progress/kendo-angular-dialog';

// Internal Imports
import { SharedModule } from '@app/shared/shared.module';
import { CustomerRoutingModule } from '@app/customer/customer.routing';
import { CustomerSearchComponent } from '@app/customer/customer-search/customer-search.component';
import { CustomerDetailComponent } from '@app/customer/customer-detail/customer-detail.component';
import { CustomerCardEditableComponent } from '@app/customer/components/customer-card-editable/customer-card-editable.component'
import { CustomerCardReadonlyComponent } from '@app/customer/components/customer-card-readonly/customer-card-readonly.component'
import { CustomerActivityComponent } from '@app/customer/customer-activity/customer-activity.component';
import { CustomerContactComponent } from '@app/customer/customer-contact/customer-contact.component';
import { CustomerLoginHistoryComponent } from '@app/customer/customer-login-history/customer-login-history.component';
import { CustomerReviewComponent } from '@app/customer/customer-review/customer-review.component';
import { CustomerWebsiteVisitComponent } from '@app/customer/customer-website-visit/customer-website-visit.component';
import { CustomerReviewDetailComponent } from '@app/customer/dialogs/customer-review-detail/customer-review-detail.component';
import { CustomerMarketingdataComponent } from '@app/customer/customer-marketingdata/customer-marketingdata.component';
import { CustomerBankproductComponent } from '@app/customer/customer-bankproduct/customer-bankproduct.component';
import { CustomerSoftwareUsedComponent } from '@app/customer/customer-softwareUsed/customer-softwareUsed.component';
import { CustomerBankproductEnrollmentStatusComponent } from '@app/customer/customer-bankproduct-enrollment-status/customer-bankproduct-enrollment-status.component';
import { CustomerBankproductHeaderDetailComponent } from '@app/customer/customer-bankproduct-header-detail/customer-bankproduct-header-detail.component';
import { CustomerTicketComponent } from '@app/customer/customer-ticket/customer-ticket.component';
import { CustomerLicenseComponent } from '@app/customer/customer-license/customer-license.component';
import { SoftwareUsedComponent } from '@app/customer/dialogs/software-used/software-used.component';
import { CustomerLicenseInformationComponent } from '@app/customer/dialogs/customer-license-information/customer-license-information.component';
import { CustomerLicenseRenewalAlertComponent } from '@app/customer/dialogs/customer-license-renewal-alert/customer-license-renewal-alert.component';
import { CustomerLedgerComponent } from '@app/customer/customer-ledger/customer-ledger.component';
import { CustomerPriceGuaranteeComponent } from '@app/customer/customer-price-guarantee/customer-price-guarantee.component';
import { PriceGuaranteeYearHistoryComponent } from '@app/customer/dialogs/price-guarantee-year-history/price-guarantee-year-history.component';
import { CustomerContactDetailComponent } from '@app/customer/dialogs/customer-contactDetail/customer-contactDetail.component';
import { CustomerHeaderDetailComponent } from '@app/customer/components/customer-header-detail/customer-header-detail.component';
import { CustomerHistoryComponent } from '@app/customer/dialogs/customer-history/customer-history.component';
import { CustomerAddressComponent } from '@app/customer/dialogs/customer-address/customer-address.component';
import { CustomerSoftwareCommitmentBPComponent } from '@app/customer/components/customer-software-commitment-bp/customer-software-commitment-bp.component';
import { CustomerCertificatesComponent } from '@app/customer/components/customer-certificates/customer-certificates.component';
import { CustomerCouponComponent } from '@app/customer/customer-coupon/customer-coupon.component';
import { CustomerCouponDialogComponent } from '@app/customer/dialogs/customer-coupon-dialog/customer-coupon-dialog.component';
import { BankproductHistoryComponent } from '@app/customer/dialogs/bankproduct-history/bankproduct-history.component';
import { CustomerSearchService } from '@app/customer/customer-search/customer-search.service';
import { ActivityNewComponent } from '@app/activity/dialog/activity-new/activity-new.component';
import { VerifyCustomerComponent } from '@app/customer/dialogs/verify-customer/verify-customer.component';
import { CustomerEfinDetailComponent } from '@app/customer/customer-efin-detail/customer-efin-detail.component';
import { EfinVerificationComponent } from '@app/customer/dialogs/efin-verification/efin-verification.component';
import { EfinLetterUploadComponent } from '@app/customer/dialogs/efin-letter-upload/efin-letter-upload.component';
import { EfinHistoryComponent } from '@app/customer/dialogs/efin-history/efin-history.component';
import { NgxUploaderModule } from 'ngx-uploader';
import { LedgerInlineEditorComponent } from '@app/customer/components/ledger-inline-editor/ledger-inline-editor.component';
import { CustomerService } from "@app/customer/customer.service";
import { CustomerProfileComponent } from '@app/customer/dialogs/customer-profile/customer-profile.component';
import { CustomerProfileJsonDetailComponent } from '@app/customer/dialogs/customer-profile-json-detail/customer-profile-json-detail.component';
import { ProfileInfoComponent } from '@app/customer/dialogs/profile-info/profile-info.component';
import { ProfileCommentComponent } from '@app/customer/dialogs/profile-comment/profile-comment.component';
import { AddOnFeeSummaryComponent } from '@app/customer/dialogs/add-on-fee-summary/add-on-fee-summary.component';
import { CustomerProfileSearchComponent } from '@app/customer/customer-profile-search/customer-profile-search.component';
import { CustomerAccountingDetailComponent } from '@app/customer-accounting/customer-accounting-detail/customer-accounting-detail.component';
import { CustomerAccountingHistoryComponent } from '@app/customer-accounting/dialogs/customer-accounting-history/customer-accounting-history.component';
import { CustomerCardReadonlySearchrowresultComponent } from './components/customer-card-readonly-searchrowresult/customer-card-readonly-searchrowresult.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FormsModule, ReactiveFormsModule,
    CustomerRoutingModule,
    MatDatepickerModule,
    Md2Module, NoConflictStyleCompatibilityMode, DialogsModule,
    NgxUploaderModule,
    AgGridModule.withComponents([LedgerInlineEditorComponent]),
  ],
  declarations: [
    CustomerSearchComponent,
    CustomerDetailComponent,
    CustomerCardEditableComponent,
    CustomerCardReadonlyComponent,
    CustomerActivityComponent,
    CustomerContactComponent,
    CustomerLoginHistoryComponent,
    CustomerReviewComponent,
    CustomerWebsiteVisitComponent,
    CustomerReviewDetailComponent,
    CustomerMarketingdataComponent,
    CustomerBankproductComponent,
    CustomerSoftwareUsedComponent,
    SoftwareUsedComponent,
    CustomerBankproductEnrollmentStatusComponent,
    CustomerBankproductHeaderDetailComponent,
    CustomerTicketComponent,
    CustomerLicenseComponent,
    CustomerLicenseInformationComponent,
    CustomerLicenseRenewalAlertComponent,
    CustomerLedgerComponent,
    CustomerPriceGuaranteeComponent,
    PriceGuaranteeYearHistoryComponent,
    CustomerContactDetailComponent,
    CustomerHeaderDetailComponent,
    CustomerHistoryComponent,
    CustomerAddressComponent,
    CustomerSoftwareCommitmentBPComponent,
    CustomerCertificatesComponent,
    CustomerCouponComponent,
    CustomerCouponDialogComponent,
    BankproductHistoryComponent,
    ActivityNewComponent,
    VerifyCustomerComponent,
    CustomerEfinDetailComponent,
    EfinVerificationComponent,
    EfinLetterUploadComponent,
    EfinHistoryComponent,
    LedgerInlineEditorComponent,
    CustomerProfileComponent,
    CustomerProfileJsonDetailComponent,
    ProfileInfoComponent,
    ProfileCommentComponent,
    AddOnFeeSummaryComponent,
    CustomerProfileSearchComponent,
    CustomerCardReadonlySearchrowresultComponent
  ],
  providers: [CustomerSearchService, CustomerService],
  entryComponents: [CustomerReviewDetailComponent, SoftwareUsedComponent, CustomerLicenseInformationComponent, CustomerLicenseRenewalAlertComponent,
    PriceGuaranteeYearHistoryComponent,
    CustomerContactDetailComponent,
    CustomerHeaderDetailComponent,
    CustomerHistoryComponent,
    CustomerAddressComponent,
    CustomerCouponDialogComponent,
    BankproductHistoryComponent,
    ActivityNewComponent,
    VerifyCustomerComponent,
    EfinVerificationComponent,
    EfinLetterUploadComponent,
    CustomerAccountingDetailComponent,
    CustomerAccountingHistoryComponent,
    EfinHistoryComponent,
    CustomerProfileComponent,
    CustomerProfileJsonDetailComponent,
    ProfileInfoComponent,
    ProfileCommentComponent,
    AddOnFeeSummaryComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]

})
export class CustomerModule { }
