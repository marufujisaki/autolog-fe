import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
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

  @Input() set isOpen(value: boolean) {
    this.open = value;
    if (value) {
      const initial = this.initialValue ?? {
        name: '',
        phone: '',
        description: '',
      };
      this.form.reset(initial);
    }
  }

  @Input() initialValue: MechanicDraft | null = null;

  /** Emitted when the sheet is dismissed without submitting. */
  @Output() closed = new EventEmitter<void>();

  /** Emitted with the captured mechanic data when the user confirms. */
  @Output() submitted = new EventEmitter<MechanicDraft>();

  open = false;

  readonly form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(30)]],
    description: ['', [Validators.maxLength(255)]],
  });

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
