import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { ToastService } from '../services/toast.service';
import { ThemeButtonComponent } from '../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ThemeButtonComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  loading = true;
  private loadingTimeout: any = null;

  // Filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  paymentFilter: string = '';

  get filteredOrders(): Order[] {
    return this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order._id?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.statusFilter || order.orderStatus === this.statusFilter;
      const matchesPayment = !this.paymentFilter || order.paymentStatus === this.paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  loadOrders(): void {
    console.log('🔄 loadOrders() called');
    this.loading = true;
    
    // Safety timeout - force loading to false after 10 seconds
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.error('⏱️ TIMEOUT - API call took too long, forcing loading = false');
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.error('Request timeout - please check your connection');
      }
    }, 10000);
    
    // Get userId from localStorage
    let userId: string | null = null;
    const userStr = localStorage.getItem('user');
    console.log('📦 localStorage user:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id || user.id || user.userId || null;
        console.log('👤 Extracted userId:', userId);
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
      }
    }
    
    if (!userId) {
      console.log('⚠️ No userId found, redirecting to signin');
      this.loading = false;
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.toastService.error('Please login to view orders');
        this.router.navigate(['/auth/signin']);
      });
      return;
    }

    console.log('📡 Calling orderService.getMyOrders()...');
    // Pass userId as query parameter
    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        console.log('✅ Orders API response:', response);
        console.log('Response type:', typeof response);
        console.log('Response success:', response?.success);
        console.log('Response data:', response?.data);
        
        if (response && response.success && Array.isArray(response.data)) {
          this.orders = response.data;
          console.log('📋 Loaded', this.orders.length, 'orders');
        } else {
          console.warn('⚠️ Unexpected response format');
          this.orders = [];
        }
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
        }
        this.loading = false;
        this.cdr.detectChanges();
        console.log('✅ Change detection triggered, loading:', this.loading, 'orders count:', this.orders.length);
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        console.error('Error status:', error.status);
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
        }
        console.error('Error message:', error.message);
        this.loading = false;
        this.orders = [];
        this.cdr.detectChanges();
        // Use setTimeout to avoid change detection error
        setTimeout(() => {
          this.toastService.error('Failed to load orders: ' + (error.message || 'Unknown error'));
        });
      },
      complete: () => {
        console.log('🏁 Observable completed');
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/orders/details', order._id]);
  }

  cancelOrder(orderId: string): void {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.orderService.cancelOrder(orderId).subscribe({
      next: (response) => {
        if (response.success) {
          // Use setTimeout to avoid change detection error
          setTimeout(() => {
            this.toastService.success('Order cancelled successfully');
          });
          this.loadOrders();
        }
      },
      error: (error) => {
        // Use setTimeout to avoid change detection error
        setTimeout(() => {
          this.toastService.error('Failed to cancel order');
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'payment-pending',
      'completed': 'payment-completed',
      'failed': 'payment-failed'
    };
    return statusClasses[status] || 'payment-pending';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  toTitleCase(text: string): string {
    if (!text) return '';
    return text.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  canCancelOrder(order: Order): boolean {
    return !['shipped', 'delivered', 'cancelled'].includes(order.orderStatus);
  }
}
