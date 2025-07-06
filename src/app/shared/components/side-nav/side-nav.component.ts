import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { AuthService, User } from "../../../auth/services/auth.service";
import { PermissionService } from "../../../auth/services/permission.service";
import { UserRole, Permission } from "../../../auth/models/role.model";

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  command?: () => void;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

@Component({
  selector: "app-side-nav",
  templateUrl: "./side-nav.component.html",
  styleUrls: ["./side-nav.component.scss"],
  animations: [
    trigger("slideInOut", [
      state("in", style({ transform: "translateX(0)" })),
      transition("void => *", [
        style({ transform: "translateX(-100%)" }),
        animate(400, style({ transform: "translateX(0)" })),
      ]),
      transition("* => void", [
        animate(400, style({ transform: "translateX(-100%)" })),
      ]),
    ]),
    trigger("fadeInOut", [
      state("in", style({ opacity: 1 })),
      transition("void => *", [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
      transition("* => void", [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class SideNavComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  currentUser: User | null = null;
  menuSections: MenuSection[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    public router: Router,
    private authService: AuthService,
    private permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
        this.loadMenuSections();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMenuSections(): void {
    if (!this.currentUser) {
      this.menuSections = [];
      return;
    }

    const userRole = this.currentUser.role as UserRole;
    this.menuSections = [];

    // Main Dashboard (always first)
    this.menuSections.push({
      label: "Dashboard",
      items: [
        {
          label: this.getDashboardLabel(),
          icon: "pi pi-home",
          route: this.getDashboardRoute(),
        },
      ],
    });

    // Admin sections
    if (this.hasRole([UserRole.ADMIN])) {
      this.menuSections.push({
        label: "Administration",
        items: [
          {
            label: "User Management",
            icon: "pi pi-users",
            route: "/admin/users",
          },
          {
            label: "Course Management",
            icon: "pi pi-book",
            route: "/admin/courses",
          },
          {
            label: "Subject Allocation",
            icon: "pi pi-sitemap",
            route: "/admin/subjects",
          },
          {
            label: "Timetable Management",
            icon: "pi pi-calendar",
            route: "/admin/timetable-management",
          },
          {
            label: "System Settings",
            icon: "pi pi-cog",
            route: "/admin/settings",
          },
        ],
      });
    }

    // Faculty sections
    if (this.hasRole([UserRole.FACULTY, UserRole.HOD, UserRole.ADMIN])) {
      this.menuSections.push({
        label: "Faculty Portal",
        items: [
          {
            label: "Faculty Dashboard",
            icon: "pi pi-th-large",
            route: "/faculty",
          },
          {
            label: "My Courses",
            icon: "pi pi-book",
            route: "/faculty/courses",
          },
          {
            label: "Faculty Assignment",
            icon: "pi pi-users",
            route: "/faculty/assignment",
          },
          {
            label: "My Attendance",
            icon: "pi pi-clock",
            route: "/faculty/attendance",
          },
          {
            label: "Leave Management",
            icon: "pi pi-calendar-times",
            route: "/faculty/leaves",
          },
        ],
      });
    }

    // Student sections (only for students)
    if (this.hasRole([UserRole.STUDENT])) {
      this.menuSections.push({
        label: "Student Portal",
        items: [
          {
            label: "My Timetable",
            icon: "pi pi-calendar",
            route: "/dashboard/timetable",
          },
          {
            label: "My Attendance",
            icon: "pi pi-check-circle",
            route: "/dashboard/attendance",
          },
          {
            label: "My Grades",
            icon: "pi pi-star",
            route: "/dashboard/grades",
          },
          {
            label: "Assignments",
            icon: "pi pi-file",
            route: "/dashboard/assignments",
          },
          {
            label: "My Profile",
            icon: "pi pi-user",
            route: "/dashboard/profile",
          },
        ],
      });
    }

    // Admission sections (only for students who haven't been admitted yet, or guests)
    if (
      this.hasRole([UserRole.GUEST]) ||
      (!this.currentUser.role && !this.isAuthenticated())
    ) {
      this.menuSections.push({
        label: "Admission Portal",
        items: [
          {
            label: "Apply for Admission",
            icon: "pi pi-file-edit",
            route: "/admission",
          },
          {
            label: "Application Status",
            icon: "pi pi-info-circle",
            route: "/admission/status",
          },
          {
            label: "Fee Payment",
            icon: "pi pi-credit-card",
            route: "/admission/payment",
          },
        ],
      });
    }

    // Admission Officer sections
    if (this.hasRole([UserRole.ADMISSION_OFFICER, UserRole.ADMIN])) {
      this.menuSections.push({
        label: "Admission Management",
        items: [
          {
            label: "Applications Overview",
            icon: "pi pi-chart-bar",
            route: "/admission-officer",
          },
          {
            label: "Review Applications",
            icon: "pi pi-file-check",
            route: "/admission-officer/review",
          },
          {
            label: "Admission Statistics",
            icon: "pi pi-chart-pie",
            route: "/admission-officer/statistics",
          },
          {
            label: "Payment Management",
            icon: "pi pi-credit-card",
            route: "/admission-officer/payment",
          },
          {
            label: "Document Verification",
            icon: "pi pi-verified",
            route: "/admission-officer/verification",
          },
        ],
      });
    }

    // Library sections
    if (this.hasRole([UserRole.LIBRARIAN, UserRole.ADMIN])) {
      this.menuSections.push({
        label: "Library Management",
        items: [
          {
            label: "Library Dashboard",
            icon: "pi pi-database",
            route: "/library",
          },
          {
            label: "Manage Books",
            icon: "pi pi-book",
            route: "/library/books",
          },
          {
            label: "Issue Books",
            icon: "pi pi-share-alt",
            route: "/library/issue",
          },
        ],
      });
    }

    // Asset Management sections
    if (this.hasRole([UserRole.ASSET_MANAGER, UserRole.ADMIN])) {
      this.menuSections.push({
        label: "Asset Management",
        items: [
          {
            label: "Asset Dashboard",
            icon: "pi pi-box",
            route: "/asset-management",
          },
          {
            label: "Assets",
            icon: "pi pi-box",
            route: "/asset-management/assets",
          },
          {
            label: "Maintenance",
            icon: "pi pi-wrench",
            route: "/asset-management/maintenance",
          },
          {
            label: "Procurement",
            icon: "pi pi-shopping-cart",
            route: "/asset-management/procurement",
          },
        ],
      });
    }

    // Account section (only for authenticated users)
    if (this.currentUser && this.isAuthenticated()) {
      this.menuSections.push({
        label: "Account",
        items: [
          {
            label: "Settings",
            icon: "pi pi-cog",
            route: "/settings",
          },
          {
            label: "Help & Support",
            icon: "pi pi-question-circle",
            route: "/help",
          },
          {
            label: "Logout",
            icon: "pi pi-sign-out",
            command: () => this.onLogout(),
          },
        ],
      });
    }
  }

  onLogout() {
    this.authService.logout();
    this.onHide();
  }

  getUserRole(): string {
    if (this.currentUser) {
      return this.currentUser.role.toUpperCase();
    }
    return "EMPLOYEE";
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    // Always close sidebar after navigation on mobile
    this.onHide();
  }

  navigateAndClose(route: string) {
    this.router.navigate([route]);
    this.onHide();
  }

  getFilteredMenuSections() {
    return this.menuSections;
  }

  private hasRole(roles: UserRole[]): boolean {
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role as UserRole);
  }

  private hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    return this.permissionService
      .getCurrentUserPermissions()
      .includes(permission);
  }

  private isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.onHide();
  }

  // Helper methods for dynamic content
  private getDashboardLabel(): string {
    if (!this.currentUser) return "Dashboard";

    const roleLabels: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: "Admin Dashboard",
      [UserRole.FACULTY]: "Faculty Dashboard",
      [UserRole.HOD]: "HOD Dashboard",
      [UserRole.STUDENT]: "Student Dashboard",
      [UserRole.ADMISSION_OFFICER]: "Admission Dashboard",
      [UserRole.LIBRARIAN]: "Library Dashboard",
      [UserRole.ASSET_MANAGER]: "Asset Dashboard",
      [UserRole.GUEST]: "Guest Portal",
    };

    return roleLabels[this.currentUser.role as UserRole] || "Dashboard";
  }

  private getDashboardRoute(): string {
    if (!this.currentUser) return "/dashboard";

    const roleRoutes: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: "/admin",
      [UserRole.FACULTY]: "/faculty",
      [UserRole.HOD]: "/faculty",
      [UserRole.STUDENT]: "/dashboard",
      [UserRole.ADMISSION_OFFICER]: "/admission-officer",
      [UserRole.LIBRARIAN]: "/library",
      [UserRole.ASSET_MANAGER]: "/asset-management",
      [UserRole.GUEST]: "/admission",
    };

    return roleRoutes[this.currentUser.role as UserRole] || "/dashboard";
  }

  getUserRoleDisplayName(): string {
    if (!this.currentUser) return "Guest";

    const roleDisplayNames: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: "Administrator",
      [UserRole.FACULTY]: "Faculty Member",
      [UserRole.HOD]: "Head of Department",
      [UserRole.STUDENT]: "Student",
      [UserRole.ADMISSION_OFFICER]: "Admission Officer",
      [UserRole.LIBRARIAN]: "Librarian",
      [UserRole.ASSET_MANAGER]: "Asset Manager",
      [UserRole.GUEST]: "Guest",
    };

    return roleDisplayNames[this.currentUser.role as UserRole] || "User";
  }
}
