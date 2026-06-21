import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { dashboardPermissionGuard } from '../guards/dashboard-permission.guard';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ExpiredProductsComponent } from './pages/expired-products/expired-products.component';
import { LowStocksComponent } from './pages/low-stocks/low-stocks.component';
import { CreateProductComponent } from './pages/create-product/create-product.component';
import { BulkProductComponent } from './pages/bulk-product/bulk-product.component';
import { CategoryComponent } from './pages/category/category.component';
import { SubCategoryComponent } from './pages/sub-category/sub-category.component';
import { BrandsComponent } from './pages/brands/brands.component';
import { WarrantiesComponent } from './pages/warranties/warranties.component';
import { PrintBarcodeComponent } from './pages/print-barcode/print-barcode.component';
import { UnitsComponent } from './pages/units/units.component';
import { VariantAttributesComponent } from './pages/variant-attributes/variant-attributes.component';
import { WarehousesComponent } from './pages/warehouses/warehouses.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { BillersComponent } from './pages/billers/billers.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { StoresComponent } from './pages/stores/stores.component';

// Import Add/Create components
import { AddStoreComponent } from './pages/stores/add-store/add-store.component';
import { AddWarehouseComponent } from './pages/warehouses/add-warehouse/add-warehouse.component';
import { AddCategoryComponent } from './pages/category/add-category/add-category.component';
import { AddSubcategoryComponent } from './pages/sub-category/add-subcategory/add-subcategory.component';
import { AddBrandComponent } from './pages/brands/add-brand/add-brand.component';
import { AddUnitComponent } from './pages/units/add-unit/add-unit.component';
import { AddBarcodeComponent } from './pages/add-barcode/add-barcode.component';
import { DecryptPayloadComponent } from './pages/decrypt-payload/decrypt-payload.component';
import { TodaysDealsComponent } from './pages/todays-deals/todays-deals.component';
import { BannerManagementComponent } from './pages/banner-management/banner-management.component';

// Import Sales components
import { SalesComponent } from './pages/sales/sales.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { InvoiceDetailComponent } from './pages/invoices/invoice-detail/invoice-detail.component';
import { SalesReturnComponent } from './pages/sales-return/sales-return.component';
import { SalesReturnFormComponent } from './pages/sales-return/sales-return-form/sales-return-form.component';

// Import Stock components
import { ManageStockComponent } from './pages/stock/manage-stock/manage-stock.component';
import { StockAdjustmentComponent } from './pages/stock/stock-adjustment/stock-adjustment.component';
import { StockTransferComponent } from './pages/stock/stock-transfer/stock-transfer.component';

// Import Purchases components
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { PurchaseOrdersComponent } from './pages/purchase-orders/purchase-orders.component';
import { PurchaseReturnComponent } from './pages/purchase-return/purchase-return.component';

// Import B2B components
import { B2bCategoriesComponent } from './pages/b2b-categories/b2b-categories.component';
import { B2bHomeComponent } from './pages/b2b-home/b2b-home.component';

// Import B2B Management components
import { B2BManagementComponent } from './pages/b2b-management/b2b-management.component';
import { B2BStepFormComponent } from './pages/b2b-management/b2b-step-form/b2b-step-form.component';
import { B2BCategoriesListComponent } from './pages/b2b-management/b2b-categories-list/b2b-categories-list.component';
import { B2BSubcategoriesListComponent } from './pages/b2b-management/b2b-subcategories-list/b2b-subcategories-list.component';
import { B2BProductsListComponent } from './pages/b2b-management/b2b-products-list/b2b-products-list.component';
import { B2BVendorsListComponent } from './pages/b2b-management/b2b-vendors-list/b2b-vendors-list.component';
import { B2BAddVendorComponent } from './pages/b2b-management/b2b-add-vendor/b2b-add-vendor.component';
import { B2BBulkCategoryComponent } from './pages/b2b-management/b2b-bulk-category/b2b-bulk-category.component';
import { B2BBulkSubcategoryComponent } from './pages/b2b-management/b2b-bulk-subcategory/b2b-bulk-subcategory.component';
import { B2BBulkSubSubCategoryComponent } from './pages/b2b-management/b2b-bulk-subsubcategory/b2b-bulk-subsubcategory.component';
import { B2BSubSubCategoriesListComponent } from './pages/b2b-management/b2b-subsubcategories-list/b2b-subsubcategories-list.component';
import { B2BEditSubSubCategoryComponent } from './pages/b2b-management/b2b-edit-subsubcategory/b2b-edit-subsubcategory.component';
import { B2BAddSubSubCategoryComponent } from './pages/b2b-management/b2b-add-subsubcategory/b2b-add-subsubcategory.component';
import { B2BQuickAddProductComponent } from './pages/b2b-management/b2b-quick-add-product/b2b-quick-add-product.component';
import { B2BBulkVendorComponent } from './pages/b2b-management/b2b-bulk-vendor/b2b-bulk-vendor.component';
import { B2BBulkProductComponent } from './pages/b2b-management/b2b-bulk-product/b2b-bulk-product.component';
import { B2BBulkProductMultiVendorComponent } from './pages/b2b-management/b2b-bulk-product-multi-vendor/b2b-bulk-product-multi-vendor.component';

// Import Role Management components
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { UserAccessEditComponent } from './pages/role-management/user-access-edit/user-access-edit.component';

// Import User Orders component
import { UserOrdersComponent } from './pages/user-orders/user-orders.component';

// Import POS component
import { PosComponent } from './pages/pos/pos.component';

// Import Profile component
import { ProfileComponent } from './pages/profile/profile.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivateChild: [dashboardPermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: DashboardHomeComponent,
        title: 'Dashboard - DreamsPOS'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'My Profile - DreamsPOS'
      },
      {
        path: 'products',
        component: ProductsComponent,
        title: 'Products - DreamsPOS'
      },
      {
        path: 'products/create',
        component: CreateProductComponent,
        title: 'Create Product - DreamsPOS'
      },
      {
        path: 'products/bulk-upload',
        component: BulkProductComponent,
        title: 'Bulk Product Upload - DreamsPOS'
      },
      {
        path: 'products/edit/:id',
        component: CreateProductComponent,
        title: 'Edit Product - DreamsPOS'
      },
      {
        path: 'products/expired',
        component: ExpiredProductsComponent,
        title: 'Expired Products - DreamsPOS'
      },
      {
        path: 'products/low-stocks',
        component: LowStocksComponent,
        title: 'Low Stocks - DreamsPOS'
      },
      {
        path: 'products/todays-deals',
        component: TodaysDealsComponent,
        title: 'Today\'s Deals - DreamsPOS'
      },
      {
        path: 'banners',
        component: BannerManagementComponent,
        title: 'Banner Management - DreamsPOS'
      },
      {
        path: 'categories',
        component: CategoryComponent,
        title: 'Categories - DreamsPOS'
      },
      {
        path: 'category/add',
        component: AddCategoryComponent,
        title: 'Add Category - DreamsPOS'
      },
      {
        path: 'category/edit/:id',
        component: AddCategoryComponent,
        title: 'Edit Category - DreamsPOS'
      },
      {
        path: 'sub-categories',
        component: SubCategoryComponent,
        title: 'Sub Categories - DreamsPOS'
      },
      {
        path: 'sub-category/add',
        component: AddSubcategoryComponent,
        title: 'Add Subcategory - DreamsPOS'
      },
      {
        path: 'sub-category/edit/:id',
        component: AddSubcategoryComponent,
        title: 'Edit Subcategory - DreamsPOS'
      },
      {
        path: 'brands',
        component: BrandsComponent,
        title: 'Brands - DreamsPOS'
      },
      {
        path: 'brands/add',
        component: AddBrandComponent,
        title: 'Add Brand - DreamsPOS'
      },
      {
        path: 'warranties',
        component: WarrantiesComponent,
        title: 'Warranties - DreamsPOS'
      },
      {
        path: 'print-barcode',
        component: PrintBarcodeComponent,
        title: 'Print Barcode - DreamsPOS'
      },
      {
        path: 'barcode/add',
        component: AddBarcodeComponent,
        title: 'Add Barcode - DreamsPOS'
      },
      {
        path: 'units',
        component: UnitsComponent,
        title: 'Units - DreamsPOS'
      },
      {
        path: 'units/add',
        component: AddUnitComponent,
        title: 'Add Unit - DreamsPOS'
      },
      {
        path: 'variant-attributes',
        component: VariantAttributesComponent,
        title: 'Variant Attributes - DreamsPOS'
      },
      {
        path: 'warehouses',
        component: WarehousesComponent,
        title: 'Warehouses - DreamsPOS'
      },
      {
        path: 'warehouses/add',
        component: AddWarehouseComponent,
        title: 'Add Warehouse - DreamsPOS'
      },
      {
        path: 'customers',
        component: CustomersComponent,
        title: 'Customers - DreamsPOS'
      },
      {
        path: 'billers',
        component: BillersComponent,
        title: 'Billers - DreamsPOS'
      },
      {
        path: 'suppliers',
        component: SuppliersComponent,
        title: 'Suppliers - DreamsPOS'
      },
      {
        path: 'stores',
        component: StoresComponent,
        title: 'Stores - DreamsPOS'
      },
      {
        path: 'stores/add',
        component: AddStoreComponent,
        title: 'Add Store - DreamsPOS'
      },
      {
        path: 'sales',
        component: SalesComponent,
        title: 'Sales - DreamsPOS'
      },
      {
        path: 'invoices',
        component: InvoicesComponent,
        title: 'Invoices - DreamsPOS'
      },
      {
        path: 'invoices/:id',
        component: InvoiceDetailComponent,
        title: 'Invoice'
      },
      {
        path: 'sales-return',
        component: SalesReturnComponent,
        title: 'Sales Return - DreamsPOS'
      },
      {
        path: 'sales-return/create',
        component: SalesReturnFormComponent,
        title: 'New Sales Return'
      },
      {
        path: 'sales-return/:id',
        component: SalesReturnFormComponent,
        title: 'Edit Sales Return'
      },
      {
        path: 'stock/manage',
        component: ManageStockComponent,
        title: 'Manage Stock - DreamsPOS'
      },
      {
        path: 'stock/adjustment',
        component: StockAdjustmentComponent,
        title: 'Stock Adjustment - DreamsPOS'
      },
      {
        path: 'stock/transfer',
        component: StockTransferComponent,
        title: 'Stock Transfer - DreamsPOS'
      },
      {
        path: 'purchases',
        component: PurchasesComponent,
        title: 'Purchases - DreamsPOS'
      },
      {
        path: 'purchases/orders',
        component: PurchaseOrdersComponent,
        title: 'Purchase Orders - DreamsPOS'
      },
      {
        path: 'purchases/returns',
        component: PurchaseReturnComponent,
        title: 'Purchase Return - DreamsPOS'
      },
      {
        path: 'decrypt-payload',
        component: DecryptPayloadComponent,
        title: 'Decrypt Payload - DreamsPOS'
      },
      {
        path: 'b2b-categories',
        component: B2bCategoriesComponent,
        title: 'B2B Categories - DreamsPOS'
      },
      {
        path: 'b2b',
        component: B2bHomeComponent,
        title: 'B2B Wholesale Marketplace - DreamsPOS'
      },
      {
        path: 'b2b/:productId',
        component: B2bHomeComponent,
        title: 'B2B Product Vendors - DreamsPOS'
      },
      {
        path: 'user-orders',
        component: UserOrdersComponent,
        title: 'User Orders - DreamsPOS'
      },
      {
        path: 'pos',
        component: PosComponent,
        title: 'POS - DreamsPOS'
      },

      // ── B2B Management ──────────────────────────────────────────
      {
        path: 'b2b-management',
        component: B2BManagementComponent,
        title: 'B2B Management - DreamsPOS'
      },
      {
        path: 'b2b-management/step-form',
        component: B2BStepFormComponent,
        title: 'B2B Setup Wizard - DreamsPOS'
      },
      {
        path: 'b2b-management/categories',
        component: B2BCategoriesListComponent,
        title: 'B2B Categories - DreamsPOS'
      },
      {
        path: 'b2b-management/categories/add',
        component: AddCategoryComponent,
        title: 'Add B2B Category - DreamsPOS'
      },
      {
        path: 'b2b-management/categories/edit/:id',
        component: AddCategoryComponent,
        title: 'Edit B2B Category - DreamsPOS'
      },
      {
        path: 'b2b-management/categories/bulk-upload',
        component: B2BBulkCategoryComponent,
        title: 'Bulk Upload Categories - DreamsPOS'
      },
      {
        path: 'b2b-management/subcategories',
        component: B2BSubcategoriesListComponent,
        title: 'B2B Subcategories - DreamsPOS'
      },
      {
        path: 'b2b-management/subcategories/add',
        component: AddSubcategoryComponent,
        title: 'Add B2B Subcategory - DreamsPOS'
      },
      {
        path: 'b2b-management/subcategories/edit/:id',
        component: AddSubcategoryComponent,
        title: 'Edit B2B Subcategory - DreamsPOS'
      },
      {
        path: 'b2b-management/subcategories/bulk-upload',
        component: B2BBulkSubcategoryComponent,
        title: 'Bulk Upload Subcategories - DreamsPOS'
      },
      {
        path: 'b2b-management/subsubcategories',
        component: B2BSubSubCategoriesListComponent,
        title: 'B2B Sub-Sub Categories - DreamsPOS'
      },
      {
        path: 'b2b-management/subsubcategories/add',
        component: B2BAddSubSubCategoryComponent,
        title: 'Add Sub-Sub Category - DreamsPOS'
      },
      {
        path: 'b2b-management/subsubcategories/bulk-upload',
        component: B2BBulkSubSubCategoryComponent,
        title: 'Bulk Upload Sub-Sub Categories - DreamsPOS'
      },
      {
        path: 'b2b-management/subsubcategories/edit/:id',
        component: B2BEditSubSubCategoryComponent,
        title: 'Edit Sub-Sub Category - DreamsPOS'
      },
      {
        path: 'b2b-management/products',
        component: B2BProductsListComponent,
        title: 'B2B Inventory - DreamsPOS'
      },
      {
        path: 'b2b-management/products/add',
        component: B2BQuickAddProductComponent,
        title: 'Add B2B Product - DreamsPOS'
      },
      {
        path: 'b2b-management/products/bulk-upload',
        component: B2BBulkProductComponent,
        title: 'Bulk Upload B2B Products - DreamsPOS'
      },
      {
        path: 'b2b-management/products/bulk-multi-vendor',
        component: B2BBulkProductMultiVendorComponent,
        title: 'Bulk Product Multi-Vendor - DreamsPOS'
      },
      {
        path: 'b2b-management/products/edit/:id',
        component: CreateProductComponent,
        title: 'Edit B2B Product - DreamsPOS'
      },
      {
        path: 'b2b-management/vendors',
        component: B2BVendorsListComponent,
        title: 'B2B Vendors - DreamsPOS'
      },
      {
        path: 'b2b-management/vendors/add',
        component: B2BAddVendorComponent,
        title: 'Add B2B Vendor - DreamsPOS'
      },
      {
        path: 'b2b-management/vendors/edit/:id',
        component: B2BAddVendorComponent,
        title: 'Edit B2B Vendor - DreamsPOS'
      },
      {
        path: 'b2b-management/vendors/bulk-upload',
        component: B2BBulkVendorComponent,
        title: 'Bulk Upload Vendors - DreamsPOS'
      },

      // ── Role Management ─────────────────────────────────────────
      {
        path: 'role-management',
        component: RoleManagementComponent,
        title: 'Role Management - DreamsPOS'
      },
      {
        path: 'role-management/edit/:id',
        component: UserAccessEditComponent,
        title: 'Edit User Access - DreamsPOS'
      }
    ]
  }
];
