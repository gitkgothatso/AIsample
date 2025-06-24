import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, ProfileComponent],
})
export class DashboardComponent {
  sidebarOpen = signal(window.innerWidth > 800);
  showProfile = signal(false);

  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);

  constructor() {
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 800) {
        this.sidebarOpen.set(false);
      } else {
        this.sidebarOpen.set(true);
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }

  isMobile(): boolean {
    return window.innerWidth <= 800;
  }

  onSidebarNavClick() {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  goTo(route: string) {
    if (route === '/profile') {
      this.showProfile.set(true);
    } else {
      this.showProfile.set(false);
      this.router.navigate([route]);
    }
    this.onSidebarNavClick();
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
    this.onSidebarNavClick();
  }
}
