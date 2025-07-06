import { Component, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";
import { FeeService } from "../../../services/fee.service";

@Component({
  selector: "app-refund-management",
  templateUrl: "./refund-management.component.html",
  styleUrls: ["./refund-management.component.scss"],
  providers: [MessageService],
})
export class RefundManagementComponent implements OnInit {
  loading: boolean = false;

  constructor(
    private feeService: FeeService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Implementation coming soon
  }

  processRefund(): void {
    this.messageService.add({
      severity: "info",
      summary: "Refund Management",
      detail: "Refund management feature will be available soon",
    });
  }
}
