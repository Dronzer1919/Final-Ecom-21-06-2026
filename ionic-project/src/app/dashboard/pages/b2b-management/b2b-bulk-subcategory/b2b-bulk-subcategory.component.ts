import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubcategoryService } from '../../../../services/subcategory.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import * as XLSX from 'xlsx';

interface BulkSubcategoryRow {
  categoryName: string;
  name: string;
  code: string;
  description: string;
  imageUrl: string;
  isActive: string;
  _resolvedCategoryId: string;
  _rowIndex: number;
  _hasError: boolean;
  _errorReason: string;
}

@Component({
  selector: 'app-b2b-bulk-subcategory',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-bulk-subcategory.component.html',
  styleUrls: ['./b2b-bulk-subcategory.component.scss']
})
export class B2BBulkSubcategoryComponent implements OnInit {
  isDragging = false;
  uploadedFile: File | null = null;
  parsedRows: BulkSubcategoryRow[] = [];
  parseError = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uploadResults: { row: number; name: string; success: boolean; error?: string }[] = [];

  // All categories fetched from API for name → ID resolution
  allCategories: Category[] = [];
  categoriesLoaded = false;

  readonly templateHeaders = ['Category Name', 'Subcategory Name', 'Code', 'Description', 'Image URL', 'Is Active'];

  constructor(
    private router: Router,
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAllCategories();
  }

  private loadAllCategories(page = 1): void {
    // Backend enforces limit max 100 — paginate to collect all categories
    this.categoryService.getAllCategories(page, 100).subscribe({
      next: (res) => {
        const batch = res?.data?.categories ?? [];
        this.allCategories = [...this.allCategories, ...batch];
        const { totalPages, currentPage } = res?.data?.pagination ?? { totalPages: 1, currentPage: 1 };
        if (currentPage < totalPages) {
          // Fetch next page
          this.loadAllCategories(page + 1);
        } else {
          this.categoriesLoaded = true;
          if (this.parsedRows.length > 0) this.resolveCategories();
        }
      },
      error: () => {
        this.categoriesLoaded = true;
        this.toast.error('Could not load categories. Category name resolution may fail.');
      }
    });
  }

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
      categoryName: String(row['Category Name'] ?? '').trim(),
      name:         String(row['Subcategory Name'] ?? '').trim(),
      code:         String(row['Code'] ?? '').trim(),
      description:  String(row['Description'] ?? '').trim(),
      imageUrl:     String(row['Image URL'] ?? '').trim(),
      isActive:     String(row['Is Active'] ?? 'Yes'),
      _resolvedCategoryId: '',
      _rowIndex:    i + 2,
      _hasError:    false,
      _errorReason: '',
    }));
    if (this.parsedRows.length === 0) {
      this.parseError = 'No data rows found in the file.';
      return;
    }
    this.resolveCategories();
  }

  private resolveCategories(): void {
    const lookup = new Map<string, string>();
    this.allCategories.forEach(c => {
      if (c._id) {
        lookup.set(c.name.toLowerCase().trim(), c._id);
        if (c.code) lookup.set(c.code.toLowerCase().trim(), c._id);
      }
    });

    this.parsedRows = this.parsedRows.map(row => {
      const missing: string[] = [];
      if (!row.name)         missing.push('Subcategory Name');
      if (!row.code)         missing.push('Code');
      if (!row.categoryName) missing.push('Category Name');

      let resolvedId = '';
      let catError = '';
      if (row.categoryName) {
        resolvedId = lookup.get(row.categoryName.toLowerCase()) ?? '';
        if (!resolvedId) catError = `Category "${row.categoryName}" not found`;
      }

      const reasons = [...missing.map(f => `${f} is required`), catError].filter(Boolean);
      return {
        ...row,
        _resolvedCategoryId: resolvedId,
        _hasError:   reasons.length > 0,
        _errorReason: reasons.join('; '),
      };
    });
  }

  get validRows(): BulkSubcategoryRow[] { return this.parsedRows.filter(r => !r._hasError); }
  get errorRows(): BulkSubcategoryRow[] { return this.parsedRows.filter(r => r._hasError); }

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
    XLSX.utils.book_append_sheet(wb, ws, 'Subcategories');
    XLSX.writeFile(wb, 'sample-subcategories.xlsx');
  }

  downloadSampleJSON(): void {
    const blob = new Blob([JSON.stringify(this.getSample(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-subcategories.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private getSample(): Record<string, string>[] {
    return [
      { 'Category Name': 'Grocery', 'Subcategory Name': 'Grocery & Staples',     'Code': 'GRO-GS',  'Description': 'Rice, dals, oil, flour and everyday staples',  'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Subcategory Name': 'Packaged Foods',         'Code': 'GRO-PF',  'Description': 'Ready-to-eat and packaged food items',          'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Subcategory Name': 'Dairy & Frozen',         'Code': 'GRO-DF',  'Description': 'Milk, butter, cheese and frozen products',      'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Subcategory Name': 'Soap & Personal Hygiene','Code': 'GRO-SPH', 'Description': 'Soaps, shampoos and personal care products',    'Image URL': '', 'Is Active': 'Yes' },
    ];
  }

  get categoryNames(): string[] {
    return this.allCategories.map(c => c.name);
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
      category:    row._resolvedCategoryId,
      description: row.description || undefined,
      image:       row.imageUrl || undefined,
      isActive:    ['yes', 'true', '1'].includes(row.isActive.toLowerCase()),
    }));

    this.subcategoryService.bulkCreateSubcategories(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const created = res?.data?.created ?? payload.length;
        const failed  = res?.data?.failed  ?? 0;
        this.uploadResults = (res?.data?.results ?? []).map((r: any) => ({
          row:     r.row ?? 0,
          name:    r.name ?? r.subcategoryName ?? '',
          success: r.success,
          error:   r.error,
        }));
        if (failed === 0) {
          this.successMessage = `${created} subcategor${created === 1 ? 'y' : 'ies'} created successfully!`;
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

  goBack(): void { this.router.navigate(['/dashboard/b2b-management/subcategories']); }
}
