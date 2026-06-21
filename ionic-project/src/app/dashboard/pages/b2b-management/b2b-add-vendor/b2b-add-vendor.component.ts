import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { B2BManagementService, B2BVendor } from '../../../../services/b2b-management.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-b2b-add-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './b2b-add-vendor.component.html',
  styleUrls: ['./b2b-add-vendor.component.scss']
})
export class B2BAddVendorComponent implements OnInit {
  vendorForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  editId: string | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private b2bService: B2BManagementService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.editId;
    if (this.isEditMode && this.editId) {
      this.b2bService.getVendorById(this.editId).subscribe({
        next: (res) => {
          const v: B2BVendor = res.data;
          this.vendorForm.patchValue({
            name: v.name,
            email: v.email || '',
            phone: v.phone || '',
            address: v.address || '',
            city: v.city || '',
            country: v.country || 'India',
            supplierCode: v.supplierCode || '',
            rating: v.rating ?? 4.0,
            responseRate: v.responseRate ?? 100,
            hasGST: v.hasGST || false,
            gstNumber: v.gstNumber || '',
            location: v.location || '',
            locality: v.locality || '',
            memberSince: v.memberSince || '',
            minOrderQty: v.minOrderQty ?? 1,
            variety: v.variety || ''
          });
        },
        error: () => { this.errorMessage = 'Failed to load vendor data.'; }
      });
    }
  }

  buildForm(): void {
    this.vendorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: [''],
      address: [''],
      city: [''],
      country: ['India'],
      supplierCode: [''],
      rating: [4.0, [Validators.min(1), Validators.max(5)]],
      responseRate: [100, [Validators.min(0), Validators.max(100)]],
      hasGST: [false],
      gstNumber: [''],
      location: [''],
      locality: [''],
      memberSince: [''],
      minOrderQty: [1, Validators.min(1)],
      variety: ['']
    });
  }

  onSubmit(): void {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const val = this.vendorForm.value;
    const payload: Partial<B2BVendor> = {
      name: val.name,
      email: val.email || undefined,
      phone: val.phone || undefined,
      address: val.address || undefined,
      city: val.city || undefined,
      country: val.country || 'India',
      supplierCode: val.supplierCode || undefined,
      rating: +val.rating,
      responseRate: +val.responseRate,
      hasGST: val.hasGST,
      gstNumber: val.hasGST ? val.gstNumber : undefined,
      location: val.location || undefined,
      locality: val.locality || undefined,
      memberSince: val.memberSince || undefined,
      minOrderQty: +val.minOrderQty,
      variety: val.variety || undefined,
      isB2BVendor: true
    };

    const call = this.isEditMode && this.editId
      ? this.b2bService.updateVendor(this.editId, payload)
      : this.b2bService.createVendor(payload);

    call.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'Vendor updated successfully!' : 'Vendor created successfully!');
        this.router.navigate(['/dashboard/b2b-management/vendors']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to save vendor. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/b2b-management/vendors']);
  }
}
