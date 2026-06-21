import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  heartOutline,
  personCircleOutline,
  colorPaletteOutline,
  searchOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonIcon,
  ]
})
export class AppHeaderComponent {
  @Input() showSearch: boolean = true;
  @Input() title: string = '';
  @Input() showThemeToggle: boolean = true;
  @Output() onThemeToggle = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<string>();
  searchQuery = '';

  constructor(
    public cartService: CartService,
    public wishlistService: WishlistService
  ) {
    addIcons({ 
      cartOutline, 
      heartOutline, 
      personCircleOutline, 
      colorPaletteOutline,
      searchOutline,
    });
  }

  toggleTheme() {
    this.onThemeToggle.emit();
  }

  handleSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.onSearch.emit(query);
  }

  submitSearch() {
    this.onSearch.emit(this.searchQuery.trim());
  }
}
