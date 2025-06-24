import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from './notification.service';
import { NotificationComponent, Notification } from './notification.component';

@Component({
  selector: 'jhi-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <div class="notification-container">
      <jhi-notification
        *ngFor="let notification of notifications; trackBy: trackByNotificationId"
        [notification]="notification"
        (dismissEvent)="onDismiss($event)"
      ></jhi-notification>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      pointer-events: none;
    }

    .notification-container > * {
      pointer-events: auto;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-height: calc(100vh - 20px);
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onDismiss(notificationId: string) {
    this.notificationService.dismiss(notificationId);
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id || index.toString();
  }
} 