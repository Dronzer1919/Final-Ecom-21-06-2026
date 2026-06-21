import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  order: Order | null = null;
  loading = true;
  orderId: string = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.loadOrderDetails();
    } else {
      this.router.navigate(['/orders/userorders']);
    }
  }

  loadOrderDetails(): void {
    console.log('🔍 Loading order details for ID:', this.orderId);
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (response: any) => {
        console.log('📦 Order details API response:', response);
        if (response && response.success && Array.isArray(response.data)) {
          this.order = response.data.find((o: Order) => o._id === this.orderId) || null;
          console.log('✅ Found order:', this.order);
        } else {
          console.warn('⚠️ Unexpected response format:', response);
        }
        this.loading = false;
        this.cdr.detectChanges();
        console.log('🏁 Loading complete. Order found:', !!this.order);
        
        if (!this.order) {
          setTimeout(() => {
            this.toastService.error('Order not found');
            this.router.navigate(['/orders/userorders']);
          });
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading order:', error);
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.toastService.error('Failed to load order details');
          this.router.navigate(['/orders/userorders']);
        });
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
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

  confirmOrder(orderId: string): void {
    if (confirm('Are you sure you want to confirm this order?')) {
      this.orderService.confirmOrder(orderId).subscribe({
        next: () => {
          this.toastService.success('Order confirmed successfully');
          this.loadOrderDetails();
        },
        error: (error: any) => {
          console.error('Error confirming order:', error);
          this.toastService.error('Failed to confirm order');
        }
      });
    }
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.toastService.success('Order cancelled successfully');
          this.loadOrderDetails();
        },
        error: (error: any) => {
          console.error('Error cancelling order:', error);
          this.toastService.error('Failed to cancel order');
        }
      });
    }
  }

  downloadPDF(): void {
    if (!this.order) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order #${this.order._id?.slice(-8)?.toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          h2 { color: #555; margin-top: 30px; margin-bottom: 15px; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .info-item { padding: 10px; background: #f9f9f9; border-radius: 5px; }
          .info-item strong { display: block; color: #666; font-size: 12px; margin-bottom: 5px; }
          .info-item span { font-size: 14px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f0f0f0; padding: 12px; text-align: left; border-bottom: 2px solid #333; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .text-right { text-align: right; }
          .summary { max-width: 300px; margin-left: auto; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { border-top: 2px solid #333; font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 15px; }
          .address-box { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; }
          hr { border: none; border-top: 1px solid #ddd; margin: 30px 0; }
        </style>
      </head>
      <body>
        <h1>Order Details</h1>
        
        <div class="info-grid">
          <div class="info-item">
            <strong>ORDER ID</strong>
            <span>#${this.order._id?.slice(-8)?.toUpperCase() || 'N/A'}</span>
          </div>
          <div class="info-item">
            <strong>CUSTOMER</strong>
            <span>${this.toTitleCase(this.order.shippingAddress.fullName)}</span>
          </div>
          <div class="info-item">
            <strong>ORDER DATE</strong>
            <span>${this.formatDate(this.order.createdAt)}</span>
          </div>
          <div class="info-item">
            <strong>PAYMENT METHOD</strong>
            <span>${this.order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
          </div>
          <div class="info-item">
            <strong>PAYMENT STATUS</strong>
            <span style="text-transform: capitalize;">${this.order.paymentStatus}</span>
          </div>
          <div class="info-item">
            <strong>ORDER STATUS</strong>
            <span style="text-transform: capitalize;">${this.order.orderStatus}</span>
          </div>
        </div>
        
        <hr>
        
        <h2>Order Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Price</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td class="text-right">Rs. ${item.price.toLocaleString('en-IN')}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <strong>Rs. ${this.order.subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <div class="summary-row">
            <span>Tax:</span>
            <strong>Rs. ${this.order.tax.toLocaleString('en-IN')}</strong>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <strong>Rs. ${this.order.total.toLocaleString('en-IN')}</strong>
          </div>
        </div>
        
        <hr>
        
        <h2>Shipping Address</h2>
        <div class="address-box">
          <p style="margin: 0 0 5px 0;"><strong>${this.toTitleCase(this.order.shippingAddress.fullName)}</strong></p>
          <p style="margin: 0 0 5px 0;">${this.order.shippingAddress.phone}</p>
          <p style="margin: 0 0 5px 0;">${this.order.shippingAddress.address}</p>
          <p style="margin: 0;">${this.order.shippingAddress.city}, ${this.order.shippingAddress.state} - ${this.order.shippingAddress.pincode}</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }

    this.toastService.success('Opening PDF print dialog...');
  }

  downloadExcel(): void {
    if (!this.order) return;

    // Create CSV content with proper formatting for Excel
    let csvContent = '';
    
    // Order Details Section
    csvContent += 'ORDER DETAILS\n';
    csvContent += 'Order ID,Customer,Order Date\n';
    csvContent += `#${this.order._id?.slice(-8)?.toUpperCase() || 'N/A'},`;
    csvContent += `${this.toTitleCase(this.order.shippingAddress.fullName)},`;
    csvContent += `${this.formatDate(this.order.createdAt)}\n\n`;
    
    // Order Items Section
    csvContent += 'ORDER ITEMS\n';
    csvContent += 'Item,Price (Rs.),Quantity,Total (Rs.)\n';
    this.order.items.forEach(item => {
      csvContent += `"${item.name}",${item.price},${item.quantity},${item.price * item.quantity}\n`;
    });
    
    // Summary Section
    csvContent += '\n';
    csvContent += 'SUMMARY\n';
    csvContent += `Subtotal,Rs. ${this.order.subtotal}\n`;
    csvContent += `Tax,Rs. ${this.order.tax}\n`;
    csvContent += `Total,Rs. ${this.order.total}\n`;

    // Create and download file with BOM for proper Excel encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `order-${this.order._id?.slice(-8)?.toUpperCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toastService.success('Order exported to Excel format');
  }

  goBack(): void {
    this.router.navigate(['/orders/userorders']);
  }
}
