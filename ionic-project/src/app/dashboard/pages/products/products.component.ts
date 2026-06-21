import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { BrandService, Brand } from '../../../services/brand.service';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../components/shimmer/shimmer-table/shimmer-table.component';

interface Product {
  _id?: string;
  sku?: string;
  name?: string;
  productName?: string;
  category?: any;
  subCategory?: any;
  brand?: any;
  price: number;
  unit?: any;
  quantity: number;
  quantityAlert?: number;
  itemCode?: string;
  barcodeSymbology?: any;
  description?: string;
  status?: string;
  taxType?: string;
  discountType?: string;
  discountValue?: number;
  warranty?: string;
  manufacturer?: string;
  manufacturedDate?: string;
  expiryOn?: string;
  sellingType?: string;
  productType?: string;
  store?: any;
  warehouse?: any;
  createdBy?: {
    name: string;
    avatar: string;
  };
  icon?: string;
  images?: string[];
  createdAt?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedBrand: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalProducts: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  selectedProduct: Product | null = null;
  showDetailModal: boolean = false;

  // Multi-select
  selectedIds: Set<string> = new Set();
  get allSelected(): boolean {
    return this.products.length > 0 && this.products.every(p => p._id && this.selectedIds.has(p._id));
  }
  get hasSelection(): boolean { return this.selectedIds.size > 0; }
  get multipleSelected(): boolean { return this.selectedIds.size > 1; }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedIds.clear();
    } else {
      this.products.forEach(p => { if (p._id) this.selectedIds.add(p._id); });
    }
  }

  toggleSelect(product: Product): void {
    if (!product._id) return;
    if (this.selectedIds.has(product._id)) {
      this.selectedIds.delete(product._id);
    } else {
      this.selectedIds.add(product._id);
    }
  }

  isSelected(product: Product): boolean {
    return !!product._id && this.selectedIds.has(product._id);
  }

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ProductsComponent initialized');
    console.log('Calling loadProducts...');
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
  }

  loadProducts(): void {
    console.log('loadProducts called');
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Making API call to get products...');
    const category = this.selectedCategory || undefined;
    const brand = this.selectedBrand || undefined;
    const search = this.searchTerm.trim() || undefined;
    
    this.productService.getAllProducts(this.currentPage, this.rowsPerPage, search, undefined, category, brand).subscribe({
      next: (response: any) => {
        console.log('Products response received:', response);
        console.log('Response data:', response.data);
        
        this.isLoading = false;
        console.log('isLoading set to false:', this.isLoading);
        
        if (response && response.data) {
          this.products = Array.isArray(response.data) ? response.data : [];
          this.totalProducts = response.pagination?.total || this.products.length;
          console.log('Products loaded:', this.products.length);
          console.log('Products array:', this.products);
        } else {
          console.warn('No data in response');
          this.products = [];
          this.totalProducts = 0;
        }
        
        // Trigger change detection
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load products. Please try again.';
        this.products = [];
        this.totalProducts = 0;
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.rowsPerPage);
  }

  get paginatedProducts(): Product[] {
    // Products are already paginated from backend
    return this.products;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  onRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rowsPerPage = parseInt(select.value);
    this.currentPage = 1;
    this.loadProducts();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.trim();
    this.currentPage = 1;
    this.loadProducts();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onBrandChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  viewProduct(product: Product): void {
    this.selectedProduct = product;
    this.showDetailModal = true;
    // Fetch full product details from API to get all fields
    if (product._id) {
      this.productService.getProductById(product._id).subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.selectedProduct = response.data;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error loading product details:', error);
        }
      });
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedProduct = null;
  }

  editProduct(product: Product): void {
    this.router.navigate(['/dashboard/products/edit', product._id]);
  }

  deleteProduct(product: Product): void {
    if (!product._id) return;
    if (!confirm(`Are you sure you want to delete "${product.productName || product.name}"?`)) return;
    this.productService.deleteProduct(product._id).subscribe({
      next: () => {
        this.selectedIds.delete(product._id!);
        this.loadProducts();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to delete product. Please try again.');
      }
    });
  }

  deleteSelected(): void {
    if (this.selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${this.selectedIds.size} selected product(s)?`)) return;
    const ids = Array.from(this.selectedIds);
    let completed = 0;
    let failed = 0;
    ids.forEach(id => {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.selectedIds.delete(id);
          completed++;
          if (completed + failed === ids.length) this.loadProducts();
        },
        error: () => {
          failed++;
          if (completed + failed === ids.length) this.loadProducts();
        }
      });
    });
  }

  exportPDF(): void {
    if (this.products.length === 0) {
      alert('No products to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'SKU', dataKey: 'sku', width: 30 },
      { header: 'Product Name', dataKey: 'name', width: 50 },
      { header: 'Category', dataKey: 'category.name', width: 35 },
      { header: 'Brand', dataKey: 'brand.name', width: 30 },
      { header: 'Price', dataKey: 'price', width: 25 },
      { header: 'Quantity', dataKey: 'quantity', width: 25 },
      { header: 'Unit', dataKey: 'unit.name', width: 20 }
    ];

    this.exportService.exportToPDF(
      this.products,
      columns,
      'products-list',
      'Products List'
    );
  }

  exportExcel(): void {
    if (this.products.length === 0) {
      alert('No products to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Product Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category.name' },
      { header: 'Brand', dataKey: 'brand.name' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Unit', dataKey: 'unit.name' }
    ];

    this.exportService.exportToExcel(
      this.products,
      columns,
      'products-list',
      'Products'
    );
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
      next: (response) => {
        if (response && response.data && response.data.categories) {
          this.categories = response.data.categories;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadBrands(): void {
    this.brandService.getAllBrands(1, 100, undefined, true).subscribe({
      next: (response) => {
        if (response && response.data && response.data.brands) {
          this.brands = response.data.brands;
        }
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });
  }

  refresh(): void {
    // Clear all filters and reload
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  addProduct(): void {
    this.router.navigate(['/dashboard/products/create']);
  }

  importProduct(): void {
    console.log('Import products');
  }
}
