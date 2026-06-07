import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LocalNotification {
  id: number;
  userMobile: string;
  message: string;
  type: 'booking_created' | 'booking_approved' | 'booking_rejected' | 'booking_completed';
  read: boolean;
  time: Date;
  bookingId?: number;
  dealerId?: number;
  serviceName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationService {
  private notifications: LocalNotification[] = [];
  private notificationsSubject = new BehaviorSubject<LocalNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private nextId = 1;

  constructor() {
    this.loadFromLocalStorage();
  }

  // Get notifications for a specific user
  getUserNotifications(userMobile: string): LocalNotification[] {
    return this.notifications.filter(n => n.userMobile === userMobile);
  }

  // Create a new notification (frontend only)
  createNotification(notification: Partial<LocalNotification>): LocalNotification {
    const newNotification: LocalNotification = {
      id: this.nextId++,
      userMobile: notification.userMobile || '',
      message: notification.message || '',
      type: notification.type || 'booking_created',
      read: false,
      time: new Date(),
      bookingId: notification.bookingId,
      dealerId: notification.dealerId,
      serviceName: notification.serviceName
    };

    this.notifications.unshift(newNotification);
    this.saveToLocalStorage();
    this.notificationsSubject.next([...this.notifications]);
    
    console.log('Local notification created:', newNotification);
    return newNotification;
  }

  // Create notification based on booking status change
  createBookingStatusNotification(
    userMobile: string, 
    bookingId: number, 
    dealerId: number, 
    newStatus: string,
    serviceName?: string
  ): LocalNotification {
    let message = '';
    let type: LocalNotification['type'] = 'booking_created';

    switch (newStatus.toLowerCase()) {
      case 'pending':
        message = `Your service booking for ${serviceName || 'a service'} is received. The dealer will update it soon.`;
        type = 'booking_created';
        break;
      case 'in-progress':
        message = `Your vehicle is now in progress for ${serviceName || 'service'}!`;
        type = 'booking_approved';
        break;
      case 'rejected':
        message = `We cannot process your service booking for today. Please contact support for more details.`;
        type = 'booking_rejected';
        break;
      case 'completed':
        message = `You can take your car! Your service for ${serviceName || 'service'} is done.`;
        type = 'booking_completed';
        break;
      default:
        message = `Your booking status has been updated to: ${newStatus}`;
    }

    return this.createNotification({
      userMobile,
      message,
      type,
      bookingId,
      dealerId,
      serviceName
    });
  }

  // Mark notification as read
  markAsRead(notificationId: number): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToLocalStorage();
      this.notificationsSubject.next([...this.notifications]);
      return true;
    }
    return false;
  }

  // Delete notification
  deleteNotification(notificationId: number): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveToLocalStorage();
      this.notificationsSubject.next([...this.notifications]);
      return true;
    }
    return false;
  }

  // Clear all notifications for user
  clearUserNotifications(userMobile: string): void {
    this.notifications = this.notifications.filter(n => n.userMobile !== userMobile);
    this.saveToLocalStorage();
    this.notificationsSubject.next([...this.notifications]);
  }

  // Get unread count for user
  getUnreadCount(userMobile: string): number {
    return this.notifications.filter(n => n.userMobile === userMobile && !n.read).length;
  }

  // Get all notifications (for debugging)
  getAllNotifications(): LocalNotification[] {
    return [...this.notifications];
  }

  // Private methods for localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('local_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('local_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          time: new Date(n.time) // Convert string back to Date
        }));
        // Update nextId to avoid conflicts
        this.nextId = Math.max(...this.notifications.map(n => n.id), 0) + 1;
        this.notificationsSubject.next([...this.notifications]);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      this.notifications = [];
    }
  }

  // Clear all notifications (for testing/reset)
  clearAllNotifications(): void {
    this.notifications = [];
    this.nextId = 1;
    this.saveToLocalStorage();
    this.notificationsSubject.next([...this.notifications]);
  }
}
