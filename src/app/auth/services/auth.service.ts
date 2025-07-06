import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { delay, map, tap } from "rxjs/operators";
import { Router } from "@angular/router";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  employeeId?: string;
  avatar?: string;
  permissions?: string[];
  lastLogin?: Date;
  isActive?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Mock users for demonstration
  private mockUsers: User[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
      email: "admin@college.edu",
      role: "admin",
      employeeId: "EMP001",
      isActive: true,
      lastLogin: new Date(),
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Wilson",
      name: "Sarah Wilson",
      email: "sarah.wilson@college.edu",
      role: "faculty",
      department: "Computer Science",
      employeeId: "EMP002",
      isActive: true,
      lastLogin: new Date(),
    },
    {
      id: "3",
      firstName: "Dr. Patricia",
      lastName: "Kumar",
      name: "Dr. Patricia Kumar",
      email: "patricia.kumar@college.edu",
      role: "hod",
      department: "Computer Science",
      employeeId: "EMP005",
      isActive: true,
      lastLogin: new Date(),
    },
    {
      id: "4",
      firstName: "Emily",
      lastName: "Brown",
      name: "Emily Brown",
      email: "emily.brown@college.edu",
      role: "admission_officer",
      employeeId: "EMP003",
      isActive: true,
      lastLogin: new Date(),
    },
    {
      id: "5",
      firstName: "Michael",
      lastName: "Chen",
      name: "Michael Chen",
      email: "student@college.edu",
      role: "student",
      employeeId: "STU001",
      department: "Computer Science",
      isActive: true,
      lastLogin: new Date(),
    },
    {
      id: "6",
      firstName: "Lisa",
      lastName: "Johnson",
      name: "Lisa Johnson",
      email: "librarian@college.edu",
      role: "librarian",
      employeeId: "LIB001",
      isActive: true,
      lastLogin: new Date(),
    },
    {
      id: "7",
      firstName: "David",
      lastName: "Smith",
      name: "David Smith",
      email: "assets@college.edu",
      role: "asset_manager",
      employeeId: "AST001",
      isActive: true,
      lastLogin: new Date(),
    },
  ];

  constructor(private router: Router) {
    // Check if user is already logged in on service initialization
    this.checkAuthState();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Simulate API call with delay
    return of(credentials).pipe(
      delay(1500), // Simulate network delay
      map((creds) => {
        // Find user by email
        const user = this.mockUsers.find((u) => u.email === creds.email);

        // Simple password validation (in real app, this would be handled by backend)
        if (user && creds.password === "password123") {
          const token = this.generateToken();
          this.setSession(user, token);
          return {
            success: true,
            user,
            token,
            message: "Login successful",
          };
        } else {
          return {
            success: false,
            message: "Invalid email or password",
          };
        }
      }),
      tap((response) => {
        if (!response.success) {
          // Convert to error for error handling
          throw new Error(response.message);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(["/login"]);
  }

  forgotPassword(
    email: string,
  ): Observable<{ success: boolean; message: string }> {
    // Simulate API call
    return of({ email }).pipe(
      delay(1000),
      map(() => {
        const user = this.mockUsers.find((u) => u.email === email);
        if (user) {
          return {
            success: true,
            message:
              "Password reset instructions have been sent to your email.",
          };
        } else {
          return {
            success: false,
            message: "No account found with this email address.",
          };
        }
      }),
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private setSession(user: User, token: string): void {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("current_user", JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    // Role-based redirect after login
    this.redirectToRoleDashboard(user.role);
  }

  private redirectToRoleDashboard(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      admin: "/admin",
      faculty: "/faculty",
      hod: "/faculty",
      student: "/dashboard",
      admission_officer: "/admission-officer",
      librarian: "/library",
      asset_manager: "/asset-management",
      guest: "/admission",
    };

    const route = roleRoutes[role] || "/dashboard";
    this.router.navigate([route]);
  }

  private checkAuthState(): void {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("current_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        // Invalid stored data, clear it
        this.logout();
      }
    }
  }

  private generateToken(): string {
    // Simple token generation for demo
    return btoa(Date.now() + Math.random().toString());
  }
}
