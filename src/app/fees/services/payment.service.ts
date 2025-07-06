import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { PaymentGatewayResponse, RazorpayOptions } from "../models/fee.model";

declare var Razorpay: any;

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  private baseUrl = "/api";
  private razorpayKey = "rzp_test_1234567890"; // Replace with actual Razorpay key

  constructor(private http: HttpClient) {}

  // Create payment order
  createPaymentOrder(
    amount: number,
    currency: string = "INR",
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/create-order`, {
      amount: amount * 100, // Convert to paise
      currency,
    });
  }

  // Initialize Razorpay payment
  initiateRazorpayPayment(
    amount: number,
    studentName: string,
    studentEmail: string,
    studentPhone: string,
    orderId: string,
    description: string = "Fee Payment",
  ): Promise<PaymentGatewayResponse> {
    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: this.razorpayKey,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: "Oriental College",
        description: description,
        order_id: orderId,
        handler: (response: any) => {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: amount,
            currency: "INR",
          });
        },
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: studentPhone,
        },
        theme: {
          color: "#1d4ed8",
        },
      };

      const rzp = new Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        reject({
          success: false,
          error: response.error.description,
          paymentId: "",
          orderId: "",
          signature: "",
          amount: 0,
          currency: "INR",
        });
      });

      rzp.open();
    });
  }

  // Verify payment
  verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/verify`, {
      paymentId,
      orderId,
      signature,
    });
  }

  // Process payment success
  processPaymentSuccess(
    paymentData: PaymentGatewayResponse,
    studentId: string,
    feeStructureId: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/process-success`, {
      ...paymentData,
      studentId,
      feeStructureId,
    });
  }

  // Get payment status
  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments/${paymentId}/status`);
  }

  // Refund payment
  initiateRefund(
    paymentId: string,
    amount: number,
    reason: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/refund`, {
      paymentId,
      amount: amount * 100, // Convert to paise
      reason,
    });
  }

  // Get refund status
  getRefundStatus(refundId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments/refund/${refundId}/status`);
  }

  // UPI Payment
  initiateUPIPayment(
    amount: number,
    upiId: string,
    description: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/upi`, {
      amount: amount * 100,
      upiId,
      description,
    });
  }

  // Bank Transfer
  initiateBankTransfer(
    amount: number,
    bankDetails: any,
    description: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/bank-transfer`, {
      amount: amount * 100,
      bankDetails,
      description,
    });
  }

  // Cash Payment Recording (for accounting team)
  recordCashPayment(
    studentId: string,
    amount: number,
    receiptNumber: string,
    collectedBy: string,
    description: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/cash`, {
      studentId,
      amount,
      receiptNumber,
      collectedBy,
      description,
      paymentMethod: "cash",
      paymentType: "offline",
      status: "completed",
      paymentDate: new Date().toISOString(),
    });
  }

  // Installment Plans
  getInstallmentPlans(feeStructureId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/fee-structures/${feeStructureId}/installments`,
    );
  }

  // Payment Analytics
  getPaymentAnalytics(dateRange: {
    from: string;
    to: string;
  }): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments/analytics`, {
      params: {
        from: dateRange.from,
        to: dateRange.to,
      },
    });
  }

  // Load Razorpay script
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof Razorpay !== "undefined") {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  // Payment Methods Validation
  validateUPIId(upiId: string): boolean {
    const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
    return upiRegex.test(upiId);
  }

  validateBankAccount(accountNumber: string, ifscCode: string): boolean {
    const accountRegex = /^\d{9,18}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    return accountRegex.test(accountNumber) && ifscRegex.test(ifscCode);
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  }

  // Generate payment reference
  generatePaymentReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PAY${timestamp}${random}`;
  }
}
