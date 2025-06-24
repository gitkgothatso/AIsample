import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
  id?: string;
}

@Component({
  selector: 'jhi-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="notification" 
      class="notification" 
      [class]="'notification-' + notification.type"
      [attr.role]="notification.type === 'error' ? 'alert' : 'status'"
      [attr.aria-live]="notification.type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="notification-content">
        <div class="notification-icon">
          <span *ngIf="notification.type === 'success'">✓</span>
          <span *ngIf="notification.type === 'error'">✕</span>
          <span *ngIf="notification.type === 'warning'">⚠</span>
          <span *ngIf="notification.type === 'info'">ℹ</span>
        </div>
        <div class="notification-message">
          {{ notification.message }}
        </div>
        <button 
          *ngIf="notification.dismissible !== false" 
          class="notification-close" 
          (click)="dismiss()"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
      min-width: 300px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      gap: 12px;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 14px;
      font-weight: bold;
    }

    .notification-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
    }

    .notification-close {
      flex-shrink: 0;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .notification-close:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    /* Success notification */
    .notification-success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .notification-success .notification-icon {
      background-color: #28a745;
      color: white;
    }

    /* Error notification */
    .notification-error {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .notification-error .notification-icon {
      background-color: #dc3545;
      color: white;
    }

    /* Warning notification */
    .notification-warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
    }

    .notification-warning .notification-icon {
      background-color: #ffc107;
      color: #212529;
    }

    /* Info notification */
    .notification-info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }

    .notification-info .notification-icon {
      background-color: #17a2b8;
      color: white;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .notification.dismissing {
      animation: slideOut 0.3s ease-in forwards;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
        min-width: auto;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() notification: Notification | null = null;
  @Output() dismissEvent = new EventEmitter<string>();

  private timeoutId?: number;

  ngOnInit() {
    if (this.notification && this.notification.duration && this.notification.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.dismiss();
      }, this.notification.duration);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  dismiss() {
    if (this.notification?.id) {
      this.dismissEvent.emit(this.notification.id);
    }
  }
} 