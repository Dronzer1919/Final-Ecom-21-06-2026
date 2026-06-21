import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonSpinner, IonBadge, IonCard, IonCardContent,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, downloadOutline, checkmarkCircleOutline,
  closeCircleOutline, printOutline, locationOutline, cardOutline, cubeOutline
} from 'ionicons/icons';
import { OrderService, Order } from '../../../services/order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonSpinner, IonBadge, IonCard, IonCardContent
  ]
})
export class OrderDetailsPage implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  actionLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      arrowBackOutline, downloadOutline, checkmarkCircleOutline,
      closeCircleOutline, printOutline, locationOutline, cardOutline, cubeOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(id);
    else { this.error.set('Invalid order ID'); this.loading.set(false); }
  }

  loadOrder(id: string) {
    this.loading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (res: any) => {
        const o = res?.order || res?.data?.order || res?.data || res;
        this.order.set(o);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to load order');
        this.loading.set(false);
      }
    });
  }

  async confirmOrder() {
    const o = this.order();
    if (!o?._id) return;
    this.actionLoading.set(true);
    this.orderService.confirmOrder(o._id).subscribe({
      next: async () => {
        this.order.update(prev => prev ? { ...prev, status: 'confirmed' } : prev);
        this.actionLoading.set(false);
        const t = await this.toastCtrl.create({ message: 'Order confirmed!', duration: 2000, color: 'success' });
        await t.present();
      },
      error: async (err: any) => {
        this.actionLoading.set(false);
        const t = await this.toastCtrl.create({ message: err?.error?.message || 'Action failed', duration: 2000, color: 'danger' });
        await t.present();
      }
    });
  }

  async confirmCancel() {
    const o = this.order();
    if (!o?._id) return;
    const alert = await this.alertCtrl.create({
      header: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes, Cancel', handler: () => {
            this.actionLoading.set(true);
            this.orderService.cancelOrder(o._id!).subscribe({
              next: async () => {
                this.order.update(prev => prev ? { ...prev, status: 'cancelled' } : prev);
                this.actionLoading.set(false);
                const t = await this.toastCtrl.create({ message: 'Order cancelled', duration: 2000, color: 'warning' });
                await t.present();
              },
              error: async (err: any) => {
                this.actionLoading.set(false);
                const t = await this.toastCtrl.create({ message: err?.error?.message || 'Cancel failed', duration: 2000, color: 'danger' });
                await t.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  printOrder() { window.print(); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'warning', confirmed: 'primary', processing: 'tertiary',
      shipped: 'secondary', delivered: 'success', cancelled: 'danger'
    };
    return map[status] || 'medium';
  }

  getPaymentClass(status: string): string {
    const map: Record<string, string> = { pending: 'warning', paid: 'success', failed: 'danger', refunded: 'medium' };
    return map[status] || 'medium';
  }

  getOrderStatus(order: Order): string {
    return order.status || order.orderStatus || 'pending';
  }

  getOrderTotal(order: Order): number {
    return order.totalAmount ?? order.total ?? 0;
  }

  getItemName(item: any): string {
    return item?.name || item?.product?.name || 'Product';
  }

  formatDate(d: string | Date | undefined): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  canConfirm(status: string | undefined): boolean { return status === 'pending'; }
  canCancel(status: string | undefined): boolean { return !['delivered', 'cancelled', 'shipped'].includes(status || ''); }

  getItemImage(item: any): string {
    return item?.image || item?.product?.image || item?.product?.images?.[0] || 'assets/placeholder.png';
  }

  getShortId(id: string | undefined): string {
    if (!id) return '-';
    return '#' + id.slice(-8).toUpperCase();
  }
}
