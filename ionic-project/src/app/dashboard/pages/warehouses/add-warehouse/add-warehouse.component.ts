import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WarehouseService, Warehouse } from '../../../../services/warehouse.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './add-warehouse.component.html',
  styleUrls: ['./add-warehouse.component.scss']
})
export class AddWarehouseComponent implements OnInit {
  warehouseForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  editId: string | null = null;
  isEditMode = false;

  // Bulk upload modal state
  showBulkModal = false;
  bulkFile: File | null = null;
  bulkParsedData: Partial<Warehouse>[] = [];
  bulkParseError = '';
  isBulkSubmitting = false;
  bulkResultMessage = '';
  bulkResultError = '';
  bulkAcceptedFormats = '.json,.xlsx,.xls';

  constructor(
    private fb: FormBuilder,
    private warehouseService: WarehouseService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.warehouseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      email: ['', [Validators.email]],
      capacity: [0, [Validators.min(0)]],
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
    });
  }

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.editId;
    if (this.isEditMode && this.editId) {
      this.warehouseService.getWarehouseById(this.editId).subscribe({
        next: (res) => {
          const w: Warehouse = res.data;
          this.warehouseForm.patchValue({
            name: w.name,
            code: w.code,
            phone: w.phone || '',
            email: w.email || '',
            capacity: w.capacity ?? 0,
            street: w.address?.street || '',
            city: w.address?.city || '',
            state: w.address?.state || '',
            country: w.address?.country || '',
            zipCode: w.address?.zipCode || ''
          });
        },
        error: () => {
          this.errorMessage = 'Failed to load warehouse data.';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.warehouseForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const warehouseData: Warehouse = {
        name: this.warehouseForm.value.name,
        code: this.warehouseForm.value.code.toUpperCase(),
        phone: this.warehouseForm.value.phone,
        email: this.warehouseForm.value.email,
        capacity: this.warehouseForm.value.capacity,
        address: {
          street: this.warehouseForm.value.street,
          city: this.warehouseForm.value.city,
          state: this.warehouseForm.value.state,
          country: this.warehouseForm.value.country,
          zipCode: this.warehouseForm.value.zipCode
        }
      };

      const request$ = this.isEditMode
        ? this.warehouseService.updateWarehouse(this.editId!, warehouseData)
        : this.warehouseService.createWarehouse(warehouseData);

      request$.subscribe({
        next: () => {
          this.successMessage = this.isEditMode ? 'Warehouse updated successfully!' : 'Warehouse created successfully!';
          this.isSubmitting = false;
          this.cdr.detectChanges();
          setTimeout(() => this.onCancel(), 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} warehouse. Please try again.`;
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      Object.keys(this.warehouseForm.controls).forEach(key => {
        this.warehouseForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/peoples/warehouses']);
  }

  // ─── Bulk Upload ──────────────────────────────────────────────────────────
  openBulkModal(): void {
    this.showBulkModal = true;
    this.bulkFile = null;
    this.bulkParsedData = [];
    this.bulkParseError = '';
    this.bulkResultMessage = '';
    this.bulkResultError = '';
  }

  closeBulkModal(): void {
    this.showBulkModal = false;
  }

  onBulkFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.bulkFile = file;
    this.bulkParsedData = [];
    this.bulkParseError = '';
    this.bulkResultMessage = '';
    this.bulkResultError = '';

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') {
      this.parseJSON(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      this.parseExcel(file);
    } else {
      this.bulkParseError = 'Unsupported file format. Please upload a .json, .xlsx, or .xls file.';
    }
  }

  private parseJSON(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        this.bulkParsedData = this.normalizeBulkRows(arr);
        if (this.bulkParsedData.length === 0) {
          this.bulkParseError = 'No valid rows found in the JSON file.';
        }
      } catch {
        this.bulkParseError = 'Invalid JSON file. Please check the file format.';
      }
      this.cdr.detectChanges();
    };
    reader.readAsText(file);
  }

  private parseExcel(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        this.bulkParsedData = this.normalizeBulkRows(rows);
        if (this.bulkParsedData.length === 0) {
          this.bulkParseError = 'No valid rows found in the Excel file.';
        }
      } catch {
        this.bulkParseError = 'Failed to parse Excel file. Please check the file format.';
      }
      this.cdr.detectChanges();
    };
    reader.readAsArrayBuffer(file);
  }

  private normalizeBulkRows(rows: any[]): Partial<Warehouse>[] {
    return rows
      .filter(r => r.name && r.code)
      .map(r => ({
        name: String(r.name || '').trim(),
        code: String(r.code || '').trim().toUpperCase(),
        phone: r.phone ? String(r.phone).trim() : undefined,
        email: r.email ? String(r.email).trim() : undefined,
        capacity: r.capacity ? Number(r.capacity) : 0,
        address: {
          street: r.street || r['address.street'] || '',
          city: r.city || r['address.city'] || '',
          state: r.state || r['address.state'] || '',
          country: r.country || r['address.country'] || '',
          zipCode: r.zipCode || r['address.zipCode'] || ''
        }
      }));
  }

  submitBulkUpload(): void {
    if (this.bulkParsedData.length === 0) return;
    this.isBulkSubmitting = true;
    this.bulkResultMessage = '';
    this.bulkResultError = '';

    this.warehouseService.bulkCreateWarehouses(this.bulkParsedData).subscribe({
      next: (res) => {
        const d = res.data;
        this.bulkResultMessage = `✓ ${d.created?.length ?? 0} created, ${d.skipped?.length ?? 0} skipped, ${d.errors?.length ?? 0} errors.`;
        if (d.errors?.length) {
          this.bulkResultError = 'Some rows had errors: ' + d.errors.map((e: any) => `Row ${e.index + 1}: ${e.reason}`).join('; ');
        }
        this.isBulkSubmitting = false;
        this.bulkParsedData = [];
        this.bulkFile = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.bulkResultError = err.error?.message || 'Bulk upload failed. Please try again.';
        this.isBulkSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadSampleJSON(): void {
    const sample = [
      { name: 'Main Warehouse', code: 'WH001', phone: '9876543210', email: 'main@example.com', capacity: 1000, street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001' },
      { name: 'North Hub', code: 'WH002', phone: '9876543211', email: 'north@example.com', capacity: 500, street: '45 Civil Lines', city: 'Delhi', state: 'Delhi', country: 'India', zipCode: '110001' },
      { name: 'South Storage', code: 'WH003', phone: '', email: '', capacity: 750, street: '78 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zipCode: '600002' }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-warehouses.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  downloadSampleExcel(): void {
    const sample = [
      { name: 'Main Warehouse', code: 'WH001', phone: '9876543210', email: 'main@example.com', capacity: 1000, street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001' },
      { name: 'North Hub', code: 'WH002', phone: '9876543211', email: 'north@example.com', capacity: 500, street: '45 Civil Lines', city: 'Delhi', state: 'Delhi', country: 'India', zipCode: '110001' },
      { name: 'South Storage', code: 'WH003', phone: '', email: '', capacity: 750, street: '78 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zipCode: '600002' }
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Warehouses');
    XLSX.writeFile(wb, 'sample-warehouses.xlsx');
  }
}
