import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import {
  FeeStructure,
  StudentFee,
  FeePayment,
  FeeReceipt,
  Scholarship,
  PaymentReminder,
  RefundRequest,
  FeeReport,
} from "../models/fee.model";

@Injectable({
  providedIn: "root",
})
export class FeeService {
  private baseUrl = "/api";
  private feeStructuresSubject = new BehaviorSubject<FeeStructure[]>([]);
  private studentFeesSubject = new BehaviorSubject<StudentFee[]>([]);

  public feeStructures$ = this.feeStructuresSubject.asObservable();
  public studentFees$ = this.studentFeesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fee Structure Management
  getFeeStructures(): Observable<FeeStructure[]> {
    return this.http.get<FeeStructure[]>(`${this.baseUrl}/feeStructures`);
  }

  createFeeStructure(
    feeStructure: Partial<FeeStructure>,
  ): Observable<FeeStructure> {
    return this.http.post<FeeStructure>(
      `${this.baseUrl}/feeStructures`,
      feeStructure,
    );
  }

  updateFeeStructure(
    id: string,
    feeStructure: Partial<FeeStructure>,
  ): Observable<FeeStructure> {
    return this.http.put<FeeStructure>(
      `${this.baseUrl}/feeStructures/${id}`,
      feeStructure,
    );
  }

  deleteFeeStructure(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/feeStructures/${id}`);
  }

  // Student Fee Management
  getStudentFees(studentId?: string): Observable<StudentFee[]> {
    const url = studentId
      ? `${this.baseUrl}/studentFees?studentId=${studentId}`
      : `${this.baseUrl}/studentFees`;
    return this.http.get<StudentFee[]>(url);
  }

  getStudentFeeById(id: string): Observable<StudentFee> {
    return this.http.get<StudentFee>(`${this.baseUrl}/studentFees/${id}`);
  }

  updateStudentFee(
    id: string,
    studentFee: Partial<StudentFee>,
  ): Observable<StudentFee> {
    return this.http.put<StudentFee>(
      `${this.baseUrl}/studentFees/${id}`,
      studentFee,
    );
  }

  // Payment Management
  getFeePayments(studentId?: string): Observable<FeePayment[]> {
    const url = studentId
      ? `${this.baseUrl}/feePayments?studentId=${studentId}`
      : `${this.baseUrl}/feePayments`;
    return this.http.get<FeePayment[]>(url);
  }

  createFeePayment(payment: Partial<FeePayment>): Observable<FeePayment> {
    return this.http.post<FeePayment>(`${this.baseUrl}/feePayments`, payment);
  }

  updateFeePayment(
    id: string,
    payment: Partial<FeePayment>,
  ): Observable<FeePayment> {
    return this.http.put<FeePayment>(
      `${this.baseUrl}/feePayments/${id}`,
      payment,
    );
  }

  // Receipt Management
  getFeeReceipts(studentId?: string): Observable<FeeReceipt[]> {
    const url = studentId
      ? `${this.baseUrl}/feeReceipts?studentId=${studentId}`
      : `${this.baseUrl}/feeReceipts`;
    return this.http.get<FeeReceipt[]>(url);
  }

  generateReceipt(paymentId: string): Observable<FeeReceipt> {
    return this.http.post<FeeReceipt>(`${this.baseUrl}/feeReceipts`, {
      paymentId,
    });
  }

  downloadReceipt(receiptId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/feeReceipts/${receiptId}/download`, {
      responseType: "blob",
    });
  }

  // Scholarship Management
  getScholarships(): Observable<Scholarship[]> {
    return this.http.get<Scholarship[]>(`${this.baseUrl}/scholarships`);
  }

  createScholarship(
    scholarship: Partial<Scholarship>,
  ): Observable<Scholarship> {
    return this.http.post<Scholarship>(
      `${this.baseUrl}/scholarships`,
      scholarship,
    );
  }

  updateScholarship(
    id: string,
    scholarship: Partial<Scholarship>,
  ): Observable<Scholarship> {
    return this.http.put<Scholarship>(
      `${this.baseUrl}/scholarships/${id}`,
      scholarship,
    );
  }

  deleteScholarship(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/scholarships/${id}`);
  }

  applyScholarship(studentId: string, scholarshipId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/scholarships/apply`, {
      studentId,
      scholarshipId,
    });
  }

  // Payment Reminder Management
  getPaymentReminders(): Observable<PaymentReminder[]> {
    return this.http.get<PaymentReminder[]>(`${this.baseUrl}/paymentReminders`);
  }

  createPaymentReminder(
    reminder: Partial<PaymentReminder>,
  ): Observable<PaymentReminder> {
    return this.http.post<PaymentReminder>(
      `${this.baseUrl}/paymentReminders`,
      reminder,
    );
  }

  sendReminder(reminderId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/paymentReminders/${reminderId}/send`,
      {},
    );
  }

  sendBulkReminders(studentIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/paymentReminders/bulk-send`, {
      studentIds,
    });
  }

  // Refund Management
  getRefundRequests(): Observable<RefundRequest[]> {
    return this.http.get<RefundRequest[]>(`${this.baseUrl}/refundRequests`);
  }

  createRefundRequest(
    refund: Partial<RefundRequest>,
  ): Observable<RefundRequest> {
    return this.http.post<RefundRequest>(
      `${this.baseUrl}/refundRequests`,
      refund,
    );
  }

  updateRefundRequest(
    id: string,
    refund: Partial<RefundRequest>,
  ): Observable<RefundRequest> {
    return this.http.put<RefundRequest>(
      `${this.baseUrl}/refundRequests/${id}`,
      refund,
    );
  }

  approveRefund(id: string, approvedBy: string): Observable<RefundRequest> {
    return this.http.patch<RefundRequest>(
      `${this.baseUrl}/refundRequests/${id}/approve`,
      { approvedBy },
    );
  }

  rejectRefund(id: string, reason: string): Observable<RefundRequest> {
    return this.http.patch<RefundRequest>(
      `${this.baseUrl}/refundRequests/${id}/reject`,
      { reason },
    );
  }

  processRefund(id: string): Observable<RefundRequest> {
    return this.http.patch<RefundRequest>(
      `${this.baseUrl}/refundRequests/${id}/process`,
      {},
    );
  }

  // Reports Management
  getFeeReports(): Observable<FeeReport[]> {
    return this.http.get<FeeReport[]>(`${this.baseUrl}/feeReports`);
  }

  generateReport(reportType: string, filters: any): Observable<FeeReport> {
    return this.http.post<FeeReport>(`${this.baseUrl}/feeReports/generate`, {
      reportType,
      filters,
    });
  }

  exportReport(reportId: string, format: "pdf" | "excel"): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/feeReports/${reportId}/export?format=${format}`,
      {
        responseType: "blob",
      },
    );
  }

  // Dashboard Statistics
  getFeeStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/feeReports/statistics`);
  }

  getOutstandingFees(): Observable<StudentFee[]> {
    return this.http.get<StudentFee[]>(
      `${this.baseUrl}/studentFees?status=pending&status=partial`,
    );
  }

  getOverdueFees(): Observable<StudentFee[]> {
    const today = new Date().toISOString().split("T")[0];
    return this.http.get<StudentFee[]>(
      `${this.baseUrl}/studentFees?dueDate_lt=${today}&status_ne=paid`,
    );
  }

  // Utility Methods
  calculateTotalFee(feeStructure: FeeStructure): number {
    return (
      feeStructure.tuitionFee +
      feeStructure.libraryFee +
      feeStructure.laboratoryFee +
      feeStructure.developmentFee +
      feeStructure.miscellaneousFee
    );
  }

  calculateFineAmount(dueDate: string, lateFinePerDay: number): number {
    const today = new Date();
    const due = new Date(dueDate);

    if (today > due) {
      const diffTime = Math.abs(today.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * lateFinePerDay;
    }

    return 0;
  }

  updateFeeCache(): void {
    this.getFeeStructures().subscribe((structures) => {
      this.feeStructuresSubject.next(structures);
    });

    this.getStudentFees().subscribe((fees) => {
      this.studentFeesSubject.next(fees);
    });
  }
}
