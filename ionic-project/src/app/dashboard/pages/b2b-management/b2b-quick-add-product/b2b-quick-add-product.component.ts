import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { B2BManagementService } from '../../../../services/b2b-management.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { SubcategoryService, Subcategory } from '../../../../services/subcategory.service';
import { UnitService, Unit } from '../../../../services/unit.service';
import { StoreService, Store } from '../../../../services/store.service';
import { WarehouseService, Warehouse } from '../../../../services/warehouse.service';
import { BrandService, Brand } from '../../../../services/brand.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-b2b-quick-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './b2b-quick-add-product.component.html',
  styleUrls: ['./b2b-quick-add-product.component.scss']
})
export class B2BQuickAddProductComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  // Cascade dropdowns
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  subSubCategories: Subcategory[] = [];
  units: Unit[] = [];
  stores: Store[] = [];
  warehouses: Warehouse[] = [];
  brands: Brand[] = [];

  isLoadingSubcats = false;
  isLoadingSSC = false;
  isLoadingDropdowns = false;

  // Product images
  productImages: string[] = [];

  // Bulk pricing tiers
  bulkPricingTiers: { quantity: number | null; unit: string; price: number | null; discount: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
    this.buildForm();
    this.loadDropdowns();
  }

  buildForm(): void {
    this.form = this.fb.group({
      // Hierarchy selectors
      categoryId:       ['', Validators.required],
      subcategoryId:    ['', Validators.required],
      subSubCategoryId: [''],

      // Product core
      name:             ['', Validators.required],
      itemCode:         ['', Validators.required],
      store:            ['', Validators.required],
      warehouse:        ['', Validators.required],
      unit:             ['', Validators.required],
      brand:            [''],
      price:            ['', [Validators.required, Validators.min(0)]],
      quantity:         ['', [Validators.required, Validators.min(0)]],
      quantityAlert:    [10],
      taxType:          ['Exclusive'],
      discountType:     ['None'],
      discountValue:    [0],
      description:      [''],
      manufacturer:     [''],
      manufacturedDate: [''],
      expiryOn:         [''],
      barcodeSymbology: ['CODE128'],
      productType:      ['single'],

      // B2B
      isB2B:            [true],
      variety:          [''],
      minOrderQuantity: [1, Validators.min(1)],
      supplierLocation: [''],
      responseRate:     [100],
      hasGST:           [false]
    });
  }

  loadDropdowns(): void {
    this.isLoadingDropdowns = true;
    Promise.all([
      this.loadCategories(),
      this.loadUnits(),
      this.loadStores(),
      this.loadWarehouses(),
      this.loadBrands()
    ]).finally(() => { this.isLoadingDropdowns = false; this.cdr.markForCheck(); });
  }

  loadCategories(): Promise<void> {
    return new Promise(resolve => {
      this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
        next: r => { this.categories = r.data.categories; resolve(); },
        error: () => resolve()
      });
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

  // ── Cascade: Category → Sub-Category ─────────────────────────────────────

  onCategoryChange(): void {
    const catId = this.form.value.categoryId;
    this.subcategories = [];
    this.subSubCategories = [];
    this.form.patchValue({ subcategoryId: '', subSubCategoryId: '' });
    if (!catId) return;
    this.isLoadingSubcats = true;
    this.subcategoryService.getAllSubcategories(1, 100, undefined, catId, true).subscribe({
      next: r => {
        this.subcategories = (r.data.subcategories ?? []).filter((s: any) => !s.parentSubcategory);
        this.isLoadingSubcats = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoadingSubcats = false; }
    });
  }

  // ── Cascade: Sub-Category → Sub-Sub-Category (e.g. Rice, Dals) ───────────

  onSubcategoryChange(): void {
    const subcatId = this.form.value.subcategoryId;
    this.subSubCategories = [];
    this.form.patchValue({ subSubCategoryId: '' });
    if (!subcatId) return;
    this.isLoadingSSC = true;
    this.b2bService.getSubSubCategories(1, 100, subcatId).subscribe({
      next: (r: any) => {
        this.subSubCategories = r?.data?.subcategories ?? [];
        this.isLoadingSSC = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoadingSSC = false; }
    });
  }

  // ── Product images ────────────────────────────────────────────────────────

  onImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (!this.productImages.includes(result)) this.productImages.push(result);
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeImage(i: number): void { this.productImages.splice(i, 1); }

  // ── Bulk pricing ──────────────────────────────────────────────────────────

  addTier(): void {
    const basePrice = +this.form.value.price || 0;
    this.bulkPricingTiers.push({ quantity: null, unit: 'Kg', price: basePrice || null, discount: 0 });
  }

  removeTier(i: number): void { this.bulkPricingTiers.splice(i, 1); }

  updateTierDiscount(tier: any): void {
    const base = +this.form.value.price || 0;
    if (base > 0 && tier.price != null) {
      tier.discount = Math.max(0, Math.round(((base - tier.price) / base) * 100));
    }
  }

  updateTierPrice(tier: any): void {
    const base = +this.form.value.price || 0;
    if (base > 0 && tier.discount != null) {
      tier.price = +(base * (1 - tier.discount / 100)).toFixed(2);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    const v = this.form.value;

    const payload = {
      name:             v.name,
      itemCode:         v.itemCode,
      store:            v.store,
      warehouse:        v.warehouse,
      unit:             v.unit,
      brand:            v.brand || undefined,
      price:            +v.price,
      quantity:         +v.quantity,
      quantityAlert:    +v.quantityAlert,
      taxType:          v.taxType,
      discountType:     v.discountType,
      discountValue:    +v.discountValue,
      description:      v.description || undefined,
      manufacturer:     v.manufacturer || undefined,
      manufacturedDate: v.manufacturedDate || undefined,
      expiryOn:         v.expiryOn || undefined,
      barcodeSymbology: v.barcodeSymbology,
      productType:      v.productType,
      isB2B:            true,
      variety:          v.variety || undefined,
      minOrderQuantity: +v.minOrderQuantity,
      supplierLocation: v.supplierLocation || undefined,
      responseRate:     +v.responseRate,
      hasGST:           v.hasGST,
      images:           this.productImages,
      bulkPricing: this.bulkPricingTiers
        .filter(t => t.quantity != null && t.price != null)
        .map(t => ({ quantity: +t.quantity!, unit: t.unit || 'Kg', price: +t.price!, discount: +t.discount })),
      // Link to hierarchy — sub-sub-category takes priority over sub-category
      category:         v.categoryId,
      subCategory:      v.subSubCategoryId || v.subcategoryId || undefined
    };

    this.b2bService.createProduct(payload).subscribe({
      next: () => {
        this.toast.success(`"${v.name}" added to B2B inventory!`);
        this.router.navigate(['/dashboard/b2b-management/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Failed to add product. Please try again.';
        this.toast.error(this.errorMessage);
      }
    });
  }

  cancel(): void { this.router.navigate(['/dashboard/b2b-management/products']); }

  // ── Breadcrumb helpers ────────────────────────────────────────────────────

  getCategoryLabel(): string {
    const id = this.form.value.categoryId;
    return id ? (this.categories.find(c => c._id === id)?.name ?? 'Category') : 'Category';
  }

  getSubcategoryLabel(): string {
    const id = this.form.value.subcategoryId;
    return id ? (this.subcategories.find(s => s._id === id)?.name ?? 'Sub-Category') : 'Sub-Category';
  }

  getSubSubCategoryLabel(): string {
    const id = this.form.value.subSubCategoryId;
    return id ? (this.subSubCategories.find(s => s._id === id)?.name ?? 'Sub-Sub Category') : 'Sub-Sub Category';
  }
}
