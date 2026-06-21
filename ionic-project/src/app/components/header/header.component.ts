import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, Theme, ThemeOption } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() wishlistCount = 0;
  @Input() cartItemCount = 0;
  @Input() activeRoute = 'home';

  @Output() accountClick = new EventEmitter<void>();
  @Output() wishlistClick = new EventEmitter<void>();
  @Output() cartClick = new EventEmitter<void>();

  themeDropdownOpen = false;
  themes: ThemeOption[];
  currentTheme: Theme;

  constructor(private router: Router, private themeService: ThemeService) {
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

  getThemeLabel(theme: Theme): string {
    return this.themes.find(t => t.name === theme)?.label ?? theme;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.themeDropdownOpen = false;
  }

  navigateToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  onAccountClick(): void {
    this.accountClick.emit();
  }

  onWishlistClick(): void {
    this.wishlistClick.emit();
  }

  onCartClick(): void {
    this.cartClick.emit();
  }
}
