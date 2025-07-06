import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";

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
    totalUsers: 1547,
    activeUsers: 1389,
    totalCourses: 52,
    totalSubjects: 387,
    pendingAdmissions: 31,
    enrolledStudents: 1203,
    facultyMembers: 94,
    admissionOfficers: 15,
  });

  constructor() {
    // Simulate real-time updates
    this.simulateRealTimeUpdates();
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.dashboardStatsSubject.asObservable().pipe(delay(500));
  }

  getRecentActivities(): Observable<any[]> {
    const activities = [
      {
        id: 1,
        type: "user_created",
        message:
          "New faculty member Dr. Sarah Wilson added to Computer Science department",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        severity: "success",
        user: "Admin Manager",
        details: ["Faculty Role", "Computer Science Dept"],
      },
      {
        id: 2,
        type: "course_updated",
        message: "Computer Science course curriculum updated for 2024-25 batch",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        severity: "info",
        user: "Academic Head",
        details: ["Curriculum Update", "2024-25 Batch"],
      },
      {
        id: 3,
        type: "user_deactivated",
        message: "Student account STU2024-123 temporarily suspended",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        severity: "warning",
        user: "Student Affairs",
        details: ["Temporary Suspension", "Disciplinary Action"],
      },
      {
        id: 4,
        type: "admission_approved",
        message:
          "Batch approval: 31 new admissions processed for Engineering courses",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: "success",
        user: "Admission Officer",
        details: ["Batch Processing", "Engineering Courses"],
      },
      {
        id: 5,
        type: "subject_allocated",
        message:
          "Advanced Mathematics subjects allocated to Engineering and Science courses",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: "info",
        user: "Academic Coordinator",
        details: ["Auto Assignment", "Load Balancing"],
      },
      {
        id: 6,
        type: "system_backup",
        message: "Daily system backup completed successfully",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        severity: "success",
        user: "System Administrator",
        details: ["Automated Backup", "All Databases"],
      },
      {
        id: 7,
        type: "fee_payment",
        message: "Monthly fee collection report generated - ₹12.3L collected",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        severity: "info",
        user: "Accounts Manager",
        details: ["Monthly Report", "₹12.3L Collected"],
      },
    ];

    return of(activities).pipe(delay(300));
  }

  getSystemHealth(): Observable<any> {
    const health = {
      database: {
        status: "healthy",
        responseTime: "8ms",
        uptime: "99.9%",
        connections: "45/100",
      },
      application: {
        status: "healthy",
        uptime: "23d 14h 52m",
        usage: "45%",
        memory: "2.1GB/4GB",
      },
      storage: {
        status: "healthy",
        usage: "67%",
        available: "128GB",
        iops: "2.5K",
      },
      backup: {
        status: "healthy",
        lastBackup: "3 hours ago",
        size: "2.3GB",
        nextBackup: "9 hours",
      },
      network: {
        status: "healthy",
        latency: "12ms",
        bandwidth: "850 Mbps",
        uptime: "99.8%",
      },
    };

    return of(health).pipe(delay(400));
  }

  // New method for real-time stats simulation
  private simulateRealTimeUpdates() {
    setInterval(() => {
      const currentStats = this.dashboardStatsSubject.value;
      const updatedStats = {
        ...currentStats,
        activeUsers:
          currentStats.activeUsers + Math.floor(Math.random() * 10) - 5,
        pendingAdmissions: Math.max(
          0,
          currentStats.pendingAdmissions + Math.floor(Math.random() * 3) - 1,
        ),
      };

      // Ensure active users don't exceed total users
      updatedStats.activeUsers = Math.min(
        updatedStats.activeUsers,
        updatedStats.totalUsers,
      );
      updatedStats.activeUsers = Math.max(0, updatedStats.activeUsers);

      this.dashboardStatsSubject.next(updatedStats);
    }, 30000); // Update every 30 seconds
  }

  // Method to refresh application status
  refreshApplicationStatus(): Observable<boolean> {
    return of(true).pipe(delay(1000));
  }

  // Method to get chart data
  getChartData(type: string, period: string): Observable<any> {
    const mockData = {
      userActivity: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Active Users",
            data: [120, 190, 150, 180, 200, 170, 160],
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
          },
        ],
      },
      admissions: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Approved",
            data: [45, 52, 38, 67, 73, 89],
            borderColor: "#38a169",
            backgroundColor: "rgba(56, 161, 105, 0.1)",
          },
          {
            label: "Pending",
            data: [12, 18, 25, 15, 31, 23],
            borderColor: "#d69e2e",
            backgroundColor: "rgba(214, 158, 46, 0.1)",
          },
        ],
      },
    };

    return of(mockData[type as keyof typeof mockData] || {}).pipe(delay(500));
  }
}
