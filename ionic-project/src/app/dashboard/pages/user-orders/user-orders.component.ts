import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../../services/order.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.scss']
})
export class UserOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = '';
  statusFilter = '';
  paymentFilter = '';
  rowsPerPage = 10;
  currentPage = 1;

  filteredOrders = computed(() => {
    let list = this.orders();
    const q = this.searchTerm.toLowerCase().trim();
    if (q) list = list.filter(o =>
      o._id?.toLowerCase().includes(q) ||
      (o.status || o.orderStatus || '').toLowerCase().includes(q) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(q)
    );
    if (this.statusFilter) list = list.filter(o => (o.status || o.orderStatus) === this.statusFilter);
    if (this.paymentFilter) list = list.filter(o => o.paymentStatus === this.paymentFilter);
    return list;
  });

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders().length / this.rowsPerPage));
  }

  get paginatedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.filteredOrders().slice(start, start + this.rowsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  paymentOptions = ['pending', 'paid', 'failed', 'refunded'];

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);
    this.orderService.getMyOrders().subscribe({
      next: (res: any) => {
        const data = res?.orders || res?.data?.orders || res?.data || res || [];
        this.orders.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onFilterChange() { this.currentPage = 1; }

  viewDetails(orderId: string) {
    this.router.navigate(['/orders/details', orderId]);
  }

  getOrderStatus(order: Order): string {
    return order.status || order.orderStatus || 'pending';
  }

  getOrderTotal(order: Order): number {
    return order.totalAmount ?? order.total ?? 0;
  }

  formatDate(dateValue: string | Date | undefined): string {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
