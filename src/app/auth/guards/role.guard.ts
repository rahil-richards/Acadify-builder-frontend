import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { UserRole } from "../models/role.model";

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          this.router.navigate(["/login"]);
          return false;
        }

        const allowedRoles = route.data["roles"] as UserRole[];

        if (!allowedRoles || allowedRoles.length === 0) {
          return true;
        }

        const hasAccess = allowedRoles.includes(user.role as UserRole);

        if (!hasAccess) {
          // Redirect to appropriate dashboard based on user role
          this.redirectToRoleDashboard(user.role);
          return false;
        }

        return true;
      }),
    );
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
}
