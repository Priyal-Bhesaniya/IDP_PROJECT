import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { DealerService } from '../../services/dealer.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
  public userName: string = '';
  public userInitials: string = '';
  
  // Dashboard stats
  public totalDealers: number = 0;
  public activeDealers: number = 0;
  public inactiveDealers: number = 0;
  public loading: boolean = false;
  public error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private dealerService: DealerService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Admin Dashboard component loaded!');
    this.loadUserData();
  }

  ngOnInit(): void {
    console.log('AdminDashboard ngOnInit called');
    console.log('Initial values - Total:', this.totalDealers, 'Active:', this.activeDealers);
    this.loadDealerStats();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public goToDealers(): void {
    this.router.navigate(['/admin-dealers']);
  }

  public loadDealerStats(): void {
    console.log('loadDealerStats called');
    this.loading = true;
    this.error = '';
    
    console.log('Making API call to getDealerStats');
    this.dealerService.getDealerStats().subscribe({
      next: (stats) => {
        this.totalDealers = stats.total;
        this.activeDealers = stats.active;
        this.inactiveDealers = stats.inactive;
        this.loading = false;
        console.log('Dealer stats loaded:', stats);
        console.log('Updated properties - Total:', this.totalDealers, 'Active:', this.activeDealers, 'Inactive:', this.inactiveDealers);
        // Force immediate UI update
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load dealer statistics';
        this.loading = false;
        console.error('Error loading dealer stats:', err);
        // Force immediate UI update
        this.cdr.detectChanges();
      }
    });
  }
}
