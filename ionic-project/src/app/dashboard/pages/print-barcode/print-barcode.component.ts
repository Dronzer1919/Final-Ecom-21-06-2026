import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

interface Product {
  name: string;
  sku: string;
  code: string;
  qty: number;
}

@Component({
  selector: 'app-print-barcode',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './print-barcode.component.html',
  styleUrls: ['./print-barcode.component.scss']
})
export class PrintBarcodeComponent {
  selectedWarehouse: string = '';
  selectedStore: string = '';
  searchProduct: string = '';
  selectedPaperSize: string = '';
  showStoreName: boolean = true;
  showProductName: boolean = true;
  showPrice: boolean = true;

  products: Product[] = [];

  onWarehouseChange(): void {
    console.log('Warehouse changed:', this.selectedWarehouse);
  }

  onStoreChange(): void {
    console.log('Store changed:', this.selectedStore);
  }

  onProductSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchProduct = input.value;
  }

  generateOffCode(): void {
    console.log('Generate Off Code');
  }

  resetBarcode(): void {
    this.selectedWarehouse = '';
    this.selectedStore = '';
    this.searchProduct = '';
    this.selectedPaperSize = '';
    this.showStoreName = true;
    this.showProductName = true;
    this.showPrice = true;
    this.products = [];
  }

  printBarcode(): void {
    console.log('Print Barcode');
  }
}
