import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface SubcategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-b2b-subcategories-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './b2b-subcategories-grid.component.html',
  styleUrls: ['./b2b-subcategories-grid.component.scss']
})
export class B2BSubcategoriesGridComponent implements OnChanges {
  @Input() sectionId = '';
  @Output() categorySelected = new EventEmitter<SubcategoryItem>();

  subcategories: SubcategoryItem[] = [];
  filtered: SubcategoryItem[] = [];
  searchTerm = '';
  isLoading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionId'] && this.sectionId) {
      this.searchTerm = '';
      this.loadSubcategories();
    }
  }

  private async loadSubcategories(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    this.subcategories = [];
    this.filtered = [];
    try {
      const res = await lastValueFrom(
        this.http.get<any>(`${environment.apiUrl}/subcategories?category=${this.sectionId}&limit=100`)
      );
      const raw: any[] = res?.data?.subcategories ?? [];
      this.subcategories = raw
        .filter((s: any) => !s.parentSubcategory)
        .map((s: any) => ({
          id: s._id,
          name: s.name,
          icon: s.icon ?? '📁',
          description: s.description ?? '',
          image: s.image ?? ''
        }));
      this.filtered = [...this.subcategories];
    } catch {
      this.error = 'Failed to load sub-categories.';
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = term
      ? this.subcategories.filter(s => s.name.toLowerCase().includes(term))
      : [...this.subcategories];
  }

  select(item: SubcategoryItem): void {
    this.categorySelected.emit(item);
  }
}
