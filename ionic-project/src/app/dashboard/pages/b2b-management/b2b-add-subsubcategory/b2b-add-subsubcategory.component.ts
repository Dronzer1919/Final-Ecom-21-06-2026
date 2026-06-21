import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubcategoryService, Subcategory } from '../../../../services/subcategory.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-b2b-add-subsubcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './b2b-add-subsubcategory.component.html',
  styleUrls: ['./b2b-add-subsubcategory.component.scss']
})
export class B2BAddSubSubCategoryComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';

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
    private location: Location
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
    this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
      next: r => { this.categories = r.data.categories; },
      error: () => {}
    });
  }

  onCategoryChange(): void {
    const categoryId = this.form.get('category')?.value;
    this.form.patchValue({ parentSubcategory: '' });
    this.subcategories = [];
    if (!categoryId) return;
    this.subcategoryService.getAllSubcategories(1, 100, undefined, categoryId).subscribe({
      next: r => { this.subcategories = r.data.subcategories ?? []; },
      error: () => { this.subcategories = []; }
    });
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
    const payload = { ...this.form.value, code: (this.form.value.code as string).toUpperCase() };
    this.subcategoryService.createSubSubCategory(payload).subscribe({
      next: () => {
        this.toast.success('Sub-sub category created successfully!');
        this.isSubmitting = false;
        setTimeout(() => this.location.back(), 800);
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message || 'Failed to create');
        this.errorMessage = err?.error?.message || 'Failed to create. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.location.back();
  }
}
