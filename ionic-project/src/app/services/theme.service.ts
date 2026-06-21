import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'default' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'purple';

export interface ThemeOption {
  name: Theme;
  label: string;
  description: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'selected-theme';
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;

  public readonly availableThemes: ThemeOption[] = [
    {
      name: 'default',
      label: 'Default Light',
      description: 'Clean and bright default theme',
      icon: 'sunny'
    },
    {
      name: 'dark',
      label: 'Dark Mode',
      description: 'Easy on the eyes dark theme',
      icon: 'moon'
    },
    {
      name: 'ocean',
      label: 'Ocean',
      description: 'Cool blue and teal colors',
      icon: 'water'
    },
    {
      name: 'forest',
      label: 'Forest',
      description: 'Natural green and brown tones',
      icon: 'leaf'
    },
    {
      name: 'sunset',
      label: 'Sunset',
      description: 'Warm orange and pink hues',
      icon: 'sunny'
    },
    {
      name: 'purple',
      label: 'Purple Dream',
      description: 'Royal purple theme',
      icon: 'color-palette'
    }
  ];

  constructor() {
    const savedTheme = this.getSavedTheme();
    this.currentThemeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    
    // Apply the saved theme on initialization
    this.applyTheme(savedTheme);
  }

  /**
   * Get the currently active theme
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Set a new theme
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.currentThemeSubject.next(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleDarkMode(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Apply theme to document body
   */
  private applyTheme(theme: Theme): void {
    // Remove all theme classes
    const body = document.body;
    this.availableThemes.forEach(t => {
      body.classList.remove(`theme-${t.name}`);
    });
    
    // Add the new theme class
    body.classList.add(`theme-${theme}`);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  /**
   * Update the meta theme-color tag for mobile browsers
   */
  private updateMetaThemeColor(theme: Theme): void {
    let themeColor = '#3880ff'; // default

    switch (theme) {
      case 'dark':
        themeColor = '#121212';
        break;
      case 'ocean':
        themeColor = '#006994';
        break;
      case 'forest':
        themeColor = '#2e7d32';
        break;
      case 'sunset':
        themeColor = '#ff6f00';
        break;
      case 'purple':
        themeColor = '#7b1fa2';
        break;
    }

    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', themeColor);
  }

  /**
   * Save theme to local storage
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }

  /**
   * Get saved theme from local storage
   */
  private getSavedTheme(): Theme {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      if (savedTheme && this.isValidTheme(savedTheme)) {
        return savedTheme as Theme;
      }
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
    }
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'default';
  }

  /**
   * Validate if the theme name is valid
   */
  private isValidTheme(theme: string): boolean {
    return this.availableThemes.some(t => t.name === theme);
  }

  /**
   * Get theme information by name
   */
  getThemeInfo(theme: Theme): ThemeOption | undefined {
    return this.availableThemes.find(t => t.name === theme);
  }
}
