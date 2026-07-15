import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../core/ports/vehicle.port';
import { CreateVehicleData } from '../../core/models/vehicle.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';

/**
 * AddVehiclePage — Add a new vehicle form (Figma: "Add vehicle - Clients & Personal").
 * Form fields: Make, Model, Year, Plate, Color, Display Name
 */
@Component({
  selector: 'app-add-vehicle',
  templateUrl: './add-vehicle.page.html',
  styleUrls: ['./add-vehicle.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
})
export class AddVehiclePage {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private router = inject(Router);

  isLoading = false;

  form = this.fb.group({
    brand: ['', [Validators.required, Validators.maxLength(50)]],
    model: ['', [Validators.required, Validators.maxLength(50)]],
    year: ['', [Validators.required]],
    licensePlate: ['', [Validators.maxLength(10)]],
    color: ['', [Validators.maxLength(30)]],
    displayName: ['', [Validators.maxLength(50)]],
  });

  get brandControl(): FormControl<string> {
    return this.form.get('brand') as FormControl<string>;
  }

  get modelControl(): FormControl<string> {
    return this.form.get('model') as FormControl<string>;
  }

  get yearControl(): FormControl<string> {
    return this.form.get('year') as FormControl<string>;
  }

  get plateControl(): FormControl<string> {
    return this.form.get('licensePlate') as FormControl<string>;
  }

  get colorControl(): FormControl<string> {
    return this.form.get('color') as FormControl<string>;
  }

  get displayNameControl(): FormControl<string> {
    return this.form.get('displayName') as FormControl<string>;
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.isLoading = true;
    const formValue = this.form.getRawValue();

    const data: CreateVehicleData = {
      brand: (formValue.brand || '').trim(),
      model: (formValue.model || '').trim(),
      year: parseInt(formValue.year || '0', 10),
      ...(formValue.licensePlate && {
        licensePlate: formValue.licensePlate.trim(),
      }),
      ...(formValue.color && { color: formValue.color.trim() }),
    };

    this.vehicleService.createVehicle(data).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate(['/tabs/vehicles']);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
