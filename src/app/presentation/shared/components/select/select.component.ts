import { ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Option object for SelectComponent.
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

let nextSelectId = 0;

/**
 * Design System select component.
 *
 * Renders a native `<select>` element styled exclusively with SCSS design
 * tokens (see `presentation/shared/styles/_tokens.scss`). No third-party UI
 * library (e.g. Ionic's `ion-select`) is used for visual rendering, per
 * Requirements 12.3 and 12.5.
 *
 * Implements `ControlValueAccessor` so it can be used directly with Angular
 * reactive forms (`formControlName`) or `ngModel`.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  /** Array of options to display in the select dropdown. */
  @Input() options: SelectOption[] = [];

  /** Placeholder text shown when no value is selected. */
  @Input() placeholder = 'Select an option';

  /** Optional visible label rendered above the select. */
  @Input() label?: string;

  /** Disables the select and applies the disabled visual state. */
  @Input() disabled = false;

  /** Validation error message shown below the select when present. */
  @Input() errorMessage?: string;

  /** Unique id used to associate the `<label>` with the `<select>`. */
  readonly selectId = `app-select-${nextSelectId++}`;

  /** Current selected value. */
  value: string | number = '';

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  onSelectionChange(rawValue: string | number): void {
    this.value = rawValue;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  // ---------------------------------------------------------------------------
  // ControlValueAccessor implementation
  // ---------------------------------------------------------------------------

  writeValue(value: string | number): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }
}
