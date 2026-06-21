import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss']
})
export class CheckoutPage implements OnInit {
  checkoutForm!: FormGroup;
  isProcessing = false;
  paymentMethod: 'cod' | 'online' = 'online';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public cartService: CartService,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.initForm();
    this.loadRazorpayScript();
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  get cartItems() { return this.cartService.items(); }
  get subtotal() { return this.cartService.subtotal(); }
  get tax() { return this.cartService.tax(); }
  get total() { return this.cartService.total(); }

  getDiscountedPrice(item: any): number {
    const p = item.product;
    if (p.discountPrice) return p.discountPrice;
    if (p.discountType === 'percentage' && p.discountValue) return p.price - (p.price * (p.discountValue / 100));
    if (p.discountType === 'fixed' && p.discountValue) return p.price - p.discountValue;
    return p.price;
  }

  selectPaymentMethod(method: 'cod' | 'online'): void {
    this.paymentMethod = method;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.checkoutForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getFieldError(field: string): string {
    const ctrl = this.checkoutForm.get(field);
    if (ctrl?.hasError('required')) return 'This field is required';
    if (ctrl?.hasError('minlength')) return `Minimum ${ctrl.errors?.['minlength'].requiredLength} characters required`;
    if (ctrl?.hasError('pattern')) {
      if (field === 'phone') return 'Enter a valid 10-digit phone number';
      if (field === 'pincode') return 'Enter a valid 6-digit pincode';
    }
    return '';
  }

  async placeOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(k => this.checkoutForm.get(k)?.markAsTouched());
      return;
    }

    this.isProcessing = true;

    let userId = '';
    const userStr = localStorage.getItem('auth_user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id || user.id || user.userId || '';
      } catch (e) { /* ignore */ }
    }

    if (!userId) {
      this.toastService.error('Please login to place an order');
      this.isProcessing = false;
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    const orderData: any = {
      userId,
      items: this.cartItems.map(item => ({
        productId: item.product._id || item.product.id || '',
        name: item.product.name,
        price: this.getDiscountedPrice(item),
        quantity: item.quantity
      })),
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      shippingAddress: this.checkoutForm.value,
      paymentMethod: this.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (this.paymentMethod === 'online') {
          this.initiateRazorpay(response.data);
        } else {
          this.cartService.clearCart();
          this.toastService.success('Order placed successfully!');
          this.router.navigate(['/orders']);
        }
      },
      error: () => {
        this.toastService.error('Failed to create order. Please try again.');
        this.isProcessing = false;
      }
    });
  }

  private loadRazorpayScript(): void {
    if (typeof Razorpay !== 'undefined') return;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }

  private initiateRazorpay(orderData: any): void {
    const rzpKey = (environment as any).razorpayKeyId || '';
    const options = {
      key: rzpKey,
      amount: Math.round(this.total * 100),
      currency: 'INR',
      name: 'United Goals',
      description: 'Order Payment',
      order_id: orderData.razorpayOrderId,
      handler: (response: any) => this.verifyPayment(orderData._id, response),
      prefill: {
        name: this.checkoutForm.get('fullName')?.value,
        contact: this.checkoutForm.get('phone')?.value
      },
      theme: { color: '#FF8C42' },
      modal: {
        ondismiss: () => {
          this.isProcessing = false;
          this.toastService.info('Payment cancelled');
        }
      }
    };
    const rz = new Razorpay(options);
    rz.open();
  }

  private verifyPayment(orderId: string, rzpResponse: any): void {
    this.orderService.verifyPayment({
      orderId,
      razorpayOrderId: rzpResponse.razorpay_order_id,
      razorpayPaymentId: rzpResponse.razorpay_payment_id,
      razorpaySignature: rzpResponse.razorpay_signature
    }).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.toastService.success('Payment successful! Order placed.');
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.toastService.error('Payment verification failed. Please contact support.');
        this.isProcessing = false;
      }
    });
  }
}
