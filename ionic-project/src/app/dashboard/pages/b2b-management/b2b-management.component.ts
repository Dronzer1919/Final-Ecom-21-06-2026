import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { B2BManagementService } from '../../../services/b2b-management.service';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-b2b-management',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './b2b-management.component.html',
  styleUrls: ['./b2b-management.component.scss']
})
export class B2BManagementComponent implements OnInit {
  isLoadingStats = true;
  stats: StatCard[] = [
    { label: 'B2B Categories', value: '—', icon: 'category', color: '#6366f1', route: '/dashboard/b2b-management/categories' },
    { label: 'Subcategories', value: '—', icon: 'subcategory', color: '#0ea5e9', route: '/dashboard/b2b-management/subcategories' },
    { label: 'B2B Products', value: '—', icon: 'product', color: '#10b981', route: '/dashboard/b2b-management/products' },
    { label: 'Vendors', value: '—', icon: 'vendor', color: '#f59e0b', route: '/dashboard/b2b-management/vendors' }
  ];

  quickLinks = [
    { label: 'Step-by-Step Setup', description: 'Category → Sub-Cat → Sub-Sub-Cat → Product → Vendor in one flow', route: '/dashboard/b2b-management/step-form', color: '#6366f1', badge: 'Wizard' },
    { label: 'Manage Categories', description: 'Top-level categories (e.g. Grocery)', route: '/dashboard/b2b-management/categories', color: '#0ea5e9', badge: null },
    { label: 'Manage Sub-Categories', description: 'Groups under a category (e.g. Grocery & Staples, Packed Foods)', route: '/dashboard/b2b-management/subcategories', color: '#8b5cf6', badge: null },
    { label: 'Bulk Sub-Sub Category Upload', description: 'Bulk-upload segments (e.g. Rice, Dals) linked to sub-categories', route: '/dashboard/b2b-management/subsubcategories/bulk-upload', color: '#14b8a6', badge: 'Bulk' },
    { label: 'Product Inventory', description: 'B2B products with pricing, stock, and multiple vendor support', route: '/dashboard/b2b-management/products', color: '#10b981', badge: null },
    { label: 'Vendor Directory', description: 'Manage B2B vendors, bulk pricing and GST info', route: '/dashboard/b2b-management/vendors', color: '#f59e0b', badge: null }
  ];

  constructor(
    private b2bService: B2BManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoadingStats = true;
    this.b2bService.getDashboardStats().subscribe({
      next: (result) => {
        this.stats[0].value = result.categories?.data?.pagination?.totalItems ?? 0;
        this.stats[1].value = result.subcategories?.data?.pagination?.totalItems ?? 0;
        this.stats[2].value = result.products?.pagination?.total ?? result.products?.data?.pagination?.totalItems ?? 0;
        this.stats[3].value = result.vendors?.data?.pagination?.totalItems ?? 0;
        this.isLoadingStats = false;
      },
      error: () => {
        this.isLoadingStats = false;
      }
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
