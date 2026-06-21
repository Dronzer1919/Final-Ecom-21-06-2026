import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomeComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'components-demo',
    loadComponent: () => import('./pages/components-demo/components-demo.page').then( m => m.ComponentsDemoPage)
  },
  {
    path: 'auth/sign-up',
    loadComponent: () => import('./auth/sign-up/sign-up.page').then( m => m.SignUpPage)
  },
  {
    path: 'auth/sign-in',
    loadComponent: () => import('./auth/sign-in/sign-in.page').then( m => m.SignInPage)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
  },
  {
    path: 'auth/email-otp',
    loadComponent: () => import('./auth/email-otp/email-otp.page').then(m => m.EmailOtpPage)
  },
  {
    path: 'auth/two-step-verification',
    loadComponent: () => import('./auth/two-step-verification/two-step-verification.page').then(m => m.TwoStepVerificationPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist.page').then(m => m.WishlistPage)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage)
  },
  {
    path: 'shop/product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage)
  },
  {
    path: 'brands',
    loadComponent: () => import('./pages/brands/brands.page').then(m => m.BrandsPage)
  },
  {
    path: 'frequently-bought',
    loadComponent: () => import('./pages/frequently-bought/frequently-bought.page').then(m => m.FrequentlyBoughtPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage)
  },
  {
    path: 'orders/userorders',
    loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage)
  },
  {
    path: 'orders/details/:id',
    loadComponent: () => import('./pages/orders/order-details/order-details.page').then(m => m.OrderDetailsPage)
  },
  {
    path: 'b2b-categories',
    loadComponent: () => import('./pages/b2b-categories/b2b-categories.page').then(m => m.B2BCategoriesPage)
  },
  {
    path: 'b2b-subcategory/:categoryId/:subcategoryId',
    loadComponent: () => import('./pages/b2b-subcategory/b2b-subcategory.page').then(m => m.B2BSubcategoryPage)
  },
  {
    path: 'b2b-marketplace',
    loadComponent: () => import('./pages/b2b-marketplace/b2b-marketplace.page').then(m => m.B2BMarketplacePage)
  },
  {
    path: 'b2b-marketplace/:productId',
    loadComponent: () => import('./pages/b2b-marketplace/b2b-marketplace.page').then(m => m.B2BMarketplacePage)
  },
  {
    path: 'pos',
    loadComponent: () => import('./dashboard/pages/pos/pos.component').then(m => m.PosComponent)
  },
 {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'inventory',
    loadChildren: () => import('./pages/inventory/inventory.routes').then(m => m.inventoryRoutes)
  },
  {
    path: 'peoples',
    loadChildren: () => import('./pages/peoples/peoples.routes').then(m => m.peoplesRoutes)
  },
];
