import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router } from '@angular/router';

export interface DropdownOption {
  id: string | number;
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.scss'],
  host: {
    '[style.position]': '"relative"',
    '[style.z-index]': 'isOpen ? "500" : "auto"'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableDropdownComponent),
      multi: true
    }
  ]
})
export class SearchableDropdownComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() addNewRoute?: string;
  @Input() showAddNew: boolean = false;
  @Input() displayKey: string = 'name';
  @Input() valueKey: string = 'id';
  
  @Output() selectionChange = new EventEmitter<any>();
  @Output() addNewClick = new EventEmitter<void>();

  searchTerm: string = '';
  isOpen: boolean = false;
  selectedOption: DropdownOption | null = null;
  filteredOptions: DropdownOption[] = [];
  private currentValue: any = null;
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && this.currentValue) {
      // Re-find the selected option when options array changes
      this.selectedOption = this.options.find(opt => opt[this.valueKey] === this.currentValue) || null;
    }
    this.filteredOptions = this.filterOptions(this.searchTerm);
  }

  writeValue(value: any): void {
    this.currentValue = value;
    if (value) {
      this.selectedOption = this.options.find(opt => opt[this.valueKey] === value) || null;
    } else {
      this.selectedOption = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.searchTerm = '';
        this.filteredOptions = [...this.options];
        setTimeout(() => {
          const input = document.querySelector('.dropdown-search') as HTMLInputElement;
          input?.focus();
        }, 100);
      }
    }
  }

  selectOption(option: DropdownOption): void {
    this.selectedOption = option;
    this.currentValue = option[this.valueKey];
    this.isOpen = false;
    this.searchTerm = '';
    this.onChange(option[this.valueKey]);
    this.onTouched();
    this.selectionChange.emit(option);
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedOption = null;
    this.currentValue = null;
    this.searchTerm = '';
    this.onChange(null);
    this.onTouched();
    this.selectionChange.emit(null);
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filteredOptions = this.filterOptions(searchTerm);
  }

  private filterOptions(term: string): DropdownOption[] {
    if (!term || term.trim() === '') {
      return [...this.options];
    }
    const lowerTerm = term.toLowerCase();
    return this.options.filter(option =>
      option[this.displayKey]?.toString().toLowerCase().includes(lowerTerm)
    );
  }

  onAddNew(event: Event): void {
    event.stopPropagation();
    this.isOpen = false;
    this.addNewClick.emit();
    
    if (this.addNewRoute) {
      this.router.navigate([this.addNewRoute]);
    }
  }

  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-dropdown')) {
      this.isOpen = false;
    }
  }
}
