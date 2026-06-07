import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupService, PopupConfig } from '../../services/popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
  public isVisible: boolean = false;
  public currentPopup: PopupConfig | null = null;

  constructor(
    private popupService: PopupService,
    private cdr: ChangeDetectorRef
  ) {
    this.popupService.popup$.subscribe(popup => {
      this.currentPopup = popup;
      this.isVisible = !!popup;
      this.cdr.detectChanges();
    });
  }

  public getIcon(): string {
    if (!this.currentPopup) return '';
    
    switch (this.currentPopup.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  public getIconColor(): string {
    if (!this.currentPopup) return '';
    
    switch (this.currentPopup.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  }

  public getBorderColor(): string {
    if (!this.currentPopup) return '';
    
    switch (this.currentPopup.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  }

  public onConfirm(): void {
    if (this.currentPopup?.onConfirm) {
      this.currentPopup.onConfirm();
    } else {
      this.popupService.closePopup();
    }
  }

  public onCancel(): void {
    if (this.currentPopup?.onCancel) {
      this.currentPopup.onCancel();
    } else {
      this.popupService.closePopup();
    }
  }

  public closePopup(): void {
    this.popupService.closePopup();
  }
}
