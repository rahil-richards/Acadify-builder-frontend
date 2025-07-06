import { Component, OnInit } from "@angular/core";
import { User, UserService } from "../services/user.service";
import { ConfirmationService, MessageService } from "primeng/api";

@Component({
  selector: "app-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  providers: [ConfirmationService],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  showUserForm = false;
  selectedUser: User | null = null;

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading users:", error);
        this.loading = false;
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load users",
        });
      },
    });
  }

  onAddUser() {
    this.selectedUser = null;
    this.showUserForm = true;
  }

  onEditUser(user: User) {
    this.selectedUser = user;
    this.showUserForm = true;
  }

  onDeleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "User deleted successfully",
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error("Error deleting user:", error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete user",
            });
          },
        });
      },
    });
  }

  onToggleStatus(user: User) {
    const action = user.status === "active" ? "deactivate" : "activate";
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
      header: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      icon: "pi pi-question-circle",
      accept: () => {
        this.userService.toggleUserStatus(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: `User ${action}d successfully`,
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error(`Error ${action}ing user:`, error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: `Failed to ${action} user`,
            });
          },
        });
      },
    });
  }

  onUserFormClose() {
    this.showUserForm = false;
    this.selectedUser = null;
  }

  onUserSaved() {
    this.showUserForm = false;
    this.selectedUser = null;
    this.loadUsers();
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: "User saved successfully",
    });
  }

  getRoleSeverity(role: string): string {
    switch (role) {
      case "admin":
        return "danger";
      case "hod":
        return "contrast";
      case "faculty":
        return "info";
      case "admission_officer":
        return "warning";
      case "student":
        return "success";
      default:
        return "secondary";
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  }

  formatRole(role: string): string {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
