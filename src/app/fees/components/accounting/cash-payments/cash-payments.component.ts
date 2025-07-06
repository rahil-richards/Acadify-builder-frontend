import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService, ConfirmationService } from "primeng/api";
import { PaymentService } from "../../../services/payment.service";
import { FeeService } from "../../../services/fee.service";
import { FeePayment, StudentFee } from "../../../models/fee.model";

@Component({
  selector: "app-cash-payments",
  templateUrl: "./cash-payments.component.html",
  styleUrls: ["./cash-payments.component.scss"],
  providers: [MessageService, ConfirmationService],
})
export class CashPaymentsComponent implements OnInit {
  cashPaymentForm: FormGroup;
  recentPayments: FeePayment[] = [];
  studentFees: StudentFee[] = [];
  selectedStudent: StudentFee | null = null;
  displayDialog: boolean = false;
  loading: boolean = false;
  searchLoading: boolean = false;

  // Statistics
  todayCollection: number = 0;
  weeklyCollection: number = 0;
  monthlyCollection: number = 0;
  totalCashPayments: number = 0;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private feeService: FeeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.cashPaymentForm = this.fb.group({
      studentId: ["", Validators.required],
      studentName: ["", Validators.required],
      rollNumber: ["", Validators.required],
      course: ["", Validators.required],
      semester: ["", Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      receiptNumber: ["", Validators.required],
      paymentDate: [new Date(), Validators.required],
      description: ["Fee Payment", Validators.required],
      collectedBy: ["", Validators.required],
      remarks: [""],
    });
  }

  ngOnInit(): void {
    this.loadRecentPayments();
    this.loadStatistics();
    this.generateReceiptNumber();
  }

  loadRecentPayments(): void {
    this.loading = true;
    this.paymentService
      .getPaymentAnalytics({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        to: new Date().toISOString().split("T")[0],
      })
      .subscribe({
        next: (data) => {
          this.recentPayments =
            data.payments?.filter(
              (p: FeePayment) => p.paymentMethod === "cash",
            ) || [];
          this.loading = false;
        },
        error: (error) => {
          // Fallback to mock data
          this.recentPayments = [
            {
              id: "cash_001",
              studentId: "STU002",
              studentName: "Priya Sharma",
              feeStructureId: "fee_struct_001",
              paymentId: "CASH001",
              amount: 52000,
              paymentMethod: "cash",
              paymentType: "offline",
              transactionId: "CASH002",
              paymentDate: new Date().toISOString(),
              status: "completed",
              receiptNumber: "RCP002",
              academicYear: "2024-25",
              semester: 1,
              description: "Full fee payment",
              processedBy: "acc_001",
            },
          ];
          this.loading = false;
        },
      });
  }

  loadStatistics(): void {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Mock statistics - would come from API
    this.todayCollection = 85000;
    this.weeklyCollection = 345000;
    this.monthlyCollection = 1250000;
    this.totalCashPayments = 45;
  }

  searchStudent(query: string): void {
    if (!query || query.length < 3) {
      this.studentFees = [];
      return;
    }

    this.searchLoading = true;
    this.feeService.getStudentFees().subscribe({
      next: (fees) => {
        this.studentFees = fees.filter(
          (fee) =>
            fee.studentName.toLowerCase().includes(query.toLowerCase()) ||
            fee.rollNumber.toLowerCase().includes(query.toLowerCase()) ||
            fee.studentId.toLowerCase().includes(query.toLowerCase()),
        );
        this.searchLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to search students",
        });
        this.searchLoading = false;
      },
    });
  }

  selectStudent(student: StudentFee): void {
    this.selectedStudent = student;
    this.cashPaymentForm.patchValue({
      studentId: student.studentId,
      studentName: student.studentName,
      rollNumber: student.rollNumber,
      course: student.course,
      semester: student.semester,
      amount: student.balanceAmount,
      description: `Fee Payment - ${student.course} Semester ${student.semester}`,
    });
    this.displayDialog = true;
  }

  generateReceiptNumber(): void {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const receiptNumber = `CASH${dateStr}${randomNum}`;
    this.cashPaymentForm.patchValue({ receiptNumber });
  }

  recordCashPayment(): void {
    if (!this.cashPaymentForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.cashPaymentForm.value;

    this.confirmationService.confirm({
      message: `Record cash payment of ${this.formatCurrency(formData.amount)} for ${formData.studentName}?`,
      header: "Confirm Cash Payment",
      icon: "pi pi-question-circle",
      accept: () => {
        this.processCashPayment(formData);
      },
    });
  }

  processCashPayment(formData: any): void {
    this.loading = true;

    this.paymentService
      .recordCashPayment(
        formData.studentId,
        formData.amount,
        formData.receiptNumber,
        formData.collectedBy,
        formData.description,
      )
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Cash payment recorded successfully. Receipt: ${formData.receiptNumber}`,
          });

          // Update student fee record
          if (this.selectedStudent) {
            const updatedFee = {
              ...this.selectedStudent,
              paidAmount: this.selectedStudent.paidAmount + formData.amount,
              balanceAmount:
                this.selectedStudent.balanceAmount - formData.amount,
              lastPaymentDate: new Date().toISOString().split("T")[0],
              status: (this.selectedStudent.balanceAmount - formData.amount <= 0
                ? "paid"
                : "partial") as "paid" | "partial" | "pending" | "overdue",
            };

            this.feeService
              .updateStudentFee(this.selectedStudent.id, updatedFee)
              .subscribe({
                next: () => {
                  console.log("Fee record updated successfully");
                },
                error: (error) => {
                  console.error("Failed to update fee record:", error);
                },
              });
          }

          this.loadRecentPayments();
          this.loadStatistics();
          this.resetForm();
          this.displayDialog = false;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to record cash payment",
          });
          this.loading = false;
        },
      });
  }

  resetForm(): void {
    this.cashPaymentForm.reset();
    this.cashPaymentForm.patchValue({
      paymentDate: new Date(),
      description: "Fee Payment",
    });
    this.generateReceiptNumber();
    this.selectedStudent = null;
  }

  markFormGroupTouched(): void {
    Object.keys(this.cashPaymentForm.controls).forEach((key) => {
      this.cashPaymentForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cashPaymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cashPaymentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["min"]) return `Amount must be greater than 0`;
    }
    return "";
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

  getStatusSeverity(status: string): string {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      default:
        return "info";
    }
  }

  exportDailyReport(): void {
    const today = new Date().toISOString().split("T")[0];
    const todayPayments = this.recentPayments.filter(
      (payment) => payment.paymentDate.split("T")[0] === today,
    );

    const csvData = todayPayments.map((payment) => ({
      "Receipt Number": payment.receiptNumber,
      "Student Name": payment.studentName,
      Amount: payment.amount,
      Time: this.formatDate(payment.paymentDate),
      "Collected By": payment.processedBy,
      Description: payment.description,
    }));

    const csv = this.convertToCSV(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cash-payments-${today}.csv`;
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

  openNewPaymentDialog(): void {
    this.resetForm();
    this.displayDialog = true;
  }
}
