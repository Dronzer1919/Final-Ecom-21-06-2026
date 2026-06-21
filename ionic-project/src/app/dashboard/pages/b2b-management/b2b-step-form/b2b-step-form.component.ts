import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';
import {
  B2BManagementService, B2BStepFormData, B2BSubSubCategory
} from '../../../../services/b2b-management.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { SubcategoryService, Subcategory } from '../../../../services/subcategory.service';
import { UnitService, Unit } from '../../../../services/unit.service';
import { StoreService, Store } from '../../../../services/store.service';
import { WarehouseService, Warehouse } from '../../../../services/warehouse.service';
import { BrandService, Brand } from '../../../../services/brand.service';
import { ToastService } from '../../../../services/toast.service';

const EMOJI_ICONS = [
  '🌾','🍚','🫘','🍬','🌶️','🫙','🧴','🏠','🍪','🥛','🛒','📦','📂','📁',
  '🥩','🥬','🥦','🍎','🍋','🫐','🌽','🥕','🧅','🧄','🫚','🧂','🍫','🥨',
  '🍜','🍘','🌿','🎯','🏪','🔑','💊','🧪','🔧','🖥️','👗','👟','🎁','📱'
];

@Component({
  selector: 'app-b2b-step-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './b2b-step-form.component.html',
  styleUrls: ['./b2b-step-form.component.scss']
})
export class B2BStepFormComponent implements OnInit {
  currentStep = 1;
  totalSteps = 5;

  steps = [
    { id: 1, label: 'Category',        icon: '📂', description: 'Top-level B2B category (e.g. Grocery)' },
    { id: 2, label: 'Sub-Category',    icon: '📁', description: 'Group under category (e.g. Grocery & Staples)' },
    { id: 3, label: 'Sub-Sub Cat.',    icon: '🗂️', description: 'Specific segment (e.g. Rice, Dals)' },
    { id: 4, label: 'Product',         icon: '📦', description: 'Product variant (e.g. Basmati Rice)' },
    { id: 5, label: 'Vendor',          icon: '🏪', description: 'Link a supplier with bulk pricing' }
  ];

  // ── Forms ──────────────────────────────────────────────────────────────────
  categoryForm!: FormGroup;
  subcategoryForm!: FormGroup;
  subSubCategoryForm!: FormGroup;
  productForm!: FormGroup;
  vendorForm!: FormGroup;

  // ── Dropdown data ──────────────────────────────────────────────────────────
  categories: Category[] = [];
  filteredSubcategories: Subcategory[] = [];
  filteredSubSubCategories: B2BSubSubCategory[] = [];
  units: Unit[] = [];
  stores: Store[] = [];
  warehouses: Warehouse[] = [];
  brands: Brand[] = [];

  // ── UI state ───────────────────────────────────────────────────────────────
  emojiIcons = EMOJI_ICONS;
  showCatIconPicker = false;
  showSubIconPicker = false;
  showSscIconPicker = false;
  isSubmitting = false;
  isLoadingDropdowns = false;
  isLoadingSubSubCats = false;
  errorMessage = '';
  successMessage = '';

  selectedCategoryId = '';
  selectedSubcategoryId = '';
  selectedSubSubCategoryId = '';

  catImagePreview: string | null = null;
  catImageMode: 'upload' | 'url' = 'url';
  subImagePreview: string | null = null;
  subImageMode: 'upload' | 'url' = 'url';
  productImages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private b2bService: B2BManagementService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private unitService: UnitService,
    private storeService: StoreService,
    private warehouseService: WarehouseService,
    private brandService: BrandService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadDropdowns();

    this.route.queryParams.subscribe(p => {
      if (p['step']) this.currentStep = +p['step'];
      if (p['categoryId']) {
        this.selectedCategoryId = p['categoryId'];
        this.categoryForm.patchValue({ existingCategoryId: p['categoryId'] });
        this.loadSubcategoriesForCategory(p['categoryId']);
      }
    });
  }

  // ── Form Builders ───────────────────────────────────────────────────────────

  buildForms(): void {
    // Step 1 — Main Category
    this.categoryForm = this.fb.group({
      useExisting: [false],
      existingCategoryId: [''],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      icon: ['📂'],
      image: [''],
      isActive: [true]
    });

    // Step 2 — Sub-Category
    this.subcategoryForm = this.fb.group({
      useExisting: [false],
      existingSubcategoryId: [''],
      categoryId: ['', Validators.required],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      icon: ['📁'],
      image: [''],
      isActive: [true]
    });

    // Step 3 — Sub-Sub Category (e.g. Rice, Dals inside Grocery & Staples)
    this.subSubCategoryForm = this.fb.group({
      useExisting: [false],
      existingSubSubCategoryId: [''],
      parentSubcategoryId: ['', Validators.required],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      icon: ['🗂️'],
      image: [''],
      isActive: [true]
    });

    // Step 4 — Product
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      itemCode: ['', Validators.required],
      store: ['', Validators.required],
      warehouse: ['', Validators.required],
      unit: ['', Validators.required],
      brand: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      quantityAlert: [10],
      taxType: ['Exclusive'],
      discountType: ['None'],
      discountValue: [0],
      description: [''],
      manufacturer: [''],
      manufacturedDate: [''],
      expiryOn: [''],
      barcodeSymbology: ['CODE128'],
      productType: ['single'],
      isB2B: [true],
      variety: [''],
      minOrderQuantity: [1, Validators.min(1)],
      supplierLocation: [''],
      responseRate: [100],
      hasGST: [false]
    });

    // Step 5 — Vendor
    this.vendorForm = this.fb.group({
      useExisting: [false],
      existingVendorId: [''],
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: [''],
      address: [''],
      city: [''],
      country: ['India'],
      supplierCode: [''],
      rating: [4.0, [Validators.min(1), Validators.max(5)]],
      responseRate: [100],
      hasGST: [false],
      gstNumber: [''],
      location: [''],
      locality: [''],
      memberSince: [''],
      minOrderQty: [1],
      variety: [''],
    });
  }

  // ── Dropdown Loaders ────────────────────────────────────────────────────────

  loadDropdowns(): void {
    this.isLoadingDropdowns = true;
    Promise.all([
      this.loadCategories(),
      this.loadUnits(),
      this.loadStores(),
      this.loadWarehouses(),
      this.loadBrands()
    ]).finally(() => {
      this.isLoadingDropdowns = false;
      this.cdr.markForCheck();
    });
  }

  loadCategories(): Promise<void> {
    return new Promise(resolve => {
      this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
        next: r => { this.categories = r.data.categories; resolve(); },
        error: () => resolve()
      });
    });
  }

  loadSubcategoriesForCategory(catId: string): void {
    if (!catId) { this.filteredSubcategories = []; this.filteredSubSubCategories = []; return; }
    this.subcategoryService.getAllSubcategories(1, 100, undefined, catId, true).subscribe({
      next: r => { this.filteredSubcategories = (r.data.subcategories ?? []).filter((s: any) => !s.parentSubcategory); },
      error: () => {}
    });
  }

  loadSubSubCategoriesForSubcategory(subcatId: string): void {
    if (!subcatId) { this.filteredSubSubCategories = []; return; }
    this.isLoadingSubSubCats = true;
    this.b2bService.getSubSubCategories(1, 100, subcatId).subscribe({
      next: (r: any) => {
        this.filteredSubSubCategories = r?.data?.subcategories ?? [];
        this.isLoadingSubSubCats = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoadingSubSubCats = false; }
    });
  }

  loadUnits(): Promise<void> {
    return new Promise(resolve => {
      this.unitService.getAllUnits(1, 100, undefined, true).subscribe({
        next: (r: any) => { this.units = r.data?.units ?? []; resolve(); },
        error: () => resolve()
      });
    });
  }

  loadStores(): Promise<void> {
    return new Promise(resolve => {
      this.storeService.getAllStores(1, 100, undefined, true).subscribe({
        next: r => { this.stores = r.data.stores; resolve(); },
        error: () => resolve()
      });
    });
  }

  loadWarehouses(): Promise<void> {
    return new Promise(resolve => {
      this.warehouseService.getAllWarehouses(1, 100, undefined, true).subscribe({
        next: r => { this.warehouses = r.data.warehouses; resolve(); },
        error: () => resolve()
      });
    });
  }

  loadBrands(): Promise<void> {
    return new Promise(resolve => {
      this.brandService.getAllBrands(1, 100, undefined, true).subscribe({
        next: (r: any) => { this.brands = r.data?.brands ?? []; resolve(); },
        error: () => resolve()
      });
    });
  }

  // ── Category Step ───────────────────────────────────────────────────────────

  onCatUseExistingChange(): void {
    const useExisting = this.categoryForm.value.useExisting;
    if (useExisting) {
      this.categoryForm.get('name')?.clearValidators();
      this.categoryForm.get('code')?.clearValidators();
    } else {
      this.categoryForm.get('name')?.setValidators(Validators.required);
      this.categoryForm.get('code')?.setValidators(Validators.required);
    }
    this.categoryForm.get('name')?.updateValueAndValidity();
    this.categoryForm.get('code')?.updateValueAndValidity();
  }

  selectCatIcon(icon: string): void {
    this.categoryForm.patchValue({ icon });
    this.showCatIconPicker = false;
  }

  onCatImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        this.catImagePreview = result;
        this.categoryForm.patchValue({ image: result });
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // ── Subcategory Step ────────────────────────────────────────────────────────

  onSubUseExistingChange(): void {
    const useExisting = this.subcategoryForm.value.useExisting;
    if (useExisting) {
      this.subcategoryForm.get('name')?.clearValidators();
      this.subcategoryForm.get('code')?.clearValidators();
    } else {
      this.subcategoryForm.get('name')?.setValidators(Validators.required);
      this.subcategoryForm.get('code')?.setValidators(Validators.required);
    }
    this.subcategoryForm.get('name')?.updateValueAndValidity();
    this.subcategoryForm.get('code')?.updateValueAndValidity();
  }

  onSubcategoryCategoryChange(catId: string): void {
    this.loadSubcategoriesForCategory(catId);
    // Reset downstream
    this.subSubCategoryForm.patchValue({ parentSubcategoryId: '', existingSubSubCategoryId: '' });
    this.filteredSubSubCategories = [];
  }

  selectSubIcon(icon: string): void {
    this.subcategoryForm.patchValue({ icon });
    this.showSubIconPicker = false;
  }

  // ── Sub-Sub Category Step ───────────────────────────────────────────────────

  onSscUseExistingChange(): void {
    const useExisting = this.subSubCategoryForm.value.useExisting;
    if (useExisting) {
      this.subSubCategoryForm.get('name')?.clearValidators();
      this.subSubCategoryForm.get('code')?.clearValidators();
    } else {
      this.subSubCategoryForm.get('name')?.setValidators(Validators.required);
      this.subSubCategoryForm.get('code')?.setValidators(Validators.required);
    }
    this.subSubCategoryForm.get('name')?.updateValueAndValidity();
    this.subSubCategoryForm.get('code')?.updateValueAndValidity();
  }

  onSscParentSubcategoryChange(subcatId: string): void {
    this.loadSubSubCategoriesForSubcategory(subcatId);
    this.subSubCategoryForm.patchValue({ existingSubSubCategoryId: '' });
  }

  selectSscIcon(icon: string): void {
    this.subSubCategoryForm.patchValue({ icon });
    this.showSscIconPicker = false;
  }

  // ── Product Image ────────────────────────────────────────────────────────────

  onProductImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (!this.productImages.includes(result)) {
          this.productImages.push(result);
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeProductImage(index: number): void {
    this.productImages.splice(index, 1);
  }

  addProductImageUrl(url: string): void {
    if (url && !this.productImages.includes(url)) {
      this.productImages.push(url);
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.categoryForm.value.useExisting
          ? !!this.categoryForm.value.existingCategoryId
          : this.categoryForm.valid;
      case 2:
        return this.subcategoryForm.value.useExisting
          ? !!this.subcategoryForm.value.existingSubcategoryId
          : this.subcategoryForm.valid;
      case 3:
        return this.subSubCategoryForm.value.useExisting
          ? !!this.subSubCategoryForm.value.existingSubSubCategoryId
          : this.subSubCategoryForm.valid;
      case 4:
        return this.productForm.valid;
      case 5:
        return this.vendorForm.value.useExisting
          ? !!this.vendorForm.value.existingVendorId
          : this.vendorForm.valid;
      default:
        return false;
    }
  }

  next(): void {
    if (this.currentStep >= this.totalSteps) return;

    // After step 1: pre-fill subcategoryForm categoryId
    if (this.currentStep === 1) {
      const catId = this.categoryForm.value.useExisting
        ? this.categoryForm.value.existingCategoryId
        : '';
      if (catId) {
        this.subcategoryForm.patchValue({ categoryId: catId });
        this.loadSubcategoriesForCategory(catId);
      }
    }

    // After step 2: pre-fill subSubCategoryForm parentSubcategoryId
    if (this.currentStep === 2) {
      const subcatId = this.subcategoryForm.value.useExisting
        ? this.subcategoryForm.value.existingSubcategoryId
        : '';
      if (subcatId) {
        this.subSubCategoryForm.patchValue({ parentSubcategoryId: subcatId });
        this.loadSubSubCategoriesForSubcategory(subcatId);
      }
    }

    this.currentStep++;
  }

  prev(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  submitForm(): void {
    this.errorMessage = '';

    if (!this.categoryForm.value.useExisting && this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.errorMessage = 'Please complete Step 1: Category (Name and Code are required).';
      this.currentStep = 1;
      return;
    }
    if (!this.subcategoryForm.value.useExisting && this.subcategoryForm.invalid) {
      this.subcategoryForm.markAllAsTouched();
      this.errorMessage = 'Please complete Step 2: Sub-Category (Name and Code are required).';
      this.currentStep = 2;
      return;
    }
    if (!this.subSubCategoryForm.value.useExisting && this.subSubCategoryForm.invalid) {
      this.subSubCategoryForm.markAllAsTouched();
      this.errorMessage = 'Please complete Step 3: Sub-Sub Category (Name and Code are required).';
      this.currentStep = 3;
      return;
    }
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage = 'Please complete Step 4: Product (all required fields must be filled).';
      this.currentStep = 4;
      return;
    }
    if (!this.vendorForm.value.useExisting && this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      this.errorMessage = 'Please complete Step 5: Vendor (Name is required).';
      this.currentStep = 5;
      return;
    }

    this.isSubmitting = true;

    const catVal    = this.categoryForm.value;
    const subVal    = this.subcategoryForm.value;
    const sscVal    = this.subSubCategoryForm.value;
    const prodVal   = this.productForm.value;
    const vendorVal = this.vendorForm.value;

    const formData: B2BStepFormData = {
      step1_category: catVal.useExisting
        ? { _id: catVal.existingCategoryId } as any
        : {
            name: catVal.name,
            code: catVal.code.toUpperCase(),
            description: catVal.description,
            icon: catVal.icon,
            image: catVal.image,
            isActive: catVal.isActive
          },

      step2_subcategory: subVal.useExisting
        ? { _id: subVal.existingSubcategoryId } as any
        : {
            name: subVal.name,
            code: subVal.code.toUpperCase(),
            description: subVal.description,
            icon: subVal.icon,
            image: subVal.image,
            category: subVal.categoryId,
            isActive: subVal.isActive
          },

      step3_subSubCategory: sscVal.useExisting
        ? { _id: sscVal.existingSubSubCategoryId } as any
        : {
            name: sscVal.name,
            code: sscVal.code.toUpperCase(),
            description: sscVal.description,
            icon: sscVal.icon,
            image: sscVal.image,
            parentSubcategory: sscVal.parentSubcategoryId,
            isActive: sscVal.isActive
          },

      step4_product: {
        name: prodVal.name,
        itemCode: prodVal.itemCode,
        store: prodVal.store,
        warehouse: prodVal.warehouse,
        unit: prodVal.unit,
        brand: prodVal.brand || undefined,
        price: +prodVal.price,
        quantity: +prodVal.quantity,
        quantityAlert: +prodVal.quantityAlert,
        taxType: prodVal.taxType,
        discountType: prodVal.discountType,
        discountValue: +prodVal.discountValue,
        description: prodVal.description,
        manufacturer: prodVal.manufacturer,
        expiryOn: prodVal.expiryOn || undefined,
        barcodeSymbology: prodVal.barcodeSymbology,
        productType: prodVal.productType,
        isB2B: true,
        variety: prodVal.variety,
        minOrderQuantity: +prodVal.minOrderQuantity,
        supplierLocation: prodVal.supplierLocation,
        hasGST: prodVal.hasGST,
        images: this.productImages
      },

      step5_vendor: vendorVal.useExisting
        ? { _id: vendorVal.existingVendorId } as any
        : {
            name: vendorVal.name,
            email: vendorVal.email,
            phone: vendorVal.phone,
            address: vendorVal.address,
            city: vendorVal.city,
            country: vendorVal.country,
            supplierCode: vendorVal.supplierCode,
            rating: +vendorVal.rating,
            responseRate: +vendorVal.responseRate,
            hasGST: vendorVal.hasGST,
            gstNumber: vendorVal.gstNumber,
            location: vendorVal.location,
            locality: vendorVal.locality,
            memberSince: vendorVal.memberSince,
            minOrderQty: +vendorVal.minOrderQty,
            variety: vendorVal.variety,
            isB2BVendor: true
          }
    };

    this.b2bService.submitStepForm(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success('B2B setup complete! Category, sub-category, sub-sub-category, product and vendor created.');
        this.router.navigate(['/dashboard/b2b-management/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Failed to complete B2B setup. Please check each step.';
        this.toast.error(this.errorMessage);
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  getCategoryName(id: string): string {
    return this.categories.find(c => c._id === id)?.name ?? id;
  }

  getSubcategoryName(id: string): string {
    return this.filteredSubcategories.find(s => s._id === id)?.name ?? id;
  }

  getSubSubCategoryName(id: string): string {
    return this.filteredSubSubCategories.find(s => s._id === id)?.name ?? id;
  }

  skipStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/b2b-management']);
  }
}
