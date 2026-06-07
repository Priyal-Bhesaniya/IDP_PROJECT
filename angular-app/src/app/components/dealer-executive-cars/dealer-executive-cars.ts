import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExecutiveCarService, ExecutiveCar, CreateExecutiveCar, UpdateExecutiveCar } from '../../services/executive-car.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dealer-executive-cars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dealer-executive-cars.html',
  styleUrls: ['./dealer-executive-cars.scss']
})
export class DealerExecutiveCarsComponent implements OnInit {
  public executiveCars: ExecutiveCar[] = [];
  public userName: string = '';
  public userInitials: string = '';
  public searchTerm: string = '';
  
  // Dialog properties
  public isDialogOpen: boolean = false;
  public isDeleteDialogOpen: boolean = false;
  public dialogMode: 'add' | 'edit' = 'add';
  public editingCarId: number | null = null;
  public carToDelete: ExecutiveCar | null = null;
  public newCar: Partial<ExecutiveCar> = {
    category: '',
    carNumber: '',
    minKm: 0,
    extraKm: 0,
    maxKm: 0,
    gearType: '',
    fuelType: '',
    seats: 0,
    pricePerDay: 0,
    status: 'active'
  };

  constructor(
    private authService:AuthService,
    private router: Router,
    private executiveCarService: ExecutiveCarService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadUserData();
  }

  ngOnInit(): void {
    this.loadExecutiveCars();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private loadExecutiveCars(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('loadExecutiveCars - Current user:', currentUser);
    
    if (currentUser && currentUser.dealerId) {
      this.executiveCarService.getExecutiveCarsByDealer(currentUser.dealerId).subscribe({
        next: (cars) => {
          this.executiveCars = cars;
          console.log('Cars loaded:', cars);
          this.cdr.detectChanges(); // Immediate UI update
        },
        error: (error) => {
          console.error('Error loading executive cars:', error);
          // Fallback to empty array if API fails
          this.executiveCars = [];
          this.cdr.detectChanges(); // Immediate UI update
        }
      });
    } else {
      console.log('No current user or dealerId found');
      this.executiveCars = [];
    }
  }

  public get filteredCars(): ExecutiveCar[] {
    if (!this.searchTerm) {
      return this.executiveCars;
    }
    return this.executiveCars.filter(car => 
      car.carNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      car.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      car.gearType.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      car.fuelType.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  public editCar(car: ExecutiveCar): void {
    this.openEditDialog(car);
  }

  public goToBookings(): void {
    this.router.navigate(['/dealer-dashboard']);
  }

  public goToServices(): void {
    this.router.navigate(['/dealer/services']);
  }

  public deleteCar(car: ExecutiveCar): void {
    this.carToDelete = car;
    this.isDeleteDialogOpen = true;
  }

  public closeDeleteDialog(): void {
    this.isDeleteDialogOpen = false;
    this.carToDelete = null;
    this.cdr.detectChanges(); // Immediate UI update
  }

  public confirmDelete(): void {
    if (this.carToDelete) {
      this.executiveCarService.deleteExecutiveCar(this.carToDelete.id).subscribe({
        next: () => {
          // Remove from local array
          const index = this.executiveCars.findIndex(c => c.id === this.carToDelete!.id);
          if (index !== -1) {
            this.executiveCars.splice(index, 1);
            console.log('Car deleted:', this.carToDelete);
            this.cdr.detectChanges(); // Immediate UI update
          }
          this.closeDeleteDialog();
        },
        error: (error) => {
          console.error('Error deleting car:', error);
          alert('Error deleting car: ' + error.message);
        }
      });
    }
  }

  public toggleCarStatus(car: ExecutiveCar): void {
    console.log('Toggle car status for:', car);
    const newStatus = car.status === 'active' ? 'inactive' : 'active';
    
    // Update UI immediately for instant feedback
    car.status = newStatus;
    this.cdr.detectChanges();
    
    // Update database in background
    this.executiveCarService.updateExecutiveCarStatus(car.id, newStatus).subscribe({
      next: () => {
        console.log('Car status updated in database:', car);
      },
      error: (error) => {
        console.error('Error updating car status in database:', error);
        // Revert UI change if database update fails
        car.status = car.status === 'active' ? 'inactive' : 'active';
        this.cdr.detectChanges();
        alert('Error updating car status in database');
      }
    });
  }

  public addCarCategory(): void {
    this.openDialog();
  }

  // Dialog methods
  public openDialog(): void {
    this.dialogMode = 'add';
    this.editingCarId = null;
    this.isDialogOpen = true;
    this.resetNewCar();
  }

  public openEditDialog(car: ExecutiveCar): void {
    this.dialogMode = 'edit';
    this.editingCarId = car.id;
    this.isDialogOpen = true;
    this.populateNewCar(car);
  }

  public closeDialog(): void {
    this.isDialogOpen = false;
    this.dialogMode = 'add';
    this.editingCarId = null;
    this.resetNewCar();
    this.cdr.detectChanges(); // Immediate UI update
  }

  public resetNewCar(): void {
    this.newCar = {
      category: '',
      carNumber: '',
      minKm: 0,
      extraKm: 0,
      maxKm: 0,
      gearType: '',
      fuelType: '',
      seats: 0,
      pricePerDay: 0,
      status: 'active'
    };
  }

  public toggleDialogStatus(): void {
    this.newCar.status = this.newCar.status === 'active' ? 'inactive' : 'active';
  }

  public populateNewCar(car: ExecutiveCar): void {
    this.newCar = {
      category: car.category,
      carNumber: car.carNumber,
      minKm: car.minKm,
      extraKm: car.extraKm,
      maxKm: car.maxKm,
      gearType: car.gearType,
      fuelType: car.fuelType,
      seats: car.seats,
      pricePerDay: car.pricePerDay,
      status: car.status
    };
  }

  public saveCar(): void {
    // Validate required fields
    if (!this.newCar.category || !this.newCar.carNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      alert('User not found - currentUser is null');
      return;
    }
    
    if (!currentUser.dealerId) {
      alert('User not found - dealerId is missing');
      return;
    }

    if (this.dialogMode === 'add') {
      // Create new car object
      const newCarData: CreateExecutiveCar = {
        dealerId: currentUser.dealerId,
        category: this.newCar.category!,
        carNumber: this.newCar.carNumber!,
        minKm: this.newCar.minKm || 0,
        extraKm: this.newCar.extraKm || 0,
        maxKm: this.newCar.maxKm || 0,
        gearType: this.newCar.gearType || '',
        fuelType: this.newCar.fuelType || '',
        seats: this.newCar.seats || 0,
        pricePerDay: this.newCar.pricePerDay || 0,
        status: this.newCar.status || 'active'
      };

      // Call API to create car
      this.executiveCarService.createExecutiveCar(newCarData).subscribe({
        next: (createdCar) => {
          this.executiveCars.push(createdCar);
          console.log('New car added:', createdCar);
          this.cdr.detectChanges(); // Immediate UI update
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error creating car:', error);
          alert('Error creating car: ' + error.message);
        }
      });
    } else if (this.dialogMode === 'edit' && this.editingCarId !== null) {
      // Update existing car
      const updateCarData: UpdateExecutiveCar = {
        category: this.newCar.category!,
        carNumber: this.newCar.carNumber!,
        minKm: this.newCar.minKm || 0,
        extraKm: this.newCar.extraKm || 0,
        maxKm: this.newCar.maxKm || 0,
        gearType: this.newCar.gearType || '',
        fuelType: this.newCar.fuelType || '',
        seats: this.newCar.seats || 0,
        pricePerDay: this.newCar.pricePerDay || 0,
        status: this.newCar.status || 'active'
      };

      // Call API to update car
      this.executiveCarService.updateExecutiveCar(this.editingCarId, updateCarData).subscribe({
        next: () => {
          // Update local array
          const carIndex = this.executiveCars.findIndex(car => car.id === this.editingCarId);
          if (carIndex !== -1) {
            this.executiveCars[carIndex] = {
              ...this.executiveCars[carIndex],
              ...updateCarData
            };
            console.log('Car updated:', this.executiveCars[carIndex]);
            this.cdr.detectChanges(); // Immediate UI update
          }
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error updating car:', error);
          alert('Error updating car: ' + error.message);
        }
      });
    }
  }

  public goBack(): void {
    this.router.navigate(['/dealer']);
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
