# Theme Button Migration Status

## ✅ Successfully Updated Components

### Dashboard Pages
1. **Products Page** (`src/app/dashboard/pages/products`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ✅ HTML: Add Product (primary) & Import Product (outline) buttons updated
   
2. **Category Page** (`src/app/dashboard/pages/category`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ✅ HTML: Add Category (primary) & Import Category (outline) buttons updated
   - ✅ HTML: Retry button in error state updated

3. **Brands Page** (`src/app/dashboard/pages/brands`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ✅ HTML: Add Brand (primary) & Import Brand (outline) buttons updated
   - ✅ HTML: Retry button in error state updated

4. **Add Warehouse Page** (`src/app/dashboard/pages/warehouses/add-warehouse`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ✅ HTML: Save (primary) & Cancel (outline) buttons updated

5. **Profile Page** (`src/app/dashboard/pages/profile`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ⏳ HTML: Needs manual update for Edit/Save/Cancel buttons

### Customer-Facing Pages
6. **Cart Page** (`src/app/cart`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ✅ HTML: Continue Shopping & Proceed to Checkout buttons updated

7. **Wishlist Page** (`src/app/wishlist`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ✅ HTML: Continue Shopping button updated

8. **Orders Page** (`src/app/orders`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ⏳ HTML: Browse Products button (check formatting)

9. **Product Detail Page** (`src/app/product-detail`)
   - ✅ TypeScript: ThemeButtonComponent imported
   - ⏳ HTML: Add to Cart, Wishlist, Buy Now buttons need updating

## ⏳ Remaining Components to Update

### Dashboard Pages
- `dashboard/pages/add-barcode` - Form buttons
- `dashboard/pages/billers` - Add Biller button
- `dashboard/pages/customers` - Add Customer button
- `dashboard/pages/create-product` - Back button (already has btn-secondary)
- `dashboard/pages/banner-management` - Add/Save/Cancel buttons
- `dashboard/pages/category/add-category` - Save/Cancel buttons
- `dashboard/pages/brands/add-brand` - Save/Cancel buttons
- `dashboard/pages/product-wizard` - Next/Previous/Save buttons
- `dashboard/pages/decrypt-payload` - Decrypt/Encrypt buttons
- `dashboard/pages/print-barcode` - Reset button
- `dashboard/pages/low-stocks` - Send Email button

### Auth Pages
- `auth/sign-in` - Sign In button
- `auth/sign-up` - Sign Up button
- `auth/register` - Register button
- `auth/forgot-password` - Submit button
- `auth/reset-password` - Reset button
- `auth/email-otp` - Verify button
- `auth/two-step-verification` - Verify button
- `auth/signin` - Sign In button (duplicate?)

### Customer Pages
- `product-detail` - Add to Cart, Wishlist, Buy Now buttons
- `checkout` - Place Order button
- `orders/order-details` - Back button
- `home` - Shop Now buttons

### Page-Specific Components
- `pages/cart` - Duplicate of main cart
- `pages/wishlist` - Duplicate of main wishlist
- `pages/product-detail` - Duplicate of main product-detail

## 📋 Quick Migration Guide

### Step 1: Update TypeScript File

```typescript
// Add import at the top
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

// Add to component imports array
@Component({
  ...
  imports: [CommonModule, ..., ThemeButtonComponent],
})
```

### Step 2: Update HTML File

**Before:**
```html
<button class="btn-primary" (click)="myMethod()">
  <svg>...</svg>
  Button Text
</button>

<button class="btn-secondary" (click)="cancelMethod()">
  Cancel
</button>
```

**After:**
```html
<app-theme-button type="primary" (clicked)="myMethod()">
  <svg>...</svg>
  Button Text
</app-theme-button>

<app-theme-button type="outline" (clicked)="cancelMethod()">
  Cancel
</app-theme-button>
```

### Key Changes:
1. Replace `<button class="btn-primary">` with `<app-theme-button type="primary">`
2. Replace `<button class="btn-secondary">` with `<app-theme-button type="outline">`
3. Replace `<button class="btn btn-primary">` with `<app-theme-button type="primary">`
4. Replace `<button class="btn btn-secondary">` with `<app-theme-button type="outline">`
5. Change `(click)` to `(clicked)`
6. Keep all other attributes like `[disabled]`, `routerLink`, etc.

## 🎨 Button Type Guidelines

- **`type="primary"`** - Main action buttons (Add, Save, Submit, Proceed, etc.)
- **`type="secondary"`** - Secondary filled buttons (alternative actions)
- **`type="outline"`** - Outlined buttons (Cancel, Back, secondary actions)

## 📝 Search & Replace Pattern

To find remaining buttons to update, search for:
- `class="btn-primary"`
- `class="btn-secondary"`
- `class="btn btn-primary"`
- `class="btn btn-secondary"`

## 🔧 Benefits of Migration

1. **Theme-aware**: Buttons automatically adapt to all 6 themes
2. **Consistent**: Uniform styling across the entire application
3. **Maintainable**: Update button styles in one place
4. **Accessible**: Built-in disabled states and hover effects
5. **Flexible**: Supports icons, different sizes, and full-width options

## 🚀 Next Steps

1. Update remaining dashboard form pages (add-category, add-brand, etc.)
2. Update all auth pages
3. Update remaining customer-facing pages
4. Test all buttons across different themes
5. Remove old button CSS classes once migration is complete

## 📦 Component Location

`src/app/components/buttons/theme-button/`
- `theme-button.component.ts`
- `theme-button.component.html`
- `theme-button.component.scss`

## 📖 Full Documentation

See `THEME_BUTTON_GUIDE.md` for complete usage documentation.
