import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ServiceService, ServiceData as ApiServiceData, Vehicle, VehiclePriceRequest } from '../../services/service.service';

interface BrandPriceItem {
  brand: string;
  type: string;
  price: number;
}

interface TreeBrand {
  text: string;
  checked: boolean;
  items: TreeType[];
}

interface TreeType {
  text: string;
  checked: boolean;
}

interface ServiceData {
  id: number;
  name: string;
  estimatedTime: string;
  rentalAllowed: boolean;
  status: string;
  dealerId: number;
  createdAt: string;
  updatedAt?: string;
  dealerServiceVehicles?: any[];
  brandPrices?: Array<{brand: string, type: string, price: number}>;
}

@Component({
  selector: 'app-dealer-all-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dealer-all-services.html',
  styleUrls: ['./dealer-all-services.scss']
})
export class DealerAllServicesComponent implements OnInit {
  public currentView: string = 'services';
  public servicesData: ServiceData[] = [];
  public userName: string = '';
  public userInitials: string = '';
  public showDialog: boolean = false;
  
  // Form data
  public newService = {
    name: '',
    estimatedTime: '',
    rentalAllowed: false,
    status: true,
    brand: '',
    type: ''
  };
  
  // Tree data for brand selection - will be loaded dynamically from API
  public treeData: TreeBrand[] = [];
  
  // Selected items with prices
  public selectedItems: BrandPriceItem[] = [];
  
  // Show price field when items are selected
  public showPriceField: boolean = false;
  
  // View/Edit/Delete functionality
  public showViewDialog: boolean = false;
  public showEditDialog: boolean = false;
  public showDeleteDialog: boolean = false;
  public selectedService: ServiceData | null = null;
  public editingService: ServiceData | null = null;
  
  // Edit dialog specific properties
  public editTreeData: any[] = [];
  public editSelectedItems: BrandPriceItem[] = [];
  public showEditPriceField: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Dealer all services component loaded!');
    this.loadUserData();
  }

  ngOnInit(): void {
    this.initializeUser();
    this.loadVehiclesAndBuildTree();
    this.loadServicesData();
  }

  private initializeUser(): void {
    // Ensure user is properly loaded from localStorage
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('Initializing user from localStorage:', user);
        // Manually set the user in authService if it's not there
        (this.authService as any).currentUserSubject.next(user);
      }
    }
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

  public goToBookings(): void {
    this.router.navigate(['/dealer-dashboard']);
  }

  private loadVehiclesAndBuildTree(): void {
    this.serviceService.getVehicles().subscribe({
      next: (vehicles) => {
        console.log('Building tree data from vehicles:', vehicles);
        
        // Group vehicles by brand
        const brandGroups: { [key: string]: any[] } = {};
        vehicles.forEach(vehicle => {
          if (!brandGroups[vehicle.brand]) {
            brandGroups[vehicle.brand] = [];
          }
          brandGroups[vehicle.brand].push(vehicle.type);
        });
        
        // Remove duplicates and sort
        Object.keys(brandGroups).forEach(brand => {
          brandGroups[brand] = [...new Set(brandGroups[brand])].sort();
        });
        
        // Build tree data structure
        this.treeData = Object.keys(brandGroups).map(brand => ({
          text: brand,
          checked: false,
          items: brandGroups[brand].map((type: string) => ({
            text: type,
            checked: false
          }))
        }));
        
        console.log('Built tree data:', this.treeData);
      },
      error: (error) => {
        console.error('Error loading vehicles for tree:', error);
      }
    });
  }

  private loadServicesData(): void {
    const currentUser = this.authService.getCurrentUser();
    
    // Try to get user from localStorage as fallback
    let fallbackUser = null;
    if (!currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        fallbackUser = JSON.parse(storedUser);
      }
    }
    
    const userToUse = currentUser || fallbackUser;
    
    if (userToUse && userToUse.dealerId) {
      this.serviceService.getServicesByDealer(userToUse.dealerId).subscribe({
        next: (services) => {
          this.servicesData = services.map(service => {
            // Convert DealerServiceVehicles to brandPrices format
            const brandPrices = service.dealerServiceVehicles?.map(dsv => ({
              brand: dsv.vehicle.brand,
              type: dsv.vehicle.type,
              price: dsv.price
            })) || [];
            
            console.log('Service:', service.name, 'BrandPrices:', brandPrices);
            
            return {
              ...service,
              brandPrices: brandPrices,
              dealerServiceVehicles: service.dealerServiceVehicles || [] // Preserve original data
            };
          });
          console.log('Services data loaded:', this.servicesData);
          // Force immediate UI update
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading services:', error);
          // Fallback to mock data if API fails
          this.loadMockServicesData();
        }
      });
    } else {
      this.loadMockServicesData();
    }
  }

  private loadMockServicesData(): void {
    // Mock services data for fallback
    this.servicesData = [
      {
        id: 1,
        name: 'Oil Change',
        estimatedTime: '30 minutes',
        rentalAllowed: true,
        status: 'Active',
        dealerId: 1,
        createdAt: new Date().toISOString(),
        brandPrices: [
          { brand: 'Maruti', type: 'Simple Car', price: 500 },
          { brand: 'Honda', type: 'Luxury Car', price: 750 }
        ]
      },
      {
        id: 2,
        name: 'Car Wash',
        estimatedTime: '45 minutes',
        rentalAllowed: false,
        status: 'Active',
        dealerId: 1,
        createdAt: new Date().toISOString(),
        brandPrices: [
          { brand: 'Maruti', type: 'Simple Car', price: 300 }
        ]
      },
      {
        id: 3,
        name: 'Tire Rotation',
        estimatedTime: '1 hour',
        rentalAllowed: true,
        status: 'Active',
        dealerId: 1,
        createdAt: new Date().toISOString(),
        brandPrices: [
          { brand: 'Honda', type: 'Simple Car', price: 400 },
          { brand: 'Honda', type: 'Luxury Car', price: 600 }
        ]
      },
      {
        id: 4,
        name: 'Brake Inspection',
        estimatedTime: '2 hours',
        rentalAllowed: false,
        status: 'Active',
        dealerId: 1,
        createdAt: new Date().toISOString(),
        brandPrices: [
          { brand: 'Maruti', type: 'Luxury Car', price: 800 }
        ]
      },
      {
        id: 5,
        name: 'Engine Diagnostics',
        estimatedTime: '1.5 hours',
        rentalAllowed: true,
        status: 'Inactive',
        dealerId: 1,
        createdAt: new Date().toISOString(),
        brandPrices: []
      }
    ];
  }

  public viewService(service: ServiceData): void {
    this.selectedService = service;
    this.showViewDialog = true;
  }

  public editService(service: ServiceData): void {
    // Use setTimeout to ensure the service data is properly updated in the array
    setTimeout(() => {
      // Find the latest service data from the servicesData array to ensure we have the most recent brandPrices
      const latestService = this.servicesData.find(s => s.id === service.id);
      console.log('editService - latestService found:', latestService);
      console.log('editService - servicesData length:', this.servicesData.length);
      
      if (latestService) {
        this.editingService = { ...latestService }; // Create a copy to edit with latest data
        console.log('editService - Using latest service with brandPrices:', this.editingService.brandPrices);
      } else {
        this.editingService = { ...service }; // Fallback to original service
        console.log('editService - Using original service with brandPrices:', this.editingService.brandPrices);
      }
      
      this.initializeEditTreeData();
      this.showEditDialog = true;
      
      // Final check to ensure price field is shown if there are checked items
      setTimeout(() => {
        if (!this.showEditPriceField) {
          const hasCheckedItems = this.editTreeData.some((brand: any) => 
            brand.checked || brand.items.some((type: any) => type.checked)
          );
          if (hasCheckedItems) {
            console.log('Final check: Found checked items, showing price field');
            this.showEditPriceField = true;
            this.cdr.detectChanges();
          }
        }
      }, 50);
      
      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    }, 100); // Small delay to ensure data is updated
  }

  private initializeEditTreeData(): void {
    // Create a copy of tree data for editing
    this.editTreeData = JSON.parse(JSON.stringify(this.treeData));
    this.editSelectedItems = [];
    this.showEditPriceField = false;
    
    console.log('initializeEditTreeData - editingService:', this.editingService);
    console.log('initializeEditTreeData - editingService.brandPrices:', this.editingService?.brandPrices);
    
    // Load existing brand/type selections and prices for this service
    if (this.editingService && this.editingService.brandPrices && this.editingService.brandPrices.length > 0) {
      console.log('Edit service brandPrices:', this.editingService.brandPrices);
      this.editSelectedItems = [...this.editingService.brandPrices];
      console.log('editSelectedItems after copy:', this.editSelectedItems);
      
      // Check the corresponding tree items based on saved selections
      this.editSelectedItems.forEach(selectedItem => {
        console.log('Processing selectedItem:', selectedItem);
        const brand = this.editTreeData.find((b: any) => b.text === selectedItem.brand);
        if (brand) {
          const type = brand?.items.find((t: any) => t.text === selectedItem.type);
          if (type) {
            type.checked = true;
            console.log('Checked brand/type:', selectedItem.brand, selectedItem.type, 'Price:', selectedItem.price);
          } else {
            console.warn('Type not found in tree:', selectedItem.type);
          }
        } else {
          console.warn('Brand not found in tree:', selectedItem.brand);
        }
      });
      
      // Update brand checked states
      this.editTreeData.forEach((brand: TreeBrand) => {
        brand.checked = brand.items.every((item: TreeType) => item.checked);
      });
      
      this.showEditPriceField = this.editSelectedItems.length > 0;
      console.log('showEditPriceField:', this.showEditPriceField);
      console.log('editSelectedItems.length:', this.editSelectedItems.length);
      
      // Fallback: Check if any tree items are checked and show price field
      if (!this.showEditPriceField) {
        const hasCheckedItems = this.editTreeData.some((brand: any) => 
          brand.checked || brand.items.some((type: any) => type.checked)
        );
        if (hasCheckedItems) {
          console.log('Fallback: Found checked items in tree, showing price field');
          this.showEditPriceField = true;
        }
      }
      
      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    } else {
      console.log('No brandPrices found for editing service or brandPrices is empty');
    }
  }

  public deleteService(service: ServiceData): void {
    this.selectedService = service;
    this.showDeleteDialog = true;
  }

  public closeViewDialog(): void {
    this.showViewDialog = false;
    this.selectedService = null;
  }

  public closeEditDialog(): void {
    this.showEditDialog = false;
    this.editingService = null;
    this.editTreeData = [];
    this.editSelectedItems = [];
    this.showEditPriceField = false;
  }

  public closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.selectedService = null;
  }

  public saveEditedService(): void {
    if (this.editingService && this.editingService.name && this.editingService.estimatedTime) {
      // Convert selected items to vehicle price requests
      const vehiclePrices: VehiclePriceRequest[] = [];
      
      // Get the vehicles to map brand/type to vehicle IDs
      this.serviceService.getVehicles().subscribe({
        next: (vehicles) => {
          console.log('Edit dialog - All vehicles from API:', vehicles);
          console.log('Edit dialog - Number of vehicles:', vehicles.length);
          this.editSelectedItems.forEach(selectedItem => {
            const vehicle = vehicles.find(v => 
              v.brand === selectedItem.brand && v.type === selectedItem.type
            );
            if (vehicle) {
              vehiclePrices.push({
                vehicleId: vehicle.id,
                price: selectedItem.price
              });
            }
          });

          const updateServiceRequest = {
            name: this.editingService!.name!,
            estimatedTime: this.editingService!.estimatedTime!,
            rentalAllowed: this.editingService!.rentalAllowed!,
            status: this.editingService!.status!,
            vehiclePrices: vehiclePrices
          };

          this.serviceService.updateService(this.editingService!.id, updateServiceRequest).subscribe({
            next: (updatedService) => {
              // Update local array
              const index = this.servicesData.findIndex(s => s.id === this.editingService!.id);
              if (index !== -1) {
                const displayService: ServiceData = {
                  ...updatedService,
                  brandPrices: updatedService.dealerServiceVehicles?.map(dsv => ({
                    brand: dsv.vehicle.brand,
                    type: dsv.vehicle.type,
                    price: dsv.price
                  })) || []
                };
                this.servicesData[index] = displayService;
              }
              
              this.closeEditDialog();
              console.log('Service updated successfully:', updatedService);
              // Force immediate UI update
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error updating service:', error);
              alert('Failed to update service. Please try again.');
            }
          });
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
          alert('Failed to load vehicles. Please try again.');
        }
      });
    }
  }

  public confirmDelete(): void {
    if (this.selectedService) {
      this.serviceService.deleteService(this.selectedService.id).subscribe({
        next: () => {
          const index = this.servicesData.findIndex(s => s.id === this.selectedService!.id);
          if (index !== -1) {
            this.servicesData.splice(index, 1);
          }
          console.log('Service deleted successfully:', this.selectedService);
          this.closeDeleteDialog();
          // Force immediate UI update
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting service:', error);
          alert('Failed to delete service. Please try again.');
        }
      });
    }
  }

  public showAddServiceForm(): void {
    this.currentView = 'add-service-form';
  }

  public showServices(): void {
    this.currentView = 'services';
  }

  public toggleRentalAllowed(service: ServiceData): void {
    console.log('Toggle rental allowed for:', service);
    service.rentalAllowed = !service.rentalAllowed;
  }

  public toggleStatus(service: ServiceData): void {
    const newStatus = service.status === 'Active' ? 'Inactive' : 'Active';
    
    this.serviceService.updateServiceStatus(service.id, newStatus).subscribe({
      next: (updatedService) => {
        service.status = updatedService.status;
        console.log('Service status updated successfully:', service);
        // Force immediate UI update
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating service status:', error);
        // Revert the change on error
        service.status = service.status === 'Active' ? 'Inactive' : 'Active';
        alert('Failed to update service status. Please try again.');
      }
    });
  }

  public openAddServiceDialog(): void {
    this.showDialog = true;
    this.resetForm();
  }

  public closeDialog(): void {
    this.showDialog = false;
    this.resetForm();
  }

  public resetForm(): void {
    this.newService = {
      name: '',
      estimatedTime: '',
      rentalAllowed: false,
      status: true,
      brand: '',
      type: ''
    };
  }

  public onBrandChange(brandIndex: number): void {
    const brand = this.treeData[brandIndex];
    brand.items.forEach((item: any) => {
      item.checked = brand.checked;
    });
    this.updateSelectedItems();
  }

  public onTypeChange(brandIndex: number, typeIndex: number): void {
    const brand = this.treeData[brandIndex];
    const type = brand.items[typeIndex];
    
    // Update brand checked state based on children
    brand.checked = brand.items.every((item: any) => item.checked);
    
    this.updateSelectedItems();
  }

  public updateSelectedItems(): void {
    this.selectedItems = [];
    
    this.treeData.forEach((brand: any) => {
      brand.items.forEach((type: any) => {
        if (type.checked) {
          const existingItem = this.selectedItems.find(
            (item: BrandPriceItem) => item.brand === brand.text && item.type === type.text
          );
          
          if (existingItem) {
            // Item already exists, keep its price
            this.selectedItems.push(existingItem);
          } else {
            // New item, add with default price
            this.selectedItems.push({
              brand: brand.text,
              type: type.text,
              price: 0
            });
          }
        }
      });
    });
    
    // Remove items that are no longer checked
    this.selectedItems = this.selectedItems.filter(item => {
      const brand = this.treeData.find((b: any) => b.text === item.brand);
      const type = brand?.items.find((t: any) => t.text === item.type);
      return type?.checked;
    });
    
    this.showPriceField = this.selectedItems.length > 0;
  }

  public updatePrice(index: number, price: number): void {
    if (this.selectedItems[index]) {
      this.selectedItems[index].price = price;
    }
  }

  public removeSelectedItem(index: number): void {
    const item = this.selectedItems[index];
    
    // Uncheck the corresponding tree item
    const brand = this.treeData.find(b => b.text === item.brand);
    const type = brand?.items.find(t => t.text === item.type);
    if (type) {
      type.checked = false;
    }
    
    // Update brand checked state
    if (brand) {
      brand.checked = brand.items.every(t => t.checked);
    }
    
    this.updateSelectedItems();
  }

  // Edit dialog tree methods
  public onEditBrandChange(brandIndex: number): void {
    const brand = this.editTreeData[brandIndex];
    brand.items.forEach((item: any) => {
      item.checked = brand.checked;
    });
    this.updateEditSelectedItems();
  }

  public onEditTypeChange(brandIndex: number, typeIndex: number): void {
    const brand = this.editTreeData[brandIndex];
    const type = brand.items[typeIndex];
    
    // Update brand checked state based on children
    brand.checked = brand.items.every((item: any) => item.checked);
    
    this.updateEditSelectedItems();
  }

  public updateEditSelectedItems(): void {
    this.editSelectedItems = [];
    
    this.editTreeData.forEach((brand: { text: string; items: { checked: boolean; text: string }[] }) => {
      brand.items.forEach((type: { checked: boolean; text: string }) => {
        if (type.checked) {
          const existingItem = this.editSelectedItems.find(
            (item: BrandPriceItem) => item.brand === brand.text && item.type === type.text
          );
          
          if (existingItem) {
            // Item already exists, keep its price
            this.editSelectedItems.push(existingItem);
          } else {
            // New item, add with default price
            this.editSelectedItems.push({
              brand: brand.text,
              type: type.text,
              price: 0
            });
          }
        }
      });
    });
    
    // Remove items that are no longer checked
    this.editSelectedItems = this.editSelectedItems.filter(item => {
      const brand = this.editTreeData.find((b: any) => b.text === item.brand);
      const type = brand?.items.find((t: any) => t.text === item.type);
      return type?.checked;
    });
    
    this.showEditPriceField = this.editSelectedItems.length > 0;
    console.log('updateEditSelectedItems - showEditPriceField:', this.showEditPriceField);
    console.log('updateEditSelectedItems - editSelectedItems.length:', this.editSelectedItems.length);
    
    // Fallback: Check if any tree items are checked and show price field
    if (!this.showEditPriceField) {
      const hasCheckedItems = this.editTreeData.some((brand: any) => 
        brand.checked || brand.items.some((type: any) => type.checked)
      );
      if (hasCheckedItems) {
        console.log('Fallback: Found checked items in tree, showing price field');
        this.showEditPriceField = true;
      }
    }
    
    // Force change detection to ensure UI updates
    this.cdr.detectChanges();
  }

  public updateEditPrice(index: number, price: number): void {
    if (this.editSelectedItems[index]) {
      this.editSelectedItems[index].price = price;
    }
  }

  public removeEditSelectedItem(index: number): void {
    const item = this.editSelectedItems[index];
    
    // Uncheck the corresponding tree item
    const brand = this.editTreeData.find((b: any) => b.text === item.brand);
    const type = brand?.items.find((t: any) => t.text === item.type);
    if (type) {
      type.checked = false;
    }
    
    // Update brand checked state
    if (brand) {
      brand.checked = brand.items.every((t: any) => t.checked);
    }
    
    this.updateEditSelectedItems();
  }

  public toggleEditStatus(): void {
    if (this.editingService) {
      this.editingService.status = this.editingService.status === 'Active' ? 'Inactive' : 'Active';
    }
  }

  public saveService(): void {
    if (this.newService.name && this.newService.estimatedTime) {
      const currentUser = this.authService.getCurrentUser();
      console.log('Current user from authService:', currentUser);
      
      // Try to get user from localStorage as fallback
      let fallbackUser = null;
      if (!currentUser) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          fallbackUser = JSON.parse(storedUser);
          console.log('Fallback user from localStorage:', fallbackUser);
        }
      }
      
      const userToUse = currentUser || fallbackUser;
      
      if (!userToUse || !userToUse.dealerId) {
        console.error('No current user found or no dealerId available');
        console.log('User object:', userToUse);
        alert('Please log in again to create services.');
        this.router.navigate(['/login']);
        return;
      }

      // Convert selected items to vehicle price requests
      const vehiclePrices: VehiclePriceRequest[] = [];
      
      // First, we need to get the vehicles to map brand/type to vehicle IDs
      this.serviceService.getVehicles().subscribe({
        next: (vehicles) => {
          console.log('All vehicles from API:', vehicles);
          console.log('Number of vehicles:', vehicles.length);
          this.selectedItems.forEach(selectedItem => {
            const vehicle = vehicles.find(v => 
              v.brand === selectedItem.brand && v.type === selectedItem.type
            );
            if (vehicle) {
              vehiclePrices.push({
                vehicleId: vehicle.id,
                price: selectedItem.price
              });
            }
          });

          const createServiceRequest = {
            name: this.newService.name,
            estimatedTime: this.newService.estimatedTime,
            rentalAllowed: this.newService.rentalAllowed,
            dealerId: userToUse!.dealerId!,
            vehiclePrices: vehiclePrices
          };

          this.serviceService.createService(createServiceRequest).subscribe({
            next: (createdService) => {
              console.log('createService - createdService response:', createdService);
              console.log('createService - dealerServiceVehicles:', createdService.dealerServiceVehicles);
              
              // Convert to display format
              const displayService: ServiceData = {
                ...createdService,
                brandPrices: createdService.dealerServiceVehicles?.map(dsv => ({
                  brand: dsv.vehicle.brand,
                  type: dsv.vehicle.type,
                  price: dsv.price
                })) || []
              };
              
              console.log('createService - displayService with brandPrices:', displayService);
              console.log('createService - brandPrices array:', displayService.brandPrices);
              
              this.servicesData.push(displayService);
              console.log('createService - servicesData after push:', this.servicesData);
              
              this.closeDialog();
              console.log('Service added successfully:', createdService);
              console.log('Vehicle prices saved:', vehiclePrices);
              // Force immediate UI update
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error creating service:', error);
              alert('Failed to create service. Please try again.');
            }
          });
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
          alert('Failed to load vehicles. Please try again.');
        }
      });
    }
  }

  public goToExecutiveCars(): void {
    // Navigate to executive cars component
    console.log('Navigating to Executive Cars from All Services');
    this.router.navigate(['/dealer-executive-cars']);
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
