import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealerService, Dealer, NewDealer } from '../../services/dealer.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dealers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dealers.html',
  styleUrls: ['./admin-dealers.scss']
})
export class AdminDealersComponent implements OnInit {
  // User data
  public userName: string = '';
  public userInitials: string = '';

  // Dialog state
  public showDialog: boolean = false;
  public activeTab: number = 1;
  public isEditMode: boolean = false;
  public editingDealerId: number = 0;

  // Image preview data
  public garageLogoPreview: string = '';
  public serviceImagesPreview: string[] = ['', '', '', '', ''];
  public rentalImagesPreview: string[] = ['', ''];
  
  // New dealer form data
  public newDealer = {
    name: '',
    ownerName: '',
    registrationNumber: '',
    gstNumber: '',
    address: '',
    phone: '',
    serviceCapacity: '',
    openingTime: '',
    closingTime: '',
    rentalEnabled: 'no',
    maxRentalCars: '',
    role: 'Dealer'
  };
  
  // Dealer data from service
  public dealers: Dealer[] = [];
  public loading: boolean = false;
  public error: string = '';
  
  // Details dialog state
  public showDetailsDialog: boolean = false;
  public selectedDealer: Dealer | null = null;

  // Delete confirmation dialog state
  public showDeleteConfirmDialog: boolean = false;
  public dealerToDelete: number = 0;

  constructor(
    private dealerService: DealerService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Admin Dealers component loaded!');
    this.loadUserData();
  }

  ngOnInit(): void {
    this.loadDealers();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    } else {
      this.userName = 'Admin User';
      this.userInitials = 'AU';
    }
  }

  public loadDealers(): void {
    this.loading = true;
    this.error = '';
    
    this.dealerService.getDealers().subscribe({
      next: (dealers: Dealer[]) => {
        this.dealers = dealers;
        this.loading = false;
        console.log('Dealers loaded successfully:', dealers);
        // Force change detection to ensure UI updates
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load dealers. Please try again.';
        this.loading = false;
        console.error('Error loading dealers:', err);
      }
    });
  }

  private getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public goToDashboard(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  // Tab management
  public setActiveTab(tabNumber: number): void {
    this.activeTab = tabNumber;
  }

  public nextTab(): void {
    if (this.activeTab < 3) {
      this.activeTab++;
    }
  }

  // Dialog Methods
  public openAddDealerDialog(): void {
    this.isEditMode = false;
    this.editingDealerId = 0;
    this.showDialog = true;
    this.resetForm();
  }

  public closeAddDealerDialog(): void {
    this.showDialog = false;
    this.resetForm();
  }

  public viewDealerDetails(dealerId: number): void {
    console.log('Viewing dealer details for ID:', dealerId);
    this.selectedDealer = this.dealers.find(d => d.id === dealerId) || null;
    this.showDetailsDialog = true;
  }

  public closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedDealer = null;
  }

  public editDealer(dealerId: number): void {
    const dealer = this.dealers.find(d => d.id === dealerId);
    if (!dealer) {
      console.error('Dealer not found:', dealerId);
      return;
    }

    this.isEditMode = true;
    this.editingDealerId = dealerId;
    
    // Populate form with existing dealer data (only admin-entered fields)
    this.newDealer = {
      name: dealer.name,
      ownerName: dealer.ownerName,
      registrationNumber: dealer.registrationNumber,
      gstNumber: dealer.gstNumber,
      address: dealer.address,
      phone: dealer.phone,
      serviceCapacity: dealer.serviceCapacity,
      openingTime: dealer.openingTime,
      closingTime: dealer.closingTime,
      rentalEnabled: dealer.rentalEnabled,
      maxRentalCars: dealer.maxRentalCars,
      role: dealer.role || 'Dealer'
    };
    
    // Load existing images for edit mode
    this.garageLogoPreview = dealer.garageLogo ? this.constructImageUrl(dealer.garageLogo) : '';
    this.serviceImagesPreview = dealer.serviceImages?.map(img => this.constructImageUrl(img)) ?? ['', '', '', ''];
    this.rentalImagesPreview = dealer.rentalImages?.map(img => this.constructImageUrl(img)) ?? ['', ''];
    
    this.showDialog = true;
  }

  public deleteDealer(dealerId: number): void {
    this.dealerToDelete = dealerId;
    this.showDeleteConfirmDialog = true;
    // Force immediate UI update to show dialog
    this.cdr.detectChanges();
  }

  public closeDeleteConfirmDialog(): void {
    this.showDeleteConfirmDialog = false;
    this.dealerToDelete = 0;
    // Force immediate UI update to hide dialog
    this.cdr.detectChanges();
  }

  public confirmDelete(): void {
    if (this.dealerToDelete === 0) return;
    
    this.dealerService.deleteDealer(this.dealerToDelete).subscribe({
      next: () => {
        this.dealers = this.dealers.filter(d => d.id !== this.dealerToDelete);
        console.log('Dealer deleted successfully:', this.dealerToDelete);
        this.closeDeleteConfirmDialog();
        // Force immediate UI update
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error deleting dealer:', err);
        this.closeDeleteConfirmDialog();
        // Force immediate UI update
        this.cdr.detectChanges();
      }
    });
  }

  public toggleDealerStatus(dealerId: number, newStatus: string): void {
    console.log('Toggle dealer status:', dealerId, 'to', newStatus);
    
    const status = newStatus === 'active' ? 'Active' : 'Inactive';
    
    this.dealerService.toggleDealerStatus(dealerId, status).subscribe({
      next: (updatedDealer: Dealer) => {
        // Update local dealer data
        const index = this.dealers.findIndex(d => d.id === dealerId);
        if (index !== -1) {
          this.dealers[index] = updatedDealer;
        }
        console.log('Dealer status updated successfully:', updatedDealer);
        // Refresh data from backend to ensure consistency
        setTimeout(() => this.loadDealers(), 300);
        // Force UI update
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error updating dealer status:', err);
        // Optionally show error message to user
      }
    });
  }

  public saveDealer(): void {
    const dealerData: NewDealer = {
      name: this.newDealer.name,
      ownerName: this.newDealer.ownerName,
      registrationNumber: this.newDealer.registrationNumber,
      gstNumber: this.newDealer.gstNumber,
      address: this.newDealer.address,
      phone: this.newDealer.phone,
      serviceCapacity: this.newDealer.serviceCapacity,
      openingTime: this.newDealer.openingTime,
      closingTime: this.newDealer.closingTime,
      rentalEnabled: this.newDealer.rentalEnabled,
      maxRentalCars: this.newDealer.maxRentalCars,
      role: this.newDealer.role,
      garageLogo: this.extractFilenameFromUrl(this.garageLogoPreview),
      serviceImages: this.serviceImagesPreview.filter(img => img !== '').map(img => this.extractFilenameFromUrl(img)),
      rentalImages: this.rentalImagesPreview.filter(img => img !== '').map(img => this.extractFilenameFromUrl(img))
    };

    if (this.isEditMode) {
      // Update existing dealer
      this.dealerService.updateDealer(this.editingDealerId, dealerData).subscribe({
        next: (updatedDealer: Dealer) => {
          // Update local dealer data
          const dealerIndex = this.dealers.findIndex(d => d.id === this.editingDealerId);
          if (dealerIndex !== -1) {
            this.dealers[dealerIndex] = updatedDealer;
          }
          console.log('Dealer updated successfully:', updatedDealer);
          // Close dialog immediately
          this.closeAddDealerDialog();
          // Force UI update immediately
          this.cdr.detectChanges();
          // Refresh data from backend to ensure consistency
          setTimeout(() => this.loadDealers(), 500);
        },
        error: (err: any) => {
          console.error('Error updating dealer:', err);
          // Optionally show error message to user
        }
      });
    } else {
      // Add new dealer
      this.dealerService.createDealer(dealerData).subscribe({
        next: (newDealer: Dealer) => {
          this.dealers.push(newDealer);
          console.log('New dealer added successfully:', newDealer);
          // Close dialog immediately
          this.closeAddDealerDialog();
          // Force UI update immediately
          this.cdr.detectChanges();
          // Refresh data from backend to ensure consistency
          setTimeout(() => this.loadDealers(), 500);
        },
        error: (err: any) => {
          console.error('Error creating dealer:', err);
          // Optionally show error message to user
        }
      });
    }
    
    console.log('Images saved - Logo:', this.garageLogoPreview ? 'Yes' : 'No');
    console.log('Service Images:', this.serviceImagesPreview.filter(img => img !== '').length, 'uploaded');
    console.log('Rental Images:', this.rentalImagesPreview.filter(img => img !== '').length, 'uploaded');
  }

  // Image handling methods
  public onFileUpload(imageType: string, event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Upload image to server and get filename
      this.dealerService.uploadImage(file).subscribe({
        next: (response: any) => {
          console.log('Image uploaded successfully:', response.filename);
          
          // Update appropriate preview array based on image type
          // Construct the full URL to the backend image endpoint
          const imageUrl = `http://localhost:5000/api/dealers/images/${response.filename}`;
          
          if (imageType === 'garageLogo') {
            this.garageLogoPreview = imageUrl;
          } else if (imageType.startsWith('service')) {
            const index = parseInt(imageType.replace('service', '')) - 1;
            if (index >= 0 && index < 4) {
              this.serviceImagesPreview[index] = imageUrl;
            }
          } else if (imageType.startsWith('rental')) {
            const index = parseInt(imageType.replace('rental', '')) - 1;
            if (index >= 0 && index < 2) {
              this.rentalImagesPreview[index] = imageUrl;
            }
          }
          
          // Force change detection
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error uploading image:', err);
          // Optionally show error message to user
        }
      });
    }
  }

  public removeImage(imageType: string): void {
    if (imageType === 'garageLogo') {
      this.garageLogoPreview = '';
    } else if (imageType.startsWith('service')) {
      const index = parseInt(imageType.replace('service', '')) - 1;
      if (index >= 0 && index < 4) {
        this.serviceImagesPreview[index] = '';
      }
    } else if (imageType.startsWith('rental')) {
      const index = parseInt(imageType.replace('rental', '')) - 1;
      if (index >= 0 && index < 2) {
        this.rentalImagesPreview[index] = '';
      }
    }
    
    // Force change detection
    this.cdr.detectChanges();
  }

  private extractFilenameFromUrl(url: string): string {
    if (!url) return '';
    // Extract filename from URL like "http://localhost:5000/api/dealers/images/filename.png"
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  private constructImageUrl(filename: string): string {
    if (!filename) return '';
    return `http://localhost:5000/api/dealers/images/${filename}`;
  }

  private resetForm(): void {
    this.newDealer = {
      name: '',
      ownerName: '',
      registrationNumber: '',
      gstNumber: '',
      address: '',
      phone: '',
      serviceCapacity: '',
      openingTime: '',
      closingTime: '',
      rentalEnabled: 'no',
      maxRentalCars: '',
      role: 'Dealer'
    };
    
    // Reset image previews
    this.garageLogoPreview = '';
    this.serviceImagesPreview = ['', '', '', ''];
    this.rentalImagesPreview = ['', ''];
  }
}
