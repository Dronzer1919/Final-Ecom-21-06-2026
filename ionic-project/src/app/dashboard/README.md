# Dashboard Module Documentation

## ✅ What's Been Created

A complete dashboard layout with header, sidebar, and content area - all fully themed and responsive!

## 📁 Structure

```
dashboard/
├── components/
│   ├── header/              ← Fixed header with search, notifications
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.scss
│   │
│   └── sidebar/             ← Collapsible navigation sidebar
│       ├── sidebar.component.ts
│       ├── sidebar.component.html
│       └── sidebar.component.scss
│
├── pages/
│   └── dashboard-home/      ← Main dashboard page
│       ├── dashboard-home.component.ts
│       ├── dashboard-home.component.html
│       └── dashboard-home.component.scss
│
├── dashboard-layout.component.ts     ← Main layout wrapper
├── dashboard-layout.component.html
├── dashboard-layout.component.scss
└── dashboard.routes.ts               ← Dashboard routing
```

## 🎨 Components

### 1. Header Component
**Features:**
- Logo
- Search bar with keyboard shortcut (⌘ K)
- Location selector
- Add New button
- POS button
- Calculator icon
- Email icon
- Notifications dropdown with badge
- Settings icon
- User profile dropdown

**Location:** Fixed at top (70px height)

### 2. Sidebar Component  
**Features:**
- Collapsible navigation menu
- Grouped menu items (Main, Inventory, Stock, Sales, etc.)
- Active route highlighting
- Expandable submenus
- Scrollable content
- Mobile responsive (slides in/out)

**Width:** 260px (desktop), hidden on mobile

### 3. Dashboard Layout
**Features:**
- Combines header + sidebar + content
- Responsive layout
- Mobile menu toggle button
- Sidebar overlay on mobile
- Proper spacing for fixed elements

### 4. Dashboard Home Page
**Features:**
- Welcome header with date range
- 4 stat cards with mini charts
- Welcome banner
- Companies chart
- Revenue chart
- Top plans chart
- Recent transactions table
- Recently registered table
- Recent plan expired table

## 🚀 Routes

- `/dashboard/home` - Dashboard home page
- Add more routes as needed in `dashboard.routes.ts`

## 🎨 Theming

All components use the same theming system from `_variables.scss`:

```scss
// Colors
$primary-color: #FF8C42;
$text-primary: #212529;
$background-primary: #FFFFFF;

// Spacing
$padding-lg: 24px;
$gap-md: 16px;

// etc...
```

## 📱 Responsive Design

**Desktop (> 768px):**
- Sidebar visible (260px)
- Header full width
- Content with left margin

**Mobile (≤ 768px):**
- Sidebar hidden by default
- Mobile menu toggle button (bottom right)
- Sidebar slides in when toggled
- Overlay backdrop

## 🔧 Customization

### Change Sidebar Menu Items

Edit `sidebar.component.ts`:

```typescript
menuItems: MenuItem[] = [
  {
    label: 'Main',
    icon: '',
    children: [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard/home' },
      // Add more items...
    ]
  }
];
```

### Change Header Actions

Edit `header.component.html` to add/remove buttons in the `header-actions` div.

### Change Stats Cards

Edit `dashboard-home.component.ts`:

```typescript
stats = [
  { label: 'Total Sales', value: '$10,000', icon: 'dollar', change: '+12%', trend: 'up' },
  // Add more stats...
];
```

## 💡 Next Steps

1. **Add Real Data**: Connect components to services/APIs
2. **Add Charts**: Integrate chart library (Chart.js, ApexCharts, etc.)
3. **Add Tables**: Create table components with sorting/filtering
4. **Add More Pages**: Create product pages, sales pages, etc.
5. **Add Auth Guard**: Protect dashboard routes

## 🎯 Creating New Pages

1. Create component in `pages/` folder:
```bash
ng generate component dashboard/pages/products --standalone
```

2. Add route in `dashboard.routes.ts`:
```typescript
{
  path: 'products',
  loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
  title: 'Products - DreamsPOS'
}
```

3. Add menu item in `sidebar.component.ts`:
```typescript
{ label: 'Products', icon: 'products', route: '/dashboard/products' }
```

## ✨ Features Summary

- ✅ Fixed header with search and actions
- ✅ Collapsible sidebar navigation
- ✅ Responsive layout
- ✅ Mobile menu toggle
- ✅ Notifications dropdown
- ✅ User profile dropdown
- ✅ Dashboard home with stats
- ✅ Consistent theming
- ✅ All using variables from `_variables.scss`

## 🎨 Same Theming System

Everything uses the same variables:
- Change `$primary-color` → Updates buttons, links, active states
- Change `$text-primary` → Updates all text colors
- Change `$background-primary` → Updates all backgrounds

**One file to rule them all:** `src/styles/_variables.scss` 🎨
