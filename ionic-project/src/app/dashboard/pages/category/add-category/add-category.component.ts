import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  imageMode: 'upload' | 'url' = 'upload';
  imagePreview: string | null = null;
  isDragging = false;
  editId: string | null = null;
  isEditMode = false;

  // Bulk upload
  showBulkModal = false;
  bulkFile: File | null = null;
  bulkParsedData: Partial<Category>[] = [];
  bulkParseError = '';
  isBulkSubmitting = false;
  bulkResultMessage = '';
  bulkResultError = '';
  bulkAcceptedFormats = '.json,.xlsx,.xls';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.editId;
    if (this.isEditMode && this.editId) {
      this.categoryService.getCategoryById(this.editId).subscribe({
        next: (res) => {
          const c: Category = res.data;
          this.categoryForm.patchValue({
            name: c.name,
            code: c.code,
            description: c.description || '',
            image: c.image || ''
          });
          if (c.image) {
            this.imagePreview = c.image;
            this.imageMode = c.image.startsWith('data:') ? 'upload' : 'url';
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load category data.';
        }
      });
    }
  }

  setImageMode(mode: 'upload' | 'url'): void {
    this.imageMode = mode;
    this.imagePreview = null;
    this.categoryForm.patchValue({ image: '' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.readFile(file);
    }
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.imagePreview = result;
      this.categoryForm.patchValue({ image: result });
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.categoryForm.patchValue({ image: '' });
  }

  onUrlChange(url: string): void {
    this.imagePreview = url || null;
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const categoryData: Category = {
        name: this.categoryForm.value.name,
        code: this.categoryForm.value.code.toUpperCase(),
        description: this.categoryForm.value.description,
        image: this.categoryForm.value.image
      };

      const request$ = this.isEditMode
        ? this.categoryService.updateCategory(this.editId!, categoryData)
        : this.categoryService.createCategory(categoryData);

      request$.subscribe({
        next: () => {
          this.toastService.success(this.isEditMode ? 'Category updated successfully!' : 'Category created successfully!');
          this.isSubmitting = false;
          setTimeout(() => this.location.back(), 1000);
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} category`);
          this.errorMessage = err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} category. Please try again.`;
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.location.back();
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

  private normalizeRows(rows: any[]): Partial<Category>[] {
    return rows.filter(r => r.name && r.code).map(r => ({
      name: String(r.name).trim(),
      code: String(r.code).trim().toUpperCase(),
      description: r.description ? String(r.description).trim() : undefined
    }));
  }

  submitBulkUpload(): void {
    if (!this.bulkParsedData.length) return;
    this.isBulkSubmitting = true;
    this.bulkResultMessage = '';
    this.bulkResultError = '';
    this.categoryService.bulkCreateCategories(this.bulkParsedData).subscribe({
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
      { name: 'Electronics', code: 'ELEC', description: 'Electronic gadgets and devices' },
      { name: 'Clothing', code: 'CLTH', description: 'Apparel and accessories' },
      { name: 'Groceries', code: 'GROC', description: 'Food and daily essentials' }
    ];
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sample-categories.json'; a.click(); URL.revokeObjectURL(a.href);
  }

  downloadSampleExcel(): void {
    const s = [
      { name: 'Electronics', code: 'ELEC', description: 'Electronic gadgets and devices' },
      { name: 'Clothing', code: 'CLTH', description: 'Apparel and accessories' },
      { name: 'Groceries', code: 'GROC', description: 'Food and daily essentials' }
    ];
    const ws = XLSX.utils.json_to_sheet(s);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Categories'); XLSX.writeFile(wb, 'sample-categories.xlsx');
  }
}
