import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface Customer {
  name: string;
  type: string;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent {
  currentTime: string = '';
  searchQuery: string = '';
  selectedCategory: string = 'All';
  selectedCustomer: Customer | null = null;
  orderItems: OrderItem[] = [];
  
  categories = [
    { id: 'All', name: 'All', icon: '🔲' },
    { id: 'Headset', name: 'Headset', icon: '🎧' },
    { id: 'Shoes', name: 'Shoes', icon: '👟' },
    { id: 'Mobiles', name: 'Mobiles', icon: '📱' },
    { id: 'Watches', name: 'Watches', icon: '⌚' },
    { id: 'Laptops', name: 'Laptops', icon: '💻' },
    { id: 'Appliances', name: 'Appliances', icon: '🔌' }
  ];

  products: Product[] = [
    { id: 1, name: 'iPhone 14 64GB', category: 'Mobiles', price: 15800, image: '📱' },
    { id: 2, name: 'MacBook Pro', category: 'Laptops', price: 51000, image: '💻' },
    { id: 3, name: 'Rolex Tribute V3', category: 'Watches', price: 68000, image: '⌚' },
    { id: 4, name: 'Red Nike Atgalo', category: 'Shoes', price: 8965, image: '👟' },
    { id: 5, name: 'Blue White OGR', category: 'Shoes', price: 3569.15, image: '👟' },
    { id: 6, name: 'IdeaPad Slim 5 Gen 7', category: 'Laptops', price: 3569, image: '💻' },
    { id: 7, name: 'SWAGME', category: 'Headset', price: 6587, image: '🎧' },
    { id: 8, name: 'Red Nike Atgalo', category: 'Shoes', price: 2569.25, image: '👟' },
    { id: 9, name: 'Fossil Pair Of 3 in 1', category: 'Watches', price: 4759, image: '⌚' },
    { id: 10, name: 'Green Nike Fe', category: 'Shoes', price: 1547, image: '👟' },
    { id: 11, name: 'Yoga Book 9i', category: 'Laptops', price: 2478, image: '💻' },
    { id: 12, name: 'IdeaPad Slim 3i', category: 'Laptops', price: 6589, image: '💻' },
    { id: 13, name: 'Airpod 2', category: 'Watches', price: 5698, image: '⌚' },
    { id: 14, name: 'Tablet 1.02 Inch', category: 'Mobiles', price: 2945, image: '📱' }
  ];

  paymentMethods = [
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'card', name: 'Card', icon: '💳' },
    { id: 'points', name: 'Points', icon: '⭐' },
    { id: 'deposit', name: 'Deposit', icon: '🏦' },
    { id: 'cheque', name: 'Cheque', icon: '📋' },
    { id: 'giftcard', name: 'Gift Card', icon: '🎁' },
    { id: 'scanpay', name: 'Scan & Pay', icon: '📱' },
    { id: 'paylater', name: 'Pay Later', icon: '⏰' },
    { id: 'external', name: 'External', icon: '🔗' }
  ];

  private toastService = inject(ToastService);

  constructor() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  get filteredProducts(): Product[] {
    let filtered = this.products;
    
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }

  addToOrder(product: Product): void {
    const existingItem = this.orderItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.orderItems.push({ product, quantity: 1 });
    }
  }

  removeFromOrder(index: number): void {
    this.orderItems.splice(index, 1);
  }

  incrementQuantity(item: OrderItem): void {
    item.quantity++;
  }

  decrementQuantity(item: OrderItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  get subtotal(): number {
    return this.orderItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
  }

  get shipping(): number {
    return 0;
  }

  get tax(): number {
    return 0;
  }

  get coupon(): number {
    return 0;
  }

  get discount(): number {
    return 0;
  }

  get totalPayable(): number {
    return this.subtotal + this.shipping + this.tax + this.coupon - this.discount;
  }

  selectWalkInCustomer(): void {
    this.selectedCustomer = { name: 'Walk In Customer', type: 'walk-in' };
  }

  hold(): void {
    console.log('Hold order');
  }

  voidOrder(): void {
    console.log('Void order');
  }

  payment(): void {
    console.log('Process payment');
  }

  viewOrders(): void {
    console.log('View orders');
  }

  reset(): void {
    this.orderItems = [];
    this.selectedCustomer = null;
    this.searchQuery = '';
  }

  transaction(): void {
    console.log('Transaction');
  }

  placeOrder(): void {
    if (this.orderItems.length === 0) {
      this.toastService.warning('Please add items to order');
      return;
    }
    console.log('Place order', this.orderItems);
    this.toastService.success('Order placed successfully!');
    this.reset();
  }
}
