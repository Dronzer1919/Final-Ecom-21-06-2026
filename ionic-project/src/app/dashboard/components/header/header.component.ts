import { Component, inject, computed, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth';
import { ThemeService, Theme, ThemeOption } from '../../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  @Input() wishlistCount: number = 0;
  @Input() cartItemCount: number = 0;
  @Input() activeRoute: string = '';

  showNotifications = false;
  showProfile = false;
  searchQuery = '';
  themeDropdownOpen = false;
  themes: ThemeOption[] = this.themeService.availableThemes;
  currentTheme: Theme = this.themeService.getCurrentTheme();

  // Get current user from auth service
  currentUser = this.authService.currentUser;
  userFullName = computed(() => {
    const user = this.currentUser();
    if (user) {
      return user.fullName || 'Guest User';
    }
    return 'Guest User';
  });
  userEmail = computed(() => {
    const user = this.currentUser();
    return user?.email || 'guest@dreamspos.com';
  });
  
  notifications = [
    { id: 1, message: 'New order received', time: '5 min ago', read: false },
    { id: 2, message: 'Product stock is low', time: '1 hour ago', read: false },
    { id: 3, message: 'Payment received', time: '2 hours ago', read: true }
  ];
  
  unreadCount = this.notifications.filter(n => !n.read).length;

  toggleThemeDropdown(event: Event): void {
    event.stopPropagation();
    this.themeDropdownOpen = !this.themeDropdownOpen;
    this.showNotifications = false;
    this.showProfile = false;
  }

  selectTheme(theme: Theme, event: Event): void {
    event.stopPropagation();
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
    this.themeDropdownOpen = false;
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.themeDropdownOpen = false;
    this.showNotifications = false;
    this.showProfile = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.themeDropdownOpen = false;
    this.showProfile = false;
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.themeDropdownOpen = false;
    this.showNotifications = false;
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }

  resetPassword(): void {
    // Navigate to forgot password page for password reset
    this.router.navigate(['/auth/forgot-password']);
    
    // Close dropdown
    this.showProfile = false;
  }

  logout(): void {
    // Use AuthService's signOut method which handles backend logout + cleanup
    this.authService.signOut();
    
    // Close dropdown
    this.showProfile = false;
  }
}
