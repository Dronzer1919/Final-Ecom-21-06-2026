import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService, Theme, ThemeOption } from '../../services/theme.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() activeRoute = 'home';
  // Kept for backward compat but counts now come from services
  @Output() accountClick = new EventEmitter<void>();
  @Output() wishlistClick = new EventEmitter<void>();
  @Output() cartClick = new EventEmitter<void>();

  themeDropdownOpen = false;
  themes: ThemeOption[];
  currentTheme: Theme;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    public cartService: CartService,
    public wishlistService: WishlistService
  ) {
    this.themes = this.themeService.availableThemes;
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  toggleThemeDropdown(event: Event): void {
    event.stopPropagation();
    this.themeDropdownOpen = !this.themeDropdownOpen;
  }

  selectTheme(theme: Theme, event: Event): void {
    event.stopPropagation();
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
    this.themeDropdownOpen = false;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.themeDropdownOpen = false;
  }

  navigateToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }
}
