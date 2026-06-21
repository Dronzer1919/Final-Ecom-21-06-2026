/**
 * Example: Using the Theme System in Custom Components
 * 
 * This file demonstrates various ways to use the theming system
 * in your custom Angular components.
 */

// ============================================
// EXAMPLE 1: Using Theme Service in TypeScript
// ============================================

import { Component, OnInit } from '@angular/core';
import { ThemeService, Theme } from './src/app/services/theme.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  currentTheme: Theme = 'default';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Get current theme
    this.currentTheme = this.themeService.getCurrentTheme();

    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe((theme: Theme) => {
      this.currentTheme = theme;
      console.log('Theme changed to:', theme);
    });
  }

  // Method to change theme
  changeTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  // Method to toggle dark mode
  toggleDark() {
    this.themeService.toggleDarkMode();
  }
}


// ============================================
// EXAMPLE 2: Using Mixins in Component SCSS
// ============================================

/* example.component.scss */

/*
@import 'src/theme/mixins.scss';
@import 'src/theme/functions.scss';

// Custom button with themed styles
.custom-action-button {
  @include themed-button('primary', 'filled');
  padding: 12px 24px;
  min-width: 120px;
}

// Custom card with elevation
.feature-card {
  @include themed-card(2);
  margin: 16px;
  
  &:hover {
    @include themed-card(3);
  }
}

// Custom input with themed styles
.search-input {
  @include themed-input();
  margin-bottom: 16px;
}

// Custom toolbar
.app-header {
  @include themed-toolbar('primary');
  height: 60px;
}

// Using theme functions for custom elements
.custom-container {
  background: get-background('surface');
  color: get-text-color();
  border: 1px solid get-border-color();
  box-shadow: get-shadow(1);
  padding: 20px;
  border-radius: 12px;
}

.custom-text {
  color: get-color('primary');
  
  &:hover {
    color: get-color('primary', 'shade');
  }
}
*/


// ============================================
// EXAMPLE 3: Responsive Spacing with Mixins
// ============================================

/*
@import 'src/theme/mixins.scss';

.responsive-container {
  @include responsive-spacing(16px, 24px, 32px);
  // Mobile: 16px, Tablet: 24px, Desktop: 32px
}

.custom-spacing {
  @include spacing(20px, 16px, 20px, 16px);
  // top, right, bottom, left
}
*/


// ============================================
// EXAMPLE 4: Creating Custom Color Variants
// ============================================

/*
@import 'src/theme/mixins.scss';

.theme-custom {
  @include create-custom-color('brand', #FF6B35, #ffffff);
}

// Then use it in HTML:
// <ion-button color="brand">Custom Brand Button</ion-button>
*/


// ============================================
// EXAMPLE 5: HTML Template with Theme Selector
// ============================================

/*
<!-- example.component.html -->

<ion-header>
  <ion-toolbar>
    <ion-title>My App</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="toggleDark()">
        <ion-icon name="moon"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Theme Selector -->
  <app-theme-selector></app-theme-selector>

  <!-- Buttons with different colors -->
  <ion-button color="primary">Primary Button</ion-button>
  <ion-button color="secondary" fill="outline">Secondary Outline</ion-button>
  <ion-button color="tertiary" fill="clear">Tertiary Clear</ion-button>

  <!-- Cards with elevation -->
  <ion-card class="elevation-2">
    <ion-card-header>
      <ion-card-title>Card Title</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      Card content here
    </ion-card-content>
  </ion-card>

  <!-- Theme quick switcher -->
  <ion-segment (ionChange)="changeTheme($event.detail.value)">
    <ion-segment-button value="default">
      <ion-label>Light</ion-label>
    </ion-segment-button>
    <ion-segment-button value="dark">
      <ion-label>Dark</ion-label>
    </ion-segment-button>
    <ion-segment-button value="ocean">
      <ion-label>Ocean</ion-label>
    </ion-segment-button>
  </ion-segment>
</ion-content>
*/


// ============================================
// EXAMPLE 6: Programmatic Theme Detection
// ============================================

/*
import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-conditional',
  templateUrl: './conditional.component.html'
})
export class ConditionalComponent implements OnInit {
  isDarkTheme = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });
  }
}

// In template:
// <div [class.dark-mode]="isDarkTheme">
//   Content that changes based on theme
// </div>
*/


// ============================================
// EXAMPLE 7: Custom Theme-aware Component
// ============================================

/*
@import 'src/theme/functions.scss';

.dashboard-widget {
  background: get-background('card');
  border: 2px solid get-border-color();
  border-radius: 16px;
  padding: 24px;
  box-shadow: get-shadow(2);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: get-shadow(3);
    transform: translateY(-2px);
  }
  
  .widget-title {
    color: get-text-color();
    font-size: 1.5rem;
    margin-bottom: 12px;
  }
  
  .widget-content {
    color: rgba(var(--ion-text-color-rgb), 0.8);
  }
  
  .widget-action {
    @include themed-button('primary', 'outline');
    margin-top: 16px;
  }
}
*/


// ============================================
// EXAMPLE 8: Accessing Theme Info
// ============================================

/*
import { Component } from '@angular/core';
import { ThemeService, ThemeOption } from '../services/theme.service';

@Component({
  selector: 'app-theme-info',
  template: `
    <div>
      <h2>Current Theme</h2>
      <p>Name: {{ currentTheme?.label }}</p>
      <p>Description: {{ currentTheme?.description }}</p>
      <ion-icon [name]="currentTheme?.icon"></ion-icon>
    </div>
    
    <h2>All Available Themes</h2>
    <ion-list>
      <ion-item *ngFor="let theme of availableThemes">
        <ion-icon [name]="theme.icon" slot="start"></ion-icon>
        <ion-label>
          <h3>{{ theme.label }}</h3>
          <p>{{ theme.description }}</p>
        </ion-label>
      </ion-item>
    </ion-list>
  `
})
export class ThemeInfoComponent {
  currentTheme?: ThemeOption;
  availableThemes: ThemeOption[];

  constructor(private themeService: ThemeService) {
    const currentThemeName = this.themeService.getCurrentTheme();
    this.currentTheme = this.themeService.getThemeInfo(currentThemeName);
    this.availableThemes = this.themeService.availableThemes;
  }
}
*/


// ============================================
// EXAMPLE 9: Conditional Styling Based on Theme
// ============================================

/*
@import 'src/theme/functions.scss';

.adaptive-container {
  // Base styles
  padding: 20px;
  border-radius: 12px;
  
  // Theme-aware colors
  background: get-background('surface');
  color: get-text-color();
  border: 1px solid get-border-color();
  
  // Nested elements
  .header {
    color: get-color('primary');
    border-bottom: 2px solid get-color('primary', 'tint');
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  
  .content {
    color: get-text-color();
    line-height: 1.6;
  }
  
  .footer {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid get-border-color();
  }
}
*/


// ============================================
// EXAMPLE 10: Multiple Button Variants
// ============================================

/*
@import 'src/theme/mixins.scss';

// Primary buttons
.btn-primary-filled { @include themed-button('primary', 'filled'); }
.btn-primary-outline { @include themed-button('primary', 'outline'); }
.btn-primary-clear { @include themed-button('primary', 'clear'); }

// Secondary buttons
.btn-secondary-filled { @include themed-button('secondary', 'filled'); }
.btn-secondary-outline { @include themed-button('secondary', 'outline'); }
.btn-secondary-clear { @include themed-button('secondary', 'clear'); }

// Success buttons
.btn-success-filled { @include themed-button('success', 'filled'); }
.btn-success-outline { @include themed-button('success', 'outline'); }

// Custom styling on top of mixin
.btn-large {
  @include themed-button('primary', 'filled');
  padding: 16px 32px;
  font-size: 1.2rem;
  min-width: 200px;
}

.btn-icon {
  @include themed-button('primary', 'clear');
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
*/

export {};
