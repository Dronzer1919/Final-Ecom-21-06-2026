import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';

interface Biller {
  code: string;
  name: string;
  avatar: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-billers',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './billers.component.html',
  styleUrls: ['./billers.component.scss']
})
export class BillersComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  isLoading = true;

  constructor(private exportService: ExportService) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  billers: Biller[] = [
    { code: 'BI001', name: 'Shaun Farley', avatar: '👤', companyName: 'GreenTech Industries', email: 'shaun@example.com', phone: '+18064781254', country: 'USA', status: 'Active' },
    { code: 'BI002', name: 'Jenny Ellis', avatar: '👤', companyName: 'BlueSky Logistics', email: 'jenny@example.com', phone: '+13375521863', country: 'Germany', status: 'Active' },
    { code: 'BI003', name: 'Leon Baxter', avatar: '👤', companyName: 'EcoFarm Organics', email: 'leon@example.com', phone: '+18486275831', country: 'Japan', status: 'Active' },
    { code: 'BI004', name: 'Karen Flores', avatar: '👤', companyName: 'SmartTech Solutions', email: 'karen@example.com', phone: '+18731498524', country: 'Austria', status: 'Active' },
    { code: 'BI005', name: 'Michael Dawson', avatar: '👤', companyName: 'Fresh Supplies', email: 'michael@example.com', phone: '+12876926738', country: 'Turkey', status: 'Active' },
    { code: 'BI006', name: 'Karen Galvin', avatar: '👤', companyName: 'BrightSource Lighting', email: 'karen@example.com', phone: '+17534698148', country: 'Mexico', status: 'Active' },
    { code: 'BI007', name: 'Thomas Ward', avatar: '👤', companyName: 'GlobalTech Industries', email: 'thomas@example.com', phone: '+16482479624', country: 'France', status: 'Active' },
    { code: 'BI008', name: 'Alisa Duncan', avatar: '👤', companyName: 'HealthWell Pharma', email: 'alisa@example.com', phone: '+13376884927', country: 'Greece', status: 'Active' },
    { code: 'BI009', name: 'James Higham', avatar: '👤', companyName: 'HomeStyle Furnishings', email: 'james@example.com', phone: '+13675196483', country: 'Italy', status: 'Active' },
    { code: 'BI010', name: 'Jade Robinson', avatar: '👤', companyName: 'EcoLogistics Partners', email: 'robinson@example.com', phone: '+17568145243', country: 'China', status: 'Active' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredBillers.length / this.rowsPerPage);
  }

  get filteredBillers(): Biller[] {
    return this.billers.filter(biller => {
      const matchesSearch = !this.searchTerm || 
        biller.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        biller.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        biller.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        biller.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || biller.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedBillers(): Biller[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredBillers.slice(start, end);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onView(biller: Biller): void {
    console.log('View biller:', biller);
  }

  onEdit(biller: Biller): void {
    console.log('Edit biller:', biller);
  }

  onDelete(biller: Biller): void {
    if (confirm(`Are you sure you want to delete ${biller.name}?`)) {
      this.billers = this.billers.filter(b => b !== biller);
      console.log('Deleted biller:', biller);
    }
  }

  exportPDF(): void {
    if (this.filteredBillers.length === 0) {
      alert('No billers to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Code', dataKey: 'code', width: 25 },
      { header: 'Name', dataKey: 'name', width: 40 },
      { header: 'Company', dataKey: 'companyName', width: 45 },
      { header: 'Email', dataKey: 'email', width: 50 },
      { header: 'Phone', dataKey: 'phone', width: 35 },
      { header: 'Country', dataKey: 'country', width: 30 },
      { header: 'Status', dataKey: 'status', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.filteredBillers,
      columns,
      'billers-list',
      'Billers List'
    );
  }

  exportExcel(): void {
    if (this.filteredBillers.length === 0) {
      alert('No billers to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Code', dataKey: 'code' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Company Name', dataKey: 'companyName' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Country', dataKey: 'country' },
      { header: 'Status', dataKey: 'status' }
    ];

    this.exportService.exportToExcel(
      this.filteredBillers,
      columns,
      'billers-list',
      'Billers'
    );
  }
}
