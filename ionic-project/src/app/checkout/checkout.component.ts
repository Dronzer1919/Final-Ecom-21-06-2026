import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../environments/environment';
import { ThemeButtonComponent } from '../components/buttons/theme-button/theme-button.component';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeButtonComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  checkoutForm!: FormGroup;
  isProcessing = false;
  paymentMethod: 'cod' | 'online' = 'online';

  ngOnInit(): void {
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.initializeForm();
    this.loadRazorpayScript();
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  get cartItems() {
    return this.cartService.items();
  }

  get subtotal() {
    return this.cartService.subtotal();
  }

  get tax() {
    return this.cartService.tax();
  }

  get total() {
    return this.cartService.total();
  }

  selectPaymentMethod(method: 'cod' | 'online'): void {
    this.paymentMethod = method;
  }

  async placeOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isProcessing = true;

    try {
      // Get user ID from localStorage
      let userId = 'guest';
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user._id || user.id || user.userId || 'guest';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Validate userId
      if (!userId || userId === 'guest') {
        this.toastService.error('Please login to place an order');
        this.isProcessing = false;
        this.router.navigate(['/auth/signin']);
        return;
      }

      const orderData: any = {
        userId: userId,
        items: this.cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discountValue: item.discountValue,
          discountType: item.discountType
        })),
        subtotal: this.subtotal,
        tax: this.tax,
        total: this.total,
        shippingAddress: this.checkoutForm.value,
        paymentMethod: this.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending'
      };

      console.log('Creating order with data:', orderData);

      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          if (this.paymentMethod === 'online') {
            this.initiateRazorpayPayment(response.data);
          } else {
            // COD order - clear cart and redirect to success
            this.cartService.clearCart();
            this.toastService.success('Order placed successfully!');
            this.router.navigate(['/orders/userorders']);
          }
        },
        error: (error) => {
          this.toastService.error('Failed to create order. Please try again.');
          this.isProcessing = false;
        }
      });
    } catch (error) {
      this.toastService.error('An error occurred. Please try again.');
      this.isProcessing = false;
    }
  }

  private loadRazorpayScript(): void {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  private initiateRazorpayPayment(orderData: any): void {
    const options = {
      key: environment.razorpayKeyId,
      amount: Math.round(this.total * 100), // Amount in paise
      currency: 'INR',
      name: 'RouteRetail',
      description: 'Order Payment',
      order_id: orderData.razorpayOrderId,
      handler: (response: any) => {
        this.verifyPayment(orderData._id, response);
      },
      prefill: {
        name: this.checkoutForm.get('fullName')?.value,
        contact: this.checkoutForm.get('phone')?.value
      },
      theme: {
        color: '#667eea'
      },
      modal: {
        ondismiss: () => {
          this.isProcessing = false;
          this.toastService.info('Payment cancelled');
        }
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.open();
  }

  private verifyPayment(orderId: string, razorpayResponse: any): void {
    const paymentData = {
      orderId: orderId,
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature
    };

    this.orderService.verifyPayment(paymentData).subscribe({
      next: (response) => {
        this.cartService.clearCart();
        this.toastService.success('Payment successful! Your order has been placed.');
        this.router.navigate(['/orders/userorders']);
      },
      error: (error) => {
        this.toastService.error('Payment verification failed. Please contact support.');
        this.isProcessing = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('minlength')) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} characters required`;
    }
    if (field?.hasError('pattern')) {
      if (fieldName === 'phone') return 'Enter a valid 10-digit phone number';
      if (fieldName === 'pincode') return 'Enter a valid 6-digit pincode';
    }
    return '';
  }
}
