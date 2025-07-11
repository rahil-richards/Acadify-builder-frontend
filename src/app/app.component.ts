import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil, filter } from "rxjs/operators";
import { SidebarService } from "./shared/services/sidebar.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "Oriental College of Pharmacy";
  private destroy$ = new Subject<void>();
  sidebarVisible = false;
  showHeaderAndSidebar = true;

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Subscribe to sidebar visibility changes
    this.sidebarService.sidebarVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((visible) => {
        this.sidebarVisible = visible;
      });

    // Monitor route changes to hide header/sidebar on login page
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateHeaderVisibility(event.url);
        }
      });

    // Set initial state
    this.updateHeaderVisibility(this.router.url);
  }

  private updateHeaderVisibility(url: string) {
    const isLoginPage =
      url === "/login" || url.startsWith("/login/") || url.includes("/login");
    this.showHeaderAndSidebar = !isLoginPage;
    console.log(
      "Route changed to:",
      url,
      "Is login page:",
      isLoginPage,
      "Show header:",
      this.showHeaderAndSidebar,
    );
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
