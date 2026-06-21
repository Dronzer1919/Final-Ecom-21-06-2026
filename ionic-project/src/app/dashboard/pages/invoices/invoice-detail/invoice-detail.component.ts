import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

export type InvoiceLineItem = { description: string; quantity: number; price: number; total: number };
type CustomerType = 'individual' | 'business';

interface InvoiceListState {
  invoiceNo: string;
  date: string;
  customer: string;
  customerType: CustomerType;
  companyName?: string;
  taxId?: string;
  amount: number;
  paid: number;
  due: number;
  paymentMethod: string;
}

export interface InvoiceDetail {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  sellerName: string;
  sellerAddress: string;
  sellerCity: string;
  sellerEmail: string;
  sellerPhone: string;
  billToName: string;
  billToAddress: string;
  billToCity: string;
  billToEmail: string;
  billToPhone: string;
  customerType: CustomerType;
  billToCompany?: string;
  billToTaxId?: string;
  shipToName: string;
  shipToAddress: string;
  shipToCity: string;
  shipToEmail: string;
  shipToPhone: string;
  paymentTerms: string;
  items: { description: string; quantity: number; price: number; total: number }[];
  subtotal: number;
  taxRate: number;
  tax: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  termsConditions: string;
  paymentInfo: { bankName: string; accountNumber: string };
}

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  invoice: InvoiceDetail | null = null;
  invoiceId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.params['id'];
    this.loadInvoice();
  }

  loadInvoice(): void {
    const routeState = this.getInvoiceFromRouteState();

    if (routeState) {
      this.invoice = this.buildInvoiceFromListState(routeState);
      return;
    }

    // Fallback template when invoice is opened directly without navigation state.
    this.invoice = {
      invoiceNo: this.invoiceId,
      invoiceDate: '1/01/2026',
      dueDate: '31/01/2026',
      poNumber: '',

      sellerName: 'Invoice Fly',
      sellerAddress: '5740, N Sheridan Road,',
      sellerCity: 'Chicago, IL 4640',
      sellerEmail: 'Albert@invoicefly.com',
      sellerPhone: '123-456-789',

      billToName: 'Walk-in Customer',
      billToAddress: 'Fifth Avenue New York,',
      billToCity: '10029',
      billToEmail: 'customer@email.com',
      billToPhone: '987-654-321',
      customerType: 'individual',

      shipToName: 'Walk-in Customer',
      shipToAddress: 'Client Street, City,',
      shipToCity: 'State, Zip Code',
      shipToEmail: 'customer@email.com',
      shipToPhone: '987-654-321',

      paymentTerms: 'Please pay within 30 days.',

      items: [
        { description: 'Item 1', quantity: 2, price: 100, total: 200 },
        { description: 'Item 2', quantity: 1, price: 150, total: 150 },
        { description: 'Item 3', quantity: 2, price: 300, total: 600 },
        { description: 'Item 4', quantity: 1, price: 300, total: 300 }
      ],

      subtotal: 1250,
      taxRate: 5,
      tax: 62,
      discount: 0,
      shipping: 0,
      totalAmount: 1312,
      amountPaid: 0,
      balanceDue: 1312,

      termsConditions: 'Client is responsible for all collection costs in the event of non-payment.',
      paymentInfo: {
        bankName: 'Billionaire Bank of America',
        accountNumber: '5677-4532-2271-3215'
      }
    };
  }

  private getInvoiceFromRouteState(): InvoiceListState | null {
    const routeInvoice = history.state?.invoice as InvoiceListState | undefined;

    if (!routeInvoice || !routeInvoice.invoiceNo) {
      return null;
    }

    if (routeInvoice.invoiceNo !== this.invoiceId) {
      return null;
    }

    return routeInvoice;
  }

  private buildInvoiceFromListState(source: InvoiceListState): InvoiceDetail {
    const taxRate = source.customerType === 'business' ? 18 : 5;
    const totalAmount = Number(source.amount.toFixed(2));
    const subtotal = Number((totalAmount / (1 + taxRate / 100)).toFixed(2));
    const tax = Number((totalAmount - subtotal).toFixed(2));

    const itemOneBase = Number((subtotal * 0.62).toFixed(2));
    const itemTwoBase = Number((subtotal - itemOneBase).toFixed(2));

    return {
      invoiceNo: source.invoiceNo,
      invoiceDate: source.date,
      dueDate: source.date,
      poNumber: source.customerType === 'business' ? `PO-${source.invoiceNo}` : '',

      sellerName: 'Invoice Fly',
      sellerAddress: '5740, N Sheridan Road,',
      sellerCity: 'Chicago, IL 4640',
      sellerEmail: 'Albert@invoicefly.com',
      sellerPhone: '123-456-789',

      billToName: source.customer,
      billToAddress: 'Fifth Avenue New York,',
      billToCity: '10029',
      billToEmail: 'customer@email.com',
      billToPhone: '987-654-321',
      customerType: source.customerType,
      billToCompany: source.customerType === 'business' ? (source.companyName || source.customer) : undefined,
      billToTaxId: source.customerType === 'business' ? source.taxId : undefined,

      shipToName: source.customer,
      shipToAddress: 'Client Street, City,',
      shipToCity: 'State, Zip Code',
      shipToEmail: 'customer@email.com',
      shipToPhone: '987-654-321',

      paymentTerms: source.customerType === 'business' ? 'Net 30 business days.' : 'Payment collected at checkout.',

      items: [
        { description: 'Primary product', quantity: 1, price: itemOneBase, total: itemOneBase },
        { description: 'Additional product', quantity: 1, price: itemTwoBase, total: itemTwoBase }
      ],

      subtotal,
      taxRate,
      tax,
      discount: 0,
      shipping: 0,
      totalAmount,
      amountPaid: Number(source.paid.toFixed(2)),
      balanceDue: Number(source.due.toFixed(2)),

      termsConditions: source.customerType === 'business'
        ? 'Business buyer must reconcile invoice details within 7 days of issue.'
        : 'Individual buyer may request return as per store return policy.',
      paymentInfo: {
        bankName: 'Billionaire Bank of America',
        accountNumber: '5677-4532-2271-3215'
      }
    };
  }

  printInvoice(): void {
    // Hide all parent navigation elements before printing
    this.hideNavigationForPrint();
    
    // Wait a bit for the DOM to update, then print
    setTimeout(() => {
      window.print();
      // Restore navigation after print dialog closes
      setTimeout(() => {
        this.restoreNavigationAfterPrint();
      }, 100);
    }, 100);
  }

  downloadPDF(): void {
    // Trigger browser print which can save as PDF
    this.hideNavigationForPrint();
    
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        this.restoreNavigationAfterPrint();
      }, 100);
    }, 100);
  }

  private hideNavigationForPrint(): void {
    // Add a class to body to hide navigation elements
    document.body.classList.add('printing-invoice');
    
    // Hide common dashboard elements
    const elementsToHide = [
      '.dashboard-sidebar',
      '.dashboard-header', 
      'nav',
      '.sidebar',
      '.header',
      '.navbar',
      '.top-bar'
    ];
    
    elementsToHide.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      });
    });
  }

  private restoreNavigationAfterPrint(): void {
    document.body.classList.remove('printing-invoice');
    
    // Restore elements
    const elementsToRestore = [
      '.dashboard-sidebar',
      '.dashboard-header',
      'nav', 
      '.sidebar',
      '.header',
      '.navbar',
      '.top-bar'
    ];
    
    elementsToRestore.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.removeProperty('display');
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/invoices']);
  }
}
