export interface FeeStructure {
  id: string;
  course: string;
  semester: number;
  academicYear: string;
  tuitionFee: number;
  libraryFee: number;
  laboratoryFee: number;
  developmentFee: number;
  miscellaneousFee: number;
  totalFee: number;
  dueDate: string;
  lateFine: number;
  isActive: boolean;
}

export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  semester: number;
  rollNumber: string;
  feeStructureId: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: "paid" | "partial" | "pending" | "overdue";
  lastPaymentDate: string | null;
  scholarshipAmount: number;
  discountAmount: number;
  fineAmount: number;
}

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  feeStructureId: string;
  paymentId: string;
  amount: number;
  paymentMethod: "razorpay" | "upi" | "cash" | "card" | "scholarship";
  paymentType: "online" | "offline" | "adjustment";
  transactionId: string;
  paymentDate: string;
  status: "pending" | "completed" | "failed" | "refunded";
  receiptNumber: string;
  academicYear: string;
  semester: number;
  description: string;
  processedBy: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  semester: number;
  paymentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  academicYear: string;
  generatedDate: string;
  issuedBy: string;
  description: string;
}

export interface Scholarship {
  id: string;
  name: string;
  type: "merit" | "need_based" | "discount" | "government";
  amount: number;
  percentage: number;
  criteria: string;
  isActive: boolean;
  maxBeneficiaries: number;
  currentBeneficiaries: number;
}

export interface PaymentReminder {
  id: string;
  studentId: string;
  studentName: string;
  dueAmount: number;
  dueDate: string;
  reminderType: "email" | "sms" | "both";
  status: "pending" | "sent" | "failed";
  sentDate?: string;
  scheduledDate?: string;
  message: string;
}

export interface RefundRequest {
  id: string;
  studentId: string;
  studentName: string;
  paymentId: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "processed";
  approvedBy?: string;
  approvedDate?: string;
  processedDate?: string;
  refundMethod: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export interface FeeReport {
  id: string;
  reportType:
    | "monthly_collection"
    | "outstanding_fees"
    | "scholarship_summary"
    | "refund_summary";
  month?: string;
  year: number;
  totalCollected: number;
  totalPending: number;
  totalStudents: number;
  paidStudents: number;
  pendingStudents: number;
  averagePayment: number;
  generatedDate: string;
  generatedBy: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  signature: string;
  amount: number;
  currency: string;
  error?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}
