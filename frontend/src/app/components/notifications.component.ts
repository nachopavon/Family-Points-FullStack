import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div
        *ngFor="let notification of notifications; trackBy: trackByNotificationId"
        class="notification"
        [class]="'notification-' + notification.type"
        (click)="removeNotification(notification.id)">

        <div class="notification-icon">
          <span *ngIf="notification.type === 'success'">✅</span>
          <span *ngIf="notification.type === 'error'">❌</span>
          <span *ngIf="notification.type === 'info'">ℹ️</span>
          <span *ngIf="notification.type === 'warning'">⚠️</span>
        </div>

        <div class="notification-content">
          <p>{{ notification.message }}</p>
        </div>

        <button class="notification-close" (click)="removeNotification(notification.id)">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      margin-bottom: 14px;
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.18);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(.4,1.4,.6,1);
      animation: slideIn 0.4s cubic-bezier(.4,1.4,.6,1);
      border-left: 6px solid rgba(255,255,255,0.18);
      min-width: 260px;
      max-width: 420px;
      font-size: 1.05rem;
    }

    .notification:hover {
      transform: translateX(-8px) scale(1.03);
      box-shadow: 0 10px 32px rgba(0,0,0,0.22);
      filter: brightness(1.05);
    }

    .notification-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border-left: 6px solid #059669;
    }

    .notification-error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border-left: 6px solid #dc2626;
    }

    .notification-info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-left: 6px solid #2563eb;
    }

    .notification-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      border-left: 6px solid #d97706;
    }

    .notification-icon {
      font-size: 1.5rem;
      margin-right: 16px;
      opacity: 0.92;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.10));
    }

    .notification-content {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .notification-content p {
      margin: 0;
      font-weight: 600;
      letter-spacing: 0.01em;
      line-height: 1.4;
    }

    .notification-close {
      background: none;
      border: none;
      color: currentColor;
      font-size: 1.7rem;
      cursor: pointer;
      padding: 0 4px;
      margin-left: 14px;
      opacity: 0.7;
      transition: opacity 0.2s, color 0.2s;
      border-radius: 50%;
    }

    .notification-close:hover {
      opacity: 1;
      color: #fff;
      background: rgba(0,0,0,0.08);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
