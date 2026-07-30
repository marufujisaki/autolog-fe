import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { PhotoService } from '../../core/ports/photo.port';
import { MaintenanceType, CreateJobData } from '../../core/models/job.model';
import { CreateLogData } from '../../core/models/maintenance-log.model';
import { validateLog, validateJob } from '../../core/utils/validators.util';
import { calculateTotalCost } from '../../core/utils/cost-calculator.util';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { ChipComponent } from '../../presentation/shared/components/chip/chip.component';
import { LoadingComponent } from '../../presentation/shared/components/loading/loading.component';

/**
 * LogCreatePage allows users and mechanics to create a new maintenance log
 * for a vehicle with one or more jobs, optional costs, date, and photo uploads
 * (Requirements 5.1, 5.2, 5.6, 5.9, 6.1, 6.4, 7.1).
 */
@Component({
  selector: 'app-log-create',
  templateUrl: './log-create.page.html',
  styleUrls: ['./log-create.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    ButtonComponent,
    InputComponent,
    ChipComponent,
    LoadingComponent,
  ],
})
export class LogCreatePage implements OnInit {
  private readonly logService = inject(MaintenanceLogService);
  private readonly photoService = inject(PhotoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  vehicleId: string = '';
  logForm!: FormGroup;
  jobs: CreateJobData[] = [];
  uploadedPhotos: File[] = [];
  previewUrls: string[] = [];

  maintenanceTypes = Object.values(MaintenanceType);
  isLoading = false;
  formErrors: Record<string, string> = {};
  jobErrors: Record<number, Record<string, string>> = {};

  ngOnInit() {
    this.vehicleId = this.route.snapshot.paramMap.get('vehicleId') || '';
    this.initializeForm();
  }

  private initializeForm() {
    this.logForm = this.fb.group({
      serviceDate: ['', Validators.required],
      mileageAtService: [
        '',
        [Validators.required, Validators.min(0), Validators.max(9999999)],
      ],
      totalCost: [''],
    });
  }

  /**
   * Add a new empty job to the form (Requirement 6.1, 6.4).
   */
  addJob() {
    this.jobs.push({
      title: '',
      description: '',
      cost: undefined,
      maintenanceTypes: [],
    });
    // Initialize error tracking for this job
    this.jobErrors[this.jobs.length - 1] = {};
  }

  /**
   * Remove a job from the form and reorder remaining jobs (Requirement 6.3).
   */
  removeJob(index: number) {
    this.jobs.splice(index, 1);
    // Rebuild error tracking indices
    this.jobErrors = {};
    this.jobs.forEach((_, i) => {
      this.jobErrors[i] = this.jobErrors[i] || {};
    });
  }

  /**
   * Update maintenance types for a specific job (multi-select).
   */
  updateJobTypes(index: number, types: MaintenanceType[]) {
    this.jobs[index].maintenanceTypes = types;
  }

  /**
   * Handle file selection for photo upload.
   */
  onPhotoSelect(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      // Validate file count (Requirement 7.3)
      if (this.uploadedPhotos.length + files.length > 10) {
        this.formErrors['photos'] = 'max_photos_exceeded';
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.uploadedPhotos.push(file);

        // Generate preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrls.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  /**
   * Remove a photo from the upload list.
   */
  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  /**
   * Submit the log creation form with validation (Requirements 5.1, 5.6, 5.9, 6.1, 6.4).
   */
  async submitLog() {
    // Reset errors
    this.formErrors = {};
    this.jobErrors = {};

    // Validate log form data
    const logData: CreateLogData = {
      serviceDate: this.logForm.get('serviceDate')?.value,
      mileageAtService: parseInt(
        this.logForm.get('mileageAtService')?.value,
        10,
      ),
      totalCost: this.logForm.get('totalCost')?.value
        ? parseInt(this.logForm.get('totalCost')?.value, 10)
        : undefined,
      jobs: this.jobs,
    };

    const logErrors = validateLog(logData);
    if (Object.keys(logErrors).length > 0) {
      this.formErrors = logErrors;
      return;
    }

    // Validate each job
    let jobsValid = true;
    this.jobs.forEach((job, index) => {
      const errors = validateJob(job);
      if (Object.keys(errors).length > 0) {
        this.jobErrors[index] = errors;
        jobsValid = false;
      }
    });

    if (!jobsValid) {
      return;
    }

    this.isLoading = true;
    try {
      // Create the log
      const createdLog = await this.logService
        .createLog(this.vehicleId, logData)
        .toPromise();

      if (!createdLog) {
        throw new Error('Log creation failed');
      }

      // Upload photos if provided (Requirement 7.1)
      if (this.uploadedPhotos.length > 0) {
        await this.photoService
          .uploadPhotos(createdLog.id, this.uploadedPhotos)
          .toPromise();
      }

      // Navigate to log detail or vehicle detail
      this.router.navigate(['/log', createdLog.id]);
    } catch (error: any) {
      console.error('Error creating log:', error);
      this.formErrors['general'] = 'creationFailed';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Calculate and display the current total cost (Requirement 5.2, 5.3).
   */
  get calculatedTotalCost(): number {
    return calculateTotalCost(this.jobs, this.logForm.get('totalCost')?.value);
  }

  /**
   * Navigate back to the vehicle detail page.
   */
  goBack() {
    this.router.navigate(['/vehicles', this.vehicleId]);
  }

  /**
   * Check if job has any validation errors.
   */
  hasJobErrors(index: number): boolean {
    return Object.keys(this.jobErrors[index] || {}).length > 0;
  }

  /**
   * Get error message for a specific field (for translation).
   */
  getErrorMessage(field: string, errorCode: string): string {
    return `error.${errorCode}`;
  }
}
