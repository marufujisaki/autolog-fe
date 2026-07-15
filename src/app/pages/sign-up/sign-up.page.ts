import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/ports/auth.port';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { SelectComponent } from '../../presentation/shared/components/select/select.component';
import { LoadingComponent } from '../../presentation/shared/components/loading/loading.component';
import { UserType } from '../../core/models/user.model';

/**
 * SignUpPage - User registration page.
 * Supports all three user types: USUARIO, CLIENTE, MECANICO
 * Requirement: 1.1, 1.3 (registration with role selection and mechanic fields)
 */
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    LoadingComponent,
  ],
})
export class SignUpPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  signUpForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  userTypeOptions = [
    { label: 'Usuario', value: 'USUARIO' },
    { label: 'Cliente', value: 'CLIENTE' },
    { label: 'Mecánico', value: 'MECANICO' },
  ];

  mechanicLevelOptions = [
    { label: 'Ayudante', value: 'AYUDANTE' },
    { label: 'Supervisor', value: 'SUPERVISOR' },
  ];

  workshopOptions = [
    { label: 'Taller 1', value: '1' },
    { label: 'Taller 2', value: '2' },
  ];

  isMechanico = false;

  ngOnInit(): void {
    this.initializeForm();
    this.setupUserTypeListener();
    this.loadUserTypeFromRoute();
  }

  private initializeForm(): void {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['USUARIO', [Validators.required]],
      mechanicLevel: ['AYUDANTE'],
      workshopId: [''],
    });
  }

  private setupUserTypeListener(): void {
    this.signUpForm.get('userType')?.valueChanges.subscribe((userType) => {
      this.isMechanico = userType === 'MECANICO';
      const mechanicLevelControl = this.signUpForm.get('mechanicLevel');
      const workshopIdControl = this.signUpForm.get('workshopId');

      if (this.isMechanico) {
        mechanicLevelControl?.setValidators([Validators.required]);
        workshopIdControl?.setValidators([Validators.required]);
      } else {
        mechanicLevelControl?.clearValidators();
        workshopIdControl?.clearValidators();
      }

      mechanicLevelControl?.updateValueAndValidity();
      workshopIdControl?.updateValueAndValidity();
    });
  }

  private loadUserTypeFromRoute(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['type']) {
        this.signUpForm.get('userType')?.setValue(params['type']);
      }
    });
  }

  onSubmit(): void {
    if (!this.signUpForm.valid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }

    if (this.passwordControl?.value !== this.confirmPasswordControl?.value) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.signUpForm.getRawValue();
    const registerData = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      password: formValue.password,
      userType: formValue.userType,
      ...(formValue.userType === 'MECANICO' && {
        mechanicLevel: formValue.mechanicLevel,
        workshopId: formValue.workshopId,
      }),
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate(['/tabs/tab1']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error?.error?.message?.includes('email')) {
          this.errorMessage =
            'Este correo electrónico ya está registrado. Por favor intenta con otro.';
        } else {
          this.errorMessage =
            error?.error?.message ||
            'Error al registrar. Por favor intenta de nuevo.';
        }
      },
    });
  }

  navigateToLogin(): void {
    void this.router.navigate(['/login']);
  }

  get emailControl() {
    return this.signUpForm.get('email') as FormControl<string>;
  }

  get firstNameControl() {
    return this.signUpForm.get('firstName') as FormControl<string>;
  }

  get lastNameControl() {
    return this.signUpForm.get('lastName') as FormControl<string>;
  }

  get passwordControl() {
    return this.signUpForm.get('password') as FormControl<string>;
  }

  get confirmPasswordControl() {
    return this.signUpForm.get('confirmPassword') as FormControl<string>;
  }

  get userTypeControl() {
    return this.signUpForm.get('userType') as FormControl<string>;
  }

  get mechanicLevelControl() {
    return this.signUpForm.get('mechanicLevel') as FormControl<string>;
  }

  get workshopIdControl() {
    return this.signUpForm.get('workshopId') as FormControl<string>;
  }
}
