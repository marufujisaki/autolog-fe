import { ChangeDetectorRef, Component, computed, forwardRef, input, signal, inject } from '@angular/core';
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
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  /** Array of options to display in the select dropdown. */
  readonly options = input<SelectOption[]>([]);

  /** Placeholder text shown when no value is selected. */
  readonly placeholder = input('Select an option');

  /** Optional visible label rendered above the select. */
  readonly label = input<string>();

  /** Disables the select and applies the disabled visual state. */
  readonly disabled = input(false);

  /**
   * Reactive forms can also disable this control via `setDisabledState`
   * (ControlValueAccessor) — `input()` is read-only, so that path writes
   * here instead. `isDisabled` combines both sources.
   */
  private readonly disabledByForm = signal<boolean | null>(null);
  readonly isDisabled = computed(() => this.disabledByForm() ?? this.disabled());

  /** Validation error message shown below the select when present. */
  readonly errorMessage = input<string>();

  /** Unique id used to associate the `<label>` with the `<select>`. */
  readonly selectId = `app-select-${nextSelectId++}`;

  /** Current selected value. */
  value: string | number = '';

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

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
    this.disabledByForm.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }
}
