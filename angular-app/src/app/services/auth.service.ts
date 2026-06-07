import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  dealerId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.initializeUser();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    // In production, you might store this in localStorage or sessionStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    // In production, you might also clear JWT tokens
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getUserRole(): string | null {
    return this.currentUser?.role || null;
  }

  getDealerId(): number | null {
    return this.currentUser?.dealerId || this.currentUser?.id || null;
  }

  // Initialize user from localStorage on service startup
  private initializeUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        console.log('User loaded from localStorage:', this.currentUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
        this.setDefaultUser();
      }
    } else {
      console.log('No stored user found, setting default user');
      this.setDefaultUser();
    }
  }

  private setDefaultUser(): void {
    this.currentUser = {
      id: 1,
      name: 'John Dealer',
      email: 'john.dealer@example.com',
      role: 'dealer',
      dealerId: 1
    };
    // Store the default user
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    console.log('Default user set:', this.currentUser);
  }
}
