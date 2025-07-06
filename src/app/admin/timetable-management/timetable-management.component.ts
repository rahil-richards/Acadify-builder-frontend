import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject as RxSubject, interval } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MessageService, ConfirmationService } from "primeng/api";

interface TimeSlot {
  id: string;
  time: string;
  duration: number; // in minutes
}

interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  credits: number;
  type: "theory" | "practical" | "lab";
}

interface Faculty {
  id: string;
  name: string;
  department: string;
  subjects: string[]; // subject IDs they can teach
  isHOD: boolean;
  email: string;
  avatar?: string;
}

interface Class {
  id: string;
  name: string;
  year: number;
  section: string;
  strength: number;
}

interface LectureSlot {
  id: string;
  classId: string;
  subjectId?: string;
  facultyId?: string;
  timeSlotId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  roomNumber?: string;
  type: "theory" | "practical" | "lab";
  notes?: string;
  isAssigned: boolean;
}

interface ConflictInfo {
  type: "faculty" | "room" | "class";
  message: string;
  conflictingSlots: string[];
}

@Component({
  selector: "app-timetable-management",
  templateUrl: "./timetable-management.component.html",
  styleUrls: ["./timetable-management.component.scss"],
  providers: [MessageService, ConfirmationService],
})
export class TimetableManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new RxSubject<void>();
  currentTime = new Date();

  // Selected class and week
  selectedClass: Class | null = null;
  selectedWeek = new Date();

  // Data arrays
  classes: Class[] = [];
  subjects: Subject[] = [];
  faculties: Faculty[] = [];
  timeSlots: TimeSlot[] = [];
  lectureSlots: LectureSlot[] = [];

  // UI state
  loading = false;
  selectedSlot: LectureSlot | null = null;
  showAssignmentDialog = false;
  selectedSubjectId = "";
  selectedFacultyId = "";

  // Days of week
  daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Available subjects for drag and drop
  availableSubjects: Subject[] = [];

  // Conflict detection
  conflicts: Map<string, ConflictInfo[]> = new Map();

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.initializeData();
    this.startTimeUpdate();
    this.generateTimeSlots();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startTimeUpdate() {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
      });
  }

  private initializeData() {
    this.loading = true;

    // Mock data - in real app, this would come from services
    this.classes = [
      {
        id: "1",
        name: "B.Pharm First Year",
        year: 1,
        section: "A",
        strength: 60,
      },
      {
        id: "2",
        name: "B.Pharm First Year",
        year: 1,
        section: "B",
        strength: 58,
      },
      {
        id: "3",
        name: "B.Pharm Second Year",
        year: 2,
        section: "A",
        strength: 55,
      },
      {
        id: "4",
        name: "B.Pharm Second Year",
        year: 2,
        section: "B",
        strength: 52,
      },
      {
        id: "5",
        name: "B.Pharm Third Year",
        year: 3,
        section: "A",
        strength: 48,
      },
      {
        id: "6",
        name: "B.Pharm Fourth Year",
        year: 4,
        section: "A",
        strength: 45,
      },
    ];

    this.subjects = [
      {
        id: "1",
        name: "Pharmaceutical Chemistry",
        code: "PC101",
        color: "#3b82f6",
        credits: 4,
        type: "theory",
      },
      {
        id: "2",
        name: "Pharmacology",
        code: "PL101",
        color: "#10b981",
        credits: 4,
        type: "theory",
      },
      {
        id: "3",
        name: "Pharmaceutics",
        code: "PT101",
        color: "#f59e0b",
        credits: 4,
        type: "theory",
      },
      {
        id: "4",
        name: "Pharmacognosy",
        code: "PG101",
        color: "#ef4444",
        credits: 3,
        type: "theory",
      },
      {
        id: "5",
        name: "Biochemistry",
        code: "BC101",
        color: "#8b5cf6",
        credits: 3,
        type: "theory",
      },
      {
        id: "6",
        name: "Microbiology",
        code: "MB101",
        color: "#06b6d4",
        credits: 3,
        type: "theory",
      },
      {
        id: "7",
        name: "PC Lab",
        code: "PCL101",
        color: "#3b82f6",
        credits: 2,
        type: "lab",
      },
      {
        id: "8",
        name: "PL Lab",
        code: "PLL101",
        color: "#10b981",
        credits: 2,
        type: "lab",
      },
      {
        id: "9",
        name: "PT Practical",
        code: "PTP101",
        color: "#f59e0b",
        credits: 2,
        type: "practical",
      },
    ];

    this.faculties = [
      {
        id: "1",
        name: "Dr. Sarah Wilson",
        department: "Pharmaceutical Chemistry",
        subjects: ["1", "7"],
        isHOD: true,
        email: "sarah.wilson@college.edu",
      },
      {
        id: "2",
        name: "Dr. John Smith",
        department: "Pharmacology",
        subjects: ["2", "8"],
        isHOD: false,
        email: "john.smith@college.edu",
      },
      {
        id: "3",
        name: "Dr. Emily Brown",
        department: "Pharmaceutics",
        subjects: ["3", "9"],
        isHOD: true,
        email: "emily.brown@college.edu",
      },
      {
        id: "4",
        name: "Dr. Michael Davis",
        department: "Pharmacognosy",
        subjects: ["4"],
        isHOD: false,
        email: "michael.davis@college.edu",
      },
      {
        id: "5",
        name: "Dr. Lisa Johnson",
        department: "Biochemistry",
        subjects: ["5"],
        isHOD: false,
        email: "lisa.johnson@college.edu",
      },
      {
        id: "6",
        name: "Dr. Robert Lee",
        department: "Microbiology",
        subjects: ["6"],
        isHOD: false,
        email: "robert.lee@college.edu",
      },
    ];

    // Set default selected class
    this.selectedClass = this.classes[0];
    this.availableSubjects = [...this.subjects];

    this.generateEmptyTimetable();
    this.loading = false;
  }

  private generateTimeSlots() {
    this.timeSlots = [
      { id: "1", time: "09:00 - 10:00", duration: 60 },
      { id: "2", time: "10:00 - 11:00", duration: 60 },
      { id: "3", time: "11:15 - 12:15", duration: 60 },
      { id: "4", time: "12:15 - 13:15", duration: 60 },
      { id: "5", time: "14:00 - 15:00", duration: 60 },
      { id: "6", time: "15:00 - 16:00", duration: 60 },
      { id: "7", time: "16:15 - 17:15", duration: 60 },
      { id: "8", time: "17:15 - 18:15", duration: 60 },
    ];
  }

  private generateEmptyTimetable() {
    if (!this.selectedClass) return;

    this.lectureSlots = [];

    // Generate empty slots for each day and time
    for (let day = 0; day < 6; day++) {
      // Monday to Saturday
      for (let timeSlot of this.timeSlots) {
        this.lectureSlots.push({
          id: `${this.selectedClass.id}_${day}_${timeSlot.id}`,
          classId: this.selectedClass.id,
          timeSlotId: timeSlot.id,
          dayOfWeek: day,
          type: "theory",
          isAssigned: false,
        });
      }
    }
  }

  // Class selection methods
  onClassChange(selectedClass: Class) {
    this.selectedClass = selectedClass;
    this.generateEmptyTimetable();
    this.detectConflicts();
  }

  // Faculty assignment
  assignFaculty(facultyId: string) {
    if (!this.selectedSlot) return;

    const faculty = this.faculties.find((f) => f.id === facultyId);
    const subject = this.subjects.find(
      (s) => s.id === this.selectedSlot?.subjectId,
    );

    if (!faculty || !subject) return;

    // Check if faculty can teach this subject
    if (!faculty.subjects.includes(subject.id)) {
      this.messageService.add({
        severity: "error",
        summary: "Assignment Error",
        detail: `${faculty.name} is not qualified to teach ${subject.name}`,
        life: 4000,
      });
      return;
    }

    // Check for conflicts
    const conflict = this.checkFacultyConflict(facultyId, this.selectedSlot);
    if (conflict) {
      this.messageService.add({
        severity: "error",
        summary: "Schedule Conflict",
        detail: conflict.message,
        life: 4000,
      });
      return;
    }

    // Assign faculty to slot
    const slotIndex = this.lectureSlots.findIndex(
      (s) => s.id === this.selectedSlot!.id,
    );
    if (slotIndex !== -1) {
      this.lectureSlots[slotIndex] = {
        ...this.selectedSlot,
        facultyId: facultyId,
        isAssigned: true,
      };
    }

    this.detectConflicts();
    this.showAssignmentDialog = false;
    this.selectedSlot = null;

    this.messageService.add({
      severity: "success",
      summary: "Assignment Successful",
      detail: `${faculty.name} assigned to ${subject.name}`,
      life: 3000,
    });
  }

  // Conflict detection
  private checkFacultyConflict(
    facultyId: string,
    newSlot: LectureSlot,
  ): ConflictInfo | null {
    const conflictingSlot = this.lectureSlots.find(
      (slot) =>
        slot.facultyId === facultyId &&
        slot.dayOfWeek === newSlot.dayOfWeek &&
        slot.timeSlotId === newSlot.timeSlotId &&
        slot.id !== newSlot.id &&
        slot.isAssigned,
    );

    if (conflictingSlot) {
      const faculty = this.faculties.find((f) => f.id === facultyId);
      return {
        type: "faculty",
        message: `${faculty?.name} is already assigned to another class at this time`,
        conflictingSlots: [conflictingSlot.id],
      };
    }

    return null;
  }

  private detectConflicts() {
    this.conflicts.clear();

    // Check for faculty conflicts
    this.lectureSlots
      .filter((slot) => slot.isAssigned && slot.facultyId)
      .forEach((slot) => {
        const conflict = this.checkFacultyConflict(slot.facultyId!, slot);
        if (conflict) {
          this.conflicts.set(slot.id, [conflict]);
        }
      });
  }

  // Utility methods
  getSlotForDayAndTime(
    day: number,
    timeSlotId: string,
  ): LectureSlot | undefined {
    return this.lectureSlots.find(
      (slot) => slot.dayOfWeek === day && slot.timeSlotId === timeSlotId,
    );
  }

  getSubjectById(id: string): Subject | undefined {
    return this.subjects.find((s) => s.id === id);
  }

  getFacultyById(id: string): Faculty | undefined {
    return this.faculties.find((f) => f.id === id);
  }

  getQualifiedFaculties(subjectId: string): Faculty[] {
    return this.faculties.filter((faculty) =>
      faculty.subjects.includes(subjectId),
    );
  }

  removeAssignment(slot: LectureSlot) {
    this.confirmationService.confirm({
      message: "Are you sure you want to remove this assignment?",
      header: "Confirm Removal",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        const slotIndex = this.lectureSlots.findIndex((s) => s.id === slot.id);
        if (slotIndex !== -1) {
          this.lectureSlots[slotIndex] = {
            ...slot,
            subjectId: undefined,
            facultyId: undefined,
            isAssigned: false,
            roomNumber: undefined,
            notes: undefined,
          };
        }

        this.detectConflicts();
        this.messageService.add({
          severity: "info",
          summary: "Assignment Removed",
          detail: "Lecture assignment has been removed",
          life: 2000,
        });
      },
    });
  }

  // Save timetable
  saveTimetable() {
    this.loading = true;

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.messageService.add({
        severity: "success",
        summary: "Timetable Saved",
        detail: `Timetable for ${this.selectedClass?.name} ${this.selectedClass?.section} has been saved successfully`,
        life: 3000,
      });
    }, 1500);
  }

  // Generate auto timetable
  generateAutoTimetable() {
    this.confirmationService.confirm({
      message:
        "This will overwrite existing assignments. Do you want to continue?",
      header: "Auto Generate Timetable",
      icon: "pi pi-question-circle",
      accept: () => {
        this.loading = true;

        // Simple auto-assignment logic
        setTimeout(() => {
          this.autoAssignSubjects();
          this.loading = false;
          this.messageService.add({
            severity: "success",
            summary: "Auto Generation Complete",
            detail: "Timetable has been automatically generated",
            life: 3000,
          });
        }, 2000);
      },
    });
  }

  private autoAssignSubjects() {
    // Reset all assignments
    this.lectureSlots.forEach((slot) => {
      slot.subjectId = undefined;
      slot.facultyId = undefined;
      slot.isAssigned = false;
    });

    let subjectIndex = 0;
    const theorySubjects = this.subjects.filter((s) => s.type === "theory");

    // Assign theory subjects first
    for (let day = 0; day < 5; day++) {
      // Monday to Friday
      for (let timeIndex = 0; timeIndex < 6; timeIndex++) {
        // First 6 time slots
        if (subjectIndex >= theorySubjects.length) break;

        const slot = this.getSlotForDayAndTime(
          day,
          this.timeSlots[timeIndex].id,
        );
        const subject = theorySubjects[subjectIndex];
        const qualifiedFaculties = this.getQualifiedFaculties(subject.id);

        if (slot && qualifiedFaculties.length > 0) {
          // Try to assign a faculty without conflicts
          for (let faculty of qualifiedFaculties) {
            const conflict = this.checkFacultyConflict(faculty.id, slot);
            if (!conflict) {
              slot.subjectId = subject.id;
              slot.facultyId = faculty.id;
              slot.type = subject.type;
              slot.isAssigned = true;
              break;
            }
          }
        }

        subjectIndex = (subjectIndex + 1) % theorySubjects.length;
      }
    }

    this.detectConflicts();
  }

  // Export methods
  exportTimetable() {
    this.messageService.add({
      severity: "info",
      summary: "Export Started",
      detail: "Timetable export has been initiated",
      life: 2000,
    });
  }

  printTimetable() {
    window.print();
  }

  // Dialog methods
  openSlotAssignment(slot: LectureSlot) {
    this.selectedSlot = { ...slot }; // Create a copy to ensure change detection
    this.showAssignmentDialog = true;
  }

  closeAssignmentDialog() {
    this.showAssignmentDialog = false;
    this.selectedSlot = null;
    this.selectedSubjectId = "";
    this.selectedFacultyId = "";
  }

  // Assign lecture with form data
  assignLecture() {
    if (
      !this.selectedSlot ||
      !this.selectedSubjectId ||
      !this.selectedFacultyId
    ) {
      this.messageService.add({
        severity: "warn",
        summary: "Incomplete Information",
        detail: "Please select both subject and faculty",
        life: 3000,
      });
      return;
    }

    const subject = this.subjects.find((s) => s.id === this.selectedSubjectId);
    const faculty = this.faculties.find((f) => f.id === this.selectedFacultyId);

    if (!subject || !faculty) return;

    // Check if faculty can teach this subject
    if (!faculty.subjects.includes(subject.id)) {
      this.messageService.add({
        severity: "warn",
        summary: "Invalid Assignment",
        detail: `${faculty.name} is not qualified to teach ${subject.name}`,
        life: 3000,
      });
      return;
    }

    this.selectedSlot.subjectId = this.selectedSubjectId;
    this.selectedSlot.facultyId = this.selectedFacultyId;
    this.selectedSlot.type = subject.type;
    this.selectedSlot.isAssigned = true;

    this.closeAssignmentDialog();
    this.detectConflicts();

    this.messageService.add({
      severity: "success",
      summary: "Lecture Assigned",
      detail: `${subject.name} assigned to ${faculty.name}`,
      life: 3000,
    });
  }

  // Helper methods for template calculations
  getAssignedLecturesCount(): number {
    return this.lectureSlots.filter((s) => s.isAssigned).length;
  }

  getFacultiesCount(): number {
    return this.faculties.length;
  }

  getSubjectsCount(): number {
    return this.subjects.length;
  }

  getConflictsCount(): number {
    return this.conflicts.size;
  }

  // Helper methods for template
  getTimeSlotTime(timeSlotId: string): string {
    const timeSlot = this.timeSlots.find((t) => t.id === timeSlotId);
    return timeSlot ? timeSlot.time : "";
  }

  hasQualifiedFaculties(subjectId: string): boolean {
    return this.getQualifiedFaculties(subjectId).length > 0;
  }

  hasNoQualifiedFaculties(subjectId: string): boolean {
    return this.getQualifiedFaculties(subjectId).length === 0;
  }

  // Get qualified faculties for form dropdown
  getQualifiedFacultiesForSelectedSubject(): Faculty[] {
    if (!this.selectedSubjectId) return [];
    return this.getQualifiedFaculties(this.selectedSubjectId);
  }

  // Helper method to get lecture count for a specific day
  getDayLectureCount(dayIndex: number): number {
    return this.lectureSlots.filter(
      (slot) => slot.dayOfWeek === dayIndex && slot.isAssigned,
    ).length;
  }

  // Track by functions for performance optimization
  trackByClassId(index: number, classItem: Class): string {
    return classItem.id;
  }

  trackByTimeSlot(index: number, timeSlot: TimeSlot): string {
    return timeSlot.id;
  }
}
