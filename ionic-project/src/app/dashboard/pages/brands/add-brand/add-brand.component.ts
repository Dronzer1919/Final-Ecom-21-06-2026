import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandService, Brand } from '../../../../services/brand.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-brand',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './add-brand.component.html',
  styleUrls: ['./add-brand.component.scss']
})
export class AddBrandComponent implements OnInit {
  brandForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Bulk upload state
  showBulkModal = false;
  bulkFile: File | null = null;
  bulkParsedData: any[] = [];
  bulkParseError = '';
  isBulkSubmitting = false;
  bulkResultMessage = '';
  bulkResultError = '';
  bulkAcceptedFormats = '.json,.xlsx,.xls';

  constructor(
    private fb: FormBuilder,
    private brandService: BrandService,
    private cdr: ChangeDetectorRef
  ) {
    this.brandForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      logo: [''],
      website: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.brandForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const brandData: Brand = {
        name: this.brandForm.value.name,
        code: this.brandForm.value.code.toUpperCase(),
        description: this.brandForm.value.description,
        logo: this.brandForm.value.logo,
        website: this.brandForm.value.website
      };

      this.brandService.createBrand(brandData).subscribe({
        next: (response) => {
          this.successMessage = 'Brand created successfully!';
          this.isSubmitting = false;
          setTimeout(() => this.onCancel(), 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create brand. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.brandForm.controls).forEach(key => {
        this.brandForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.brandForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ─── Bulk Upload ─────────────────────────────────────────────────────────
  openBulkModal() {
    this.showBulkModal = true;
    this.bulkFile = null;
    this.bulkParsedData = [];
    this.bulkParseError = '';
    this.bulkResultMessage = '';
    this.bulkResultError = '';
  }

  closeBulkModal() {
    this.showBulkModal = false;
  }

  onBulkFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.bulkFile = file;
    this.bulkParseError = '';
    this.bulkParsedData = [];
    this.bulkResultMessage = '';
    this.bulkResultError = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') {
      this.parseJSON(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      this.parseExcel(file);
    } else {
      this.bulkParseError = 'Unsupported file type. Please upload .json, .xlsx or .xls';
    }
    input.value = '';
  }

  private parseJSON(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const arr = Array.isArray(raw) ? raw : [raw];
        this.bulkParsedData = this.normalizeRows(arr);
        this.cdr.markForCheck();
      } catch {
        this.bulkParseError = 'Invalid JSON file.';
        this.cdr.markForCheck();
      }
    };
    reader.readAsText(file);
  }

  private parseExcel(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result as ArrayBuffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        this.bulkParsedData = this.normalizeRows(rows);
        this.cdr.markForCheck();
      } catch {
        this.bulkParseError = 'Failed to parse Excel file.';
        this.cdr.markForCheck();
      }
    };
    reader.readAsArrayBuffer(file);
  }

  private normalizeRows(rows: any[]): any[] {
    return rows.map(r => ({
      name: r.name || r.Name || '',
      code: (r.code || r.Code || '').toString().toUpperCase(),
      description: r.description || r.Description || '',
      logo: r.logo || r.Logo || '',
      website: r.website || r.Website || ''
    })).filter(r => r.name && r.code);
  }

  submitBulkUpload() {
    if (!this.bulkParsedData.length) return;
    this.isBulkSubmitting = true;
    this.bulkResultMessage = '';
    this.bulkResultError = '';
    this.brandService.bulkCreateBrands(this.bulkParsedData).subscribe({
      next: (res) => {
        const d = res.data;
        this.bulkResultMessage = `Done: ${d.created.length} created, ${d.skipped.length} skipped${d.errors.length ? ', ' + d.errors.length + ' errors' : ''}.`;
        this.isBulkSubmitting = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.bulkResultError = err.error?.message || 'Bulk upload failed.';
        this.isBulkSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  downloadSampleJSON() {
    const sample = [
      { name: 'Nike', code: 'NIKE', description: 'Sportswear brand', logo: 'https://example.com/nike.png', website: 'https://nike.com' },
      { name: 'Adidas', code: 'ADID', description: 'Sports brand', logo: '', website: 'https://adidas.com' },
      { name: 'Puma', code: 'PUMA', description: '', logo: '', website: '' }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sample-brands.json'; a.click();
  }

  downloadSampleExcel() {
    const sample = [
      { name: 'Nike', code: 'NIKE', description: 'Sportswear brand', logo: 'https://example.com/nike.png', website: 'https://nike.com' },
      { name: 'Adidas', code: 'ADID', description: 'Sports brand', logo: '', website: 'https://adidas.com' },
      { name: 'Puma', code: 'PUMA', description: '', logo: '', website: '' }
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Brands');
    XLSX.writeFile(wb, 'sample-brands.xlsx');
  }
}
