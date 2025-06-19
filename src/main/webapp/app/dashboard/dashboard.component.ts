import { Component, signal } from '@angular/core';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
})
export class DashboardComponent {
  sidebarOpen = signal(window.innerWidth > 800);

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
}
