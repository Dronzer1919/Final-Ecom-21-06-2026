import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface SectionItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-b2b-sections-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './b2b-sections-grid.component.html',
  styleUrls: ['./b2b-sections-grid.component.scss']
})
export class B2BSectionsGridComponent implements OnInit {
  @Output() sectionSelected = new EventEmitter<SectionItem>();

  sections: SectionItem[] = [];
  filtered: SectionItem[] = [];
  searchTerm = '';
  isLoading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSections();
  }

  private async loadSections(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const res = await lastValueFrom(
        this.http.get<any>(`${environment.apiUrl}/categories?limit=100`)
      );
      const raw: any[] = res?.data?.categories ?? [];
      this.sections = raw.map(c => ({
        id: c._id,
        name: c.name,
        icon: c.icon ?? '🛒',
        description: c.description ?? '',
        image: c.image ?? ''
      }));
      this.filtered = [...this.sections];
    } catch {
      this.error = 'Failed to load categories.';
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = term
      ? this.sections.filter(s => s.name.toLowerCase().includes(term))
      : [...this.sections];
  }

  select(section: SectionItem): void {
    this.sectionSelected.emit(section);
  }
}
