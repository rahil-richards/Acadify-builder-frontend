import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "../auth/guards/role.guard";
import { UserRole } from "../auth/models/role.model";

// Admin Components
import { FeeStructureComponent } from "./components/admin/fee-structure/fee-structure.component";
import { FeeReportsComponent } from "./components/admin/fee-reports/fee-reports.component";
import { RefundManagementComponent } from "./components/admin/refund-management/refund-management.component";
import { ScholarshipManagementComponent } from "./components/admin/scholarship-management/scholarship-management.component";
import { PaymentRemindersComponent } from "./components/admin/payment-reminders/payment-reminders.component";

// Student Components
import { FeeBalanceComponent } from "./components/student/fee-balance/fee-balance.component";
import { PaymentHistoryComponent } from "./components/student/payment-history/payment-history.component";
import { MakePaymentComponent } from "./components/student/make-payment/make-payment.component";

// Accounting Components
import { CashPaymentsComponent } from "./components/accounting/cash-payments/cash-payments.component";

const routes: Routes = [
  // Admin Routes
  {
    path: "admin/structure",
    component: FeeStructureComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: "admin/reports",
    component: FeeReportsComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: "admin/refunds",
    component: RefundManagementComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: "admin/scholarships",
    component: ScholarshipManagementComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: "admin/reminders",
    component: PaymentRemindersComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
  },

  // Student Routes
  {
    path: "balance",
    component: FeeBalanceComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.STUDENT] },
  },
  {
    path: "history",
    component: PaymentHistoryComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.STUDENT] },
  },
  {
    path: "payment",
    component: MakePaymentComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.STUDENT] },
  },

  // Accounting Routes
  {
    path: "accounting/cash-payments",
    component: CashPaymentsComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] },
  },

  // Default redirect
  {
    path: "",
    redirectTo: "balance",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeesRoutingModule {}
