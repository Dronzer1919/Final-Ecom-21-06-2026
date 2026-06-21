import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription, combineLatest } from 'rxjs';
import { PermissionService } from '../../../services/permission.service';

interface MenuItem {
  id?: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: MenuItem[];
  expanded?: boolean;
  disabled?: boolean;
  /** Permission page/cta ID to check; if absent and not disabled the item always shows */
  permId?: string;
  /** Section ID in the permission tree for group-level access check */
  sectionId?: string;
  /** Always visible regardless of permissions (e.g. Dashboard) */
  alwaysVisible?: boolean;
  /** Visible only to admin/manager/superadmin roles */
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly ACCORDION_STATE_KEY = 'sidebar-accordion-state';
  private permSub?: Subscription;

  filteredMenuItems: MenuItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadAccordionState();
    Object.keys(this.icons).forEach(key => {
      this.safeIcons[key] = this.sanitizer.bypassSecurityTrustHtml(this.icons[key]);
    });
    this.buildFilteredMenu();

    this.permSub = combineLatest([
      this.permissionService.permissions$,
      this.permissionService.sidebarSections$,
      this.permissionService.isAdminUser$,
      this.permissionService.isLoaded$
    ]).subscribe(() => this.buildFilteredMenu());
  }

  ngOnDestroy(): void {
    this.permSub?.unsubscribe();
  }

  private buildFilteredMenu(): void {
    const isAdmin = this.permissionService.isAdminUser$.getValue();
    const isLoaded = this.permissionService.isLoaded$.getValue();
    const sectionMeta = this.permissionService.sidebarSections$.getValue();

    const result: MenuItem[] = [];
    for (const group of this.menuItems) {
      const resolvedLabel = group.id && sectionMeta[group.id]?.title
        ? sectionMeta[group.id].title
        : group.label;

      const sectionGranted = !!group.sectionId && this.permissionService.canAccess(group.sectionId);
      const visibleChildren = (group.children ?? []).filter(item =>
        this.isItemVisible(item, isAdmin, isLoaded, sectionGranted)
      );
      if (visibleChildren.length > 0) {
        result.push({ ...group, label: resolvedLabel, children: visibleChildren });
      }
    }
    this.filteredMenuItems = result;
  }

  private isItemVisible(item: MenuItem, isAdmin: boolean, isLoaded: boolean, sectionGranted: boolean): boolean {
    // Always-visible items (e.g. Dashboard) show immediately regardless of load state
    if (item.alwaysVisible) return true;

    // While permissions are still loading, hide everything except alwaysVisible
    if (!isLoaded) return false;

    // Admin-only items (e.g. Role Management) are invisible to non-admins
    if (item.adminOnly && !isAdmin) return false;

    // Admin/manager bypass — show all including coming-soon items
    if (isAdmin) return true;

    // Disabled (coming-soon) items are only shown to admins
    if (item.disabled) return false;

    // Section-level permission should expose all non-disabled children inside that section.
    if (sectionGranted) return true;

    // No permId → show for any authenticated non-admin user
    if (!item.permId) return true;

    return this.permissionService.canAccess(item.permId);
  }

  private menuItems: MenuItem[] = [
    {
      id: 'main',
      label: 'Main',
      icon: '',
      expanded: true,
      children: [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard/home', alwaysVisible: true }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '',
      expanded: false,
      sectionId: 'inventory',
      children: [
        { label: 'Products',           icon: 'products',    route: '/dashboard/products',                  permId: 'inv-products' },
        { label: 'Create Product',     icon: 'create',      route: '/dashboard/products/create',           permId: 'inv-prod-create' },
        { label: "Today's Deals",      icon: 'deals',       route: '/dashboard/products/todays-deals',     permId: 'inv-prod-deals' },
        { label: 'Expired Products',   icon: 'expired',     route: '/dashboard/products/expired',          permId: 'inv-prod-expired' },
        { label: 'Low Stocks',         icon: 'low-stock',   route: '/dashboard/products/low-stocks',       permId: 'inv-prod-lowstock' },
        { label: 'Category',           icon: 'category',    route: '/dashboard/categories',                permId: 'inv-categories' },
        { label: 'Sub Category',       icon: 'sub-category',route: '/dashboard/sub-categories',            permId: 'inv-subcategories' },
        { label: 'Brands',             icon: 'brands',      route: '/dashboard/brands',                    permId: 'inv-brands' },
        { label: 'Units',              icon: 'units',       route: '/dashboard/units',                     permId: 'inv-units' },
        { label: 'Variant Attributes', icon: 'attributes',  route: '/dashboard/variant-attributes',        permId: 'inv-attributes' },
        { label: 'Print Barcode',      icon: 'barcode',     route: '/dashboard/print-barcode',             permId: 'inv-barcode' },
        { label: 'Print QR Code',      icon: 'qrcode',      route: '/dashboard/qrcode',                    disabled: true }
      ]
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: '',
      expanded: false,
      sectionId: 'stock',
      children: [
        { label: 'Manage Stock',    icon: 'stock',      route: '/dashboard/stock/manage',     permId: 'stock-manage' },
        { label: 'Stock Adjustment',icon: 'adjustment', route: '/dashboard/stock/adjustment', permId: 'stock-adjustment' },
        { label: 'Stock Transfer',  icon: 'transfer',   route: '/dashboard/stock/transfer',   permId: 'stock-transfer' }
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: '',
      expanded: false,
      sectionId: 'sales',
      children: [
        { label: 'Sales',        icon: 'sales',     route: '/dashboard/sales',         permId: 'sales-list' },
        { label: 'Invoices',     icon: 'invoice',   route: '/dashboard/invoices',      permId: 'sales-invoices' },
        { label: 'Sales Return', icon: 'return',    route: '/dashboard/sales-return',  permId: 'sales-return' },
        { label: 'Quotation',    icon: 'quotation', route: '/dashboard/quotation',     disabled: true },
        { label: 'POS',          icon: 'pos',       route: '/dashboard/pos',           disabled: true }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '',
      expanded: false,
      sectionId: 'orders',
      children: [
        { label: 'User Orders', icon: 'order', route: '/dashboard/user-orders', permId: 'orders-user' }
      ]
    },
    {
      id: 'promo',
      label: 'Promo',
      icon: '',
      expanded: false,
      sectionId: 'promo',
      children: [
        { label: 'Banners', icon: 'banner', route: '/dashboard/banners', permId: 'promo-banners' },
        { label: 'Coupons', icon: 'coupon', route: '/dashboard/coupons', disabled: true }
      ]
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: '',
      expanded: false,
      sectionId: 'purchases',
      children: [
        { label: 'Purchases',       icon: 'purchase', route: '/dashboard/purchases',         permId: 'purchases-list' },
        { label: 'Purchase Order',  icon: 'order',    route: '/dashboard/purchases/orders',  permId: 'purchases-orders' },
        { label: 'Purchase Return', icon: 'return',   route: '/dashboard/purchases/returns', permId: 'purchases-return' }
      ]
    },
    {
      id: 'finance',
      label: 'Finance & Accounts',
      icon: '',
      expanded: false,
      children: [
        { label: 'Expenses',         icon: 'expense',   route: '/dashboard/expenses',          disabled: true },
        { label: 'Income',           icon: 'income',    route: '/dashboard/income',            disabled: true },
        { label: 'Bank Accounts',    icon: 'bank',      route: '/dashboard/bank-accounts',     disabled: true },
        { label: 'Money Transfer',   icon: 'transfer',  route: '/dashboard/money-transfer',    disabled: true },
        { label: 'Balance Sheet',    icon: 'balance',   route: '/dashboard/balance-sheet',     disabled: true },
        { label: 'Trial Balance',    icon: 'trial',     route: '/dashboard/trial-balance',     disabled: true },
        { label: 'Cash Flow',        icon: 'cashflow',  route: '/dashboard/cash-flow',         disabled: true },
        { label: 'Account Statement',icon: 'statement', route: '/dashboard/account-statement', disabled: true }
      ]
    },
    {
      id: 'peoples',
      label: 'Peoples',
      icon: '',
      expanded: false,
      sectionId: 'peoples',
      children: [
        { label: 'Customers',   icon: 'customers', route: '/dashboard/customers',   permId: 'peoples-customers' },
        { label: 'Billers',     icon: 'billers',   route: '/dashboard/billers',     permId: 'peoples-billers' },
        { label: 'Suppliers',   icon: 'suppliers', route: '/dashboard/suppliers',   permId: 'peoples-suppliers' },
        { label: 'Stores',      icon: 'stores',    route: '/dashboard/stores',      permId: 'peoples-stores' },
        { label: 'Warehouses',  icon: 'warehouse', route: '/dashboard/warehouses',  permId: 'peoples-warehouses' }
      ]
    },
    {
      id: 'hrm',
      label: 'HRM',
      icon: '',
      expanded: false,
      children: [
        { label: 'Employees',   icon: 'employees',   route: '/dashboard/employees',   disabled: true },
        { label: 'Departments', icon: 'departments', route: '/dashboard/departments', disabled: true },
        { label: 'Designation', icon: 'designation', route: '/dashboard/designations',disabled: true }
      ]
    },
    {
      id: 'role-management',
      label: 'Role Management',
      icon: '',
      expanded: false,
      children: [
        { label: 'User Access', icon: 'access', route: '/dashboard/role-management', adminOnly: true }
      ]
    },
    {
      id: 'b2b-management',
      label: 'B2B Management',
      icon: '',
      expanded: false,
      sectionId: 'b2b-management',
      children: [
        { label: 'B2B Overview',            icon: 'b2b',          route: '/dashboard/b2b-management',                          permId: 'b2b-overview' },
        { label: 'Setup Wizard',            icon: 'wizard',       route: '/dashboard/b2b-management/step-form',                permId: 'b2b-wizard' },
        { label: 'B2B Categories',          icon: 'category',     route: '/dashboard/b2b-management/categories',               permId: 'b2b-categories' },
        { label: 'B2B Subcategories',       icon: 'sub-category', route: '/dashboard/b2b-management/subcategories',            permId: 'b2b-subcategories' },
        { label: 'Sub-Sub Categories',      icon: 'sub-sub',      route: '/dashboard/b2b-management/subsubcategories',         permId: 'b2b-subsubcategories' },
        { label: 'B2B Inventory',           icon: 'products',     route: '/dashboard/b2b-management/products',                 permId: 'b2b-products' },
        { label: 'Add B2B Product',         icon: 'create',       route: '/dashboard/b2b-management/products/add',             permId: 'b2b-prod-add' },
        { label: 'Bulk Product + Vendors',  icon: 'multi-vendor', route: '/dashboard/b2b-management/products/bulk-multi-vendor',permId: 'b2b-prod-multivendor' },
        { label: 'B2B Vendors',             icon: 'suppliers',    route: '/dashboard/b2b-management/vendors',                  permId: 'b2b-vendors' }
      ]
    }
  ];

  private safeIcons: { [key: string]: SafeHtml } = {};

  private icons: { [key: string]: string } = {
    dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    access: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="23 11 17 17 14 14"/></svg>',
    b2b: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    wizard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    bulk: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    'sub-sub': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="8" height="5" rx="1"/><rect x="8" y="10" width="8" height="5" rx="1"/><rect x="14" y="17" width="8" height="4" rx="1"/><line x1="6" y1="8" x2="6" y2="12"/><line x1="12" y1="15" x2="12" y2="19"/></svg>',
    'bulk-ssc': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/><line x1="5" y1="18" x2="9" y2="18"/><line x1="5" y1="15" x2="7" y2="15"/></svg>',
    admin: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    products: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
    create: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    expired: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'low-stock': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    category: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'sub-category': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    brands: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    units: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M12 12H3"/><path d="M16 16h6"/><path d="M19 13v6"/></svg>',
    attributes: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m10-11l-5.2 3M7.2 15 2 18m18-6l-5.2-3M7.2 9 2 6"/></svg>',
    warranty: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    barcode: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>',
    deals: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/><path d="M12 7l5 5"/></svg>',
    qrcode: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>',
    stock: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    adjustment: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/></svg>',
    transfer: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    sales: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    invoice: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    return: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    quotation: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    pos: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    coupon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    banner: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    purchase: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    order: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    expense: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    income: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    bank: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>',
    balance: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    trial: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    cashflow: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    statement: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    customers: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    billers: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    suppliers: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    'multi-vendor': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><line x1="12" y1="22.08" x2="12" y2="12"/><circle cx="19" cy="19" r="3"/><line x1="17.5" y1="19" x2="20.5" y2="19"/><line x1="19" y1="17.5" x2="19" y2="20.5"/></svg>',
    stores: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    warehouse: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    employees: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    departments: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    designation: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  };

  toggleMenu(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
      this.saveAccordionState();
    }
  }

  private saveAccordionState(): void {
    const state: { [key: string]: boolean } = {};
    this.menuItems.forEach(group => {
      if (group.label) state[group.label] = group.expanded || false;
    });
    localStorage.setItem(this.ACCORDION_STATE_KEY, JSON.stringify(state));
  }

  private loadAccordionState(): void {
    try {
      const saved = localStorage.getItem(this.ACCORDION_STATE_KEY);
      if (saved) {
        const state: { [key: string]: boolean } = JSON.parse(saved);
        this.menuItems.forEach(group => {
          if (group.label && Object.prototype.hasOwnProperty.call(state, group.label)) {
            group.expanded = state[group.label];
          }
        });
      }
    } catch { /* ignore */ }
  }

  getIcon(iconName: string): SafeHtml {
    return this.safeIcons[iconName] || this.safeIcons['dashboard'];
  }
}
