import { ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, EyeIcon, EyeOffIcon } from 'lucide-angular';

/**
 * Native `<input>` types supported by the Design System input component.
 */
export type InputType =
  | 'text'
  | 'password'
  | 'search'
  | 'date'
  | 'number'
  | 'email'
  | 'tel';

/**
 * Validation states supported by the Design System input component.
 * Defaults to "default" (no validation feedback shown).
 */
export type InputState = 'default' | 'error' | 'success';

let nextInputId = 0;

/**
 * Design System input component.
 *
 * Renders a native `<input>` element styled exclusively with SCSS design
 * tokens (see `presentation/shared/styles/_tokens.scss`). No third-party UI
 * library (e.g. Ionic's `ion-input`) is used for visual rendering, per
 * Requirements 12.3 and 12.5.
 *
 * Implements `ControlValueAccessor` so it can be used directly with Angular
 * reactive forms (`formControlName`) or `ngModel`.
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  /** Native input type. Controls masking (password) and semantics (search). */
  @Input() type: InputType = 'text';

  /** Placeholder text shown when the input is empty. */
  @Input() placeholder = '';

  /** Optional visible label rendered above the input. */
  @Input() label?: string;

  /** Disables the input and applies the disabled visual state. */
  @Input() disabled = false;

  /** Validation error message shown below the input when present. */
  @Input() errorMessage?: string;

  /**
   * Explicit validation state. Defaults to "default". When `errorMessage`
   * is provided and no explicit "error"/"success" state is set, the
   * component automatically renders the error state.
   */
  @Input() state: InputState = 'default';

  /** Minimum value for number inputs. */
  @Input() min?: number | string;

  /** Maximum value for number inputs. */
  @Input() max?: number | string;

  /** Unique id used to associate the `<label>` with the `<input>`. */
  readonly inputId = `app-input-${nextInputId++}`;

  /** Current value bound via `ControlValueAccessor`. */
  value = '';

  /** Toggles masked/plain text visibility for `type="password"`. */
  showPassword = false;

  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  /** Resolves the effective validation state, deriving "error" when needed. */
  get resolvedState(): InputState {
    if (this.state === 'default' && this.errorMessage) {
      return 'error';
    }
    return this.state;
  }

  /** Resolves the native `type` attribute, accounting for the show/hide toggle. */
  get nativeType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(rawValue: string): void {
    this.value = rawValue;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  // ---------------------------------------------------------------------------
  // ControlValueAccessor implementation
  // ---------------------------------------------------------------------------

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
    this.changeDetectorRef.markForCheck();
  }
}
