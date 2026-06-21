import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { StoreService, Store } from '../../../services/store.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { CategoryService, Category } from '../../../services/category.service';
import { SubcategoryService, Subcategory } from '../../../services/subcategory.service';
import { BrandService, Brand } from '../../../services/brand.service';
import { UnitService, Unit } from '../../../services/unit.service';
import { BarcodeService, Barcode } from '../../../services/barcode.service';
import { ProductService, Product } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { SearchableDropdownComponent, DropdownOption } from '../../components/searchable-dropdown/searchable-dropdown.component';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, SearchableDropdownComponent, ThemeButtonComponent],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {
  productForm: FormGroup;
  productType: string = 'single';
  selectedImages: string[] = [];
  activeWarrantyTab: string = 'warranties';
  isEditMode: boolean = false;
  productId: string | null = null;
  isB2BEnabled: boolean = false;

  // Dropdown data
  stores: Store[] = [];
  warehouses: Warehouse[] = [];
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  barcodes: Barcode[] = [];

  // Dropdown options for searchable dropdown
  storeOptions: DropdownOption[] = [];
  warehouseOptions: DropdownOption[] = [];
  categoryOptions: DropdownOption[] = [];
  subcategoryOptions: DropdownOption[] = [];
  brandOptions: DropdownOption[] = [];
  unitOptions: DropdownOption[] = [];
  barcodeOptions: DropdownOption[] = [];

  // Loading states
  isLoadingDropdowns = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private storeService: StoreService,
    private warehouseService: WarehouseService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private brandService: BrandService,
    private unitService: UnitService,
    private barcodeService: BarcodeService,
    private productService: ProductService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      store: ['', Validators.required],
      warehouse: ['', Validators.required],
      productName: ['', Validators.required],
      // slug: ['', Validators.required],  // Commented out
      // sku: ['', Validators.required],  // Commented out
      // sellingType: ['', Validators.required],  // Commented out
      category: ['', Validators.required],
      subCategory: ['', Validators.required],
      brand: [''],
      unit: ['', Validators.required],
      itemCode: ['', Validators.required],
      barcodeSymbology: ['', Validators.required],
      description: [''],
      quantity: ['', Validators.required],
      price: ['', Validators.required],
      taxType: ['', Validators.required],
      discountType: ['', Validators.required],
      discountValue: [''],
      quantityAlert: ['', Validators.required],
      warranty: [''],
      manufacturer: [''],
      manufacturedDate: [''],
      expiryOn: [''],
      // B2B Settings
      isB2B: [false],
      variety: [''],
      minOrderQuantity: [1],
      supplierLocation: [''],
      responseRate: [''],
      hasGST: [false],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;
    
    // Load dropdowns first, then load product data if editing
    this.loadAllDropdowns().then(() => {
      if (this.isEditMode && this.productId) {
        this.loadProductData(this.productId);
      }
    });
  }

  loadAllDropdowns(): Promise<void> {
    this.isLoadingDropdowns = true;

    // Load all dropdowns in parallel
    return Promise.all([
      this.loadStores(),
      this.loadWarehouses(),
      this.loadCategories(),
      this.loadSubcategories(),
      this.loadBrands(),
      this.loadUnits(),
      this.loadBarcodes()
    ]).then(() => {
      this.isLoadingDropdowns = false;
    }).catch(error => {
      console.error('Error loading dropdowns:', error);
      this.isLoadingDropdowns = false;
    });
  }

  loadStores(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storeService.getAllStores(1, 100, undefined, true).subscribe({
        next: (response) => {
          this.stores = response.data.stores;
          this.storeOptions = this.stores.map(store => ({
            id: store._id as string,
            name: store.name
          }));
          resolve();
        },
        error: (error) => {
          console.error('Failed to load stores', error);
          reject(error);
        }
      });
    });
  }

  loadWarehouses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.warehouseService.getAllWarehouses(1, 100, undefined, true).subscribe({
        next: (response) => {
          this.warehouses = response.data.warehouses;
          this.warehouseOptions = this.warehouses.map(warehouse => ({
            id: warehouse._id as string,
            name: warehouse.name
          }));
          resolve();
        },
        error: (error) => {
          console.error('Failed to load warehouses', error);
          reject(error);
        }
      });
    });
  }

  loadCategories(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
        next: (response) => {
          this.categories = response.data.categories;
          this.categoryOptions = this.categories.map(category => ({
            id: category._id as string,
            name: category.name
          }));
          resolve();
        },
        error: (error) => {
          console.error('Failed to load categories', error);
          reject(error);
        }
      });
    });
  }

  loadSubcategories(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.subcategoryService.getAllSubcategories(1, 100, undefined, undefined, true).subscribe({
        next: (response) => {
          this.subcategories = (response.data.subcategories ?? []).filter((s: any) => !s.parentSubcategory);
          this.subcategoryOptions = this.subcategories.map(subcategory => ({
            id: subcategory._id as string,
            name: subcategory.name
          }));
          resolve();
        },
        error: (error) => {
          console.error('Failed to load subcategories', error);
          reject(error);
        }
      });
    });
  }

  loadBrands(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.brandService.getAllBrands(1, 100, undefined, true).subscribe({
        next: (response) => {
          this.brands = response.data.brands;
          this.brandOptions = this.brands.map(brand => ({
            id: brand._id as string,
            name: brand.name
          }));
          resolve();
        },
        error: (error) => {
          console.error('Failed to load brands', error);
          reject(error);
        }
      });
    });
  }

  loadUnits(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.unitService.getAllUnits(1, 100, undefined, true).subscribe({
        next: (response) => {
          this.units = response.data.units;
          this.unitOptions = this.units.map(unit => ({
            id: unit._id as string,
            name: unit.name,
            displayName: `${unit.name} (${unit.shortName})`
          }));
          resolve();
        },
        error: (error) => {
          console.error('Failed to load units', error);
          reject(error);
        }
      });
    });
  }

  loadBarcodes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.barcodeService.getAllBarcodes(1, 100, undefined, true).subscribe({
        next: (response) => {
          this.barcodes = response.data.barcodes;
          this.barcodeOptions = this.barcodes.map(barcode => ({
            id: barcode._id as string,
            name: barcode.name
          }));
          resolve();
        },
        error: (error) => {
          console.error('Failed to load barcodes', error);
          reject(error);
        }
      });
    });
  }

  // When category changes, filter subcategories
  onCategoryChange(categoryId: string): void {
    if (categoryId) {
      this.subcategoryService.getAllSubcategories(1, 100, undefined, categoryId, true).subscribe({
        next: (response) => {
          this.subcategories = (response.data.subcategories ?? []).filter((s: any) => !s.parentSubcategory);
          this.subcategoryOptions = this.subcategories.map(subcategory => ({
            id: subcategory._id as string,
            name: subcategory.name
          }));
        },
        error: (error) => {
          console.error('Failed to load subcategories for category', error);
        }
      });
    }
  }

  selectProductType(type: string): void {
    this.productType = type;
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push(e.target.result);
          this.cdr.detectChanges(); // Trigger change detection
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  loadProductData(productId: string): void {
    console.log('Loading product data for ID:', productId);
    this.productService.getProductById(productId).subscribe({
      next: (response) => {
        console.log('Product data received:', response);
        const product = response.data;
        
        console.log('Populating form with product:', product);
        
        // Populate form with product data
        this.productForm.patchValue({
          store: product.store?._id || product.store,
          warehouse: product.warehouse?._id || product.warehouse,
          productName: product.productName || product.name,
          category: product.category?._id || product.category,
          subCategory: product.subCategory?._id || product.subCategory,
          brand: product.brand?._id || product.brand,
          unit: product.unit?._id || product.unit,
          itemCode: product.itemCode || product.sku,
          barcodeSymbology: product.barcodeSymbology,
          description: product.description,
          quantity: product.quantity,
          price: product.price,
          taxType: product.taxType,
          discountType: product.discountType,
          discountValue: product.discountValue,
          quantityAlert: product.quantityAlert,
          warranty: product.warranty,
          manufacturer: product.manufacturer,
          manufacturedDate: product.manufacturedDate ? new Date(product.manufacturedDate).toISOString().split('T')[0] : '',
          expiryOn: product.expiryOn ? new Date(product.expiryOn).toISOString().split('T')[0] : '',
          // B2B fields
          isB2B: product.isB2B || false,
          variety: product.variety || '',
          minOrderQuantity: product.minOrderQuantity || 1,
          supplierLocation: product.supplierLocation || '',
          responseRate: product.responseRate ?? '',
          hasGST: product.hasGST || false
        });

        this.isB2BEnabled = product.isB2B || false;
        
        console.log('Form values after patch:', this.productForm.value);
        
        // Load images
        if (product.images && product.images.length > 0) {
          this.selectedImages = product.images;
        }
        
        // Trigger change detection to update dropdowns
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        this.toastService.error('Failed to load product data');
        console.error('Error loading product:', error);
      }
    });
  }

  setActiveWarrantyTab(tab: string): void {
    this.activeWarrantyTab = tab;
  }

  onB2BToggle(): void {
    this.isB2BEnabled = this.productForm.value.isB2B;
  }

  onSubmit(): void {
    // Validate images on create
    if (!this.isEditMode && this.selectedImages.length === 0) {
      this.errorMessage = 'Please add at least one product image.';
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.productForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const productData: any = {
        productName: this.productForm.value.productName,
        sku: this.productForm.value.itemCode, // Use itemCode as SKU
        sellingType: 'retail', // Default selling type
        store: this.productForm.value.store,
        warehouse: this.productForm.value.warehouse,
        category: this.productForm.value.category,
        subCategory: this.productForm.value.subCategory,
        brand: this.productForm.value.brand,
        unit: this.productForm.value.unit,
        itemCode: this.productForm.value.itemCode,
        barcodeSymbology: this.productForm.value.barcodeSymbology,
        description: this.productForm.value.description,
        quantity: this.productForm.value.quantity,
        price: this.productForm.value.price,
        taxType: this.productForm.value.taxType,
        discountType: this.productForm.value.discountType,
        quantityAlert: this.productForm.value.quantityAlert,
        warranty: this.productForm.value.warranty,
        manufacturer: this.productForm.value.manufacturer,
        images: this.selectedImages
      };

      // Only include discountValue if it's not empty
      if (this.productForm.value.discountValue && this.productForm.value.discountValue !== '') {
        productData.discountValue = Number(this.productForm.value.discountValue);
      }

      // Only include dates if they're not empty
      if (this.productForm.value.manufacturedDate && this.productForm.value.manufacturedDate !== '') {
        productData.manufacturedDate = this.productForm.value.manufacturedDate;
      }

      if (this.productForm.value.expiryOn && this.productForm.value.expiryOn !== '') {
        productData.expiryOn = this.productForm.value.expiryOn;
      }

      // Include B2B fields if B2B is enabled
      productData.isB2B = this.productForm.value.isB2B || false;
      if (productData.isB2B) {
        productData.variety = this.productForm.value.variety || undefined;
        productData.minOrderQuantity = Number(this.productForm.value.minOrderQuantity) || 1;
        productData.supplierLocation = this.productForm.value.supplierLocation || undefined;
        if (this.productForm.value.responseRate !== '' && this.productForm.value.responseRate !== null) {
          productData.responseRate = Number(this.productForm.value.responseRate);
        }
        productData.hasGST = this.productForm.value.hasGST || false;
      }

      // Call update or create based on edit mode
      const apiCall = this.isEditMode && this.productId
        ? this.productService.updateProduct(this.productId, productData)
        : this.productService.createProduct(productData);

      apiCall.subscribe({
        next: (response) => {
          const successMessage = this.isEditMode ? 'Product updated successfully!' : 'Product created successfully!';
          this.toastService.success(successMessage);
          this.isSubmitting = false;
          console.log('Product saved:', response);
          
          // Redirect to products list after 1 second
          setTimeout(() => {
            this.router.navigate(['/dashboard/products']);
          }, 1000);
        },
        error: (error) => {
          const errorMessage = this.isEditMode ? 'Failed to update product' : 'Failed to create product';
          this.toastService.error(error.error?.message || errorMessage);
          this.errorMessage = error.error?.message || errorMessage + '. Please try again.';
          this.isSubmitting = false;
          console.error('Product save error:', error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fill in all required fields.';
      console.log('Form is invalid:', this.productForm.errors);
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/products']);
  }
}
