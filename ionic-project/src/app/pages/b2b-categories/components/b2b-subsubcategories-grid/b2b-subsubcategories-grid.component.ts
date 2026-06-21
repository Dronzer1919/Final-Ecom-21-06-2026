import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface SubSubCategoryItem {
  id: string;
  name: string;
  icon: string;
  categoryId: string;
  image?: string;
}

@Component({
  selector: 'app-b2b-subsubcategories-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './b2b-subsubcategories-grid.component.html',
  styleUrls: ['./b2b-subsubcategories-grid.component.scss']
})
export class B2BSubSubCategoriesGridComponent implements OnChanges {
  @Input() categoryId = '';
  @Output() subSubCategorySelected = new EventEmitter<SubSubCategoryItem>();

  items: SubSubCategoryItem[] = [];
  filtered: SubSubCategoryItem[] = [];
  searchTerm = '';
  isLoading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      this.searchTerm = '';
      this.loadItems();
    }
  }

  private async loadItems(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    this.items = [];
    this.filtered = [];
    try {
      const res = await lastValueFrom(
        this.http.get<any>(
          `${environment.apiUrl}/sub-sub-categories?parentSubcategory=${this.categoryId}&limit=100`
        )
      );
      const raw: any[] = res?.data?.subcategories ?? [];
      this.items = raw.map((s: any) => ({
        id: s._id,
        name: s.name,
        icon: s.icon ?? '🗂️',
        categoryId: this.categoryId,
        image: s.image ?? ''
      }));
      this.filtered = [...this.items];
    } catch {
      this.error = 'Failed to load sub-sub-categories.';
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = term
      ? this.items.filter(s => s.name.toLowerCase().includes(term))
      : [...this.items];
  }

  select(item: SubSubCategoryItem): void {
    this.subSubCategorySelected.emit(item);
  }
}
