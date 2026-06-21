import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { B2BSectionsGridComponent, SectionItem } from './components/b2b-sections-grid/b2b-sections-grid.component';
import { B2BSubcategoriesGridComponent, SubcategoryItem } from './components/b2b-subcategories-grid/b2b-subcategories-grid.component';
import { B2BSubSubCategoriesGridComponent, SubSubCategoryItem } from './components/b2b-subsubcategories-grid/b2b-subsubcategories-grid.component';

type View = 'sections' | 'subcategories' | 'subsubcategories';

@Component({
  selector: 'app-b2b-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    AppHeaderComponent,
    B2BSectionsGridComponent,
    B2BSubcategoriesGridComponent,
    B2BSubSubCategoriesGridComponent
  ],
  templateUrl: './b2b-categories.page.html',
  styleUrls: ['./b2b-categories.page.scss']
})
export class B2BCategoriesPage {
  view: View = 'sections';
  selectedSection: SectionItem | null = null;
  selectedCategory: SubcategoryItem | null = null;

  constructor(private router: Router) {}

  onSectionSelected(section: SectionItem): void {
    this.selectedSection = section;
    this.view = 'subcategories';
  }

  onCategorySelected(category: SubcategoryItem): void {
    this.selectedCategory = category;
    this.view = 'subsubcategories';
  }

  onSubSubCategorySelected(item: SubSubCategoryItem): void {
    this.router.navigate(['/b2b-subcategory', item.categoryId, item.id]);
  }

  goToSections(): void {
    this.selectedSection = null;
    this.selectedCategory = null;
    this.view = 'sections';
  }

  goToSubcategories(): void {
    this.selectedCategory = null;
    this.view = 'subcategories';
  }
}
