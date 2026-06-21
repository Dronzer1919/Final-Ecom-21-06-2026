import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubcategoryService, Subcategory } from '../../../../services/subcategory.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-b2b-edit-subsubcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './b2b-edit-subsubcategory.component.html',
  styleUrls: ['./b2b-edit-subsubcategory.component.scss']
})
export class B2BEditSubSubCategoryComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  editId: string | null = null;

  categories: Category[] = [];
  subcategories: Subcategory[] = [];

  imageMode: 'upload' | 'url' = 'upload';
  imagePreview: string | null = null;
  isDragging = false;

  constructor(
    private fb: FormBuilder,
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      parentSubcategory: ['', Validators.required],
      description: [''],
      icon: ['🗂️'],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');

    this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
      next: r => { this.categories = r.data.categories; }
    });

    if (this.editId) {
      this.subcategoryService.getSubcategoryById(this.editId).subscribe({
        next: (res) => {
          const s: any = res.data;
          const categoryId = typeof s.category === 'object' ? s.category._id : s.category;
          const parentSubcatId = typeof s.parentSubcategory === 'object' ? s.parentSubcategory._id : s.parentSubcategory;

          this.loadSubcategories(categoryId, () => {
            this.form.patchValue({
              name: s.name,
              code: s.code,
              category: categoryId,
              parentSubcategory: parentSubcatId,
              description: s.description || '',
              icon: s.icon || '🗂️',
              image: s.image || ''
            });
            if (s.image) {
              this.imagePreview = s.image;
              this.imageMode = s.image.startsWith('data:') ? 'upload' : 'url';
            }
            this.cdr.detectChanges();
          });
        },
        error: () => { this.errorMessage = 'Failed to load data.'; }
      });
    }
  }

  loadSubcategories(categoryId?: string, callback?: () => void): void {
    this.subcategoryService.getAllSubcategories(1, 100, undefined, categoryId).subscribe({
      next: r => {
        this.subcategories = r.data.subcategories ?? [];
        this.cdr.detectChanges();
        if (callback) callback();
      },
      error: () => {
        this.subcategories = [];
        this.cdr.detectChanges();
        if (callback) callback();
      }
    });
  }

  onCategoryChange(): void {
    const categoryId = this.form.get('category')?.value;
    this.form.patchValue({ parentSubcategory: '' });
    this.subcategories = [];
    if (categoryId) this.loadSubcategories(categoryId);
  }

  setImageMode(mode: 'upload' | 'url'): void {
    this.imageMode = mode;
    this.imagePreview = null;
    this.form.patchValue({ image: '' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.readFile(input.files[0]);
  }

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragging = true; }
  onDragLeave(): void { this.isDragging = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) this.readFile(file);
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.imagePreview = result;
      this.form.patchValue({ image: result });
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.form.patchValue({ image: '' });
  }

  onUrlChange(url: string): void {
    this.imagePreview = url || null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.isSubmitting = true;
    const payload = { ...this.form.value, code: this.form.value.code.toUpperCase() };
    this.subcategoryService.updateSubcategory(this.editId!, payload).subscribe({
      next: () => {
        this.toast.success('Sub-sub category updated successfully!');
        this.isSubmitting = false;
        setTimeout(() => this.location.back(), 800);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Failed to update');
        this.errorMessage = err.error?.message || 'Failed to update. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.location.back();
  }
}
