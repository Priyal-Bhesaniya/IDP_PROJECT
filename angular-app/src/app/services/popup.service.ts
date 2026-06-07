import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PopupConfig {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupState = new BehaviorSubject<PopupConfig | null>(null);
  public popup$ = this.popupState.asObservable();

  showPopup(config: PopupConfig): void {
    this.popupState.next({
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      ...config
    });
  }

  showSuccess(title: string, message: string): void {
    this.showPopup({
      title,
      message,
      type: 'success'
    });
  }

  showError(title: string, message: string): void {
    this.showPopup({
      title,
      message,
      type: 'error'
    });
  }

  showWarning(title: string, message: string): void {
    this.showPopup({
      title,
      message,
      type: 'warning'
    });
  }

  showInfo(title: string, message: string): void {
    this.showPopup({
      title,
      message,
      type: 'info'
    });
  }

  showConfirm(config: Omit<PopupConfig, 'type'>): Promise<boolean> {
    return new Promise((resolve) => {
      this.showPopup({
        ...config,
        type: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        onConfirm: () => {
          config.onConfirm?.();
          resolve(true);
          this.closePopup();
        },
        onCancel: () => {
          config.onCancel?.();
          resolve(false);
          this.closePopup();
        }
      });
    });
  }

  closePopup(): void {
    this.popupState.next(null);
  }
}
