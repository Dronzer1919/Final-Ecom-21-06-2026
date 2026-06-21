# Theme Button Component

A reusable, theme-aware button component that automatically adapts to the selected theme (Default, Dark, Ocean, Forest, Sunset, Purple).

## Location
`src/app/components/buttons/theme-button/theme-button.component.ts`

## Features

- **Theme-aware**: Automatically uses theme colors from CSS variables
- **Three button types**:
  - `primary`: Filled button with theme primary color
  - `secondary`: Filled button with theme secondary color
  - `outline`: Outlined button with theme primary color border
- **Three sizes**: small, medium (default), large
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper disabled states and hover effects

## Usage

### 1. Import the Component

```typescript
import { ThemeButtonComponent } from './components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent],
  // ...
})
```

### 2. Use in Template

#### Primary Button
```html
<app-theme-button type="primary" (clicked)="handleClick()">
  Click Me
</app-theme-button>
```

#### Secondary Button
```html
<app-theme-button type="secondary" (clicked)="handleClick()">
  Secondary Action
</app-theme-button>
```

#### Outline Button
```html
<app-theme-button type="outline" (clicked)="handleClick()">
  <svg><!-- icon --></svg>
  Outlined Button
</app-theme-button>
```

#### With Icon
```html
<app-theme-button type="primary" (clicked)="addProduct()">
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
  Add Product
</app-theme-button>
```

#### Different Sizes
```html
<app-theme-button type="primary" size="small" (clicked)="handleClick()">Small</app-theme-button>
<app-theme-button type="primary" size="medium" (clicked)="handleClick()">Medium</app-theme-button>
<app-theme-button type="primary" size="large" (clicked)="handleClick()">Large</app-theme-button>
```

#### Full Width
```html
<app-theme-button type="primary" [fullWidth]="true" (clicked)="handleClick()">
  Full Width Button
</app-theme-button>
```

#### Disabled State
```html
<app-theme-button type="primary" [disabled]="isLoading" (clicked)="handleClick()">
  Save
</app-theme-button>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Button style type |
| `disabled` | `boolean` | `false` | Disables the button |
| `fullWidth` | `boolean` | `false` | Makes button 100% width |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |

## Output Events

| Event | Type | Description |
|-------|------|-------------|
| `clicked` | `EventEmitter<Event>` | Emitted when button is clicked |

## Migration Guide

### Old Button Code
```html
<button class="btn-primary" (click)="addProduct()">
  <svg>...</svg>
  Add Product
</button>

<button class="btn-secondary" (click)="importProduct()">
  <svg>...</svg>
  Import Product
</button>
```

### New Button Code
```html
<app-theme-button type="primary" (clicked)="addProduct()">
  <svg>...</svg>
  Add Product
</app-theme-button>

<app-theme-button type="outline" (clicked)="importProduct()">
  <svg>...</svg>
  Import Product
</app-theme-button>
```

**Note**: Change `(click)` to `(clicked)` and use `type="outline"` for secondary/outlined buttons.

## Examples Already Updated

1. **Products Page** (`src/app/dashboard/pages/products/products.component.html`)
   - Add Product button
   - Import Product button

2. **Category Page** (`src/app/dashboard/pages/category/category.component.html`)
   - Add Category button
   - Import Category button

## Benefits

1. **Consistency**: All buttons use the same styling across the app
2. **Maintainability**: Update button styles in one place
3. **Theme Support**: Automatically adapts to all themes
4. **Accessibility**: Built-in disabled and hover states
5. **Flexibility**: Easy to customize with inputs

## Theme Colors Used

The component uses CSS custom properties from your theme system:

- `--ion-color-primary`: Primary button background
- `--ion-color-primary-contrast`: Primary button text color
- `--ion-color-primary-shade`: Primary button hover state
- `--ion-color-primary-rgb`: Primary button shadow
- `--ion-color-secondary`: Secondary button background
- `--ion-color-secondary-contrast`: Secondary button text color
- `--ion-color-secondary-shade`: Secondary button hover state
- `--ion-color-secondary-rgb`: Secondary button shadow

## Updating Remaining Buttons

Search for these patterns in your project to find buttons that need updating:

```
class="btn-primary"
class="btn-secondary"
class="btn btn-primary"
class="btn btn-secondary"
```

Replace with `<app-theme-button>` component as shown in the migration guide above.
