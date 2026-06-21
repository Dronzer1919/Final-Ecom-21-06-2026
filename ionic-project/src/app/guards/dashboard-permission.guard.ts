import { inject } from '@angular/core';
import { CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { filter, map, Observable, of, take } from 'rxjs';
import { PermissionService } from '../services/permission.service';

interface RouteRule {
  prefix: string;
  permId: string;
  adminOnly?: boolean;
}

const ROUTE_PERMISSION_RULES: RouteRule[] = [
  { prefix: '/dashboard/role-management', permId: '__admin__', adminOnly: true },

  { prefix: '/dashboard/products/create', permId: 'inv-prod-create' },
  { prefix: '/dashboard/products/todays-deals', permId: 'inv-prod-deals' },
  { prefix: '/dashboard/products/expired', permId: 'inv-prod-expired' },
  { prefix: '/dashboard/products/low-stocks', permId: 'inv-prod-lowstock' },
  { prefix: '/dashboard/products', permId: 'inv-products' },

  { prefix: '/dashboard/category', permId: 'inv-categories' },
  { prefix: '/dashboard/categories', permId: 'inv-categories' },
  { prefix: '/dashboard/sub-category', permId: 'inv-subcategories' },
  { prefix: '/dashboard/sub-categories', permId: 'inv-subcategories' },
  { prefix: '/dashboard/brands', permId: 'inv-brands' },
  { prefix: '/dashboard/units', permId: 'inv-units' },
  { prefix: '/dashboard/variant-attributes', permId: 'inv-attributes' },
  { prefix: '/dashboard/barcode', permId: 'inv-barcode' },
  { prefix: '/dashboard/print-barcode', permId: 'inv-barcode' },

  { prefix: '/dashboard/stock/manage', permId: 'stock-manage' },
  { prefix: '/dashboard/stock/adjustment', permId: 'stock-adjustment' },
  { prefix: '/dashboard/stock/transfer', permId: 'stock-transfer' },

  { prefix: '/dashboard/invoices', permId: 'sales-invoices' },
  { prefix: '/dashboard/sales-return', permId: 'sales-return' },
  { prefix: '/dashboard/sales', permId: 'sales-list' },

  { prefix: '/dashboard/user-orders', permId: 'orders-user' },
  { prefix: '/dashboard/banners', permId: 'promo-banners' },

  { prefix: '/dashboard/purchases/orders', permId: 'purchases-orders' },
  { prefix: '/dashboard/purchases/returns', permId: 'purchases-return' },
  { prefix: '/dashboard/purchases', permId: 'purchases-list' },

  { prefix: '/dashboard/customers', permId: 'peoples-customers' },
  { prefix: '/dashboard/billers', permId: 'peoples-billers' },
  { prefix: '/dashboard/suppliers', permId: 'peoples-suppliers' },
  { prefix: '/dashboard/stores', permId: 'peoples-stores' },
  { prefix: '/dashboard/warehouses', permId: 'peoples-warehouses' },

  { prefix: '/dashboard/b2b-management/step-form', permId: 'b2b-wizard' },
  { prefix: '/dashboard/b2b-management/categories', permId: 'b2b-categories' },
  { prefix: '/dashboard/b2b-management/subcategories', permId: 'b2b-subcategories' },
  { prefix: '/dashboard/b2b-management/subsubcategories', permId: 'b2b-subsubcategories' },
  { prefix: '/dashboard/b2b-management/products/add', permId: 'b2b-prod-add' },
  { prefix: '/dashboard/b2b-management/products/bulk-multi-vendor', permId: 'b2b-prod-multivendor' },
  { prefix: '/dashboard/b2b-management/products', permId: 'b2b-products' },
  { prefix: '/dashboard/b2b-management/vendors', permId: 'b2b-vendors' },
  { prefix: '/dashboard/b2b-management', permId: 'b2b-overview' }
].sort((a, b) => b.prefix.length - a.prefix.length);

export const dashboardPermissionGuard: CanActivateChildFn = (_, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const cleanUrl = state.url.split('?')[0].toLowerCase();
  const rule = ROUTE_PERMISSION_RULES.find(r => cleanUrl.startsWith(r.prefix));

  if (!rule) return true;

  const evaluate = (): boolean | UrlTree => {
    if (rule.adminOnly) {
      return permissionService.isAdminUser$.getValue()
        ? true
        : router.createUrlTree(['/dashboard/home']);
    }

    return permissionService.canAccess(rule.permId)
      ? true
      : router.createUrlTree(['/dashboard/home']);
  };

  if (permissionService.isLoaded$.getValue()) {
    return evaluate();
  }

  return permissionService.isLoaded$.pipe(
    filter(Boolean),
    take(1),
    map(() => evaluate())
  ) as Observable<boolean | UrlTree>;
};
