import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

// PrimeNG Modules
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { CheckboxModule } from "primeng/checkbox";
import { ToastModule } from "primeng/toast";
import { MessageModule } from "primeng/message";
import { MessagesModule } from "primeng/messages";
import { MessageService } from "primeng/api";

// Components
import { LoginComponent } from "./login/login.component";

// Services
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { RoleGuard } from "./guards/role.guard";

const routes = [
  {
    path: "",
    component: LoginComponent,
  },
];

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),

    // PrimeNG
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    MessageModule,
    MessagesModule,
  ],
  providers: [AuthGuard, RoleGuard, MessageService],
})
export class AuthModule {}
