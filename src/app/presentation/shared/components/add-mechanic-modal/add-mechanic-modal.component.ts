import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { ModalComponent } from '../modal/modal.component';

/** Mechanic data captured by the "Add a mechanic" sheet. */
export interface MechanicDraft {
  name: string;
  phone: string;
  description: string;
}

/**
 * "Add a mechanic" bottom sheet (Figma frame "Profile - Add mechanic").
 *
 * Presentation only: it collects the mechanic data and emits it, leaving
 * persistence and selection to the consuming page.
 */
@Component({
  selector: 'app-add-mechanic-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ModalComponent,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './add-mechanic-modal.component.html',
  styleUrls: ['./add-mechanic-modal.component.scss'],
})
export class AddMechanicModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly isOpen = input(false);
  readonly initialValue = input<MechanicDraft | null>(null);

  /** Emitted when the sheet is dismissed without submitting. */
  readonly closed = output<void>();

  /** Emitted with the captured mechanic data when the user confirms. */
  readonly submitted = output<MechanicDraft>();

  readonly form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(30)]],
    description: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    // Resetting a FormGroup is exactly the "sync a signal into a
    // non-signal system" case effect() is meant for.
    effect(() => {
      if (this.isOpen()) {
        const initial = this.initialValue() ?? {
          name: '',
          phone: '',
          description: '',
        };
        this.form.reset(initial);
      }
    });
  }

  get nameControl(): FormControl<string> {
    return this.form.get('name') as FormControl<string>;
  }

  get phoneControl(): FormControl<string> {
    return this.form.get('phone') as FormControl<string>;
  }

  get descriptionControl(): FormControl<string> {
    return this.form.get('description') as FormControl<string>;
  }

  onClose(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.submitted.emit({
      name: (raw.name ?? '').trim(),
      phone: (raw.phone ?? '').trim(),
      description: (raw.description ?? '').trim(),
    });
  }
}
