import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ProductService } from '../../../services/product.service';
import { B2BCatalogService } from '../../../services/b2b-catalog.service';
import * as XLSX from 'xlsx';

interface BulkProductRow {
  // Product Information
  store: string;
  warehouse: string;
  category: string;
  subCategory: string;
  brand: string;
  unit: string;
  itemCode: string;
  barcodeSymbology: string;
  productName: string;
  description: string;
  // Pricing & Stocks
  quantity: number | string;
  price: number | string;
  taxType: string;
  discountType: string;
  discountValue: number | string;
  quantityAlert: number | string;
  // Image
  imageUrl: string;
  // Custom Fields
  warranty: string;
  manufacturer: string;
  manufacturedDate: string;
  expiryOn: string;
  // Status
  status: string;
  // B2B Settings
  isB2B: string;
  variety: string;
  minOrderQuantity: number | string;
  supplierLocation: string;
  responseRate: number | string;
  hasGST: string;
  _rowIndex?: number;
  _hasError?: boolean;
}

@Component({
  selector: 'app-bulk-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './bulk-product.component.html',
  styleUrls: ['./bulk-product.component.scss']
})
export class BulkProductComponent implements OnInit {
  isDragging = false;
  uploadedFile: File | null = null;
  parsedRows: BulkProductRow[] = [];
  parseError = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  uploadResults: { row: number; productName: string; success: boolean; errors?: string[] }[] = [];

  readonly templateHeaders = [
    // Product Information
    'Store', 'Warehouse', 'Category', 'Sub Category', 'Brand', 'Unit',
    'Item Code', 'Barcode Symbology', 'Product Name', 'Description',
    // Pricing & Stocks
    'Quantity', 'Price', 'Tax Type', 'Discount Type', 'Discount Value', 'Quantity Alert',
    // Image (optional)
    'Image URL',
    // Custom Fields
    'Warranty', 'Manufacturer', 'Manufactured Date', 'Expiry On',
    // Status
    'Status',
    // B2B Settings (optional)
    'Is B2B', 'Variety', 'Min Order Qty', 'Supplier Location', 'Response Rate (%)', 'Has GST'
  ];

  constructor(private router: Router, private productService: ProductService, private b2bCatalogService: B2BCatalogService) {}

  ngOnInit(): void {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.processFile(files[0]);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.processFile(input.files[0]);
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
      reader.onload = (e) => {
        try {
          const rows: any[] = JSON.parse(e.target?.result as string);
          this.mapRows(rows);
        } catch {
          this.parseError = 'Failed to parse JSON. Please check the file format.';
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          this.mapRows(rows);
        } catch {
          this.parseError = 'Failed to parse file. Please check the format and try again.';
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  private mapRows(rows: any[]): void {
    this.parsedRows = rows.map((row, i) => ({
      store:            String(row['Store'] ?? ''),
      warehouse:        String(row['Warehouse'] ?? ''),
      category:         String(row['Category'] ?? ''),
      subCategory:      String(row['Sub Category'] ?? ''),
      brand:            String(row['Brand'] ?? ''),
      unit:             String(row['Unit'] ?? ''),
      itemCode:         String(row['Item Code'] ?? ''),
      barcodeSymbology: String(row['Barcode Symbology'] ?? ''),
      productName:      String(row['Product Name'] ?? ''),
      description:      String(row['Description'] ?? ''),
      quantity:         row['Quantity'] ?? '',
      price:            row['Price'] ?? '',
      taxType:          String(row['Tax Type'] ?? ''),
      discountType:     String(row['Discount Type'] ?? ''),
      discountValue:    row['Discount Value'] ?? '',
      quantityAlert:    row['Quantity Alert'] ?? '',
      imageUrl:         String(row['Image URL'] ?? '').trim(),
      warranty:         String(row['Warranty'] ?? ''),
      manufacturer:     String(row['Manufacturer'] ?? ''),
      manufacturedDate: String(row['Manufactured Date'] ?? ''),
      expiryOn:         String(row['Expiry On'] ?? ''),
      status:           String(row['Status'] ?? 'Active'),
      // B2B Settings
      isB2B:            String(row['Is B2B'] ?? 'No'),
      variety:          String(row['Variety'] ?? ''),
      minOrderQuantity: row['Min Order Qty'] ?? 1,
      supplierLocation: String(row['Supplier Location'] ?? ''),
      responseRate:     row['Response Rate (%)'] ?? '',
      hasGST:           String(row['Has GST'] ?? 'No'),
      _rowIndex:        i + 2,
      _hasError:        !row['Product Name'] || !row['Item Code'],
    }));
    if (this.parsedRows.length === 0) {
      this.parseError = 'No data rows found in the file.';
    }
  }

  downloadSampleJSON(): void {
    const blob = new Blob([JSON.stringify(this.getSampleData(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-products.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  downloadSampleExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.getSampleData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'sample-products.xlsx');
  }

  private getSampleData(): Record<string, string | number>[] {
    return [
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Rice',    'Brand': 'India Gate', 'Unit': 'Bag',    'Item Code': 'GRO-RIC-BSM1121',  'Barcode Symbology': 'CODE128', 'Product Name': 'Basmati Rice 1121 (25kg)',       'Description': '1121 Extra Long Grain Basmati Rice, aged 2 years, premium quality.',       'Quantity': 500,  'Price': 2800, 'Tax Type': 'Exclusive', 'Discount Type': 'Fixed',      'Discount Value': 100, 'Quantity Alert': 50,  'Image URL': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg', 'Warranty': '', 'Manufacturer': 'Punjab Agro Mills',     'Manufactured Date': '2024-01-01', 'Expiry On': '2026-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': '1121 Extra Long',   'Min Order Qty': 10, 'Supplier Location': 'Delhi, India',     'Response Rate (%)': 95, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Rice',    'Brand': 'Daawat',     'Unit': 'Bag',    'Item Code': 'GRO-RIC-PUSA',     'Barcode Symbology': 'CODE128', 'Product Name': 'Pusa Basmati Rice (25kg)',        'Description': 'Pusa Basmati 1509 rice, low GI, suitable for daily consumption.',          'Quantity': 800,  'Price': 2200, 'Tax Type': 'Exclusive', 'Discount Type': 'Percentage', 'Discount Value': 5,   'Quantity Alert': 80,  'Image URL': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg', 'Warranty': '', 'Manufacturer': 'Daawat Foods Ltd',      'Manufactured Date': '2024-02-01', 'Expiry On': '2026-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Pusa 1509',         'Min Order Qty': 20, 'Supplier Location': 'Haryana, India',   'Response Rate (%)': 92, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Rice',    'Brand': '',           'Unit': 'Bag',    'Item Code': 'GRO-RIC-SONA',     'Barcode Symbology': 'CODE128', 'Product Name': 'Sona Masoori Rice (25kg)',        'Description': 'Medium grain Sona Masoori rice, ideal for daily cooking and biryani.',     'Quantity': 1000, 'Price': 1800, 'Tax Type': 'Exclusive', 'Discount Type': 'Fixed',      'Discount Value': 50,  'Quantity Alert': 100, 'Image URL': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg', 'Warranty': '', 'Manufacturer': 'Andhra Rice Mills',     'Manufactured Date': '2024-03-01', 'Expiry On': '2026-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Sona Masoori',      'Min Order Qty': 20, 'Supplier Location': 'Andhra Pradesh',   'Response Rate (%)': 88, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Pulses',  'Brand': '',           'Unit': 'Bag',    'Item Code': 'GRO-PLS-TUR',      'Barcode Symbology': 'CODE128', 'Product Name': 'Toor Dal (50kg)',                'Description': 'Premium quality Toor Dal (Arhar), bold grains, high protein content.',     'Quantity': 600,  'Price': 5500, 'Tax Type': 'Exclusive', 'Discount Type': 'Percentage', 'Discount Value': 3,   'Quantity Alert': 60,  'Image URL': 'https://images.pexels.com/photos/5741026/pexels-photo-5741026.jpeg', 'Warranty': '', 'Manufacturer': 'MP Agro Traders',       'Manufactured Date': '2024-01-15', 'Expiry On': '2025-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Bold Grain',        'Min Order Qty': 5,  'Supplier Location': 'Madhya Pradesh',   'Response Rate (%)': 90, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Pulses',  'Brand': '',           'Unit': 'Bag',    'Item Code': 'GRO-PLS-CHN',      'Barcode Symbology': 'CODE128', 'Product Name': 'Chana Dal (50kg)',               'Description': 'Split Bengal grams, high fibre, low glycemic index, export quality.',      'Quantity': 400,  'Price': 4200, 'Tax Type': 'Exclusive', 'Discount Type': 'Fixed',      'Discount Value': 150, 'Quantity Alert': 40,  'Image URL': 'https://images.pexels.com/photos/5741026/pexels-photo-5741026.jpeg', 'Warranty': '', 'Manufacturer': 'Rajasthan Dal Mill',    'Manufactured Date': '2024-02-01', 'Expiry On': '2025-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Split Bengal Gram', 'Min Order Qty': 10, 'Supplier Location': 'Rajasthan, India', 'Response Rate (%)': 86, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Pulses',  'Brand': '',           'Unit': 'Bag',    'Item Code': 'GRO-PLS-MUNG',     'Barcode Symbology': 'CODE128', 'Product Name': 'Moong Dal (25kg)',               'Description': 'Washed yellow moong lentils, easy to digest, ideal for khichdi.',         'Quantity': 350,  'Price': 3800, 'Tax Type': 'Exclusive', 'Discount Type': 'Percentage', 'Discount Value': 4,   'Quantity Alert': 35,  'Image URL': 'https://images.pexels.com/photos/5741026/pexels-photo-5741026.jpeg', 'Warranty': '', 'Manufacturer': 'Gujarat Agro Foods',    'Manufactured Date': '2024-03-10', 'Expiry On': '2025-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Washed Yellow',     'Min Order Qty': 10, 'Supplier Location': 'Gujarat, India',   'Response Rate (%)': 91, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Spices',  'Brand': 'Everest',    'Unit': 'Carton', 'Item Code': 'GRO-SPC-CHN-PWD',  'Barcode Symbology': 'CODE128', 'Product Name': 'Red Chilli Powder (500g x 24)',  'Description': 'Pure Byadagi red chilli powder, mild heat, rich red colour.',              'Quantity': 200,  'Price': 3600, 'Tax Type': 'Inclusive', 'Discount Type': 'Percentage', 'Discount Value': 6,   'Quantity Alert': 20,  'Image URL': 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg', 'Warranty': '', 'Manufacturer': 'Everest Food Products', 'Manufactured Date': '2025-01-01', 'Expiry On': '2026-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Byadagi',           'Min Order Qty': 5,  'Supplier Location': 'Mumbai, India',    'Response Rate (%)': 97, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Spices',  'Brand': 'MDH',        'Unit': 'Carton', 'Item Code': 'GRO-SPC-CUMIN',    'Barcode Symbology': 'CODE128', 'Product Name': 'Cumin Seeds / Jeera (1kg x 12)', 'Description': 'Premium whole cumin seeds, strong aroma, hand sorted and cleaned.',        'Quantity': 150,  'Price': 1800, 'Tax Type': 'Inclusive', 'Discount Type': 'Fixed',      'Discount Value': 50,  'Quantity Alert': 15,  'Image URL': 'https://images.pexels.com/photos/4198936/pexels-photo-4198936.jpeg', 'Warranty': '', 'Manufacturer': 'MDH Spices Ltd',        'Manufactured Date': '2025-01-15', 'Expiry On': '2026-12-31', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Whole Cumin',       'Min Order Qty': 5,  'Supplier Location': 'Delhi, India',     'Response Rate (%)': 98, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Oil',     'Brand': 'Fortune',    'Unit': 'Carton', 'Item Code': 'GRO-OIL-SNF-5L',   'Barcode Symbology': 'CODE128', 'Product Name': 'Sunflower Oil (5L x 4)',          'Description': 'Refined sunflower oil, zero cholesterol, light texture, good for frying.', 'Quantity': 300,  'Price': 3200, 'Tax Type': 'Inclusive', 'Discount Type': 'Percentage', 'Discount Value': 5,   'Quantity Alert': 30,  'Image URL': 'https://images.pexels.com/photos/1022385/pexels-photo-1022385.jpeg', 'Warranty': '', 'Manufacturer': 'Adani Wilmar Ltd',      'Manufactured Date': '2025-02-01', 'Expiry On': '2026-08-01', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'Refined',           'Min Order Qty': 10, 'Supplier Location': 'Ahmedabad, India', 'Response Rate (%)': 94, 'Has GST': 'Yes' },
      { 'Store': 'Main Store', 'Warehouse': 'Main Warehouse', 'Category': 'Grocery', 'Sub Category': 'Sugar',   'Brand': '',           'Unit': 'Bag',    'Item Code': 'GRO-SGR-S30',      'Barcode Symbology': 'CODE128', 'Product Name': 'S30 White Sugar (50kg)',          'Description': 'FSSAI approved S30 grade refined white sugar for bulk B2B supply.',        'Quantity': 1500, 'Price': 2100, 'Tax Type': 'Exclusive', 'Discount Type': 'Fixed',      'Discount Value': 100, 'Quantity Alert': 150, 'Image URL': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg', 'Warranty': '', 'Manufacturer': 'UP Sugar Mills',        'Manufactured Date': '2025-01-01', 'Expiry On': '2027-01-01', 'Status': 'Active', 'Is B2B': 'Yes', 'Variety': 'S30 Grade',         'Min Order Qty': 20, 'Supplier Location': 'Uttar Pradesh',    'Response Rate (%)': 89, 'Has GST': 'Yes' },
    ];
  }

  get validRows(): BulkProductRow[] {
    return this.parsedRows.filter(r => !r._hasError);
  }

  get errorRows(): BulkProductRow[] {
    return this.parsedRows.filter(r => r._hasError);
  }

  clearFile(): void {
    this.uploadedFile = null;
    this.parsedRows = [];
    this.parseError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadResults = [];
  }

  onSubmit(): void {
    if (this.validRows.length === 0) return;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadResults = [];

    const payload = this.validRows.map(row => ({
      store:            row.store,
      warehouse:        row.warehouse,
      category:         row.category,
      subCategory:      row.subCategory,
      brand:            row.brand,
      unit:             row.unit,
      barcodeSymbology: row.barcodeSymbology,
      itemCode:         row.itemCode,
      productName:      row.productName,
      description:      row.description,
      quantity:         row.quantity,
      price:            row.price,
      taxType:          row.taxType,
      discountType:     row.discountType,
      discountValue:    row.discountValue,
      quantityAlert:    row.quantityAlert,
      warranty:         row.warranty,
      manufacturer:     row.manufacturer,
      manufacturedDate: row.manufacturedDate,
      expiryOn:         row.expiryOn,
      status:           row.status || 'Active',
      images:           row.imageUrl
                          ? row.imageUrl.split(',').map((u: string) => u.trim()).filter(Boolean)
                          : [],
      // B2B Settings
      isB2B:            row.isB2B?.toLowerCase() === 'yes',
      ...(row.isB2B?.toLowerCase() === 'yes' && {
        variety:          row.variety || undefined,
        minOrderQuantity: Number(row.minOrderQuantity) || 1,
        supplierLocation: row.supplierLocation || undefined,
        responseRate:     row.responseRate !== '' ? Number(row.responseRate) : undefined,
        hasGST:           row.hasGST?.toLowerCase() === 'yes',
      }),
    }));

    this.productService.bulkCreateProducts(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Push B2B rows to the catalog service
        const b2bRows = this.validRows
          .filter(r => r.isB2B?.toLowerCase() === 'yes')
          .map(r => ({
            isB2B: r.isB2B,
            itemCode: r.itemCode,
            productName: r.productName,
            category: r.category,
            subCategory: r.subCategory,
            price: r.price,
            unit: r.unit
          }));
        if (b2bRows.length > 0) {
          this.b2bCatalogService.addBulkB2BProducts(b2bRows);
        }
        if (response?.data) {
          this.uploadResults = response.data.results || [];
          const created = response.data.created || 0;
          const failed  = response.data.failed  || 0;
          if (failed === 0) {
            const b2bCount = b2bRows.length;
            this.successMessage = `${created} product(s) created successfully!` + (b2bCount > 0 ? ` ${b2bCount} added to B2B marketplace.` : '');
            this.parsedRows = [];
            this.uploadedFile = null;
          } else {
            this.successMessage = `${created} product(s) created.`;
            this.errorMessage  = `${failed} product(s) failed — see details below.`;
          }
        } else {
          this.successMessage = response?.message || 'Upload complete.';
          this.parsedRows = [];
          this.uploadedFile = null;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Upload failed. Please check your data and try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/products']);
  }
}
