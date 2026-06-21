import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ThemeService, Theme, ThemeOption } from '../../services/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ThemeSelectorComponent implements OnInit {
  availableThemes: ThemeOption[] = [];
  currentTheme: Theme = 'default';

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.availableThemes = this.themeService.availableThemes;
    this.currentTheme = this.themeService.getCurrentTheme();
    
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  selectTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  isCurrentTheme(theme: Theme): boolean {
    return this.currentTheme === theme;
  }
}
