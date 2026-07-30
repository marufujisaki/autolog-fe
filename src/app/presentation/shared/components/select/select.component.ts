import { ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';

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
 * Uses ion-select internally for a better native dropdown experience,
 * wrapped in the app's design token styling.
 *
 * Implements `ControlValueAccessor` for reactive forms and ngModel.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, IonSelect, IonSelectOption],
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

  onSelectionChange(event: any): void {
    const newValue = event?.detail?.value;
    if (newValue !== undefined) {
      this.value = newValue;
      this.onChange(this.value);
    }
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
