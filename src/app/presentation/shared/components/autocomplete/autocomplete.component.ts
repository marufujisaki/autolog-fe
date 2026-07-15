import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

let nextId = 0;

/**
 * Reusable autocomplete input component.
 * Fetches suggestions via a provided search function and displays a dropdown.
 */
@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
})
export class AutocompleteComponent implements ControlValueAccessor, OnDestroy {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() disabled = false;

  /** Function that performs the search and returns an Observable of string[] */
  @Input() searchFn?: (query: string) => Observable<string[]>;

  /** Emitted when a suggestion is selected */
  @Output() optionSelected = new EventEmitter<string>();

  readonly inputId = `app-autocomplete-${nextId++}`;

  value = '';
  suggestions: string[] = [];
  showDropdown = false;
  highlightedIndex = -1;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {
    this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 1 || !this.searchFn) {
            return of([]);
          }
          return this.searchFn(query);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((results) => {
        this.suggestions = results;
        this.showDropdown = results.length > 0;
        this.highlightedIndex = -1;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.searchSubject.next(this.value);
  }

  onBlur(): void {
    // Delay hiding to allow click on suggestion
    setTimeout(() => {
      this.showDropdown = false;
      this.cdr.markForCheck();
    }, 200);
    this.onTouched();
  }

  onFocus(): void {
    if (this.value && this.suggestions.length > 0) {
      this.showDropdown = true;
    }
  }

  selectOption(option: string): void {
    this.value = option;
    this.onChange(this.value);
    this.showDropdown = false;
    this.optionSelected.emit(option);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          this.suggestions.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0) {
          this.selectOption(this.suggestions[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        break;
    }
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
