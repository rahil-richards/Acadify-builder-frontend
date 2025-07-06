import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { PaymentService } from "../../../services/payment.service";
import { FeeService } from "../../../services/fee.service";
import { StudentFee } from "../../../models/fee.model";

@Component({
  selector: "app-make-payment",
  templateUrl: "./make-payment.component.html",
  styleUrls: ["./make-payment.component.scss"],
  providers: [MessageService],
})
export class MakePaymentComponent implements OnInit {
  paymentForm: FormGroup;
  selectedFee: StudentFee | null = null;
  paymentMethods = [
    {
      label: "Razorpay (Recommended)",
      value: "razorpay",
      icon: "pi pi-credit-card",
    },
    { label: "UPI", value: "upi", icon: "pi pi-mobile" },
    { label: "Net Banking", value: "netbanking", icon: "pi pi-globe" },
  ];

  loading: boolean = false;
  processingPayment: boolean = false;
  paymentSuccess: boolean = false;
  paymentError: string = "";

  // Mock student data
  studentInfo = {
    id: "STU001",
    name: "Raj Kumar",
    rollNumber: "BP001",
    email: "raj.kumar@email.com",
    phone: "+91 9876543210",
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private feeService: FeeService,
    private messageService: MessageService,
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ["razorpay", Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      upiId: [""],
      terms: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["feeId"]) {
        this.loadFeeDetails(params["feeId"]);
      }
      if (params["amount"]) {
        this.paymentForm.patchValue({ amount: params["amount"] });
      }
    });

    this.setupFormValidation();
  }

  loadFeeDetails(feeId: string): void {
    this.loading = true;
    this.feeService.getStudentFeeById(feeId).subscribe({
      next: (fee) => {
        this.selectedFee = fee;
        this.paymentForm.patchValue({ amount: fee.balanceAmount });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load fee details",
        });
        this.loading = false;
      },
    });
  }

  setupFormValidation(): void {
    this.paymentForm.get("paymentMethod")?.valueChanges.subscribe((method) => {
      const upiControl = this.paymentForm.get("upiId");

      if (method === "upi") {
        upiControl?.setValidators([
          Validators.required,
          this.validateUPIId.bind(this),
        ]);
      } else {
        upiControl?.clearValidators();
      }
      upiControl?.updateValueAndValidity();
    });
  }

  validateUPIId(control: any) {
    const upiId = control.value;
    if (upiId && !this.paymentService.validateUPIId(upiId)) {
      return { invalidUPI: true };
    }
    return null;
  }

  async processPayment(): Promise<void> {
    if (!this.paymentForm.valid || !this.selectedFee) {
      this.markFormGroupTouched();
      return;
    }

    this.processingPayment = true;
    this.paymentError = "";

    try {
      const formData = this.paymentForm.value;
      const amount = formData.amount;

      switch (formData.paymentMethod) {
        case "razorpay":
          await this.processRazorpayPayment(amount);
          break;
        case "upi":
          await this.processUPIPayment(amount, formData.upiId);
          break;
        case "netbanking":
          await this.processNetBankingPayment(amount);
          break;
        default:
          throw new Error("Invalid payment method");
      }
    } catch (error) {
      this.handlePaymentError(error);
    } finally {
      this.processingPayment = false;
    }
  }

  async processRazorpayPayment(amount: number): Promise<void> {
    // Load Razorpay script
    const scriptLoaded = await this.paymentService.loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Razorpay SDK failed to load");
    }

    // Create payment order
    const orderResponse = await this.paymentService
      .createPaymentOrder(amount)
      .toPromise();

    // Initialize Razorpay payment
    const paymentResponse = await this.paymentService.initiateRazorpayPayment(
      amount,
      this.studentInfo.name,
      this.studentInfo.email,
      this.studentInfo.phone,
      orderResponse.id,
      `Fee Payment - ${this.selectedFee?.course} Semester ${this.selectedFee?.semester}`,
    );

    if (paymentResponse.success) {
      await this.handlePaymentSuccess(paymentResponse);
    }
  }

  async processUPIPayment(amount: number, upiId: string): Promise<void> {
    const response = await this.paymentService
      .initiateUPIPayment(
        amount,
        upiId,
        `Fee Payment - ${this.selectedFee?.course}`,
      )
      .toPromise();

    if (response.success) {
      await this.handlePaymentSuccess(response);
    } else {
      throw new Error(response.error || "UPI payment failed");
    }
  }

  async processNetBankingPayment(amount: number): Promise<void> {
    // Redirect to bank's website (mock implementation)
    this.messageService.add({
      severity: "info",
      summary: "Redirecting",
      detail: "You will be redirected to your bank's website",
    });

    // Mock implementation - would redirect to actual bank
    setTimeout(() => {
      this.handlePaymentSuccess({
        success: true,
        paymentId: "nb_" + Date.now(),
        orderId: "order_" + Date.now(),
        signature: "mock_signature",
        amount: amount,
        currency: "INR",
      });
    }, 2000);
  }

  async handlePaymentSuccess(paymentResponse: any): Promise<void> {
    try {
      // Process payment success on backend
      await this.paymentService
        .processPaymentSuccess(
          paymentResponse,
          this.studentInfo.id,
          this.selectedFee?.feeStructureId || "",
        )
        .toPromise();

      // Update fee status
      if (this.selectedFee) {
        const updatedFee = {
          ...this.selectedFee,
          paidAmount: this.selectedFee.paidAmount + paymentResponse.amount,
          balanceAmount:
            this.selectedFee.balanceAmount - paymentResponse.amount,
          lastPaymentDate: new Date().toISOString().split("T")[0],
          status: (this.selectedFee.balanceAmount - paymentResponse.amount <= 0
            ? "paid"
            : "partial") as "paid" | "partial" | "pending" | "overdue",
        };

        await this.feeService
          .updateStudentFee(this.selectedFee.id, updatedFee)
          .toPromise();
      }

      this.paymentSuccess = true;
      this.messageService.add({
        severity: "success",
        summary: "Payment Successful",
        detail: `Payment of ${this.formatCurrency(paymentResponse.amount)} completed successfully`,
      });

      // Redirect to balance page after 3 seconds
      setTimeout(() => {
        this.router.navigate(["/fees/balance"]);
      }, 3000);
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Payment Processing Error",
        detail:
          "Payment was successful but there was an error updating records",
      });
    }
  }

  handlePaymentError(error: any): void {
    this.paymentError = error.message || "Payment failed. Please try again.";
    this.messageService.add({
      severity: "error",
      summary: "Payment Failed",
      detail: this.paymentError,
    });
  }

  markFormGroupTouched(): void {
    Object.keys(this.paymentForm.controls).forEach((key) => {
      this.paymentForm.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(["/fees/balance"]);
  }

  formatCurrency(amount: number): string {
    return this.paymentService.formatCurrency(amount);
  }

  getPaymentMethodIcon(method: string): string {
    const methodObj = this.paymentMethods.find((m) => m.value === method);
    return methodObj?.icon || "pi pi-credit-card";
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["min"]) return `Amount must be greater than 0`;
      if (field.errors["invalidUPI"]) return "Please enter a valid UPI ID";
      if (field.errors["requiredTrue"])
        return "Please accept the terms and conditions";
    }
    return "";
  }
}
