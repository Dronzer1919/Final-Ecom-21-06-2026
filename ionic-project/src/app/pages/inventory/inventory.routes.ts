import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../dashboard/dashboard-layout.component';
import { CreateProductComponent } from '../../dashboard/pages/create-product/create-product.component';

export const inventoryRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'create-products',
        component: CreateProductComponent,
        title: 'Create Product - DreamsPOS'
      }
    ]
  }
];
