import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
  ],
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.nonNullable.group({
      fullName: this.fb.nonNullable.control('', {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: this.fb.nonNullable.control('', {
        validators: [Validators.required, Validators.email],
      }),
      phone: this.fb.nonNullable.control('', {
        validators: [
          Validators.required,
          Validators.pattern(/^[^A-Za-z]*$/),
        ],
      }),
      password: this.fb.nonNullable.control('', {
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: this.fb.nonNullable.control('', {
        validators: [Validators.required],
      }),
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onRegister() {
    if (this.registerForm.valid) {
      // Handle registration logic here
      console.log('Registration successful', this.registerForm.value);
    }
  }

  googleAuth() {
    // Handle Google authentication logic here
  }
}
