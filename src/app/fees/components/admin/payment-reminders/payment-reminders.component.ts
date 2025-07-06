import { Component, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";
import { FeeService } from "../../../services/fee.service";

@Component({
  selector: "app-payment-reminders",
  templateUrl: "./payment-reminders.component.html",
  styleUrls: ["./payment-reminders.component.scss"],
  providers: [MessageService],
})
export class PaymentRemindersComponent implements OnInit {
  loading: boolean = false;

  constructor(
    private feeService: FeeService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Implementation coming soon
  }

  sendReminders(): void {
    this.messageService.add({
      severity: "info",
      summary: "Payment Reminders",
      detail: "Payment reminder feature will be available soon",
    });
  }
}
