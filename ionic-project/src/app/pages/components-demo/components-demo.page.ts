import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { 
  ThemedButtonComponent, 
  ThemedAccordionComponent, 
  ThemedTableComponent, 
  ThemedCardComponent,
  AccordionItem,
  TableColumn,
  PaginationConfig
} from '../../components/reusable';

@Component({
  selector: 'app-components-demo',
  templateUrl: './components-demo.page.html',
  styleUrls: ['./components-demo.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
    CommonModule, FormsModule, RouterLink,
    ThemedButtonComponent, ThemedAccordionComponent, ThemedTableComponent, ThemedCardComponent
  ]
})
export class ComponentsDemoPage implements OnInit {
  
  // Accordion Data
  accordionItems: AccordionItem[] = [
    {
      title: 'What is Ionic Framework?',
      content: 'Ionic Framework is an open-source UI toolkit for building performant, high-quality mobile apps using web technologies like HTML, CSS, and JavaScript.',
      icon: 'information-circle',
      expanded: false
    },
    {
      title: 'How does theming work?',
      content: 'Our theming system uses CSS custom properties and SCSS mixins to create reusable, dynamic themes that can be switched at runtime.',
      icon: 'color-palette',
      expanded: false
    },
    {
      title: 'What are reusable components?',
      content: 'Reusable components are pre-built, configurable UI elements that maintain consistent styling and behavior across your application.',
      icon: 'cube',
      expanded: false
    }
  ];

  // Table Data
  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: false },
    { key: 'status', label: 'Status', sortable: true }
  ];

  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Editor', status: 'Active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', status: 'Active' },
    { id: 7, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'User', status: 'Inactive' },
    { id: 8, name: 'Fiona Green', email: 'fiona@example.com', role: 'Editor', status: 'Active' },
    { id: 9, name: 'George Wilson', email: 'george@example.com', role: 'User', status: 'Active' },
    { id: 10, name: 'Hannah Montana', email: 'hannah@example.com', role: 'User', status: 'Active' },
    { id: 11, name: 'Ian Malcolm', email: 'ian@example.com', role: 'Admin', status: 'Active' },
    { id: 12, name: 'Julia Roberts', email: 'julia@example.com', role: 'User', status: 'Inactive' }
  ];

  tablePagination: PaginationConfig = {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0
  };

  tableLoading = false;

  constructor() { }

  ngOnInit() {
    this.tablePagination.totalItems = this.tableData.length;
  }

  onButtonClick(message: string) {
    console.log(message);
  }

  onTablePageChange(page: number) {
    console.log('Page changed to:', page);
  }

  onTableSort(event: { column: string, direction: 'asc' | 'desc' }) {
    console.log('Sort:', event);
    // Implement sorting logic here
  }

  onTableRowClick(row: any) {
    console.log('Row clicked:', row);
  }
}
