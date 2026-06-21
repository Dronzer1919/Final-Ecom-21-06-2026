import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubcategoryService, Subcategory } from '../../../../services/subcategory.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-subcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './add-subcategory.component.html',
  styleUrls: ['./add-subcategory.component.scss']
})
export class AddSubcategoryComponent implements OnInit {
  subcategoryForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  categories: Category[] = [];
  imageMode: 'upload' | 'url' = 'upload';
  imagePreview: string | null = null;
  isDragging = false;
  editId: string | null = null;
  isEditMode = false;

  // Bulk upload
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
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {
    this.subcategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', [Validators.required]],
      description: [''],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.editId;
    const categoryId = this.route.snapshot.queryParamMap.get('categoryId');
    if (this.isEditMode && this.editId) {
      this.loadCategories();
      this.subcategoryService.getSubcategoryById(this.editId).subscribe({
        next: (res) => {
          const s: Subcategory = res.data;
          this.subcategoryForm.patchValue({
            name: s.name,
            code: s.code,
            category: typeof s.category === 'object' ? (s.category as any)._id : s.category,
            description: s.description || '',
            image: s.image || ''
          });
          if (s.image) {
            this.imagePreview = s.image;
            this.imageMode = s.image.startsWith('data:') ? 'upload' : 'url';
          }
        },
        error: () => { this.errorMessage = 'Failed to load subcategory data.'; }
      });
    } else {
      this.loadCategories(categoryId ?? undefined);
    }
  }

  loadCategories(preselectId?: string): void {
    this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
      next: (response) => {
        this.categories = response.data.categories;
        if (preselectId) {
          this.subcategoryForm.patchValue({ category: preselectId });
        }
      },
      error: (error) => {
        console.error('Failed to load categories', error);
      }
    });
  }

  onSubmit(): void {
    if (this.subcategoryForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const subcategoryData: Subcategory = {
        name: this.subcategoryForm.value.name,
        code: this.subcategoryForm.value.code.toUpperCase(),
        category: this.subcategoryForm.value.category,
        description: this.subcategoryForm.value.description,
        image: this.subcategoryForm.value.image
      };

      const request$ = this.isEditMode && this.editId
        ? this.subcategoryService.updateSubcategory(this.editId, subcategoryData)
        : this.subcategoryService.createSubcategory(subcategoryData);

      request$.subscribe({
        next: () => {
          this.toastService.success(this.isEditMode ? 'Subcategory updated successfully!' : 'Subcategory created successfully!');
          this.isSubmitting = false;
          setTimeout(() => { this.location.back(); }, 1000);
        },
        error: (error: any) => {
          this.toastService.error(error.error?.message || 'Failed to save subcategory');
          this.errorMessage = error.error?.message || 'Failed to save subcategory. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.subcategoryForm.controls).forEach(key => {
        this.subcategoryForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.location.back();
  }

  setImageMode(mode: 'upload' | 'url'): void {
    this.imageMode = mode;
    this.imagePreview = null;
    this.subcategoryForm.patchValue({ image: '' });
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
      this.subcategoryForm.patchValue({ image: result });
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.subcategoryForm.patchValue({ image: '' });
  }

  onUrlChange(url: string): void {
    this.imagePreview = url || null;
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

  private normalizeRows(rows: any[]): any[] {
    return rows.filter(r => r.name && r.code).map(r => ({
      name: String(r.name).trim(),
      code: String(r.code).trim().toUpperCase(),
      categoryName: r.categoryName ? String(r.categoryName).trim() : undefined,
      categoryCode: r.categoryCode ? String(r.categoryCode).trim() : undefined,
      description: r.description ? String(r.description).trim() : undefined
    }));
  }

  submitBulkUpload(): void {
    if (!this.bulkParsedData.length) return;
    this.isBulkSubmitting = true;
    this.bulkResultMessage = '';
    this.bulkResultError = '';
    this.subcategoryService.bulkCreateSubcategories(this.bulkParsedData).subscribe({
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
      { name: 'Smartphones', code: 'SMPH', categoryName: 'Electronics', description: 'Mobile phones and accessories' },
      { name: 'Laptops', code: 'LAPT', categoryName: 'Electronics', description: 'Portable computers' },
      { name: 'Men Shirts', code: 'MSHT', categoryName: 'Clothing', description: 'Formal and casual shirts for men' }
    ];
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sample-subcategories.json'; a.click(); URL.revokeObjectURL(a.href);
  }

  downloadSampleExcel(): void {
    const s = [
      { name: 'Smartphones', code: 'SMPH', categoryName: 'Electronics', description: 'Mobile phones and accessories' },
      { name: 'Laptops', code: 'LAPT', categoryName: 'Electronics', description: 'Portable computers' },
      { name: 'Men Shirts', code: 'MSHT', categoryName: 'Clothing', description: 'Formal and casual shirts for men' }
    ];
    const ws = XLSX.utils.json_to_sheet(s);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Subcategories'); XLSX.writeFile(wb, 'sample-subcategories.xlsx');
  }
}
