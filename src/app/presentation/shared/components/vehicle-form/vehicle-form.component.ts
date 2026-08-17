import { Component, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { VehicleCatalogService } from '../../../../core/ports/vehicle-catalog.port';
import { InputComponent } from '../input/input.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';

/** Field set shared by the Add Vehicle and Edit Vehicle forms. */
export interface VehicleFormControls {
  brand: FormControl<string>;
  model: FormControl<string>;
  year: FormControl<string>;
  licensePlate: FormControl<string>;
  color: FormControl<string>;
  displayName: FormControl<string>;
  cardColor: FormControl<string>;
}

export type VehicleFormGroup = FormGroup<VehicleFormControls>;

export type VehicleFormFieldName = keyof VehicleFormControls;

export interface VehicleFormPlaceholders {
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  displayName: string;
}

export const DEFAULT_VEHICLE_CARD_COLOR_OPTIONS = [
  '#3B82F6',
  '#EC4899',
  '#22C55E',
  '#F97316',
  '#A855F7',
];

/** Matches Add Vehicle's original example-style placeholders. */
const DEFAULT_PLACEHOLDERS: VehicleFormPlaceholders = {
  brand: 'Chevrolet',
  model: 'Aveo',
  year: '2022',
  licensePlate: 'AA453YR',
  color: 'Blue',
  displayName: 'Chile Van 2',
};

/**
 * VehicleFormComponent — brand/model/year/plate/color/displayName/card-color
 * fields shared by `AddVehiclePage` and `DashboardPage`'s edit-vehicle modal.
 *
 * Receives the parent's `FormGroup` and binds directly to its individual
 * `FormControl`s (same pattern the pages already used) rather than wrapping
 * its own `<form>` — the parent keeps owning `<form [formGroup]>`/`ngSubmit`
 * and the submit button, which differ (label, disabled logic) between callers.
 */
@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, AutocompleteComponent, TranslatePipe],
})
export class VehicleFormComponent {
  private readonly catalogService = inject(VehicleCatalogService);

  readonly formGroup = input.required<VehicleFormGroup>();

  /** Add Vehicle relies on the disabled submit button instead; Edit Vehicle shows inline messages. */
  readonly showFieldErrors = input(false);

  readonly cardColorOptions = input<string[]>(DEFAULT_VEHICLE_CARD_COLOR_OPTIONS);

  readonly placeholders = input<VehicleFormPlaceholders>(DEFAULT_PLACEHOLDERS);

  get brandControl(): FormControl<string> {
    return this.formGroup().controls.brand;
  }

  get modelControl(): FormControl<string> {
    return this.formGroup().controls.model;
  }

  get yearControl(): FormControl<string> {
    return this.formGroup().controls.year;
  }

  get plateControl(): FormControl<string> {
    return this.formGroup().controls.licensePlate;
  }

  get colorControl(): FormControl<string> {
    return this.formGroup().controls.color;
  }

  get displayNameControl(): FormControl<string> {
    return this.formGroup().controls.displayName;
  }

  /** Search function passed to the Make autocomplete. */
  searchMakes = (query: string): Observable<string[]> => {
    return this.catalogService
      .searchMakes(query)
      .pipe(map((makes) => makes.map((m) => m.name)));
  };

  /** Search function passed to the Model autocomplete (depends on the selected make). */
  searchModels = (query: string): Observable<string[]> => {
    const makeName = this.brandControl.value || '';
    if (!makeName) {
      return new Observable<string[]>((subscriber) => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
    return this.catalogService
      .searchModels(makeName, query)
      .pipe(map((models) => models.map((m) => m.name)));
  };

  onMakeSelected(): void {
    this.modelControl.setValue('');
  }

  selectCardColor(color: string): void {
    this.formGroup().controls.cardColor.setValue(color);
  }

  isCardColorSelected(color: string): boolean {
    return this.formGroup().controls.cardColor.value === color;
  }

  hasFieldError(fieldName: VehicleFormFieldName): boolean {
    const control = this.formGroup().get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: VehicleFormFieldName): string {
    const control = this.formGroup().get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'validation.required';
    if (control.errors['maxlength']) return 'errors.maxLength';
    if (control.errors['min']) return 'errors.minValue';
    if (control.errors['max']) return 'errors.maxValue';

    return 'errors.invalidField';
  }
}
