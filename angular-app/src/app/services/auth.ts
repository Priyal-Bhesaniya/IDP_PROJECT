import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  mobileNumber: string;
  role: 'SYS' | 'DEALER' | 'USER';
  token: string;
  name: string;
  dealerId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  sendOTP(mobileNumber: string, name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-otp`, { mobileNumber, name });
  }

  verifyOTP(mobileNumber: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-otp`, { mobileNumber, otp });
  }

  resendOTP(mobileNumber: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resend-otp`, { mobileNumber });
  }

  login(userData: any): void {
    console.log('Auth Service - Login called with:', userData);
    
    const user: User = {
      mobileNumber: userData.mobileNumber,
      role: userData.role,
      token: userData.token,
      name: userData.name || 'User',
      dealerId: userData.dealerId
    };
    
    console.log('Auth Service - Created user object:', user);
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', userData.token);
    
    console.log('Auth Service - About to update currentUserSubject');
    this.currentUserSubject.next(user);
    console.log('Auth Service - currentUserSubject updated. Current value:', this.currentUserSubject.value);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(role: 'SYS' | 'DEALER' | 'USER'): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  isSYS(): boolean {
    return this.hasRole('SYS');
  }

  isDEALER(): boolean {
    return this.hasRole('DEALER');
  }

  isUSER(): boolean {
    return this.hasRole('USER');
  }
}
