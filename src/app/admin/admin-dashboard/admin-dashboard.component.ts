import { Component, OnInit } from "@angular/core";
import { AdminService, DashboardStats } from "../services/admin.service";

interface StatCard {
  id: string;
  label: string;
  value: number;
  detail: string;
  icon: string;
  iconClass: string;
  trend: string;
  trendIcon: string;
  trendClass: string;
  progress: number;
  progressText: string;
  progressClass: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  styleClass: string;
  cardClass: string;
  description: string;
}

interface PerformanceMetric {
  label: string;
  value: string;
  percentage: number;
  status: string;
  description: string;
}

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalSubjects: 0,
    pendingAdmissions: 0,
    enrolledStudents: 0,
    facultyMembers: 0,
    admissionOfficers: 0,
  };

  recentActivities: any[] = [];
  systemHealth: any = {};
  loading = true;

  quickActions: QuickAction[] = [
    {
      id: "users",
      label: "User Management",
      icon: "pi pi-users",
      route: "/admin/users",
      styleClass: "p-button-outlined action-users",
      cardClass: "users-card",
      description: "Manage system users and permissions",
    },
    {
      id: "courses",
      label: "Course Management",
      icon: "pi pi-book",
      route: "/admin/courses",
      styleClass: "p-button-outlined action-courses",
      cardClass: "courses-card",
      description: "Manage academic courses and programs",
    },
    {
      id: "subjects",
      label: "Subject Allocation",
      icon: "pi pi-sitemap",
      route: "/admin/subjects",
      styleClass: "p-button-outlined action-subjects",
      cardClass: "subjects-card",
      description: "Allocate subjects to courses",
    },
    {
      id: "reports",
      label: "System Reports",
      icon: "pi pi-chart-bar",
      route: "#",
      styleClass: "p-button-outlined action-reports",
      cardClass: "reports-card",
      description: "View detailed system reports",
    },
  ];

  performanceMetrics: PerformanceMetric[] = [
    {
      label: "System Performance",
      value: "95%",
      percentage: 95,
      status: "excellent",
      description: "Overall system performance",
    },
    {
      label: "User Satisfaction",
      value: "87%",
      percentage: 87,
      status: "good",
      description: "Based on user feedback",
    },
    {
      label: "Data Integrity",
      value: "100%",
      percentage: 100,
      status: "excellent",
      description: "Database consistency check",
    },
    {
      label: "Security Score",
      value: "92%",
      percentage: 92,
      status: "excellent",
      description: "Security compliance rating",
    },
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Load stats
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading stats:", error);
        this.loading = false;
      },
    });

    // Load recent activities
    this.adminService.getRecentActivities().subscribe({
      next: (activities) => {
        this.recentActivities = activities;
      },
      error: (error) => {
        console.error("Error loading activities:", error);
      },
    });

    // Load system health
    this.adminService.getSystemHealth().subscribe({
      next: (health) => {
        this.systemHealth = health;
      },
      error: (error) => {
        console.error("Error loading system health:", error);
      },
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case "user_created":
        return "pi pi-user-plus";
      case "user_deactivated":
        return "pi pi-user-minus";
      case "course_updated":
        return "pi pi-book";
      case "admission_approved":
        return "pi pi-check-circle";
      case "subject_allocated":
        return "pi pi-sitemap";
      default:
        return "pi pi-info-circle";
    }
  }

  getHealthIcon(status: string): string {
    return status === "healthy"
      ? "pi pi-check-circle"
      : "pi pi-exclamation-triangle";
  }

  getHealthSeverity(status: string): string {
    return status === "healthy" ? "success" : "danger";
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  trackByActivityId(index: number, activity: any): number {
    return activity.id;
  }

  trackByStatId(index: number, stat: StatCard): string {
    return stat.id;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  getStatCards(): StatCard[] {
    return [
      {
        id: "users",
        label: "Total Users",
        value: this.stats.totalUsers,
        detail: `${this.stats.activeUsers} active users`,
        icon: "pi pi-users",
        iconClass: "users",
        trend: "+12%",
        trendIcon: "pi pi-arrow-up",
        trendClass: "positive",
        progress:
          Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100) ||
          0,
        progressText: "Active Rate",
        progressClass: "success",
      },
      {
        id: "courses",
        label: "Academic Programs",
        value: this.stats.totalCourses,
        detail: `${this.stats.totalSubjects} total subjects`,
        icon: "pi pi-book",
        iconClass: "courses",
        trend: "+8%",
        trendIcon: "pi pi-arrow-up",
        trendClass: "positive",
        progress: 78,
        progressText: "Completion Rate",
        progressClass: "info",
      },
      {
        id: "admissions",
        label: "Pending Admissions",
        value: this.stats.pendingAdmissions,
        detail: `${this.stats.enrolledStudents} enrolled`,
        icon: "pi pi-file-edit",
        iconClass: "admissions",
        trend: "-5%",
        trendIcon: "pi pi-arrow-down",
        trendClass: "negative",
        progress:
          Math.round(
            (this.stats.pendingAdmissions /
              (this.stats.pendingAdmissions + this.stats.enrolledStudents)) *
              100,
          ) || 0,
        progressText: "Pending Rate",
        progressClass: "warning",
      },
      {
        id: "faculty",
        label: "Faculty & Staff",
        value: this.stats.facultyMembers + this.stats.admissionOfficers,
        detail: `${this.stats.facultyMembers} faculty, ${this.stats.admissionOfficers} officers`,
        icon: "pi pi-user-edit",
        iconClass: "faculty",
        trend: "+3%",
        trendIcon: "pi pi-arrow-up",
        trendClass: "positive",
        progress: 85,
        progressText: "Capacity",
        progressClass: "success",
      },
    ];
  }

  formatActivityType(type: string): string {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  trackByActionId(index: number, action: QuickAction): string {
    return action.id;
  }
}
