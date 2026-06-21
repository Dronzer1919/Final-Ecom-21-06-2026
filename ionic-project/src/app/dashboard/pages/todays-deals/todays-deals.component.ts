import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-todays-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeButtonComponent],
  templateUrl: './todays-deals.component.html',
  styleUrls: ['./todays-deals.component.scss']
})
export class TodaysDealsComponent implements OnInit {
  deals: Product[] = [];
  allProducts: Product[] = [];
  loading = false;
  error: string | null = null;
  
  // Filters
  searchTerm = '';
  
  // Modal state
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedProduct: Product | null = null;
  
  // Form
  selectedProductId = '';
  customDiscount: number | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private productService: ProductService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDeals();
    this.loadAllProducts();
  }

  loadDeals(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAllProducts(this.currentPage, 100).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filter products with discounts as today's deals
          this.deals = (Array.isArray(response.data) ? response.data : [])
            .filter((p: any) =>
              p.discountValue && p.discountValue > 0 && p.status === 'Active'
            )
            .sort((a: any, b: any) => {
              // Sort by updatedAt (or createdAt) in descending order - latest first
              const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
              return dateB - dateA;
            });
          this.totalItems = this.deals.length;
        } else {
          this.deals = [];
          this.totalItems = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading deals:', err);
        this.error = 'Failed to load today\'s deals';
        this.toastService.error('Failed to load deals');
        this.loading = false;
        this.deals = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadAllProducts(): void {
    console.log('loadAllProducts called');
    this.productService.getAllProducts(1, 100).subscribe({
      next: (response) => {
        console.log('Products response:', response);
        if (response && response.success && response.data) {
          this.allProducts = (Array.isArray(response.data) ? response.data : []).filter((p: any) => p.status === 'Active');
          console.log('Loaded products count:', this.allProducts.length);
          console.log('All products:', this.allProducts);
        } else {
          console.log('No products in response or response failed');
          this.allProducts = [];
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.toastService.error('Failed to load products');
        this.allProducts = [];
      }
    });
  }

  get filteredDeals(): Product[] {
    if (!this.searchTerm) {
      return this.deals;
    }

    const term = this.searchTerm.toLowerCase();
    return this.deals.filter(deal =>
      deal.name.toLowerCase().includes(term) ||
      deal.itemCode?.toLowerCase().includes(term)
    );
  }

  get paginatedDeals(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredDeals.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDeals.length / this.itemsPerPage);
  }

  openAddModal(): void {
    console.log('openAddModal called');
    console.log('Current allProducts count:', this.allProducts.length);
    this.modalMode = 'add';
    this.selectedProduct = null;
    this.selectedProductId = '';
    this.customDiscount = null;
    this.showModal = true;
    
    if (this.allProducts.length === 0) {
      console.log('allProducts is empty, loading products...');
      this.loadAllProducts();
    }
  }

  openEditModal(product: Product): void {
    this.modalMode = 'edit';
    this.selectedProduct = product;
    this.selectedProductId = product._id || '';
    this.customDiscount = product.discountValue || null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
    this.selectedProductId = '';
    this.customDiscount = null;
  }

  saveDeal(): void {
    console.log('saveDeal called');
    console.log('selectedProductId:', this.selectedProductId);
    console.log('customDiscount:', this.customDiscount);

    if (!this.selectedProductId) {
      this.toastService.warning('Please select a product');
      return;
    }

    if (!this.customDiscount || this.customDiscount <= 0) {
      this.toastService.warning('Please enter a valid discount percentage');
      return;
    }

    if (this.customDiscount > 100) {
      this.toastService.warning('Discount percentage cannot exceed 100%');
      return;
    }

    const product = this.allProducts.find(p => p._id === this.selectedProductId);
    console.log('Found product:', product);
    
    if (!product || !product._id) {
      this.toastService.error('Product not found');
      return;
    }

    this.loading = true;

    const updateData = {
      discountType: 'percentage',
      discountValue: Number(this.customDiscount)
    };

    console.log('Updating product with data:', updateData);

    this.productService.updateProduct(product._id, updateData).subscribe({
      next: (response) => {
        console.log('Update response:', response);
        this.loading = false;
        if (response.success) {
          this.toastService.success('Deal saved successfully!');
          this.closeModal();
          this.loadDeals();
        } else {
          this.toastService.error(response.message || 'Failed to save deal');
        }
      },
      error: (err) => {
        console.error('Save deal error:', err);
        console.error('Error details:', err.error);
        console.error('Error status:', err.status);
        this.loading = false;
        const errorMessage = err.error?.message || err.message || 'Failed to save deal';
        this.toastService.error(errorMessage);
      }
    });
  }

  removeDeal(product: Product): void {
    if (!confirm(`Remove "${product.name}" from today's deals?`)) {
      return;
    }

    if (!product._id) {
      this.toastService.error('Invalid product');
      return;
    }

    this.loading = true;

    const updateData = {
      discountValue: 0
    };

    this.productService.updateProduct(product._id, updateData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.toastService.success('Deal removed successfully!');
          this.loadDeals();
        } else {
          this.toastService.error(response.message || 'Failed to remove deal');
        }
      },
      error: (err) => {
        console.error('Remove deal error:', err);
        this.loading = false;
        this.toastService.error(err.error?.message || 'Failed to remove deal');
      }
    });
  }

  getDiscountedPrice(product: Product): number {
    if (!product.discountValue) return product.price;
    
    if (product.discountType === 'percentage') {
      return product.price - (product.price * (product.discountValue / 100));
    } else if (product.discountType === 'fixed') {
      return product.price - product.discountValue;
    }
    return product.price;
  }

  getDiscountPercentage(product: Product): number {
    if (product.discountType === 'percentage') {
      return product.discountValue || 0;
    } else if (product.discountType === 'fixed' && product.discountValue) {
      return Math.round((product.discountValue / product.price) * 100);
    }
    return 0;
  }

  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  get selectedProductForPreview(): Product | undefined {
    return this.allProducts.find(p => p._id === this.selectedProductId);
  }

  get previewOriginalPrice(): number {
    return this.selectedProductForPreview?.price || 0;
  }

  get previewDealPrice(): number {
    const price = this.previewOriginalPrice;
    const discount = this.customDiscount || 0;
    return price * (1 - discount / 100);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://via.placeholder.com/150x150/e0e0e0/666666?text=No+Image';
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/150x150/e0e0e0/666666?text=No+Image';
  }
}
