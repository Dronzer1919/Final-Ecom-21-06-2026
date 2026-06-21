import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2BManagementService } from '../../../../services/b2b-management.service';
import { ToastService } from '../../../../services/toast.service';
import * as XLSX from 'xlsx';

interface BulkVendorRow {
  name: string;
  supplierCode: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  location: string;
  locality: string;
  hasGST: string;
  gstNumber: string;
  rating: string;
  responseRate: string;
  minOrderQty: string;
  variety: string;
  memberSince: string;
  isActive: string;
  _rowIndex: number;
  _hasError: boolean;
  _errorReason: string;
}

@Component({
  selector: 'app-b2b-bulk-vendor',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-bulk-vendor.component.html',
  styleUrls: ['./b2b-bulk-vendor.component.scss']
})
export class B2BBulkVendorComponent implements OnInit {
  isDragging = false;
  uploadedFile: File | null = null;
  parsedRows: BulkVendorRow[] = [];
  parseError = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uploadResults: { row: number; name: string; success: boolean; error?: string }[] = [];

  readonly templateHeaders = [
    'Vendor Name', 'Supplier Code', 'Email', 'Phone', 'City', 'Address',
    'Location', 'Locality', 'Has GST', 'GST Number',
    'Rating', 'Response Rate', 'Min Order Qty', 'Variety', 'Member Since', 'Is Active'
  ];

  constructor(
    private b2bService: B2BManagementService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragging = true; }
  onDragLeave(): void { this.isDragging = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files?.length) this.processFile(files[0]);
  }

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.processFile(input.files[0]);
  }

  processFile(file: File): void {
    this.parseError = '';
    this.parsedRows = [];
    this.successMessage = '';
    this.errorMessage = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'json'].includes(ext || '')) {
      this.parseError = 'Invalid file type. Please upload .xlsx, .xls, .csv, or .json files.';
      return;
    }
    this.uploadedFile = file;
    const reader = new FileReader();
    if (ext === 'json') {
      reader.onload = (ev) => {
        try { this.mapRows(JSON.parse(ev.target?.result as string)); }
        catch { this.parseError = 'Failed to parse JSON. Please check the file format.'; }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
          this.mapRows(rows);
        } catch { this.parseError = 'Failed to parse file. Please check the format and try again.'; }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  private mapRows(rows: any[]): void {
    this.parsedRows = rows.map((row, i) => {
      const name = String(row['Vendor Name'] ?? '').trim();
      const errors: string[] = [];
      if (!name) errors.push('Vendor Name is required');

      const rating = parseFloat(String(row['Rating'] ?? '4'));
      if (row['Rating'] && (isNaN(rating) || rating < 1 || rating > 5)) errors.push('Rating must be 1–5');

      const responseRate = parseFloat(String(row['Response Rate'] ?? '100'));
      if (row['Response Rate'] && (isNaN(responseRate) || responseRate < 0 || responseRate > 100)) errors.push('Response Rate must be 0–100');

      return {
        name,
        supplierCode:  String(row['Supplier Code'] ?? '').trim(),
        email:         String(row['Email'] ?? '').trim(),
        phone:         String(row['Phone'] ?? '').trim(),
        city:          String(row['City'] ?? '').trim(),
        address:       String(row['Address'] ?? '').trim(),
        location:      String(row['Location'] ?? '').trim(),
        locality:      String(row['Locality'] ?? '').trim(),
        hasGST:        String(row['Has GST'] ?? 'No').trim(),
        gstNumber:     String(row['GST Number'] ?? '').trim(),
        rating:        String(row['Rating'] ?? '4').trim(),
        responseRate:  String(row['Response Rate'] ?? '100').trim(),
        minOrderQty:   String(row['Min Order Qty'] ?? '1').trim(),
        variety:       String(row['Variety'] ?? '').trim(),
        memberSince:   String(row['Member Since'] ?? '').trim(),
        isActive:      String(row['Is Active'] ?? 'Yes').trim(),
        _rowIndex:   i + 2,
        _hasError:   errors.length > 0,
        _errorReason: errors.join('; '),
      };
    });

    if (this.parsedRows.length === 0) {
      this.parseError = 'No data rows found in the file.';
    }
  }

  get validRows(): BulkVendorRow[] { return this.parsedRows.filter(r => !r._hasError); }
  get errorRows(): BulkVendorRow[] { return this.parsedRows.filter(r => r._hasError); }

  clearFile(): void {
    this.uploadedFile = null;
    this.parsedRows = [];
    this.parseError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadResults = [];
  }

  downloadSampleExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.getSample());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
    XLSX.writeFile(wb, 'sample-vendors.xlsx');
  }

  downloadSampleJSON(): void {
    const blob = new Blob([JSON.stringify(this.getSample(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-vendors.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private getSample(): Record<string, string>[] {
    return [
      {
        'Vendor Name': 'Agro Fresh Traders', 'Supplier Code': 'AFT-001', 'Email': 'agrofresh@example.com',
        'Phone': '9876543210', 'City': 'Pune', 'Address': '12 Market Road, Pune',
        'Location': 'Pune, Maharashtra', 'Locality': 'Market Yard',
        'Has GST': 'Yes', 'GST Number': '27AABCA1234A1Z5',
        'Rating': '4.5', 'Response Rate': '95', 'Min Order Qty': '50',
        'Variety': 'Rice, Pulses, Grains', 'Member Since': '2023', 'Is Active': 'Yes'
      },
      {
        'Vendor Name': 'Sun Oil Distributors', 'Supplier Code': 'SOD-002', 'Email': 'sunoil@example.com',
        'Phone': '9123456789', 'City': 'Mumbai', 'Address': '5 Dharavi Complex, Mumbai',
        'Location': 'Mumbai, Maharashtra', 'Locality': 'Dharavi',
        'Has GST': 'Yes', 'GST Number': '27BBBCA5678B2Z6',
        'Rating': '4.2', 'Response Rate': '88', 'Min Order Qty': '100',
        'Variety': 'Edible Oils', 'Member Since': '2022', 'Is Active': 'Yes'
      },
      {
        'Vendor Name': 'Spice Garden', 'Supplier Code': 'SG-003', 'Email': 'spicegarden@example.com',
        'Phone': '9988776655', 'City': 'Nashik', 'Address': '88 Spice Lane, Nashik',
        'Location': 'Nashik, Maharashtra', 'Locality': 'Panchavati',
        'Has GST': 'No', 'GST Number': '',
        'Rating': '3.8', 'Response Rate': '80', 'Min Order Qty': '25',
        'Variety': 'Spices & Masala', 'Member Since': '2024', 'Is Active': 'Yes'
      }
    ];
  }

  onSubmit(): void {
    if (this.validRows.length === 0) return;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadResults = [];

    const boolVal = (v: string) => ['yes', 'true', '1'].includes(v.toLowerCase());

    const payload = this.validRows.map(row => ({
      name:          row.name,
      supplierCode:  row.supplierCode || undefined,
      email:         row.email || undefined,
      phone:         row.phone || undefined,
      city:          row.city || undefined,
      address:       row.address || undefined,
      location:      row.location || undefined,
      locality:      row.locality || undefined,
      hasGST:        boolVal(row.hasGST),
      gstNumber:     row.gstNumber || undefined,
      rating:        parseFloat(row.rating) || 4.0,
      responseRate:  parseFloat(row.responseRate) || 100,
      minOrderQty:   parseInt(row.minOrderQty) || 1,
      variety:       row.variety || undefined,
      memberSince:   row.memberSince || undefined,
      isActive:      boolVal(row.isActive),
      isB2BVendor:   true,
    }));

    this.b2bService.bulkCreateVendors(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const created = res?.data?.created?.length ?? payload.length;
        const failed  = res?.data?.errors?.length  ?? 0;
        const skipped = res?.data?.skipped?.length ?? 0;
        if (failed === 0) {
          this.successMessage = `${created} vendor${created === 1 ? '' : 's'} created${skipped ? ', ' + skipped + ' skipped (duplicate)' : ''}.`;
          this.toast.success(this.successMessage);
          this.clearFile();
        } else {
          this.errorMessage = `${created} created, ${skipped} skipped, ${failed} failed.`;
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
