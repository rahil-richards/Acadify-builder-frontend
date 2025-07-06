import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { FeeService } from "../../../services/fee.service";
import { PaymentService } from "../../../services/payment.service";
import { StudentFee } from "../../../models/fee.model";

@Component({
  selector: "app-fee-balance",
  templateUrl: "./fee-balance.component.html",
  styleUrls: ["./fee-balance.component.scss"],
  providers: [MessageService],
})
export class FeeBalanceComponent implements OnInit {
  studentFees: StudentFee[] = [];
  totalOutstanding: number = 0;
  totalPaid: number = 0;
  loading: boolean = false;
  currentStudentId: string = "STU001"; // Mock student ID

  // Mock student data
  studentInfo = {
    id: "STU001",
    name: "Raj Kumar",
    rollNumber: "BP001",
    course: "B.Pharm",
    semester: 1,
    email: "raj.kumar@email.com",
    phone: "+91 9876543210",
  };

  constructor(
    private feeService: FeeService,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStudentFees();
  }

  loadStudentFees(): void {
    this.loading = true;
    this.feeService.getStudentFees(this.currentStudentId).subscribe({
      next: (fees) => {
        this.studentFees = fees;
        this.calculateTotals();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load fee information",
        });
        this.loading = false;
      },
    });
  }

  calculateTotals(): void {
    this.totalOutstanding = this.studentFees.reduce(
      (sum, fee) => sum + fee.balanceAmount,
      0,
    );
    this.totalPaid = this.studentFees.reduce(
      (sum, fee) => sum + fee.paidAmount,
      0,
    );
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "paid":
        return "success";
      case "partial":
        return "warning";
      case "pending":
        return "danger";
      case "overdue":
        return "danger";
      default:
        return "info";
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case "paid":
        return "Paid";
      case "partial":
        return "Partially Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  }

  getPaymentProgress(fee: StudentFee): number {
    if (fee.totalAmount === 0) return 0;
    return Math.round((fee.paidAmount / fee.totalAmount) * 100);
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  }

  getDaysUntilDue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  makePayment(fee: StudentFee): void {
    this.router.navigate(["/fees/payment"], {
      queryParams: {
        feeId: fee.id,
        amount: fee.balanceAmount,
      },
    });
  }

  viewPaymentHistory(): void {
    this.router.navigate(["/fees/history"]);
  }

  downloadFeeStructure(fee: StudentFee): void {
    // Mock implementation - would typically download PDF
    this.messageService.add({
      severity: "info",
      summary: "Download",
      detail: "Fee structure download will be available soon",
    });
  }

  formatCurrency(amount: number): string {
    return this.paymentService.formatCurrency(amount);
  }

  getFeeBreakdown(fee: StudentFee) {
    // Mock fee breakdown - would come from fee structure
    return {
      tuitionFee: Math.round(fee.totalAmount * 0.7),
      libraryFee: Math.round(fee.totalAmount * 0.1),
      laboratoryFee: Math.round(fee.totalAmount * 0.15),
      developmentFee: Math.round(fee.totalAmount * 0.05),
    };
  }
}
