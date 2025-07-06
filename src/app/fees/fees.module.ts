import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

// PrimeNG Modules
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { ProgressBarModule } from "primeng/progressbar";
import { TooltipModule } from "primeng/tooltip";
import { InputNumberModule } from "primeng/inputnumber";
import { CheckboxModule } from "primeng/checkbox";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { InputTextareaModule } from "primeng/inputtextarea";
import { AccordionModule } from "primeng/accordion";

// Routing
import { FeesRoutingModule } from "./fees-routing.module";

// Components
import { FeeStructureComponent } from "./components/admin/fee-structure/fee-structure.component";
import { FeeReportsComponent } from "./components/admin/fee-reports/fee-reports.component";
import { RefundManagementComponent } from "./components/admin/refund-management/refund-management.component";
import { FeeBalanceComponent } from "./components/student/fee-balance/fee-balance.component";
import { PaymentHistoryComponent } from "./components/student/payment-history/payment-history.component";
import { MakePaymentComponent } from "./components/student/make-payment/make-payment.component";
import { CashPaymentsComponent } from "./components/accounting/cash-payments/cash-payments.component";
import { ScholarshipManagementComponent } from "./components/admin/scholarship-management/scholarship-management.component";
import { PaymentRemindersComponent } from "./components/admin/payment-reminders/payment-reminders.component";

@NgModule({
  declarations: [
    FeeStructureComponent,
    FeeReportsComponent,
    RefundManagementComponent,
    FeeBalanceComponent,
    PaymentHistoryComponent,
    MakePaymentComponent,
    CashPaymentsComponent,
    ScholarshipManagementComponent,
    PaymentRemindersComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FeesRoutingModule,

    // PrimeNG
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TagModule,
    ProgressBarModule,
    TooltipModule,
    InputNumberModule,
    CheckboxModule,
    ProgressSpinnerModule,
    InputTextareaModule,
    AccordionModule,
  ],
})
export class FeesModule {}
