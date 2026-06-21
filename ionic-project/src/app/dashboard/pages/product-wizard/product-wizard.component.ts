import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchableDropdownComponent, DropdownOption } from '../../components/searchable-dropdown/searchable-dropdown.component';
import { CategoryService, Category } from '../../../services/category.service';
import { SubcategoryService, Subcategory } from '../../../services/subcategory.service';
import { ProductService, Product } from '../../../services/product.service';
import { BrandService, Brand } from '../../../services/brand.service';
import { StoreService, Store } from '../../../services/store.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';
import { UnitService, Unit } from '../../../services/unit.service';
import { BarcodeService, Barcode } from '../../../services/barcode.service';
import { ToastService } from '../../../services/toast.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-product-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableDropdownComponent, ThemeButtonComponent],
  templateUrl: './product-wizard.component.html',
  styleUrls: ['./product-wizard.component.scss']
})
export class ProductWizardComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;

  // Step 1: Category
  categoryMode: 'existing' | 'new' = 'existing';
  selectedCategoryId = '';
  newCategory: Partial<Category> = {
    name: '',
    code: '',
    description: '',
    isActive: true
  };
  categories: Category[] = [];

  // Step 2: Subcategory
  subcategoryMode: 'existing' | 'new' = 'existing';
  selectedSubcategoryId = '';
  newSubcategory: Partial<Subcategory> = {
    name: '',
    code: '',
    description: '',
    isActive: true
  };
  subcategories: Subcategory[] = [];
  filteredSubcategories: Subcategory[] = [];

  // Step 3: Product
  newProduct: Partial<Product> = {
    name: '',
    itemCode: '',
    description: '',
    quantity: 0,
    price: 0,
    taxType: 'Exclusive',
    discountType: 'Percentage',
    discountValue: 0,
    quantityAlert: 10,
    status: 'Active',
    productType: 'Single',
    images: []
  };

  // Supporting data
  brands: Brand[] = [];
  brandOptions: DropdownOption[] = [];
  stores: Store[] = [];
  warehouses: Warehouse[] = [];
  units: Unit[] = [];
  barcodes: Barcode[] = [];

  loading = false;
  savingCategory = false;
  savingSubcategory = false;
  savingProduct = false;

  // Brand Modal
  showBrandModal = false;
  savingBrand = false;
  newBrand: Partial<Brand> = {
    name: '',
    code: '',
    description: '',
    isActive: true
  };

  constructor(
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private productService: ProductService,
    private brandService: BrandService,
    private storeService: StoreService,
    private warehouseService: WarehouseService,
    private unitService: UnitService,
    private barcodeService: BarcodeService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    
    // Load categories
    this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
      next: (response) => {
        console.log('Category API response:', response);
        if (response.success) {
          this.categories = response.data.categories;
          console.log('Categories loaded:', this.categories);
          console.log('Categories length:', this.categories.length);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.toastService.error('Failed to load categories');
        this.loading = false;
      }
    });

    // Load subcategories
    this.subcategoryService.getAllSubcategories(1, 100, undefined, undefined, true).subscribe({
      next: (response) => {
        console.log('Subcategory API response:', response);
        if (response.success) {
          this.subcategories = (response.data.subcategories ?? []).filter((s: any) => !s.parentSubcategory);
          console.log('Subcategories loaded:', this.subcategories);
          console.log('Subcategories length:', this.subcategories.length);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
      }
    });

    // Load supporting data for product step
    this.loadSupportingData();
  }

  loadSupportingData(): void {
    this.brandService.getAllBrands(1, 100, undefined, true).subscribe({
      next: (response) => {
        console.log('Brand API response:', response);
        if (response.success) {
          this.brands = response.data.brands;
          this.brandOptions = this.brands.map(brand => ({
            id: brand._id!,
            name: brand.name
          }));
          console.log('Brands loaded:', this.brands.length);
          console.log('Brand options:', this.brandOptions);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });

    this.storeService.getAllStores(1, 100, undefined, true).subscribe({
      next: (response) => {
        console.log('Store API response:', response);
        if (response.success) {
          this.stores = response.data.stores;
          console.log('Stores loaded:', this.stores.length);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading stores:', err);
      }
    });

    this.warehouseService.getAllWarehouses(1, 100, undefined, true).subscribe({
      next: (response) => {
        console.log('Warehouse API response:', response);
        if (response.success) {
          this.warehouses = response.data.warehouses;
          console.log('Warehouses loaded:', this.warehouses.length);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading warehouses:', err);
      }
    });

    this.unitService.getAllUnits(1, 100, undefined, true).subscribe({
      next: (response) => {
        console.log('Unit API response:', response);
        if (response.success) {
          this.units = response.data.units;
          console.log('Units loaded:', this.units.length);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading units:', err);
      }
    });

    this.barcodeService.getAllBarcodes(1, 100, undefined, true).subscribe({
      next: (response: any) => {
        console.log('Barcode API response:', response);
        if (response.success) {
          this.barcodes = response.data.barcodes;
          console.log('Barcodes loaded:', this.barcodes.length);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading barcodes:', err);
      }
    });
  }

  // Step Navigation
  nextStep(): void {
    if (this.currentStep === 1 && !this.validateStep1()) {
      return;
    }
    if (this.currentStep === 2 && !this.validateStep2()) {
      return;
    }
    
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      if (this.currentStep === 2) {
        this.filterSubcategoriesByCategory();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  // Step 1: Category Methods
  onCategoryModeChange(): void {
    this.selectedCategoryId = '';
    this.newCategory = {
      name: '',
      code: '',
      description: '',
      isActive: true
    };
  }

  saveCategory(): void {
    if (!this.newCategory.name || !this.newCategory.code) {
      this.toastService.warning('Please fill in category name and code');
      return;
    }

    this.savingCategory = true;
    this.categoryService.createCategory(this.newCategory as Category).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Category created successfully!');
          this.categories.push(response.data);
          this.selectedCategoryId = response.data._id!;
          // Reset form and switch to existing mode
          this.newCategory = {
            name: '',
            code: '',
            description: '',
            isActive: true
          };
          this.categoryMode = 'existing';
          this.savingCategory = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.toastService.error(err.error?.message || 'Failed to create category');
        this.savingCategory = false;
      }
    });
  }

  validateStep1(): boolean {
    if (this.categoryMode === 'existing') {
      if (!this.selectedCategoryId) {
        this.toastService.warning('Please select a category');
        return false;
      }
    } else {
      if (!this.newCategory.name || !this.newCategory.code) {
        this.toastService.warning('Please save the new category first');
        return false;
      }
    }
    return true;
  }

  // Step 2: Subcategory Methods
  filterSubcategoriesByCategory(): void {
    const categoryId = this.categoryMode === 'existing' ? this.selectedCategoryId : 
                       this.categories.find(c => c.name === this.newCategory.name)?._id;
    
    if (categoryId) {
      this.filteredSubcategories = this.subcategories.filter(sub => {
        const subCategoryId = typeof sub.category === 'object' && sub.category ? (sub.category as any)._id : sub.category;
        return subCategoryId === categoryId;
      });
    } else {
      this.filteredSubcategories = [];
    }
  }

  onSubcategoryModeChange(): void {
    this.selectedSubcategoryId = '';
    this.newSubcategory = {
      name: '',
      code: '',
      description: '',
      isActive: true
    };
  }

  saveSubcategory(): void {
    if (!this.newSubcategory.name || !this.newSubcategory.code) {
      this.toastService.warning('Please fill in subcategory name and code');
      return;
    }

    const categoryId = this.categoryMode === 'existing' ? this.selectedCategoryId :
                       this.categories.find(c => c.name === this.newCategory.name)?._id;

    if (!categoryId) {
      this.toastService.error('Category not found');
      return;
    }

    this.savingSubcategory = true;
    const subcategoryData = {
      ...this.newSubcategory,
      category: categoryId
    };

    this.subcategoryService.createSubcategory(subcategoryData as Subcategory).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Subcategory created successfully!');
          this.subcategories.push(response.data);
          this.filteredSubcategories.push(response.data);
          this.selectedSubcategoryId = response.data._id!;
          // Reset form and switch to existing mode
          this.newSubcategory = {
            name: '',
            code: '',
            description: '',
            isActive: true
          };
          this.subcategoryMode = 'existing';
          this.savingSubcategory = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error creating subcategory:', err);
        this.toastService.error(err.error?.message || 'Failed to create subcategory');
        this.savingSubcategory = false;
      }
    });
  }

  validateStep2(): boolean {
    if (this.subcategoryMode === 'existing') {
      if (!this.selectedSubcategoryId) {
        this.toastService.warning('Please select a subcategory');
        return false;
      }
    } else {
      if (!this.newSubcategory.name || !this.newSubcategory.code) {
        this.toastService.warning('Please save the new subcategory first');
        return false;
      }
    }
    return true;
  }

  // Step 3: Product Methods
  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (!this.newProduct.images) {
            this.newProduct.images = [];
          }
          this.newProduct.images.push(e.target.result);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    if (this.newProduct.images) {
      this.newProduct.images.splice(index, 1);
    }
  }

  saveProduct(): void {
    if (!this.newProduct.name || !this.newProduct.itemCode) {
      this.toastService.warning('Please fill in product name and item code');
      return;
    }

    this.savingProduct = true;

    const categoryId = this.categoryMode === 'existing' ? this.selectedCategoryId :
                       this.categories.find(c => c.name === this.newCategory.name)?._id;
    
    const subcategoryId = this.subcategoryMode === 'existing' ? this.selectedSubcategoryId :
                          this.subcategories.find(s => s.name === this.newSubcategory.name)?._id;

    const productData = {
      ...this.newProduct,
      category: categoryId,
      subCategory: subcategoryId
    };

    this.productService.createProduct(productData as Product).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Product created successfully!');
          this.savingProduct = false;
          setTimeout(() => {
            this.router.navigate(['/inventory/products']);
          }, 1500);
        }
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.toastService.error(err.error?.message || 'Failed to create product');
        this.savingProduct = false;
      }
    });
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
      this.router.navigate(['/inventory/products']);
    }
  }

  // Brand Modal Methods
  openBrandModal(): void {
    this.showBrandModal = true;
    this.newBrand = {
      name: '',
      code: '',
      description: '',
      isActive: true
    };
  }

  closeBrandModal(): void {
    this.showBrandModal = false;
    this.newBrand = {
      name: '',
      code: '',
      description: '',
      isActive: true
    };
  }

  saveBrand(): void {
    if (!this.newBrand.name || !this.newBrand.code) {
      this.toastService.warning('Please fill in brand name and code');
      return;
    }

    this.savingBrand = true;
    this.brandService.createBrand(this.newBrand as Brand).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Brand created successfully!');
          // Add new brand to the list
          const newBrandData = response.data;
          this.brands.push(newBrandData);
          this.brandOptions.push({
            id: newBrandData._id!,
            name: newBrandData.name
          });
          // Set the newly created brand as selected
          this.newProduct.brand = newBrandData._id;
          this.savingBrand = false;
          this.closeBrandModal();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error creating brand:', err);
        this.toastService.error(err.error?.message || 'Failed to create brand');
        this.savingBrand = false;
      }
    });
  }
}
