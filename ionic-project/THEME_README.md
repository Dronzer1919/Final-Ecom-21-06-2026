# Ionic Theme System

A comprehensive theming system for Ionic Angular applications with multiple pre-built themes, dynamic theme switching, and reusable SCSS utilities.

## 🎨 Features

- ✨ **6 Pre-built Themes**: Default Light, Dark, Ocean, Forest, Sunset, and Purple
- 🔄 **Dynamic Theme Switching**: Change themes on-the-fly with smooth transitions
- 🎯 **Reusable Mixins & Functions**: Easy-to-use SCSS utilities
- 💾 **Persistent Selection**: Themes are saved to localStorage
- 📱 **Mobile-Ready**: Includes meta theme-color updates
- ⚡ **Performance Optimized**: CSS custom properties for instant theme changes

## 📁 Project Structure

```
src/
├── theme/
│   ├── variables.scss    # CSS custom properties & base variables
│   ├── functions.scss    # Helper functions for theme values
│   ├── mixins.scss       # Reusable mixins for components
│   └── themes.scss       # Theme definitions (all 6 themes)
├── app/
│   ├── services/
│   │   └── theme.service.ts    # Theme management service
│   └── components/
│       └── theme-selector/     # Theme selector UI component
└── global.scss           # Global styles & theme imports
```

## 🚀 Getting Started

### 1. Installation

The project is already set up with all theme files. To run the app:

```bash
cd "ionic-project"
npm install
ionic serve
```

### 2. Using the Theme Service

In your component:

```typescript
import { ThemeService } from './services/theme.service';

export class MyComponent {
  constructor(private themeService: ThemeService) {}

  switchTheme(theme: 'default' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'purple') {
    this.themeService.setTheme(theme);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  getCurrentTheme() {
    return this.themeService.getCurrentTheme();
  }
}
```

### 3. Using SCSS Mixins

In your component SCSS files:

```scss
@import 'src/theme/mixins.scss';
@import 'src/theme/functions.scss';

// Apply themed button styles
.my-button {
  @include themed-button('primary', 'filled');
  // or 'outline', 'clear' as the second parameter
}

// Apply themed card styles
.my-card {
  @include themed-card(2); // elevation level: 1, 2, or 3
}

// Apply themed input styles
.my-input {
  @include themed-input();
}

// Apply themed toolbar
.my-toolbar {
  @include themed-toolbar('surface');
  // or 'primary', 'transparent'
}

// Apply themed list
.my-list {
  @include themed-list();
}

// Apply themed page
.my-page {
  @include themed-page();
}
```

### 4. Using SCSS Functions

```scss
@import 'src/theme/functions.scss';

.my-element {
  // Get theme colors
  color: get-color('primary');
  background: get-color('secondary', 'shade');

  // Get background colors
  background: get-background('card');
  // Options: 'base', 'surface', 'card'

  // Get text color
  color: get-text-color();

  // Get border color
  border-color: get-border-color();

  // Get shadows
  box-shadow: get-shadow(2);
  // Intensity: 1, 2, or 3
}
```

### 5. Adding the Theme Selector Component

In your template:

```html
<app-theme-selector></app-theme-selector>
```

## 🎨 Available Themes

1. **Default Light** - Clean and bright default theme
2. **Dark Mode** - Easy on the eyes dark theme
3. **Ocean** - Cool blue and teal colors
4. **Forest** - Natural green and brown tones
5. **Sunset** - Warm orange and pink hues
6. **Purple Dream** - Royal purple theme

## 🔧 Creating Custom Themes

To add a new theme, edit `src/theme/themes.scss`:

```scss
.theme-custom {
  --ion-color-primary: #your-color;
  --ion-color-primary-rgb: r, g, b;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #darker-shade;
  --ion-color-primary-tint: #lighter-tint;

  // Repeat for secondary, tertiary, etc.

  --theme-background: #background-color;
  --theme-surface: #surface-color;
  --theme-card-background: #card-color;
  --theme-border-color: #border-color;
  --theme-shadow: rgba(0, 0, 0, 0.1);

  --ion-background-color: #background-color;
  --ion-text-color: #text-color;
  --ion-text-color-rgb: r, g, b;
}
```

Then add it to the `ThemeService`:

```typescript
// In theme.service.ts
export type Theme = 'default' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'custom';

public readonly availableThemes: ThemeOption[] = [
  // ... existing themes
  {
    name: 'custom',
    label: 'Custom Theme',
    description: 'Your custom theme description',
    icon: 'star'
  }
];
```

## 📦 What's Included

### Theme Variables (variables.scss)
- All Ionic color variables (primary, secondary, tertiary, success, warning, danger, etc.)
- Background and text colors
- Custom theme variables for surfaces, cards, borders, and shadows

### Theme Functions (functions.scss)
- `get-color()` - Get theme color variables
- `get-background()` - Get background colors
- `get-text-color()` - Get text color
- `get-border-color()` - Get border color
- `get-shadow()` - Get box shadows with intensity levels

### Theme Mixins (mixins.scss)
- `themed-button()` - Apply themed button styles (filled, outline, clear)
- `themed-card()` - Apply themed card styles with elevation
- `themed-input()` - Apply themed input styles
- `themed-toolbar()` - Apply themed toolbar styles
- `themed-list()` - Apply themed list styles
- `themed-list-item()` - Apply themed list item styles
- `themed-page()` - Apply themed page styles
- `create-custom-color()` - Create custom color variants
- `spacing()` - Apply consistent spacing
- `responsive-spacing()` - Apply responsive spacing

## 🎯 Best Practices

1. **Always use theme functions and mixins** instead of hard-coded colors
2. **Test all themes** to ensure your custom components look good in each
3. **Use CSS custom properties** for dynamic values that need to change with themes
4. **Leverage the mixin system** for consistent component styling
5. **Keep theme definitions organized** in themes.scss

## 🔄 Theme Transitions

All theme changes include smooth transitions (0.3s ease) for:
- Background colors
- Text colors
- Button styles
- Card styles
- Component backgrounds

## 📱 Mobile Considerations

- Theme preference is saved to localStorage
- Meta theme-color tag updates automatically
- System dark mode preference is detected on first load
- All themes are touch-optimized

## 🤝 Contributing

To add new features to the theming system:

1. Add new CSS custom properties to `variables.scss`
2. Create helper functions in `functions.scss`
3. Create reusable mixins in `mixins.scss`
4. Update theme definitions in `themes.scss`
5. Test across all themes

## 📄 License

MIT

---

**Happy Theming! 🎨**
