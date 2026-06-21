import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PermissionCta {
  id: string;
  label: string;
  type: 'cta' | 'nested';
  checked: boolean;
}

export interface PermissionPage {
  id: string;
  label: string;
  route: string;
  checked: boolean;
  indeterminate: boolean;
  expanded: boolean;
  ctas: PermissionCta[];
}

export interface PermissionSection {
  id: string;
  label: string;
  icon: string;
  color: string;
  checked: boolean;
  indeterminate: boolean;
  expanded: boolean;
  pages: PermissionPage[];
}

export interface AccessUser {
  id: string;
  fullName: string;
  email: string;
  role: 'superadmin' | 'admin' | 'vendor' | 'enduser';
  isActive: boolean;
  lastActive?: string;
  phone?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: AccessUser['role'];
  password: string;
  phone?: string;
}

interface UserListApiResponse {
  success: boolean;
  message: string;
  data: {
    users: any[];
    pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number };
  };
}

interface SingleUserApiResponse {
  success: boolean;
  message: string;
  data: { user: any } | null;
}

interface PermissionsApiResponse {
  success: boolean;
  message: string;
  data: { [key: string]: boolean };
}


// ── Default Permission Tree ───────────────────────────────────────────────────

const DEFAULT_PERMISSION_TREE: PermissionSection[] = [
  {
    id: 'b2b-management', label: 'B2B Management', icon: '🏢', color: '#f97316',
    checked: false, indeterminate: false, expanded: true,
    pages: [
      { id: 'b2b-overview', label: 'B2B Overview', route: '/dashboard/b2b-management', checked: false, indeterminate: false, expanded: false,
        ctas: [{ id: 'b2b-overview-view', label: 'View Dashboard', type: 'cta', checked: false }] },
      { id: 'b2b-wizard', label: 'Setup Wizard', route: '/dashboard/b2b-management/step-form', checked: false, indeterminate: false, expanded: false,
        ctas: [{ id: 'b2b-wizard-use', label: 'Use Setup Wizard', type: 'cta', checked: false }] },
      { id: 'b2b-categories', label: 'B2B Categories', route: '/dashboard/b2b-management/categories', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'b2b-cat-view', label: 'View List', type: 'cta', checked: false },
          { id: 'b2b-cat-add', label: 'Add Category', type: 'cta', checked: false },
          { id: 'b2b-cat-edit', label: 'Edit Category', type: 'cta', checked: false },
          { id: 'b2b-cat-delete', label: 'Delete Category', type: 'cta', checked: false },
          { id: 'b2b-cat-bulk', label: 'Bulk Upload', type: 'nested', checked: false }
        ]},
      { id: 'b2b-subcategories', label: 'B2B Subcategories', route: '/dashboard/b2b-management/subcategories', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'b2b-subcat-view', label: 'View List', type: 'cta', checked: false },
          { id: 'b2b-subcat-add', label: 'Add Subcategory', type: 'cta', checked: false },
          { id: 'b2b-subcat-edit', label: 'Edit Subcategory', type: 'cta', checked: false },
          { id: 'b2b-subcat-delete', label: 'Delete Subcategory', type: 'cta', checked: false },
          { id: 'b2b-subcat-bulk', label: 'Bulk Upload', type: 'nested', checked: false }
        ]},
      { id: 'b2b-subsubcategories', label: 'Sub-Sub Categories', route: '/dashboard/b2b-management/subsubcategories', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'b2b-ssc-view', label: 'View List', type: 'cta', checked: false },
          { id: 'b2b-ssc-add', label: 'Add Sub-Sub Category', type: 'cta', checked: false },
          { id: 'b2b-ssc-edit', label: 'Edit Sub-Sub Category', type: 'cta', checked: false },
          { id: 'b2b-ssc-delete', label: 'Delete Sub-Sub Category', type: 'cta', checked: false },
          { id: 'b2b-ssc-bulk', label: 'Bulk Upload', type: 'nested', checked: false }
        ]},
      { id: 'b2b-products', label: 'B2B Products', route: '/dashboard/b2b-management/products', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'b2b-prod-view', label: 'View Inventory', type: 'cta', checked: false },
          { id: 'b2b-prod-add', label: 'Add Product', type: 'cta', checked: false },
          { id: 'b2b-prod-edit', label: 'Edit Product', type: 'cta', checked: false },
          { id: 'b2b-prod-delete', label: 'Delete Product', type: 'cta', checked: false },
          { id: 'b2b-prod-bulk', label: 'Bulk Upload Products', type: 'nested', checked: false },
          { id: 'b2b-prod-multivendor', label: 'Bulk Product + Multi-Vendor', type: 'nested', checked: false }
        ]},
      { id: 'b2b-vendors', label: 'B2B Vendors', route: '/dashboard/b2b-management/vendors', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'b2b-vendor-view', label: 'View Vendors', type: 'cta', checked: false },
          { id: 'b2b-vendor-add', label: 'Add Vendor', type: 'cta', checked: false },
          { id: 'b2b-vendor-edit', label: 'Edit Vendor', type: 'cta', checked: false },
          { id: 'b2b-vendor-delete', label: 'Delete Vendor', type: 'cta', checked: false },
          { id: 'b2b-vendor-bulk', label: 'Bulk Upload Vendors', type: 'nested', checked: false }
        ]}
    ]
  },
  {
    id: 'inventory', label: 'Inventory', icon: '📦', color: '#3b82f6',
    checked: false, indeterminate: false, expanded: false,
    pages: [
      { id: 'inv-products', label: 'Products', route: '/dashboard/products', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'inv-prod-view', label: 'View Products', type: 'cta', checked: false },
          { id: 'inv-prod-create', label: 'Create Product', type: 'nested', checked: false },
          { id: 'inv-prod-edit', label: 'Edit Product', type: 'cta', checked: false },
          { id: 'inv-prod-delete', label: 'Delete Product', type: 'cta', checked: false },
          { id: 'inv-prod-bulk', label: 'Bulk Upload', type: 'nested', checked: false },
          { id: 'inv-prod-deals', label: "Today's Deals", type: 'nested', checked: false },
          { id: 'inv-prod-expired', label: 'Expired Products', type: 'nested', checked: false },
          { id: 'inv-prod-lowstock', label: 'Low Stocks', type: 'nested', checked: false }
        ]},
      { id: 'inv-categories', label: 'Categories', route: '/dashboard/categories', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'inv-cat-view', label: 'View Categories', type: 'cta', checked: false },
          { id: 'inv-cat-add', label: 'Add Category', type: 'nested', checked: false },
          { id: 'inv-cat-edit', label: 'Edit Category', type: 'cta', checked: false },
          { id: 'inv-cat-delete', label: 'Delete Category', type: 'cta', checked: false }
        ]},
      { id: 'inv-subcategories', label: 'Sub Categories', route: '/dashboard/sub-categories', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'inv-subcat-view', label: 'View Sub Categories', type: 'cta', checked: false },
          { id: 'inv-subcat-add', label: 'Add Sub Category', type: 'nested', checked: false },
          { id: 'inv-subcat-edit', label: 'Edit Sub Category', type: 'cta', checked: false },
          { id: 'inv-subcat-delete', label: 'Delete Sub Category', type: 'cta', checked: false }
        ]},
      { id: 'inv-brands', label: 'Brands', route: '/dashboard/brands', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'inv-brand-view', label: 'View Brands', type: 'cta', checked: false },
          { id: 'inv-brand-add', label: 'Add Brand', type: 'nested', checked: false },
          { id: 'inv-brand-delete', label: 'Delete Brand', type: 'cta', checked: false }
        ]},
      { id: 'inv-units', label: 'Units', route: '/dashboard/units', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'inv-unit-view', label: 'View Units', type: 'cta', checked: false },
          { id: 'inv-unit-add', label: 'Add Unit', type: 'nested', checked: false },
          { id: 'inv-unit-delete', label: 'Delete Unit', type: 'cta', checked: false }
        ]},
      { id: 'inv-attributes', label: 'Variant Attributes', route: '/dashboard/variant-attributes', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'inv-attr-view', label: 'View Attributes', type: 'cta', checked: false },
          { id: 'inv-attr-manage', label: 'Manage Attributes', type: 'cta', checked: false }
        ]},
      { id: 'inv-barcode', label: 'Print Barcode', route: '/dashboard/print-barcode', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'inv-barcode-view', label: 'View Barcodes', type: 'cta', checked: false },
          { id: 'inv-barcode-add', label: 'Add Barcode', type: 'nested', checked: false },
          { id: 'inv-barcode-print', label: 'Print Barcode', type: 'cta', checked: false }
        ]}
    ]
  },
  {
    id: 'stock', label: 'Stock', icon: '📊', color: '#10b981',
    checked: false, indeterminate: false, expanded: false,
    pages: [
      { id: 'stock-manage', label: 'Manage Stock', route: '/dashboard/stock/manage', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'stock-manage-view', label: 'View Stock', type: 'cta', checked: false },
          { id: 'stock-manage-update', label: 'Update Stock', type: 'cta', checked: false }
        ]},
      { id: 'stock-adjustment', label: 'Stock Adjustment', route: '/dashboard/stock/adjustment', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'stock-adj-view', label: 'View Adjustments', type: 'cta', checked: false },
          { id: 'stock-adj-create', label: 'Create Adjustment', type: 'cta', checked: false }
        ]},
      { id: 'stock-transfer', label: 'Stock Transfer', route: '/dashboard/stock/transfer', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'stock-trans-view', label: 'View Transfers', type: 'cta', checked: false },
          { id: 'stock-trans-create', label: 'Create Transfer', type: 'cta', checked: false }
        ]}
    ]
  },
  {
    id: 'sales', label: 'Sales', icon: '💰', color: '#f59e0b',
    checked: false, indeterminate: false, expanded: false,
    pages: [
      { id: 'sales-list', label: 'Sales', route: '/dashboard/sales', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'sales-view', label: 'View Sales', type: 'cta', checked: false },
          { id: 'sales-create', label: 'Create Sale', type: 'cta', checked: false },
          { id: 'sales-delete', label: 'Delete Sale', type: 'cta', checked: false }
        ]},
      { id: 'sales-invoices', label: 'Invoices', route: '/dashboard/invoices', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'sales-inv-view', label: 'View Invoices', type: 'cta', checked: false },
          { id: 'sales-inv-detail', label: 'View Invoice Detail', type: 'nested', checked: false },
          { id: 'sales-inv-print', label: 'Print Invoice', type: 'cta', checked: false }
        ]},
      { id: 'sales-return', label: 'Sales Return', route: '/dashboard/sales-return', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'sales-ret-view', label: 'View Returns', type: 'cta', checked: false },
          { id: 'sales-ret-create', label: 'Create Return', type: 'nested', checked: false },
          { id: 'sales-ret-edit', label: 'Edit Return', type: 'nested', checked: false },
          { id: 'sales-ret-delete', label: 'Delete Return', type: 'cta', checked: false }
        ]}
    ]
  },
  {
    id: 'orders', label: 'Orders', icon: '📋', color: '#8b5cf6',
    checked: false, indeterminate: false, expanded: false,
    pages: [
      { id: 'orders-user', label: 'User Orders', route: '/dashboard/user-orders', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'orders-view', label: 'View Orders', type: 'cta', checked: false },
          { id: 'orders-update-status', label: 'Update Order Status', type: 'cta', checked: false }
        ]}
    ]
  },
  {
    id: 'promo', label: 'Promo', icon: '🎯', color: '#ec4899',
    checked: false, indeterminate: false, expanded: false,
    pages: [
      { id: 'promo-banners', label: 'Banners', route: '/dashboard/banners', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'promo-ban-view', label: 'View Banners', type: 'cta', checked: false },
          { id: 'promo-ban-add', label: 'Add Banner', type: 'cta', checked: false },
          { id: 'promo-ban-edit', label: 'Edit Banner', type: 'cta', checked: false },
          { id: 'promo-ban-delete', label: 'Delete Banner', type: 'cta', checked: false }
        ]}
    ]
  },
  {
    id: 'purchases', label: 'Purchases', icon: '🛒', color: '#14b8a6',
    checked: false, indeterminate: false, expanded: false,
    pages: [
      { id: 'purchases-list', label: 'Purchases', route: '/dashboard/purchases', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'pur-view', label: 'View Purchases', type: 'cta', checked: false },
          { id: 'pur-create', label: 'Create Purchase', type: 'cta', checked: false },
          { id: 'pur-delete', label: 'Delete Purchase', type: 'cta', checked: false }
        ]},
      { id: 'purchases-orders', label: 'Purchase Orders', route: '/dashboard/purchases/orders', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'pur-ord-view', label: 'View Purchase Orders', type: 'cta', checked: false },
          { id: 'pur-ord-create', label: 'Create Purchase Order', type: 'cta', checked: false }
        ]},
      { id: 'purchases-return', label: 'Purchase Return', route: '/dashboard/purchases/returns', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'pur-ret-view', label: 'View Returns', type: 'cta', checked: false },
          { id: 'pur-ret-create', label: 'Create Return', type: 'cta', checked: false }
        ]}
    ]
  },
  {
    id: 'peoples', label: 'Peoples', icon: '👥', color: '#6366f1',
    checked: false, indeterminate: false, expanded: false,
    pages: [
      { id: 'peoples-customers', label: 'Customers', route: '/dashboard/customers', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'cust-view', label: 'View Customers', type: 'cta', checked: false },
          { id: 'cust-add', label: 'Add Customer', type: 'cta', checked: false },
          { id: 'cust-edit', label: 'Edit Customer', type: 'cta', checked: false },
          { id: 'cust-delete', label: 'Delete Customer', type: 'cta', checked: false }
        ]},
      { id: 'peoples-billers', label: 'Billers', route: '/dashboard/billers', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'bill-view', label: 'View Billers', type: 'cta', checked: false },
          { id: 'bill-add', label: 'Add Biller', type: 'cta', checked: false },
          { id: 'bill-edit', label: 'Edit Biller', type: 'cta', checked: false },
          { id: 'bill-delete', label: 'Delete Biller', type: 'cta', checked: false }
        ]},
      { id: 'peoples-suppliers', label: 'Suppliers', route: '/dashboard/suppliers', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'sup-view', label: 'View Suppliers', type: 'cta', checked: false },
          { id: 'sup-add', label: 'Add Supplier', type: 'cta', checked: false },
          { id: 'sup-edit', label: 'Edit Supplier', type: 'cta', checked: false },
          { id: 'sup-delete', label: 'Delete Supplier', type: 'cta', checked: false }
        ]},
      { id: 'peoples-stores', label: 'Stores', route: '/dashboard/stores', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'store-view', label: 'View Stores', type: 'cta', checked: false },
          { id: 'store-add', label: 'Add Store', type: 'nested', checked: false },
          { id: 'store-edit', label: 'Edit Store', type: 'cta', checked: false },
          { id: 'store-delete', label: 'Delete Store', type: 'cta', checked: false }
        ]},
      { id: 'peoples-warehouses', label: 'Warehouses', route: '/dashboard/warehouses', checked: false, indeterminate: false, expanded: false,
        ctas: [
          { id: 'wh-view', label: 'View Warehouses', type: 'cta', checked: false },
          { id: 'wh-add', label: 'Add Warehouse', type: 'nested', checked: false },
          { id: 'wh-edit', label: 'Edit Warehouse', type: 'cta', checked: false },
          { id: 'wh-delete', label: 'Delete Warehouse', type: 'cta', checked: false }
        ]}
    ]
  }
];

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UserAccessService {

  private readonly apiUrl        = `${environment.apiUrl}/users`;
  private readonly STORAGE_KEY   = 'user-access-permissions';

  private usersCache$ = new BehaviorSubject<AccessUser[]>([]);   // empty until real API responds

  constructor(private http: HttpClient) {}

  // ── USER LIST ──────────────────────────────────────────────────────────────

  fetchUsers(search?: string, page = 1): Observable<AccessUser[]> {
    let params = new HttpParams().set('page', page).set('limit', 50);
    if (search) params = params.set('search', search);

    return this.http.get<UserListApiResponse>(this.apiUrl, { params }).pipe(
      map(res => (res.data?.users ?? []).map(u => this.normalize(u))),
      tap(users => this.usersCache$.next(users)),
      catchError(() => of([]))
    );
  }

  get users(): AccessUser[] { return this.usersCache$.getValue(); }

  getUserById(id: string): AccessUser | undefined {
    return this.usersCache$.getValue().find(u => u.id === id);
  }

  // ── CREATE USER (one at a time) ────────────────────────────────────────────

  createUser(payload: CreateUserPayload): Observable<AccessUser> {
    return this.http.post<SingleUserApiResponse>(this.apiUrl, payload).pipe(
      map(res => {
        const user = this.normalize(res.data?.user ?? payload);
        this.usersCache$.next([...this.usersCache$.getValue(), user]);
        return user;
      }),
      catchError(() => {
        // Optimistic local create when API is down
        const user: AccessUser = {
          id: `local-${Date.now()}`,
          fullName: `${payload.firstName} ${payload.lastName}`.trim(),
          email: payload.email,
          role: payload.role,
          isActive: true,
          lastActive: new Date().toISOString().slice(0, 10),
          phone: payload.phone
        };
        this.usersCache$.next([...this.usersCache$.getValue(), user]);
        return of(user);
      })
    );
  }

  // ── TOGGLE STATUS ──────────────────────────────────────────────────────────

  toggleUserStatus(id: string): Observable<boolean> {
    const user = this.getUserById(id);
    const next = !(user?.isActive ?? true);

    return this.http.patch<any>(`${this.apiUrl}/${id}`, { isActive: next }).pipe(
      map(() => next),
      catchError(() => of(next)),
      tap(() => {
        const updated = this.usersCache$.getValue().map(u =>
          u.id === id ? { ...u, isActive: next } : u
        );
        this.usersCache$.next(updated);
      })
    );
  }

  // ── DELETE USER ────────────────────────────────────────────────────────────

  deleteUser(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined as void),
      catchError(() => of(undefined as void)),
      tap(() => {
        this.usersCache$.next(this.usersCache$.getValue().filter(u => u.id !== id));
      })
    );
  }

  // ── CHANGE ROLE ───────────────────────────────────────────────────────────

  changeUserRole(id: string, role: AccessUser['role']): Observable<AccessUser> {
    return this.http.patch<SingleUserApiResponse>(`${this.apiUrl}/${id}`, { role }).pipe(
      map(res => this.normalize(res.data?.user ?? { role })),
      catchError(() => of({ ...this.getUserById(id)!, role })),
      tap(() => {
        const updated = this.usersCache$.getValue().map(u =>
          u.id === id ? { ...u, role } : u
        );
        this.usersCache$.next(updated);
      })
    );
  }

  // ── PERMISSIONS ────────────────────────────────────────────────────────────

  getPermissionTree(): PermissionSection[] {
    return JSON.parse(JSON.stringify(DEFAULT_PERMISSION_TREE));
  }

  getUserPermissions(userId: string): { [key: string]: boolean } {
    try {
      const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      return all[userId] || {};
    } catch { return {}; }
  }

  fetchUserPermissions(userId: string): Observable<{ [key: string]: boolean }> {
    return this.http
      .get<PermissionsApiResponse>(`${this.apiUrl}/${userId}/permissions`)
      .pipe(
        map(res => {
          const perms = res?.data ?? {};
          this.persistUserPermissions(userId, perms);
          return perms;
        }),
        catchError(() => of(this.getUserPermissions(userId)))
      );
  }

  saveUserPermissions(userId: string, tree: PermissionSection[]): void {
    const flat = this.flattenPermissions(tree);
    this.persistUserPermissions(userId, flat);
  }

  saveUserPermissionsRemote(userId: string, tree: PermissionSection[]): Observable<{ [key: string]: boolean }> {
    const flat = this.flattenPermissions(tree);

    return this.http
      .put<PermissionsApiResponse>(`${this.apiUrl}/${userId}/permissions`, { permissions: flat })
      .pipe(
        map(res => {
          const saved = res?.data ?? flat;
          this.persistUserPermissions(userId, saved);
          return saved;
        }),
        catchError(() => {
          // Keep local persistence as a fallback when API save fails.
          this.persistUserPermissions(userId, flat);
          return of(flat);
        })
      );
  }

  private flattenPermissions(tree: PermissionSection[]): { [key: string]: boolean } {
    const flat: { [key: string]: boolean } = {};
    tree.forEach(s => {
      flat[s.id] = s.checked;
      s.pages.forEach(p => {
        flat[p.id] = p.checked;
        p.ctas.forEach(c => { flat[c.id] = c.checked; });
      });
    });
    return flat;
  }

  private persistUserPermissions(userId: string, flat: { [key: string]: boolean }): void {
    try {
      const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      all[userId] = flat;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  }

  applyPermissionsToTree(tree: PermissionSection[], perms: { [key: string]: boolean }): void {
    tree.forEach(section => {
      const sectionGranted = perms[section.id] === true;

      section.pages.forEach(page => {
        const pageGranted = sectionGranted || perms[page.id] === true;
        if (pageGranted) {
          page.ctas.forEach(cta => { cta.checked = true; });
        } else {
          page.ctas.forEach(cta => {
            if (perms[cta.id] !== undefined) cta.checked = perms[cta.id];
          });
        }

        const n = page.ctas.length;
        const c = page.ctas.filter(x => x.checked).length;
        page.checked = n > 0 && c === n;
        page.indeterminate = c > 0 && c < n;
      });
      const fully = section.pages.filter(p => p.checked && !p.indeterminate).length;
      const any   = section.pages.filter(p => p.checked || p.indeterminate).length;
      section.checked = fully === section.pages.length && section.pages.length > 0;
      section.indeterminate = any > 0 && fully < section.pages.length;
    });
  }

  getPermissionStats(userId: string): { granted: number; total: number; sections: number } {
    const perms = this.getUserPermissions(userId);
    const tree  = this.getPermissionTree();
    let granted = 0, total = 0, sections = 0;
    tree.forEach(s => {
      let any = false;
      s.pages.forEach(p => p.ctas.forEach(c => {
        total++;
        if (perms[c.id]) { granted++; any = true; }
      }));
      if (any) sections++;
    });
    return { granted, total, sections };
  }

  getTotalCtaCount(): number {
    let c = 0;
    this.getPermissionTree().forEach(s => s.pages.forEach(p => { c += p.ctas.length; }));
    return c;
  }

  // ── Helper ────────────────────────────────────────────────────────────────

  private normalize(u: any): AccessUser {
    const fullName = u.fullName?.trim()
      || [u.firstName, u.lastName].filter(Boolean).join(' ')
      || u.name
      || '';

    // Map legacy roles stored in DB to current role set
    const ROLE_MAP: Record<string, AccessUser['role']> = {
      customer: 'enduser',
      staff:    'vendor',
      manager:  'admin',
    };
    const rawRole: string = u.role ?? 'enduser';
    const role = (ROLE_MAP[rawRole] ?? rawRole) as AccessUser['role'];

    return {
      id:         String(u._id ?? u.id ?? Date.now()),
      fullName,
      email:      u.email  ?? '',
      role,
      isActive:   u.isActive ?? true,
      lastActive: u.lastLogin ? new Date(u.lastLogin).toISOString().slice(0, 10)
                : u.updatedAt ? new Date(u.updatedAt).toISOString().slice(0, 10)
                : undefined,
      phone:      u.phone ?? undefined
    };
  }
}
