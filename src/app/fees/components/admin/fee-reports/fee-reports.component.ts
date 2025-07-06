import { Component, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";
import { FeeService } from "../../../services/fee.service";

@Component({
  selector: "app-fee-reports",
  templateUrl: "./fee-reports.component.html",
  styleUrls: ["./fee-reports.component.scss"],
  providers: [MessageService],
})
export class FeeReportsComponent implements OnInit {
  loading: boolean = false;

  constructor(
    private feeService: FeeService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Implementation coming soon
  }

  generateReport(type: string): void {
    this.messageService.add({
      severity: "info",
      summary: "Report Generation",
      detail: "Report generation feature will be available soon",
    });
  }
}
