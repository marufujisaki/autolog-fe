import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../core/ports/vehicle.port';
import { VehicleDataRefreshService } from '../../core/services/vehicle-data-refresh.service';
import { CreateVehicleData } from '../../core/models/vehicle.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { VehicleFormComponent } from '../../presentation/shared/components/vehicle-form/vehicle-form.component';
import { SwipeToDismissDirective } from '../../presentation/shared/directives/swipe-to-dismiss.directive';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * AddVehiclePage — Add a new vehicle form with autocomplete for Make and Model.
 */
@Component({
  selector: 'app-add-vehicle',
  templateUrl: './add-vehicle.page.html',
  styleUrls: ['./add-vehicle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    VehicleFormComponent,
    SwipeToDismissDirective,
    TranslatePipe,
  ],
})
export class AddVehiclePage {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dataRefresh = inject(VehicleDataRefreshService);

  /** When true the page is rendered as an overlay and closing emits instead of navigating. */
  readonly presentedAsModal = input(false);
  readonly dismissed = output<void>();

  isLoading = false;

  form = this.fb.nonNullable.group({
    brand: ['', [Validators.required, Validators.maxLength(50)]],
    model: ['', [Validators.required, Validators.maxLength(50)]],
    year: ['', [Validators.required]],
    licensePlate: ['', [Validators.maxLength(10)]],
    color: ['', [Validators.maxLength(30)]],
    displayName: ['', [Validators.maxLength(50)]],
    cardColor: ['#3B82F6'],
  });

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
      cardColor: formValue.cardColor || '#3B82F6',
      ...(formValue.displayName && {
        displayName: formValue.displayName.trim(),
      }),
    };

    this.vehicleService.createVehicle(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.dataRefresh.notifyChanged();
        this.goBack();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    if (this.presentedAsModal()) {
      // TODO: The 'emit' function requires a mandatory void argument
      this.dismissed.emit();
      return;
    }

    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
    const destination =
      returnTo === '/tabs/profile' ? '/tabs/profile' : '/tabs/vehicles';
    void this.router.navigateByUrl(destination);
  }
}
