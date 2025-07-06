export enum UserRole {
  ADMIN = "admin",
  FACULTY = "faculty",
  HOD = "hod",
  ADMISSION_OFFICER = "admission_officer",
  STUDENT = "student",
  LIBRARIAN = "librarian",
  ASSET_MANAGER = "asset_manager",
  GUEST = "guest",
}

export enum Permission {
  // Admin permissions
  MANAGE_USERS = "manage_users",
  MANAGE_COURSES = "manage_courses",
  MANAGE_DEPARTMENTS = "manage_departments",
  SYSTEM_SETTINGS = "system_settings",
  VIEW_ALL_DATA = "view_all_data",

  // Faculty permissions
  MANAGE_CLASSES = "manage_classes",
  VIEW_STUDENTS = "view_students",
  MANAGE_ASSIGNMENTS = "manage_assignments",
  MANAGE_ATTENDANCE = "manage_attendance",
  MANAGE_GRADES = "manage_grades",

  // HOD permissions (includes faculty permissions)
  MANAGE_FACULTY = "manage_faculty",
  APPROVE_LEAVES = "approve_leaves",
  DEPARTMENT_REPORTS = "department_reports",
  FACULTY_ALLOCATION = "faculty_allocation",

  // Admission Officer permissions
  MANAGE_ADMISSIONS = "manage_admissions",
  REVIEW_APPLICATIONS = "review_applications",
  APPROVE_APPLICATIONS = "approve_applications",
  MANAGE_PAYMENTS = "manage_payments",

  // Student permissions
  VIEW_PROFILE = "view_profile",
  VIEW_GRADES = "view_grades",
  VIEW_ATTENDANCE = "view_attendance",
  SUBMIT_ASSIGNMENTS = "submit_assignments",

  // Library permissions
  MANAGE_BOOKS = "manage_books",
  ISSUE_BOOKS = "issue_books",
  MANAGE_LIBRARY_USERS = "manage_library_users",

  // Asset Management permissions
  MANAGE_ASSETS = "manage_assets",
  VIEW_ASSETS = "view_assets",
  ASSET_MAINTENANCE = "asset_maintenance",
  ASSET_REPORTS = "asset_reports",
  PROCUREMENT = "procurement",
  INVENTORY_MANAGEMENT = "inventory_management",
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  routes: string[];
  description: string;
}

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: UserRole.ADMIN,
    permissions: [
      Permission.MANAGE_USERS,
      Permission.MANAGE_COURSES,
      Permission.MANAGE_DEPARTMENTS,
      Permission.SYSTEM_SETTINGS,
      Permission.VIEW_ALL_DATA,
      Permission.MANAGE_ASSETS,
      Permission.ASSET_REPORTS,
      Permission.PROCUREMENT,
      Permission.INVENTORY_MANAGEMENT,
    ],
    routes: ["/admin", "/asset-management", "/dashboard"],
    description: "Full system access and administrative privileges",
  },
  {
    role: UserRole.FACULTY,
    permissions: [
      Permission.MANAGE_CLASSES,
      Permission.VIEW_STUDENTS,
      Permission.MANAGE_ASSIGNMENTS,
      Permission.MANAGE_ATTENDANCE,
      Permission.MANAGE_GRADES,
      Permission.VIEW_PROFILE,
    ],
    routes: ["/faculty", "/dashboard"],
    description: "Teaching and student management capabilities",
  },
  {
    role: UserRole.HOD,
    permissions: [
      // Includes all faculty permissions
      Permission.MANAGE_CLASSES,
      Permission.VIEW_STUDENTS,
      Permission.MANAGE_ASSIGNMENTS,
      Permission.MANAGE_ATTENDANCE,
      Permission.MANAGE_GRADES,
      Permission.VIEW_PROFILE,
      // Additional HOD permissions
      Permission.MANAGE_FACULTY,
      Permission.APPROVE_LEAVES,
      Permission.DEPARTMENT_REPORTS,
      Permission.FACULTY_ALLOCATION,
      Permission.MANAGE_COURSES,
    ],
    routes: ["/faculty", "/admin", "/dashboard"],
    description: "Department leadership and faculty management",
  },
  {
    role: UserRole.ADMISSION_OFFICER,
    permissions: [
      Permission.MANAGE_ADMISSIONS,
      Permission.REVIEW_APPLICATIONS,
      Permission.APPROVE_APPLICATIONS,
      Permission.MANAGE_PAYMENTS,
      Permission.VIEW_PROFILE,
    ],
    routes: ["/admission-officer", "/admission", "/dashboard"],
    description: "Student admission and enrollment management",
  },
  {
    role: UserRole.STUDENT,
    permissions: [
      Permission.VIEW_PROFILE,
      Permission.VIEW_GRADES,
      Permission.VIEW_ATTENDANCE,
      Permission.SUBMIT_ASSIGNMENTS,
    ],
    routes: ["/dashboard", "/admission"],
    description: "Student portal access and academic information",
  },
  {
    role: UserRole.LIBRARIAN,
    permissions: [
      Permission.MANAGE_BOOKS,
      Permission.ISSUE_BOOKS,
      Permission.MANAGE_LIBRARY_USERS,
      Permission.VIEW_PROFILE,
    ],
    routes: ["/library", "/dashboard"],
    description: "Library management and book circulation",
  },
  {
    role: UserRole.ASSET_MANAGER,
    permissions: [
      Permission.MANAGE_ASSETS,
      Permission.VIEW_ASSETS,
      Permission.ASSET_MAINTENANCE,
      Permission.ASSET_REPORTS,
      Permission.PROCUREMENT,
      Permission.INVENTORY_MANAGEMENT,
      Permission.VIEW_PROFILE,
    ],
    routes: ["/asset-management", "/dashboard"],
    description: "Asset and inventory management responsibilities",
  },
  {
    role: UserRole.GUEST,
    permissions: [],
    routes: ["/admission"],
    description: "Limited access for prospective students",
  },
];
