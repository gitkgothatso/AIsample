import { Component, signal } from '@angular/core';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
})
export class DashboardComponent {
  sidebarOpen = signal(true);

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }
}
