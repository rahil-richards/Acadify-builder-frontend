import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService, MenuItem } from "primeng/api";
import { FormService } from "./services/form.service";
import { AdmissionStatusService } from "./services/admission-status.service";

@Component({
  selector: "app-admission",
  templateUrl: "./admission.component.html",
  styleUrls: ["./admission.component.scss"],
})
export class AdmissionComponent implements OnInit {
  activeIndex: number = 0;
  steps: MenuItem[] = [];

  personalDetailsForm!: FormGroup;
  categoryEligibilityForm!: FormGroup;
  academicQualificationsForm!: FormGroup;
  parentGuardianForm!: FormGroup;
  documentsDeclarationForm!: FormGroup;

  isSubmitting = false;
  isEditMode = false;
  editApplicationId: string | null = null;

  constructor(
    private formService: FormService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private admissionStatusService: AdmissionStatusService,
  ) {}

  ngOnInit() {
    // Check if in edit mode
    this.route.queryParams.subscribe((params) => {
      this.isEditMode = params["edit"] === "true";
      this.editApplicationId = params["applicationId"] || null;
    });

    this.initializeSteps();
    this.initializeForms();

    if (this.isEditMode) {
      this.loadExistingData();
    } else {
      this.loadSavedData();
    }
  }

  loadExistingData() {
    // In a real application, this would load data from the rejected application
    // For now, we'll load any saved form data
    this.loadSavedData();
  }

  initializeSteps() {
    this.steps = [
      {
        label: "Personal Details",
        command: (event: any) => (this.activeIndex = 0),
      },
      {
        label: "Category & Eligibility",
        command: (event: any) => (this.activeIndex = 1),
      },
      {
        label: "Academic Qualifications",
        command: (event: any) => (this.activeIndex = 2),
      },
      {
        label: "Parent / Guardian Details",
        command: (event: any) => (this.activeIndex = 3),
      },
      {
        label: "Document Upload & Declaration",
        command: (event: any) => (this.activeIndex = 4),
      },
    ];
  }

  initializeForms() {
    this.personalDetailsForm = this.formService.createPersonalDetailsForm();
    this.categoryEligibilityForm =
      this.formService.createCategoryEligibilityForm();
    this.academicQualificationsForm =
      this.formService.createAcademicQualificationsForm();
    this.parentGuardianForm = this.formService.createParentGuardianForm();
    this.documentsDeclarationForm =
      this.formService.createDocumentsDeclarationForm();

    // Load saved data if any
    this.loadSavedData();
  }

  loadSavedData() {
    const savedData = this.formService.getFormData();

    if (savedData.personalDetails) {
      this.personalDetailsForm.patchValue(savedData.personalDetails);
    }
    if (savedData.categoryEligibility) {
      this.categoryEligibilityForm.patchValue(savedData.categoryEligibility);
    }
    if (savedData.academicQualifications) {
      this.academicQualificationsForm.patchValue(
        savedData.academicQualifications,
      );
    }
    if (savedData.parentGuardian) {
      this.parentGuardianForm.patchValue(savedData.parentGuardian);
    }
    if (savedData.documentsDeclaration) {
      this.documentsDeclarationForm.patchValue(savedData.documentsDeclaration);
    }
  }

  getCurrentForm(): FormGroup {
    switch (this.activeIndex) {
      case 0:
        return this.personalDetailsForm;
      case 1:
        return this.categoryEligibilityForm;
      case 2:
        return this.academicQualificationsForm;
      case 3:
        return this.parentGuardianForm;
      case 4:
        return this.documentsDeclarationForm;
      default:
        return this.personalDetailsForm;
    }
  }

  isCurrentStepValid(): boolean {
    return this.getCurrentForm().valid;
  }

  canProceed(): boolean {
    return this.isCurrentStepValid();
  }

  nextStep() {
    if (this.canProceed() && this.activeIndex < this.steps.length - 1) {
      this.saveCurrentStepData();
      this.activeIndex++;
    } else if (!this.canProceed()) {
      this.markFormGroupTouched(this.getCurrentForm());
      this.messageService.add({
        severity: "error",
        summary: "Validation Error",
        detail:
          "Please fill in all required fields correctly before proceeding.",
      });
    }
  }

  previousStep() {
    if (this.activeIndex > 0) {
      this.saveCurrentStepData();
      this.activeIndex--;
    }
  }

  saveCurrentStepData() {
    const currentForm = this.getCurrentForm();
    if (currentForm.valid) {
      switch (this.activeIndex) {
        case 0:
          this.formService.saveFormData("personalDetails", currentForm.value);
          break;
        case 1:
          this.formService.saveFormData(
            "categoryEligibility",
            currentForm.value,
          );
          break;
        case 2:
          this.formService.saveFormData(
            "academicQualifications",
            currentForm.value,
          );
          break;
        case 3:
          this.formService.saveFormData("parentGuardian", currentForm.value);
          break;
        case 4:
          this.formService.saveFormData(
            "documentsDeclaration",
            currentForm.value,
          );
          break;
      }
    }
  }

  async submitApplication() {
    if (!this.isCurrentStepValid()) {
      this.markFormGroupTouched(this.getCurrentForm());
      this.messageService.add({
        severity: "error",
        summary: "Validation Error",
        detail:
          "Please fill in all required fields correctly before submitting.",
      });
      return;
    }

    this.saveCurrentStepData();
    this.isSubmitting = true;

    try {
      if (this.isEditMode && this.editApplicationId) {
        // Resubmit application
        await this.admissionStatusService
          .resubmitApplication(
            this.editApplicationId,
            this.formService.getFormData(),
          )
          .toPromise();

        this.messageService.add({
          severity: "success",
          summary: "Application Resubmitted",
          detail:
            "Your application has been resubmitted successfully for review.",
          life: 10000,
        });

        // Redirect to status page
        setTimeout(() => {
          this.router.navigate(["/admission/status"]);
        }, 2000);
      } else {
        // New application submission
        const result = await this.formService.submitApplication();

        this.messageService.add({
          severity: "success",
          summary: "Application Submitted",
          detail: `Your application has been submitted successfully. Application ID: ${result.applicationId}`,
          life: 10000,
        });

        // Redirect to status page
        setTimeout(() => {
          this.router.navigate(["/admission/status"]);
        }, 2000);
      }
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Submission Failed",
        detail: "Failed to submit application. Please try again.",
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getStepTitle(): string {
    return this.steps[this.activeIndex]?.label || "";
  }

  isFirstStep(): boolean {
    return this.activeIndex === 0;
  }

  isLastStep(): boolean {
    return this.activeIndex === this.steps.length - 1;
  }

  // Helper methods for enhanced UI
  getStepIcon(): string {
    const icons = ["user", "flag", "graduation-cap", "users", "file-upload"];
    return icons[this.activeIndex] || "file";
  }

  getStepDescription(): string {
    const descriptions = [
      "Enter your basic personal information and contact details",
      "Specify your category, eligibility criteria and course preferences",
      "Provide details about your educational background and qualifications",
      "Add information about your parent or guardian",
      "Upload required documents and complete the declaration",
    ];
    return descriptions[this.activeIndex] || "";
  }
}
