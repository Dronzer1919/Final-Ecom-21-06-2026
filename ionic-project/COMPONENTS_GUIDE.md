# Reusable Themed Components Guide

Complete guide for using the reusable themed components in your Ionic application.

## 📦 Available Components

1. **ThemedButtonComponent** - Customizable buttons
2. **ThemedCardComponent** - Flexible card layouts
3. **ThemedAccordionComponent** - Expandable accordion sections
4. **ThemedTableComponent** - Data tables with pagination and sorting

---

## 🔘 ThemedButtonComponent

A fully customizable button component that adapts to your theme.

### Import

```typescript
import { ThemedButtonComponent } from './components/reusable';
```

### Basic Usage

```html
<app-themed-button color="primary">
  Click Me
</app-themed-button>
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | `ButtonColor` | `'primary'` | Button color (primary, secondary, tertiary, success, warning, danger, light, dark, medium) |
| `fill` | `ButtonFill` | `'solid'` | Button fill style (solid, outline, clear) |
| `size` | `ButtonSize` | `'default'` | Button size (small, default, large) |
| `expand` | `ButtonExpand` | `undefined` | Expand mode (block, full) |
| `disabled` | `boolean` | `false` | Disable button |
| `icon` | `string` | `undefined` | Icon name from Ionicons |
| `iconSlot` | `'start' \| 'end' \| 'icon-only'` | `'start'` | Icon position |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `buttonClick` | `Event` | Emitted when button is clicked |

### Examples

```html
<!-- Filled button -->
<app-themed-button color="primary">Primary Button</app-themed-button>

<!-- Outline button -->
<app-themed-button color="secondary" fill="outline">Outline</app-themed-button>

<!-- Clear button -->
<app-themed-button color="tertiary" fill="clear">Clear</app-themed-button>

<!-- With icon -->
<app-themed-button color="success" icon="checkmark" iconSlot="start">
  Save
</app-themed-button>

<!-- Icon only -->
<app-themed-button color="danger" icon="trash" iconSlot="icon-only">
</app-themed-button>

<!-- Block button -->
<app-themed-button color="primary" expand="block">
  Block Button
</app-themed-button>

<!-- Different sizes -->
<app-themed-button color="primary" size="small">Small</app-themed-button>
<app-themed-button color="primary" size="default">Default</app-themed-button>
<app-themed-button color="primary" size="large">Large</app-themed-button>

<!-- With click handler -->
<app-themed-button 
  color="primary" 
  (buttonClick)="handleClick($event)">
  Click Handler
</app-themed-button>

<!-- Disabled -->
<app-themed-button color="primary" [disabled]="true">
  Disabled
</app-themed-button>
```

---

## 🃏 ThemedCardComponent

Flexible card component with header, content, and footer sections.

### Import

```typescript
import { ThemedCardComponent } from './components/reusable';
```

### Basic Usage

```html
<app-themed-card title="Card Title">
  Card content goes here
</app-themed-card>
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `undefined` | Card title |
| `subtitle` | `string` | `undefined` | Card subtitle |
| `elevation` | `CardElevation` (1, 2, 3) | `1` | Shadow elevation level |
| `headerIcon` | `string` | `undefined` | Icon in header |
| `headerColor` | `string` | `undefined` | Header icon color |
| `footerText` | `string` | `undefined` | Footer text |
| `clickable` | `boolean` | `false` | Make card clickable with hover effects |

### Examples

```html
<!-- Basic card -->
<app-themed-card title="My Card">
  Simple card content
</app-themed-card>

<!-- Card with subtitle -->
<app-themed-card 
  title="Card Title" 
  subtitle="Card subtitle">
  Content here
</app-themed-card>

<!-- Card with icon -->
<app-themed-card 
  title="Featured" 
  headerIcon="star"
  headerColor="warning">
  Featured content
</app-themed-card>

<!-- Card with footer -->
<app-themed-card 
  title="Article"
  footerText="Published: April 11, 2026">
  Article content
</app-themed-card>

<!-- High elevation card -->
<app-themed-card 
  title="Important"
  [elevation]="3">
  Important content stands out
</app-themed-card>

<!-- Clickable card -->
<app-themed-card 
  title="Interactive"
  [clickable]="true">
  Hover over me!
</app-themed-card>

<!-- Complete card -->
<app-themed-card 
  title="Complete Card"
  subtitle="All features"
  headerIcon="rocket"
  headerColor="primary"
  footerText="Last updated: Today"
  [elevation]="2"
  [clickable]="true">
  This card has all available features
</app-themed-card>
```

---

## 📋 ThemedAccordionComponent

Expandable accordion sections for organizing content.

### Import

```typescript
import { ThemedAccordionComponent, AccordionItem } from './components/reusable';
```

### Basic Usage

```typescript
// In component
accordionItems: AccordionItem[] = [
  {
    title: 'Section 1',
    content: 'Content for section 1',
    icon: 'information-circle',
    expanded: false
  },
  {
    title: 'Section 2',
    content: 'Content for section 2',
    icon: 'help-circle',
    expanded: false
  }
];
```

```html
<app-themed-accordion 
  [items]="accordionItems"
  color="primary">
</app-themed-accordion>
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | `AccordionItem[]` | `[]` | Array of accordion items |
| `multiple` | `boolean` | `false` | Allow multiple items expanded |
| `color` | `string` | `'primary'` | Icon color |

### AccordionItem Interface

```typescript
interface AccordionItem {
  title: string;        // Item title
  content: string;      // Item content
  icon?: string;        // Optional icon
  expanded?: boolean;   // Initially expanded
}
```

### Examples

```typescript
// Single expansion (default)
accordionItems: AccordionItem[] = [
  { title: 'FAQ 1', content: 'Answer 1', icon: 'help-circle' },
  { title: 'FAQ 2', content: 'Answer 2', icon: 'help-circle' }
];
```

```html
<app-themed-accordion 
  [items]="accordionItems"
  [multiple]="false"
  color="primary">
</app-themed-accordion>
```

```typescript
// Multiple expansion allowed
accordionItems: AccordionItem[] = [
  { title: 'Details 1', content: 'Info 1', expanded: true },
  { title: 'Details 2', content: 'Info 2', expanded: true }
];
```

```html
<app-themed-accordion 
  [items]="accordionItems"
  [multiple]="true"
  color="secondary">
</app-themed-accordion>
```

---

## 📊 ThemedTableComponent

Data table with sorting, pagination, and row click features.

### Import

```typescript
import { ThemedTableComponent, TableColumn, PaginationConfig } from './components/reusable';
```

### Basic Usage

```typescript
// In component
tableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: false }
];

tableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

tablePagination: PaginationConfig = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 0
};
```

```html
<app-themed-table
  [columns]="tableColumns"
  [data]="tableData"
  [pagination]="tablePagination"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSort($event)"
  (rowClick)="onRowClick($event)">
</app-themed-table>
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `columns` | `TableColumn[]` | `[]` | Table column definitions |
| `data` | `any[]` | `[]` | Table data array |
| `pagination` | `PaginationConfig` | Required | Pagination configuration |
| `loading` | `boolean` | `false` | Show loading overlay |
| `striped` | `boolean` | `true` | Alternate row colors |
| `hoverable` | `boolean` | `true` | Highlight rows on hover |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `pageChange` | `number` | Emitted when page changes |
| `sortChange` | `{ column: string, direction: 'asc' \| 'desc' }` | Emitted when column sorted |
| `rowClick` | `any` | Emitted when row is clicked |

### Interfaces

```typescript
interface TableColumn {
  key: string;          // Data property key
  label: string;        // Column header label
  sortable?: boolean;   // Enable sorting
  width?: string;       // Column width (e.g., '100px')
}

interface PaginationConfig {
  currentPage: number;  // Current page number
  pageSize: number;     // Items per page
  totalItems: number;   // Total number of items
}
```

### Examples

```html
<!-- Basic table -->
<app-themed-table
  [columns]="columns"
  [data]="data"
  [pagination]="pagination">
</app-themed-table>

<!-- Table with all features -->
<app-themed-table
  [columns]="columns"
  [data]="data"
  [pagination]="pagination"
  [loading]="isLoading"
  [striped]="true"
  [hoverable]="true"
  (pageChange)="handlePageChange($event)"
  (sortChange)="handleSort($event)"
  (rowClick)="handleRowClick($event)">
</app-themed-table>
```

```typescript
// Handle events
handlePageChange(page: number) {
  this.pagination.currentPage = page;
  this.loadData();
}

handleSort(event: { column: string, direction: 'asc' | 'desc' }) {
  const { column, direction } = event;
  this.data.sort((a, b) => {
    if (direction === 'asc') {
      return a[column] > b[column] ? 1 : -1;
    } else {
      return a[column] < b[column] ? 1 : -1;
    }
  });
}

handleRowClick(row: any) {
  console.log('Row clicked:', row);
  // Navigate or show details
}
```

---

## 🎨 Theme Integration

All components automatically adapt to the current theme using the theme system's mixins and functions:

- Buttons use `themed-button()` mixin
- Cards use `themed-card()` mixin
- All colors use `get-color()`, `get-background()`, `get-text-color()` functions
- Smooth transitions when themes change

### Custom Styling

You can override component styles while maintaining theme compatibility:

```scss
// In your component SCSS
app-themed-button {
  ::ng-deep .themed-button {
    border-radius: 20px; // Custom style
  }
}

app-themed-card {
  ::ng-deep .themed-card {
    max-width: 500px;
    margin: 0 auto;
  }
}
```

---

## 📱 Responsive Design

All components are mobile-friendly:

- Tables scroll horizontally on small screens
- Pagination controls wrap on mobile
- Cards stack vertically on narrow viewports
- Accordion works perfectly on touch devices

---

## ♿ Accessibility

Components include accessibility features:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Focus indicators

---

## 🚀 Performance Tips

1. **Lazy load table data** - Don't load all data at once
2. **Use pagination** - Keep page sizes reasonable (10-50 items)
3. **Debounce sort** - Avoid sorting on every click
4. **Virtual scrolling** - For very large datasets, consider virtual scrolling

---

## 📝 Example Integration

```typescript
import { Component } from '@angular/core';
import { 
  ThemedButtonComponent,
  ThemedCardComponent,
  ThemedAccordionComponent,
  ThemedTableComponent,
  AccordionItem,
  TableColumn,
  PaginationConfig
} from './components/reusable';

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [
    ThemedButtonComponent,
    ThemedCardComponent,
    ThemedAccordionComponent,
    ThemedTableComponent
  ],
  templateUrl: './my-page.component.html'
})
export class MyPageComponent {
  // Your logic here
}
```

---

## 🔗 Live Demo

Visit `/components-demo` page to see all components in action with interactive examples!

---

## 📚 Additional Resources

- [THEME_README.md](../THEME_README.md) - Complete theme system guide
- [THEME_EXAMPLES.ts](../THEME_EXAMPLES.ts) - 10 practical examples
- [Ionic Components](https://ionicframework.com/docs/components) - Official Ionic docs
