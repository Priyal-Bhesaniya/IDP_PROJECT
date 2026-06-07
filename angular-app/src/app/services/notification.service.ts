import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Notification {
  id?: number;
  userId: string;
  userMobile: string;
  message: string;
  type: 'booking_created' | 'booking_approved' | 'booking_rejected' | 'booking_completed';
  read: boolean;
  time: Date;
  bookingId?: number;
  dealerId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:5000/api/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get notifications for a user
  getUserNotifications(userMobile: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${userMobile}`).pipe(
      // Handle 404 errors gracefully with mock data
      catchError((error) => {
        console.log('Backend API not available, using mock notifications:', error);
        // Return mock notifications for demo purposes
        const mockNotifications: Notification[] = [
          {
            id: 1,
            userId: userMobile,
            userMobile: userMobile,
            message: 'Your service booking is received. The dealer will update it soon.',
            type: 'booking_created',
            read: false,
            time: new Date(Date.now() - 3600000), // 1 hour ago
            bookingId: 123,
            dealerId: 1
          },
          {
            id: 2,
            userId: userMobile,
            userMobile: userMobile,
            message: 'Your vehicle is now in progress for service!',
            type: 'booking_approved',
            read: false,
            time: new Date(Date.now() - 7200000), // 2 hours ago
            bookingId: 124,
            dealerId: 1
          }
        ];
        return of(mockNotifications);
      })
    );
  }

  // Create a new notification
  createNotification(notification: Partial<Notification>): Observable<Notification> {
    const notificationData = {
      ...notification,
      read: false,
      time: new Date()
    };
    
    return this.http.post<Notification>(`${this.baseUrl}/create`, notificationData).pipe(
      catchError((error) => {
        console.log('Backend API not available, creating mock notification:', error);
        // Return mock notification for demo purposes
        const mockNotification: Notification = {
          id: Math.floor(Math.random() * 1000) + 100,
          ...notificationData,
          userId: notificationData.userMobile || 'unknown',
          userMobile: notificationData.userMobile || 'unknown',
          type: notificationData.type || 'booking_created',
          message: notificationData.message || 'Notification created',
          read: false,
          time: new Date(),
          bookingId: notificationData.bookingId,
          dealerId: notificationData.dealerId
        };
        return of(mockNotification);
      })
    );
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/${notificationId}/read`, {}).pipe(
      catchError((error) => {
        console.log('Backend API not available, marking notification as read locally:', error);
        // Return mock updated notification
        const mockNotification: Notification = {
          id: notificationId,
          userId: 'mock',
          userMobile: 'mock',
          message: 'Mock notification',
          type: 'booking_created',
          read: true,
          time: new Date()
        };
        return of(mockNotification);
      })
    );
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${notificationId}`).pipe(
      catchError((error) => {
        console.log('Backend API not available, deleting notification locally:', error);
        return of(void 0);
      })
    );
  }

  // Clear all notifications for user
  clearUserNotifications(userMobile: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/${userMobile}/clear`).pipe(
      catchError((error) => {
        console.log('Backend API not available, clearing notifications locally:', error);
        return of(void 0);
      })
    );
  }

  // Get unread count for user
  getUnreadCount(userMobile: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/user/${userMobile}/unread-count`).pipe(
      catchError((error) => {
        console.log('Backend API not available, returning mock unread count:', error);
        return of({ count: 0 });
      })
    );
  }

  // Create notification based on booking status change
  createBookingStatusNotification(
    userMobile: string, 
    bookingId: number, 
    dealerId: number, 
    newStatus: string,
    serviceName?: string
  ): Observable<Notification> {
    let message = '';
    let type: Notification['type'] = 'booking_created';

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
      userId: userMobile // Using mobile as userId for now
    });
  }

  // Update local notifications (for real-time updates)
  updateLocalNotifications(notifications: Notification[]) {
    this.notificationsSubject.next(notifications);
  }

  // Add notification to local state (for immediate UI updates)
  addLocalNotification(notification: Notification) {
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }
}
