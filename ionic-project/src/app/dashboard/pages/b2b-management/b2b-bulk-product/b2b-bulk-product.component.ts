import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../services/toast.service';
import { environment } from '../../../../../environments/environment';
import * as XLSX from 'xlsx';

interface BulkProductRow {
  productName: string;
  itemCode: string;
  category: string;
  subCategory: string;       // sub-sub-category name (e.g. "Rice")
  unit: string;
  store: string;
  warehouse: string;
  price: string;
  quantity: string;
  vendorName: string;
  description: string;
  variety: string;
  minOrderQuantity: string;
  hasGST: string;
  taxType: string;
  discountType: string;
  discountValue: string;
  quantityAlert: string;
  _rowIndex: number;
  _hasError: boolean;
  _errorReason: string;
}

@Component({
  selector: 'app-b2b-bulk-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-bulk-product.component.html',
  styleUrls: ['./b2b-bulk-product.component.scss']
})
export class B2BBulkProductComponent implements OnInit {
  isDragging = false;
  uploadedFile: File | null = null;
  parsedRows: BulkProductRow[] = [];
  parseError = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uploadResults: { row: number; name: string; success: boolean; errors?: string[] }[] = [];

  readonly REQUIRED = ['Product Name', 'Item Code', 'Category Name', 'Sub-Sub Category Name', 'Unit', 'Store', 'Warehouse', 'Price', 'Quantity'];

  readonly templateHeaders = [
    'Product Name', 'Item Code', 'Category Name', 'Sub-Category Name',
    'Sub-Sub Category Name', 'Unit', 'Store', 'Warehouse', 'Price', 'Quantity',
    'Vendor Name', 'Description', 'Variety', 'Min Order Qty',
    'Has GST', 'Tax Type', 'Discount Type', 'Discount Value', 'Qty Alert'
  ];

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit(): void {}

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragging = true; }
  onDragLeave(): void { this.isDragging = false; }
  onDrop(e: DragEvent): void {
    e.preventDefault(); this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files?.length) this.processFile(files[0]);
  }
  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.processFile(input.files[0]);
  }

  processFile(file: File): void {
    this.parseError = ''; this.parsedRows = [];
    this.successMessage = ''; this.errorMessage = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'json'].includes(ext || '')) {
      this.parseError = 'Unsupported file type. Use .xlsx, .xls, .csv, or .json';
      return;
    }
    this.uploadedFile = file;
    const reader = new FileReader();
    if (ext === 'json') {
      reader.onload = ev => {
        try { this.mapRows(JSON.parse(ev.target?.result as string)); }
        catch { this.parseError = 'Invalid JSON format.'; }
      };
      reader.readAsText(file);
    } else {
      reader.onload = ev => {
        try {
          const data = new Uint8Array(ev.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          this.mapRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' }));
        } catch { this.parseError = 'Failed to parse file.'; }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  private mapRows(rows: any[]): void {
    if (!Array.isArray(rows) || rows.length === 0) {
      this.parseError = 'No data rows found in the file.';
      return;
    }
    this.parsedRows = rows.map((row, i) => {
      const productName = String(row['Product Name'] ?? '').trim();
      const itemCode    = String(row['Item Code'] ?? '').trim();
      const category    = String(row['Category Name'] ?? '').trim();
      const subCategory = String(row['Sub-Sub Category Name'] ?? row['Sub-Category Name'] ?? '').trim();
      const unit        = String(row['Unit'] ?? '').trim();
      const store       = String(row['Store'] ?? '').trim();
      const warehouse   = String(row['Warehouse'] ?? '').trim();
      const price       = String(row['Price'] ?? '').trim();
      const quantity    = String(row['Quantity'] ?? '').trim();

      const errors: string[] = [];
      if (!productName) errors.push('Product Name required');
      if (!itemCode)    errors.push('Item Code required');
      if (!category)    errors.push('Category Name required');
      if (!subCategory) errors.push('Sub-Sub Category Name required');
      if (!unit)        errors.push('Unit required');
      if (!store)       errors.push('Store required');
      if (!warehouse)   errors.push('Warehouse required');
      if (!price || isNaN(+price)) errors.push('Price must be a number');
      if (!quantity || isNaN(+quantity)) errors.push('Quantity must be a number');

      return {
        productName, itemCode, category,
        subCategory,
        unit, store, warehouse, price, quantity,
        vendorName:      String(row['Vendor Name'] ?? '').trim(),
        description:     String(row['Description'] ?? '').trim(),
        variety:         String(row['Variety'] ?? '').trim(),
        minOrderQuantity: String(row['Min Order Qty'] ?? '1').trim(),
        hasGST:          String(row['Has GST'] ?? 'No').trim(),
        taxType:         String(row['Tax Type'] ?? 'Exclusive').trim(),
        discountType:    String(row['Discount Type'] ?? 'None').trim(),
        discountValue:   String(row['Discount Value'] ?? '0').trim(),
        quantityAlert:   String(row['Qty Alert'] ?? '10').trim(),
        _rowIndex:   i + 2,
        _hasError:   errors.length > 0,
        _errorReason: errors.join('; '),
      };
    });
  }

  get validRows(): BulkProductRow[] { return this.parsedRows.filter(r => !r._hasError); }
  get errorRows(): BulkProductRow[]  { return this.parsedRows.filter(r => r._hasError); }

  clearFile(): void {
    this.uploadedFile = null; this.parsedRows = [];
    this.parseError = ''; this.successMessage = '';
    this.errorMessage = ''; this.uploadResults = [];
  }

  downloadSampleExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.getSample());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'sample-b2b-products.xlsx');
  }

  downloadSampleJSON(): void {
    const blob = new Blob([JSON.stringify(this.getSample(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'sample-b2b-products.json'; a.click();
    URL.revokeObjectURL(a.href);
  }

  private getSample(): Record<string, string | number>[] {
    const base = {
      'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',
      'Store': 'Main Store', 'Warehouse': 'Main Warehouse',
      'Unit': 'Kilogram', 'Tax Type': 'Exclusive',
      'Discount Type': 'None', 'Discount Value': 0, 'Qty Alert': 50
    };
    return [
      { ...base, 'Product Name': 'Indrayani Rice',   'Item Code': 'RICE-INDR-001', 'Sub-Sub Category Name': 'Rice', 'Price': 55,  'Quantity': 500, 'Vendor Name': 'Agro Fresh Traders', 'Variety': 'Indrayani', 'Min Order Qty': 25, 'Has GST': 'Yes', 'Description': 'Premium short-grain Indrayani rice from Pune' },
      { ...base, 'Product Name': 'Kolam Rice',        'Item Code': 'RICE-KOLA-001', 'Sub-Sub Category Name': 'Rice', 'Price': 48,  'Quantity': 400, 'Vendor Name': 'Agro Fresh Traders', 'Variety': 'Kolam',     'Min Order Qty': 25, 'Has GST': 'Yes', 'Description': 'Fine-grain Kolam rice, ideal for daily use' },
      { ...base, 'Product Name': 'Basmati Rice',      'Item Code': 'RICE-BASM-001', 'Sub-Sub Category Name': 'Rice', 'Price': 95,  'Quantity': 300, 'Vendor Name': 'Sun Oil Distributors','Variety': 'Basmati',   'Min Order Qty': 10, 'Has GST': 'Yes', 'Description': 'Long-grain aromatic Basmati rice' },
      { ...base, 'Product Name': 'Sona Masoori Rice', 'Item Code': 'RICE-SONA-001', 'Sub-Sub Category Name': 'Rice', 'Price': 52,  'Quantity': 600, 'Vendor Name': 'Sun Oil Distributors','Variety': 'Sona Masoori','Min Order Qty': 25,'Has GST': 'Yes', 'Description': 'Medium-grain lightweight Sona Masoori' },
      { ...base, 'Product Name': 'HMT Rice',          'Item Code': 'RICE-HMT-001',  'Sub-Sub Category Name': 'Rice', 'Price': 42,  'Quantity': 350, 'Vendor Name': 'Spice Garden',        'Variety': 'HMT',       'Min Order Qty': 50, 'Has GST': 'No',  'Description': 'HMT variety, sticky texture' },
      { ...base, 'Product Name': 'Surti Kolam Rice',  'Item Code': 'RICE-SURT-001', 'Sub-Sub Category Name': 'Rice', 'Price': 46,  'Quantity': 200, 'Vendor Name': 'Spice Garden',        'Variety': 'Surti Kolam','Min Order Qty': 25,'Has GST': 'No',  'Description': 'Surti Kolam - soft and fluffy after cooking' },
    ];
  }

  onSubmit(): void {
    if (this.validRows.length === 0) return;
    this.isSubmitting = true; this.successMessage = ''; this.errorMessage = '';
    this.uploadResults = [];

    const payload = {
      products: this.validRows.map(r => ({
        productName:      r.productName,
        itemCode:         r.itemCode,
        category:         r.category,
        subCategory:      r.subCategory,
        unit:             r.unit,
        store:            r.store,
        warehouse:        r.warehouse,
        price:            +r.price,
        quantity:         +r.quantity,
        vendorName:       r.vendorName || undefined,
        description:      r.description || undefined,
        variety:          r.variety || undefined,
        minOrderQuantity: +r.minOrderQuantity || 1,
        hasGST:           ['yes', 'true', '1'].includes(r.hasGST.toLowerCase()),
        taxType:          r.taxType || 'Exclusive',
        discountType:     r.discountType || 'None',
        discountValue:    +r.discountValue || 0,
        quantityAlert:    +r.quantityAlert || 10,
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/products/bulk-create`, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.uploadResults = (res?.data?.results ?? []).map((r: any) => ({
          row: r.row, name: r.productName, success: r.success, errors: r.errors
        }));
        const created = res?.data?.created ?? 0;
        const failed  = res?.data?.failed  ?? 0;
        if (failed === 0) {
          this.successMessage = `${created} product${created === 1 ? '' : 's'} created successfully!`;
          this.toast.success(this.successMessage);
          this.clearFile();
        } else {
          this.errorMessage = `${created} created, ${failed} failed. See results below.`;
          this.toast.error(this.errorMessage);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Bulk upload failed. Please try again.';
        this.toast.error(this.errorMessage);
      }
    });
  }
}
