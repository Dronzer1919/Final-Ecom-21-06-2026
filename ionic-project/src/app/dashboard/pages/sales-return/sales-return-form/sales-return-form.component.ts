import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface SalesReturnProduct {
  no: number;
  productName: string;
  productNumber: string;
  specifications: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  remarks: string;
}

interface SalesReturnDetail {
  srNumber: string;
  date: string;
  originalInvoiceNumber: string;
  originalInvoiceDate: string;
  customerName: string;
  contractNumber: string;
  contactAddress: string;
  contactPerson: string;
  returnReason: string;
  salesPerson: string;
  phoneNumber: string;
  taxRegistrationNumber: string;
  pickupInformation: string;
  accountBank: string;
  products: SalesReturnProduct[];
  discount: number;
  amount: number;
  total: number;
  taxAmount:number;
  shippingFee: number;
  grandTotal: number;
  otherRemarks: string;
}

@Component({
  selector: 'app-sales-return-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-return-form.component.html',
  styleUrls: ['./sales-return-form.component.scss']
})
export class SalesReturnFormComponent implements OnInit {
  salesReturn: SalesReturnDetail | null = null;
  srNumber: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.srNumber = this.route.snapshot.params['id'];
    this.loadSalesReturn();
  }

  loadSalesReturn(): void {
    // Mock data - replace with actual service call
    const mockData: SalesReturnDetail = {
      srNumber: this.srNumber || 'SR-0001',
      date: '20/01/2026',
      originalInvoiceNumber: 'INV-0001',
      originalInvoiceDate: '15/01/2026',
      customerName: 'ABC Corporation',
      contractNumber: 'CON-2024-001',
      contactAddress: '123 Business Street, City, State 12345',
      contactPerson: 'John Doe',
      returnReason: 'Defective Product',
      salesPerson: 'Jane Smith',
      phoneNumber: '+91 98765 43210',
      taxRegistrationNumber: 'GSTIN1234567890',
      pickupInformation: 'Warehouse A, Section 5',
      accountBank: 'State Bank - Account #1234567890',
      products: [
        {
          no: 1,
          productName: 'Product A',
          productNumber: 'PRD-A-001',
          specifications: 'Standard Specification',
          quantity: 2,
          unit: 'pcs',
          unitPrice: 500,
          subtotal: 1000,
          remarks: 'Minor scratches'
        },
        {
          no: 2,
          productName: 'Product B',
          productNumber: 'PRD-B-002',
          specifications: 'Premium Grade',
          quantity: 1,
          unit: 'pcs',
          unitPrice: 1500,
          subtotal: 1500,
          remarks: 'Color mismatch'
        }
      ],
      discount: 100,
      amount: 2500,
      total: 2400,
      taxAmount: 432,
      shippingFee: 50,
      grandTotal: 2882,
      otherRemarks: 'Please arrange pickup within 3 business days.'
    };

    this.salesReturn = mockData;
  }

  hideNavigationForPrint(): void {
    const elements = document.querySelectorAll('.dashboard-sidebar, .dashboard-header, nav, .navbar, .top-bar');
    elements.forEach((el: Element) => {
      (el as HTMLElement).style.display = 'none';
    });
  }

  restoreNavigationAfterPrint(): void {
    const elements = document.querySelectorAll('.dashboard-sidebar, .dashboard-header, nav, .navbar, .top-bar');
    elements.forEach((el: Element) => {
      (el as HTMLElement).style.display = '';
    });
  }

  printForm(): void {
    this.hideNavigationForPrint();
    setTimeout(() => {
      window.print();
      setTimeout(() => this.restoreNavigationAfterPrint(), 100);
    }, 100);
  }

  downloadPDF(): void {
    this.printForm();
  }

  generateInvoice(): void {
    const mappedInvoiceNo = this.salesReturn?.originalInvoiceNumber?.trim() || this.srNumber.replace(/^SR/i, 'INV');
    if (!mappedInvoiceNo) {
      return;
    }

    this.router.navigate(['/dashboard/invoices', mappedInvoiceNo]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/sales-return']);
  }
}
