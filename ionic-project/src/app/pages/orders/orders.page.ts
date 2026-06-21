import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonRefresher, IonRefresherContent,
  IonSpinner, IonBadge, IonSearchbar, IonSelect, IonSelectOption,
  IonCard, IonCardContent, ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline, eyeOutline, closeCircleOutline, receiptOutline } from 'ionicons/icons';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonRefresher, IonRefresherContent,
    IonSpinner, IonBadge, IonSearchbar, IonSelect, IonSelectOption,
    IonCard, IonCardContent
  ]
})
export class OrdersPage implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');
  statusFilter = signal('');
  paymentFilter = signal('');

  filteredOrders = computed(() => {
    let list = this.orders();
    const q = this.searchTerm().toLowerCase().trim();
    if (q) list = list.filter(o => o._id?.toLowerCase().includes(q) || (o.status || o.orderStatus || '').toLowerCase().includes(q));
    if (this.statusFilter()) list = list.filter(o => (o.status || o.orderStatus) === this.statusFilter());
    if (this.paymentFilter()) list = list.filter(o => o.paymentStatus === this.paymentFilter());
    return list;
  });

  statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  paymentOptions = ['pending', 'paid', 'failed', 'refunded'];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ refreshOutline, eyeOutline, closeCircleOutline, receiptOutline });
  }

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

  async handleRefresh(event: any) {
    this.loadOrders();
    setTimeout(() => event.target?.complete(), 1000);
  }

  viewDetails(orderId: string) {
    this.router.navigate(['/orders/details', orderId]);
  }

  async confirmCancel(order: Order) {
    const status = order.status || order.orderStatus;
    if (status === 'delivered' || status === 'cancelled') return;
    const alert = await this.alertCtrl.create({
      header: 'Cancel Order',
      message: `Are you sure you want to cancel order #${(order._id || '').slice(-6).toUpperCase()}?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes, Cancel', handler: () => this.cancelOrder(order._id!) }
      ]
    });
    await alert.present();
  }

  cancelOrder(orderId: string) {
    this.orderService.cancelOrder(orderId).subscribe({
      next: async () => {
        this.orders.update(list => list.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
        const t = await this.toastCtrl.create({ message: 'Order cancelled', duration: 2000, color: 'warning' });
        await t.present();
      },
      error: async (err: any) => {
        const t = await this.toastCtrl.create({ message: err?.error?.message || 'Cancel failed', duration: 2000, color: 'danger' });
        await t.present();
      }
    });
  }

  onSearchChange(event: any) { this.searchTerm.set(event.target?.value || event?.detail?.value || ''); }
  onStatusChange(event: any) { this.statusFilter.set(event?.detail?.value ?? event); }
  onPaymentChange(event: any) { this.paymentFilter.set(event?.detail?.value ?? event); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'warning', confirmed: 'primary', processing: 'tertiary',
      shipped: 'secondary', delivered: 'success', cancelled: 'danger'
    };
    return map[status] || 'medium';
  }

  getPaymentClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'warning', paid: 'success', failed: 'danger', refunded: 'medium'
    };
    return map[status] || 'medium';
  }

  getOrderStatus(order: Order): string {
    return order.status || order.orderStatus || 'pending';
  }

  getOrderTotal(order: Order): number {
    return order.totalAmount ?? order.total ?? 0;
  }

  getItemName(item: any): string {
    return item?.name || item?.product?.name || 'Item';
  }

  formatDate(dateValue: string | Date | undefined): string {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  canCancel(status: string | undefined): boolean {
    return !['delivered', 'cancelled', 'shipped'].includes(status || '');
  }
}
