import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { BrandService, Brand } from '../../../services/brand.service';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../components/shimmer/shimmer-table/shimmer-table.component';

@Component({
  selector: 'app-low-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './low-stocks.component.html',
  styleUrls: ['./low-stocks.component.scss']
})
export class LowStocksComponent implements OnInit {
  searchTerm: string = '';
  selectedWarehouse: string = '';
  selectedStore: string = '';
  selectedCategory: string = '';
  selectedBrand: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalProducts: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  activeTab: string = 'low-stocks';
  notifyEnabled: boolean = true;

  products: Product[] = [];
  allLowStockProducts: Product[] = [];
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
    
    // Fetch ALL products (or a large number) to filter for low stock ones
    this.productService.getAllProducts(1, 1000, search, undefined, category, brand).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        if (response && response.data) {
          const allProducts = Array.isArray(response.data) ? response.data : [];
          
          // Filter based on active tab
          let filteredProducts: Product[];
          if (this.activeTab === 'low-stocks') {
            // Low stock: quantity < quantityAlert but > 0
            filteredProducts = allProducts.filter((product: Product) => {
              return product.quantity > 0 && product.quantity < (product.quantityAlert ?? Infinity);
            });
          } else {
            // Out of stock: quantity === 0
            filteredProducts = allProducts.filter((product: Product) => {
              return product.quantity === 0;
            });
          }
          
          // Store all filtered products for pagination
          this.allLowStockProducts = filteredProducts;
          this.totalProducts = filteredProducts.length;
          
          // Apply frontend pagination
          this.updatePaginatedProducts();
        } else {
          this.allLowStockProducts = [];
          this.products = [];
          this.totalProducts = 0;
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load products. Please try again.';
        this.allLowStockProducts = [];
        this.products = [];
        this.totalProducts = 0;
      }
    });
  }

  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.products = this.allLowStockProducts.slice(startIndex, endIndex);
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

  /* // Commented out dummy data - using real API data now
  dummyProducts = [
    {
      warehouse: 'Lavish Warehouse',
      store: 'Electro Mart',
      productName: 'Lenovo IdeaPad 3',
      category: 'Computers',
      sku: 'PT001',
      qty: 20,
      qtyAlert: 15,
      icon: '💻'
    },
    {
      warehouse: 'Quaint Warehouse',
      store: 'Quantum Gadgets',
      productName: 'Beats Pro',
      category: 'Electronics',
      sku: 'PT002',
      qty: 25,
      qtyAlert: 20,
      icon: '🎧'
    },
    {
      warehouse: 'Traditional Warehouse',
      store: 'Prime Bazaar',
      productName: 'Nike Jordan',
      category: 'Shoe',
      sku: 'PT003',
      qty: 40,
      qtyAlert: 35,
      icon: '👟'
    },
    {
      warehouse: 'Cool Warehouse',
      store: 'Gadget World',
      productName: 'Apple Series 5 Watch',
      category: 'Electronics',
      sku: 'PT004',
      qty: 50,
      qtyAlert: 45,
      icon: '⌚'
    },
    {
      warehouse: 'Overflow Warehouse',
      store: 'Volt Vault',
      productName: 'Amazon Echo Dot',
      category: 'Electronics',
      sku: 'PT005',
      qty: 30,
      qtyAlert: 25,
      icon: '🔊'
    },
    {
      warehouse: 'Nova Storage Hub',
      store: 'Elite Retail',
      productName: 'Sanford Chair Sofa',
      category: 'Furniture',
      sku: 'PT006',
      qty: 10,
      qtyAlert: 8,
      icon: '🪑'
    },
    {
      warehouse: 'Retail Supply Hub',
      store: 'Prime Mart',
      productName: 'Red Premium Satchel',
      category: 'Bags',
      sku: 'PT007',
      qty: 70,
      qtyAlert: 60,
      icon: '👜'
    },
    {
      warehouse: 'EdgeWare Solutions',
      store: 'NeoTech Store',
      productName: 'Iphone 14 Pro',
      category: 'Phone',
      sku: 'PT008',
      qty: 35,
      qtyAlert: 30,
      icon: '📱'
    },
    {
      warehouse: 'North Zone Warehouse',
      store: 'Urban Mart',
      productName: 'Gaming Chair',
      category: 'Furniture',
      sku: 'PT009',
      qty: 15,
      qtyAlert: 10,
      icon: '🪑'
    },
    {
      warehouse: 'Fulfillment Hub',
      store: 'Travel Mart',
      productName: 'Borealis Backpack',
      category: 'Bags',
      sku: 'PT010',
      qty: 45,
      qtyAlert: 40,
      icon: '🎒'
    }
  ];
*/

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.rowsPerPage);
  }

  get paginatedProducts(): Product[] {
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadProducts();
  }

  toggleNotify(): void {
    this.notifyEnabled = !this.notifyEnabled;
  }

  getCategoryName(category: any): string {
    if (!category) return 'N/A';
    return typeof category === 'string' ? category : category.name || 'N/A';
  }

  getBrandName(brand: any): string {
    if (!brand) return 'N/A';
    return typeof brand === 'string' ? brand : brand.name || 'N/A';
  }

  getWarehouseName(warehouse: any): string {
    if (!warehouse) return 'N/A';
    return typeof warehouse === 'string' ? warehouse : warehouse.name || 'N/A';
  }

  getStoreName(store: any): string {
    if (!store) return 'N/A';
    return typeof store === 'string' ? store : store.name || 'N/A';
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
  }

  deleteProduct(product: Product): void {
    console.log('Delete product:', product);
  }

  exportPDF(): void {
    if (this.products.length === 0) {
      alert('No products to export');
      return;
    }

    const title = this.activeTab === 'low-stocks' ? 'Low Stock Products' : 'Out of Stock Products';
    const fileName = this.activeTab === 'low-stocks' ? 'low-stock-products' : 'out-of-stock-products';

    const columns: ExportColumn[] = [
      { header: 'SKU', dataKey: 'sku', width: 30 },
      { header: 'Product Name', dataKey: 'name', width: 50 },
      { header: 'Category', dataKey: 'category.name', width: 35 },
      { header: 'Brand', dataKey: 'brand.name', width: 30 },
      { header: 'Quantity', dataKey: 'quantity', width: 25 },
      { header: 'Alert Qty', dataKey: 'quantityAlert', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.products,
      columns,
      fileName,
      title
    );
  }

  exportExcel(): void {
    if (this.products.length === 0) {
      alert('No products to export');
      return;
    }

    const fileName = this.activeTab === 'low-stocks' ? 'low-stock-products' : 'out-of-stock-products';
    const sheetName = this.activeTab === 'low-stocks' ? 'Low Stock' : 'Out of Stock';

    const columns: ExportColumn[] = [
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Product Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category.name' },
      { header: 'Brand', dataKey: 'brand.name' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Alert Quantity', dataKey: 'quantityAlert' }
    ];

    this.exportService.exportToExcel(
      this.products,
      columns,
      fileName,
      sheetName
    );
  }

  refresh(): void {
    this.searchTerm = '';
    this.selectedWarehouse = '';
    this.selectedStore = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  sendEmail(): void {
    console.log('Send email');
  }
}
