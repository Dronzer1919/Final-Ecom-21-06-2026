import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeService, Barcode } from '../../../services/barcode.service';

@Component({
  selector: 'app-add-barcode',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
<div class="page-container">
  <div class="page-header">
    <h1 class="page-title">Add Barcode Symbology</h1>
    <nav class="breadcrumb">
      <a routerLink="/dashboard" class="breadcrumb-link">Dashboard</a>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      <span class="breadcrumb-current">Add Barcode</span>
    </nav>
  </div>

  <form [formGroup]="barcodeForm" (ngSubmit)="onSubmit()" class="form-container">
    <div class="form-section">
      <h2 class="section-title">Barcode Symbology Information</h2>
      <div *ngIf="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div class="form-grid">
        <div class="form-group">
          <label>Symbology Name *</label>
          <input type="text" formControlName="name" placeholder="e.g., Code 128, QR Code" />
          <span class="error-text" *ngIf="barcodeForm.get('name')?.invalid && barcodeForm.get('name')?.touched">Name is required</span>
        </div>

        <div class="form-group">
          <label>Symbology Code *</label>
          <input type="text" formControlName="code" placeholder="e.g., C128, QR" style="text-transform: uppercase;" />
          <span class="error-text" *ngIf="barcodeForm.get('code')?.invalid && barcodeForm.get('code')?.touched">Code is required</span>
        </div>

        <div class="form-group full-width">
          <label>Description</label>
          <textarea formControlName="description" placeholder="Enter description" rows="3"></textarea>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn-secondary" (click)="onCancel()" [disabled]="isSubmitting">Cancel</button>
      <button type="submit" class="btn-primary" [disabled]="isSubmitting">{{ isSubmitting ? 'Saving...' : 'Save Barcode' }}</button>
    </div>
  </form>
</div>
  `,
  styles: [`@use '../../../../styles/form-common.scss'; .page-container { padding: 24px; }`]
})
export class AddBarcodeComponent {
  barcodeForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private barcodeService: BarcodeService
  ) {
    this.barcodeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.barcodeForm.valid) {
      this.isSubmitting = true;
      const barcodeData: Barcode = {
        name: this.barcodeForm.value.name,
        code: this.barcodeForm.value.code.toUpperCase(),
        description: this.barcodeForm.value.description
      };

      this.barcodeService.createBarcode(barcodeData).subscribe({
        next: () => {
          this.successMessage = 'Barcode symbology created successfully!';
          this.isSubmitting = false;
          setTimeout(() => this.onCancel(), 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create barcode symbology.';
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.barcodeForm.controls).forEach(key => this.barcodeForm.get(key)?.markAsTouched());
    }
  }

  onCancel(): void {
    this.barcodeForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }
}
