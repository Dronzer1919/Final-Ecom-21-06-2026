import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import * as XLSX from 'xlsx';

interface BulkCategoryRow {
  name: string;
  code: string;
  description: string;
  imageUrl: string;
  isActive: string;
  _rowIndex: number;
  _hasError: boolean;
}

@Component({
  selector: 'app-b2b-bulk-category',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-bulk-category.component.html',
  styleUrls: ['./b2b-bulk-category.component.scss']
})
export class B2BBulkCategoryComponent implements OnInit {
  isDragging = false;
  uploadedFile: File | null = null;
  parsedRows: BulkCategoryRow[] = [];
  parseError = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uploadResults: { row: number; name: string; success: boolean; error?: string }[] = [];

  readonly templateHeaders = ['Category Name', 'Code', 'Description', 'Image URL', 'Is Active'];

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragging = true; }
  onDragLeave(): void { this.isDragging = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files?.length) this.processFile(files[0]);
  }

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.processFile(input.files[0]);
  }

  processFile(file: File): void {
    this.parseError = '';
    this.parsedRows = [];
    this.successMessage = '';
    this.errorMessage = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'json'].includes(ext || '')) {
      this.parseError = 'Invalid file type. Please upload .xlsx, .xls, .csv, or .json files.';
      return;
    }
    this.uploadedFile = file;
    const reader = new FileReader();
    if (ext === 'json') {
      reader.onload = (ev) => {
        try { this.mapRows(JSON.parse(ev.target?.result as string)); }
        catch { this.parseError = 'Failed to parse JSON. Please check the file format.'; }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
          this.mapRows(rows);
        } catch { this.parseError = 'Failed to parse file. Please check the format and try again.'; }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  private mapRows(rows: any[]): void {
    this.parsedRows = rows.map((row, i) => ({
      name:        String(row['Category Name'] ?? '').trim(),
      code:        String(row['Code'] ?? '').trim(),
      description: String(row['Description'] ?? '').trim(),
      imageUrl:    String(row['Image URL'] ?? '').trim(),
      isActive:    String(row['Is Active'] ?? 'Yes'),
      _rowIndex:   i + 2,
      _hasError:   !String(row['Category Name'] ?? '').trim() || !String(row['Code'] ?? '').trim(),
    }));
    if (this.parsedRows.length === 0) this.parseError = 'No data rows found in the file.';
  }

  get validRows(): BulkCategoryRow[] { return this.parsedRows.filter(r => !r._hasError); }
  get errorRows(): BulkCategoryRow[] { return this.parsedRows.filter(r => r._hasError); }

  clearFile(): void {
    this.uploadedFile = null;
    this.parsedRows = [];
    this.parseError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadResults = [];
  }

  downloadSampleExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.getSample());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categories');
    XLSX.writeFile(wb, 'sample-categories.xlsx');
  }

  downloadSampleJSON(): void {
    const blob = new Blob([JSON.stringify(this.getSample(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-categories.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private getSample(): Record<string, string>[] {
    return [
      { 'Category Name': 'Grocery', 'Code': 'GRO', 'Description': 'Staples, packaged foods, dairy, and more', 'Image URL': '', 'Is Active': 'Yes' },
    ];
  }

  onSubmit(): void {
    if (this.validRows.length === 0) return;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadResults = [];

    const payload = this.validRows.map(row => ({
      name:        row.name,
      code:        row.code,
      description: row.description || undefined,
      image:       row.imageUrl || undefined,
      isActive:    ['yes', 'true', '1'].includes(row.isActive.toLowerCase()),
    }));

    this.categoryService.bulkCreateCategories(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const created = res?.data?.created ?? payload.length;
        const failed  = res?.data?.failed  ?? 0;
        this.uploadResults = (res?.data?.results ?? []).map((r: any) => ({
          row:     r.row ?? 0,
          name:    r.name ?? r.categoryName ?? '',
          success: r.success,
          error:   r.error,
        }));
        if (failed === 0) {
          this.successMessage = `${created} categor${created === 1 ? 'y' : 'ies'} created successfully!`;
          this.toast.success(this.successMessage);
          this.clearFile();
        } else {
          this.errorMessage = `${created} created, ${failed} failed. See results below.`;
          this.toast.error(this.errorMessage);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Bulk upload failed. Please try again.';
        this.toast.error(this.errorMessage);
      }
    });
  }

  goBack(): void { this.router.navigate(['/dashboard/b2b-management/categories']); }
}
