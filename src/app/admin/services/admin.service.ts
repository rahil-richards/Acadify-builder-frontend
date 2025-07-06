import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalSubjects: number;
  pendingAdmissions: number;
  enrolledStudents: number;
  facultyMembers: number;
  admissionOfficers: number;
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats>({
    totalUsers: 1247,
    activeUsers: 1189,
    totalCourses: 45,
    totalSubjects: 342,
    pendingAdmissions: 23,
    enrolledStudents: 876,
    facultyMembers: 89,
    admissionOfficers: 12,
  });

  constructor() {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.dashboardStatsSubject.asObservable().pipe(delay(500));
  }

  getRecentActivities(): Observable<any[]> {
    const activities = [
      {
        id: 1,
        type: "user_created",
        message: "New faculty member Dr. Sarah Wilson added",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        severity: "success",
      },
      {
        id: 2,
        type: "course_updated",
        message: "Computer Science course curriculum updated",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        severity: "info",
      },
      {
        id: 3,
        type: "user_deactivated",
        message: "Student account STU123 deactivated",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        severity: "warn",
      },
      {
        id: 4,
        type: "admission_approved",
        message: "23 new admissions approved",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: "success",
      },
      {
        id: 5,
        type: "subject_allocated",
        message: "Mathematics subjects allocated to Engineering courses",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: "info",
      },
    ];

    return of(activities).pipe(delay(300));
  }

  getSystemHealth(): Observable<any> {
    const health = {
      database: { status: "healthy", responseTime: "12ms" },
      application: { status: "healthy", uptime: "15d 8h 32m" },
      storage: { status: "healthy", usage: "67%" },
      backup: { status: "healthy", lastBackup: "2 hours ago" },
    };

    return of(health).pipe(delay(400));
  }
}
