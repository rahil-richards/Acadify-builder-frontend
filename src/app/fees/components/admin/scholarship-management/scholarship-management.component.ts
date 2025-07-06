import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService, ConfirmationService } from "primeng/api";
import { FeeService } from "../../../services/fee.service";
import { Scholarship } from "../../../models/fee.model";

@Component({
  selector: "app-scholarship-management",
  templateUrl: "./scholarship-management.component.html",
  styleUrls: ["./scholarship-management.component.scss"],
  providers: [MessageService, ConfirmationService],
})
export class ScholarshipManagementComponent implements OnInit {
  scholarships: Scholarship[] = [];
  scholarshipForm: FormGroup;
  displayDialog: boolean = false;
  editMode: boolean = false;
  selectedScholarship: Scholarship | null = null;
  loading: boolean = false;

  scholarshipTypes = [
    { label: "Merit Based", value: "merit" },
    { label: "Need Based", value: "need_based" },
    { label: "Discount", value: "discount" },
    { label: "Government", value: "government" },
  ];

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.scholarshipForm = this.fb.group({
      name: ["", Validators.required],
      type: ["", Validators.required],
      amount: [0, [Validators.min(0)]],
      percentage: [0, [Validators.min(0), Validators.max(100)]],
      criteria: ["", Validators.required],
      maxBeneficiaries: [0, [Validators.required, Validators.min(1)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadScholarships();
  }

  loadScholarships(): void {
    this.loading = true;
    this.feeService.getScholarships().subscribe({
      next: (scholarships) => {
        this.scholarships = scholarships;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load scholarships",
        });
        this.loading = false;
      },
    });
  }

  openNewDialog(): void {
    this.editMode = false;
    this.selectedScholarship = null;
    this.scholarshipForm.reset();
    this.scholarshipForm.patchValue({ isActive: true });
    this.displayDialog = true;
  }

  editScholarship(scholarship: Scholarship): void {
    this.editMode = true;
    this.selectedScholarship = scholarship;
    this.scholarshipForm.patchValue(scholarship);
    this.displayDialog = true;
  }

  saveScholarship(): void {
    if (this.scholarshipForm.valid) {
      const scholarshipData = this.scholarshipForm.value;

      if (this.editMode && this.selectedScholarship) {
        this.feeService
          .updateScholarship(this.selectedScholarship.id, scholarshipData)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Scholarship updated successfully",
              });
              this.loadScholarships();
              this.displayDialog = false;
            },
            error: () => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to update scholarship",
              });
            },
          });
      } else {
        this.feeService.createScholarship(scholarshipData).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Scholarship created successfully",
            });
            this.loadScholarships();
            this.displayDialog = false;
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to create scholarship",
            });
          },
        });
      }
    }
  }

  deleteScholarship(scholarship: Scholarship): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this scholarship?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.feeService.deleteScholarship(scholarship.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Scholarship deleted successfully",
            });
            this.loadScholarships();
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete scholarship",
            });
          },
        });
      },
    });
  }

  getTypeSeverity(type: string): string {
    switch (type) {
      case "merit":
        return "success";
      case "need_based":
        return "info";
      case "discount":
        return "warning";
      case "government":
        return "danger";
      default:
        return "info";
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  }
}
