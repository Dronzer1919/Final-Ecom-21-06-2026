import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreService, Store } from '../../../../services/store.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-store',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.scss']
})
export class AddStoreComponent implements OnInit {
  storeForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Bulk upload
  showBulkModal = false;
  bulkFile: File | null = null;
  bulkParsedData: Partial<Store>[] = [];
  bulkParseError = '';
  isBulkSubmitting = false;
  bulkResultMessage = '';
  bulkResultError = '';
  bulkAcceptedFormats = '.json,.xlsx,.xls';

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private cdr: ChangeDetectorRef
  ) {
    this.storeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      email: ['', [Validators.email]],
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.storeForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const storeData: Store = {
        name: this.storeForm.value.name,
        code: this.storeForm.value.code.toUpperCase(),
        phone: this.storeForm.value.phone,
        email: this.storeForm.value.email,
        address: {
          street: this.storeForm.value.street,
          city: this.storeForm.value.city,
          state: this.storeForm.value.state,
          country: this.storeForm.value.country,
          zipCode: this.storeForm.value.zipCode
        }
      };

      this.storeService.createStore(storeData).subscribe({
        next: (response) => {
          this.successMessage = 'Store created successfully!';
          this.isSubmitting = false;
          setTimeout(() => { this.onCancel(); }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create store. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.storeForm.controls).forEach(key => {
        this.storeForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.storeForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ─── Bulk Upload ─────────────────────────────────────────────────────────
  openBulkModal(): void {
    this.showBulkModal = true;
    this.bulkFile = null;
    this.bulkParsedData = [];
    this.bulkParseError = '';
    this.bulkResultMessage = '';
    this.bulkResultError = '';
  }

  closeBulkModal(): void { this.showBulkModal = false; }

  onBulkFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.bulkFile = file;
    this.bulkParsedData = [];
    this.bulkParseError = '';
    this.bulkResultMessage = '';
    this.bulkResultError = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') this.parseJSON(file);
    else if (ext === 'xlsx' || ext === 'xls') this.parseExcel(file);
    else this.bulkParseError = 'Unsupported format. Use .json, .xlsx, or .xls';
  }

  private parseJSON(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arr = JSON.parse(e.target?.result as string);
        this.bulkParsedData = this.normalizeRows(Array.isArray(arr) ? arr : [arr]);
        if (!this.bulkParsedData.length) this.bulkParseError = 'No valid rows found.';
      } catch { this.bulkParseError = 'Invalid JSON file.'; }
      this.cdr.detectChanges();
    };
    reader.readAsText(file);
  }

  private parseExcel(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array' });
        const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        this.bulkParsedData = this.normalizeRows(rows);
        if (!this.bulkParsedData.length) this.bulkParseError = 'No valid rows found.';
      } catch { this.bulkParseError = 'Failed to parse Excel file.'; }
      this.cdr.detectChanges();
    };
    reader.readAsArrayBuffer(file);
  }

  private normalizeRows(rows: any[]): Partial<Store>[] {
    return rows.filter(r => r.name && r.code).map(r => ({
      name: String(r.name).trim(),
      code: String(r.code).trim().toUpperCase(),
      phone: r.phone ? String(r.phone).trim() : undefined,
      email: r.email ? String(r.email).trim() : undefined,
      address: { street: r.street || '', city: r.city || '', state: r.state || '', country: r.country || '', zipCode: r.zipCode || '' }
    }));
  }

  submitBulkUpload(): void {
    if (!this.bulkParsedData.length) return;
    this.isBulkSubmitting = true;
    this.bulkResultMessage = '';
    this.bulkResultError = '';
    this.storeService.bulkCreateStores(this.bulkParsedData).subscribe({
      next: (res) => {
        const d = res.data;
        this.bulkResultMessage = `✓ ${d.created?.length ?? 0} created, ${d.skipped?.length ?? 0} skipped, ${d.errors?.length ?? 0} errors.`;
        if (d.errors?.length) this.bulkResultError = 'Errors: ' + d.errors.map((e: any) => `Row ${e.index + 1}: ${e.reason}`).join('; ');
        this.isBulkSubmitting = false;
        this.bulkParsedData = [];
        this.bulkFile = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.bulkResultError = err.error?.message || 'Bulk upload failed.';
        this.isBulkSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadSampleJSON(): void {
    const s = [
      { name: 'Downtown Store', code: 'ST001', phone: '9876543210', email: 'downtown@example.com', street: '10 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001' },
      { name: 'North Branch', code: 'ST002', phone: '9876543211', email: 'north@example.com', street: '22 Civil Lines', city: 'Delhi', state: 'Delhi', country: 'India', zipCode: '110001' },
      { name: 'South Outlet', code: 'ST003', phone: '', email: '', street: '5 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zipCode: '600002' }
    ];
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sample-stores.json'; a.click(); URL.revokeObjectURL(a.href);
  }

  downloadSampleExcel(): void {
    const s = [
      { name: 'Downtown Store', code: 'ST001', phone: '9876543210', email: 'downtown@example.com', street: '10 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001' },
      { name: 'North Branch', code: 'ST002', phone: '9876543211', email: 'north@example.com', street: '22 Civil Lines', city: 'Delhi', state: 'Delhi', country: 'India', zipCode: '110001' },
      { name: 'South Outlet', code: 'ST003', phone: '', email: '', street: '5 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zipCode: '600002' }
    ];
    const ws = XLSX.utils.json_to_sheet(s);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Stores'); XLSX.writeFile(wb, 'sample-stores.xlsx');
  }
}
