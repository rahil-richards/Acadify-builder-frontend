import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { FeeService } from "../../../services/fee.service";
import { PaymentService } from "../../../services/payment.service";
import { FeePayment, FeeReceipt } from "../../../models/fee.model";

@Component({
  selector: "app-payment-history",
  templateUrl: "./payment-history.component.html",
  styleUrls: ["./payment-history.component.scss"],
  providers: [MessageService],
})
export class PaymentHistoryComponent implements OnInit {
  payments: FeePayment[] = [];
  receipts: FeeReceipt[] = [];
  loading: boolean = false;
  currentStudentId: string = "STU001"; // Mock student ID

  // Filters
  selectedYear: string = new Date().getFullYear().toString();
  selectedStatus: string = "";
  selectedPaymentMethod: string = "";

  // Options for filters
  yearOptions = [
    { label: "All Years", value: "" },
    { label: "2024-25", value: "2024" },
    { label: "2023-24", value: "2023" },
    { label: "2022-23", value: "2022" },
  ];

  statusOptions = [
    { label: "All Status", value: "" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
  ];

  paymentMethodOptions = [
    { label: "All Methods", value: "" },
    { label: "Razorpay", value: "razorpay" },
    { label: "UPI", value: "upi" },
    { label: "Cash", value: "cash" },
    { label: "Card", value: "card" },
  ];

  // Statistics
  totalPaid: number = 0;
  totalTransactions: number = 0;
  averagePayment: number = 0;

  // Student Info
  studentInfo = {
    id: "STU001",
    name: "Raj Kumar",
    rollNumber: "BP001",
    course: "B.Pharm",
    semester: 1,
  };

  constructor(
    private feeService: FeeService,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPaymentHistory();
    this.loadReceiptHistory();
  }

  loadPaymentHistory(): void {
    this.loading = true;
    this.feeService.getFeePayments(this.currentStudentId).subscribe({
      next: (payments) => {
        this.payments = payments.sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime(),
        );
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load payment history",
        });
        this.loading = false;
      },
    });
  }

  loadReceiptHistory(): void {
    this.feeService.getFeeReceipts(this.currentStudentId).subscribe({
      next: (receipts) => {
        this.receipts = receipts;
      },
      error: (error) => {
        console.error("Failed to load receipts:", error);
      },
    });
  }

  calculateStatistics(): void {
    const completedPayments = this.payments.filter(
      (p) => p.status === "completed",
    );
    this.totalPaid = completedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    this.totalTransactions = completedPayments.length;
    this.averagePayment =
      this.totalTransactions > 0 ? this.totalPaid / this.totalTransactions : 0;
  }

  getFilteredPayments(): FeePayment[] {
    return this.payments.filter((payment) => {
      const yearMatch =
        !this.selectedYear ||
        new Date(payment.paymentDate).getFullYear().toString() ===
          this.selectedYear;

      const statusMatch =
        !this.selectedStatus || payment.status === this.selectedStatus;

      const methodMatch =
        !this.selectedPaymentMethod ||
        payment.paymentMethod === this.selectedPaymentMethod;

      return yearMatch && statusMatch && methodMatch;
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "refunded":
        return "info";
      default:
        return "info";
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case "razorpay":
        return "pi pi-credit-card";
      case "upi":
        return "pi pi-mobile";
      case "cash":
        return "pi pi-money-bill";
      case "card":
        return "pi pi-credit-card";
      case "netbanking":
        return "pi pi-globe";
      default:
        return "pi pi-money-bill";
    }
  }

  getPaymentMethodDisplay(method: string): string {
    switch (method) {
      case "razorpay":
        return "Razorpay";
      case "upi":
        return "UPI";
      case "cash":
        return "Cash";
      case "card":
        return "Card";
      case "netbanking":
        return "Net Banking";
      default:
        return method;
    }
  }

  downloadReceipt(payment: FeePayment): void {
    const receipt = this.receipts.find(
      (r) => r.paymentId === payment.paymentId,
    );
    if (receipt) {
      this.feeService.downloadReceipt(receipt.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `Receipt_${receipt.receiptNumber}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to download receipt",
          });
        },
      });
    } else {
      this.messageService.add({
        severity: "info",
        summary: "Receipt",
        detail: "Receipt not available for this payment",
      });
    }
  }

  retryPayment(payment: FeePayment): void {
    this.router.navigate(["/fees/payment"], {
      queryParams: {
        amount: payment.amount,
        retry: payment.id,
      },
    });
  }

  requestRefund(payment: FeePayment): void {
    // Navigate to refund request form or open dialog
    this.messageService.add({
      severity: "info",
      summary: "Refund Request",
      detail: "Refund request feature will be available soon",
    });
  }

  exportHistory(): void {
    const csvData = this.getFilteredPayments().map((payment) => ({
      Date: new Date(payment.paymentDate).toLocaleDateString(),
      Amount: payment.amount,
      Method: this.getPaymentMethodDisplay(payment.paymentMethod),
      Status: this.getStatusText(payment.status),
      "Transaction ID": payment.transactionId,
      Receipt: payment.receiptNumber || "N/A",
    }));

    const csv = this.convertToCSV(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-history-${this.studentInfo.rollNumber}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row) =>
      headers.map((header) => `"${row[header] || ""}"`).join(","),
    );

    return [csvHeaders, ...csvRows].join("\n");
  }

  clearFilters(): void {
    this.selectedYear = "";
    this.selectedStatus = "";
    this.selectedPaymentMethod = "";
  }

  goToFeeBalance(): void {
    this.router.navigate(["/fees/balance"]);
  }

  formatCurrency(amount: number): string {
    return this.paymentService.formatCurrency(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getMonthlyData(): any[] {
    const monthlyData: { [key: string]: number } = {};

    this.payments
      .filter((p) => p.status === "completed")
      .forEach((payment) => {
        const month = new Date(payment.paymentDate).toLocaleDateString(
          "en-IN",
          {
            month: "short",
            year: "numeric",
          },
        );
        monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
      });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));
  }
}
