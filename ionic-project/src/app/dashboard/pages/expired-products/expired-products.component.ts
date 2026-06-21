import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { BrandService, Brand } from '../../../services/brand.service';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ShimmerTableComponent } from '../../../components/shimmer/shimmer-table/shimmer-table.component';

@Component({
  selector: 'app-expired-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ShimmerTableComponent],
  templateUrl: './expired-products.component.html',
  styleUrls: ['./expired-products.component.scss']
})
export class ExpiredProductsComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedBrand: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalProducts: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  products: Product[] = [];
  allExpiredProducts: Product[] = []; // Store all expired products for frontend pagination
  categories: Category[] = [];
  brands: Brand[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const category = this.selectedCategory || undefined;
    const brand = this.selectedBrand || undefined;
    const search = this.searchTerm.trim() || undefined;
    
    // Fetch ALL products (or a large number) to filter for expired ones
    this.productService.getAllProducts(1, 1000, search, undefined, category, brand).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        console.log('Response received:', response);
        
        if (response && response.data) {
          // Filter only expired products
          const allProducts = Array.isArray(response.data) ? response.data : [];
          console.log('Total products fetched:', allProducts.length);
          
          const now = new Date();
          console.log('Current date:', now);
          
          const expiredProducts = allProducts.filter((product: Product) => {
            if (product.expiryOn) {
              const expiryDate = new Date(product.expiryOn);
              console.log(`Product ${product.name}: expiryOn=${product.expiryOn}, parsed=${expiryDate}, expired=${expiryDate < now}`);
              return expiryDate < now;
            }
            return false;
          });
          
          console.log('Expired products found:', expiredProducts.length);
          
          // Store all expired products for pagination
          this.allExpiredProducts = expiredProducts;
          this.totalProducts = expiredProducts.length;
          
          // Apply frontend pagination
          this.updatePaginatedProducts();
        } else {
          this.allExpiredProducts = [];
          this.products = [];
          this.totalProducts = 0;
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading expired products:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load expired products. Please try again.';
        this.allExpiredProducts = [];
        this.products = [];
        this.totalProducts = 0;
      }
    });
  }

  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.products = this.allExpiredProducts.slice(startIndex, endIndex);
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

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.rowsPerPage);
  }

  get paginatedProducts(): Product[] {
    // Products are already paginated in the products array
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
      this.updatePaginatedProducts();
    }
  }

  onRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rowsPerPage = parseInt(select.value);
    this.currentPage = 1;
    this.updatePaginatedProducts();
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

  getCategoryName(category: any): string {
    if (!category) return 'N/A';
    return typeof category === 'string' ? category : category.name || 'N/A';
  }

  getBrandName(brand: any): string {
    if (!brand) return 'N/A';
    return typeof brand === 'string' ? brand : brand.name || 'N/A';
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    };
    return d.toLocaleDateString('en-US', options);
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
  }

  deleteProduct(product: Product): void {
    console.log('Delete product:', product);
  }

  exportPDF(): void {
    if (this.products.length === 0) {
      alert('No expired products to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'SKU', dataKey: 'sku', width: 30 },
      { header: 'Product Name', dataKey: 'name', width: 50 },
      { header: 'Category', dataKey: 'category.name', width: 35 },
      { header: 'Brand', dataKey: 'brand.name', width: 30 },
      { header: 'Expiry Date', dataKey: 'expiryDate', width: 30 },
      { header: 'Quantity', dataKey: 'quantity', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.products,
      columns,
      'expired-products',
      'Expired Products List'
    );
  }

  exportExcel(): void {
    if (this.products.length === 0) {
      alert('No expired products to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Product Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category.name' },
      { header: 'Brand', dataKey: 'brand.name' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Expiry Date', dataKey: 'expiryDate' }
    ];

    this.exportService.exportToExcel(
      this.products,
      columns,
      'expired-products',
      'Expired Products'
    );
  }

  refresh(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.currentPage = 1;
    this.loadProducts();
  }
}
