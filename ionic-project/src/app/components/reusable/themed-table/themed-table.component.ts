import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

@Component({
  selector: 'app-themed-table',
  templateUrl: './themed-table.component.html',
  styleUrls: ['./themed-table.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ThemedTableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pagination: PaginationConfig = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  };
  @Input() loading: boolean = false;
  @Input() striped: boolean = true;
  @Input() hoverable: boolean = true;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ column: string, direction: 'asc' | 'desc' }>();
  @Output() rowClick = new EventEmitter<any>();

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  paginatedData: any[] = [];
  totalPages: number = 1;
  Math = Math; // Expose Math to template

  ngOnInit() {
    this.updatePagination();
  }

  ngOnChanges() {
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const endIndex = startIndex + this.pagination.pageSize;
    this.paginatedData = this.data.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.data.length / this.pagination.pageSize);
    this.pagination.totalItems = this.data.length;
  }

  onSort(column: TableColumn) {
    if (!column.sortable) return;
    
    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    
    this.sortChange.emit({ column: column.key, direction: this.sortDirection });
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pagination.currentPage = page;
    this.updatePagination();
    this.pageChange.emit(page);
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
