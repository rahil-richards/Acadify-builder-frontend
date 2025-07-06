import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { AdminService, DashboardStats } from "../services/admin.service";
import { MessageService } from "primeng/api";

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
  cardClass: string;
  detailRoute: string;
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

interface TimePeriod {
  label: string;
  value: string;
}

interface Alert {
  id: string;
  message: string;
  severity: string;
  icon: string;
  timestamp: Date;
}

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild("userActivityChart")
  userActivityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild("admissionChart") admissionChart!: ElementRef<HTMLCanvasElement>;

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
  showCharts = true;

  // Cache formatted times to prevent ExpressionChangedAfterItHasBeenCheckedError
  private formattedTimes: Map<number, string> = new Map();
  private timeUpdateInterval: any;

  // New properties for enhanced dashboard
  selectedPeriod = "7d";
  selectedChartPeriod = "30d";
  activeAlerts: Alert[] = [];

  timePeriods: TimePeriod[] = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last Year", value: "1y" },
  ];

  chartPeriods: TimePeriod[] = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 90 Days", value: "90d" },
  ];

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

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.initializeAlerts();
    this.startTimeUpdateInterval();
  }

  ngAfterViewInit() {
    // Initialize charts after view is loaded
    setTimeout(() => {
      if (this.showCharts) {
        this.initializeCharts();
      }
    }, 500);
  }

  ngOnDestroy() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  loadDashboardData() {
    this.loading = true;

    // Load stats
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        this.showSuccess("Dashboard data loaded successfully");
      },
      error: (error) => {
        console.error("Error loading stats:", error);
        this.loading = false;
        this.showError("Failed to load dashboard data");
      },
    });

    // Load recent activities
    this.adminService.getRecentActivities().subscribe({
      next: (activities) => {
        this.recentActivities = activities.map((activity) => ({
          ...activity,
          user: "Admin User", // Add user info
          details: this.getActivityDetails(activity.type),
        }));
        this.updateFormattedTimes();
      },
      error: (error) => {
        console.error("Error loading activities:", error);
        this.showError("Failed to load recent activities");
      },
    });

    // Load system health
    this.adminService.getSystemHealth().subscribe({
      next: (health) => {
        this.systemHealth = health;
      },
      error: (error) => {
        console.error("Error loading system health:", error);
        this.showError("Failed to load system health data");
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
    const activityId = date.getTime();
    return this.formattedTimes.get(activityId) || this.calculateTimeAgo(date);
  }

  private calculateTimeAgo(date: Date): string {
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
        cardClass: "users-card",
        detailRoute: "/admin/users",
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
        cardClass: "courses-card",
        detailRoute: "/admin/courses",
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
        cardClass: "admissions-card",
        detailRoute: "/admin/admissions",
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
        cardClass: "faculty-card",
        detailRoute: "/admin/faculty",
      },
      {
        id: "revenue",
        label: "Monthly Revenue",
        value: 245000,
        detail: "₹2.45 Lakhs this month",
        icon: "pi pi-money-bill",
        iconClass: "revenue",
        trend: "+15%",
        trendIcon: "pi pi-arrow-up",
        trendClass: "positive",
        progress: 92,
        progressText: "Target Achievement",
        progressClass: "success",
        cardClass: "revenue-card",
        detailRoute: "/admin/finance",
      },
      {
        id: "performance",
        label: "System Performance",
        value: 98,
        detail: "98% uptime this month",
        icon: "pi pi-chart-line",
        iconClass: "performance",
        trend: "+2%",
        trendIcon: "pi pi-arrow-up",
        trendClass: "positive",
        progress: 98,
        progressText: "Uptime",
        progressClass: "success",
        cardClass: "performance-card",
        detailRoute: "/admin/system",
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

  // New methods for enhanced dashboard
  formatNumber(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
  }

  showNotifications() {
    this.messageService.add({
      severity: "info",
      summary: "Notifications",
      detail: "You have 5 new notifications",
    });
  }

  openStatMenu(event: Event, stat: StatCard) {
    event.stopPropagation();
    // Implement stat menu logic
  }

  viewActivityDetails(activity: any) {
    this.messageService.add({
      severity: "info",
      summary: "Activity Details",
      detail: `Viewing details for: ${activity.message}`,
    });
  }

  showActivityFilter() {
    this.messageService.add({
      severity: "info",
      summary: "Filter",
      detail: "Activity filter opened",
    });
  }

  openActivityMenu(event: Event, activity: any) {
    event.stopPropagation();
    // Implement activity menu logic
  }

  openActionMenu(event: Event, action: QuickAction) {
    event.stopPropagation();
    // Implement action menu logic
  }

  getActionStat(actionId: string): string {
    const statMap: { [key: string]: string } = {
      users: `${this.stats.totalUsers} total`,
      courses: `${this.stats.totalCourses} active`,
      subjects: `${this.stats.totalSubjects} assigned`,
      reports: "12 generated",
    };
    return statMap[actionId] || "";
  }

  refreshMetrics() {
    this.loadDashboardData();
  }

  getActiveAlertsCount(): number {
    return this.activeAlerts.length;
  }

  getActiveAlerts(): Alert[] {
    return this.activeAlerts;
  }

  dismissAlert(alert: Alert) {
    this.activeAlerts = this.activeAlerts.filter((a) => a.id !== alert.id);
    this.showSuccess("Alert dismissed");
  }

  private initializeAlerts() {
    this.activeAlerts = [
      {
        id: "1",
        message: "Server backup is overdue",
        severity: "warning",
        icon: "pi pi-exclamation-triangle",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "2",
        message: "High memory usage detected",
        severity: "danger",
        icon: "pi pi-exclamation-circle",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ];
  }

  private getActivityDetails(type: string): string[] {
    const detailMap: { [key: string]: string[] } = {
      user_created: ["New account", "Faculty role"],
      course_updated: ["Curriculum revised", "Syllabus updated"],
      user_deactivated: ["Account suspended", "Policy violation"],
      admission_approved: ["Batch approval", "Merit based"],
      subject_allocated: ["Auto assignment", "Load balancing"],
    };
    return detailMap[type] || [];
  }

  private initializeCharts() {
    if (this.userActivityChart) {
      this.createUserActivityChart();
    }
    if (this.admissionChart) {
      this.createAdmissionChart();
    }
  }

  private createUserActivityChart() {
    const ctx = this.userActivityChart.nativeElement.getContext("2d");
    if (ctx) {
      // Simple chart creation - in real app, use Chart.js or similar
      ctx.fillStyle = "#667eea";
      ctx.fillRect(0, 150, 50, 50);
      ctx.fillStyle = "#764ba2";
      ctx.fillRect(60, 100, 50, 100);
      ctx.fillStyle = "#667eea";
      ctx.fillRect(120, 80, 50, 120);
      ctx.fillStyle = "#764ba2";
      ctx.fillRect(180, 60, 50, 140);
    }
  }

  private createAdmissionChart() {
    const ctx = this.admissionChart.nativeElement.getContext("2d");
    if (ctx) {
      // Simple chart creation - in real app, use Chart.js or similar
      ctx.strokeStyle = "#38a169";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 150);
      ctx.lineTo(100, 120);
      ctx.lineTo(200, 80);
      ctx.lineTo(350, 50);
      ctx.stroke();

      ctx.strokeStyle = "#d69e2e";
      ctx.beginPath();
      ctx.moveTo(0, 180);
      ctx.lineTo(100, 160);
      ctx.lineTo(200, 140);
      ctx.lineTo(350, 130);
      ctx.stroke();
    }
  }

  private showSuccess(message: string) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: message,
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }

  // New methods for the updated dashboard
  generateReport() {
    this.showSuccess("Report generation started");
    // Implement report generation logic
  }

  private startTimeUpdateInterval() {
    // Update formatted times every minute to keep them current
    this.timeUpdateInterval = setInterval(() => {
      this.updateFormattedTimes();
    }, 60000); // Update every minute
  }

  private updateFormattedTimes() {
    this.formattedTimes.clear();
    this.recentActivities.forEach((activity) => {
      const activityId = activity.timestamp.getTime();
      const formattedTime = this.calculateTimeAgo(activity.timestamp);
      this.formattedTimes.set(activityId, formattedTime);
    });
  }
}
