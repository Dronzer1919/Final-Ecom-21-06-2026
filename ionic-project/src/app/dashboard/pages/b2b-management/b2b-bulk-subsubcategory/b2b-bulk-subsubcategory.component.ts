import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubcategoryService, Subcategory } from '../../../../services/subcategory.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import * as XLSX from 'xlsx';

interface BulkSubSubCategoryRow {
  categoryName: string;
  subcategoryName: string;
  name: string;
  code: string;
  description: string;
  imageUrl: string;
  isActive: string;
  _resolvedCategoryId: string;
  _resolvedSubcategoryId: string;
  _rowIndex: number;
  _hasError: boolean;
  _errorReason: string;
}

@Component({
  selector: 'app-b2b-bulk-subsubcategory',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-bulk-subsubcategory.component.html',
  styleUrls: ['./b2b-bulk-subsubcategory.component.scss']
})
export class B2BBulkSubSubCategoryComponent implements OnInit {
  isDragging = false;
  uploadedFile: File | null = null;
  parsedRows: BulkSubSubCategoryRow[] = [];
  parseError = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uploadResults: { row: number; name: string; success: boolean; error?: string }[] = [];

  allCategories: Category[] = [];
  allSubcategories: Subcategory[] = [];
  categoriesLoaded = false;
  subcategoriesLoaded = false;

  readonly templateHeaders = [
    'Category Name', 'Sub-Category Name', 'Sub-Sub Category Name', 'Code', 'Description', 'Image URL', 'Is Active'
  ];

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
    this.categoryService.getAllCategories(page, 100).subscribe({
      next: (res) => {
        const batch = res?.data?.categories ?? [];
        this.allCategories = [...this.allCategories, ...batch];
        const { totalPages, currentPage } = res?.data?.pagination ?? { totalPages: 1, currentPage: 1 };
        if (currentPage < totalPages) {
          this.loadAllCategories(page + 1);
        } else {
          this.categoriesLoaded = true;
          this.loadAllSubcategories();
        }
      },
      error: () => {
        this.categoriesLoaded = true;
        this.toast.error('Could not load categories. Name resolution may fail.');
        this.loadAllSubcategories();
      }
    });
  }

  private loadAllSubcategories(page = 1): void {
    this.subcategoryService.getAllSubcategories(page, 100).subscribe({
      next: (res) => {
        const batch = res?.data?.subcategories ?? [];
        this.allSubcategories = [...this.allSubcategories, ...batch];
        const { totalPages, currentPage } = res?.data?.pagination ?? { totalPages: 1, currentPage: 1 };
        if (currentPage < totalPages) {
          this.loadAllSubcategories(page + 1);
        } else {
          this.subcategoriesLoaded = true;
          if (this.parsedRows.length > 0) this.resolveParents();
        }
      },
      error: () => {
        this.subcategoriesLoaded = true;
        this.toast.error('Could not load sub-categories. Name resolution may fail.');
      }
    });
  }

  get isLoaded(): boolean { return this.categoriesLoaded && this.subcategoriesLoaded; }

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
      categoryName:    String(row['Category Name'] ?? '').trim(),
      subcategoryName: String(row['Sub-Category Name'] ?? '').trim(),
      name:            String(row['Sub-Sub Category Name'] ?? '').trim(),
      code:            String(row['Code'] ?? '').trim(),
      description:     String(row['Description'] ?? '').trim(),
      imageUrl:        String(row['Image URL'] ?? '').trim(),
      isActive:        String(row['Is Active'] ?? 'Yes'),
      _resolvedCategoryId:    '',
      _resolvedSubcategoryId: '',
      _rowIndex:   i + 2,
      _hasError:   false,
      _errorReason: '',
    }));
    if (this.parsedRows.length === 0) {
      this.parseError = 'No data rows found in the file.';
      return;
    }
    if (this.isLoaded) this.resolveParents();
  }

  private resolveParents(): void {
    const catLookup = new Map<string, string>();
    this.allCategories.forEach(c => {
      if (c._id) {
        catLookup.set(c.name.toLowerCase().trim(), c._id);
        if (c.code) catLookup.set(c.code.toLowerCase().trim(), c._id);
      }
    });

    const subLookup = new Map<string, string>();
    this.allSubcategories.forEach(s => {
      if (s._id) {
        subLookup.set(s.name.toLowerCase().trim(), s._id);
        if (s.code) subLookup.set(s.code.toLowerCase().trim(), s._id);
      }
    });

    this.parsedRows = this.parsedRows.map(row => {
      const missing: string[] = [];
      if (!row.name)            missing.push('Sub-Sub Category Name');
      if (!row.code)            missing.push('Code');
      if (!row.subcategoryName) missing.push('Sub-Category Name');

      let resolvedCatId = '';
      let resolvedSubId = '';
      const errors: string[] = [];

      if (row.categoryName) {
        resolvedCatId = catLookup.get(row.categoryName.toLowerCase()) ?? '';
        if (!resolvedCatId) errors.push(`Category "${row.categoryName}" not found`);
      }

      if (row.subcategoryName) {
        resolvedSubId = subLookup.get(row.subcategoryName.toLowerCase()) ?? '';
        if (!resolvedSubId) errors.push(`Sub-Category "${row.subcategoryName}" not found`);
      }

      const reasons = [...missing.map(f => `${f} is required`), ...errors].filter(Boolean);
      return {
        ...row,
        _resolvedCategoryId:    resolvedCatId,
        _resolvedSubcategoryId: resolvedSubId,
        _hasError:   reasons.length > 0,
        _errorReason: reasons.join('; '),
      };
    });
  }

  get validRows(): BulkSubSubCategoryRow[] { return this.parsedRows.filter(r => !r._hasError); }
  get errorRows(): BulkSubSubCategoryRow[] { return this.parsedRows.filter(r => r._hasError); }

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
    XLSX.utils.book_append_sheet(wb, ws, 'SubSubCategories');
    XLSX.writeFile(wb, 'sample-subsubcategories.xlsx');
  }

  downloadSampleJSON(): void {
    const blob = new Blob([JSON.stringify(this.getSample(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-subsubcategories.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private getSample(): Record<string, string>[] {
    return [
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',     'Sub-Sub Category Name': 'Rice',              'Code': 'GS-RICE',  'Description': 'All rice varieties — Basmati, Indrayani, Sona Masoori', 'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',     'Sub-Sub Category Name': 'Dal & Pulses',      'Code': 'GS-DAL',   'Description': 'Toor dal, chana dal, moong dal and lentils',             'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',     'Sub-Sub Category Name': 'Cooking Oil',       'Code': 'GS-OIL',   'Description': 'Sunflower, groundnut, mustard and refined oils',          'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',     'Sub-Sub Category Name': 'Flour & Atta',      'Code': 'GS-FLOUR', 'Description': 'Wheat atta, maida, besan and multigrain flour',           'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',     'Sub-Sub Category Name': 'Sugar & Salt',      'Code': 'GS-SUGAR', 'Description': 'Sugar, jaggery, rock salt and table salt',               'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',     'Sub-Sub Category Name': 'Spices & Masala',   'Code': 'GS-SPICE', 'Description': 'Whole spices, ground masalas and blended spice mixes',    'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Packaged Foods',        'Sub-Sub Category Name': 'Instant Noodles',   'Code': 'PF-NOOD',  'Description': 'Ready-to-cook instant noodles and pasta',                'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Packaged Foods',        'Sub-Sub Category Name': 'Biscuits & Snacks', 'Code': 'PF-BISC',  'Description': 'Packaged biscuits, chips and namkeen',                   'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Dairy & Frozen',        'Sub-Sub Category Name': 'Milk & Butter',     'Code': 'DF-MILK',  'Description': 'Full cream milk, butter and ghee',                       'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Dairy & Frozen',        'Sub-Sub Category Name': 'Frozen Vegetables', 'Code': 'DF-VEGF',  'Description': 'IQF peas, corn, mixed vegetables',                       'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Soap & Personal Hygiene','Sub-Sub Category Name': 'Soaps & Handwash', 'Code': 'SPH-SOAP', 'Description': 'Bar soap, liquid handwash and sanitizers',               'Image URL': '', 'Is Active': 'Yes' },
      { 'Category Name': 'Grocery', 'Sub-Category Name': 'Soap & Personal Hygiene','Sub-Sub Category Name': 'Shampoo & Hair',  'Code': 'SPH-HAIR', 'Description': 'Shampoo, conditioner and hair oil',                      'Image URL': '', 'Is Active': 'Yes' },
    ];
  }

  get categoryNames(): string[] { return this.allCategories.map(c => c.name); }
  get subcategoryNames(): string[] { return this.allSubcategories.map(s => s.name); }

  onSubmit(): void {
    if (this.validRows.length === 0) return;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadResults = [];

    const payload = this.validRows.map(row => ({
      name:               row.name,
      code:               row.code,
      category:           row._resolvedCategoryId || undefined,
      parentSubcategory:  row._resolvedSubcategoryId,
      description:        row.description || undefined,
      image:              row.imageUrl || undefined,
      isActive:           ['yes', 'true', '1'].includes(row.isActive.toLowerCase()),
    }));

    this.subcategoryService.bulkCreateSubSubCategories(payload).subscribe({
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
          this.successMessage = `${created} sub-sub-categor${created === 1 ? 'y' : 'ies'} created successfully!`;
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
