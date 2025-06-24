import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from './notification.component';
import { ErrorInfo } from '../error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // No constructor logic needed

  /**
   * Show a success notification
   */
  showSuccess(message: string, duration: number = 5000): string {
    return this.showNotification({
      message,
      type: 'success',
      duration,
      dismissible: true,
      id: this.generateId()
    });
  }

  /**
   * Show an error notification
   */
  showError(message: string, duration: number = 8000): string {
    return this.showNotification({
      message,
      type: 'error',
      duration,
      dismissible: true,
      id: this.generateId()
    });
  }

  /**
   * Show a warning notification
   */
  showWarning(message: string, duration: number = 6000): string {
    return this.showNotification({
      message,
      type: 'warning',
      duration,
      dismissible: true,
      id: this.generateId()
    });
  }

  /**
   * Show an info notification
   */
  showInfo(message: string, duration: number = 5000): string {
    return this.showNotification({
      message,
      type: 'info',
      duration,
      dismissible: true,
      id: this.generateId()
    });
  }

  /**
   * Show notification from ErrorInfo
   */
  showFromErrorInfo(errorInfo: ErrorInfo, duration?: number): string {
    const defaultDuration = errorInfo.type === 'error' ? 8000 : 5000;
    return this.showNotification({
      message: errorInfo.message,
      type: errorInfo.type,
      duration: duration || defaultDuration,
      dismissible: true,
      id: this.generateId()
    });
  }

  /**
   * Show a persistent notification (no auto-dismiss)
   */
  showPersistent(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): string {
    return this.showNotification({
      message,
      type,
      duration: 0, // No auto-dismiss
      dismissible: true,
      id: this.generateId()
    });
  }

  /**
   * Show a notification
   */
  private showNotification(notification: Notification): string {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [...currentNotifications, notification];
    this.notificationsSubject.next(updatedNotifications);
    return notification.id!;
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Dismiss notifications by type
   */
  dismissByType(type: 'success' | 'error' | 'warning' | 'info'): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.type !== type);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Get current notifications
   */
  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Generate unique ID for notifications
   */
  private generateId(): string {
    return 'notification_' + String(Date.now()) + '_' + Math.random().toString(36).substring(2, 11);
  }

  /**
   * Show network error notification
   */
  showNetworkError(): string {
    return this.showError(
      'Unable to connect to the server. Please check your internet connection and try again.',
      10000
    );
  }

  /**
   * Show session expired notification
   */
  showSessionExpired(): string {
    return this.showWarning(
      'Your session has expired. Please log in again.',
      8000
    );
  }

  /**
   * Show validation error notification
   */
  showValidationError(message: string = 'Please check your input and try again.'): string {
    return this.showError(message, 6000);
  }

  /**
   * Show rate limit notification
   */
  showRateLimitError(): string {
    return this.showWarning(
      'Too many requests. Please wait a moment and try again.',
      5000
    );
  }

  /**
   * Show server error notification
   */
  showServerError(): string {
    return this.showError(
      'Server error. Please try again later.',
      8000
    );
  }
} 