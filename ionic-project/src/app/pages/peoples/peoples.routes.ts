import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../dashboard/dashboard-layout.component';
import { CustomersComponent } from '../../dashboard/pages/customers/customers.component';
import { BillersComponent } from '../../dashboard/pages/billers/billers.component';
import { SuppliersComponent } from '../../dashboard/pages/suppliers/suppliers.component';
import { WarehousesComponent } from '../../dashboard/pages/warehouses/warehouses.component';
import { AddWarehouseComponent } from '../../dashboard/pages/warehouses/add-warehouse/add-warehouse.component';
import { StoresComponent } from '../../dashboard/pages/stores/stores.component';
import { AddStoreComponent } from '../../dashboard/pages/stores/add-store/add-store.component';

export const peoplesRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
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
        path: 'warehouses',
        children: [
          {
            path: '',
            component: WarehousesComponent,
            title: 'Warehouses - DreamsPOS'
          },
          {
            path: 'add',
            component: AddWarehouseComponent,
            title: 'Add Warehouse - DreamsPOS'
          },
          {
            path: 'edit/:id',
            component: AddWarehouseComponent,
            title: 'Edit Warehouse - DreamsPOS'
          }
        ]
      },
      {
        path: 'stores',
        children: [
          {
            path: '',
            component: StoresComponent,
            title: 'Stores - DreamsPOS'
          },
          {
            path: 'add',
            component: AddStoreComponent,
            title: 'Add Store - DreamsPOS'
          }
        ]
      }
    ]
  }
];
