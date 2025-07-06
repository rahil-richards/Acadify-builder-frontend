import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService, ConfirmationService } from "primeng/api";
import { FeeService } from "../../../services/fee.service";
import { FeeStructure } from "../../../models/fee.model";

@Component({
  selector: "app-fee-structure",
  templateUrl: "./fee-structure.component.html",
  styleUrls: ["./fee-structure.component.scss"],
  providers: [MessageService, ConfirmationService],
})
export class FeeStructureComponent implements OnInit {
  feeStructures: FeeStructure[] = [];
  feeStructureForm: FormGroup;
  displayDialog: boolean = false;
  editMode: boolean = false;
  selectedFeeStructure: FeeStructure | null = null;
  loading: boolean = false;

  courses = [
    { label: "B.Pharm", value: "B.Pharm" },
    { label: "M.Pharm", value: "M.Pharm" },
    { label: "PharmD", value: "PharmD" },
  ];

  semesters = [
    { label: "Semester 1", value: 1 },
    { label: "Semester 2", value: 2 },
    { label: "Semester 3", value: 3 },
    { label: "Semester 4", value: 4 },
    { label: "Semester 5", value: 5 },
    { label: "Semester 6", value: 6 },
    { label: "Semester 7", value: 7 },
    { label: "Semester 8", value: 8 },
  ];

  academicYears = [
    { label: "2024-25", value: "2024-25" },
    { label: "2025-26", value: "2025-26" },
    { label: "2026-27", value: "2026-27" },
  ];

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.feeStructureForm = this.fb.group({
      course: ["", Validators.required],
      semester: ["", Validators.required],
      academicYear: ["", Validators.required],
      tuitionFee: [0, [Validators.required, Validators.min(0)]],
      libraryFee: [0, [Validators.required, Validators.min(0)]],
      laboratoryFee: [0, [Validators.required, Validators.min(0)]],
      developmentFee: [0, [Validators.required, Validators.min(0)]],
      miscellaneousFee: [0, [Validators.required, Validators.min(0)]],
      dueDate: ["", Validators.required],
      lateFine: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadFeeStructures();
    this.setupFormCalculations();
  }

  loadFeeStructures(): void {
    this.loading = true;
    this.feeService.getFeeStructures().subscribe({
      next: (structures) => {
        this.feeStructures = structures;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load fee structures",
        });
        this.loading = false;
      },
    });
  }

  setupFormCalculations(): void {
    const feeFields = [
      "tuitionFee",
      "libraryFee",
      "laboratoryFee",
      "developmentFee",
      "miscellaneousFee",
    ];

    feeFields.forEach((field) => {
      this.feeStructureForm.get(field)?.valueChanges.subscribe(() => {
        this.calculateTotalFee();
      });
    });
  }

  calculateTotalFee(): number {
    const values = this.feeStructureForm.value;
    const total =
      (values.tuitionFee || 0) +
      (values.libraryFee || 0) +
      (values.laboratoryFee || 0) +
      (values.developmentFee || 0) +
      (values.miscellaneousFee || 0);
    return total;
  }

  openNewDialog(): void {
    this.editMode = false;
    this.selectedFeeStructure = null;
    this.feeStructureForm.reset();
    this.feeStructureForm.patchValue({ isActive: true });
    this.displayDialog = true;
  }

  editFeeStructure(feeStructure: FeeStructure): void {
    this.editMode = true;
    this.selectedFeeStructure = feeStructure;
    this.feeStructureForm.patchValue({
      ...feeStructure,
      dueDate: new Date(feeStructure.dueDate),
    });
    this.displayDialog = true;
  }

  saveFeeStructure(): void {
    if (this.feeStructureForm.valid) {
      const formValue = this.feeStructureForm.value;
      const feeStructureData: Partial<FeeStructure> = {
        ...formValue,
        totalFee: this.calculateTotalFee(),
        dueDate: formValue.dueDate.toISOString().split("T")[0],
      };

      if (this.editMode && this.selectedFeeStructure) {
        this.feeService
          .updateFeeStructure(this.selectedFeeStructure.id, feeStructureData)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Fee structure updated successfully",
              });
              this.loadFeeStructures();
              this.displayDialog = false;
            },
            error: () => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to update fee structure",
              });
            },
          });
      } else {
        this.feeService.createFeeStructure(feeStructureData).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Fee structure created successfully",
            });
            this.loadFeeStructures();
            this.displayDialog = false;
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to create fee structure",
            });
          },
        });
      }
    }
  }

  deleteFeeStructure(feeStructure: FeeStructure): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this fee structure?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.feeService.deleteFeeStructure(feeStructure.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Fee structure deleted successfully",
            });
            this.loadFeeStructures();
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete fee structure",
            });
          },
        });
      },
    });
  }

  toggleStatus(feeStructure: FeeStructure): void {
    const updatedStructure = {
      ...feeStructure,
      isActive: !feeStructure.isActive,
    };
    this.feeService
      .updateFeeStructure(feeStructure.id, updatedStructure)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Fee structure ${updatedStructure.isActive ? "activated" : "deactivated"} successfully`,
          });
          this.loadFeeStructures();
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update fee structure status",
          });
        },
      });
  }

  getSeverity(isActive: boolean): string {
    return isActive ? "success" : "danger";
  }

  getStatusText(isActive: boolean): string {
    return isActive ? "Active" : "Inactive";
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  }
}
