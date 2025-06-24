import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import NavComponent from './nav/nav.component';
import { NotificationContainerComponent } from './shared/notification/notification-container.component';

@Component({
  selector: 'jhi-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, NavComponent, NotificationContainerComponent],
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent implements OnInit {
  appName = signal('AIsample');

  ngOnInit(): void {
    this.appName.set('AIsample');
  }
}
