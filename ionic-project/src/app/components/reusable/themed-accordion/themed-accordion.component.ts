import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface AccordionItem {
  title: string;
  content: string;
  icon?: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-themed-accordion',
  templateUrl: './themed-accordion.component.html',
  styleUrls: ['./themed-accordion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ThemedAccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() multiple: boolean = false; // Allow multiple items expanded
  @Input() color: string = 'primary';

  toggleItem(index: number) {
    const item = this.items[index];
    
    if (!this.multiple) {
      // Close all other items
      this.items.forEach((i, idx) => {
        if (idx !== index) {
          i.expanded = false;
        }
      });
    }
    
    item.expanded = !item.expanded;
  }

  isExpanded(index: number): boolean {
    return this.items[index]?.expanded || false;
  }
}
