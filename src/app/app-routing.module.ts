import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./auth/guards/auth.guard";
import { RoleGuard } from "./auth/guards/role.guard";
import { UserRole } from "./auth/models/role.model";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full",
  },
  {
    path: "login",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: "faculty",
    loadChildren: () =>
      import("./faculty/faculty.module").then((m) => m.FacultyModule),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.FACULTY, UserRole.HOD] },
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.STUDENT] },
  },
  {
    path: "admission",
    loadChildren: () =>
      import("./admission/admission.module").then((m) => m.AdmissionModule),
    // Note: Admission route is open for prospective students (no guard)
  },
  {
    path: "admission-officer",
    loadChildren: () =>
      import("./admission-officer/admission-officer.module").then(
        (m) => m.AdmissionOfficerModule,
      ),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMISSION_OFFICER, UserRole.ADMIN] },
  },
  {
    path: "library",
    loadChildren: () =>
      import("./library/library.module").then((m) => m.LibraryModule),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.LIBRARIAN, UserRole.ADMIN] },
  },
  {
    path: "asset-management",
    loadChildren: () =>
      import("./asset-management/asset-management.module").then(
        (m) => m.AssetManagementModule,
      ),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ASSET_MANAGER, UserRole.ADMIN] },
  },
  {
    path: "**",
    redirectTo: "/login",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
