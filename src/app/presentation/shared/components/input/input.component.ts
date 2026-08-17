import { ChangeDetectorRef, Component, ElementRef, ViewChild, computed, forwardRef, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, EyeIcon, EyeOffIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
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
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('nativeInputEl') private readonly nativeInputEl?: ElementRef<HTMLInputElement>;

  /** Focuses the underlying native input — for callers that need to autofocus after a conditional render. */
  focus(): void {
    this.nativeInputEl?.nativeElement.focus();
  }

  /** Native input type. Controls masking (password) and semantics (search). */
  readonly type = input<InputType>('text');

  /** Placeholder text shown when the input is empty. */
  readonly placeholder = input('');

  /** Optional visible label rendered above the input. */
  readonly label = input<string>();

  /** Disables the input and applies the disabled visual state. */
  readonly disabled = input(false);

  /**
   * Reactive forms can also disable this control via `setDisabledState`
   * (ControlValueAccessor) — `input()` is read-only, so that path writes
   * here instead. `isDisabled` combines both sources.
   */
  private readonly disabledByForm = signal<boolean | null>(null);
  readonly isDisabled = computed(() => this.disabledByForm() ?? this.disabled());

  /** Validation error message shown below the input when present. */
  readonly errorMessage = input<string>();

  /**
   * Explicit validation state. Defaults to "default". When `errorMessage`
   * is provided and no explicit "error"/"success" state is set, the
   * component automatically renders the error state.
   */
  readonly state = input<InputState>('default');

  /** Minimum value for number inputs. */
  readonly min = input<number | string>();

  /** Maximum value for number inputs. */
  readonly max = input<number | string>();

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

  /** Resolves the effective validation state, deriving "error" when needed. */
  get resolvedState(): InputState {
    const state = this.state();
    if (state === 'default' && this.errorMessage()) {
      return 'error';
    }
    return state;
  }

  /** Resolves the native `type` attribute, accounting for the show/hide toggle. */
  get nativeType(): string {
    const type = this.type();
    if (type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return type;
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
    this.disabledByForm.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }
}
