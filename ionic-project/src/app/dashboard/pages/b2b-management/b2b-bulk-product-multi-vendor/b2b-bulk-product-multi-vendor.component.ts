import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { B2BManagementService, B2BVendor } from '../../../../services/b2b-management.service';
import { ToastService } from '../../../../services/toast.service';
import { environment } from '../../../../../environments/environment';
import * as XLSX from 'xlsx';

interface BulkTier {
  quantity: number;
  unit: string;
  price: number;
  discount: number;
}

interface ResolvedVendor {
  vendorId: string;          // real _id from DB
  vendorName: string;        // display name
  supplierCode?: string;
  city?: string;
  hasGST?: boolean;
  vendorPrice: string;
  minOrderQty: string;
  variety: string;
  bulkPricing: BulkTier[];
  matched: boolean;          // false = name not found in DB
}

interface MultiVendorProductRow {
  productName: string;
  itemCode: string;
  category: string;
  subCategory: string;
  unit: string;
  store: string;
  warehouse: string;
  price: string;
  quantity: string;
  description: string;
  discountType: string;
  discountValue: string;
  quantityAlert: string;
  vendors: ResolvedVendor[];
  _rowIndex: number;
  _hasError: boolean;
  _errorReason: string;
}

@Component({
  selector: 'app-b2b-bulk-product-multi-vendor',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-bulk-product-multi-vendor.component.html',
  styleUrls: ['./b2b-bulk-product-multi-vendor.component.scss']
})
export class B2BBulkProductMultiVendorComponent implements OnInit {
  isDragging = false;
  uploadedFile: File | null = null;
  groupedProducts: MultiVendorProductRow[] = [];
  parseError = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uploadResults: { productName: string; success: boolean; vendorCount: number; errors?: string[] }[] = [];

  // Loaded from DB
  loadedVendors: B2BVendor[] = [];
  vendorsLoading = true;
  vendorsLoadError = '';

  readonly REQUIRED = ['Product Name', 'Item Code', 'Category Name', 'Sub-Sub Category Name', 'Unit', 'Store', 'Warehouse', 'Price', 'Quantity', 'Vendor Name'];

  readonly templateHeaders = [
    'Product Name', 'Item Code', 'Category Name', 'Sub-Category Name',
    'Sub-Sub Category Name', 'Unit', 'Store', 'Warehouse',
    'Price', 'Quantity', 'Description',
    'Vendor Name', 'Vendor Price', 'Variety', 'Min Order Qty',
    'Tier1 Qty', 'Tier1 Price', 'Tier1 Disc%',
    'Tier2 Qty', 'Tier2 Price', 'Tier2 Disc%',
    'Tier3 Qty', 'Tier3 Price', 'Tier3 Disc%',
    'Discount Type', 'Discount Value', 'Qty Alert'
  ];

  constructor(
    private b2bService: B2BManagementService,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAllVendors();
  }

  loadAllVendors(): void {
    this.vendorsLoading = true;
    this.vendorsLoadError = '';
    // Load up to 500 vendors so we can do client-side name matching
    this.b2bService.getVendors(1, 500).subscribe({
      next: (res) => {
        this.loadedVendors = res?.data?.vendors ?? [];
        this.vendorsLoading = false;
        // Re-run mapping if a file was already uploaded before vendors loaded
        if (this.uploadedFile) this.reProcessLastFile();
      },
      error: () => {
        this.vendorsLoading = false;
        this.vendorsLoadError = 'Could not load vendors from server. Name matching will be unavailable.';
      }
    });
  }

  private lastRawRows: any[] | null = null;

  private reProcessLastFile(): void {
    if (this.lastRawRows) this.mapAndGroup(this.lastRawRows);
  }

  // ── Vendor lookup ───────────────────────────────────────────────────────────

  private findVendor(nameOrCode: string): B2BVendor | undefined {
    const q = nameOrCode.trim().toLowerCase();
    return this.loadedVendors.find(v =>
      v.name?.toLowerCase() === q ||
      (v.supplierCode && v.supplierCode.toLowerCase() === q)
    );
  }

  // ── File handling ───────────────────────────────────────────────────────────

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
    this.parseError = ''; this.groupedProducts = [];
    this.successMessage = ''; this.errorMessage = '';
    this.lastRawRows = null;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'json'].includes(ext || '')) {
      this.parseError = 'Unsupported file type. Use .xlsx, .xls, .csv, or .json';
      return;
    }
    this.uploadedFile = file;
    const reader = new FileReader();
    if (ext === 'json') {
      reader.onload = ev => {
        try {
          const rows = JSON.parse(ev.target?.result as string);
          this.lastRawRows = rows;
          this.mapAndGroup(rows);
        } catch { this.parseError = 'Invalid JSON format.'; }
      };
      reader.readAsText(file);
    } else {
      reader.onload = ev => {
        try {
          const data = new Uint8Array(ev.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
          this.lastRawRows = rows;
          this.mapAndGroup(rows);
        } catch { this.parseError = 'Failed to parse file.'; }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  private mapAndGroup(rows: any[]): void {
    if (!Array.isArray(rows) || rows.length === 0) {
      this.parseError = 'No data rows found in the file.';
      return;
    }

    const productMap = new Map<string, MultiVendorProductRow>();

    rows.forEach((row, i) => {
      const productName = String(row['Product Name'] ?? '').trim();
      const itemCode    = String(row['Item Code'] ?? '').trim();
      const category    = String(row['Category Name'] ?? '').trim();
      const subCategory = String(row['Sub-Sub Category Name'] ?? row['Sub-Category Name'] ?? '').trim();
      const unit        = String(row['Unit'] ?? '').trim();
      const store       = String(row['Store'] ?? '').trim();
      const warehouse   = String(row['Warehouse'] ?? '').trim();
      const price       = String(row['Price'] ?? '').trim();
      const quantity    = String(row['Quantity'] ?? '').trim();
      const vendorInput = String(row['Vendor Name'] ?? '').trim();

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
      if (!vendorInput) errors.push('Vendor Name required');

      // Resolve vendor from loaded DB records
      const dbVendor = vendorInput ? this.findVendor(vendorInput) : undefined;

      // Parse structured tier columns: Tier1 Qty / Tier1 Price / Tier1 Disc%, etc.
      let bulkPricing: BulkTier[] = [];
      for (let t = 1; t <= 3; t++) {
        const tierQty   = +(row[`Tier${t} Qty`]   ?? 0);
        const tierPrice = +(row[`Tier${t} Price`]  ?? 0);
        const tierDisc  = +(row[`Tier${t} Disc%`]  ?? 0);
        if (tierQty > 0 && tierPrice > 0) {
          bulkPricing.push({ quantity: tierQty, unit: unit || 'Kg', price: tierPrice, discount: tierDisc });
        }
      }

      const resolvedVendor: ResolvedVendor = {
        vendorId:    dbVendor?._id ?? '',
        vendorName:  dbVendor?.name ?? vendorInput,
        supplierCode: dbVendor?.supplierCode,
        city:        dbVendor?.city,
        hasGST:      dbVendor?.hasGST,
        vendorPrice: String(row['Vendor Price'] ?? price).trim(),
        minOrderQty: String(row['Min Order Qty'] ?? dbVendor?.minOrderQty ?? '1').trim(),
        variety:     String(row['Variety'] ?? dbVendor?.variety ?? '').trim(),
        bulkPricing,
        matched:     !!dbVendor,
      };

      // Warn if vendor name was given but not found — not a hard error
      if (vendorInput && !dbVendor && !errors.length) {
        // soft warning only — product is still valid but vendor won't link to DB record
      }

      const key = itemCode || productName;

      if (productMap.has(key)) {
        productMap.get(key)!.vendors.push(resolvedVendor);
      } else {
        productMap.set(key, {
          productName, itemCode, category, subCategory,
          unit, store, warehouse, price, quantity,
          description:   String(row['Description'] ?? '').trim(),
          discountType:  String(row['Discount Type'] ?? 'None').trim(),
          discountValue: String(row['Discount Value'] ?? '0').trim(),
          quantityAlert: String(row['Qty Alert'] ?? '10').trim(),
          vendors: [resolvedVendor],
          _rowIndex:    i + 2,
          _hasError:    errors.length > 0,
          _errorReason: errors.join('; '),
        });
      }
    });

    this.groupedProducts = Array.from(productMap.values());
  }

  get validProducts(): MultiVendorProductRow[] { return this.groupedProducts.filter(p => !p._hasError); }
  get errorProducts(): MultiVendorProductRow[]  { return this.groupedProducts.filter(p => p._hasError); }
  get totalVendors(): number { return this.validProducts.reduce((s, p) => s + p.vendors.length, 0); }
  get unmatchedCount(): number {
    return this.validProducts.reduce((s, p) => s + p.vendors.filter(v => !v.matched).length, 0);
  }

  clearFile(): void {
    this.uploadedFile = null; this.groupedProducts = [];
    this.parseError = ''; this.successMessage = '';
    this.errorMessage = ''; this.uploadResults = [];
    this.lastRawRows = null;
  }

  downloadSampleExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.getSample());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'sample-bulk-multi-vendor.xlsx');
  }

  downloadSampleJSON(): void {
    const blob = new Blob([JSON.stringify(this.getSample(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'sample-bulk-multi-vendor.json'; a.click();
    URL.revokeObjectURL(a.href);
  }

  private getSample(): Record<string, string | number>[] {
    const base = {
      'Category Name': 'Grocery', 'Sub-Category Name': 'Grocery & Staples',
      'Sub-Sub Category Name': 'Rice',
      'Store': 'Main Store', 'Warehouse': 'Main Warehouse',
      'Unit': 'Kilogram', 'Discount Type': 'None', 'Discount Value': 0, 'Qty Alert': 50
    };
    const v1 = this.loadedVendors[0]?.name ?? 'Agro Fresh Traders';
    const v2 = this.loadedVendors[1]?.name ?? 'Sun Oil Distributors';
    const v3 = this.loadedVendors[2]?.name ?? 'Spice Garden';
    return [
      { ...base, 'Product Name': 'Indrayani Rice', 'Item Code': 'RICE-INDR-001', 'Price': 55, 'Quantity': 500, 'Description': 'Premium short-grain Indrayani rice from Pune',
        'Vendor Name': v1, 'Vendor Price': 52, 'Variety': 'Indrayani', 'Min Order Qty': 25,
        'Tier1 Qty': 25,  'Tier1 Price': 50, 'Tier1 Disc%': 4,
        'Tier2 Qty': 50,  'Tier2 Price': 48, 'Tier2 Disc%': 8,
        'Tier3 Qty': 100, 'Tier3 Price': 45, 'Tier3 Disc%': 13 },
      { ...base, 'Product Name': 'Indrayani Rice', 'Item Code': 'RICE-INDR-001', 'Price': 55, 'Quantity': 500, 'Description': 'Premium short-grain Indrayani rice from Pune',
        'Vendor Name': v2, 'Vendor Price': 54, 'Variety': 'Indrayani', 'Min Order Qty': 10,
        'Tier1 Qty': 10,  'Tier1 Price': 53, 'Tier1 Disc%': 2,
        'Tier2 Qty': 25,  'Tier2 Price': 51, 'Tier2 Disc%': 6,
        'Tier3 Qty': 0,   'Tier3 Price': 0,  'Tier3 Disc%': 0 },
      { ...base, 'Product Name': 'Indrayani Rice', 'Item Code': 'RICE-INDR-001', 'Price': 55, 'Quantity': 500, 'Description': 'Premium short-grain Indrayani rice from Pune',
        'Vendor Name': v3, 'Vendor Price': 50, 'Variety': 'Indrayani', 'Min Order Qty': 50,
        'Tier1 Qty': 0,   'Tier1 Price': 0,  'Tier1 Disc%': 0,
        'Tier2 Qty': 0,   'Tier2 Price': 0,  'Tier2 Disc%': 0,
        'Tier3 Qty': 0,   'Tier3 Price': 0,  'Tier3 Disc%': 0 },
      { ...base, 'Product Name': 'Basmati Rice', 'Item Code': 'RICE-BASM-001', 'Price': 95, 'Quantity': 300, 'Description': 'Long-grain aromatic Basmati rice',
        'Vendor Name': v1, 'Vendor Price': 90, 'Variety': 'Basmati', 'Min Order Qty': 10,
        'Tier1 Qty': 10,  'Tier1 Price': 88, 'Tier1 Disc%': 2,
        'Tier2 Qty': 50,  'Tier2 Price': 85, 'Tier2 Disc%': 5,
        'Tier3 Qty': 0,   'Tier3 Price': 0,  'Tier3 Disc%': 0 },
      { ...base, 'Product Name': 'Basmati Rice', 'Item Code': 'RICE-BASM-001', 'Price': 95, 'Quantity': 300, 'Description': 'Long-grain aromatic Basmati rice',
        'Vendor Name': v2, 'Vendor Price': 92, 'Variety': 'Basmati', 'Min Order Qty': 5,
        'Tier1 Qty': 0,   'Tier1 Price': 0,  'Tier1 Disc%': 0,
        'Tier2 Qty': 0,   'Tier2 Price': 0,  'Tier2 Disc%': 0,
        'Tier3 Qty': 0,   'Tier3 Price': 0,  'Tier3 Disc%': 0 },
    ];
  }

  onSubmit(): void {
    if (this.validProducts.length === 0) return;
    this.isSubmitting = true; this.successMessage = ''; this.errorMessage = '';
    this.uploadResults = [];

    const payload = {
      products: this.validProducts.map(p => ({
        productName:   p.productName,
        itemCode:      p.itemCode,
        category:      p.category,
        subCategory:   p.subCategory,
        unit:          p.unit,
        store:         p.store,
        warehouse:     p.warehouse,
        price:         +p.price,
        quantity:      +p.quantity,
        description:   p.description || undefined,
        discountType:  p.discountType || 'None',
        discountValue: +p.discountValue || 0,
        quantityAlert: +p.quantityAlert || 10,
        vendors: p.vendors.map(v => ({
          vendorId:    v.vendorId || undefined,
          vendorName:  v.vendorName,
          vendorPrice: +v.vendorPrice || +p.price,
          minOrderQty: +v.minOrderQty || 1,
          variety:     v.variety || undefined,
          bulkPricing: v.bulkPricing.length ? v.bulkPricing : undefined,
        }))
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/products/bulk-create-multi-vendor`, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.uploadResults = (res?.data?.results ?? []).map((r: any) => ({
          productName: r.productName,
          success:     r.success,
          vendorCount: r.vendorCount ?? 0,
          errors:      r.errors,
        }));
        const created = res?.data?.created ?? 0;
        const failed  = res?.data?.failed  ?? 0;
        if (failed === 0) {
          this.successMessage = `${created} product${created === 1 ? '' : 's'} created with ${this.totalVendors} vendor entries!`;
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
