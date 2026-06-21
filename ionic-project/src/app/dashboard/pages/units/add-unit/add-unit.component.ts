import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnitService, Unit } from '../../../../services/unit.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-unit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-unit.component.html',
  styleUrls: ['./add-unit.component.scss']
})
export class AddUnitComponent {
  unitForm: FormGroup;
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
    private unitService: UnitService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.unitForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      shortName: ['', [Validators.required, Validators.minLength(1)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.unitForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const unitData: Unit = {
        name: this.unitForm.value.name,
        shortName: this.unitForm.value.shortName.toUpperCase(),
        description: this.unitForm.value.description
      };

      this.unitService.createUnit(unitData).subscribe({
        next: (response) => {
          console.log('Unit created successfully:', response);
          this.successMessage = 'Unit created successfully!';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/inventory/units']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating unit:', error);
          this.errorMessage = error.error?.message || 'Failed to create unit.';
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.unitForm.controls).forEach(key => this.unitForm.get(key)?.markAsTouched());
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory/units']);
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
      shortName: (r.shortName || r.shortname || r.ShortName || r['Short Name'] || '').toString().toUpperCase(),
      description: r.description || r.Description || ''
    })).filter(r => r.name && r.shortName);
  }

  submitBulkUpload() {
    if (!this.bulkParsedData.length) return;
    this.isBulkSubmitting = true;
    this.bulkResultMessage = '';
    this.bulkResultError = '';
    this.unitService.bulkCreateUnits(this.bulkParsedData).subscribe({
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
      { name: 'Kilogram', shortName: 'KG', description: 'Unit of weight' },
      { name: 'Piece', shortName: 'PC', description: 'Single item' },
      { name: 'Litre', shortName: 'LT', description: 'Unit of volume' }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sample-units.json'; a.click();
  }

  downloadSampleExcel() {
    const sample = [
      { name: 'Kilogram', shortName: 'KG', description: 'Unit of weight' },
      { name: 'Piece', shortName: 'PC', description: 'Single item' },
      { name: 'Litre', shortName: 'LT', description: 'Unit of volume' }
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Units');
    XLSX.writeFile(wb, 'sample-units.xlsx');
  }
}
