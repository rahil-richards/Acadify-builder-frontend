import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdmissionComponent } from "./admission.component";
import { ApplicationStatusComponent } from "./components/application-status/application-status.component";
import { FeePaymentComponent } from "./components/fee-payment/fee-payment.component";

const routes: Routes = [
  {
    path: "",
    component: AdmissionComponent,
  },
  {
    path: "status",
    component: ApplicationStatusComponent,
  },
  {
    path: "payment",
    component: FeePaymentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdmissionRoutingModule {}
